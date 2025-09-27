import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material'
import { Logout, MenuBook, Quiz, Assessment, PlayArrow, CheckCircle } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Course, Exam, ExamAttempt } from '../types'

const StudentDashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    exam: Exam | null
    action: 'start' | 'resume'
  }>({
    open: false,
    exam: null,
    action: 'start'
  })

  useEffect(() => {
    fetchData()
    
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab')
    if (tabParam === 'results') {
      setActiveTab(2) // Results tab
    }
  }, [searchParams])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch student's enrolled courses
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          courses(
            *,
            subjects(name)
          )
        `)
        .eq('student_id', user?.id)

      const enrolledCourses = enrollments?.map(enrollment => enrollment.courses) || []
      setCourses(enrolledCourses as unknown as Course[])

      // Fetch available exams for enrolled courses
      const courseIds = enrolledCourses.map((course: any) => course.id)
      if (courseIds.length > 0) {
        const { data: examsData } = await supabase
          .from('exams')
          .select(`
            *,
            courses(name, subjects(name))
          `)
          .in('course_id', courseIds)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        setExams(examsData || [])
      }

      // Fetch student's exam attempts
      const { data: attemptsData } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams(title, courses(name))
        `)
        .eq('student_id', user?.id)
        .order('started_at', { ascending: false })
      setAttempts(attemptsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    
    // Update URL with tab parameter
    const newSearchParams = new URLSearchParams(searchParams)
    if (newValue === 2) {
      newSearchParams.set('tab', 'results')
    } else {
      newSearchParams.delete('tab')
    }
    setSearchParams(newSearchParams)
  }

  const handleStartExam = (exam: Exam) => {
    const status = getExamStatus(exam.id)
    setConfirmDialog({
      open: true,
      exam: exam,
      action: status === 'in_progress' ? 'resume' : 'start'
    })
  }

  const handleConfirmStartExam = async () => {
    if (!confirmDialog.exam || !user) return

    setLoading(true)
    setError('')
    
    try {
      let attemptId: string

      // Check if there's already an attempt
      const existingAttempt = attempts.find(attempt => 
        attempt.exam_id === confirmDialog.exam!.id && !attempt.completed_at
      )

      if (existingAttempt) {
        // Resume existing attempt
        attemptId = existingAttempt.id
      } else {
        // Create new attempt
        const { data: attemptData, error: attemptError } = await supabase
          .from('exam_attempts')
          .insert([{
            student_id: user.id,
            exam_id: confirmDialog.exam.id,
            started_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (attemptError) {
          console.error('Error creating exam attempt:', attemptError)
          setError('Failed to start exam')
          return
        }

        attemptId = attemptData.id
      }

      // Navigate to exam page
      window.location.href = `/exam/${confirmDialog.exam.id}?attempt=${attemptId}`
    } catch (err) {
      console.error('Error starting exam:', err)
      setError('Failed to start exam')
    } finally {
      setLoading(false)
      setConfirmDialog({ open: false, exam: null, action: 'start' })
    }
  }

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, exam: null, action: 'start' })
    setError('')
  }

  const getExamStatus = (examId: string) => {
    const attempt = attempts.find(attempt => attempt.exam_id === examId)
    if (!attempt) return 'not_started'
    if (attempt.completed_at) return 'completed'
    return 'in_progress'
  }

  const getExamScore = (examId: string) => {
    const attempt = attempts.find(attempt => 
      attempt.exam_id === examId && attempt.completed_at
    )
    if (!attempt) return null
    return {
      score: attempt.score || 0,
      correct: attempt.correct_answers || 0,
      total: attempt.total_questions || 0
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.name}
          </Typography>
          <Button color="inherit" onClick={signOut} startIcon={<Logout />}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Overview Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MenuBook color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{courses.length}</Typography>
                    <Typography color="text.secondary">Enrolled Courses</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Quiz color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{exams.length}</Typography>
                    <Typography color="text.secondary">Available Exams</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assessment color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{attempts.filter(a => a.completed_at).length}</Typography>
                    <Typography color="text.secondary">Completed Exams</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="My Courses" />
            <Tab label="Available Exams" />
            <Tab label="My Results" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              My Enrolled Courses
            </Typography>
            {courses.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No courses enrolled
                  </Typography>
                  <Typography color="text.secondary">
                    You haven't been enrolled in any courses yet.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {courses.map((course) => (
                  <Box key={course.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {course.name}
                        </Typography>
                        {course.description && (
                          <Typography color="text.secondary" gutterBottom>
                            {course.description}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Subject: {(course as any).subjects?.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Available Exams
            </Typography>
            {exams.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No exams available
                  </Typography>
                  <Typography color="text.secondary">
                    There are no active exams for your enrolled courses.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {exams.map((exam) => {
                  const status = getExamStatus(exam.id)
                  const score = getExamScore(exam.id)
                  
                  return (
                    <Box key={exam.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography variant="h6" component="div">
                              {exam.title}
                            </Typography>
                            <Chip
                              label={status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
                              color={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : 'default'}
                              size="small"
                            />
                          </Box>
                          {exam.description && (
                            <Typography color="text.secondary" gutterBottom>
                              {exam.description}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Course: {(exam as any).courses?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Subject: {(exam as any).courses?.subjects?.name}
                          </Typography>
                          
                          {score && (
                            <Box mt={2}>
                              <Typography variant="body2" gutterBottom>
                                Your Score: {Math.round(score.score)}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={score.score} 
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {score.correct}/{score.total} correct answers
                              </Typography>
                            </Box>
                          )}

                          <Box mt={2}>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={status === 'completed' ? <CheckCircle /> : <PlayArrow />}
                              onClick={() => handleStartExam(exam)}
                              disabled={status === 'completed'}
                            >
                              {status === 'completed' 
                                ? 'Completed' 
                                : status === 'in_progress' 
                                  ? 'Resume Exam' 
                                  : 'Start Exam'
                              }
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              My Exam Results
            </Typography>
            {attempts.filter(a => a.completed_at).length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No completed exams
                  </Typography>
                  <Typography color="text.secondary">
                    You haven't completed any exams yet.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <List>
                {attempts.filter(a => a.completed_at).map((attempt) => (
                  <ListItem key={attempt.id} divider>
                    <ListItemText
                      primary={(attempt as any).exams?.title}
                      secondary={`${(attempt as any).exams?.courses?.name} • Completed: ${new Date(attempt.completed_at!).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Box textAlign="right">
                        <Typography variant="h6" color="primary">
                          {Math.round(attempt.score || 0)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {attempt.correct_answers}/{attempt.total_questions} correct
                        </Typography>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Container>

      {/* Start Exam Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {confirmDialog.action === 'start' ? 'Start Exam' : 'Resume Exam'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body1" gutterBottom>
            {confirmDialog.action === 'start' 
              ? `Are you sure you want to start "${confirmDialog.exam?.title}"?`
              : `Are you sure you want to resume "${confirmDialog.exam?.title}"?`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {confirmDialog.action === 'start' 
              ? 'Once you start, the timer will begin and you cannot pause the exam.'
              : 'You will continue from where you left off.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmStartExam} 
            variant="contained" 
            disabled={loading}
            startIcon={<PlayArrow />}
          >
            {loading ? 'Starting...' : confirmDialog.action === 'start' ? 'Start Exam' : 'Resume Exam'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentDashboard