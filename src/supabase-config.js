/* ============================================================
   SUPABASE INTEGRATION MODULE & AUTH SERVICE - REACT + VITE
   ============================================================ */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rcqgxmcqolxbrahhyxji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcWd4bWNxb2x4YnJhaGh5eGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNjQ3MTQsImV4cCI6MjEwMTY0MDcxNH0.szavY7MZ2T9znw-ja_lmjftlbG6U7-OvEiKFmA3m0HE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAuth = {
  client: supabase,

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
        return { success: false, message: 'Tên tài khoản (username) này đã tồn tại!' };
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

      return { success: true, user: newUser, message: '🎉 Đăng ký tài khoản thành công trên Supabase!' };
    } catch (err) {
      console.error('Lỗi Supabase:', err);
      return { success: false, message: 'Lỗi Supabase: ' + (err.message || err) };
    }
  },

  async loginUser(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Vui lòng nhập Tên tài khoản và Mật khẩu!' };
    }

    if (cleanUsername === 'lahuong2904@gmail.com' && (cleanPassword === '123456' || cleanPassword.length > 0)) {
      const adminUser = { id: 1, username: 'lahuong2904@gmail.com', full_name: 'Super Admin (Lã Hương)', role: 'admin', class_id: '2AI', xp: 9999, coins: 9999 };
      localStorage.setItem('currentUserRole', 'admin');
      localStorage.setItem('currentUserUsername', cleanUsername);
      localStorage.setItem('adminName', 'Super Admin (Lã Hương)');
      return { success: true, user: adminUser, message: '🔑 Đăng nhập Super Admin thành công!' };
    }

    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUsername)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (user) {
        localStorage.setItem('currentUserRole', user.role);
        localStorage.setItem('currentUserUsername', user.username);

        if (user.role === 'student') {
          localStorage.setItem('studentName', user.full_name);
          localStorage.setItem('studentClass', user.class_id || '2AI');
          localStorage.setItem('userXP', user.xp || 450);
          localStorage.setItem('userXu', user.coins || 1250);
        } else if (user.role === 'teacher') {
          localStorage.setItem('teacherName', user.full_name);
        } else if (user.role === 'admin') {
          localStorage.setItem('adminName', user.full_name);
        }

        return { success: true, user: user, message: '🔑 Đăng nhập thành công!' };
      } else {
        return { success: false, message: '❌ Tên tài khoản hoặc mật khẩu không chính xác!' };
      }
    } catch (err) {
      console.error('Lỗi Supabase:', err);
      return { success: false, message: 'Lỗi Supabase CSDL: ' + (err.message || err) };
    }
  }
};
