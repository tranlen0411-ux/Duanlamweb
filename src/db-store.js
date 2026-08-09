/* ============================================================
   DATABASE STORE & STATE MANAGER - TOÁN CÙNG EM (SRC COMPONENT)
   ============================================================ */

import { APP_CONFIG, INITIAL_USERS, INITIAL_QUESTS, INITIAL_QUIZZES, INITIAL_SUBMISSIONS, INITIAL_AI_RECOMMENDATIONS } from './config.js';

export class DBStore {
  constructor() {
    this.prefix = APP_CONFIG.STORAGE_PREFIX;
    this.initDatabase();
  }

  initDatabase() {
    if (!this.getItem("users")) {
      this.setItem("users", INITIAL_USERS);
    }
    if (!this.getItem("quests")) {
      this.setItem("quests", INITIAL_QUESTS);
    }
    if (!this.getItem("quizzes")) {
      this.setItem("quizzes", INITIAL_QUIZZES);
    }
    if (!this.getItem("submissions")) {
      this.setItem("submissions", INITIAL_SUBMISSIONS);
    }
    if (!this.getItem("ai_recommendations")) {
      this.setItem("ai_recommendations", INITIAL_AI_RECOMMENDATIONS);
    }
    if (!this.getItem("current_role")) {
      this.setItem("current_role", "student");
    }
    if (!this.getItem("selected_grade")) {
      this.setItem("selected_grade", 2);
    }
  }

  getItem(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading key ${key}:`, e);
      return null;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing key ${key}:`, e);
    }
  }

  getSelectedGrade() {
    return parseInt(this.getItem("selected_grade")) || 2;
  }

  setSelectedGrade(gradeNum) {
    const num = parseInt(gradeNum) || 2;
    this.setItem("selected_grade", num);
  }

  getUserProfile() {
    let name = localStorage.getItem('studentName') || 'Bé Nam';
    if (name.includes('Super Admin') || name.includes('Lã Hương')) {
      name = 'Bé Nam';
    }
    return {
      name: name,
      grade: this.getSelectedGrade(),
      xp: parseInt(localStorage.getItem('userXP') || '450', 10),
      coins: parseInt(localStorage.getItem('userXu') || '1250', 10)
    };
  }
}

export const dbStore = new DBStore();
export default dbStore;
