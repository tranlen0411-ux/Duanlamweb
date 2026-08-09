/* ============================================================
   AI MATH TUTOR SERVICE WITH VOICE MICROPHONE - TOÁN CÙNG EM
   ============================================================ */

class AITutorService {
  constructor() {
    this.botName = "Ong Thông Thái 🐝";
    this.isListening = false;
    this.recognition = null;
    this.initSpeechRecognition();
  }

  getGrade() {
    return window.dbStore ? window.dbStore.getSelectedGrade() : 2;
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'vi-VN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicUI(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicUI(false);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputElem = document.getElementById("ai-chat-input-field");
        if (inputElem) {
          inputElem.value = transcript;
          const sendBtn = document.getElementById("ai-chat-send-btn");
          if (sendBtn) sendBtn.click();
        }
      };

      this.recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        this.isListening = false;
        this.updateMicUI(false);
      };
    }
  }

  toggleVoiceInput() {
    if (!this.recognition) {
      alert("⚠️ Trình duyệt của em chưa hỗ trợ Micro thu âm trực tiếp. Hãy gõ câu hỏi bằng bàn phím nhé!");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        console.error(e);
      }
    }
  }

  updateMicUI(listening) {
    const micBtn = document.getElementById("ai-mic-btn");
    if (micBtn) {
      if (listening) {
        micBtn.classList.add("listening");
        micBtn.title = "Đang lắng nghe giọng nói của em...";
      } else {
        micBtn.classList.remove("listening");
        micBtn.title = "Nhấp để nói câu hỏi qua Micro";
      }
    }
  }

  generateResponse(userQuestion) {
    const text = userQuestion.toLowerCase().trim();
    const grade = this.getGrade();

    if (!text) return `Chào bạn nhỏ! Cùng tớ khám phá bí mật của những con số Lớp ${grade} nhé! 🐝✨`;

    if (text.includes("cộng") || text.includes("trừ") || text.includes("+") || text.includes("-")) {
      if (grade === 1) {
        return `🐝 Hướng dẫn Lớp 1:\n- Bạn nhỏ dùng ngón tay hoặc que tính nhé!\n- Ví dụ 8 + 5: Đếm thêm 5 bước từ 8 ➡️ Đáp số là 13!`;
      } else if (grade === 2) {
        return `🐝 Hướng dẫn Phép cộng/trừ có nhớ Lớp 2:\n1️⃣ Đặt tính thẳng cột.\n2️⃣ Cộng/trừ hàng đơn vị trước. Nếu > 10 nhớ 1 sang hàng chục!\n3️⃣ Thử tính lại nào!`;
      } else if (grade === 3) {
        return `🐝 Hướng dẫn Phép tính Lớp 3:\n- Nhớ tính từ phải sang trái (đơn vị ➡️ chục ➡️ trăm ➡️ nghìn).\n- Đừng quên cộng phần nhớ nhé!`;
      } else if (grade === 4) {
        return `🐝 Hướng dẫn Phân số Lớp 4:\n- Quy đồng mẫu số trước khi cộng/trừ nhé!\n- Ví dụ: 1/3 + 2/5 = 5/15 + 6/15 = 11/15.`;
      } else {
        return `🐝 Hướng dẫn Số thập phân Lớp 5:\n- Đặt tính sao cho các dấu phẩy thẳng hàng nhau!\n- Tính như số tự nhiên rồi hạ dấu phẩy xuống.`;
      }
    }

    if (text.includes("đồng hồ") || text.includes("giờ") || text.includes("phút")) {
      return `🕒 Mẹo xem đồng hồ Lớp ${grade}:\n- Kim ngắn chỉ Giờ, Kim dài chỉ Phút.\n- Nhìn kỹ kim ngắn đang chỉ giữa số mấy nhé!`;
    }

    if (text.includes("hình") || text.includes("chu vi") || text.includes("diện tích") || text.includes("phân số")) {
      return `📐 Mẹo Hình học & Phân số:\n- Chu vi vuông = Cạnh x 4\n- Chu vi chữ nhật = (Dài + Rộng) x 2\n- Phân số = Số phần đã lấy / Tổng số phần!`;
    }

    return `🐝 Ong Thông Thái đang sẵn sàng hỗ trợ **Toán Lớp ${grade}**!\nEm hãy nhập hoặc bấm vào nút Micro 🎙️ để hỏi tớ nhé! ✨`;
  }
}

window.aiTutorService = new AITutorService();
