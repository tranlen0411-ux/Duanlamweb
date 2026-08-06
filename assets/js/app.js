/* ============================================================
   APP STATE & NAVIGATION COORDINATOR (CHUẨN 5 BỨC ẢNH MẪU)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  updateUserStatsUI();
  updateGradeUI();

  const storedName = localStorage.getItem('student_fullname') || 'Bé Nam';
  setStudentNameUI(storedName);

  // Default to Tab 1
  if (typeof switchStudentTab === 'function') {
    switchStudentTab('tab-home-tasks');
  }
}

function updateUserStatsUI() {
  try {
    const user = (typeof DBStore !== 'undefined' && typeof DBStore.getUserProfile === 'function')
      ? DBStore.getUserProfile()
      : (window.dbStore ? window.dbStore.getUserProfile() : { xp: 450, coins: 1250 });

    const xpEl = document.getElementById('user-xp-display');
    const coinsEl = document.getElementById('user-coins-display');

    if (xpEl && user) xpEl.textContent = `${user.xp || 450} XP`;
    if (coinsEl && user) coinsEl.textContent = user.coins || 1250;
  } catch (e) {
    console.warn("updateUserStatsUI warning:", e);
  }
}

function updateGradeUI() {
  try {
    const selectedGrade = (typeof DBStore !== 'undefined' && typeof DBStore.getSelectedGrade === 'function')
      ? DBStore.getSelectedGrade()
      : (window.dbStore ? window.dbStore.getSelectedGrade() : 2);

    const gradeBadgeTexts = document.querySelectorAll('#current-grade-badge-text');
    const gradeTags = document.querySelectorAll('.current-grade-tag');

    gradeBadgeTexts.forEach(el => {
      if (el) el.textContent = `Lớp ${selectedGrade} AI`;
    });

    gradeTags.forEach(el => {
      if (el) el.textContent = `Lớp ${selectedGrade}`;
    });
  } catch (e) {
    console.warn("updateGradeUI warning:", e);
  }
}

function setStudentNameUI(name) {
  const nameEls = document.querySelectorAll('#user-name-display, .student-name-text');
  nameEls.forEach(el => {
    el.textContent = name;
  });
  localStorage.setItem('student_fullname', name);
}

function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  const input = document.getElementById('input-student-fullname');
  if (input) input.value = localStorage.getItem('student_fullname') || 'Bé Nam';
  if (modal) modal.classList.add('active');
}

function saveStudentProfileFromModal() {
  const input = document.getElementById('input-student-fullname');
  if (input && input.value.trim() !== '') {
    setStudentNameUI(input.value.trim());
  }
  closeModal('edit-profile-modal');
}

function selectGlobalGrade(gradeNum) {
  DBStore.setSelectedGrade(gradeNum);
  updateGradeUI();
  
  if (window.TeacherDashboard) {
    TeacherDashboard.render();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function launchGameFromLibrary(gameKey) {
  const modal = document.getElementById('game-modal');
  const content = document.getElementById('game-modal-content');
  if (!modal || !content) return;

  const currentGrade = DBStore.getSelectedGrade();
  content.innerHTML = GameEngine.renderGameContainer(gameKey, currentGrade);
  modal.classList.add('active');

  setTimeout(() => {
    GameEngine.startCurrentGame(gameKey);
  }, 100);
}
