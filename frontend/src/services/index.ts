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
