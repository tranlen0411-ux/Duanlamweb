-- ============================================================
-- SUPABASE POSTGRESQL SCHEMA: TOÁN CÙNG EM (HỌC TẬP SỐ LỚP 2)
-- Chạy đoạn mã này tại Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Bảng Lớp Học (classes)
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Học Sinh (students)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
    xp INT DEFAULT 450,
    coins INT DEFAULT 1250,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Tài Khoản Giáo Viên / Admin (teachers)
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    assigned_classes JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    role TEXT DEFAULT 'teacher',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Xếp Hạng Trò Chơi & Nhiệm Vụ (game_scores)
CREATE TABLE IF NOT EXISTS game_scores (
    id SERIAL PRIMARY KEY,
    category_key TEXT NOT NULL,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    xp INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng Điểm Bài Kiểm Tra Hằng Tuần (exam_scores)
CREATE TABLE IF NOT EXISTS exam_scores (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    quiz_title TEXT DEFAULT 'Bài kiểm tra Tuần 1',
    score TEXT NOT NULL,
    exam_time TEXT,
    teacher_comment TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Nhật Ký Anti-Cheat (anti_cheat_logs)
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    cheat_count INT DEFAULT 0,
    event_type TEXT DEFAULT 'tab_switch',
    event_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BẬT ROW LEVEL SECURITY (RLS) & CẤP QUYỀN PUBLIC READ/WRITE
-- ============================================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_cheat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Classes Access" ON classes;
DROP POLICY IF EXISTS "Public Students Access" ON students;
DROP POLICY IF EXISTS "Public Teachers Access" ON teachers;
DROP POLICY IF EXISTS "Public Game Scores Access" ON game_scores;
DROP POLICY IF EXISTS "Public Exam Scores Access" ON exam_scores;
DROP POLICY IF EXISTS "Public Anti-Cheat Access" ON anti_cheat_logs;

CREATE POLICY "Public Classes Access" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Students Access" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Teachers Access" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Game Scores Access" ON game_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Exam Scores Access" ON exam_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Anti-Cheat Access" ON anti_cheat_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ============================================================

-- Thêm các lớp học mẫu
INSERT INTO classes (id, name) VALUES
('2AI', 'Lớp 2 AI'),
('2A', 'Lớp 2A'),
('2B', 'Lớp 2B'),
('2C', 'Lớp 2C')
ON CONFLICT (id) DO NOTHING;

-- Thêm tài khoản Giáo viên & Admin mẫu
INSERT INTO teachers (id, username, password, display_name, assigned_classes, role) VALUES
('gv001', 'comai', '123456', 'Cô Mai', '["2A", "2B"]'::jsonb, 'teacher'),
('gv002', 'cohuong', '123456', 'Cô Hương', '["2A"]'::jsonb, 'teacher'),
('gv003', 'thayhung', '123456', 'Thầy Hùng', '["2B"]'::jsonb, 'teacher'),
('gv004', 'colan', '123456', 'Cô Lan', '["2C"]'::jsonb, 'teacher'),
('admin01', 'admin', '123456', 'Admin Quản Trị', '["2AI", "2A", "2B", "2C"]'::jsonb, 'admin')
ON CONFLICT (username) DO NOTHING;

-- Thêm danh sách Học sinh mẫu
INSERT INTO students (id, name, class_id, xp, coins) VALUES
(101, 'Vũ Bảo An', '2AI', 2100, 1250),
(102, 'Bé Nam', '2AI', 1950, 1250),
(103, 'Đỗ Hoàng Long', '2AI', 1750, 1250),
(104, 'Trần Tiến Đạt', '2A', 1500, 1250),
(105, 'Nguyễn Văn A', '2A', 1350, 1250),
(106, 'Lê Thị B', '2B', 1200, 1250)
ON CONFLICT (id) DO NOTHING;

-- Thêm điểm trò chơi mẫu
INSERT INTO game_scores (category_key, student_id, student_name, xp) VALUES
('game-pika', 101, 'Vũ Bảo An', 2100),
('game-pika', 102, 'Bé Nam', 1950),
('game-pika', 103, 'Đỗ Hoàng Long', 1750),
('game-pika', 104, 'Trần Tiến Đạt', 1500),
('game-pika', 106, 'Lê Thị B', 1200),
('game-ai-la-trieu-phu', 101, 'Vũ Bảo An', 100)
ON CONFLICT DO NOTHING;

-- Thêm điểm bài kiểm tra mẫu
INSERT INTO exam_scores (student_id, student_name, quiz_title, score, exam_time, teacher_comment) VALUES
(101, 'Vũ Bảo An', 'Bài kiểm tra Tuần 1', '10/10', '12 phút', 'Con làm bài rất xuất sắc! 🌟'),
(102, 'Bé Nam', 'Bài kiểm tra Tuần 1', '9.5/10', '14 phút', 'Con làm bài tốt lắm! Tiếp tục phát huy nhé! ✨'),
(103, 'Đỗ Hoàng Long', 'Bài kiểm tra Tuần 1', '8/10', '18 phút', 'Cần chú ý hơn ở bài toán lời văn con nhé!'),
(104, 'Trần Tiến Đạt', 'Bài kiểm tra Tuần 1', '10/10', '10 phút', 'Xuất sắc!')
ON CONFLICT DO NOTHING;
