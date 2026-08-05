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
    const students = window.dbStore.getStudents();
    const submissions = window.dbStore.getSubmissions(grade);

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
    const students = window.dbStore.getStudents();
    const submissions = window.dbStore.getSubmissions(grade);

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
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.4rem;">${st.avatar || '👦'}</span>
              <div>
                <strong>${st.fullName}</strong><br>
                <small style="color:var(--neutral-gray)">Lớp ${grade}</small>
              </div>
            </div>
          </td>
          <td>
            <span style="font-weight:800; color:var(--secondary-amber-hover)">Cấp ${st.level || 1}</span> (${st.xpPoints || 0} XP)
          </td>
          <td><strong>${scoreDisplay}</strong></td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-outline" style="padding:6px 14px; font-size:0.85rem;" onclick="teacherDashboard.viewStudentDetails(${st.id})">
              🔍 Xem Bài & Nhận Xét
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  renderAIKnowledgeGapAnalytics() {
    const analyticsContainer = document.getElementById("ai-knowledge-gap-container");
    if (!analyticsContainer) return;

    const grade = this.getGrade();
    const recs = window.dbStore.getAIRecommendations(grade);
    const students = window.dbStore.getStudents();

    if (recs.length === 0) {
      analyticsContainer.innerHTML = `
        <div style="text-align:center; color:var(--neutral-gray); padding:20px;">
          🎉 Chưa phát hiện lỗ hổng kiến thức nghiêm trọng nào ở Lớp ${grade}!
        </div>
      `;
      return;
    }

    analyticsContainer.innerHTML = recs.map(r => {
      const student = students.find(s => s.id === r.studentId) || { fullName: "Học sinh" };
      return `
        <div class="weakness-item">
          <div class="weakness-title">
            🎯 ${student.fullName} - Cần hỗ trợ: ${r.weakTopicName}
          </div>
          <div class="weakness-desc">${r.recommendationText}</div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.85rem; font-weight:700; color:var(--primary-emerald);">${r.suggestedTask}</span>
            <button class="btn btn-secondary recommendation-btn" onclick="teacherDashboard.assignPersonalizedTask(${r.id})">
              ➕ Giao Nhiệm Vụ Này
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  viewStudentDetails(studentId) {
    this.selectedStudentId = studentId;
    const grade = this.getGrade();
    const students = window.dbStore.getStudents();
    const student = students.find(s => s.id === studentId);
    const submissions = window.dbStore.getSubmissionByStudent(studentId, grade);
    const latestSub = submissions[0] || null;

    const modal = document.getElementById("student-detail-modal");
    const content = document.getElementById("student-detail-modal-content");

    if (!student || !modal || !content) return;

    let subHtml = `<p>Học sinh chưa có bài làm nào ở Lớp ${grade}.</p>`;
    if (latestSub) {
      const feedbackText = latestSub.teacherFeedback || "";
      const cheatLogsHtml = (latestSub.antiCheatLogs && latestSub.antiCheatLogs.length > 0)
        ? `<div style="background:#fff1f2; border:1px solid #f43f5e; padding:10px; border-radius:10px; margin:10px 0; color:#9f1239;">
            <strong>⚠️ Nhật ký Cảnh Báo Gian Lận (Lớp ${grade}):</strong><br>
            ${latestSub.antiCheatLogs.map(l => `- ${l.message} (${new Date(l.timestamp).toLocaleTimeString()})`).join("<br>")}
           </div>`
        : `<div style="color:var(--primary-emerald-hover); margin:8px 0;">✅ Học sinh làm bài tập trung, không rời khỏi tab.</div>`;

      subHtml = `
        <div style="background:#f8fafc; padding:16px; border-radius:14px; margin-bottom:15px; border:1.5px solid #e2e8f0;">
          <h4>${latestSub.quizTitle}</h4>
          <p><strong>Điểm số:</strong> <span style="font-size:1.4rem; color:var(--primary-emerald); font-weight:800;">${latestSub.score}/10</span> | <strong>Thời gian:</strong> ${latestSub.totalTimeSeconds} giây</p>
          ${cheatLogsHtml}
        </div>

        <div class="form-group">
          <label>✍️ Nhận Xét Của Giáo Viên (Lớp ${grade}):</label>
          <textarea id="teacher-feedback-input" class="form-control" placeholder="Nhập nhận xét động viên học sinh...">${feedbackText}</textarea>
        </div>
        <button class="btn btn-primary" onclick="teacherDashboard.saveFeedback(${latestSub.id})">💾 Lưu Nhận Xét</button>
      `;
    }

    content.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <span style="font-size:2.5rem;">${student.avatar || '👦'}</span>
        <div>
          <h3>${student.fullName}</h3>
          <p style="color:var(--neutral-gray)">Học sinh Lớp ${grade} • Cấp độ ${student.level || 1} • ${student.xpPoints || 0} XP</p>
        </div>
      </div>
      ${subHtml}
    `;

    modal.classList.add("active");
  }

  saveFeedback(submissionId) {
    const input = document.getElementById("teacher-feedback-input");
    if (!input) return;
    const text = input.value.trim();

    window.dbStore.addTeacherFeedback(submissionId, text);
    alert("🎉 Đã lưu nhận xét thành công!");
    
    const modal = document.getElementById("student-detail-modal");
    if (modal) modal.classList.remove("active");
    this.renderStudentTable();
  }

  assignPersonalizedTask(recId) {
    const grade = this.getGrade();
    const recs = window.dbStore.getAIRecommendations(grade);
    const rec = recs.find(r => r.id === recId);
    if (rec) {
      rec.status = "in_progress";
      window.dbStore.setItem("ai_recommendations", recs);

      window.dbStore.addQuest({
        grade: grade,
        title: rec.suggestedTask,
        description: `Bài tập cá nhân hóa AI rèn luyện kiến thức Lớp ${grade}.`,
        topic: rec.weakTopic,
        targetScore: 100,
        rewardXp: 80,
        rewardCoins: 30,
        icon: "🤖"
      });

      alert(`🚀 Đã giao nhiệm vụ cá nhân hóa Lớp ${grade} cho học sinh!`);
      this.renderAIKnowledgeGapAnalytics();
    }
  }

  createNewQuizFromForm(title, duration, topicTag, qText, optA, optB, optC, optD, correctOpt) {
    const grade = this.getGrade();
    const newQuiz = {
      grade: grade,
      title: title || `Bài kiểm tra Tuần (Lớp ${grade})`,
      durationMinutes: parseInt(duration) || 10,
      isRandomized: true,
      antiCheatEnabled: true,
      questions: [
        {
          id: Date.now(),
          questionText: qText,
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD,
          correctOption: correctOpt,
          explanation: "Đáp án bài kiểm tra vừa khởi tạo",
          topicTag: topicTag || "g2_cong_tru_100"
        }
      ]
    };

    window.dbStore.addQuiz(newQuiz);
    alert(`✨ Đã tạo bài kiểm tra thành công cho Lớp ${grade}!`);
  }
}

window.teacherDashboard = new TeacherDashboard();
