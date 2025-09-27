// Database types
export interface Subject {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  name: string
  description?: string
  subject_id: string
  instructor_id: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
}

export interface Exam {
  id: string
  title: string
  description?: string
  course_id: string
  instructor_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  exam_id: string
  question_text: string
  options: string[]
  correct_answer: number
  timer_seconds: number
  question_order: number
  created_at: string
}

export interface ExamAttempt {
  id: string
  student_id: string
  exam_id: string
  started_at: string
  completed_at?: string
  score?: number
  total_questions: number
  correct_answers: number
}

export interface Answer {
  id: string
  attempt_id: string
  question_id: string
  selected_option: number
  is_correct: boolean
  answered_at: string
}
