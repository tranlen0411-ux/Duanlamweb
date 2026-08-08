/* ============================================================
   SUPABASE INTEGRATION MODULE & AUTH SERVICE - TOÁN CÙNG EM
   ============================================================ */

// 1. Cấu hình Supabase Credentials kết nối trực tiếp CSDL Supabase
const SUPABASE_URL = "https://rcqgxmcqolxbrahhyxji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcWd4bWNxb2x4YnJhaGh5eGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNjQ3MTQsImV4cCI6MjEwMTY0MDcxNH0.szavY7MZ2T9znw-ja_lmjftlbG6U7-OvEiKFmA3m0HE";

let supabaseClient = null;

// Khởi tạo Supabase JS Client
if (typeof supabase !== "undefined" && SUPABASE_URL.includes("supabase.co") && !SUPABASE_ANON_KEY.includes("your-anon-key")) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("⚡ [Supabase] Đã kết nối thành công tới Supabase Database! (Project ID: rcqgxmcqolxbrahhyxji)");
  } catch (err) {
    console.warn("⚠️ [Supabase] Chưa thể kết nối tới Supabase:", err);
  }
} else {
  console.log("ℹ️ [Supabase] Đang vận hành chế độ Local Storage dự phòng.");
}

// ============================================================
// DỊCH VỤ XÁC THỰC ĐĂNG NHẬP / ĐĂNG KÝ VÀ DỮ LIỆU SUPABASE
// ============================================================

window.supabaseAuth = {
  // 1. Đăng ký tài khoản mới (Register)
  async registerUser({ username, password, fullName, role, classId }) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();
    const userRole = role || 'student';
    const userClass = classId || '2AI';

    if (!cleanUsername || !cleanPassword || !cleanFullName) {
      return { success: false, message: 'Vui lòng điền đầy đủ Tên tài khoản, Mật khẩu và Họ tên!' };
    }

    if (supabaseClient) {
      try {
        const { data: existingUser } = await supabaseClient
          .from('users')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          return { success: false, message: 'Tên tài khoản (username) này đã tồn tại! Vui lòng chọn tên khác.' };
        }

        const { data: newUser, error: insertErr } = await supabaseClient
          .from('users')
          .insert([{
            username: cleanUsername,
            password: cleanPassword,
            full_name: cleanFullName,
            role: userRole,
            class_id: userClass,
            xp: 450,
            coins: 1250
          }])
          .select()
          .single();

        if (insertErr) throw insertErr;

        if (userRole === 'student') {
          await supabaseClient.from('students').insert([{
            name: cleanFullName,
            class_id: userClass,
            xp: 450,
            coins: 1250
          }]);
        }

        return { success: true, user: newUser, message: '🎉 Đăng ký tài khoản thành công trên Supabase!' };
      } catch (err) {
        console.error('Lỗi đăng ký Supabase:', err);
        return { success: false, message: 'Lỗi Supabase: ' + (err.message || err) };
      }
    }

    // LocalStorage Fallback
    let localUsers = JSON.parse(localStorage.getItem('users_db') || '[]');
    if (localUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Tên tài khoản này đã tồn tại trong bộ nhớ!' };
    }

    const newUser = {
      id: Date.now(),
      username: cleanUsername,
      password: cleanPassword,
      full_name: cleanFullName,
      role: userRole,
      class_id: userClass,
      xp: 450,
      coins: 1250
    };
    localUsers.push(newUser);
    localStorage.setItem('users_db', JSON.stringify(localUsers));

    return { success: true, user: newUser, message: '🎉 Đăng ký tài khoản thành công!' };
  },

  // 2. Đăng nhập tài khoản (Login)
  async loginUser(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Vui lòng nhập Tên tài khoản và Mật khẩu!' };
    }

    if (supabaseClient) {
      try {
        const { data: user, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('username', cleanUsername)
          .eq('password', cleanPassword)
          .maybeSingle();

        if (user) {
          localStorage.setItem('studentName', user.full_name);
          localStorage.setItem('studentClass', user.class_id || '2AI');
          localStorage.setItem('currentUserRole', user.role);
          localStorage.setItem('userXP', user.xp || 450);
          localStorage.setItem('userXu', user.coins || 1250);

          return { success: true, user: user, message: '🔑 Đăng nhập thành công!' };
        }
      } catch (err) {
        console.error('Lỗi đăng nhập Supabase:', err);
      }
    }

    // LocalStorage Fallback
    let localUsers = JSON.parse(localStorage.getItem('users_db') || '[]');
    let user = localUsers.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);

    if (!user) {
      if (cleanUsername === 'benam' && cleanPassword === '123456') {
        user = { id: 102, username: 'benam', full_name: 'Bé Nam', role: 'student', class_id: '2AI', xp: 450, coins: 1250 };
      } else if (cleanUsername === 'comai' && cleanPassword === '123456') {
        user = { id: 201, username: 'comai', full_name: 'Cô Mai', role: 'teacher', class_id: '2A', xp: 0, coins: 0 };
      } else if (cleanUsername === 'admin' && cleanPassword === '123456') {
        user = { id: 999, username: 'admin', full_name: 'Admin Quản Trị', role: 'admin', class_id: '2AI', xp: 0, coins: 0 };
      }
    }

    if (!user) {
      return { success: false, message: '❌ Tên tài khoản hoặc mật khẩu không chính xác!' };
    }

    localStorage.setItem('studentName', user.full_name);
    localStorage.setItem('studentClass', user.class_id || '2AI');
    localStorage.setItem('currentUserRole', user.role);
    localStorage.setItem('userXP', user.xp || 450);
    localStorage.setItem('userXu', user.coins || 1250);

    return { success: true, user: user, message: '🔑 Đăng nhập thành công!' };
  }
};

window.supabaseService = {
  client: supabaseClient,

  async getClasses() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from("classes").select("*").order("id");
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase getClasses Error]:", e);
      return null;
    }
  },

  async getStudents() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from("students").select("*").order("id");
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase getStudents Error]:", e);
      return null;
    }
  },

  async getTeachers() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from("teachers").select("*");
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase getTeachers Error]:", e);
      return null;
    }
  },

  async saveGameScore(categoryKey, studentId, studentName, xp) {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from("game_scores")
        .upsert({
          category_key: categoryKey,
          student_id: studentId,
          student_name: studentName,
          xp: xp,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase saveGameScore Error]:", e);
      return null;
    }
  },

  async saveExamScore(studentId, studentName, quizTitle, score, timeText) {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from("exam_scores")
        .insert([{
          student_id: studentId,
          student_name: studentName,
          quiz_title: quizTitle || "Bài kiểm tra Tuần 1",
          score: score,
          exam_time: timeText,
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase saveExamScore Error]:", e);
      return null;
    }
  }
};
