
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
INSERT INTO warehouse_inventory (id, material_id, quantity, location, status, remarks, updated_at)
VALUES
  (1, 1, 100, 'A1-01', 'AVAILABLE', NULL, NOW()),
  (2, 2,  50, 'A1-02', 'AVAILABLE', '剩餘最後 50 支', NOW()),
  (3, 3,  30, 'B1-01', 'IN_STORAGE', '剛進貨，尚未拆封', NOW()),
  (4, 4,  20, 'B1-02', 'AVAILABLE', '包裝略破', NOW()),
  (5, 5,  40, 'B2-01', 'IN_USE', '已被案子 IP-202604-001 預訂', NOW());

-- === 案件主檔 ===
INSERT INTO projects (project_code, client_name, client_phone, city, district, site_address, description,
                   status, sales_user_id, estimated_days, created_at, updated_at)
VALUES
  ('IP-202604-001', '陳先生', '0912-000-001', '桃園市', '中壢區',
   '領航南路一段 3266 號 13 樓',
   '客廳與主臥裝潢需求', 'IN_PROGRESS', 1, 20, NOW(), NOW()),
  ('IP-202604-002', '王小姐', '0912-000-002', '新竹市', '東區',
   '某某路 100 號 5 樓',
   '浴室翻新預約', 'INQUIRY', 1, 10, NOW(), NOW()),
   ('IP-202604-003', '林先生', '0912-000-003', '台北市', '大安區',
   '和平東路二段 120 號 8 樓',
   '老屋翻新，需要重新規劃管線', 'QUOTING', 1, 14, NOW(), NOW()),
  ('IP-202604-004', '張小姐', '0912-000-004', '新北市', '板橋區',
   '文化路一段 220 號 6 樓',
   '系統櫃客製化', 'CONFIRMED', 1, 18, NOW(), NOW()),
  ('IP-202604-005', '黃先生', '0912-000-005', '桃園市', '桃園區',
   '中山路 88 號 12 樓',
   '客廳與主臥裝潢需求', 'IN_PROGRESS', 1, 25, NOW(), NOW()),
  ('IP-202604-006', '李小姐', '0912-000-006', '新竹縣', '竹北市',
   '光明六路東一段 300 號 9 樓',
   '浴室翻新預約', 'INQUIRY', 1, 12, NOW(), NOW()),
  ('IP-202604-007', '吳先生', '0912-000-007', '新竹市', '北區',
   '經國路二段 150 號 4 樓',
   '全室木地板鋪設', 'INSPECTION', 1, 16, NOW(), NOW()),
  ('IP-202604-008', '劉小姐', '0912-000-008', '台中市', '西屯區',
   '台灣大道三段 500 號 10 樓',
   '廚房裝修', 'CLOSED', 1, 30, NOW(), NOW()),
  ('IP-202604-009', '蔡先生', '0912-000-009', '台中市', '北屯區',
   '崇德路二段 260 號 7 樓',
   '客廳與主臥裝潢需求', 'IN_PROGRESS', 1, 22, NOW(), NOW()),
  ('IP-202604-010', '陳小姐', '0912-000-010', '彰化縣', '彰化市',
   '中正路一段 99 號 3 樓',
   '老屋翻新，需要重新規劃管線', 'QUOTING', 1, 11, NOW(), NOW()),
  ('IP-202604-011', '楊先生', '0912-000-011', '台南市', '東區',
   '東門路三段 188 號 5 樓',
   '系統櫃客製化', 'CONFIRMED', 1, 19, NOW(), NOW()),
  ('IP-202604-012', '許小姐', '0912-000-012', '高雄市', '左營區',
   '博愛二路 320 號 11 樓',
   '浴室翻新預約', 'INQUIRY', 1, 13, NOW(), NOW()),
  ('IP-202604-013', '鄭先生', '0912-000-013', '高雄市', '三民區',
   '民族一路 410 號 2 樓',
   '客廳與主臥裝潢需求', 'IN_PROGRESS', 1, 28, NOW(), NOW()),
  ('IP-202604-014', '謝小姐', '0912-000-014', '桃園市', '中壢區',
   '環中東路二段 600 號 6 樓',
   '全室木地板鋪設', 'INSPECTION', 1, 17, NOW(), NOW()),
  ('IP-202604-015', '郭先生', '0912-000-015', '新北市', '新莊區',
   '中正路 700 號 14 樓',
   '廚房裝修', 'CLOSED', 1, 24, NOW(), NOW()),
  ('IP-202604-016', '何小姐', '0912-000-016', '台北市', '信義區',
   '松仁路 100 號 20 樓',
   '老屋翻新，需要重新規劃管線', 'QUOTING', 1, 9, NOW(), NOW()),
  ('IP-202604-017', '高先生', '0912-000-017', '新竹縣', '湖口鄉',
   '中山路三段 45 號 1 樓',
   '浴室翻新預約', 'INQUIRY', 1, 15, NOW(), NOW()),
  ('IP-202604-018', '蘇小姐', '0912-000-018', '苗栗縣', '竹南鎮',
   '科專七路 80 號 8 樓',
   '系統櫃客製化', 'CONFIRMED', 1, 21, NOW(), NOW()),
  ('IP-202604-019', '盧先生', '0912-000-019', '台中市', '南屯區',
   '文心南路 520 號 13 樓',
   '客廳與主臥裝潢需求', 'IN_PROGRESS', 1, 26, NOW(), NOW()),
  ('IP-202604-020', '宋小姐', '0912-000-020', '嘉義市', '西區',
   '中興路 210 號 4 樓',
   '老屋翻新，需要重新規劃管線', 'QUOTING', 1, 10, NOW(), NOW()),
  ('IP-202604-021', '曾先生', '0912-000-021', '台南市', '永康區',
   '中華路 350 號 9 樓',
   '客廳與主臥裝潢需求', 'IN_PROGRESS', 1, 23, NOW(), NOW()),
  ('IP-202604-022', '潘小姐', '0912-000-022', '高雄市', '鳳山區',
   '青年路二段 270 號 7 樓',
   '浴室翻新預約', 'INQUIRY', 1, 8, NOW(), NOW());

-- === 案件用料（預估 / 鎖定） ===
INSERT INTO case_materials (id, case_id, material_id,
                            planned_quantity, locked_quantity, actual_quantity,
                            unit_price, line_cost)
VALUES
  -- 案件 1：已確認，鎖定部分角材與板材，實際用量尚未填
  (1, 1, 1, 80, 60, 0, 50.00, NULL),   -- 角材 80*12
  (2, 1, 3, 10,  8, 0, 335.00, NULL),  -- 木心板2*8
  (3, 1, 5, 20, 15, 0, 385.00, NULL);  -- 矽酸鈣板

-- === 案件用料（鎖定 + 實際用量） ===
INSERT INTO case_materials (id, case_id, material_id, planned_quantity, locked_quantity, actual_quantity, unit_price, line_cost)
VALUES
  (1, 1, 1, 80, 0, 0, 50.00, 4000.00),   -- 案子1 需要 80支 角材 80*12
  (2, 1, 3, 10, 0, 0, 335.00, 3350.00),  -- 案子1 需要 10片 木心板
  (3, 2, 5, 20, 0, 0, 385.00, 7700.00);  -- 案子2 需要 20片 矽酸鈣板

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

-- === 預設師傅名單 ===
INSERT INTO workers (nickname, daily_wage) VALUES ('阿信師', 3000);
INSERT INTO workers (nickname, daily_wage) VALUES ('木工老張', 3500);
INSERT INTO workers (nickname, daily_wage) VALUES ('水電阿吉', 2800);

-- === 測試用案件估價單 ===
INSERT INTO project_estimations (project_id, labor_cost, profit, total_amount)
SELECT p.id, 6500, 10000, 26500
FROM projects p WHERE p.project_code = 'IP-202604-001'
ON CONFLICT DO NOTHING;

INSERT INTO estimation_items (estimation_id, material_name, quantity, unit_price, subtotal)
SELECT e.id, '水泥包', 10, 200, 2000
FROM project_estimations e JOIN projects p ON e.project_id = p.id WHERE p.project_code = 'IP-202604-001';

INSERT INTO estimation_items (estimation_id, material_name, quantity, unit_price, subtotal)
SELECT e.id, '地磚(坪)', 10, 800, 8000
FROM project_estimations e JOIN projects p ON e.project_id = p.id WHERE p.project_code = 'IP-202604-001';

INSERT INTO estimation_worker_items (estimation_id, worker_id, days, subtotal)
SELECT e.id, w.id, 1, 3000
FROM project_estimations e
JOIN projects p ON e.project_id = p.id
CROSS JOIN workers w
WHERE p.project_code = 'IP-202604-001' AND w.nickname = '阿信師';

INSERT INTO estimation_worker_items (estimation_id, worker_id, days, subtotal)
SELECT e.id, w.id, 1, 3500
FROM project_estimations e
JOIN projects p ON e.project_id = p.id
CROSS JOIN workers w
WHERE p.project_code = 'IP-202604-001' AND w.nickname = '木工老張';