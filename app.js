/* ============================================================
   APP NAVIGATION & STATE COORDINATOR - TOÁN CÙNG EM
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initApp === 'function') initApp();
});

function initApp() {
  updateUserStatsUI();
  updateGradeUI();

  let storedName = localStorage.getItem('studentName') || 'Bé Nam';
  if (storedName.includes('Super Admin') || storedName.includes('Lã Hương') || storedName.includes('Admin')) {
    storedName = 'Bé Nam';
    localStorage.setItem('studentName', 'Bé Nam');
  }
  setStudentNameUI(storedName);
}

function updateUserStatsUI() {
  try {
    const xpEl = document.getElementById('user-xp-display');
    const coinsEl = document.getElementById('user-coins-display');

    const xp = localStorage.getItem('userXP') || '450';
    const coins = localStorage.getItem('userXu') || '1250';

    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (coinsEl) coinsEl.textContent = coins;
  } catch (e) {
    console.warn("updateUserStatsUI warning:", e);
  }
}

function updateGradeUI() {
  try {
    const selectedGrade = localStorage.getItem('toancungem_v2_selected_grade') || 2;
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
  if (displayName.includes('Admin') || displayName.includes('Super') || displayName.includes('Hương')) {
    displayName = 'Bé Nam';
  }
  const nameEls = document.querySelectorAll('#user-name-display, .student-name-text');
  nameEls.forEach(el => {
    if (el) el.textContent = displayName;
  });
}

function switchStudentTab(tabId) {
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
}

window.initApp = initApp;
window.updateUserStatsUI = updateUserStatsUI;
window.updateGradeUI = updateGradeUI;
window.setStudentNameUI = setStudentNameUI;
window.switchStudentTab = switchStudentTab;
