-- === 使用者與角色 ===
INSERT INTO users (id, username, password, email, is_active, created_at)
VALUES
  (1, 'boss',   '123',   'boss@example.com',   TRUE, NOW()),
  (2, 'worker', '{bcrypt}worker-password-hash', 'worker@example.com', TRUE, NOW()),
  (3, 'store',  '{bcrypt}store-password-hash',  'store@example.com',  TRUE, NOW());

INSERT INTO roles (id, name, description)
VALUES
  (1, 'ROLE_BOSS',   '老闆 / 負責人'),
  (2, 'ROLE_WORKER', '師傅'),
  (3, 'ROLE_STORE',  '倉管');

INSERT INTO user_roles (user_id, role_id)
VALUES
  (1, 1), -- boss -> ROLE_BOSS
  (2, 2), -- worker -> ROLE_WORKER
  (3, 3); -- store -> ROLE_STORE

-- === 料件 master ===
INSERT INTO materials (id, name, unit, description, default_price, is_active, created_at)
VALUES
  (1, '永新集層 角材 80*12*10#F1(綠建材)', '支',
   '常用角材，綠建材等級', 50.00, TRUE, NOW()),
  (2, '永新集層 角材 80*18*10#F1(綠建材)', '支',
   '較厚角材，綠建材等級', 75.00, TRUE, NOW()),
  (3, '木心板2*8 中興', '片',
   '常用木心板 2x8 尺寸', 335.00, TRUE, NOW()),
  (4, '台灣日通 9mm 3*6', '片',
   '9mm 厚 3x6 板材', 420.00, TRUE, NOW()),
  (5, '儷士 矽酸鈣 6mm 3*6(日本)', '片',
   '矽酸鈣板 6mm 日本製', 385.00, TRUE, NOW());

-- === 倉庫庫存（假設部分材料已在倉庫） ===
INSERT INTO warehouse_inventory (id, material_id, quantity, location, updated_at)
VALUES
  (1, 1, 100, 'A1-01', NOW()),
  (2, 2,  50, 'A1-02', NOW()),
  (3, 3,  30, 'B1-01', NOW()),
  (4, 4,  20, 'B1-02', NOW()),
  (5, 5,  40, 'B2-01', NOW());

-- === 案件主檔 ===
INSERT INTO cases (id, case_code, client_name, client_phone, site_address,
                   status, sales_user_id, estimated_days, created_at, updated_at)
VALUES
  (1, 'IP-202604-001', '陳先生', '0912-000-001',
   '中壢區領航南路一段 3266 號 13 樓',
   '進行中', 1, 20, NOW(), NOW()),
  (2, 'IP-202604-002', '王小姐', '0912-000-002',
   '桃園區某某路 100 號 5 樓',
   '詢問', 1, 10, NOW(), NOW());

-- === 案件用料（預估 / 鎖定） ===
INSERT INTO case_materials (id, case_id, material_id,
                            planned_quantity, locked_quantity, actual_quantity,
                            unit_price, line_cost)
VALUES
  -- 案件 1：已確認，鎖定部分角材與板材，實際用量尚未填
  (1, 1, 1, 80, 60, 0, 50.00, NULL),   -- 角材 80*12
  (2, 1, 3, 10,  8, 0, 335.00, NULL),  -- 木心板2*8
  (3, 1, 5, 20, 15, 0, 385.00, NULL);  -- 矽酸鈣板

-- === 建材商對帳單（假設就是你 PDF 上其中一張出貨單） ===
INSERT INTO supplier_invoices (id, supplier_name, invoice_number, invoice_date, total_amount, created_at)
VALUES
  (1, '某某建材行', '115020185', DATE '2026-02-09', 36435.00, NOW());

-- === 建材商對帳單明細（節錄幾項） ===
INSERT INTO supplier_invoice_items
  (id, supplier_invoice_id, material_id, description,
   shipped_quantity, billed_quantity, unit_price,
   line_amount, is_return)
VALUES
  -- 永新集層 角材 80*12*10#F1(綠建材) 160支 50 8,000
  (1, 1, 1,
   '永新集層 角材 80*12*10#F1(綠建材)',
   160, 160, 50.00,
   8000.00, FALSE),

  -- 永新集層 角材 80*18*10#F1(綠建材) 35支 75 2,625
  (2, 1, 2,
   '永新集層 角材 80*18*10#F1(綠建材)',
   35, 35, 75.00,
   2625.00, FALSE),

  -- 木心板2*8 中興 6片 335 2,010
  (3, 1, 3,
   '木心板2*8 中興',
   6, 6, 335.00,
   2010.00, FALSE),

  -- 台灣日通 9mm 3*6 20片 420 8,400
  (4, 1, 4,
   '台灣日通 9mm 3*6',
   20, 20, 420.00,
   8400.00, FALSE),

  -- 儷士 矽酸鈣 6mm 3*6(日本) 40片 385 15,400
  (5, 1, 5,
   '儷士 矽酸鈣 6mm 3*6(日本)',
   40, 40, 385.00,
   15400.00, FALSE);