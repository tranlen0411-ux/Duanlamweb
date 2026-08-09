import React, { useState, useEffect } from 'react';
import { supabaseService } from './services/supabaseClient';
import { authService } from './services/authService';
import AdminDashboard from './features/admin/AdminDashboard';
import { dbStore } from './db-store';
import { APP_CONFIG } from './config';

export default function App() {
  // Session State
  const [currentUser, setCurrentUser] = useState({
    username: localStorage.getItem('currentUserUsername') || '',
    name: localStorage.getItem('studentName') || 'Bé Nam',
    classId: localStorage.getItem('studentClass') || '2AI',
    role: localStorage.getItem('currentUserRole') || 'student',
    xp: parseInt(localStorage.getItem('userXP') || '450', 10),
    coins: parseInt(localStorage.getItem('userXu') || '1250', 10)
  });

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'admin'
  const [activeTab, setActiveTab] = useState('student-view'); // 'student-view' | 'teacher-view' | 'admin-view'

  // Form Inputs State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [regClass, setRegClass] = useState('2AI');
  const [feedback, setFeedback] = useState({ message: '', isError: false });

  // Admin Quick Login Inputs
  const [adminEmailInput, setAdminEmailInput] = useState('lahuong2904@gmail.com');
  const [adminPassInput, setAdminPassInput] = useState('123456');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Class Selection
  const [selectedClass, setSelectedClass] = useState('2AI');

  // Supabase Data State
  const [dbStudents, setDbStudents] = useState([]);
  const [dbClasses, setDbClasses] = useState([]);

  // Load Data from Supabase on Mount
  useEffect(() => {
    async function loadSupabaseData() {
      const classesData = await supabaseService.getClasses();
      if (classesData) setDbClasses(classesData);

      const studentsData = await supabaseService.getStudents();
      if (studentsData) setDbStudents(studentsData);
    }
    loadSupabaseData();
  }, []);

  const isSuperAdmin = currentUser && (
    currentUser.username?.toLowerCase() === 'lahuong2904@gmail.com' ||
    currentUser.role === 'admin'
  );

  // Kiểm tra quyền truy cập Admin khi click nút
  const handleOpenAdminDirect = () => {
    const ADMIN_EMAIL = 'lahuong2904@gmail.com';
    const role = (localStorage.getItem("currentUserRole") || "").toLowerCase();
    const username = (localStorage.getItem("currentUserUsername") || "").toLowerCase();

    const isUserAdmin = (
      role === 'admin' ||
      username === ADMIN_EMAIL ||
      (currentUser && (currentUser.role === 'admin' || currentUser.username?.toLowerCase() === ADMIN_EMAIL))
    );

    // KHI KHÔNG PHẢI SUPER ADMIN: CHẶN LẠI VÀ BẬT BẢNG ĐĂNG NHẬP ADMIN!
    if (!isUserAdmin) {
      console.warn("⛔ Chặn truy cập Admin - Yêu cầu xác thực Super Admin!");
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return false;
    }

    setActiveTab('admin-view');
  };

  // Hàm Đăng Xuất chung cho tất cả phân quyền (Xóa sạch phiên currentUser = null về dạng Khách)
  const handleGlobalLogout = () => {
    console.log('Global Logout Executed - Resetting to Guest State');

    // 1. Xóa sạch toàn bộ các key trong localStorage liên quan đến phiên làm việc
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserRole");
    localStorage.removeItem("currentUserUsername");
    localStorage.removeItem("adminName");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentClassId");
    localStorage.removeItem("userToken");
    localStorage.setItem("currentUserRole", "guest");

    // 2. Set currentUser = null và đưa ứng dụng về trạng thái trang chủ Khách
    setCurrentUser(null);

    // 3. Đóng mọi modal đang mở
    setIsAuthModalOpen(false);

    // 4. Reset activeTab về trang chủ mặc định
    setActiveTab('student-view');

    // 5. Đồng bộ giao diện HTML và gỡ bỏ quyền
    if (typeof window.handleGlobalLogoutHTML === 'function') {
      window.handleGlobalLogoutHTML();
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '⏳ Đang xác thực với Supabase CSDL...', isError: false });

    const res = await authService.loginUser(loginUsername, loginPassword);

    if (res.success) {
      setFeedback({ message: res.message, isError: false });
      setCurrentUser({
        username: res.user.username,
        name: res.user.full_name || 'Bé Nam',
        classId: res.user.class_id || '2AI',
        role: res.user.role || 'student',
        xp: res.user.xp || 450,
        coins: res.user.coins || 1250
      });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        if (res.user.role === 'admin' || res.user.username?.toLowerCase() === 'lahuong2904@gmail.com') {
          setActiveTab('admin-view');
        }
      }, 600);
    } else {
      setFeedback({ message: res.message, isError: true });
    }
  };

  // Handle Admin Direct Login
  const handleAdminDirectLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');

    const res = await authService.loginUser(adminEmailInput, adminPassInput);
    if (res.success && (res.user.role === 'admin' || res.user.username?.toLowerCase() === 'lahuong2904@gmail.com')) {
      setCurrentUser({
        username: res.user.username,
        name: res.user.full_name || 'Super Admin (Lã Hương)',
        classId: '2AI',
        role: 'admin',
        xp: 9999,
        coins: 9999
      });
      setActiveTab('admin-view');
    } else {
      setAdminLoginError('❌ Mật khẩu hoặc tài khoản Admin chưa chính xác!');
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '⏳ Đang tạo tài khoản mới...', isError: false });

    const res = await authService.registerUser({
      username: regUsername,
      password: regPassword,
      fullName: regFullName,
      role: regRole,
      classId: regClass
    });

    if (res.success) {
      setFeedback({ message: res.message, isError: false });
      setTimeout(() => {
        setAuthMode('login');
        setLoginUsername(regUsername);
        setLoginPassword(regPassword);
      }, 800);
    } else {
      setFeedback({ message: res.message, isError: true });
    }
  };

  return (
    <div className="app-main-wrapper">
      {/* Header Navigation */}
      <header className="app-header">
        <div className="navbar">
          <div className="brand-logo">
            <span className="logo-icon">🐝</span>
            <h1 className="logo-text">Toán Cùng Em</h1>
          </div>

          <div className="header-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="starburst-badge">Lớp {selectedClass} AI</span>
            
            <div className="user-profile-pill">
              <span className="user-stat-chip xp">⚡ {currentUser.xp} XP</span>
              <span className="user-stat-chip coins">🪙 {currentUser.coins} Xu</span>
            </div>

            <button 
              className="btn btn-student"
              onClick={() => { setActiveTab('student-view'); }}
              style={{ background: activeTab === 'student-view' ? '#0284c7' : '#e0f2fe', color: activeTab === 'student-view' ? 'white' : '#0369a1', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 800, cursor: 'pointer' }}
            >
              👶 Học Sinh: {currentUser.name.includes('Admin') ? 'Bé Nam' : currentUser.name}
            </button>

            <button 
              className="btn btn-teacher"
              onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 900, cursor: 'pointer' }}
            >
              👩‍🏫 Giáo Viên
            </button>

            <button 
              className="btn btn-admin"
              onClick={handleOpenAdminDirect}
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: 'white', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 900, cursor: 'pointer' }}
            >
              👑 Quản Trị Admin
            </button>

            <button 
              className="btn btn-logout-global"
              onClick={handleGlobalLogout}
              title="Đăng xuất khỏi hệ thống"
              style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: 'white', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: '0 3px 8px rgba(239, 68, 68, 0.4)' }}
            >
              🚪 Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container" style={{ padding: '20px' }}>
        {activeTab === 'admin-view' ? (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveTab('student-view')}
                style={{ padding: '10px 20px', borderRadius: '14px', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 900, color: '#475569' }}
              >
                🏠 Quay Lại Trang Chủ
              </button>
            </div>

            <AdminDashboard currentUser={{ username: 'lahuong2904@gmail.com', role: 'admin', name: 'Super Admin (Lã Hương)' }} />
          </div>
        ) : (
          <div className="student-home-view" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e293b' }}>Vương Quốc Trò Chơi Toán Học</h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 700, marginTop: '8px' }}>Tương tác vui nhộn, rèn luyện tư duy toán học cùng AI Ong Thông Thái!</p>
          </div>
        )}
      </main>

      {/* Auth Modal Dialog */}
      {isAuthModalOpen && (
        <div className="modal-backdrop active" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-card" style={{ background: 'white', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <button className="modal-close" onClick={() => setIsAuthModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => setAuthMode('login')}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: authMode === 'login' ? '#2563eb' : '#f1f5f9', color: authMode === 'login' ? 'white' : '#475569', fontWeight: 900, cursor: 'pointer' }}
              >
                🔑 Đăng Nhập
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: authMode === 'register' ? '#10b981' : '#f1f5f9', color: authMode === 'register' ? 'white' : '#475569', fontWeight: 900, cursor: 'pointer' }}
              >
                📝 Đăng Ký
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Tên tài khoản:</label>
                  <input 
                    type="text" 
                    value={loginUsername} 
                    onChange={e => setLoginUsername(e.target.value)} 
                    placeholder="Ví dụ: benam, lahuong2904@gmail.com"
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Mật khẩu:</label>
                  <input 
                    type="password" 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    placeholder="Nhập mật khẩu..."
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                {feedback.message && (
                  <div style={{ color: feedback.isError ? '#ef4444' : '#10b981', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
                    {feedback.message}
                  </div>
                )}

                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '20px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }}>
                  🔑 Đăng Nhập Ngay
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Họ và Tên:</label>
                  <input type="text" value={regFullName} onChange={e => setRegFullName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Tên tài khoản:</label>
                  <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Mật khẩu:</label>
                  <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                {feedback.message && (
                  <div style={{ color: feedback.isError ? '#ef4444' : '#10b981', fontWeight: 800, marginBottom: '10px', textAlign: 'center' }}>
                    {feedback.message}
                  </div>
                )}

                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '20px', background: '#10b981', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }}>
                  📝 Đăng Ký Tài Khoản
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
