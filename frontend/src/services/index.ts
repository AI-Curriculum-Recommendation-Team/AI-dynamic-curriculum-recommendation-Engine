import api from './api';
import type {
  AuthResponse, User, Student, StudentSkill, CareerGoal,
  Assessment, AssessmentResult, Curriculum, RoadmapData,
  ProgressSummary, AdminUserOut, PlatformStats, Quiz
} from '../types';

// ---- Auth ----
export const authService = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  googleAuth: (id_token: string) =>
    api.post<AuthResponse>('/auth/google', { id_token }).then(r => r.data),

  getMe: () => api.get<User>('/auth/me').then(r => r.data),

  logout: () => api.post('/auth/logout'),
};

// ---- Students ----
export const studentService = {
  getProfile: () => api.get<Student>('/students/profile').then(r => r.data),

  updateProfile: (data: Partial<Student>) =>
    api.put<Student>('/students/profile', data).then(r => r.data),

  getSkills: () => api.get<StudentSkill[]>('/students/skills').then(r => r.data),

  setSkills: (skills: Array<{ skill_name: string; self_rated_level: string; proficiency_score: number }>) =>
    api.post<StudentSkill[]>('/students/skills', skills).then(r => r.data),

  setCareerGoal: (career_goal_id: number) =>
    api.post('/students/career', { career_goal_id }).then(r => r.data),
};

// ---- Career Goals ----
export const careerService = {
  listCareers: () => api.get<CareerGoal[]>('/careers/').then(r => r.data),
};

// ---- Assessments ----
export const assessmentService = {
  getAssessment: (career_id: number) =>
    api.get<Assessment>(`/assessments/${career_id}`).then(r => r.data),

  submitAssessment: (data: { assessment_id: number; answers: Record<number, string> }) =>
    api.post<AssessmentResult>('/assessments/submit', data).then(r => r.data),

  getLatestResult: () =>
    api.get<AssessmentResult>('/assessments/results/latest/me').then(r => r.data),

  getResult: (id: number) =>
    api.get<AssessmentResult>(`/assessments/results/${id}`).then(r => r.data),
};

// ---- Curriculum ----
export const curriculumService = {
  generate: (career_goal_id?: number) =>
    api.post<Curriculum>('/curriculum/generate', { career_goal_id }).then(r => r.data),

  getMyCurriculum: () =>
    api.get<Curriculum>('/curriculum/my').then(r => r.data),

  getRoadmap: () =>
    api.get<RoadmapData>('/curriculum/roadmap').then(r => r.data),

  getResources: (week_id: number) =>
    api.get(`/curriculum/resources/${week_id}`).then(r => r.data),

  getTopicQuiz: (week_id: number) =>
    api.get<Quiz>(`/curriculum/quiz/${week_id}`).then(r => r.data),

  submitTopicQuiz: (week_id: number, score_percentage: number, topic: string) =>
    api.post<import('../types').QuizSubmitResult>(`/curriculum/quiz/${week_id}/submit`, { score_percentage, topic }).then(r => r.data),

  getWeeklyReport: () =>
    api.get<{ report: string; completion_percentage: number }>('/curriculum/report/weekly').then(r => r.data),
};

// ---- Progress ----
export const progressService = {
  getAllProgress: () =>
    api.get('/progress/').then(r => r.data),

  updateProgress: (week_id: number, status: string, notes?: string) =>
    api.put(`/progress/${week_id}`, { status, notes }).then(r => r.data),

  getSummary: () =>
    api.get<ProgressSummary>('/progress/summary/me').then(r => r.data),
};

// ---- Notifications (V2) ----
export const notificationService = {
  getNotifications: () =>
    api.get<import('../types').NotificationItem[]>('/notifications/').then(r => r.data),

  markRead: (notif_id: number) =>
    api.put(`/notifications/${notif_id}/read`).then(r => r.data),

  markAllRead: () =>
    api.put('/notifications/read-all').then(r => r.data),
};

// ---- Admin ----
export const adminService = {
  listUsers: () => api.get<AdminUserOut[]>('/admin/users').then(r => r.data),

  toggleUserActive: (user_id: number) =>
    api.put(`/admin/users/${user_id}/toggle-active`).then(r => r.data),

  changeUserRole: (user_id: number, role: string) =>
    api.put(`/admin/users/${user_id}/role?role=${role}`).then(r => r.data),

  getStats: () => api.get<PlatformStats>('/admin/stats').then(r => r.data),
};

// ---- V2 Services ----
export const v2Service = {
  getAchievements: () =>
    api.get<import('../types').Achievement[]>('/v2/achievements').then(r => r.data),

  getWeeklyReport: () =>
    api.get<import('../types').WeeklyReport>('/v2/reports/weekly').then(r => r.data),

  getQuizHistory: () =>
    api.get<import('../types').QuizAttempt[]>('/v2/quiz/history').then(r => r.data),

  generateWeekQuiz: (week_id: number) =>
    api.post<any>(`/v2/quiz/generate/${week_id}`).then(r => r.data),

  submitQuiz: (quiz_id: number, answers: Record<string, string>, score_percentage?: number) =>
    api.post<any>(`/v2/quiz/${quiz_id}/submit`, { answers, score_percentage }).then(r => r.data),

  adaptCurriculum: (week_id: number, score_percentage: number) =>
    api.post<any>('/v2/curriculum/adapt', { week_id, score_percentage }).then(r => r.data),
};

// ---- V3 Services ----
export const documentService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<import('../types').DocumentItem>('/v3/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  list: () =>
    api.get<import('../types').DocumentItem[]>('/v3/documents').then(r => r.data),

  delete: (id: number) =>
    api.delete(`/v3/documents/${id}`).then(r => r.data),

  reindex: (id: number) =>
    api.post<import('../types').DocumentItem>(`/v3/documents/${id}/index`).then(r => r.data),
};

export const tutorService = {
  startSession: (title?: string, curriculum_week_id?: number) =>
    api.post<import('../types').ChatSession>('/v3/tutor/sessions', { title, curriculum_week_id }).then(r => r.data),

  listSessions: () =>
    api.get<import('../types').ChatSession[]>('/v3/tutor/sessions').then(r => r.data),

  getHistory: (sessionId: number) =>
    api.get<import('../types').ChatMessage[]>(`/v3/tutor/sessions/${sessionId}/history`).then(r => r.data),

  sendMessage: (sessionId: number, message: string, topic?: string) =>
    api.post<{
      session_id: number;
      user_message: import('../types').ChatMessage;
      ai_message: import('../types').ChatMessage;
      sources: import('../types').CitationSource[];
    }>(`/v3/tutor/sessions/${sessionId}/message`, { message, topic }).then(r => r.data),

  deleteSession: (sessionId: number) =>
    api.delete(`/v3/tutor/sessions/${sessionId}`).then(r => r.data),
};

export const flashcardService = {
  generateForWeek: (week_id: number) =>
    api.post<import('../types').FlashcardDeck>(`/v3/flashcards/generate/${week_id}`).then(r => r.data),

  generateCustom: (topic?: string, document_id?: number, count: number = 6) =>
    api.post<import('../types').FlashcardDeck>('/v3/flashcards/generate-custom', { topic, document_id, count }).then(r => r.data),

  list: () =>
    api.get<import('../types').FlashcardDeck[]>('/v3/flashcards').then(r => r.data),

  get: (id: number) =>
    api.get<import('../types').FlashcardDeck>(`/v3/flashcards/${id}`).then(r => r.data),

  toggleMaster: (itemId: number) =>
    api.put<{ id: number; is_mastered: boolean }>(`/v3/flashcards/items/${itemId}/master`).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/v3/flashcards/${id}`).then(r => r.data),
};

export const noteService = {
  summarizeDocument: (documentId: number) =>
    api.post<import('../types').StudentNote>(`/v3/notes/summarize/${documentId}`).then(r => r.data),

  summarizeWeek: (weekId: number) =>
    api.post<import('../types').StudentNote>(`/v3/notes/summarize-topic/${weekId}`).then(r => r.data),

  list: () =>
    api.get<import('../types').StudentNote[]>('/v3/notes').then(r => r.data),

  get: (id: number) =>
    api.get<import('../types').StudentNote>(`/v3/notes/${id}`).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/v3/notes/${id}`).then(r => r.data),
};
