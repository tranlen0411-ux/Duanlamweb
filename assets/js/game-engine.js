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

  renderGameContainer(gameKey, gradeLevel) {
    this.currentGame = gameKey;
    const gameData = this.generateQuestionForGame(gameKey);
    this.currentData = gameData;

    const imgMap = {
      pika: 'assets/images/game_pika.jpg',
      speed: 'assets/images/game_race_car.jpg',
      tower: 'assets/images/game_lego.jpg',
      zoo: 'assets/images/game_zoo.jpg',
      clock: 'assets/images/game_clock.jpg',
      fraction: 'assets/images/game_pizza.jpg'
    };

    return `
      <div style="text-align: center; padding: 12px; position: relative;">
        <!-- Nút X góc trên bên phải Popup -->
        <button class="modal-close" style="position: absolute; top: -5px; right: -5px; z-index: 10;" onclick="closeModal('game-modal')">✕</button>

        <div style="display: flex; justify-content: center; align-items: center; gap: 14px; margin-bottom: 16px;">
          <img src="${imgMap[gameKey]}" style="width: 80px; height: 80px; object-fit: contain; mix-blend-mode: multiply;" />
          <div style="text-align: left;">
            <h3 style="font-size: 1.6rem; font-weight: 900; color: var(--neutral-dark); margin-bottom: 2px;">${gameData.title}</h3>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.88rem; font-weight: 800; padding: 4px 14px; border-radius: 14px;">
              ⭐ Thưởng: +50 XP & +20 Xu
            </span>
          </div>
        </div>

        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 22px; padding: 24px; margin-bottom: 20px;">
          <h4 style="font-size: 1.35rem; font-weight: 900; margin-bottom: 18px; line-height: 1.5; color: var(--neutral-dark);">
            ${gameData.questionText}
          </h4>

          <!-- Ô nhập kết quả dạng input -->
          <div style="margin-bottom: 18px;">
            <label style="font-weight: 800; font-size: 0.95rem; display: block; margin-bottom: 8px; color: var(--neutral-gray);">Nhập kết quả của em vào đây:</label>
            <input type="text" id="game-answer-input" class="form-control" style="width: 220px; margin: 0 auto; text-align: center; font-size: 1.3rem; font-weight: 900; border: 2px solid #3b82f6; border-radius: 16px;" placeholder="Ví dụ: ${gameData.correctAnswer}" onkeyup="if(event.key==='Enter') MathGameEngine.submitAnswer();" />
          </div>

          <!-- Gợi ý các lựa chọn trắc nghiệm -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 420px; margin: 0 auto;" id="game-options-grid">
            ${gameData.options.map(opt => `
              <button class="quiz-option-card-btn" style="text-align: center; font-size: 1rem; padding: 10px;" onclick="MathGameEngine.fillInput('${opt}')">
                ${opt}
              </button>
            `).join('')}
          </div>
        </div>

        <div id="game-feedback-msg" style="min-height: 35px; font-weight: 900; font-size: 1.1rem; margin-bottom: 14px;"></div>

        <div style="display: flex; justify-content: center; gap: 12px;">
          <button class="btn btn-primary" id="game-submit-btn" style="padding: 12px 36px; border-radius: 25px; font-size: 1.1rem; font-weight: 900; background: linear-gradient(135deg, #10b981, #059669);" onclick="MathGameEngine.submitAnswer()">
            📥 Nộp Bài
          </button>
          <button class="btn btn-outline" style="padding: 12px 24px; border-radius: 25px; font-weight: 800;" onclick="closeModal('game-modal')">
            Đóng (X)
          </button>
        </div>
      </div>
    `;
  }

  static fillInput(val) {
    const input = document.getElementById('game-answer-input');
    if (input) input.value = val;
  }

  static submitAnswer() {
    const engine = window.mathGameEngine;
    const input = document.getElementById('game-answer-input');
    const feedback = document.getElementById('game-feedback-msg');

    if (!input || !input.value.trim()) {
      if (feedback) feedback.innerHTML = '<span style="color: #ef4444;">⚠️ Vui lòng nhập kết quả hoặc chọn đáp án trước khi nộp bài!</span>';
      return;
    }

    const userAns = input.value.trim().toLowerCase();
    const correctAns = engine.currentData.correctAnswer.trim().toLowerCase();

    if (userAns === correctAns) {
      if (feedback) feedback.innerHTML = '<span style="color: #10b981;">🎉 Chính xác! +50 XP +20 Xu</span>';
      
      // Update User XP & Coins in DBStore
      if (window.DBStore) {
        const user = window.DBStore.getUserProfile();
        user.xp += 50;
        user.coins += 20;
        window.DBStore.saveUserProfile(user);
        
        if (typeof updateUserStatsUI === 'function') {
          updateUserStatsUI();
        }
      }

      // Automatically close popup after 1.5s
      setTimeout(() => {
        if (typeof closeModal === 'function') {
          closeModal('game-modal');
        }
      }, 1500);
    } else {
      if (feedback) feedback.innerHTML = `<span style="color: #ef4444;">❌ Chưa chính xác! Đáp án đúng là <strong>${engine.currentData.correctAnswer}</strong>.</span>`;
    }
  }

  generateQuestionForGame(gameKey) {
    if (gameKey === 'pika') return this.generatePikaQuestion();
    if (gameKey === 'speed') return this.generateSpeedMathQuestion();
    if (gameKey === 'tower') return this.generateTowerQuestion();
    if (gameKey === 'zoo') return this.generateZooQuestion();
    if (gameKey === 'clock') return this.generateClockQuestion();
    return this.generateFractionQuestion();
  }

  // 1. 🏎️ Đua Xe Phép Tính
  generateSpeedMathQuestion() {
    const grade = this.getGrade();
    let num1 = Math.floor(Math.random() * 15 * grade) + 5;
    let num2 = Math.floor(Math.random() * 10 * grade) + 2;
    let answer = num1 + num2;
    let questionText = `${num1} + ${num2} = ?`;

    const options = [
      answer.toString(),
      (answer + 2).toString(),
      (answer - 1 > 0 ? answer - 1 : answer + 3).toString(),
      (answer + 5).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      title: "🏎️ Đua Xe Phép Tính",
      questionText: `[Lớp ${grade}] Phép tính đua xe: ${questionText}`,
      correctAnswer: answer.toString(),
      options: options
    };
  }

  // 2. 🏰 Xây Tháp Số
  generateTowerQuestion() {
    const grade = this.getGrade();
    const step = grade * 3;
    const start = Math.floor(Math.random() * 15) + 3;
    const missing = start + step * 2;
    const seq = `${start}, ${start + step}, [ ? ], ${start + step * 3}`;

    const options = [
      missing.toString(),
      (missing + 1).toString(),
      (missing - 1).toString(),
      (missing + step).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      title: "🏰 Xây Tháp Số",
      questionText: `[Lớp ${grade}] Điền số còn thiếu trong tháp số: ${seq}`,
      correctAnswer: missing.toString(),
      options: options
    };
  }

  // 3. 🕒 Kho Báu Thời Gian
  generateClockQuestion() {
    const grade = this.getGrade();
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = grade === 1 ? 0 : 30;
    
    const answerStr = minutes === 0 ? `${hours}` : `${hours}`;
    const questionText = minutes === 0 ? `Đồng hồ chỉ kim ngắn số ${hours}, kim dài số 12. Hỏi là mấy giờ?` : `Đồng hồ chỉ kim ngắn giữa số ${hours} và ${hours+1}, kim dài số 6. Hỏi mấy giờ?`;

    const options = [
      `${hours}`,
      `${(hours % 12) + 1}`,
      `${hours === 1 ? 12 : hours - 1}`,
      `${hours + 2}`
    ].sort(() => Math.random() - 0.5);

    return {
      title: "🕒 Kho Báu Thời Gian",
      questionText: `[Lớp ${grade}] ${questionText}`,
      correctAnswer: `${hours}`,
      options: options
    };
  }

  // 4. 🦁 Vườn Thú Toán Học
  generateZooQuestion() {
    const grade = this.getGrade();
    const count1 = Math.floor(Math.random() * 8) + 5;
    const count2 = Math.floor(Math.random() * 7) + 3;
    const total = count1 + count2;

    const options = [
      total.toString(),
      (total + 2).toString(),
      (total - 1).toString(),
      (total + 3).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      title: "🦁 Vườn Thú Toán Học",
      questionText: `[Lớp ${grade}] Vườn thú có ${count1} con Sư tử và ${count2} con Hổ. Hỏi có tất cả bao nhiêu con thú?`,
      correctAnswer: total.toString(),
      options: options
    };
  }

  // 5. 🍕 Khu Rừng Phân Số
  generateFractionQuestion() {
    const grade = this.getGrade();
    const slices = 4;
    const eaten = Math.floor(Math.random() * 3) + 1;
    const answerStr = `${eaten}/${slices}`;

    const options = [
      answerStr,
      `${4 - eaten}/${slices}`,
      `${eaten}/8`,
      `1/${slices}`
    ].sort(() => Math.random() - 0.5);

    return {
      title: "🍕 Khu Rừng Phân Số",
      questionText: `[Lớp ${grade}] Bánh Pizza chia 4 phần bằng nhau, bé ăn ${eaten} phần. Phân số chỉ số phần đã ăn là?`,
      correctAnswer: answerStr,
      options: options
    };
  }

  // 6. ⚡ Pika-Chung Cự
  generatePikaQuestion() {
    const grade = this.getGrade();
    const num1 = Math.floor(Math.random() * 12) + 6;
    const num2 = Math.floor(Math.random() * 9) + 4;
    const sum = num1 + num2;

    const options = [
      sum.toString(),
      (sum + 1).toString(),
      (sum - 2).toString(),
      (sum + 3).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      title: "⚡ Pika-Chung Cự",
      questionText: `[Lớp ${grade}] Ghép cặp Pikachu: ${num1} + ${num2} = ?`,
      correctAnswer: sum.toString(),
      options: options
    };
  }
}

window.mathGameEngine = new MathGameEngine();
window.GameEngine = {
  renderGameContainer: (key, grade) => window.mathGameEngine.renderGameContainer(key, grade),
  startCurrentGame: (key) => {}
};
