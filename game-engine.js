/* ============================================================
   KHO TRÒ CHƠI TOÁN HỌC (GAME ENGINE 6 GAMES) - TOÁN CÙNG EM
   ============================================================ */

class MathGameEngine {
  constructor() {
    this.currentGame = null;
    this.currentData = null;
    this.score = 0;
  }

  getGrade() {
    return window.dbStore ? window.dbStore.getSelectedGrade() : 2;
  }

  generateQuestionForGame(gameKey) {
    const grade = this.getGrade();

    if (gameKey === 'pika') {
      const num1 = Math.floor(Math.random() * 40) + 10;
      const num2 = Math.floor(Math.random() * 40) + 10;
      const ans = num1 + num2;
      return {
        title: `Pika-Chung Cư (Khối Lớp ${grade})`,
        questionText: `Phép tính Pika: ${num1} + ${num2} = ?`,
        correctAnswer: ans.toString(),
        options: [ans, ans + 2, Math.max(1, ans - 5), ans + 10]
      };
    } else if (gameKey === 'speed') {
      const a = grade === 1 ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 5) + 1;
      const b = grade === 1 ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 9) + 1;
      const ans = grade === 1 ? a + b : a * b;
      const symbol = grade === 1 ? '+' : 'x';
      return {
        title: `Đua Xe Phép Tính (Khối Lớp ${grade})`,
        questionText: `Tốc độ cuộc đua: ${a} ${symbol} ${b} = ?`,
        correctAnswer: ans.toString(),
        options: [ans, ans + 1, Math.max(0, ans - 2), ans + 4]
      };
    } else if (gameKey === 'tower') {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      const symbol = a > b ? '>' : (a < b ? '<' : '=');
      return {
        title: `Xây Tháp Số (Khối Lớp ${grade})`,
        questionText: `So sánh 2 khối gạch: ${a} _____ ${b}`,
        correctAnswer: symbol,
        options: ['>', '<', '=']
      };
    } else if (gameKey === 'zoo') {
      const count = Math.floor(Math.random() * 12) + 3;
      return {
        title: `Đố Vui Sở Thú (Khối Lớp ${grade})`,
        questionText: `Có ${count} con khỉ trong sở thú. Mỗi con ăn 1 quả chuối. Cần tất cả bao nhiêu quả chuối?`,
        correctAnswer: count.toString(),
        options: [count, count + 2, count - 1, count + 5]
      };
    } else if (gameKey === 'clock') {
      const hour = Math.floor(Math.random() * 12) + 1;
      return {
        title: `Bậc Thầy Xem Đồng Hồ (Khối Lớp ${grade})`,
        questionText: `Kim ngắn chỉ đúng số ${hour}, Kim dài chỉ đúng số 12. Hỏi là mấy giờ?`,
        correctAnswer: `${hour} giờ`,
        options: [`${hour} giờ`, `${hour === 12 ? 1 : hour + 1} giờ`, `${hour === 1 ? 12 : hour - 1} giờ`]
      };
    } else {
      return {
        title: `Thánh Ăn Pizza (Khối Lớp ${grade})`,
        questionText: `Bánh Pizza được chia làm 4 phần bằng nhau. Bé ăn 1 phần. Hỏi đã ăn mấy phần bánh?`,
        correctAnswer: `1/4`,
        options: [`1/4`, `2/4`, `3/4`, `4/4`]
      };
    }
  }

  static fillInput(val) {
    const input = document.getElementById("game-answer-input");
    if (input) input.value = val;
  }

  static submitAnswer() {
    const input = document.getElementById("game-answer-input");
    const feedback = document.getElementById("game-feedback");

    if (!input || !input.value.trim()) {
      if (feedback) {
        feedback.style.color = "#ef4444";
        feedback.textContent = "⚠️ Hãy điền hoặc chọn một đáp án nhé!";
      }
      return;
    }

    const val = input.value.trim();
    const correct = window.mathGameEngine ? window.mathGameEngine.currentData.correctAnswer : val;

    if (val.toLowerCase() === correct.toLowerCase()) {
      if (feedback) {
        feedback.style.color = "#10b981";
        feedback.textContent = "🎉 CHÍNH XÁC! Bạn nhận được +50 XP và +20 Xu!";
      }

      if (window.dbStore) {
        const user = window.dbStore.getUserProfile();
        const newXp = (user.xp || 450) + 50;
        const newXu = (user.coins || 1250) + 20;
        localStorage.setItem("userXP", newXp);
        localStorage.setItem("userXu", newXu);

        const xpEl = document.getElementById("user-xp-display");
        const xuEl = document.getElementById("user-coins-display");
        if (xpEl) xpEl.textContent = newXp + " XP";
        if (xuEl) xuEl.textContent = newXu;
      }

      setTimeout(() => {
        if (typeof closeModal === 'function') closeModal('game-modal');
      }, 1500);
    } else {
      if (feedback) {
        feedback.style.color = "#ef4444";
        feedback.textContent = `❌ Chưa đúng rồi! Đáp án đúng là: ${correct}. Hãy thử lại nhé!`;
      }
    }
  }
}

window.mathGameEngine = new MathGameEngine();
window.MathGameEngine = MathGameEngine;
