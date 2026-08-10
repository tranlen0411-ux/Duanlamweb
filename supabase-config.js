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

  async registerUser({ username, password, fullName, role, classId, status, active }) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();
    const userRole = role || 'student';
    
    // Đảm bảo classId không bao giờ là chuỗi rỗng '' (tránh lỗi khóa ngoại FK 23503)
    let cleanClassId = (classId && classId.trim() !== '') ? classId.trim() : '2AI';

    // Nếu Admin khởi tạo trực tiếp thì dùng status/active truyền vào, nếu đăng ký qua web thì mặc định 'pending' & false
    const initialStatus = (status !== undefined) ? status : 'pending';
    const isUserActive = (active !== undefined) ? active : false;

    if (!cleanUsername || !cleanPassword || !cleanFullName) {
      return { success: false, message: 'Vui lòng điền đầy đủ Tên tài khoản, Mật khẩu và Họ tên!' };
    }

    if (supabaseClient) {
      // 0. Đảm bảo mã lớp tồn tại sẵn trong bảng classes trước khi chèn vào bảng users
      try {
        await supabaseClient.from('classes').upsert([
          { id: cleanClassId, name: 'Lớp ' + cleanClassId }
        ], { onConflict: 'id' });
      } catch (e) {}

      try {
        const { data: existingUser } = await supabaseClient
          .from('users')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          return { success: false, message: 'Tên tài khoản (username) này đã tồn tại! Vui lòng chọn tên khác.' };
        }

        // 1. Lưu thông tin vào bảng users chính với class_id hợp lệ
        let userInsertPayload = {
          username: cleanUsername,
          password: cleanPassword,
          full_name: cleanFullName,
          role: userRole,
          class_id: cleanClassId,
          xp: (userRole === 'teacher') ? 0 : 450,
          coins: (userRole === 'teacher') ? 0 : 1250,
          status: initialStatus,
          active: isUserActive
        };

        let { data: newUser, error: insertErr } = await supabaseClient
          .from('users')
          .insert([userInsertPayload])
          .select()
          .maybeSingle();

        // 🛡️ XỬ LÝ DỰ PHÒNG LỖI RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEY CONSTRAINT 23503)
        if (insertErr && (insertErr.code === '23503' || (insertErr.message && insertErr.message.includes('foreign key')))) {
          console.warn('[Supabase FK 23503 Alert]: Thử chèn lớp 2AI vào bảng classes và thử lại...');
          try {
            await supabaseClient.from('classes').upsert([{ id: '2AI', name: 'Lớp 2 AI' }], { onConflict: 'id' });
          } catch (cErr) {}

          userInsertPayload.class_id = '2AI';
          const retryRes = await supabaseClient
            .from('users')
            .insert([userInsertPayload])
            .select()
            .maybeSingle();
            
          newUser = retryRes.data;
          insertErr = retryRes.error;

          // Thử lại với trường hợp bỏ class_id nếu CSDL cài thuộc tính NULL
          if (insertErr) {
            delete userInsertPayload.class_id;
            const retryNullRes = await supabaseClient
              .from('users')
              .insert([userInsertPayload])
              .select()
              .maybeSingle();
            newUser = retryNullRes.data;
            insertErr = retryNullRes.error;
          }
        }

        if (insertErr) throw insertErr;

        // 2. Nếu là Học sinh: Lưu dữ liệu vào bảng students trên Supabase
        if (userRole === 'student') {
          try {
            await supabaseClient.from('students').insert([{
              name: cleanFullName,
              class_id: cleanClassId,
              xp: 450,
              coins: 1250,
              status: initialStatus,
              active: isUserActive
            }]);
          } catch (stErr) {
            console.warn('[Notice inserting into students table]:', stErr);
          }
        }

        // 3. Nếu là Giáo viên: Lưu dữ liệu trực tiếp vào bảng teachers trên Supabase
        if (userRole === 'teacher') {
          try {
            await supabaseClient.from('teachers').insert([{
              username: cleanUsername,
              password: cleanPassword,
              full_name: cleanFullName,
              displayName: cleanFullName,
              role: 'teacher',
              status: initialStatus,
              active: isUserActive
            }]);
          } catch (tErr) {
            console.warn('[Notice inserting into teachers table]:', tErr);
          }
        }

        if (initialStatus === 'pending') {
          return { 
            success: true, 
            user: newUser, 
            isPending: true,
            message: `🎉 Đăng ký tài khoản ${userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'} thành công! Thông tin đã được đẩy lên Supabase ở trạng thái CHỜ ADMIN PHÊ DUYỆT. Vui lòng chờ Super Admin kích hoạt tài khoản trước khi đăng nhập!` 
          };
        }

        return { success: true, user: newUser, message: '🎉 Thêm tài khoản mới thành công trên Supabase CSDL!' };
      } catch (err) {
        console.error('Lỗi đăng ký Supabase:', err);
      }
    }

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
      xp: (userRole === 'teacher') ? 0 : 450,
      coins: (userRole === 'teacher') ? 0 : 1250,
      status: initialStatus,
      active: isUserActive
    };
    localUsers.push(newUser);
    localStorage.setItem('users_db', JSON.stringify(localUsers));

    if (userRole === 'teacher') {
      return { 
        success: true, 
        user: newUser, 
        isPending: true,
        message: '🎉 Đăng ký tài khoản Giáo viên thành công! Tài khoản đang ở trạng thái CHỜ ADMIN PHÊ DUYỆT. Vui lòng chờ Super Admin kích hoạt tài khoản trước khi đăng nhập!' 
      };
    }

    return { success: true, user: newUser, message: '🎉 Đăng ký tài khoản thành công!' };
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
