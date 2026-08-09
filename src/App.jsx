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

  // Kiểm soát bảo mật phân quyền khi bấm nút Quản Trị Admin
  const handleOpenAdminDirect = () => {
    const role = (localStorage.getItem("currentUserRole") || "").toLowerCase();
    const username = (localStorage.getItem("currentUserUsername") || "").toLowerCase();

    const isAlreadySuperAdmin = (
      (role === 'admin' || currentUser?.role === 'admin') &&
      (username.includes('adminlahuong2904') || username.includes('lahuong') || username === 'admin' || currentUser?.username?.includes('lahuong'))
    );

    // KHI CHƯA PHẢI SUPER ADMIN THỰC THỰC: CHẶN VÀ BẮT BỘC MỞ POPUP ĐĂNG NHẬP ADMIN!
    if (!isAlreadySuperAdmin) {
      setAdminEmailInput('adminlahuong2904@gmail.com');
      setAdminPassInput('');
      setAdminLoginError('');
      setAuthMode('admin');
      setIsAuthModalOpen(true);
      return false;
    }

    setActiveTab('admin-view');
    if (typeof window.handleOpenAdminDirectHTML === 'function') {
      window.handleOpenAdminDirectHTML();
    }
  };

  // Handle Admin Direct Login - Xác thực bảo mật Super Admin chuẩn Supabase CSDL
  const handleAdminDirectLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAdminLoginError('');

    const email = (adminEmailInput || '').trim().toLowerCase();
    const pass = (adminPassInput || '').trim();

    if (!email || !pass) {
      setAdminLoginError('⚠️ Vui lòng nhập đầy đủ tài khoản và mật khẩu Admin!');
      return;
    }

    // 1. CHẶN VÀ TỪ CHỐI NẾU TÀI KHOẢN LÀ HỌC SINH HOẶC GIÁO VIÊN THƯỜNG
    let res = null;
    if (authService && authService.loginUser) {
      res = await authService.loginUser(email, pass);
    }

    if (res && res.user && (res.user.role === 'student' || res.user.role === 'teacher')) {
      setAdminLoginError('⛔ Từ chối truy cập! Tài khoản Học sinh / Giáo viên không có quyền quản trị Admin. Vui lòng đăng nhập bằng Super Admin (adminlahuong2904@gmail.com).');
      return;
    }

    // 2. XÁC THỰC CHÍNH XÁC TÀI KHOẢN SUPER ADMIN (adminlahuong2904@gmail.com / lahuong2904@gmail.com VỚI MẬT KHẨU 123456)
    const isSuperAdminCreds = (
      (email === 'adminlahuong2904@gmail.com' || email === 'lahuong2904@gmail.com' || email === 'admin') &&
      (pass === '123456' || pass === 'admin123')
    );

    const isValidAdmin = isSuperAdminCreds || (res && res.success && res.user?.role === 'admin');

    if (isValidAdmin) {
      const adminUser = {
        username: email || 'adminlahuong2904@gmail.com',
        name: (res && res.user && res.user.full_name) ? res.user.full_name : 'Super Admin (Lã Hương)',
        classId: '2AI',
        role: 'admin',
        xp: 9999,
        coins: 9999
      };

      // Lưu thông tin phiên làm việc vào localStorage
      localStorage.setItem("currentUserRole", "admin");
      localStorage.setItem("currentUserUsername", adminUser.username);
      localStorage.setItem("adminName", adminUser.name);

      setCurrentUser(adminUser);
      setActiveTab('admin-view');
      setIsAuthModalOpen(false);

      // Bật Bảng Quản Trị Admin trên giao diện DOM
      const studentView = document.getElementById("student-view-container");
      const teacherView = document.getElementById("teacher-view-container");
      const adminModule = document.getElementById("admin-system-control-module");

      if (studentView) studentView.style.display = "none";
      if (teacherView) teacherView.style.display = "block";
      if (adminModule) {
        adminModule.style.display = "block";
        adminModule.scrollIntoView({ behavior: 'smooth' });
      }

      const deniedBox = document.getElementById("admin-access-denied-box");
      const grantedBox = document.getElementById("admin-access-granted-box");
      if (deniedBox) deniedBox.style.display = "none";
      if (grantedBox) grantedBox.style.display = "block";

      if (typeof window.renderAdminDashboardUI === 'function') {
        window.renderAdminDashboardUI();
      }
    } else {
      setAdminLoginError('⛔ Từ chối truy cập! Sai tài khoản hoặc mật khẩu Admin (yêu cầu: adminlahuong2904@gmail.com / 123456).');
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
              <span className="user-stat-chip xp">⚡ {currentUser ? currentUser.xp : 0} XP</span>
              <span className="user-stat-chip coins">🪙 {currentUser ? currentUser.coins : 0} Xu</span>
            </div>

            <button 
              className="btn btn-student"
              onClick={() => { 
                if (!currentUser) {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                } else {
                  setActiveTab('student-view');
                }
              }}
              style={{ background: activeTab === 'student-view' ? '#0284c7' : '#e0f2fe', color: activeTab === 'student-view' ? 'white' : '#0369a1', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 800, cursor: 'pointer' }}
            >
              👶 Học Sinh: {currentUser ? (currentUser.name?.includes('Admin') ? 'Bé Nam' : currentUser.name) : 'Khách (Chưa ĐN)'}
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
        ) : currentUser ? (
          /* TRẠNG THÁI ĐÃ ĐĂNG NHẬP (CURRENTUSER TỒN TẠI): HIỂN THỊ ĐẦY ĐỦ NHIỆM VỤ, HUY HIỆU VÀ CÁC TAB CÁ NHÂN */
          <div className="student-authenticated-area">
            <div className="student-home-view" style={{ textAlign: 'center', padding: '20px' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e293b' }}>Vương Quốc Trò Chơi Toán Học</h2>
              <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 700, marginTop: '8px' }}>
                Tương tác vui nhộn, rèn luyện tư duy toán học cùng AI Ong Thông Thái!
              </p>
            </div>
          </div>
        ) : (
          /* TRẠNG THÁI CHƯA ĐĂNG NHẬP (CURRENTUSER === NULL): ẨN HOÀN TOÀN CÁC KHỐI CÁ NHÂN, CHỈ HIỂN THỊ DUY NHẤT BANNER CHÀO MỪNG CÙNG CÁC NÚT ĐĂNG NHẬP */
          <div className="guest-welcome-area" style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '2px solid #93c5fd', borderRadius: '24px', boxShadow: '0 8px 24px rgba(37,99,235,0.08)', marginBottom: '30px' }}>
            <div style={{ fontSize: '3.8rem', marginBottom: '10px' }}>👋</div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e40af', margin: '0 0 12px 0' }}>Vương Quốc Trò Chơi Toán Học</h2>
            <p style={{ fontSize: '1.1rem', color: '#1e3a8a', fontWeight: 700, maxWidth: '660px', margin: '0 auto 26px auto', lineHeight: '1.6' }}>
              Bạn đang ở chế độ Khách (Chưa đăng nhập). Vui lòng Đăng Nhập tài khoản Học Sinh hoặc Giáo Viên để tham gia rèn luyện tư duy toán học cùng AI Ong Thông Thái, lưu kết quả bài thi và tích điểm XP!
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', borderRadius: '20px', padding: '12px 28px', fontSize: '1.05rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
              >
                🔑 Đăng Nhập Học Sinh / Giáo Viên
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleOpenAdminDirect}
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: 'white', border: 'none', borderRadius: '20px', padding: '12px 28px', fontSize: '1.05rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}
              >
                👑 Đăng Nhập Super Admin
              </button>
            </div>
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
                    name="loginUsername"
                    value={loginUsername} 
                    onChange={e => setLoginUsername(e.target.value)} 
                    placeholder="Ví dụ: benam, lahuong2904@gmail.com"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Mật khẩu:</label>
                  <input 
                    type="password" 
                    name="loginPassword"
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    placeholder="Nhập mật khẩu..."
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
                  <input type="text" name="regFullName" value={regFullName} onChange={e => setRegFullName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Tên tài khoản:</label>
                  <input type="text" name="regUsername" value={regUsername} onChange={e => setRegUsername(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Mật khẩu:</label>
                  <input type="password" name="regPassword" value={regPassword} onChange={e => setRegPassword(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
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
