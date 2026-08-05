-- ============================================================
-- DATABASE SCHEMA: TOÁN CÙNG EM (Nền Tảng Học Tập Số Lớp 2)
-- ============================================================

-- 1. Bảng Người Dùng (Users: Học Sinh & Giáo Viên)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    avatar_url VARCHAR(255) DEFAULT 'default-avatar.png',
    xp_points INT DEFAULT 0,
    coins INT DEFAULT 0,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Nhiệm Vụ Hằng Ngày (Daily Quests)
CREATE TABLE IF NOT EXISTS quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- e.g., 'cong_tru_100', 'dong_ho', 'hinh_hoc'
    target_score INT DEFAULT 100,
    reward_xp INT DEFAULT 50,
    reward_coins INT DEFAULT 20,
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_by INT REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bảng Bài Kiểm Tra Tuần (Quizzes)
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    duration_minutes INT DEFAULT 15,
    is_randomized BOOLEAN DEFAULT TRUE,
    anti_cheat_enabled BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Câu Hỏi (Questions)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    topic_tag VARCHAR(50) NOT NULL
);

-- 5. Bảng Bài Nộp (Submissions)
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) DEFAULT 10.00,
    total_time_seconds INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Chi Tiết Bài Nộp (Submission Details)
CREATE TABLE IF NOT EXISTS submission_details (
    id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES submissions(id) ON DELETE CASCADE,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    selected_option CHAR(1),
    is_correct BOOLEAN NOT NULL,
    topic_tag VARCHAR(50) NOT NULL
);

-- 7. Bảng Nhật Ký Cảnh Báo Gian Lận (Anti-Cheat Logs)
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
    id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES submissions(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'tab_switch', 'copy_attempt', 'blur'
    event_message TEXT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng Nhận Xét Của Giáo Viên (Teacher Feedbacks)
CREATE TABLE IF NOT EXISTS teacher_feedbacks (
    id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES submissions(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng Gợi Ý Cá Nhân Hóa Từ AI (AI Recommendations)
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    weak_topic VARCHAR(50) NOT NULL,
    recommendation_text TEXT NOT NULL,
    suggested_task VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
