import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcqgxmcqolxbrahhyxji.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcWd4bWNxb2x4YnJhaGh5eGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNjQ3MTQsImV4cCI6MjEwMTY0MDcxNH0.szavY7MZ2T9znw-ja_lmjftlbG6U7-OvEiKFmA3m0HE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
  // Fetch classes
  async getClasses() {
    try {
      const { data, error } = await supabase.from('classes').select('*').order('id');
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase getClasses error]:', err);
      return null;
    }
  },

  // Fetch students
  async getStudents() {
    try {
      const { data, error } = await supabase.from('students').select('*').order('id');
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase getStudents error]:', err);
      return null;
    }
  },

  // Fetch teachers
  async getTeachers() {
    try {
      const { data, error } = await supabase.from('teachers').select('*');
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase getTeachers error]:', err);
      return null;
    }
  },

  // Save Game Score
  async saveGameScore(categoryKey, studentId, studentName, xp) {
    try {
      const { data, error } = await supabase.from('game_scores').upsert({
        category_key: categoryKey,
        student_id: studentId,
        student_name: studentName,
        xp: xp,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase saveGameScore error]:', err);
      return null;
    }
  },

  // Save Exam Score
  async saveExamScore(studentId, studentName, quizTitle, score, timeText) {
    try {
      const { data, error } = await supabase.from('exam_scores').insert([{
        student_id: studentId,
        student_name: studentName,
        quiz_title: quizTitle || 'Bài kiểm tra Tuần 1',
        score: score,
        exam_time: timeText,
        updated_at: new Date().toISOString()
      }]);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase saveExamScore error]:', err);
      return null;
    }
  }
};
