/* ============================================================
   QUIZ ENGINE & ANTI-CHEAT GUARD - TOÁN CÙNG EM (LỚP 2)
   ============================================================ */

class QuizEngine {
  constructor() {
    this.currentQuiz = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.timerInterval = null;
    this.remainingSeconds = 0;
    this.antiCheatLogs = [];
    this.isExamActive = false;
  }

  // Thuật toán xáo trộn Fisher-Yates shuffle
  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  startQuiz(quizId) {
    const quizData = window.dbStore.getQuizById(quizId);
    if (!quizData) {
      alert("Không tìm thấy bài kiểm tra!");
      return false;
    }

    this.currentQuiz = quizData;
    this.userAnswers = {};
    this.antiCheatLogs = [];
    this.currentQuestionIndex = 0;
    this.isExamActive = true;

    // Trộn câu hỏi nếu bài kiểm tra bật chế độ randomization
    let qList = quizData.questions || [];
    if (quizData.isRandomized) {
      qList = this.shuffleArray(qList);
    }
    this.questions = qList;

    // Thiết lập thời gian đếm ngược
    this.remainingSeconds = (quizData.durationMinutes || 10) * 60;
    this.startTimer();

    // Bật Anti-Cheat Guard
    if (quizData.antiCheatEnabled) {
      this.enableAntiCheatGuard();
    }

    return true;
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerUI();

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        alert("⏰ Đã hết thời gian làm bài! Hệ thống đang tự động nộp bài cho bạn.");
        this.submitQuiz();
      }
    }, 1000);
  }

  updateTimerUI() {
    const timerElem = document.getElementById("quiz-timer-display");
    if (!timerElem) return;

    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    timerElem.textContent = formatted;
  }

  selectOption(questionId, optionLetter) {
    this.userAnswers[questionId] = optionLetter;
  }

  enableAntiCheatGuard() {
    this.handleBlur = () => {
      if (!this.isExamActive) return;
      const log = {
        eventType: "blur",
        message: "Cảnh báo: Học sinh chuyển tab hoặc rời khỏi cửa sổ làm bài!",
        timestamp: new Date().toISOString()
      };
      this.antiCheatLogs.push(log);

      // Hiển thị thông báo cảnh báo nhẹ nhàng cho học sinh
      const banner = document.getElementById("anti-cheat-alert-banner");
      if (banner) {
        banner.style.display = "flex";
        banner.innerHTML = "⚠️ **Cảnh báo Anti-Cheat:** Vui lòng tập trung làm bài, không mở tab khác!";
        setTimeout(() => { banner.style.display = "none"; }, 4000);
      }
    };

    this.handleContextMenu = (e) => {
      if (this.isExamActive) e.preventDefault();
    };

    this.handleCopyCut = (e) => {
      if (this.isExamActive) {
        e.preventDefault();
        alert("⚠️ Thao tác sao chép/cắt bị cấm trong lúc làm bài kiểm tra!");
      }
    };

    window.addEventListener("blur", this.handleBlur);
    document.addEventListener("contextmenu", this.handleContextMenu);
    document.addEventListener("copy", this.handleCopyCut);
    document.addEventListener("cut", this.handleCopyCut);
  }

  disableAntiCheatGuard() {
    this.isExamActive = false;
    clearInterval(this.timerInterval);
    if (this.handleBlur) window.removeEventListener("blur", this.handleBlur);
    if (this.handleContextMenu) document.removeEventListener("contextmenu", this.handleContextMenu);
    if (this.handleCopyCut) {
      document.removeEventListener("copy", this.handleCopyCut);
      document.removeEventListener("cut", this.handleCopyCut);
    }
  }

  submitQuiz() {
    this.disableAntiCheatGuard();

    let correctCount = 0;
    const totalQuestions = this.questions.length;
    const details = [];

    this.questions.forEach(q => {
      const selected = this.userAnswers[q.id] || null;
      const isCorrect = selected === q.correctOption;
      if (isCorrect) correctCount++;

      details.push({
        questionId: q.id,
        selectedOption: selected,
        isCorrect: isCorrect,
        topicTag: q.topicTag || "cong_tru_100"
      });
    });

    const score = parseFloat(((correctCount / totalQuestions) * 10).toFixed(1));
    const totalTimeSpent = (this.currentQuiz.durationMinutes * 60) - this.remainingSeconds;

    const currentUser = window.dbStore.getCurrentUser();
    const submissionData = {
      quizId: this.currentQuiz.id,
      quizTitle: this.currentQuiz.title,
      studentId: currentUser ? currentUser.id : 101,
      studentName: currentUser ? currentUser.fullName : "Học sinh",
      score: score,
      maxScore: 10.0,
      totalTimeSeconds: totalTimeSpent,
      details: details,
      antiCheatLogs: this.antiCheatLogs,
      teacherFeedback: ""
    };

    // Lưu vào DB Store
    const savedSubmission = window.dbStore.addSubmission(submissionData);

    // Thưởng XP & Xu dựa trên điểm số
    const rewardXp = Math.round(score * 10);
    const rewardCoins = Math.round(score * 3);
    window.dbStore.updateUserRewards(submissionData.studentId, rewardXp, rewardCoins);

    return savedSubmission;
  }
}

window.quizEngine = new QuizEngine();
