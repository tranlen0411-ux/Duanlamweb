/* ============================================================
   TEACHER DASHBOARD & AI ANALYTICS CONTROLLER (GRADES 1-5)
   ============================================================ */

class TeacherDashboard {
  constructor() {
    this.selectedStudentId = null;
  }

  getGrade() {
    return window.dbStore ? window.dbStore.getSelectedGrade() : 2;
  }

  renderOverviewStats() {
    const grade = this.getGrade();
    const students = window.dbStore ? window.dbStore.getStudents() : [];
    const submissions = window.dbStore ? window.dbStore.getSubmissions(grade) : [];

    const totalStudentsElem = document.getElementById("stat-total-students");
    const totalSubmissionsElem = document.getElementById("stat-total-submissions");
    const avgScoreElem = document.getElementById("stat-avg-score");
    const totalWarningsElem = document.getElementById("stat-total-warnings");

    if (totalStudentsElem) totalStudentsElem.textContent = students.length;
    if (totalSubmissionsElem) totalSubmissionsElem.textContent = submissions.length;

    let totalScore = 0;
    let warningCount = 0;

    submissions.forEach(s => {
      totalScore += (s.score || 0);
      if (s.antiCheatLogs && s.antiCheatLogs.length > 0) {
        warningCount += s.antiCheatLogs.length;
      }
    });

    const avg = submissions.length > 0 ? (totalScore / submissions.length).toFixed(1) : "0.0";
    if (avgScoreElem) avgScoreElem.textContent = avg + "/10";
    if (totalWarningsElem) totalWarningsElem.textContent = warningCount;
  }

  renderStudentTable() {
    const tableBody = document.getElementById("teacher-student-table-body");
    if (!tableBody) return;

    const grade = this.getGrade();
    const students = window.dbStore ? window.dbStore.getStudents() : [];
    const submissions = window.dbStore ? window.dbStore.getSubmissions(grade) : [];

    tableBody.innerHTML = students.map(st => {
      const studentSubs = submissions.filter(s => s.studentId === st.id);
      const latestSub = studentSubs[0] || null;
      const scoreDisplay = latestSub ? `${latestSub.score}/10` : "Chưa làm bài lớp này";
      const hasCheatLog = latestSub && latestSub.antiCheatLogs && latestSub.antiCheatLogs.length > 0;
      const statusBadge = latestSub 
        ? (hasCheatLog 
            ? `<span class="cheat-tag warning">⚠️ Rời tab (${latestSub.antiCheatLogs.length})</span>` 
            : `<span class="cheat-tag clean">✅ Trung thực</span>`)
        : `<span class="cheat-tag clean" style="background:#f1f5f9; color:#64748b;">Mới</span>`;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 800;">${st.name}</td>
          <td style="padding: 12px;">Lớp ${st.class || grade}</td>
          <td style="padding: 12px; font-weight: 900; color: #2563eb;">${scoreDisplay}</td>
          <td style="padding: 12px;">${statusBadge}</td>
          <td style="padding: 12px; text-align: center;">
            <button class="btn btn-secondary" onclick="teacherDashboard.viewStudentDetails(${st.id})" style="padding: 4px 12px; border-radius: 8px; font-weight: 800;">🔍 Xem Chi Tiết</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  viewStudentDetails(studentId) {
    this.selectedStudentId = studentId;
    alert(`🔍 Đang tải dữ liệu tiến độ học tập cho Học Sinh ID: ${studentId}`);
  }
}

window.teacherDashboard = new TeacherDashboard();
