/* ============================================================
   CONFIG & INITIAL SEED DATA FOR GRADES 1-5 - TOÁN CÙNG EM
   ============================================================ */

const APP_CONFIG = {
  APP_NAME: "Toán cùng em",
  GRADES: [1, 2, 3, 4, 5],
  STORAGE_PREFIX: "toancungem_v2_",
  DEFAULT_QUIZ_DURATION: 10,
  
  // Kiến thức phân theo Khối Lớp (Lớp 1 đến Lớp 5)
  GRADE_TOPICS: {
    1: [
      { id: "g1_cong_tru_20", name: "Cộng & Trừ phạm vi 20", icon: "🔢" },
      { id: "g1_cong_tru_100", name: "Cộng & Trừ không nhớ phạm vi 100", icon: "➕" },
      { id: "g1_hinh_hoc", name: "Nhận biết Hình phẳng (Tam giác, Tròn, Vuông)", icon: "🔺" },
      { id: "g1_gio_dung", name: "Xem giờ đúng trên đồng hồ", icon: "🕒" }
    ],
    2: [
      { id: "g2_cong_tru_100", name: "Phép cộng & Trừ có nhớ phạm vi 100", icon: "🔢" },
      { id: "g2_nhan_chia_25", name: "Bảng nhân 2, 5 & Bảng chia 2, 5", icon: "✖️" },
      { id: "g2_dong_ho", name: "Xem giờ đồng hồ kim (Giờ đúng & 30 phút)", icon: "🕒" },
      { id: "g2_hinh_hoc", name: "Hình học cơ bản, cm, dm, m & kg", icon: "📐" },
      { id: "g2_loi_van", name: "Giải bài toán có lời văn một bước tính", icon: "📖" }
    ],
    3: [
      { id: "g3_nhan_chia_bang", name: "Bảng nhân & Bảng chia 3, 4, 6, 7, 8, 9", icon: "✖️" },
      { id: "g3_cong_tru_1000", name: "Cộng trừ phạm vi 1000 & 10.000", icon: "🔢" },
      { id: "g3_chu_vi_dien_tich", name: "Chu vi & Diện tích Hình vuông, Hình chữ nhật", icon: "📐" },
      { id: "g3_dong_ho_phut", name: "Xem đồng hồ chính xác đến từng phút", icon: "🕒" }
    ],
    4: [
      { id: "g4_nhan_chia_nhieu_so", name: "Phép nhân & chia số có nhiều chữ số", icon: "➗" },
      { id: "g4_phan_so", name: "Phân số & Các phép tính phân số (+, -, x, :)", icon: "🧮" },
      { id: "g4_goc_goc_vuong", name: "Góc nhọn, góc tày, góc vuông, trung bình cộng", icon: "📏" },
      { id: "g4_tong_hieu", name: "Bài toán Tìm hai số khi biết Tổng và Hiệu", icon: "📖" }
    ],
    5: [
      { id: "g5_so_thap_phan", name: "Số thập phân & Phép tính với số thập phân", icon: "🔢" },
      { id: "g5_ti_so_phan_tram", name: "Tỉ số phần trăm & Bài toán tỉ số phần trăm", icon: "📊" },
      { id: "g5_chuyen_dong_deu", name: "Bài toán Chuyển động đều (Vận tốc, Quãng đường, Thời gian)", icon: "🏎️" },
      { id: "g5_the_tich", name: "Diện tích xung quanh & Thể tích khối hộp, lập phương", icon: "📦" }
    ]
  }
};

// Dữ liệu mẫu ban đầu
const INITIAL_USERS = [
  {
    id: 101,
    username: "hocsinh_user",
    fullName: "Nguyễn Văn An",
    role: "student",
    avatar: "👦",
    xpPoints: 340,
    coins: 120,
    level: 3,
    selectedGrade: 2
  },
  {
    id: 999,
    username: "giaovien_lan",
    fullName: "Cô Nguyễn Thị Lan",
    role: "teacher",
    avatar: "👩‍🏫",
    school: "Trường Tiểu Học Ngôi Sao"
  }
];

// Nhiệm vụ mẫu phân theo Khối Lớp
const INITIAL_QUESTS = [
  // LỚP 1
  {
    id: 101,
    grade: 1,
    title: "Chinh phục Phép cộng phạm vi 20",
    description: "Hoàn thành 5 câu hỏi cộng trong phạm vi 20",
    topic: "g1_cong_tru_20",
    targetScore: 100, rewardXp: 40, rewardCoins: 15, status: "available", icon: "🔢"
  },
  {
    id: 102,
    grade: 1,
    title: "Nhận biết Mặt Đồng Hồ Đúng",
    description: "Đọc đúng các kim đồng hồ chỉ giờ đúng",
    topic: "g1_gio_dung",
    targetScore: 100, rewardXp: 50, rewardCoins: 20, status: "available", icon: "🕒"
  },

  // LỚP 2
  {
    id: 201,
    grade: 2,
    title: "Chinh phục Phép cộng có nhớ 100",
    description: "Hoàn thành 5 câu hỏi tính cộng phạm vi 100",
    topic: "g2_cong_tru_100",
    targetScore: 100, rewardXp: 50, rewardCoins: 20, status: "available", icon: "⚡"
  },
  {
    id: 202,
    grade: 2,
    title: "Thám hiểm Đồng hồ Kim",
    description: "Đọc đúng giờ đúng và giờ rưỡi trên đồng hồ kim",
    topic: "g2_dong_ho",
    targetScore: 100, rewardXp: 60, rewardCoins: 25, status: "available", icon: "🕒"
  },

  // LỚP 3
  {
    id: 301,
    grade: 3,
    title: "Thuộc lòng Bảng nhân 6 và Bảng chia 6",
    description: "Tính nhanh các phép tính trong bảng nhân chia 6",
    topic: "g3_nhan_chia_bang",
    targetScore: 100, rewardXp: 60, rewardCoins: 25, status: "available", icon: "✖️"
  },
  {
    id: 302,
    grade: 3,
    title: "Tính Chu Vi Hình Chữ Nhật",
    description: "Áp dụng công thức (Chiều dài + Chiều rộng) x 2",
    topic: "g3_chu_vi_dien_tich",
    targetScore: 100, rewardXp: 70, rewardCoins: 30, status: "available", icon: "📐"
  },

  // LỚP 4
  {
    id: 401,
    grade: 4,
    title: "Thạo Phép Cộng & Trừ Phân Số",
    description: "Quy đồng mẫu số và tính tổng các phân số",
    topic: "g4_phan_so",
    targetScore: 100, rewardXp: 70, rewardCoins: 30, status: "available", icon: "🧮"
  },
  {
    id: 402,
    grade: 4,
    title: "Giải Bài Toán Tìm Hai Số Khi Biết Tổng & Hiệu",
    description: "Số lớn = (Tổng + Hiệu) : 2, Số bé = (Tổng - Hiệu) : 2",
    topic: "g4_tong_hieu",
    targetScore: 100, rewardXp: 80, rewardCoins: 35, status: "available", icon: "📖"
  },

  // LỚP 5
  {
    id: 501,
    grade: 5,
    title: "Bậc Thầy Phép Tính Số Thập Phân",
    description: "Thực hiện phép cộng, trừ, nhân số thập phân",
    topic: "g5_so_thap_phan",
    targetScore: 100, rewardXp: 80, rewardCoins: 35, status: "available", icon: "🔢"
  },
  {
    id: 502,
    grade: 5,
    title: "Chinh Phục Bài Toán Chuyển Động Đều",
    description: "Tính Vận tốc (v = s : t) và Quãng đường (s = v x t)",
    topic: "g5_chuyen_dong_deu",
    targetScore: 100, rewardXp: 90, rewardCoins: 40, status: "available", icon: "🏎️"
  }
];

// Bài kiểm tra mẫu phân theo Khối Lớp
const INITIAL_QUIZZES = [
  // LỚP 1
  {
    id: 10,
    grade: 1,
    title: "Bài kiểm tra Lớp 1: Phép cộng trừ cơ bản & Hình học",
    durationMinutes: 10,
    isRandomized: true,
    antiCheatEnabled: true,
    questions: [
      { id: 1001, questionText: "Tính: 8 + 5 = ?", optionA: "13", optionB: "12", optionC: "14", optionD: "11", correctOption: "A", topicTag: "g1_cong_tru_20" },
      { id: 1002, questionText: "Hình nào dưới đây có 3 cạnh?", optionA: "Hình vuông", optionB: "Hình tròn", optionC: "Hình tam giác", optionD: "Hình chữ nhật", correctOption: "C", topicTag: "g1_hinh_hoc" },
      { id: 1003, questionText: "Kim ngắn chỉ số 9, kim dài chỉ số 12. Hỏi mấy giờ?", optionA: "9 giờ đúng", optionB: "12 giờ đúng", optionC: "10 giờ đúng", optionD: "8 giờ đúng", correctOption: "A", topicTag: "g1_gio_dung" }
    ]
  },
  // LỚP 2
  {
    id: 20,
    grade: 2,
    title: "Bài kiểm tra Lớp 2: Đột phá Phép cộng trừ & Đồng hồ",
    durationMinutes: 10,
    isRandomized: true,
    antiCheatEnabled: true,
    questions: [
      { id: 2001, questionText: "Tính kết quả phép tính: 47 + 28 = ?", optionA: "65", optionB: "75", optionC: "72", optionD: "62", correctOption: "B", topicTag: "g2_cong_tru_100" },
      { id: 2002, questionText: "Kim ngắn chỉ số 8, kim dài chỉ số 6. Hỏi đồng hồ chỉ mấy giờ?", optionA: "8 giờ đúng", optionB: "8 giờ 30 phút", optionC: "9 giờ đúng", optionD: "6 giờ 40 phút", correctOption: "B", topicTag: "g2_dong_ho" },
      { id: 2003, questionText: "An có 35 viên bi, Bình cho An thêm 17 viên. Hỏi An có bao nhiêu viên bi?", optionA: "42 viên", optionB: "52 viên", optionC: "53 viên", optionD: "48 viên", correctOption: "B", topicTag: "g2_loi_van" }
    ]
  },
  // LỚP 3
  {
    id: 30,
    grade: 3,
    title: "Bài kiểm tra Lớp 3: Bảng nhân chia & Chu vi hình",
    durationMinutes: 10,
    isRandomized: true,
    antiCheatEnabled: true,
    questions: [
      { id: 3001, questionText: "Tính: 6 x 7 = ?", optionA: "42", optionB: "36", optionC: "48", optionD: "54", correctOption: "A", topicTag: "g3_nhan_chia_bang" },
      { id: 3002, questionText: "Một hình chữ nhật có chiều dài 8cm, chiều rộng 5cm. Tính chu vi?", optionA: "26cm", optionB: "40cm", optionC: "13cm", optionD: "30cm", correctOption: "A", topicTag: "g3_chu_vi_dien_tich" },
      { id: 3003, questionText: "Tính: 450 + 380 = ?", optionA: "830", optionB: "730", optionC: "820", optionD: "780", correctOption: "A", topicTag: "g3_cong_tru_1000" }
    ]
  },
  // LỚP 4
  {
    id: 40,
    grade: 4,
    title: "Bài kiểm tra Lớp 4: Phân số & Bài toán Tổng - Hiệu",
    durationMinutes: 12,
    isRandomized: true,
    antiCheatEnabled: true,
    questions: [
      { id: 4001, questionText: "Tính: 1/3 + 2/5 = ?", optionA: "11/15", optionB: "3/8", optionC: "3/15", optionD: "7/15", correctOption: "A", topicTag: "g4_phan_so" },
      { id: 4002, questionText: "Tổng hai số là 50, Hiệu hai số là 10. Tìm Số Lớn?", optionA: "30", optionB: "20", optionC: "40", optionD: "25", correctOption: "A", topicTag: "g4_tong_hieu" }
    ]
  },
  // LỚP 5
  {
    id: 50,
    grade: 5,
    title: "Bài kiểm tra Lớp 5: Số thập phân & Chuyển động đều",
    durationMinutes: 15,
    isRandomized: true,
    antiCheatEnabled: true,
    questions: [
      { id: 5001, questionText: "Tính: 14.5 + 8.75 = ?", optionA: "23.25", optionB: "22.25", optionC: "23.75", optionD: "22.75", correctOption: "A", topicTag: "g5_so_thap_phan" },
      { id: 5002, questionText: "Một ô tô đi quãng đường 120km trong 2 giờ. Tính vận tốc ô tô?", optionA: "60 km/h", optionB: "50 km/h", optionC: "240 km/h", optionD: "70 km/h", correctOption: "A", topicTag: "g5_chuyen_dong_deu" }
    ]
  }
];

const INITIAL_SUBMISSIONS = [
  {
    id: 501,
    grade: 2,
    quizId: 20,
    quizTitle: "Bài kiểm tra Lớp 2: Đột phá Phép cộng trừ & Đồng hồ",
    studentId: 101,
    studentName: "Nguyễn Văn An",
    score: 8.0,
    maxScore: 10.0,
    totalTimeSeconds: 245,
    submittedAt: "2026-08-03T14:30:00Z",
    details: [
      { questionId: 2001, selectedOption: "B", isCorrect: true, topicTag: "g2_cong_tru_100" },
      { questionId: 2002, selectedOption: "B", isCorrect: true, topicTag: "g2_dong_ho" },
      { questionId: 2003, selectedOption: "A", isCorrect: false, topicTag: "g2_loi_van" }
    ],
    antiCheatLogs: [
      { eventType: "blur", message: "Học sinh rời màn hình 1 lần (chuyển tab trong 4 giây)", timestamp: "2026-08-03T14:28:10Z" }
    ],
    teacherFeedback: "Em làm bài rất tốt! Đọc kỹ bài toán lời văn hơn nữa nhé."
  }
];

const INITIAL_AI_RECOMMENDATIONS = [
  {
    id: 1,
    grade: 2,
    studentId: 101,
    weakTopic: "g2_loi_van",
    weakTopicName: "Giải bài toán có lời văn",
    recommendationText: "Học sinh An tính nhầm bài toán lời văn 1 bước tính.",
    suggestedTask: "Luyện 5 bài toán lời văn thực tế Lớp 2",
    status: "pending"
  }
];
