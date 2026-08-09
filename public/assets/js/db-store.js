/* ============================================================
   DATABASE STORE & STATE MANAGER (GRADES 1-5) - TOÁN CÙNG EM
   ============================================================ */

class DBStore {
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
      this.setItem("selected_grade", 2); // Khối lớp mặc định là Lớp 2
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

  // Quản lý Khối Lớp (Grade 1-5)
  getSelectedGrade() {
    return parseInt(this.getItem("selected_grade")) || 2;
  }

  setSelectedGrade(gradeNum) {
    const num = parseInt(gradeNum) || 2;
    this.setItem("selected_grade", num);

    // Cập nhật vào thông tin user
    const users = this.getUsers();
    const student = users.find(u => u.role === "student");
    if (student) {
      student.selectedGrade = num;
      this.setItem("users", users);
    }
  }

  // Quản lý Học sinh & Tên tùy chỉnh
  getUsers() { return this.getItem("users") || []; }
  getStudents() { return this.getUsers().filter(u => u.role === "student"); }
  
  // Lấy thông tin hồ sơ người dùng (User Profile)
  getUserProfile() {
    try {
      const student = this.getCurrentUser() || {};
      const savedCoins = parseInt(localStorage.getItem("userXu")) || student.coins || 1250;
      const savedXp = parseInt(localStorage.getItem("userXP")) || student.xpPoints || student.xp || 450;
      const studentName = localStorage.getItem("studentName") || student.fullName || student.name || "Bé Nam";
      return {
        id: student.id || 102,
        name: studentName,
        fullName: studentName,
        xp: savedXp,
        coins: savedCoins,
        level: Math.floor(savedXp / 100) + 1,
        selectedGrade: student.selectedGrade || this.getSelectedGrade()
      };
    } catch (e) {
      return { id: 102, name: "Bé Nam", fullName: "Bé Nam", xp: 450, coins: 1250, level: 5, selectedGrade: 2 };
    }
  }

  static getUserProfile() {
    return window.dbStore ? window.dbStore.getUserProfile() : { id: 102, name: "Bé Nam", fullName: "Bé Nam", xp: 450, coins: 1250, level: 5, selectedGrade: 2 };
  }

  static getSelectedGrade() {
    return window.dbStore ? window.dbStore.getSelectedGrade() : 2;
  }

  static setSelectedGrade(gradeNum) {
    if (window.dbStore) {
      window.dbStore.setSelectedGrade(gradeNum);
    }
  }

  setRole(role) { this.setItem("current_role", role); }
  getRole() { return this.getItem("current_role") || "student"; }

  updateStudentProfile(newFullName, newAvatar) {
    const users = this.getUsers();
    const student = users.find(u => u.role === "student");
    if (student) {
      if (newFullName && newFullName.trim() !== "") {
        student.fullName = newFullName.trim();
      }
      if (newAvatar) {
        student.avatar = newAvatar;
      }
      this.setItem("users", users);
      this.setItem("name_customized", true);
    }
    return student;
  }

  isNameCustomized() {
    return !!this.getItem("name_customized");
  }

  updateUserRewards(studentId, xpGained, coinsGained) {
    const users = this.getUsers();
    const student = users.find(u => u.id === studentId);
    if (student) {
      student.xpPoints = (student.xpPoints || 0) + xpGained;
      student.coins = (student.coins || 0) + coinsGained;
      student.level = Math.floor(student.xpPoints / 100) + 1;
      this.setItem("users", users);
    }
  }

  // Nhiệm vụ (Lọc theo Khối Lớp hiện tại)
  getQuests(grade = this.getSelectedGrade()) {
    const allQuests = this.getItem("quests") || [];
    return allQuests.filter(q => (q.grade || 2) === parseInt(grade));
  }

  updateQuestStatus(questId, status) {
    const quests = this.getItem("quests") || [];
    const q = quests.find(item => item.id === questId);
    if (q) {
      q.status = status;
      this.setItem("quests", quests);
    }
  }

  addQuest(questData) {
    const quests = this.getItem("quests") || [];
    questData.id = Date.now();
    questData.grade = questData.grade || this.getSelectedGrade();
    questData.status = "available";
    quests.unshift(questData);
    this.setItem("quests", quests);
    return questData;
  }

  // Bài kiểm tra (Lọc theo Khối Lớp hiện tại)
  getQuizzes(grade = this.getSelectedGrade()) {
    const allQuizzes = this.getItem("quizzes") || [];
    return allQuizzes.filter(qz => (qz.grade || 2) === parseInt(grade));
  }

  getQuizById(id) {
    const allQuizzes = this.getItem("quizzes") || [];
    return allQuizzes.find(q => q.id === parseInt(id));
  }

  addQuiz(quizData) {
    const quizzes = this.getItem("quizzes") || [];
    quizData.id = Date.now();
    quizData.grade = quizData.grade || this.getSelectedGrade();
    quizzes.unshift(quizData);
    this.setItem("quizzes", quizzes);
    return quizData;
  }

  // Bài Nộp & Lịch Sử (Lọc theo Khối Lớp hiện tại)
  getSubmissions(grade = this.getSelectedGrade()) {
    const allSubs = this.getItem("submissions") || [];
    return allSubs.filter(s => (s.grade || 2) === parseInt(grade));
  }

  getSubmissionByStudent(studentId, grade = this.getSelectedGrade()) {
    return this.getSubmissions(grade).filter(s => s.studentId === studentId);
  }

  addSubmission(submissionData) {
    const subs = this.getItem("submissions") || [];
    submissionData.id = Date.now();
    submissionData.grade = submissionData.grade || this.getSelectedGrade();
    submissionData.submittedAt = new Date().toISOString();
    subs.unshift(submissionData);
    this.setItem("submissions", subs);

    // Kích hoạt AI Phân tích lỗ hổng kiến thức
    this.analyzeKnowledgeGaps(submissionData);
    return submissionData;
  }

  addTeacherFeedback(submissionId, feedbackText) {
    const subs = this.getItem("submissions") || [];
    const sub = subs.find(s => s.id === parseInt(submissionId));
    if (sub) {
      sub.teacherFeedback = feedbackText;
      this.setItem("submissions", subs);
    }
  }

  // Gợi Ý Cá Nhân Hóa AI (Lọc theo Khối Lớp hiện tại)
  getAIRecommendations(grade = this.getSelectedGrade()) {
    const allRecs = this.getItem("ai_recommendations") || [];
    return allRecs.filter(r => (r.grade || 2) === parseInt(grade));
  }

  analyzeKnowledgeGaps(submission) {
    const wrongTopics = {};
    if (submission.details) {
      submission.details.forEach(d => {
        if (!d.isCorrect) {
          wrongTopics[d.topicTag] = (wrongTopics[d.topicTag] || 0) + 1;
        }
      });
    }

    const recs = this.getItem("ai_recommendations") || [];

    for (let topicTag in wrongTopics) {
      const newRec = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        grade: submission.grade || this.getSelectedGrade(),
        studentId: submission.studentId,
        weakTopic: topicTag,
        weakTopicName: topicTag,
        recommendationText: `AI phát hiện học sinh sai ${wrongTopics[topicTag]} câu ở phần kiến thức [${topicTag}]. Đề xuất bài tập rèn luyện.`,
        suggestedTask: `Bài tập rèn luyện cá nhân hóa: Bổ trợ [${topicTag}]`,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      recs.unshift(newRec);
    }
    this.setItem("ai_recommendations", recs);
  }
}

window.dbStore = new DBStore();
