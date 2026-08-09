/* ============================================================
   CONFIG & INITIAL SEED DATA FOR GRADES 1-5 - TOÁN CÙNG EM
   ============================================================ */

export const APP_CONFIG = {
  APP_NAME: "Toán cùng em",
  GRADES: [1, 2, 3, 4, 5],
  STORAGE_PREFIX: "toancungem_v2_",
  DEFAULT_QUIZ_DURATION: 10,
  
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

export const INITIAL_USERS = [
  { id: 101, username: "benam", full_name: "Bé Nam", role: "student", class_id: "2AI", xp: 450, coins: 1250 },
  { id: 102, username: "vubaoan", full_name: "Vũ Bảo An", role: "student", class_id: "2AI", xp: 620, coins: 1800 },
  { id: 1, username: "lahuong2904@gmail.com", full_name: "Super Admin (Lã Hương)", role: "admin", class_id: "2AI", xp: 9999, coins: 9999 }
];

export const INITIAL_QUESTS = [
  { id: "q1", title: "Thám hiểm Rừng Xanh", xp: 50, coins: 10, completed: false },
  { id: "q2", title: "Bậc Thầy Xem Đồng Hồ", xp: 80, coins: 15, completed: false }
];

export const INITIAL_QUIZZES = [
  { id: "quiz_w1", title: "Bài kiểm tra Tuần 1", questionsCount: 10, duration: 10 }
];

export const INITIAL_SUBMISSIONS = [];
export const INITIAL_AI_RECOMMENDATIONS = [];
