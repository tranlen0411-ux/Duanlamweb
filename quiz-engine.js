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

  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  startQuiz(quizId) {
    const quizData = window.dbStore ? window.dbStore.getQuizById(quizId) : null;
    if (!quizData) {
      alert("Không tìm thấy bài kiểm tra!");
      return false;
    }

    this.currentQuiz = quizData;
    this.userAnswers = {};
    this.antiCheatLogs = [];
    this.currentQuestionIndex = 0;
    this.isExamActive = true;

    let qList = quizData.questions || [];
    if (quizData.isRandomized) {
      qList = this.shuffleArray(qList);
    }
    this.questions = qList;

    this.remainingSeconds = (quizData.durationMinutes || 10) * 60;
    this.startTimer();

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
    const totalQuestions = this.questions.length || 1;
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
    const totalTimeSpent = (this.currentQuiz ? this.currentQuiz.durationMinutes * 60 : 600) - this.remainingSeconds;

    const currentUser = window.dbStore ? window.dbStore.getCurrentUser() : null;
    const submissionData = {
      quizId: this.currentQuiz ? this.currentQuiz.id : 'quiz_w1',
      quizTitle: this.currentQuiz ? this.currentQuiz.title : 'Bài kiểm tra Tuần 1',
      studentId: currentUser ? currentUser.id : 101,
      studentName: currentUser ? currentUser.fullName : "Học sinh",
      score: score,
      maxScore: 10.0,
      totalTimeSeconds: totalTimeSpent,
      details: details,
      antiCheatLogs: this.antiCheatLogs,
      teacherFeedback: ""
    };

    if (window.dbStore) {
      window.dbStore.addSubmission(submissionData);
      const rewardXp = Math.round(score * 10);
      const rewardCoins = Math.round(score * 3);
      window.dbStore.updateUserRewards(submissionData.studentId, rewardXp, rewardCoins);
    }

    return submissionData;
  }
}

window.quizEngine = new QuizEngine();
