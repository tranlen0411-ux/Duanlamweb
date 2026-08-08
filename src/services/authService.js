import { supabase } from './supabaseClient';

export const authService = {
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

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: 'Tên tài khoản (username) này đã tồn tại! Vui lòng chọn tên khác.' };
      }

      const { data: newUser, error: insertErr } = await supabase
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
        await supabase.from('students').insert([{
          name: cleanFullName,
          class_id: userClass,
          xp: 450,
          coins: 1250
        }]);
      }

      return { success: true, user: newUser, message: '🎉 Đăng ký tài khoản mới thành công trên Supabase CSDL!' };
    } catch (err) {
      console.error('Lỗi khi đăng ký Supabase:', err);
      return { success: false, message: 'Lỗi Supabase: ' + (err.message || err) };
    }
  },

  // 2. Đăng nhập tài khoản (Login)
  async loginUser(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Vui lòng nhập Tên tài khoản và Mật khẩu!' };
    }

    try {
      const { data: user, error } = await supabase
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
      } else {
        return { success: false, message: '❌ Tên tài khoản hoặc mật khẩu không chính xác trên CSDL Supabase!' };
      }
    } catch (err) {
      console.error('Lỗi khi đăng nhập Supabase:', err);
      return { success: false, message: 'Lỗi kết nối Supabase CSDL: ' + (err.message || err) };
    }
  }
};
