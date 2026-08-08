/* ============================================================
   SUPABASE INTEGRATION MODULE - TOÁN CÙNG EM
   ============================================================ */

// 1. Cấu hình Supabase Credentials (Thay thế URL và Anon Key của bạn vào 2 dòng dưới)
const SUPABASE_URL = "https://your-project-id.supabase.co"; // Thay thế bằng Supabase URL của bạn
const SUPABASE_ANON_KEY = "your-anon-key-here";            // Thay thế bằng Supabase Anon Key của bạn

let supabaseClient = null;

// Khởi tạo Supabase JS Client
if (typeof supabase !== "undefined" && SUPABASE_URL.includes("supabase.co") && !SUPABASE_ANON_KEY.includes("your-anon-key")) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("⚡ [Supabase] Đã kết nối thành công tới Supabase Database!");
  } catch (err) {
    console.warn("⚠️ [Supabase] Chưa thể kết nối tới Supabase:", err);
  }
} else {
  console.log("ℹ️ [Supabase] Đang vận hành chế độ Local Storage dự phòng (Chưa điền Supabase Key).");
}

window.supabaseService = {
  client: supabaseClient,

  // 1. Tải danh sách Lớp Học từ Supabase
  async getClasses() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from("classes").select("*").order("id");
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase getClasses Error]:", e);
      return null;
    }
  },

  // 2. Tải danh sách Học Sinh từ Supabase
  async getStudents() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from("students").select("*").order("id");
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase getStudents Error]:", e);
      return null;
    }
  },

  // 3. Tải danh sách Giáo Viên từ Supabase
  async getTeachers() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from("teachers").select("*");
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase getTeachers Error]:", e);
      return null;
    }
  },

  // 4. Lưu/Cập nhật Điểm XP Trò Chơi lên Supabase
  async saveGameScore(categoryKey, studentId, studentName, xp) {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from("game_scores")
        .upsert({
          category_key: categoryKey,
          student_id: studentId,
          student_name: studentName,
          xp: xp,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase saveGameScore Error]:", e);
      return null;
    }
  },

  // 5. Lưu Bài Nộp / Điểm Bài Kiểm Tra lên Supabase
  async saveExamScore(studentId, studentName, quizTitle, score, timeText) {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from("exam_scores")
        .insert([{
          student_id: studentId,
          student_name: studentName,
          quiz_title: quizTitle || "Bài kiểm tra Tuần 1",
          score: score,
          exam_time: timeText,
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("[Supabase saveExamScore Error]:", e);
      return null;
    }
  }
};
