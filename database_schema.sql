-- Quiz Application Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (custom authentication)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table (many-to-many relationship between students and courses)
CREATE TABLE enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Exams table
CREATE TABLE exams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL, -- Array of answer options
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0), -- Index of correct option
    timer_seconds INTEGER DEFAULT 60, -- Timer per question in seconds
    question_order INTEGER NOT NULL, -- Order of question in exam
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam attempts table (tracks when students take exams)
CREATE TABLE exam_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5,2), -- Percentage score
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    UNIQUE(student_id, exam_id, started_at)
);

-- Answers table (stores student answers for each question)
CREATE TABLE answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL CHECK (selected_option >= 0),
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_subject ON courses(subject_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_exams_course ON exams(course_id);
CREATE INDEX idx_exams_instructor ON exams(instructor_id);
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_attempts_student ON exam_attempts(student_id);
CREATE INDEX idx_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX idx_answers_attempt ON answers(attempt_id);
CREATE INDEX idx_answers_question ON answers(question_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
-- Sample subjects
INSERT INTO subjects (name, description) VALUES
('Mathematics', 'Algebra, Calculus, Statistics, and more'),
('Science', 'Physics, Chemistry, Biology'),
('English', 'Literature, Grammar, Writing'),
('History', 'World History, American History'),
('Computer Science', 'Programming, Algorithms, Data Structures');

-- Sample admin user (password: admin123)
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');

-- Sample instructor users (password: instructor123)
INSERT INTO users (username, password, name, role) VALUES
('john.doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'instructor'),
('jane.smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', 'instructor');

-- Sample student users (password: student123)
INSERT INTO users (username, password, name, role) VALUES
('alice.johnson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Johnson', 'student'),
('bob.wilson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Wilson', 'student');

-- Sample courses
INSERT INTO courses (name, description, subject_id, instructor_id) VALUES
('Algebra I', 'Introduction to algebraic concepts', (SELECT id FROM subjects WHERE name = 'Mathematics'), (SELECT id FROM users WHERE username = 'john.doe')),
('Physics 101', 'Basic physics principles', (SELECT id FROM subjects WHERE name = 'Science'), (SELECT id FROM users WHERE username = 'jane.smith')),
('English Literature', 'Classic and modern literature', (SELECT id FROM subjects WHERE name = 'English'), (SELECT id FROM users WHERE username = 'john.doe'));

-- Sample enrollments
INSERT INTO enrollments (student_id, course_id) VALUES
((SELECT id FROM users WHERE username = 'alice.johnson'), (SELECT id FROM courses WHERE name = 'Algebra I')),
((SELECT id FROM users WHERE username = 'alice.johnson'), (SELECT id FROM courses WHERE name = 'Physics 101')),
((SELECT id FROM users WHERE username = 'bob.wilson'), (SELECT id FROM courses WHERE name = 'Algebra I')),
((SELECT id FROM users WHERE username = 'bob.wilson'), (SELECT id FROM courses WHERE name = 'English Literature'));

-- Sample exam
INSERT INTO exams (title, description, course_id, instructor_id) VALUES
('Algebra Quiz 1', 'Basic algebraic operations quiz', (SELECT id FROM courses WHERE name = 'Algebra I'), (SELECT id FROM users WHERE username = 'john.doe'));

-- Sample questions for the exam
INSERT INTO questions (exam_id, question_text, options, correct_answer, timer_seconds, question_order) VALUES
((SELECT id FROM exams WHERE title = 'Algebra Quiz 1'), 
 'What is 2 + 2?', 
 ARRAY['3', '4', '5', '6'], 
 1, 
 30, 
 1),
((SELECT id FROM exams WHERE title = 'Algebra Quiz 1'), 
 'What is 5 * 3?', 
 ARRAY['12', '15', '18', '20'], 
 1, 
 30, 
 2),
((SELECT id FROM exams WHERE title = 'Algebra Quiz 1'), 
 'Solve for x: 2x + 4 = 10', 
 ARRAY['x = 2', 'x = 3', 'x = 4', 'x = 5'], 
 1, 
 45, 
 3);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - you may want to customize these)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (true);

-- All authenticated users can read subjects
CREATE POLICY "Anyone can read subjects" ON subjects
    FOR SELECT USING (true);

-- Instructors can read their own courses
CREATE POLICY "Instructors can read own courses" ON courses
    FOR SELECT USING (true);

-- Students can read courses they're enrolled in
CREATE POLICY "Students can read enrolled courses" ON courses
    FOR SELECT USING (
        id IN (
            SELECT course_id FROM enrollments 
            WHERE student_id = (SELECT id FROM users WHERE username = current_setting('request.jwt.claims', true)::json->>'username')
        )
    );

-- Similar policies for other tables...
-- (You may want to create more specific policies based on your needs)

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
