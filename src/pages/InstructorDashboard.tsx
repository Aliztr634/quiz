import React, { useState, useEffect } from 'react'
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CardActions
} from '@mui/material'
import { Add, Logout, MenuBook, Quiz, Edit, Delete, QuestionAnswer } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Course, Exam, Question } from '../types'

const InstructorDashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [studentResults, setStudentResults] = useState<any[]>([])
  const [filteredResults, setFilteredResults] = useState<any[]>([])
  const [selectedExamFilter, setSelectedExamFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [selectedStudentResult, setSelectedStudentResult] = useState<any>(null)
  const [studentAnswers, setStudentAnswers] = useState<any[]>([])
  const [openStudentDetails, setOpenStudentDetails] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openQuestionsDialog, setOpenQuestionsDialog] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState('')
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    courseId: ''
  })
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    timer_seconds: 60,
    question_order: 1
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch instructor's courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          *,
          subjects(name)
        `)
        .eq('instructor_id', user?.id)
        .order('name')
      setCourses(coursesData || [])

      // Fetch instructor's exams
      const { data: examsData } = await supabase
        .from('exams')
        .select(`
          *,
          courses(name, subjects(name))
        `)
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false })
      setExams(examsData || [])

      // Fetch student results for instructor's exams
      const examIds = examsData?.map(exam => exam.id) || []
      if (examIds.length > 0) {
        const { data: resultsData } = await supabase
          .from('exam_attempts')
          .select(`
            *,
            users(name, username),
            exams(title, courses(name))
          `)
          .in('exam_id', examIds)
          .order('completed_at', { ascending: false })
        setStudentResults(resultsData || [])
        setFilteredResults(resultsData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter results by exam
  useEffect(() => {
    if (selectedExamFilter === 'all') {
      setFilteredResults(studentResults)
    } else {
      const filtered = studentResults.filter(result => result.exam_id === selectedExamFilter)
      setFilteredResults(filtered)
    }
  }, [selectedExamFilter, studentResults])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleCreateExam = () => {
    setExamForm({ title: '', description: '', courseId: '' })
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError('')
    setExamForm({ title: '', description: '', courseId: '' })
  }

  const handleSubmitExam = async () => {
    if (!examForm.title.trim() || !examForm.courseId) {
      setError('Title and course are required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          title: examForm.title,
          description: examForm.description,
          course_id: examForm.courseId,
          instructor_id: user?.id,
          is_active: true
        }])
        .select(`
          *,
          courses(name, subjects(name))
        `)
        .single()

      if (error) {
        console.error('Error creating exam:', error)
        setError('Failed to create exam')
        return
      }

      setExams([data, ...exams])
      handleCloseDialog()
    } catch (err) {
      console.error('Error creating exam:', err)
      setError('Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  const handleEditExam = (examId: string) => {
    // Placeholder for exam editing
    console.log('Edit exam:', examId)
  }

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId)

      if (error) {
        console.error('Error deleting exam:', error)
        setError('Failed to delete exam')
        return
      }

      setExams(exams.filter(exam => exam.id !== examId))
    } catch (err) {
      console.error('Error deleting exam:', err)
      setError('Failed to delete exam')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleExamStatus = async (examId: string, currentStatus: boolean) => {
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase
        .from('exams')
        .update({ is_active: !currentStatus })
        .eq('id', examId)

      if (error) {
        console.error('Error updating exam status:', error)
        setError('Failed to update exam status')
        return
      }

      setExams(exams.map(exam => 
        exam.id === examId ? { ...exam, is_active: !currentStatus } : exam
      ))
    } catch (err) {
      console.error('Error updating exam status:', err)
      setError('Failed to update exam status')
    } finally {
      setLoading(false)
    }
  }

  const handleManageQuestions = async (exam: Exam) => {
    setSelectedExam(exam)
    setError('')
    
    try {
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('question_order')

      if (error) {
        console.error('Error fetching questions:', error)
        setError('Failed to load questions')
        return
      }

      setQuestions(questionsData || [])
      setOpenQuestionsDialog(true)
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Failed to load questions')
    }
  }

  const handleCloseQuestionsDialog = () => {
    setOpenQuestionsDialog(false)
    setSelectedExam(null)
    setQuestions([])
    setQuestionForm({
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      timer_seconds: 60,
      question_order: 1
    })
    setError('')
  }

  const handleViewStudentDetails = async (result: any) => {
    try {
      setSelectedStudentResult(result)
      
      // Fetch detailed answers for this student's attempt
      const { data: answersData } = await supabase
        .from('answers')
        .select(`
          *,
          questions(question_text, options, correct_answer, question_order)
        `)
        .eq('attempt_id', result.id)
        .order('questions(question_order)')
      
      setStudentAnswers(answersData || [])
      setOpenStudentDetails(true)
    } catch (error) {
      console.error('Error fetching student answers:', error)
      setError('Failed to load student details')
    }
  }

  const handleCloseStudentDetails = () => {
    setOpenStudentDetails(false)
    setSelectedStudentResult(null)
    setStudentAnswers([])
  }

  const handleAddQuestion = async () => {
    if (!selectedExam || !questionForm.question_text.trim() || questionForm.options.some(opt => !opt.trim())) {
      setError('Question text and all options are required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          exam_id: selectedExam.id,
          question_text: questionForm.question_text,
          options: questionForm.options,
          correct_answer: questionForm.correct_answer,
          timer_seconds: questionForm.timer_seconds,
          question_order: questions.length + 1
        }])
        .select()
        .single()

      if (error) {
        console.error('Error adding question:', error)
        setError('Failed to add question')
        return
      }

      setQuestions([...questions, data])
      setQuestionForm({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        timer_seconds: 60,
        question_order: questions.length + 2
      })
    } catch (err) {
      console.error('Error adding question:', err)
      setError('Failed to add question')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) {
        console.error('Error deleting question:', error)
        setError('Failed to delete question')
        return
      }

      setQuestions(questions.filter(q => q.id !== questionId))
    } catch (err) {
      console.error('Error deleting question:', err)
      setError('Failed to delete question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Instructor Dashboard
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
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MenuBook color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{courses.length}</Typography>
                    <Typography color="text.secondary">My Courses</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Quiz color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{exams.length}</Typography>
                    <Typography color="text.secondary">My Exams</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="My Exams" />
            <Tab label="My Courses" />
            <Tab label="Student Results" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">My Exams</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateExam}
              >
                Create Exam
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {exams.map((exam) => (
                <Box key={exam.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" component="div">
                          {exam.title}
                        </Typography>
                        <Chip
                          label={exam.is_active ? 'Active' : 'Inactive'}
                          color={exam.is_active ? 'success' : 'default'}
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
                      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                        <Button
                          size="small"
                          variant={exam.is_active ? "outlined" : "contained"}
                          color={exam.is_active ? "warning" : "success"}
                          onClick={() => handleToggleExamStatus(exam.id, exam.is_active)}
                          disabled={loading}
                        >
                          {exam.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Box>
                          <Button
                            size="small"
                            startIcon={<QuestionAnswer />}
                            onClick={() => handleManageQuestions(exam)}
                            sx={{ mr: 1 }}
                            color="info"
                          >
                            Questions
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditExam(exam.id)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteExam(exam.id)}
                            disabled={loading}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              My Courses
            </Typography>
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
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Student Results
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Exam</InputLabel>
                <Select
                  value={selectedExamFilter}
                  label="Filter by Exam"
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                >
                  <MenuItem value="all">All Exams</MenuItem>
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Summary Statistics */}
            {filteredResults.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {filteredResults.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Attempts
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {Math.round(filteredResults.reduce((sum, result) => sum + (result.score || 0), 0) / filteredResults.length)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {filteredResults.filter(result => result.score >= 70).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Passed (≥70%)
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
            
            {filteredResults.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    No student results available yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Results will appear here once students complete your exams.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredResults.map((result) => (
                  <Card key={result.id} sx={{ border: '1px solid', borderColor: 'grey.300' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {result.users?.name || result.users?.username || 'Unknown Student'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Exam: {result.exams?.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Course: {result.exams?.courses?.name}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={`${Math.round(result.score || 0)}%`}
                            color={result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'error'}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {result.correct_answers || 0} / {result.total_questions || 0} correct
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Started: {new Date(result.started_at).toLocaleString()}
                        </Typography>
                        {result.completed_at && (
                          <Typography variant="body2" color="text.secondary">
                            Completed: {new Date(result.completed_at).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                      
                      {result.completed_at && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Duration: {Math.round((new Date(result.completed_at).getTime() - new Date(result.started_at).getTime()) / 1000 / 60)} minutes
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewStudentDetails(result)}
                        >
                          View Detailed Answers
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Create Exam Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Exam</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Exam Title"
            fullWidth
            variant="outlined"
            value={examForm.title}
            onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={examForm.description}
            onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Course</InputLabel>
            <Select
              value={examForm.courseId}
              onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })}
              label="Course"
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name} - {(course as any).subjects?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitExam} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create Exam'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Questions Management Dialog */}
      <Dialog open={openQuestionsDialog} onClose={handleCloseQuestionsDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Manage Questions - {selectedExam?.title}
          <Typography variant="body2" color="text.secondary">
            {questions.length} question(s) added
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {/* Add Question Form */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>Add New Question</Typography>
            <TextField
              fullWidth
              label="Question Text"
              multiline
              rows={2}
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>Answer Options:</Typography>
            {questionForm.options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  label={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options]
                    newOptions[index] = e.target.value
                    setQuestionForm({ ...questionForm, options: newOptions })
                  }}
                  sx={{ mr: 1 }}
                />
                <Button
                  size="small"
                  variant={questionForm.correct_answer === index ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setQuestionForm({ ...questionForm, correct_answer: index })}
                >
                  Correct
                </Button>
              </Box>
            ))}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                size="small"
                label="Timer (seconds)"
                type="number"
                value={questionForm.timer_seconds}
                onChange={(e) => setQuestionForm({ ...questionForm, timer_seconds: parseInt(e.target.value) || 60 })}
                sx={{ width: 150 }}
              />
              <Button
                variant="contained"
                onClick={handleAddQuestion}
                disabled={loading}
                startIcon={<Add />}
              >
                {loading ? 'Adding...' : 'Add Question'}
              </Button>
            </Box>
          </Card>

          {/* Existing Questions List */}
          <Typography variant="h6" gutterBottom>Existing Questions:</Typography>
          {questions.length === 0 ? (
            <Typography color="text.secondary">No questions added yet.</Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {questions.map((question, index) => (
                <Card key={question.id} sx={{ mb: 2, p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Q{index + 1}: {question.question_text}
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        {question.options.map((option, optIndex) => (
                          <Typography
                            key={optIndex}
                            variant="body2"
                            color={optIndex === question.correct_answer ? "primary" : "text.secondary"}
                            sx={{ fontWeight: optIndex === question.correct_answer ? 'bold' : 'normal' }}
                          >
                            {optIndex + 1}. {option} {optIndex === question.correct_answer ? '(Correct)' : ''}
                          </Typography>
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Timer: {question.timer_seconds}s
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuestionsDialog}>Close</Button>
        </DialogActions>
        </Dialog>

        {/* Student Detailed Answers Dialog */}
        <Dialog 
          open={openStudentDetails} 
          onClose={handleCloseStudentDetails} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Detailed Answers - {selectedStudentResult?.users?.name || selectedStudentResult?.users?.username}
          </DialogTitle>
          <DialogContent>
            {selectedStudentResult && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedStudentResult.exams?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Course: {selectedStudentResult.exams?.courses?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {Math.round(selectedStudentResult.score || 0)}% ({selectedStudentResult.correct_answers || 0}/{selectedStudentResult.total_questions || 0} correct)
                </Typography>
              </Box>
            )}
            
            {studentAnswers.length === 0 ? (
              <Typography color="text.secondary">
                No detailed answers available.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {studentAnswers.map((answer, index) => (
                  <Card key={answer.id} sx={{ 
                    border: '1px solid', 
                    borderColor: answer.is_correct ? 'success.main' : 'error.main',
                    bgcolor: answer.is_correct ? 'success.50' : 'error.50'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ flex: 1 }}>
                          Question {index + 1}: {answer.questions?.question_text}
                        </Typography>
                        <Chip
                          label={answer.is_correct ? 'Correct' : 'Incorrect'}
                          color={answer.is_correct ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {answer.questions?.options?.map((option: string, optionIndex: number) => (
                          <Box
                            key={optionIndex}
                            sx={{
                              p: 1.5,
                              border: '1px solid',
                              borderColor: 
                                optionIndex === answer.selected_option && optionIndex === answer.questions?.correct_answer
                                  ? 'success.main'
                                  : optionIndex === answer.selected_option
                                  ? 'error.main'
                                  : optionIndex === answer.questions?.correct_answer
                                  ? 'success.light'
                                  : 'grey.300',
                              borderRadius: 1,
                              bgcolor:
                                optionIndex === answer.selected_option && optionIndex === answer.questions?.correct_answer
                                  ? 'success.100'
                                  : optionIndex === answer.selected_option
                                  ? 'error.100'
                                  : optionIndex === answer.questions?.correct_answer
                                  ? 'success.50'
                                  : 'transparent'
                            }}
                          >
                            <Typography 
                              variant="body2"
                              sx={{
                                fontWeight: 
                                  optionIndex === answer.selected_option || optionIndex === answer.questions?.correct_answer
                                    ? 'bold'
                                    : 'normal'
                              }}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option}
                              {optionIndex === answer.questions?.correct_answer && (
                                <Chip label="Correct Answer" size="small" color="success" sx={{ ml: 1 }} />
                              )}
                              {optionIndex === answer.selected_option && optionIndex !== answer.questions?.correct_answer && (
                                <Chip label="Student's Answer" size="small" color="error" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStudentDetails}>Close</Button>
          </DialogActions>
        </Dialog>
    </Box>
  )
}

export default InstructorDashboard