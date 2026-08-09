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
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // Active Tab View
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

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '⏳ Đang xác thực với Supabase CSDL...', isError: false });

    const res = await authService.loginUser(loginUsername, loginPassword);

    if (res.success) {
      setFeedback({ message: res.message, isError: false });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        if (res.user && (res.user.role === 'admin' || (res.user.username && res.user.username.toLowerCase() === 'lahuong2904@gmail.com'))) {
          setActiveTab('admin-view');
        } else {
          window.location.reload();
        }
      }, 600);
    } else {
      setFeedback({ message: res.message, isError: true });
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
              onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 800 }}
            >
              👶 Học Sinh: {currentUser.name.includes('Admin') ? 'Bé Nam' : currentUser.name}
            </button>

            <button 
              className="btn btn-teacher"
              onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 900 }}
            >
              👩‍🏫 Giáo Viên
            </button>

            <button 
              className="btn btn-admin"
              onClick={() => setActiveTab('admin-view')}
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: 'white', borderRadius: '20px', padding: '8px 16px', border: 'none', fontWeight: 900 }}
            >
              👑 Quản Trị Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container">
        {activeTab === 'admin-view' ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button 
                onClick={() => setActiveTab('student-view')}
                style={{ padding: '8px 16px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 800 }}
              >
                🏠 Quay Lại Trang Chủ
              </button>
            </div>
            <AdminDashboard currentUser={currentUser} />
          </div>
        ) : (
          <div className="student-home-view">
            <h2>Vương Quốc Trò Chơi Toán Học</h2>
            <p>Tương tác vui nhộn, rèn luyện tư duy toán học cùng AI Ong Thông Thái!</p>
          </div>
        )}
      </main>

      {/* Auth Modal Dialog */}
      {isAuthModalOpen && (
        <div className="modal-backdrop active">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setIsAuthModalOpen(false)}>✕</button>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => setAuthMode('login')}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: authMode === 'login' ? '#2563eb' : '#f1f5f9', color: authMode === 'login' ? 'white' : '#475569', fontWeight: 900 }}
              >
                🔑 Đăng Nhập
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: authMode === 'register' ? '#10b981' : '#f1f5f9', color: authMode === 'register' ? 'white' : '#475569', fontWeight: 900 }}
              >
                📝 Đăng Ký
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Tên tài khoản (Username/Email):</label>
                  <input 
                    type="text" 
                    value={loginUsername} 
                    onChange={e => setLoginUsername(e.target.value)} 
                    placeholder="Ví dụ: benam, lahuong2904@gmail.com"
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
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
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {feedback.message && (
                  <div style={{ color: feedback.isError ? '#ef4444' : '#10b981', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
                    {feedback.message}
                  </div>
                )}

                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '20px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 900, fontSize: '1rem' }}>
                  🔑 Đăng Nhập Ngay
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Họ và Tên:</label>
                  <input type="text" value={regFullName} onChange={e => setRegFullName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Tên tài khoản:</label>
                  <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontWeight: 800, display: 'block', marginBottom: '4px' }}>Mật khẩu:</label>
                  <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>

                {feedback.message && (
                  <div style={{ color: feedback.isError ? '#ef4444' : '#10b981', fontWeight: 800, marginBottom: '10px', textAlign: 'center' }}>
                    {feedback.message}
                  </div>
                )}

                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '20px', background: '#10b981', color: 'white', border: 'none', fontWeight: 900 }}>
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
