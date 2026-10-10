// ============================================================
// TypeScript Type Definitions
// ============================================================

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  google_id?: string;
}

export interface Student {
  id: number;
  user_id: number;
  full_name: string;
  education?: string;
  learning_preference: 'video' | 'text' | 'projects' | 'mixed';
  career_goal_id?: number;
  career_goal?: CareerGoal;
  created_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

export interface StudentSkill {
  id: number;
  skill: Skill;
  self_rated_level: 'beginner' | 'intermediate' | 'advanced';
  proficiency_score: number;
}

export interface CareerGoal {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  required_skills: Array<{ skill: string; level: number }>;
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  options: string[];
  skill_id: number;
  skill?: Skill;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Assessment {
  id: number;
  title: string;
  career_goal_id: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  id: number;
  assessment_id: number;
  scores_per_skill: Record<string, number>;
  overall_score: number;
  taken_at: string;
}

export interface Resource {
  type: 'video' | 'docs' | 'practice' | 'project';
  title: string;
  url: string;
}

export interface CurriculumWeek {
  id: number;
  week_number: number;
  topic: string;
  subtopics: string[];
  resources: Resource[];
  estimated_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Curriculum {
  id: number;
  career_goal_id: number;
  skill_gaps: string[];
  strong_skills: string[];
  weak_skills: string[];
  learning_priorities: string[];
  total_weeks: number;
  generated_at: string;
  weeks: CurriculumWeek[];
}

export interface RoadmapWeek {
  week_id: number;
  week_number: number;
  topic: string;
  subtopics: string[];
  estimated_hours: number;
  difficulty: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources?: Resource[];
}

export interface RoadmapData {
  career_goal: string;
  total_weeks: number;
  strong_skills: string[];
  skill_gaps: string[];
  weeks: RoadmapWeek[];
}

export interface ProgressSummary {
  total_topics: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_percentage: number;
}

export interface AdminUserOut {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  student_name?: string;
}

export interface PlatformStats {
  total_users: number;
  total_students: number;
  total_curricula: number;
  active_users_today: number;
  career_goal_distribution: Record<string, number>;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  skill: string;
}

export interface Quiz {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface QuizSubmitResult {
  score_percentage: number;
  action: 'advanced' | 'remedial_added' | 'in_progress';
  message: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources: Resource[];
}

export interface NotificationItem {
  id: number;
  student_id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  is_read: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ---- Version 2 Types ----
export interface Achievement {
  id: number;
  badge_key: string;
  badge_name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface WeeklyReport {
  id?: number;
  week_number: number;
  report: string;
  completion_percentage: number;
  generated_at?: string;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  score: number;
  action_taken: string;
  weak_concepts: string[];
  taken_at: string;
}

// ---- Version 3 Types ----
export interface DocumentItem {
  id: number;
  filename: string;
  file_size: number;
  mime_type: string;
  is_indexed: boolean;
  chunk_count: number;
  uploaded_at: string;
}

export interface CitationSource {
  source_id?: number;
  filename: string;
  chunk_index: number;
  snippet: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source_chunks?: CitationSource[];
  created_at: string;
}

export interface ChatSession {
  id: number;
  title: string;
  curriculum_week_id?: number;
  started_at: string;
  message_count?: number;
}

export interface FlashcardItem {
  id: number;
  front_text: string;
  back_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_mastered: boolean;
}

export interface FlashcardDeck {
  id: number;
  title: string;
  topic?: string;
  source_type: 'curriculum' | 'document' | 'custom';
  source_id?: number;
  created_at: string;
  items: FlashcardItem[];
}

export interface StudentNote {
  id: number;
  title: string;
  summary_text: string;
  key_takeaways: string[];
  document_id?: number;
  curriculum_week_id?: number;
  generated_at: string;
}
