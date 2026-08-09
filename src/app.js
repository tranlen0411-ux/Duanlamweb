/* ============================================================
   APP NAVIGATION COORDINATOR - TOÁN CÙNG EM (SRC COMPONENT)
   ============================================================ */

import { dbStore } from './db-store.js';

export function initApp() {
  updateUserStatsUI();
  updateGradeUI();

  let storedName = localStorage.getItem('studentName') || 'Bé Nam';
  if (storedName.includes('Super Admin') || storedName.includes('Lã Hương') || storedName.includes('Admin')) {
    storedName = 'Bé Nam';
    localStorage.setItem('studentName', 'Bé Nam');
  }
  setStudentNameUI(storedName);
}

export function updateUserStatsUI() {
  try {
    const user = dbStore.getUserProfile();
    const xpEl = document.getElementById('user-xp-display');
    const coinsEl = document.getElementById('user-coins-display');

    if (xpEl && user) xpEl.textContent = `${user.xp || 450} XP`;
    if (coinsEl && user) coinsEl.textContent = user.coins || 1250;
  } catch (e) {
    console.warn("updateUserStatsUI warning:", e);
  }
}

export function updateGradeUI() {
  try {
    const selectedGrade = dbStore.getSelectedGrade();
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

export function setStudentNameUI(name) {
  let displayName = name || 'Bé Nam';
  if (displayName.includes('Admin') || displayName.includes('Super') || displayName.includes('Hương')) {
    displayName = 'Bé Nam';
  }
  const nameEls = document.querySelectorAll('#user-name-display, .student-name-text');
  nameEls.forEach(el => {
    if (el) el.textContent = displayName;
  });
}

export function switchStudentTab(tabId) {
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
