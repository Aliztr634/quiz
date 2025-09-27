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
  Tooltip
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
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [categories, setCategories] = useState<string[]>(['arithmetic'])
  const [generatedQuestions, setGeneratedQuestions] = useState<MathQuestion[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  const availableCategories = [
    { value: 'arithmetic', label: 'Arithmetic', description: 'Addition, subtraction, multiplication, division' },
    { value: 'fractions', label: 'Fractions', description: 'Fraction operations and calculations' },
    { value: 'algebra', label: 'Algebra', description: 'Linear equations, quadratics, systems' },
    { value: 'geometry', label: 'Geometry', description: 'Area, perimeter, volume, angles' }
  ]

  const handleGenerateQuestions = () => {
    const questions = MathQuestionGenerator.generateQuestions(questionCount, categories, difficulty)
    setGeneratedQuestions(questions)
    setPreviewIndex(0)
  }

  const handleRegenerateQuestion = (index: number) => {
    const newQuestions = [...generatedQuestions]
    const newQuestion = MathQuestionGenerator.generateQuestions(1, categories, difficulty)[0]
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
    const newQuestion = MathQuestionGenerator.generateQuestions(1, categories, difficulty)[0]
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
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  label="Difficulty Level"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleGenerateQuestions}
                fullWidth
                size="large"
              >
                Generate Questions
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

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
            2. Choose the difficulty level (Easy, Medium, Hard)
            <br />
            3. Select one or more question categories
            <br />
            4. Click "Generate Questions" to create your math questions
            <br />
            5. Preview and customize the questions as needed
            <br />
            6. Click "Save Questions" to add them to your exam
          </Typography>
        </Alert>
      )}
    </Box>
  )
}

export default MathQuestionGeneratorComponent
