import React, { useState, useEffect } from 'react';
import { supabaseService } from './services/supabaseClient';
import { authService } from './services/authService';

export default function App() {
  // Session State
  const [currentUser, setCurrentUser] = useState({
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
  const [activeTab, setActiveTab] = useState('student-view'); // 'student-view' | 'teacher-view'

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
      setCurrentUser({
        name: res.user.full_name,
        classId: res.user.class_id || '2AI',
        role: res.user.role || 'student',
        xp: res.user.xp || 450,
        coins: res.user.coins || 1250
      });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        if (res.user.role === 'teacher' || res.user.role === 'admin') {
          setActiveTab('teacher-view');
        } else {
          setActiveTab('student-view');
        }
      }, 600);
    } else {
      setFeedback({ message: res.message, isError: true });
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '⏳ Đang khởi tạo tài khoản trên Supabase CSDL...', isError: false });

    const res = await authService.registerUser({
      username: regUsername,
      password: regPassword,
      fullName: regFullName,
      role: regRole,
      classId: regClass
    });

    if (res.success) {
      setFeedback({ message: res.message, isError: false });
      setTimeout(async () => {
        await authService.loginUser(regUsername, regPassword);
        setCurrentUser({
          name: regFullName,
          classId: regClass,
          role: regRole,
          xp: 450,
          coins: 1250
        });
        setIsAuthModalOpen(false);
      }, 800);
    } else {
      setFeedback({ message: res.message, isError: true });
    }
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* 1. APP HEADER NAVBAR */}
      <header style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0', padding: '12px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Class Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🐝</span>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              <span style={{ color: '#f43f5e' }}>Toán </span>
              <span style={{ color: '#3b82f6' }}>Cùng </span>
              <span style={{ color: '#10b981' }}>Em</span>
            </div>
            
            <div style={{ background: '#fef08a', border: '1px solid #fde047', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎓</span>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ background: 'transparent', border: 'none', fontWeight: 800, color: '#854d0e', outline: 'none', cursor: 'pointer' }}
              >
                <option value="2AI">Lớp 2 AI</option>
                <option value="2A">Lớp 2A</option>
                <option value="2B">Lớp 2B</option>
                <option value="2C">Lớp 2C</option>
              </select>
            </div>
          </div>

          {/* User Stats & Auth Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '6px 14px', borderRadius: '16px', fontWeight: 800, color: '#c2410c' }}>
              ⭐ {currentUser.coins} Xu
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '6px 14px', borderRadius: '16px', fontWeight: 800, color: '#15803d' }}>
              ⚡ {currentUser.xp} XP
            </div>

            <button 
              onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 16px', borderRadius: '20px', fontWeight: 800, color: '#1d4ed8', cursor: 'pointer' }}
            >
              👶 {currentUser.name} ({currentUser.role === 'student' ? 'Học sinh' : currentUser.role})
            </button>

            <button 
              onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              📝 Đăng Ký
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 16px' }}>
        
        {/* HERO BANNER */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '24px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 30px rgba(37,99,235,0.25)', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px' }}>🚀 Vương Quốc Trò Chơi Toán Học Lớp 2</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', marginBottom: '20px' }}>Học toán siêu vui cùng Ong AI! Tích lũy XP, đua top Bảng Xếp Hạng và chinh phục bài thi hằng tuần!</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setIsLeaderboardOpen(true)}
              style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 18px rgba(245,158,11,0.4)' }}
            >
              🏆 Xem Bảng Xếp Hạng Supabase
            </button>
            <button 
              onClick={() => setIsAITutorOpen(true)}
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }}
            >
              🐝 Hỏi Trợ Lý Ong AI
            </button>
          </div>
        </div>

        {/* FEATURE CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '2.5rem' }}>🎮</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '12px 0 6px 0' }}>6 Mini-Games Toán Học</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '16px' }}>Pikachu Phép Tính, Pizza Phân Số, Đua Xe Toán, Xếp Hình Lego, Zoo Animals & Đồng Hồ.</p>
            <button style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Chơi Game Ngay ➔</button>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '12px 0 6px 0' }}>Bài Thi Hằng Tuần</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '16px' }}>Đề thi trắc nghiệm Toán Lớp 2 với Guard Anti-Cheat chống gian lận tự động.</p>
            <button style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Làm Bài Thi ➔</button>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '2.5rem' }}>👩‍🏫</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '12px 0 6px 0' }}>Giao Diện Giáo Viên</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '16px' }}>Quản lý lớp học, sửa điểm học sinh và ghi nhận xét bài thi đồng bộ CSDL.</p>
            <button 
              onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Đăng Nhập Giáo Viên ➔
            </button>
          </div>

        </div>

      </main>

      {/* 3. MODAL ĐĂNG NHẬP / ĐĂNG KÝ SUPABASE */}
      {isAuthModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: 'white', width: '450px', maxWidth: '90%', borderRadius: '24px', padding: '28px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setIsAuthModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
              <button 
                onClick={() => setAuthMode('login')}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '12px', fontWeight: 900, background: authMode === 'login' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#f1f5f9', color: authMode === 'login' ? 'white' : '#475569', cursor: 'pointer' }}
              >
                🔑 Đăng Nhập
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '12px', fontWeight: 900, background: authMode === 'register' ? 'linear-gradient(135deg, #10b981, #059669)' : '#f1f5f9', color: authMode === 'register' ? 'white' : '#475569', cursor: 'pointer' }}
              >
                📝 Đăng Ký
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, textAlign: 'center', marginBottom: '16px' }}>Đăng Nhập Tài Khoản</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '4px' }}>Tên tài khoản (Username):</label>
                  <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Ví dụ: benam, comai..." required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '4px' }}>Mật khẩu:</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Nhập mật khẩu..." required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                {feedback.message && <div style={{ color: feedback.isError ? '#ef4444' : '#10b981', fontWeight: 800, textAlign: 'center', marginBottom: '12px' }}>{feedback.message}</div>}
                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }}>🚀 Đăng Nhập Ngay</button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, textAlign: 'center', marginBottom: '16px' }}>Đăng Ký Tài Khoản Supabase</h3>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Họ và Tên hiển thị:</label>
                  <input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A..." required style={{ width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Tên tài khoản (Username):</label>
                  <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="Ví dụ: nguyenvana..." required style={{ width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Mật khẩu:</label>
                  <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Tạo mật khẩu..." required style={{ width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Vai trò & Lớp học:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={regRole} onChange={(e) => setRegRole(e.target.value)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                      <option value="student">👶 Học sinh</option>
                      <option value="teacher">👩‍🏫 Giáo viên</option>
                    </select>
                    <select value={regClass} onChange={(e) => setRegClass(e.target.value)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                      <option value="2AI">Lớp 2 AI</option>
                      <option value="2A">Lớp 2A</option>
                      <option value="2B">Lớp 2B</option>
                      <option value="2C">Lớp 2C</option>
                    </select>
                  </div>
                </div>
                {feedback.message && <div style={{ color: feedback.isError ? '#ef4444' : '#10b981', fontWeight: 800, textAlign: 'center', marginBottom: '12px' }}>{feedback.message}</div>}
                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }}>📝 Đăng Ký Vĩnh Viễn</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL BẢNG XẾP HẠNG LEADERBOARD */}
      {isLeaderboardOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: 'white', width: '680px', maxWidth: '95%', borderRadius: '24px', padding: '30px', position: 'relative' }}>
            <button onClick={() => setIsLeaderboardOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textAlign: 'center', color: '#ea580c', marginBottom: '16px' }}>🏆 Bảng Xếp Hạng Supabase Database</h2>
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {dbStudents.map((st, idx) => (
                <div key={st.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: idx === 0 ? '#fef3c7' : '#f8fafc', borderRadius: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: idx === 0 ? '#d97706' : '#64748b' }}>#{idx + 1}</span>
                    <span style={{ fontWeight: 800 }}>{st.name}</span>
                    <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px' }}>{st.class_id || '2AI'}</span>
                  </div>
                  <div style={{ fontWeight: 900, color: '#16a34a' }}>⚡ {st.xp || 450} XP</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING AI TUTOR MASCOT */}
      <div 
        onClick={() => setIsAITutorOpen(true)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', width: '60px', height: '60px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 8px 20px rgba(245,158,11,0.4)', cursor: 'pointer', zIndex: 999 }}
        title="Hỏi Ong AI Giải Toán"
      >
        🐝
      </div>

    </div>
  );
}
