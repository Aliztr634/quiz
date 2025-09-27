import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material'
import { AccessTime, ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Question } from '../types'

const Exam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const { } = useAuth()
  const navigate = useNavigate()
  
  // Get attemptId from URL search params
  const searchParams = new URLSearchParams(window.location.search)
  const attemptId = searchParams.get('attempt')
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, number>>(new Map())
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timerExpired, setTimerExpired] = useState(false)
  const [lastSavedAnswer, setLastSavedAnswer] = useState<string | null>(null)

  // Ensure currentQuestionIndex is within bounds
  const safeQuestionIndex = Math.max(0, Math.min(currentQuestionIndex, questions.length - 1))
  const currentQuestion = questions[safeQuestionIndex]
  const totalQuestions = questions.length
  const isLastQuestion = safeQuestionIndex === totalQuestions - 1

  // Removed final safeguard as it was preventing navigation

  // Debug logging (reduced frequency)
  if (currentQuestionIndex !== 0 || questions.length === 0) {
    console.log('Exam Debug:', {
      totalQuestions,
      currentQuestionIndex,
      safeQuestionIndex,
      currentQuestion: currentQuestion?.question_text,
      isLastQuestion,
      answers: Array.from(answers.entries())
    })
  }

  const loadExam = useCallback(async () => {
    if (!examId || !attemptId) {
      console.error('Missing examId or attemptId:', { examId, attemptId })
      setError('Invalid exam link')
      return
    }

    try {
      setLoading(true)
      console.log('Loading exam:', examId, 'attempt:', attemptId)
      
      // ALWAYS reset to first question when loading exam
      setCurrentQuestionIndex(0)
      setTimerExpired(false)
      setError('')
      console.log('Force reset to first question, index:', 0)
      
      // First, verify the exam exists and is active
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .eq('is_active', true)
        .single()

      if (examError || !examData) {
        console.error('Exam not found or inactive:', examError)
        setError('Exam not found or is no longer available')
        return
      }

      console.log('Exam found:', examData)
      
      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_order')

      if (questionsError) {
        console.error('Error loading questions:', questionsError)
        setError('Failed to load exam questions')
        return
      }

      console.log('Questions loaded:', questionsData)
      console.log('Number of questions:', questionsData?.length || 0)
      setQuestions(questionsData || [])

      if (!questionsData || questionsData.length === 0) {
        setError('This exam has no questions yet')
        return
      }

      // Check if exam has only 1 question
      if (questionsData.length === 1) {
        console.log('⚠️ WARNING: This exam has only 1 question! Next button will submit exam.')
      } else {
        console.log('✅ Exam has', questionsData.length, 'questions. Navigation should work.')
      }

      // Load existing answers
      const { data: answersData } = await supabase
        .from('answers')
        .select('*')
        .eq('attempt_id', attemptId)

      const answersMap = new Map<string, number>()
      answersData?.forEach(answer => {
        answersMap.set(answer.question_id, answer.selected_option)
      })
      setAnswers(answersMap)
      
      console.log('Loaded existing answers:', answersData?.length || 0, 'answers')
      if (answersData && answersData.length > 0) {
        console.log('Answer details:', answersData.map(a => ({
          questionId: a.question_id,
          selectedOption: a.selected_option,
          isCorrect: a.is_correct
        })))
      }

      // Set timer for first question (index 0)
      if (questionsData && questionsData.length > 0) {
        setTimeLeft(questionsData[0].timer_seconds)
        console.log('Set timer for first question (index 0):', questionsData[0].timer_seconds)
        
        // FORCE reset to question 0 after questions are loaded
        console.log('🔧 FORCING reset to question 0 after questions loaded')
        setCurrentQuestionIndex(0)
        setTimerExpired(false)
      }

    } catch (err) {
      console.error('Error loading exam:', err)
      setError('An error occurred while loading the exam')
    } finally {
      setLoading(false)
    }
  }, [examId, attemptId])

  useEffect(() => {
    // ALWAYS reset to first question when component mounts
    setCurrentQuestionIndex(0)
    setTimerExpired(false)
    console.log('Component mounted - forcing reset to question 0')
    loadExam()
  }, []) // Empty dependency array - only run once on mount

  // Additional safeguard: ensure we're always at question 0 when questions load
  // REMOVED: This was causing the navigation to reset back to question 0
  // The loadExam function already handles resetting to question 0 when needed

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isSubmitted])

  // Auto-advance when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && currentQuestion) {
      setTimerExpired(true)
      console.log('Timer expired for question:', currentQuestion.question_text, 'auto-advancing...')
      // Use a small delay to prevent conflicts with manual navigation
      setTimeout(() => {
        if (isLastQuestion) {
          console.log('Timer expired - submitting exam...')
          handleSubmitExam()
        } else {
          const nextIndex = safeQuestionIndex + 1
          console.log('Timer expired - moving to next question:', nextIndex)
          if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex)
            setTimeLeft(questions[nextIndex]?.timer_seconds || 0)
            setTimerExpired(false)
          }
        }
      }, 100)
    }
  }, [timeLeft, isSubmitted, currentQuestion, isLastQuestion, safeQuestionIndex, questions.length])

  // Debug effect to track question index changes
  useEffect(() => {
    console.log('🔍 Question index changed to:', currentQuestionIndex, 'Question:', currentQuestion?.question_text)
  }, [currentQuestionIndex, currentQuestion])

  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQuestion || isSubmitted || timerExpired) return

    // Clear any previous error messages
    setError('')

    const newAnswers = new Map(answers)
    newAnswers.set(currentQuestion.id, optionIndex)
    setAnswers(newAnswers)

    const previousAnswer = answers.get(currentQuestion.id)
    const isAnswerChanged = previousAnswer !== undefined && previousAnswer !== optionIndex
    
    console.log('Answer selected:', {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question_text,
      selectedOption: optionIndex,
      optionText: currentQuestion.options[optionIndex],
      previousAnswer,
      isAnswerChanged: isAnswerChanged ? 'YES - Answer changed!' : 'NO - First answer'
    })

    // Save answer to database
    saveAnswer(currentQuestion.id, optionIndex)
  }

  const saveAnswer = async (questionId: string, selectedOption: number) => {
    if (!attemptId) return

    try {
      const isCorrect = selectedOption === currentQuestion?.correct_answer
      
      const previousAnswer = answers.get(questionId)
      const isAnswerChanged = previousAnswer !== undefined && previousAnswer !== selectedOption
      
      console.log('Saving answer:', {
        attemptId,
        questionId,
        selectedOption,
        isCorrect,
        previousAnswer,
        isAnswerChanged: isAnswerChanged ? 'YES - Updating existing answer!' : 'NO - New answer'
      })
      
      const { error } = await supabase
        .from('answers')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_option: selectedOption,
          is_correct: isCorrect,
          answered_at: new Date().toISOString()
        }, {
          onConflict: 'attempt_id,question_id'
        })

      if (error) {
        console.error('Error saving answer:', error)
      } else {
        const successMessage = isAnswerChanged ? '✅ Answer updated successfully!' : '✅ Answer saved successfully!'
        console.log(successMessage)
        setLastSavedAnswer(questionId)
        // Clear the indicator after 2 seconds
        setTimeout(() => setLastSavedAnswer(null), 2000)
      }
    } catch (err) {
      console.error('Error saving answer:', err)
    }
  }

  const handleNextQuestion = () => {
    console.log('Next button clicked!', {
      currentIndex: currentQuestionIndex,
      safeIndex: safeQuestionIndex,
      isLastQuestion,
      totalQuestions,
      questionsLength: questions.length,
      isSubmitted,
      timerExpired
    })
    
    if (isLastQuestion) {
      console.log('This is the last question, submitting exam...')
      handleSubmitExam()
    } else {
      const nextIndex = safeQuestionIndex + 1
      console.log('Moving to next question:', nextIndex, 'from', safeQuestionIndex)
      
      // Validate next index is within bounds
      if (nextIndex >= questions.length) {
        console.error('Next index out of bounds:', nextIndex, 'questions length:', questions.length)
        return
      }
      
      setCurrentQuestionIndex(nextIndex)
      setTimeLeft(questions[nextIndex]?.timer_seconds || 0)
      setTimerExpired(false) // Reset timer expiration for new question
      console.log('✅ Successfully moved to question:', nextIndex)
      console.log('🔍 New question will be:', questions[nextIndex]?.question_text)
    }
  }

  const handlePreviousQuestion = () => {
    if (safeQuestionIndex > 0) {
      const prevIndex = safeQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      setTimeLeft(questions[prevIndex]?.timer_seconds || 0)
      setTimerExpired(false) // Reset timer expiration for previous question
      console.log('Moving to previous question:', prevIndex)
    }
  }

  const handleSubmitExam = async () => {
    if (!attemptId || isSubmitted) return

    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers.has(q.id))
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`)
      return
    }

    try {
      setIsSubmitted(true)

      // Calculate score
      const { data: answersData } = await supabase
        .from('answers')
        .select('*')
        .eq('attempt_id', attemptId)

      const correctAnswers = answersData?.filter(answer => answer.is_correct).length || 0
      const totalQuestions = answersData?.length || 0
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

      // Update exam attempt
      const { error: updateError } = await supabase
        .from('exam_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score: score,
          correct_answers: correctAnswers,
          total_questions: totalQuestions
        })
        .eq('id', attemptId)

      if (updateError) {
        console.error('Error updating exam attempt:', updateError)
      }

      // Navigate back to student dashboard (results tab)
      navigate('/?tab=results')
    } catch (err) {
      console.error('Error submitting exam:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h4" gutterBottom color="error">
            Error
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </Card>
      </Box>
    )
  }

  if (!currentQuestion) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h4" gutterBottom>
            No Questions Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            This exam doesn't have any questions yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Back to Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime color={timeLeft <= 10 ? 'error' : 'primary'} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'monospace',
                  color: timeLeft <= 10 ? 'error.main' : 'text.primary'
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Question {safeQuestionIndex + 1} of {totalQuestions}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(((safeQuestionIndex + 1) / totalQuestions) * 100)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={((safeQuestionIndex + 1) / totalQuestions) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Question */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Question {safeQuestionIndex + 1}: {currentQuestion.question_text}
              </Typography>
              
              {/* Question progress indicator */}
              <Box sx={{ mb: 2, p: 1, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
                <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                  ✓ Question {safeQuestionIndex + 1} of {totalQuestions} | Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  {answers.has(currentQuestion.id) && (
                    <span style={{ marginLeft: '8px', color: '#1976d2' }}>
                      • Answer saved
                    </span>
                  )}
                  {lastSavedAnswer === currentQuestion.id && (
                    <span style={{ marginLeft: '8px', color: '#2e7d32', fontWeight: 'bold' }}>
                      ✓ Answer updated!
                    </span>
                  )}
                </Typography>
              </Box>

              {timerExpired && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Time's up! You can no longer answer this question. Click Next to continue.
                </Alert>
              )}

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={answers.get(currentQuestion.id) ?? ''}
                  onChange={(e) => handleAnswerSelect(parseInt(e.target.value))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={<Radio disabled={timerExpired} />}
                      label={
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            ml: 1,
                            color: timerExpired ? 'text.disabled' : 'text.primary'
                          }}
                        >
                          {option}
                        </Typography>
                      }
                      sx={{
                        p: 2,
                        mb: 1,
                        border: '2px solid',
                        borderColor: answers.get(currentQuestion.id) === index ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        bgcolor: answers.get(currentQuestion.id) === index ? 'primary.50' : 'transparent',
                        opacity: timerExpired ? 0.6 : 1,
                        transform: answers.get(currentQuestion.id) === index ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': timerExpired ? {} : {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                          transform: 'scale(1.02)'
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handlePreviousQuestion}
                disabled={safeQuestionIndex === 0}
              >
                Previous
              </Button>

              <Button
                variant="contained"
                endIcon={isLastQuestion ? <CheckCircle /> : <ArrowForward />}
                onClick={() => {
                  console.log('Next button onClick triggered')
                  handleNextQuestion()
                }}
                disabled={isSubmitted}
                sx={{
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                {isLastQuestion ? 'Submit Exam' : 'Next'}
              </Button>
            </Box>

            {/* Question Navigation Dots */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {questions.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: index === safeQuestionIndex 
                      ? 'primary.main' 
                      : answers.has(questions[index].id) 
                        ? 'success.main' 
                        : 'grey.300',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.2)'
                    }
                  }}
                  onClick={() => {
                    if (index !== safeQuestionIndex) {
                      setCurrentQuestionIndex(index)
                      setTimeLeft(questions[index]?.timer_seconds || 0)
                      setTimerExpired(false)
                    }
                  }}
                  title={`Question ${index + 1}${answers.has(questions[index].id) ? ' (answered)' : ''}`}
                />
              ))}
            </Box>


            {/* Answer Validation Message */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Answer Progress */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Answer Progress: {answers.size} / {totalQuestions} questions answered
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(answers.size / totalQuestions) * 100}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Exam
