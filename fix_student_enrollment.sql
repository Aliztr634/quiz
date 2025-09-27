-- Fix student enrollment and ensure sample data is correct
-- Run this in your Supabase SQL editor

-- First, let's check what we have
SELECT 'Users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'Subjects', count(*) FROM subjects
UNION ALL
SELECT 'Courses', count(*) FROM courses
UNION ALL
SELECT 'Enrollments', count(*) FROM enrollments
UNION ALL
SELECT 'Exams', count(*) FROM exams
UNION ALL
SELECT 'Questions', count(*) FROM questions;

-- Check if student1 is enrolled in any courses
SELECT 
  e.id as enrollment_id,
  u.name as student_name,
  c.name as course_name,
  s.name as subject_name
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN courses c ON e.course_id = c.id
JOIN subjects s ON c.subject_id = s.id
WHERE u.username = 'student1';

-- Check if there are any active exams
SELECT 
  ex.id as exam_id,
  ex.title,
  ex.is_active,
  c.name as course_name,
  s.name as subject_name
FROM exams ex
JOIN courses c ON ex.course_id = c.id
JOIN subjects s ON c.subject_id = s.id
WHERE ex.is_active = true;

-- If no enrollments exist, create them
INSERT INTO enrollments (student_id, course_id)
SELECT 
  u.id as student_id,
  c.id as course_id
FROM users u
CROSS JOIN courses c
WHERE u.username = 'student1'
  AND NOT EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.student_id = u.id AND e.course_id = c.id
  );

-- Ensure all exams are active
UPDATE exams SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Check the results
SELECT 'After fix - Enrollments' as status, count(*) as count FROM enrollments
UNION ALL
SELECT 'After fix - Active Exams', count(*) FROM exams WHERE is_active = true;
