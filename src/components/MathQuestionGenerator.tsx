import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress
} from '@mui/material'
import {
  Add,
  Refresh,
  Delete,
  Save
} from '@mui/icons-material'
import { MathQuestionGenerator } from '../utils/mathQuestionGenerator'
import type { MathQuestion } from '../utils/mathQuestionGenerator'

interface MathQuestionGeneratorProps {
  onQuestionsGenerated: (questions: MathQuestion[]) => void
  onClose: () => void
}

const MathQuestionGeneratorComponent: React.FC<MathQuestionGeneratorProps> = ({
  onQuestionsGenerated,
  onClose
}) => {
  const [questionCount, setQuestionCount] = useState(5)
  const [categories, setCategories] = useState<string[]>(['arithmetic'])
  const [generatedQuestions, setGeneratedQuestions] = useState<MathQuestion[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [gradeLevel, setGradeLevel] = useState<number>(6)
  const [language, setLanguage] = useState<'french' | 'english'>('english')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationCancelled, setGenerationCancelled] = useState(false)

  const availableCategories = [
    { value: 'arithmetic', label: 'Arithmetic', description: 'Addition, subtraction, multiplication, division' },
    { value: 'fractions', label: 'Fractions', description: 'Fraction operations and calculations' },
    { value: 'algebra', label: 'Algebra', description: 'Linear equations, quadratics, systems' },
    { value: 'geometry', label: 'Geometry', description: 'Area, perimeter, volume, angles' }
  ]

  // Helper function to yield control to browser
  const yieldToBrowser = () => {
    return new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  }

  const handleGenerateQuestions = async () => {
    // Calculate complexity factor based on categories and grade
    const categoryCount = categories.length
    const complexityFactor = Math.max(1, categoryCount * 0.8) // More aggressive reduction for categories
    
    // Much more conservative limits to prevent freezing
    const baseMaxQuestions = gradeLevel >= 12 ? 2 : 
                            gradeLevel >= 10 ? 3 : 
                            gradeLevel >= 8 ? 4 :
                            gradeLevel >= 6 ? 6 :
                            gradeLevel >= 4 ? 8 :
                            gradeLevel >= 3 ? 10 :
                            12
    
    const maxQuestions = Math.max(1, Math.floor(baseMaxQuestions / complexityFactor))
    const actualQuestionCount = Math.min(questionCount, maxQuestions)
    
    if (actualQuestionCount < questionCount) {
      alert(`For Grade ${gradeLevel} with ${categoryCount} categories, maximum ${actualQuestionCount} questions recommended to prevent freezing.`)
    }
    
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedQuestions([])
    setPreviewIndex(0)
    setGenerationCancelled(false)
    
    const questions: MathQuestion[] = []
    
    // Calculate delay based on grade level - much more conservative delays
    const getDelay = (grade: number) => {
      if (grade <= 3) return 500      // Even easy questions need more time with categories
      if (grade <= 4) return 800      // Easy questions - slower
      if (grade <= 6) return 1200     // Medium-easy questions - much slower
      if (grade <= 8) return 1800     // Medium questions - very slow
      if (grade <= 10) return 2500    // Hard questions - extremely slow
      if (grade <= 12) return 3500    // Very hard questions - maximum slow
      return 4000                     // Maximum delay
    }
    
    // Apply much more aggressive category complexity multiplier
    const baseDelay = getDelay(gradeLevel)
    const categoryMultiplier = Math.max(1, categoryCount * 0.6) // Much more delay for categories
    const delay = Math.floor(baseDelay * categoryMultiplier)
    
    // Generate questions one by one with adaptive delay to prevent crashes
    for (let i = 0; i < actualQuestionCount; i++) {
      // Check if generation was cancelled
      if (generationCancelled) {
        break
      }
      
      try {
        // Yield control to browser before generating
        await yieldToBrowser()
        
        // Generate one question at a time
        const singleQuestion = MathQuestionGenerator.generateQuestions(1, gradeLevel, language, categories)
        questions.push(singleQuestion[0])
        
        // Yield control to browser after generating
        await yieldToBrowser()
        
        // Update progress
        setGenerationProgress(Math.round(((i + 1) / actualQuestionCount) * 100))
        setGeneratedQuestions([...questions])
        
        // Yield control to browser after updating UI
        await yieldToBrowser()
        
        // Adaptive delay based on grade level to prevent UI freezing
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Additional delay for all grades with categories
        if (gradeLevel >= 3) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        if (gradeLevel >= 6) {
          await new Promise(resolve => setTimeout(resolve, 400))
        }
        
        if (gradeLevel >= 8) {
          await new Promise(resolve => setTimeout(resolve, 600))
        }
        
        if (gradeLevel >= 10) {
          await new Promise(resolve => setTimeout(resolve, 800))
        }
        
        // Much more aggressive delays for multiple categories
        if (categoryCount > 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        if (categoryCount > 2) {
          await new Promise(resolve => setTimeout(resolve, 600))
        }
        
        if (categoryCount > 3) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // Yield control to browser for all grades with categories
        if (gradeLevel >= 3) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        if (gradeLevel >= 6) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        if (gradeLevel >= 8) {
          await new Promise(resolve => setTimeout(resolve, 400))
        }
        
        if (gradeLevel >= 10) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Extra yield every 2 questions for grade 6+
        if (gradeLevel >= 6 && (i + 1) % 2 === 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Extra yield every question for grade 10+
        if (gradeLevel >= 10) {
          await new Promise(resolve => setTimeout(resolve, 800))
        }
        
        // Maximum yield for grade 12
        if (gradeLevel >= 12) {
          await new Promise(resolve => setTimeout(resolve, 1200))
        }
        
      } catch (error) {
        console.error('Error generating question:', error)
        // Continue with next question even if one fails
      }
    }
    
    setIsGenerating(false)
    setGenerationProgress(100)
  }

  const handleStopGeneration = () => {
    setGenerationCancelled(true)
    setIsGenerating(false)
  }

  const handleRegenerateQuestion = (index: number) => {
    const newQuestions = [...generatedQuestions]
    const newQuestion = MathQuestionGenerator.generateQuestions(1, gradeLevel, language, categories)[0]
    newQuestions[index] = newQuestion
    setGeneratedQuestions(newQuestions)
  }

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = generatedQuestions.filter((_, i) => i !== index)
    setGeneratedQuestions(newQuestions)
    if (previewIndex >= newQuestions.length) {
      setPreviewIndex(Math.max(0, newQuestions.length - 1))
    }
  }

  const handleAddQuestion = () => {
    const newQuestion = MathQuestionGenerator.generateQuestions(1, gradeLevel, language, categories)[0]
    setGeneratedQuestions([...generatedQuestions, newQuestion])
  }

  const handleSaveQuestions = () => {
    onQuestionsGenerated(generatedQuestions)
    onClose()
  }

  const handleCategoryToggle = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category))
    } else {
      setCategories([...categories, category])
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const getQuestionTypeColor = (type: string) => {
    if (type.includes('addition')) return 'primary'
    if (type.includes('subtraction')) return 'secondary'
    if (type.includes('multiplication')) return 'success'
    if (type.includes('division')) return 'warning'
    if (type.includes('fraction')) return 'info'
    if (type.includes('algebra')) return 'error'
    if (type.includes('geometry')) return 'default'
    return 'default'
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        🧮 Math Question Generator
      </Typography>

      {/* Configuration Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuration
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Number of Questions</InputLabel>
                <Select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  label="Number of Questions"
                >
                  {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Grade Level</InputLabel>
                <Select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  label="Grade Level"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                    <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'french' | 'english')}
                  label="Language"
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="french">French</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Add />}
                onClick={handleGenerateQuestions}
                fullWidth
                size="large"
                disabled={isGenerating}
              >
                {isGenerating ? `Generating... ${generationProgress}%` : 'Generate Questions'}
              </Button>
              {isGenerating && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleStopGeneration}
                  size="large"
                >
                  Stop
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Progress Bar */}
          {isGenerating && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  Generating Grade {gradeLevel} Questions...
                </Typography>
                <Typography variant="body2" color="primary">
                  {generationProgress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={generationProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              {gradeLevel >= 3 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {gradeLevel >= 10 ? 'High-grade questions take much longer to generate. Please be very patient...' : 
                   gradeLevel >= 8 ? 'Grade 8+ questions generate very slowly to prevent freezing. Please be patient...' : 
                   gradeLevel >= 6 ? 'Grade 6+ questions generate slowly to prevent freezing. Please be patient...' :
                   'Grade 3+ questions generate slowly to prevent freezing. Please be patient...'}
                </Typography>
              )}
            </Box>
          )}

          <Typography variant="h6" gutterBottom>
            Question Categories
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableCategories.map(category => (
              <Chip
                key={category.value}
                label={category.label}
                color={categories.includes(category.value) ? 'primary' : 'default'}
                variant={categories.includes(category.value) ? 'filled' : 'outlined'}
                onClick={() => handleCategoryToggle(category.value)}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select one or more categories to include in your questions
          </Typography>
          
          {(questionCount > 10 || gradeLevel >= 3 || categories.length > 1) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Complex Generation:</strong> 
                {questionCount > 10 && ` Generating ${questionCount} questions`}
                {gradeLevel >= 3 && ` Grade ${gradeLevel} questions`}
                {categories.length > 1 && ` with ${categories.length} categories`}
                {questionCount > 10 && gradeLevel >= 3 && ' with complexity'} may take some time. 
                Questions are generated one by one very slowly to prevent crashes. You can stop generation at any time.
                {gradeLevel >= 3 && (
                  <><br/><strong>Conservative limits:</strong> Grade 3-4: max 8-10, Grade 6-8: max 4-6, Grade 10-12: max 2-3 questions</>
                )}
                {categories.length > 1 && (
                  <><br/><strong>Multiple categories:</strong> Each additional category significantly reduces question count to prevent freezing</>
                )}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Generated Questions ({generatedQuestions.length})
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddQuestion}
                  sx={{ mr: 1 }}
                >
                  Add Question
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveQuestions}
                >
                  Save Questions
                </Button>
              </Box>
            </Box>

            {/* Question Preview */}
            {generatedQuestions.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Preview Question {previewIndex + 1} of {generatedQuestions.length}
                </Typography>
                
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {generatedQuestions[previewIndex].question_text}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={generatedQuestions[previewIndex].difficulty}
                        color={getDifficultyColor(generatedQuestions[previewIndex].difficulty)}
                        size="small"
                      />
                      <Chip
                        label={generatedQuestions[previewIndex].question_type}
                        color={getQuestionTypeColor(generatedQuestions[previewIndex].question_type)}
                        size="small"
                      />
                      <Chip
                        label={`${generatedQuestions[previewIndex].timer_seconds}s`}
                        color="info"
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {generatedQuestions[previewIndex].options.map((option, index) => (
                      <Box key={index} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}>
                        <Box
                          sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor: index === generatedQuestions[previewIndex].correct_answer ? 'success.main' : 'grey.300',
                            borderRadius: 1,
                            bgcolor: index === generatedQuestions[previewIndex].correct_answer ? 'success.50' : 'transparent',
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="body2">
                            {String.fromCharCode(65 + index)}. {option}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Card>

                {/* Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                    disabled={previewIndex === 0}
                  >
                    Previous
                  </Button>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Regenerate this question">
                      <IconButton
                        onClick={() => handleRegenerateQuestion(previewIndex)}
                        color="primary"
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove this question">
                      <IconButton
                        onClick={() => handleRemoveQuestion(previewIndex)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => setPreviewIndex(Math.min(generatedQuestions.length - 1, previewIndex + 1))}
                    disabled={previewIndex === generatedQuestions.length - 1}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}

            {/* Question List */}
            <Box>
              <Typography variant="h6" gutterBottom>
                All Questions
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {generatedQuestions.map((question, index) => (
                  <Box key={index} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        border: previewIndex === index ? '2px solid' : '1px solid',
                        borderColor: previewIndex === index ? 'primary.main' : 'grey.300',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50'
                        }
                      }}
                      onClick={() => setPreviewIndex(index)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Question {index + 1}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip
                              label={question.difficulty}
                              color={getDifficultyColor(question.difficulty)}
                              size="small"
                            />
                            <Chip
                              label={`${question.timer_seconds}s`}
                              color="info"
                              size="small"
                            />
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 1, minHeight: '2.5em' }}>
                          {question.question_text}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {question.question_type}
                          </Typography>
                          <Box>
                            <Tooltip title="Regenerate">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRegenerateQuestion(index)
                                }}
                              >
                                <Refresh fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveQuestion(index)
                                }}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {generatedQuestions.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>How to use:</strong>
            <br />
            1. Select the number of questions you want to generate
            <br />
            2. Choose the grade level (1-12) based on Lebanese curriculum
            <br />
            3. Select the language (English or French)
            <br />
            4. Select one or more question categories
            <br />
            5. Click "Generate Questions" to create your math questions
            <br />
            6. Preview and customize the questions as needed
            <br />
            7. Click "Save Questions" to add them to your exam
            <br />
            <br />
            <strong>Lebanese Curriculum Support:</strong>
            <br />
            • Grades 1-4: Basic arithmetic, simple fractions
            <br />
            • Grades 5-8: Intermediate math, algebra basics, geometry
            <br />
            • Grades 9-12: Advanced algebra, complex geometry, trigonometry
          </Typography>
        </Alert>
      )}
    </Box>
  )
}

export default MathQuestionGeneratorComponent
