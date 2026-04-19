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
   status         VARCHAR(30)  NOT NULL,
   sales_user_id  BIGINT       NOT NULL,
   estimated_days INTEGER,
   created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
   updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
   CONSTRAINT fk_cases_sales_user
      FOREIGN KEY (sales_user_id) REFERENCES users (id)
);

CREATE INDEX idx_cases_status ON projects (status);

-- === 料件 master ===
CREATE TABLE materials (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
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
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    note        TEXT,
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
    planned_quantity INTEGER      NOT NULL DEFAULT 0,
    locked_quantity  INTEGER      NOT NULL DEFAULT 0,
    actual_quantity  INTEGER      NOT NULL DEFAULT 0,
    unit_price       NUMERIC(10,2),
    line_cost        NUMERIC(10,2),
    CONSTRAINT fk_case_materials_case
        FOREIGN KEY (case_id)    REFERENCES projects (id),
    CONSTRAINT fk_case_materials_material
        FOREIGN KEY (material_id) REFERENCES materials (id)
);

CREATE INDEX idx_case_materials_case ON case_materials (case_id);
CREATE INDEX idx_case_materials_material ON case_materials (material_id);

-- === 建材商對帳單 header ===
CREATE TABLE supplier_invoices (
    id             BIGSERIAL PRIMARY KEY,
    supplier_name  VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(50)  NOT NULL,
    invoice_date   DATE         NOT NULL,
    total_amount   NUMERIC(10,2),
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uidx_supplier_invoice
    ON supplier_invoices (supplier_name, invoice_number);

-- === 建材商對帳單明細 ===
CREATE TABLE supplier_invoice_items (
    id                  BIGSERIAL PRIMARY KEY,
    supplier_invoice_id BIGINT       NOT NULL,
    material_id         BIGINT,
    description         VARCHAR(255) NOT NULL,
    shipped_quantity    INTEGER      NOT NULL,
    billed_quantity     INTEGER,
    unit_price          NUMERIC(10,2) NOT NULL,
    line_amount         NUMERIC(10,2),
    is_return           BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_items_invoice
        FOREIGN KEY (supplier_invoice_id) REFERENCES supplier_invoices (id),
    CONSTRAINT fk_items_material
        FOREIGN KEY (material_id) REFERENCES materials (id)
);

CREATE INDEX idx_supplier_items_invoice
    ON supplier_invoice_items (supplier_invoice_id);
CREATE INDEX idx_supplier_items_material
    ON supplier_invoice_items (material_id);