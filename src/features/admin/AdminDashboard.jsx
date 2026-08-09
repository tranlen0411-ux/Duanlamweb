import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function AdminDashboard({ currentUser }) {
  const ADMIN_EMAIL = 'lahuong2904@gmail.com';

  // Check if current user is the super admin lahuong2904@gmail.com
  const isSuperAdmin = currentUser && (
    currentUser.username?.toLowerCase() === ADMIN_EMAIL ||
    currentUser.email?.toLowerCase() === ADMIN_EMAIL ||
    currentUser.name?.toLowerCase() === ADMIN_EMAIL ||
    localStorage.getItem('currentUserUsername')?.toLowerCase() === ADMIN_EMAIL
  );

  // Tab State
  const [adminTab, setAdminTab] = useState('users'); // 'users' | 'classes' | 'students' | 'scores' | 'anticheat'

  // Data States
  const [usersList, setUsersList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [examScoresList, setExamScoresList] = useState([]);
  const [antiCheatLogs, setAntiCheatLogs] = useState([]);

  // Form Modals / Editing States
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student', class_id: '2AI' });
  const [newClass, setNewClass] = useState({ id: '', name: '' });
  const [message, setMessage] = useState('');

  // Load all database tables from Supabase
  const loadAdminData = async () => {
    try {
      // 1. Load users
      const { data: usersData } = await supabase.from('users').select('*').order('id');
      if (usersData) setUsersList(usersData);

      // 2. Load classes
      const { data: classesData } = await supabase.from('classes').select('*').order('id');
      if (classesData) setClassesList(classesData);

      // 3. Load students
      const { data: studentsData } = await supabase.from('students').select('*').order('id');
      if (studentsData) setStudentsList(studentsData);

      // 4. Load exam scores
      const { data: scoresData } = await supabase.from('exam_scores').select('*').order('id', { ascending: false });
      if (scoresData) setExamScoresList(scoresData);

      // 5. Load anti cheat logs
      const { data: logsData } = await supabase.from('anti_cheat_logs').select('*').order('id', { ascending: false });
      if (logsData) setAntiCheatLogs(logsData || []);
    } catch (err) {
      console.warn('Load Admin Data Warning:', err);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdminData();
    }
  }, [isSuperAdmin]);

  // 🔒 ACCESS DENIED GUARD
  if (!isSuperAdmin) {
    return (
      <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '24px', padding: '40px 24px', textAlign: 'center', margin: '40px auto', maxWidth: '650px', boxShadow: '0 10px 25px rgba(239,68,68,0.15)' }}>
        <span style={{ fontSize: '4rem' }}>🔒</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626', margin: '16px 0 8px 0' }}>BẢO MẬT: KHÔNG CÓ QUYỀN TRUY CẬP</h2>
        <p style={{ color: '#991b1b', fontSize: '1rem', fontWeight: 700, lineHeight: 1.6 }}>
          Chỉ tài khoản Quản trị viên <strong>lahuong2904@gmail.com</strong> mới được phép vào Trung Tâm Quản Lý Admin!
        </p>
        <div style={{ background: 'white', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '14px', marginTop: '20px', fontSize: '0.9rem', color: '#b91c1c', fontWeight: 800 }}>
          💡 Vui lòng đăng nhập với Username: <u>lahuong2904@gmail.com</u> (Mật khẩu: 123456)
        </div>
      </div>
    );
  }

  // --- ADMIN ACTIONS ---

  // 1. Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.full_name) return;
    const { error } = await supabase.from('users').insert([{
      username: newUser.username.trim().toLowerCase(),
      password: newUser.password.trim(),
      full_name: newUser.full_name.trim(),
      role: newUser.role,
      class_id: newUser.class_id,
      xp: 450,
      coins: 1250
    }]);
    if (!error) {
      setMessage('✅ Đã thêm người dùng mới vào Supabase CSDL!');
      setNewUser({ username: '', password: '', full_name: '', role: 'student', class_id: '2AI' });
      loadAdminData();
    } else {
      setMessage('❌ Lỗi: ' + error.message);
    }
  };

  // 2. Delete User
  const handleDeleteUser = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này khỏi Supabase CSDL?')) {
      await supabase.from('users').delete().eq('id', id);
      setMessage('🗑️ Đã xóa tài khoản!');
      loadAdminData();
    }
  };

  // 3. Add Class
  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.id || !newClass.name) return;
    const { error } = await supabase.from('classes').insert([{
      id: newClass.id.trim(),
      name: newClass.name.trim()
    }]);
    if (!error) {
      setMessage('✅ Đã tạo Lớp Học mới!');
      setNewClass({ id: '', name: '' });
      loadAdminData();
    } else {
      setMessage('❌ Lỗi: ' + error.message);
    }
  };

  // 4. Delete Class
  const handleDeleteClass = async (id) => {
    if (window.confirm('Xóa lớp học này khỏi Supabase?')) {
      await supabase.from('classes').delete().eq('id', id);
      setMessage('🗑️ Đã xóa lớp học!');
      loadAdminData();
    }
  };

  // 5. Update Student Points
  const handleUpdateStudentXP = async (id, currentXp) => {
    const newXpStr = window.prompt('Nhập số điểm XP mới cho Học Sinh:', currentXp);
    if (newXpStr !== null) {
      const newXp = parseInt(newXpStr, 10);
      if (!isNaN(newXp)) {
        await supabase.from('students').update({ xp: newXp }).eq('id', id);
        setMessage('⚡ Đã cập nhật XP Học sinh!');
        loadAdminData();
      }
    }
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #cbd5e1', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginTop: '24px' }}>
      
      {/* Header Admin */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2.4rem' }}>👑</span>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Trung Tâm Quản Trị Hệ Thống (Super Admin)</h2>
              <span style={{ fontSize: '0.88rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '12px', fontWeight: 800 }}>
                Quyền Hạn Cao Cấp: lahuong2904@gmail.com
              </span>
            </div>
          </div>
        </div>

        <button onClick={loadAdminData} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>
          🔄 Tải Bật Dữ Liệu Live
        </button>
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Admin Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setAdminTab('users')}
          style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', background: adminTab === 'users' ? '#2563eb' : '#f1f5f9', color: adminTab === 'users' ? 'white' : '#475569' }}
        >
          👥 Người Dùng ({usersList.length})
        </button>

        <button 
          onClick={() => setAdminTab('classes')}
          style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', background: adminTab === 'classes' ? '#2563eb' : '#f1f5f9', color: adminTab === 'classes' ? 'white' : '#475569' }}
        >
          🏫 Lớp Học ({classesList.length})
        </button>

        <button 
          onClick={() => setAdminTab('students')}
          style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', background: adminTab === 'students' ? '#2563eb' : '#f1f5f9', color: adminTab === 'students' ? 'white' : '#475569' }}
        >
          👶 Học Sinh ({studentsList.length})
        </button>

        <button 
          onClick={() => setAdminTab('scores')}
          style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', background: adminTab === 'scores' ? '#2563eb' : '#f1f5f9', color: adminTab === 'scores' ? 'white' : '#475569' }}
        >
          📝 Bài Thi Tuần ({examScoresList.length})
        </button>

        <button 
          onClick={() => setAdminTab('anticheat')}
          style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', background: adminTab === 'anticheat' ? '#dc2626' : '#f1f5f9', color: adminTab === 'anticheat' ? 'white' : '#475569' }}
        >
          🛡️ Nhật Ký Anti-Cheat ({antiCheatLogs.length})
        </button>
      </div>

      {/* --- TAB 1: USERS MANAGEMENT --- */}
      {adminTab === 'users' && (
        <div>
          <form onSubmit={handleAddUser} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Username (email...)" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} required style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1 }} />
            <input type="password" placeholder="Mật khẩu" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1 }} />
            <input type="text" placeholder="Họ và tên" value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} required style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1 }} />
            <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <option value="student">Học Sinh</option>
              <option value="teacher">Giáo Viên</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer' }}>➕ Thêm Tài Khoản</button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Tài Khoản</th>
                <th style={{ padding: '10px' }}>Họ Tên</th>
                <th style={{ padding: '10px' }}>Vai Trò</th>
                <th style={{ padding: '10px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}>{u.id}</td>
                  <td style={{ padding: '10px', fontWeight: 800 }}>{u.username}</td>
                  <td style={{ padding: '10px' }}>{u.full_name}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, background: u.role === 'admin' ? '#fef3c7' : u.role === 'teacher' ? '#f3e8ff' : '#e0f2fe', color: u.role === 'admin' ? '#d97706' : u.role === 'teacher' ? '#7e22ce' : '#0369a1' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleDeleteUser(u.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>🗑️ Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 2: CLASSES MANAGEMENT --- */}
      {adminTab === 'classes' && (
        <div>
          <form onSubmit={handleAddClass} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Mã Lớp (VD: 2A, 2B, 2D...)" value={newClass.id} onChange={(e) => setNewClass({...newClass, id: e.target.value})} required style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', width: '160px' }} />
            <input type="text" placeholder="Tên Hiển Thị (VD: Lớp 2D)" value={newClass.name} onChange={(e) => setNewClass({...newClass, name: e.target.value})} required style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1 }} />
            <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer' }}>➕ Thêm Lớp Mới</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {classesList.map((c) => (
              <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{c.name}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mã: {c.id}</span>
                </div>
                <button onClick={() => handleDeleteClass(c.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: STUDENTS MANAGEMENT --- */}
      {adminTab === 'students' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Họ Tên Học Sinh</th>
              <th style={{ padding: '10px' }}>Lớp</th>
              <th style={{ padding: '10px' }}>Điểm XP</th>
              <th style={{ padding: '10px' }}>Số Xu</th>
              <th style={{ padding: '10px' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {studentsList.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px' }}>{s.id}</td>
                <td style={{ padding: '10px', fontWeight: 800 }}>{s.name}</td>
                <td style={{ padding: '10px' }}>{s.class_id || '2AI'}</td>
                <td style={{ padding: '10px', fontWeight: 900, color: '#16a34a' }}>⚡ {s.xp || 450} XP</td>
                <td style={{ padding: '10px', fontWeight: 900, color: '#c2410c' }}>⭐ {s.coins || 1250} Xu</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleUpdateStudentXP(s.id, s.xp || 450)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>✏️ Sửa Điểm</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- TAB 4: EXAM SCORES MANAGEMENT --- */}
      {adminTab === 'scores' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Học Sinh</th>
              <th style={{ padding: '10px' }}>Bài Thi</th>
              <th style={{ padding: '10px' }}>Điểm Số</th>
              <th style={{ padding: '10px' }}>Thời Gian</th>
              <th style={{ padding: '10px' }}>Nhận Xét Giáo Viên</th>
            </tr>
          </thead>
          <tbody>
            {examScoresList.map((sc) => (
              <tr key={sc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', fontWeight: 800 }}>{sc.student_name}</td>
                <td style={{ padding: '10px' }}>{sc.quiz_title || 'Bài thi tuần 1'}</td>
                <td style={{ padding: '10px', fontWeight: 900, color: '#2563eb' }}>{sc.score}</td>
                <td style={{ padding: '10px' }}>{sc.exam_time || '10 phút'}</td>
                <td style={{ padding: '10px', fontStyle: 'italic', color: '#475569' }}>{sc.teacher_comment || 'Chưa có nhận xét'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- TAB 5: ANTI-CHEAT LOGS --- */}
      {adminTab === 'anticheat' && (
        <div>
          {antiCheatLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#16a34a', fontWeight: 800 }}>
              ✅ Không có nhật ký vi phạm gian lận nào! Học sinh làm bài rất nghiêm túc.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fef2f2', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Học Sinh</th>
                  <th style={{ padding: '10px' }}>Sự Cố</th>
                  <th style={{ padding: '10px' }}>Chi Tiết Cảnh Báo</th>
                  <th style={{ padding: '10px' }}>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {antiCheatLogs.map((lg) => (
                  <tr key={lg.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                    <td style={{ padding: '10px' }}>{lg.id}</td>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#dc2626' }}>{lg.student_name}</td>
                    <td style={{ padding: '10px' }}>{lg.event_type}</td>
                    <td style={{ padding: '10px' }}>{lg.event_message}</td>
                    <td style={{ padding: '10px' }}>{new Date(lg.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}
