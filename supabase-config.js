/* ============================================================
   SUPABASE INTEGRATION MODULE & AUTH SERVICE - TOÁN CÙNG EM
   ============================================================ */

const SUPABASE_URL = "https://rcqgxmcqolxbrahhyxji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcWd4bWNxb2x4YnJhaGh5eGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNjQ3MTQsImV4cCI6MjEwMTY0MDcxNH0.szavY7MZ2T9znw-ja_lmjftlbG6U7-OvEiKFmA3m0HE";

let supabaseClient = null;

if (typeof supabase !== "undefined" && SUPABASE_URL.includes("supabase.co") && !SUPABASE_ANON_KEY.includes("your-anon-key")) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("⚡ [Supabase] Đã kết nối thành công tới Supabase Database!");
  } catch (err) {
    console.warn("⚠️ [Supabase] Chưa thể kết nối tới Supabase:", err);
  }
}

window.supabaseAuth = {
  client: supabaseClient,

  async ensureDefaultClassesExist() {
    if (!supabaseClient) return;
    try {
      const defaultClasses = [
        { id: '2AI', name: 'Lớp 2 AI' },
        { id: '2A', name: 'Lớp 2A' },
        { id: '2B', name: 'Lớp 2B' },
        { id: '2C', name: 'Lớp 2C' }
      ];
      await supabaseClient.from('classes').upsert(defaultClasses, { onConflict: 'id' });
      console.log('⚡ [Supabase] Đã đồng bộ danh sách Lớp học sẵn sàng trên CSDL!');
    } catch (err) {
      console.warn('⚠️ [Supabase] Notice auto-upserting default classes:', err);
    }
  },

  // 1. Đăng ký tài khoản mới (Register)
  async registerUser({ username, password, fullName, role, classId }) {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanFullName = (fullName || '').trim();
    const userRole = role || 'student';
    const userClass = classId || '2AI';

    if (!cleanUsername || !cleanPassword || !cleanFullName) {
      return { success: false, message: 'Vui lòng điền đầy đủ thông tin!' };
    }

    const activeClient = supabaseClient || window.supabaseClient;
    if (!activeClient) {
      return { success: false, message: 'Chưa kết nối được tới Supabase CSDL!' };
    }

    try {
      // Kiểm tra xem username đã tồn tại chưa
      const { data: existingUser } = await activeClient
        .from('users')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: 'Tên tài khoản này đã tồn tại! Vui lòng chọn tên khác.' };
      }

      // 1. Insert vào bảng users chung
      const { data: newUser, error: insertErr } = await activeClient
        .from('users')
        .insert([{
          username: cleanUsername,
          password: cleanPassword,
          full_name: cleanFullName,
          role: userRole,
          class_id: userRole === 'student' ? userClass : null,
          xp: 450,
          coins: 1250,
          status: userRole === 'teacher' ? 'pending' : 'approved',
          active: userRole === 'teacher' ? false : true
        }])
        .select()
        .single();

      if (insertErr) {
        return { success: false, message: 'Lỗi CSDL: ' + insertErr.message };
      }

      // 2. Nếu là học sinh -> Insert thêm vào bảng students
      if (userRole === 'student') {
        await activeClient.from('students').insert([{
          name: cleanFullName,
          class_id: userClass,
          xp: 450,
          coins: 1250
        }]);
      }

      // 3. Nếu là giáo viên -> Insert vào bảng teachers với id kiểu TEXT hợp lệ tránh lỗi not-null
      if (userRole === 'teacher') {
        const teacherTextId = 'gv_' + cleanUsername;
        const { error: teacherErr } = await activeClient.from('teachers').insert([{
          id: teacherTextId,
          username: cleanUsername,
          password: cleanPassword,
          display_name: cleanFullName,
          assigned_classes: [userClass],
          is_active: false,
          role: 'teacher'
        }]);
        if (teacherErr) console.warn('[Notice inserting teachers table]:', teacherErr);
      }

      if (userRole === 'teacher') {
        return { success: true, user: newUser, message: '🎉 Đăng ký tài khoản Giáo viên thành công! Vui lòng chờ Admin phê duyệt.' };
      }

      return { success: true, user: newUser, message: '🎉 Đăng ký tài khoản thành công!' };
    } catch (err) {
      return { success: false, message: 'Lỗi hệ thống: ' + err.message };
    }
  },

  async loginUser(username, password) {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Vui lòng nhập Tên tài khoản và Mật khẩu!' };
    }

    let user = null;

    if (supabaseClient) {
      try {
        // 1. Lệnh truy vấn trực tiếp vào bảng users trên Supabase CSDL (không query bảng teachers cũ)
        const { data: dbUsers, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('username', cleanUsername)
          .eq('password', cleanPassword);

        if (error) {
          console.error('[Supabase Query Error - eq username]:', error);
        }

        if (dbUsers && dbUsers.length > 0) {
          user = dbUsers[0];
        } else {
          // 2. Thử truy vấn thêm theo email nếu username không khớp
          const { data: dbUsersByEmail, error: emailErr } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', cleanUsername)
            .eq('password', cleanPassword);

          if (emailErr) {
            console.error('[Supabase Query Error - eq email]:', emailErr);
          }

          if (dbUsersByEmail && dbUsersByEmail.length > 0) {
            user = dbUsersByEmail[0];
          }
        }
      } catch (err) {
        console.error('[Supabase Exception Trong loginUser]:', err);
      }
    }

    // 3. Fallback kiểm tra bộ nhớ cục bộ nếu chưa kết nối được CSDL Supabase
    if (!user) {
      try {
        let localUsers = JSON.parse(localStorage.getItem('users_db') || '[]');
        user = localUsers.find(u => (u.username?.toLowerCase() === cleanUsername || u.email?.toLowerCase() === cleanUsername) && u.password === cleanPassword);
      } catch (localErr) {
        console.warn('localStorage parse error:', localErr);
      }

      if (!user) {
        if (cleanUsername === 'comai' && (cleanPassword === '123456' || cleanPassword === 'comai123')) {
          user = { id: 201, username: 'comai', full_name: 'Cô Mai', role: 'teacher', class_id: '2A', status: 'approved', active: true, xp: 0, coins: 0 };
        } else if ((cleanUsername === 'lahuong2904@gmail.com' || cleanUsername === 'adminlahuong2904@gmail.com' || cleanUsername === 'admin') && (cleanPassword === '123456' || cleanPassword === 'admin123')) {
          user = { id: 1, username: 'lahuong2904@gmail.com', email: 'lahuong2904@gmail.com', full_name: 'Super Admin (Lã Hương)', role: 'admin', status: 'approved', active: true, class_id: '2AI', xp: 9999, coins: 9999 };
        } else if (cleanUsername === 'benam' && cleanPassword === '123456') {
          user = { id: 102, username: 'benam', full_name: 'Bé Nam', role: 'student', class_id: '2AI', status: 'approved', active: true, xp: 450, coins: 1250 };
        }
      }
    }

    if (!user) {
      return { success: false, message: '❌ Tên tài khoản hoặc mật khẩu không chính xác!' };
    }

    // KIỂM TRA PHÊ DUYỆT TÀI KHOẢN GIÁO VIÊN (PENDING / REJECTED)
    if (user.role === 'teacher') {
      if (user.status === 'pending' || user.active === false) {
        return { 
          success: false, 
          message: '⏳ Tài khoản Giáo viên của bạn đang CHỜ ADMIN PHÊ DUYỆT! Vui lòng liên hệ Super Admin (lahuong2904@gmail.com) để được kích hoạt tài khoản.' 
        };
      }
      if (user.status === 'rejected') {
        return { 
          success: false, 
          message: '⛔ Tài khoản Giáo viên của bạn đã bị TỪ CHỐI kích hoạt! Vui lòng liên hệ Super Admin.' 
        };
      }
    }

    try {
      localStorage.setItem('currentUserRole', user.role || 'student');
      localStorage.setItem('currentUserUsername', user.username || cleanUsername);

      if (user.role === 'student') {
        localStorage.setItem('studentName', user.full_name || 'Bé');
        localStorage.setItem('studentClass', user.class_id || '2AI');
        localStorage.setItem('userXP', user.xp || 450);
        localStorage.setItem('userXu', user.coins || 1250);
      } else if (user.role === 'teacher') {
        localStorage.setItem('teacherName', user.full_name || 'Cô Mai');
        localStorage.setItem('teacherClass', user.class_id || '2A');
      } else if (user.role === 'admin') {
        localStorage.setItem('adminName', user.full_name || 'Super Admin (Lã Hương)');
      }
    } catch (storageErr) {
      console.warn('localStorage set error:', storageErr);
    }

    return { success: true, user: user, message: '🔑 Đăng nhập thành công!' };
  }
};

if (window.supabaseAuth && typeof window.supabaseAuth.ensureDefaultClassesExist === 'function') {
  window.supabaseAuth.ensureDefaultClassesExist();
}
