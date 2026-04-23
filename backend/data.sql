
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
INSERT INTO materials (name, unit, description, default_price, is_active, created_at)
VALUES
  -- 角材類
  ('永新集層 角材 80*12*10#F1(綠建材)', '支', '常用角材，綠建材等級', 50.00, TRUE, NOW()),
  ('永新集層 角材 80*18*10#F1(綠建材)', '支', '較厚角材，綠建材等級', 75.00, TRUE, NOW()),
  ('永新集層 角材 80*24*10#F1(綠建材)', '支', '寬幅角材，綠建材等級', 95.00, TRUE, NOW()),
  ('永新集層 角材 60*12*10#F1(綠建材)', '支', '細角材，綠建材等級', 40.00, TRUE, NOW()),
  ('台灣杉木 角材 90*18*12', '支', '本土杉木角材，耐濕性佳', 85.00, TRUE, NOW()),

  -- 木心板類
  ('木心板2*8 中興', '片', '常用木心板 2x8 尺寸', 335.00, TRUE, NOW()),
  ('木心板3*6 中興', '片', '常用木心板 3x6 尺寸', 310.00, TRUE, NOW()),
  ('木心板4*8 中興', '片', '大尺寸木心板 4x8', 420.00, TRUE, NOW()),
  ('木心板4*8 大亞', '片', '大亞品牌木心板 4x8', 440.00, TRUE, NOW()),
  ('木心板2*8 大亞', '片', '大亞品牌木心板 2x8', 350.00, TRUE, NOW()),

  -- 夾板 / 合板類
  ('夾板 3mm 3*6 台製', '片', '3mm 薄夾板，適合內裝貼面', 180.00, TRUE, NOW()),
  ('夾板 6mm 3*6 台製', '片', '6mm 夾板，常用底板', 240.00, TRUE, NOW()),
  ('夾板 9mm 3*6 台製', '片', '9mm 夾板，結構用', 310.00, TRUE, NOW()),
  ('夾板 12mm 3*6 台製', '片', '12mm 夾板，重荷載用', 380.00, TRUE, NOW()),
  ('夾板 18mm 4*8 台製', '片', '18mm 厚夾板，系統櫃底板', 520.00, TRUE, NOW()),

  -- 矽酸鈣板類
  ('儷士 矽酸鈣 6mm 3*6(日本)', '片', '矽酸鈣板 6mm 日本製', 385.00, TRUE, NOW()),
  ('儷士 矽酸鈣 9mm 3*6(日本)', '片', '矽酸鈣板 9mm 日本製', 460.00, TRUE, NOW()),
  ('儷士 矽酸鈣 12mm 3*6(日本)', '片', '矽酸鈣板 12mm 日本製', 540.00, TRUE, NOW()),
  ('台灣日通 矽酸鈣 6mm 3*6', '片', '矽酸鈣板 6mm 台灣製', 320.00, TRUE, NOW()),
  ('台灣日通 矽酸鈣 9mm 3*6', '片', '矽酸鈣板 9mm 台灣製', 390.00, TRUE, NOW()),

  -- 矽酸板 / 防潮板類
  ('台灣日通 9mm 3*6', '片', '9mm 厚 3x6 板材', 420.00, TRUE, NOW()),
  ('台灣日通 12mm 3*6', '片', '12mm 厚 3x6 板材', 490.00, TRUE, NOW()),
  ('防潮板 9mm 3*6', '片', '防潮處理夾板，浴室用', 450.00, TRUE, NOW()),
  ('防潮板 12mm 3*6', '片', '防潮處理夾板，廚房用', 520.00, TRUE, NOW()),
  ('防潮板 18mm 4*8', '片', '厚防潮板，系統櫃底板', 680.00, TRUE, NOW()),

  -- 五金類
  ('隱藏式鉸鏈 110度 全蓋', '個', '系統櫃門片用鉸鏈', 35.00, TRUE, NOW()),
  ('隱藏式鉸鏈 110度 半蓋', '個', '系統櫃門片用半蓋鉸鏈', 35.00, TRUE, NOW()),
  ('隱藏式鉸鏈 165度 全蓋', '個', '大開角鉸鏈，轉角櫃用', 55.00, TRUE, NOW()),
  ('三節滑軌 45cm 靜音', '組', '抽屜靜音三節滑軌', 120.00, TRUE, NOW()),
  ('三節滑軌 55cm 靜音', '組', '抽屜靜音三節滑軌 55cm', 140.00, TRUE, NOW()),
  ('三節滑軌 65cm 靜音', '組', '抽屜靜音三節滑軌 65cm', 160.00, TRUE, NOW()),
  ('氣壓棒 上掀門 300N', '支', '上掀門氣壓支撐棒', 180.00, TRUE, NOW()),
  ('氣壓棒 上掀門 400N', '支', '重門用氣壓支撐棒', 220.00, TRUE, NOW()),
  ('L型支撐架 3吋', '個', '層板支撐用 L型金屬架', 25.00, TRUE, NOW()),
  ('L型支撐架 5吋', '個', '重載層板用 L型金屬架', 40.00, TRUE, NOW()),

  -- 釘料 / 黏著類
  ('白膠 1KG', '罐', '木工白膠，通用型', 65.00, TRUE, NOW()),
  ('矽利康 中性 白色 300ml', '條', '中性矽利康，防水用', 55.00, TRUE, NOW()),
  ('矽利康 酸性 透明 300ml', '條', '酸性矽利康，玻璃用', 45.00, TRUE, NOW()),
  ('氣釘 1吋 1000支/盒', '盒', '木工氣釘 1吋', 80.00, TRUE, NOW()),
  ('氣釘 1.5吋 1000支/盒', '盒', '木工氣釘 1.5吋', 90.00, TRUE, NOW()),
  ('螺絲 3.5*35mm 200支/盒', '盒', '木工自攻螺絲', 70.00, TRUE, NOW()),
  ('螺絲 4.0*50mm 200支/盒', '盒', '重型木工自攻螺絲', 85.00, TRUE, NOW()),

  -- 表面材 / 飾板類
  ('美耐板 白色亮面 4*8', '片', '白色亮面美耐板，系統櫃門片', 650.00, TRUE, NOW()),
  ('美耐板 木紋橡木 4*8', '片', '橡木木紋美耐板', 720.00, TRUE, NOW()),
  ('美耐板 木紋胡桃 4*8', '片', '胡桃木紋美耐板', 750.00, TRUE, NOW()),
  ('波音軟片 白色霧面 50cm*5m', '捲', '白色霧面貼皮', 320.00, TRUE, NOW()),
  ('波音軟片 木紋淺色 50cm*5m', '捲', '淺木紋貼皮', 380.00, TRUE, NOW()),
  ('木皮板 橡木 2*8 0.6mm', '片', '橡木真木皮板', 480.00, TRUE, NOW()),

  -- 油漆 / 批土類
  ('批土 5KG', '桶', '室內批土，填縫整平用', 180.00, TRUE, NOW()),
  ('水泥漆 白色 5加侖', '桶', '室內水泥漆，白色', 520.00, TRUE, NOW()),
  ('乳膠漆 白色 5加侖', '桶', '室內乳膠漆，白色', 680.00, TRUE, NOW()),
  ('底漆 白色 5加侖', '桶', '木器底漆，封閉底材用', 450.00, TRUE, NOW());

-- === 倉庫庫存（假設部分材料已在倉庫） ===
INSERT INTO warehouse_inventory (material_id, quantity, location, status, remarks, updated_at)
VALUES
  (1,  15, 'A1-01', 'AVAILABLE', NULL, NOW()),
  (2,  8,  'A1-02', 'AVAILABLE', NULL, NOW()),
  (3,  12, 'A1-03', 'AVAILABLE', NULL, NOW()),
  (4,  6,  'A1-04', 'AVAILABLE', '包裝略破，品質無虞', NOW()),
  (5,  10, 'A2-01', 'AVAILABLE', NULL, NOW()),
  (6,  4,  'A2-02', 'AVAILABLE', NULL, NOW()),
  (7,  7,  'A2-03', 'AVAILABLE', NULL, NOW()),
  (8,  3,  'A2-04', 'AVAILABLE', '剩餘最後 3 片', NOW()),
  (9,  20, 'B1-01', 'AVAILABLE', '剛進貨，尚未拆封', NOW()),
  (10, 5,  'B1-02', 'AVAILABLE', NULL, NOW()),
  (11, 9,  'B1-03', 'AVAILABLE', NULL, NOW()),
  (12, 14, 'B1-04', 'AVAILABLE', NULL, NOW()),
  (13, 2,  'B2-01', 'AVAILABLE', '剩餘最後 2 片，待補貨', NOW()),
  (14, 11, 'B2-02', 'AVAILABLE', NULL, NOW()),
  (15, 6,  'B2-03', 'AVAILABLE', NULL, NOW()),
  (16, 30, 'C1-01', 'AVAILABLE', '大量庫存', NOW()),
  (17, 25, 'C1-02', 'AVAILABLE', '大量庫存', NOW()),
  (18, 18, 'C1-03', 'AVAILABLE', NULL, NOW()),
  (19, 8,  'C2-01', 'AVAILABLE', NULL, NOW()),
  (20, 50, 'C2-02', 'AVAILABLE', '剛進貨，尚未拆封', NOW());

-- === 案件主檔 ===
INSERT INTO projects (project_code, client_name, client_phone, city, district, site_address, description,
                   status, sales_user_id, estimated_days, created_at, updated_at)
VALUES
  ('IP-202601-001', '陳先生', '0912-111-001', '台北市', '中山區',
   '林森北路 200 號 3 樓', '客廳與主臥裝潢需求', 'CLOSED', 1, 20, NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days'),
  ('IP-202601-002', '林小姐', '0933-222-002', '新北市', '永和區',
   '中正路 45 號 8 樓', '全室翻新，含衛浴與廚房', 'CLOSED', 1, 35, NOW() - INTERVAL '85 days', NOW() - INTERVAL '55 days'),
  ('IP-202601-003', '黃先生', '0956-333-003', '桃園市', '桃園區',
   '中山路 310 號 5 樓', '系統櫃客製化', 'CLOSED', 1, 18, NOW() - INTERVAL '80 days', NOW() - INTERVAL '50 days'),
  ('IP-202601-004', '張小姐', '0912-444-004', '新竹市', '東區',
   '光復路一段 88 號 12 樓', '浴室翻新預約', 'CLOSED', 1, 14, NOW() - INTERVAL '75 days', NOW() - INTERVAL '45 days'),

  ('IP-202602-001', '陳先生', '0912-111-001', '台北市', '中山區',
   '林森北路 200 號 3 樓', '廚房翻新（二次施工）', 'CLOSED', 1, 15, NOW() - INTERVAL '70 days', NOW() - INTERVAL '40 days'),
  ('IP-202602-002', '吳先生', '0977-555-005', '台中市', '西屯區',
   '台灣大道二段 450 號 6 樓', '老屋翻新，需要重新規劃管線', 'CLOSED', 1, 30, NOW() - INTERVAL '68 days', NOW() - INTERVAL '38 days'),
  ('IP-202602-003', '李小姐', '0966-666-006', '高雄市', '左營區',
   '博愛三路 130 號 4 樓', '全室木地板鋪設', 'CLOSED', 1, 12, NOW() - INTERVAL '65 days', NOW() - INTERVAL '35 days'),
  ('IP-202602-004', '蔡先生', '0900-777-007', '台南市', '東區',
   '東門路一段 90 號 7 樓', '客廳與主臥裝潢需求', 'CLOSED', 1, 22, NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days'),
  ('IP-202602-005', '王先生', '0923-888-008', '新北市', '板橋區',
   '文化路二段 500 號 10 樓', '系統櫃客製化', 'CLOSED', 1, 17, NOW() - INTERVAL '58 days', NOW() - INTERVAL '28 days'),

  ('IP-202603-001', '林小姐', '0933-222-002', '新北市', '永和區',
   '中正路 45 號 8 樓', '書房改造，系統書櫃訂製', 'INSPECTION', 1, 10, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
  ('IP-202603-002', '鄭先生', '0911-999-009', '桃園市', '中壢區',
   '中央西路一段 120 號 9 樓', '廚房裝修', 'INSPECTION', 1, 25, NOW() - INTERVAL '28 days', NOW() - INTERVAL '4 days'),
  ('IP-202603-003', '謝小姐', '0935-100-010', '新竹縣', '竹北市',
   '縣政二路 220 號 3 樓', '客廳與主臥裝潢需求', 'INSPECTION', 1, 20, NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),
  ('IP-202603-004', '吳先生', '0977-555-005', '台中市', '西屯區',
   '台灣大道二段 450 號 6 樓', '主臥更衣室規劃（二次施工）', 'INSPECTION', 1, 8, NOW() - INTERVAL '22 days', NOW() - INTERVAL '2 days'),
  ('IP-202603-005', '許先生', '0908-200-011', '台北市', '松山區',
   '八德路四段 350 號 15 樓', '老屋翻新，需要重新規劃管線', 'INSPECTION', 1, 33, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),

  ('IP-202603-006', '劉小姐', '0952-300-012', '台中市', '北屯區',
   '崇德路一段 180 號 5 樓', '全室木地板鋪設', 'IN_PROGRESS', 1, 16, NOW() - INTERVAL '18 days', NOW()),
  ('IP-202603-007', '楊先生', '0916-400-013', '高雄市', '三民區',
   '九如二路 280 號 8 樓', '客廳與主臥裝潢需求', 'IN_PROGRESS', 1, 28, NOW() - INTERVAL '16 days', NOW()),
  ('IP-202603-008', '蔡先生', '0900-777-007', '台南市', '東區',
   '東門路一段 90 號 7 樓', '衛浴翻新（二次施工）', 'IN_PROGRESS', 1, 12, NOW() - INTERVAL '14 days', NOW()),
  ('IP-202603-009', '洪小姐', '0988-500-014', '新北市', '新店區',
   '中正路 420 號 11 樓', '系統櫃客製化', 'IN_PROGRESS', 1, 19, NOW() - INTERVAL '12 days', NOW()),
  ('IP-202603-010', '郭先生', '0972-600-015', '台北市', '大安區',
   '和平東路三段 66 號 6 樓', '老屋翻新，需要重新規劃管線', 'IN_PROGRESS', 1, 40, NOW() - INTERVAL '10 days', NOW()),
  ('IP-202603-011', '周小姐', '0946-700-016', '桃園市', '龜山區',
   '文化一路 90 號 4 樓', '廚房裝修', 'IN_PROGRESS', 1, 21, NOW() - INTERVAL '9 days', NOW()),
  ('IP-202603-012', '蕭先生', '0931-800-017', '新竹市', '北區',
   '中華路一段 200 號 7 樓', '全室木地板鋪設', 'IN_PROGRESS', 1, 14, NOW() - INTERVAL '8 days', NOW()),

  ('IP-202604-023', '謝小姐', '0935-100-010', '新竹縣', '竹北市',
   '縣政二路 220 號 3 樓', '小孩房改造，含系統床組', 'CONFIRMED', 1, 10, NOW() - INTERVAL '7 days', NOW()),
  ('IP-202604-024', '許先生', '0908-200-011', '台北市', '松山區',
   '八德路四段 350 號 15 樓', '廚房裝修（三次施工）', 'CONFIRMED', 1, 15, NOW() - INTERVAL '6 days', NOW()),
  ('IP-202604-025', '林先生', '0921-900-018', '台中市', '南屯區',
   '五權西路二段 110 號 9 樓', '浴室翻新預約', 'CONFIRMED', 1, 11, NOW() - INTERVAL '6 days', NOW()),
  ('IP-202604-026', '陳小姐', '0943-010-019', '高雄市', '苓雅區',
   '三多三路 380 號 13 樓', '客廳與主臥裝潢需求', 'CONFIRMED', 1, 24, NOW() - INTERVAL '5 days', NOW()),
  ('IP-202604-027', '江先生', '0967-020-020', '新北市', '三重區',
   '重新路五段 200 號 2 樓', '系統櫃客製化', 'CONFIRMED', 1, 18, NOW() - INTERVAL '5 days', NOW()),
  ('IP-202604-028', '余小姐', '0955-030-021', '台南市', '永康區',
   '中華路 610 號 6 樓', '老屋翻新，需要重新規劃管線', 'CONFIRMED', 1, 35, NOW() - INTERVAL '4 days', NOW()),

  ('IP-202604-029', '洪小姐', '0988-500-014', '新北市', '新店區',
   '中正路 420 號 11 樓', '主臥衛浴擴建（三次施工）', 'QUOTING', 1, 9, NOW() - INTERVAL '4 days', NOW()),
  ('IP-202604-030', '方先生', '0902-040-022', '台北市', '內湖區',
   '成功路四段 330 號 16 樓', '全室翻新，含衛浴與廚房', 'QUOTING', 1, 42, NOW() - INTERVAL '3 days', NOW()),
  ('IP-202604-031', '葉小姐', '0918-050-023', '桃園市', '平鎮區',
   '環南路 150 號 5 樓', '廚房裝修', 'QUOTING', 1, 20, NOW() - INTERVAL '3 days', NOW()),
  ('IP-202604-032', '鄭先生', '0911-999-009', '桃園市', '中壢區',
   '中央西路一段 120 號 9 樓', '全室木地板鋪設（二次施工）', 'QUOTING', 1, 10, NOW() - INTERVAL '2 days', NOW()),
  ('IP-202604-033', '蔡先生', '0944-060-024', '台中市', '豐原區',
   '中正路 55 號 3 樓', '浴室翻新預約', 'QUOTING', 1, 13, NOW() - INTERVAL '2 days', NOW()),
  ('IP-202604-034', '田小姐', '0929-070-025', '新竹市', '香山區',
   '牛埔路 240 號 2 樓', '客廳與主臥裝潢需求', 'QUOTING', 1, 26, NOW() - INTERVAL '2 days', NOW()),
  ('IP-202604-035', '石先生', '0961-080-026', '高雄市', '楠梓區',
   '楠梓新路 180 號 8 樓', '系統櫃客製化', 'QUOTING', 1, 16, NOW() - INTERVAL '1 day', NOW()),
  ('IP-202604-036', '馬小姐', '0937-090-027', '台南市', '北區',
   '北門路一段 430 號 10 樓', '老屋翻新，需要重新規劃管線', 'QUOTING', 1, 38, NOW() - INTERVAL '1 day', NOW()),

  ('IP-202604-037', '羅先生', '0915-100-028', '新北市', '淡水區',
   '中正東路二段 90 號 4 樓', '浴室翻新預約', 'INQUIRY', 1, 12, NOW(), NOW()),
  ('IP-202604-038', '范小姐', '0948-110-029', '台北市', '文山區',
   '木柵路三段 260 號 6 樓', '廚房裝修', 'INQUIRY', 1, 18, NOW(), NOW()),
  ('IP-202604-039', '方先生', '0902-040-022', '台北市', '內湖區',
   '成功路四段 330 號 16 樓', '玄關與走廊翻新', 'INQUIRY', 1, 7, NOW(), NOW()),
  ('IP-202604-040', '鄒先生', '0971-120-030', '桃園市', '八德區',
   '介壽路一段 700 號 3 樓', '客廳與主臥裝潢需求', 'INQUIRY', 1, 22, NOW(), NOW()),
  ('IP-202604-041', '韓小姐', '0926-130-031', '新竹縣', '新埔鎮',
   '中正路 110 號 1 樓', '系統櫃客製化', 'INQUIRY', 1, 14, NOW(), NOW()),
  ('IP-202604-042', '葉小姐', '0918-050-023', '桃園市', '平鎮區',
   '環南路 150 號 5 樓', '主臥更衣室規劃', 'INQUIRY', 1, 9, NOW(), NOW()),
  ('IP-202604-043', '魏先生', '0953-140-032', '台中市', '大里區',
   '中興路二段 340 號 7 樓', '老屋翻新，需要重新規劃管線', 'INQUIRY', 1, 32, NOW(), NOW()),
  ('IP-202604-044', '孔小姐', '0939-150-033', '台南市', '安平區',
   '安平路 580 號 5 樓', '全室木地板鋪設', 'INQUIRY', 1, 11, NOW(), NOW()),
  ('IP-202604-045', '廖先生', '0963-160-034', '高雄市', '前鎮區',
   '中山三路 620 號 9 樓', '浴室翻新預約', 'INQUIRY', 1, 13, NOW(), NOW()),
  ('IP-202604-046', '丁小姐', '0907-170-035', '新北市', '汐止區',
   '大同路一段 440 號 12 樓', '廚房裝修', 'INQUIRY', 1, 20, NOW(), NOW()),
  ('IP-202604-047', '賴先生', '0942-180-036', '台北市', '士林區',
   '中正路 320 號 5 樓', '客廳與主臥裝潢需求', 'INQUIRY', 1, 25, NOW(), NOW()),
  ('IP-202604-048', '余小姐', '0955-030-021', '台南市', '永康區',
   '中華路 610 號 6 樓', '小孩房改造，含系統床組', 'INQUIRY', 1, 8, NOW(), NOW()),
  ('IP-202604-049', '夏先生', '0924-190-037', '桃園市', '蘆竹區',
   '南崁路一段 510 號 11 樓', '系統櫃客製化', 'INQUIRY', 1, 16, NOW(), NOW()),
  ('IP-202604-050', '沈小姐', '0958-200-038', '新竹市', '東區',
   '東光路 180 號 8 樓', '老屋翻新，需要重新規劃管線', 'INQUIRY', 1, 28, NOW(), NOW());

-- === 案件用料（預估 / 鎖定） ===
INSERT INTO case_materials (case_id, material_id,
                            quantity, material_type, unit_price, line_cost, order_batch)
  VALUES
  -- 案件 4 (IP-202604-004 張小姐，CONFIRMED) 第1批
  (4, 1,  60, 'PURCHASE', 50.00,   3000.00, 1),
  (4, 6,  15, 'PURCHASE', 335.00,  5025.00, 1),
  (4, 11, 20, 'PURCHASE', 240.00,  4800.00, 1),
  (4, 26, 40, 'PURCHASE', 35.00,   1400.00, 1),

  -- 案件 5 (IP-202604-005 黃先生，IN_PROGRESS) 第1批
  (5, 2,  50, 'PURCHASE', 75.00,   3750.00, 1),
  (5, 9,  12, 'PURCHASE', 310.00,  3720.00, 1),
  (5, 16, 8,  'PURCHASE', 385.00,  3080.00, 1),
  (5, 2,  5,  'RETURN',   75.00,   375.00,  1),

  -- 案件 7 (IP-202603-002 吳先生，INSPECTION) 第1批
  (7, 3,  25, 'PURCHASE', 335.00,  8375.00, 1),
  (7, 5,  18, 'PURCHASE', 385.00,  6930.00, 1),
  (7, 29, 10, 'PURCHASE', 120.00,  1200.00, 1),
  (7, 3,  5,  'LEFTOVER', 335.00,  1675.00, 1),
  (7, 5,  3,  'RETURN',   385.00,  1155.00, 1),

  -- 案件 8 (IP-202603-003 謝小姐，INSPECTION) 第1批
  (8, 1,  100,'PURCHASE', 50.00,   5000.00, 1),
  (8, 13, 10, 'PURCHASE', 310.00,  3100.00, 1),
  (8, 27, 30, 'PURCHASE', 35.00,   1050.00, 1),
  (8, 1,  10, 'RETURN',   50.00,   500.00,  1),

  -- 案件 11 (IP-202604-011 楊先生，CONFIRMED) 第1批
  (11, 4,  20, 'PURCHASE', 420.00,  8400.00, 1),
  (11, 17, 12, 'PURCHASE', 460.00,  5520.00, 1),
  (11, 30, 8,  'PURCHASE', 140.00,  1120.00, 1),

  -- 案件 13 (IP-202603-007 楊先生，IN_PROGRESS) 第1批
  (13, 2,  70, 'PURCHASE', 75.00,   5250.00, 1),
  (13, 10, 15, 'PURCHASE', 350.00,  5250.00, 1),
  (13, 16, 10, 'PURCHASE', 385.00,  3850.00, 1),
  (13, 2,  8,  'LEFTOVER', 75.00,   600.00,  1),

  -- 案件 13 第2批
  (13, 1,  40, 'PURCHASE', 50.00,   2000.00, 2),
  (13, 33, 6,  'PURCHASE', 450.00,  2700.00, 2),
  (13, 1,  5,  'RETURN',   50.00,   250.00,  2),

  -- 案件 18 (IP-202604-018 蘇小姐，CONFIRMED) 第1批
  (18, 6,  18, 'PURCHASE', 335.00,  6030.00, 1),
  (18, 28, 24, 'PURCHASE', 35.00,   840.00,  1),
  (18, 41, 5,  'PURCHASE', 650.00,  3250.00, 1);

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
INSERT INTO workers (nickname, daily_wage) VALUES ('文全', 2950);
INSERT INTO workers (nickname, daily_wage) VALUES ('小量', 3350);
INSERT INTO workers (nickname, daily_wage) VALUES ('阿葉', 3550);
INSERT INTO workers (nickname, daily_wage) VALUES ('芋頭', 3450);
INSERT INTO workers (nickname, daily_wage) VALUES ('浩威', 3550);
INSERT INTO workers (nickname, daily_wage) VALUES ('煥明', 3550);
INSERT INTO workers (nickname, daily_wage) VALUES ('換騎', 3550);
INSERT INTO workers (nickname, daily_wage) VALUES ('陳敏', 2150);

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