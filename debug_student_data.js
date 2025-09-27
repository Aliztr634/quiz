// Debug script to check student data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ewghnfpqhwogudcxiahm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Z2huZnBxaHdvZ3VkY3hpYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTQ4MjQsImV4cCI6MjA3NDU3MDgyNH0.tShuKYZZLgQZnBWbzUSuF4QlrOU9ifRdkXk2oC5z5CI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugStudentData() {
  console.log('=== DEBUGGING STUDENT DATA ===')
  
  // 1. Check if there are any students
  const { data: students, error: studentsError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
  
  console.log('Students:', students)
  console.log('Students Error:', studentsError)
  
  // 2. Check if there are any enrollments
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select(`
      *,
      users!enrollments_student_id_fkey(name, username),
      courses(name, subjects(name))
    `)
  
  console.log('Enrollments:', enrollments)
  console.log('Enrollments Error:', enrollmentsError)
  
  // 3. Check if there are any courses
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select(`
      *,
      subjects(name),
      users!courses_instructor_id_fkey(name)
    `)
  
  console.log('Courses:', courses)
  console.log('Courses Error:', coursesError)
  
  // 4. Check if there are any exams
  const { data: exams, error: examsError } = await supabase
    .from('exams')
    .select(`
      *,
      courses(name, subjects(name))
    `)
  
  console.log('Exams:', exams)
  console.log('Exams Error:', examsError)
  
  // 5. Check if there are any questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
  
  console.log('Questions:', questions)
  console.log('Questions Error:', questionsError)
}

debugStudentData().catch(console.error)
