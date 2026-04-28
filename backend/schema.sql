DROP TABLE IF EXISTS estimation_worker_items;
DROP TABLE IF EXISTS estimation_items;
DROP TABLE IF EXISTS project_estimations;
DROP TABLE IF EXISTS worker_bonus_items;
DROP TABLE IF EXISTS worker_bonus_periods;
DROP TABLE IF EXISTS case_workers;
DROP TABLE IF EXISTS worker_salary_items;
DROP TABLE IF EXISTS workers;
DROP TABLE IF EXISTS worker_salary_periods;
DROP TABLE IF EXISTS supplier_invoice_items;
DROP TABLE IF EXISTS supplier_invoices;
DROP TABLE IF EXISTS case_materials;
DROP TABLE IF EXISTS warehouse_inventory;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS customer_inquiry;

-- === 客戶詢問單 ===
CREATE TABLE customer_inquiry (
    id               BIGSERIAL PRIMARY KEY,
    line_user_id     VARCHAR(255) NOT NULL,
    line_user_name   VARCHAR(100),
    message          TEXT NOT NULL,
    status           VARCHAR(30) NOT NULL,
    name             VARCHAR(100),
    phone            VARCHAR(30),
    address          VARCHAR(255),
    work_content     TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- === 使用者與角色 ===
CREATE TABLE users(
	id				BIGSERIAL PRIMARY KEY,
	username		VARCHAR(50)	NOT NULL UNIQUE,
	password		VARCHAR(50)	NOT NULL,
	email			VARCHAR(100),
	is_active	BOOLEAN	NOT NULL	DEFAULT	TRUE,
	created_at	TIMESTAMP	NOT NULL	DEFAULT	NOW()
);

CREATE TABLE roles(
	id				BIGSERIAL	PRIMARY KEY,
	name			VARCHAR(50)	NOT NULL	UNIQUE,
	description	VARCHAR(255)
);

CREATE TABLE user_roles (
   user_id BIGINT NOT NULL,
   role_id BIGINT NOT NULL,
   PRIMARY KEY (user_id, role_id),
   CONSTRAINT fk_user_roles_user
      FOREIGN KEY (user_id) REFERENCES users (id),
   CONSTRAINT fk_user_roles_role
      FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- === 案件主檔 ===
CREATE TABLE projects (
   id             BIGSERIAL PRIMARY KEY,
   project_code      VARCHAR(30)  NOT NULL UNIQUE,
   client_name    VARCHAR(100) NOT NULL,
   client_phone   VARCHAR(30),
   city				VARCHAR(30)	 NOT NULL,
   district			VARCHAR(30),
   site_address   VARCHAR(255) NOT NULL,
   description    TEXT,
   status         VARCHAR(30)  NOT NULL,
   sales_user_id  BIGINT       NOT NULL,
   order_batch		INTEGER NOT NULL DEFAULT 1,
   estimated_days INTEGER,
   contract_amount	NUMERIC(10,2),
   received_amount NUMERIC(10,2) DEFAULT 0,
	payment_status  VARCHAR(20)   DEFAULT 'PENDING',
   created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
   updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
   CONSTRAINT fk_cases_sales_user
      FOREIGN KEY (sales_user_id) REFERENCES users (id)
);

CREATE INDEX idx_cases_status ON projects (status);

-- === 料件 master ===
CREATE TABLE materials (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    unit          VARCHAR(20)  NOT NULL,
    description   TEXT,
    default_price NUMERIC(10,2),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- === 倉庫庫存 ===
CREATE TABLE warehouse_inventory (
    id          BIGSERIAL PRIMARY KEY,
    material_id BIGINT    NOT NULL,
    quantity    INTEGER   NOT NULL DEFAULT 0,
    location    VARCHAR(50),
    status      VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    remarks     VARCHAR(255),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_inventory_material
        FOREIGN KEY (material_id) REFERENCES materials (id)
);

CREATE INDEX idx_inventory_material ON warehouse_inventory (material_id);

-- === 案件用料（鎖定 + 實際用量） ===
CREATE TABLE case_materials (
    id               BIGSERIAL PRIMARY KEY,
    case_id          BIGINT       NOT NULL,
    material_id      BIGINT       NOT NULL,
    quantity 			INTEGER      NOT NULL DEFAULT 0,
    material_type		VARCHAR(20)    NOT NULL DEFAULT 'PURCHASE',
    unit_price       NUMERIC(10,2),
    line_cost        NUMERIC(10,2),
    created_at			TIMESTAMP	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
    order_batch		INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT fk_case_materials_case
        FOREIGN KEY (case_id)    REFERENCES projects (id),
    CONSTRAINT fk_case_materials_material
        FOREIGN KEY (material_id) REFERENCES materials (id)
);

CREATE INDEX idx_case_materials_case ON case_materials (case_id);
CREATE INDEX idx_case_materials_material ON case_materials (material_id);

-- =============================================
-- 建材商收款對帳單 header
-- =============================================
CREATE TABLE supplier_invoices (
    id                  BIGSERIAL       PRIMARY KEY,
    project_id          BIGINT          NOT NULL,
    pdf_path            VARCHAR(255),
    delivery_address    VARCHAR(255),               -- 送貨地點（核對案件地址）
    receivable_amount   NUMERIC(10,2),              -- 應收總額
    cash_discount       NUMERIC(10,2),              -- 現金扣款4%
    net_payable         NUMERIC(10,2),              -- 付現應收
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_supplier_invoices_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_supplier_invoices_project
    ON supplier_invoices(project_id);


-- =============================================
-- 建材商對帳單明細
-- =============================================
CREATE TABLE supplier_invoice_items (
    id                      BIGSERIAL       PRIMARY KEY,
    supplier_invoice_id     BIGINT          NOT NULL,
    batch_no                INTEGER         NOT NULL, -- 批次資訊
    -- 1 = 第一批進貨, 2 = 第二批...
    -- 0 = 退貨（"以下退回收退料" 之後的行）
    delivery_date           DATE,                   -- 出貨日期（民國年轉西元）

    -- 材料資訊
    material_id             BIGINT,                 -- FK → materials(id)，nullable（OCR 比對不到時為 null）
    material_name_raw       VARCHAR(150)    NOT NULL, -- PDF 原始材料名稱（保留備查）
    unit                    VARCHAR(20)     NOT NULL,
    quantity                NUMERIC(10,2)   NOT NULL, -- 計價數量（退貨為負值）
    unit_price              NUMERIC(10,2),            -- 單價（nullable）
    total_price             NUMERIC(10,2),            -- 金額（退貨為負值）

    -- 比對狀態
   match_status    VARCHAR(30)     NOT NULL,
	-- OK                → 核對成功
	-- NOT_FOUND_IN_SYS  → PDF有但系統無此材料
	-- NOT_FOUND_IN_PDF  → PDF沒有但系統有此材料
	-- QTY_MISMATCH      → 數量不對
	-- PRICE_MISMATCH    → 單價不對）

    CONSTRAINT fk_invoice_items_invoice
        FOREIGN KEY (supplier_invoice_id)
            REFERENCES supplier_invoices(id) ON DELETE CASCADE,

    CONSTRAINT fk_invoice_items_material
        FOREIGN KEY (material_id)
            REFERENCES materials(id) ON DELETE SET NULL
);

CREATE INDEX idx_invoice_items_invoice
    ON supplier_invoice_items(supplier_invoice_id);

CREATE INDEX idx_invoice_items_batch
    ON supplier_invoice_items(supplier_invoice_id, batch_no);

CREATE INDEX idx_invoice_items_material
    ON supplier_invoice_items(material_id);

-- === 師傅名單 ===
CREATE TABLE workers (
    id          BIGSERIAL PRIMARY KEY,
    nickname    VARCHAR(50) NOT NULL,
    daily_wage  INTEGER NOT NULL,
    wage_type   VARCHAR(20)  NOT NULL DEFAULT 'DAILY',
    share_rate  NUMERIC(5,4)
);

CREATE TABLE case_workers (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    worker_id       BIGINT REFERENCES workers(id) ON DELETE CASCADE,
    daily_wage      NUMERIC(10,2) NOT NULL DEFAULT 0,
    workday         DATE NOT NULL,
    meal_allowance  NUMERIC(10,2) NOT NULL DEFAULT 150,
    travel_expenses NUMERIC(10,2) NOT NULL DEFAULT 0,
    days_worked     NUMERIC(3,1)  NOT NULL DEFAULT 1.0,
    CONSTRAINT chk_days_worked_positive CHECK (days_worked > 0)
);

CREATE TABLE worker_salary_periods (
    id           BIGSERIAL    PRIMARY KEY,
    period_start DATE         NOT NULL,
    period_end   DATE         NOT NULL,
    label        VARCHAR(50)  NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_salary_period UNIQUE (period_start, period_end)
);

CREATE TABLE worker_salary_items (
    id              BIGSERIAL     PRIMARY KEY,
    period_id       BIGINT        REFERENCES worker_salary_periods(id),  -- 分潤可 NULL
    worker_id       BIGINT        NOT NULL REFERENCES workers(id),
    project_id      BIGINT        REFERENCES projects(id),
    wage_type       VARCHAR(20)   NOT NULL,
    base_amount     NUMERIC(10,2) NOT NULL,
    travel_expenses NUMERIC(10,2) NOT NULL DEFAULT 0,
    meal_allowance  NUMERIC(10,2) NOT NULL DEFAULT 0,
    adjustment      NUMERIC(10,2) NOT NULL DEFAULT 0,
    final_amount    NUMERIC(10,2) NOT NULL,
    is_paid         BOOLEAN       NOT NULL DEFAULT FALSE,
    paid_at         TIMESTAMP,
    note            TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_project_share
  ON worker_salary_items (project_id, worker_id, wage_type)
  WHERE wage_type = 'PROJECT_SHARE';
CREATE INDEX idx_salary_items_period ON worker_salary_items(period_id);
CREATE INDEX idx_salary_items_worker ON worker_salary_items(worker_id);

-- === 案件估價主檔 ===
CREATE TABLE project_estimations (
    id             BIGSERIAL PRIMARY KEY,
    project_id     BIGINT NOT NULL UNIQUE,
    labor_cost     INTEGER NOT NULL,
    profit         INTEGER NOT NULL,
    total_amount   INTEGER NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_estimation_project
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- === 估價材料明細 ===
CREATE TABLE estimation_items (
    id             BIGSERIAL PRIMARY KEY,
    estimation_id  BIGINT NOT NULL,
    material_name  VARCHAR(100) NOT NULL,
    quantity       INTEGER NOT NULL,
    unit_price     INTEGER NOT NULL,
    subtotal       INTEGER NOT NULL,
    CONSTRAINT fk_estimation_item
        FOREIGN KEY (estimation_id) REFERENCES project_estimations (id) ON DELETE CASCADE
);

-- === 估價師傅明細 ===
CREATE TABLE estimation_worker_items (
    id             BIGSERIAL PRIMARY KEY,
    estimation_id  BIGINT NOT NULL,
    worker_id      BIGINT NOT NULL,
    days           NUMERIC(5,2) NOT NULL,
    subtotal       INTEGER NOT NULL,
    CONSTRAINT fk_estimation_worker
        FOREIGN KEY (estimation_id) REFERENCES project_estimations (id) ON DELETE CASCADE,
    CONSTRAINT fk_worker_item_worker
        FOREIGN KEY (worker_id) REFERENCES workers (id)
);

-- 師傅節慶獎金發放週期 (Header)
-- =============================================
CREATE TABLE worker_bonus_periods (
    id             BIGSERIAL     PRIMARY KEY,
    period_start   DATE          NOT NULL,       -- 計算區間：起始日
    period_end     DATE          NOT NULL,       -- 計算區間：結束日
    label          VARCHAR(50)   NOT NULL,       -- 標籤，例如 "2026 端午節獎金"
    daily_rate     NUMERIC(10,2) NOT NULL DEFAULT 100.00, -- 該次發放的基數 (1天=100)
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =============================================
-- 師傅節慶獎金發放明細 (Item)
-- =============================================
CREATE TABLE worker_bonus_items (
    id                BIGSERIAL     PRIMARY KEY,
    period_id         BIGINT        NOT NULL,
    worker_id         BIGINT        NOT NULL,
    total_days        NUMERIC(10,1) NOT NULL,    -- 出勤總天數 (必須為 NUMERIC 支援 0.5 天)
    calculated_amount NUMERIC(10,2) NOT NULL,    -- 系統試算金額 (total_days * daily_rate)
    actual_amount     NUMERIC(10,2) NOT NULL,    -- 老闆實際核發金額 (允許手動微調)
    created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_bonus_items_period
        FOREIGN KEY (period_id) REFERENCES worker_bonus_periods (id) ON DELETE CASCADE,
    CONSTRAINT fk_bonus_items_worker
        FOREIGN KEY (worker_id) REFERENCES workers (id)
);

CREATE INDEX idx_bonus_items_period ON worker_bonus_items(period_id);
CREATE INDEX idx_bonus_items_worker ON worker_bonus_items(worker_id);