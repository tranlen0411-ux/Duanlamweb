/* ============================================================
   APP STATE & NAVIGATION COORDINATOR (CHUẨN 5 BỨC ẢNH MẪU)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  updateUserStatsUI();
  updateGradeUI();

  let storedName = localStorage.getItem('studentName') || localStorage.getItem('student_fullname') || 'Bé Nam';
  if (storedName.toLowerCase().includes('admin') || storedName.toLowerCase().includes('super')) {
    storedName = 'Bé Nam';
  }
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
  let displayName = name || 'Bé Nam';
  if (displayName.toLowerCase().includes('admin') || displayName.toLowerCase().includes('super')) {
    displayName = 'Bé Nam';
  }
  const nameEls = document.querySelectorAll('#user-name-display, .student-name-text');
  nameEls.forEach(el => {
    if (el) el.textContent = displayName;
  });
}

// Global Tab Exposer
window.switchStudentTab = function(tabId) {
  const tabs = document.querySelectorAll('.sub-view-tab');
  tabs.forEach(t => {
    if (t) t.style.display = 'none';
  });

  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.style.display = 'block';
  }

  const navBtns = document.querySelectorAll('.nav-tab-btn');
  navBtns.forEach(btn => {
    if (btn) {
      if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
};
