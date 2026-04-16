-- 檢查角色權限
SELECT u.username, r.name AS role_name
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.username, r.name;
-- 檢查產品
SELECT  p.name, i.quantity
FROM products p
JOIN inventory i ON i.product_id = p.id
ORDER BY p.sku;
-- 檢查對應使用者
SELECT id, username FROM users WHERE username = 'alice';
-- 檢查訂單明細
SELECT o.order_number, o.total_amount, oi.product_name, oi.quantity, oi.line_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.order_number = 'ORD-20260415-0001';