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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  CardActions
} from '@mui/material'
import { Add, Logout, School, People, MenuBook, Assessment, Edit, Delete } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { User, Subject, Course } from '../types'

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [instructors, setInstructors] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState<'subject' | 'instructor' | 'student' | 'course' | 'edit-course' | 'enroll-student'>('subject')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: ''
  })
  
  // Form states
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' })
  const [courseForm, setCourseForm] = useState({ 
    name: '', 
    description: '', 
    subjectId: '', 
    instructorId: '' 
  })
  const [editCourseForm, setEditCourseForm] = useState({ 
    name: '', 
    description: '', 
    subjectId: '', 
    instructorId: '' 
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name')
      setSubjects(subjectsData || [])

      // Fetch instructors
      const { data: instructorsData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'instructor')
        .order('name')
      setInstructors(instructorsData || [])

      // Fetch students
      const { data: studentsData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
        .order('name')
      setStudents(studentsData || [])

      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          *,
          subjects(name),
          users!courses_instructor_id_fkey(name)
        `)
        .order('name')
      setCourses(coursesData || [])

      // Fetch enrollments
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
          *,
          users!enrollments_student_id_fkey(name, username),
          courses(name, subjects(name))
        `)
        .order('enrolled_at', { ascending: false })
      setEnrollments(enrollmentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubject = async () => {
    if (!subjectForm.name.trim()) {
      setError('Subject name is required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ name: subjectForm.name, description: subjectForm.description }])
        .select()
        .single()

      if (error) {
        console.error('Error adding subject:', error)
        setError('Failed to add subject')
        return
      }

      setSubjects([...subjects, data])
      setSubjectForm({ name: '', description: '' })
      handleCloseDialog()
    } catch (err) {
      console.error('Error adding subject:', err)
      setError('Failed to add subject')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.subjectId || !courseForm.instructorId) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{ 
          name: courseForm.name, 
          description: courseForm.description,
          subject_id: courseForm.subjectId,
          instructor_id: courseForm.instructorId
        }])
        .select(`
          *,
          subjects(name),
          users!courses_instructor_id_fkey(name)
        `)
        .single()

      if (error) {
        console.error('Error adding course:', error)
        setError('Failed to add course')
        return
      }

      setCourses([...courses, data])
      setCourseForm({ name: '', description: '', subjectId: '', instructorId: '' })
      handleCloseDialog()
    } catch (err) {
      console.error('Error adding course:', err)
      setError('Failed to add course')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = async () => {
    if (!selectedCourse || !editCourseForm.name.trim() || !editCourseForm.subjectId || !editCourseForm.instructorId) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ 
          name: editCourseForm.name, 
          description: editCourseForm.description,
          subject_id: editCourseForm.subjectId,
          instructor_id: editCourseForm.instructorId
        })
        .eq('id', selectedCourse.id)
        .select(`
          *,
          subjects(name),
          users!courses_instructor_id_fkey(name)
        `)
        .single()

      if (error) {
        console.error('Error updating course:', error)
        setError('Failed to update course')
        return
      }

      setCourses(courses.map(course => course.id === selectedCourse.id ? data : course))
      setEditCourseForm({ name: '', description: '', subjectId: '', instructorId: '' })
      setSelectedCourse(null)
      handleCloseDialog()
    } catch (err) {
      console.error('Error updating course:', err)
      setError('Failed to update course')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) {
        console.error('Error deleting course:', error)
        setError('Failed to delete course')
        return
      }

      setCourses(courses.filter(course => course.id !== courseId))
    } catch (err) {
      console.error('Error deleting course:', err)
      setError('Failed to delete course')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setEditCourseForm({
      name: course.name,
      description: course.description || '',
      subjectId: course.subject_id,
      instructorId: course.instructor_id
    })
    setDialogType('edit-course')
    setOpenDialog(true)
  }

  const handleEnrollStudent = () => {
    setEnrollmentForm({ studentId: '', courseId: '' })
    setError('')
    setDialogType('enroll-student')
    setOpenDialog(true)
  }

  const handleSubmitEnrollment = async () => {
    if (!enrollmentForm.studentId || !enrollmentForm.courseId) {
      setError('Please select both student and course')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          student_id: enrollmentForm.studentId,
          course_id: enrollmentForm.courseId
        }])
        .select(`
          *,
          users!enrollments_student_id_fkey(name, username),
          courses(name, subjects(name))
        `)
        .single()

      if (error) {
        console.error('Error enrolling student:', error)
        if (error.code === '23505') {
          setError('Student is already enrolled in this course')
        } else {
          setError('Failed to enroll student')
        }
        return
      }

      setEnrollments([data, ...enrollments])
      setEnrollmentForm({ studentId: '', courseId: '' })
      handleCloseDialog()
    } catch (err) {
      console.error('Error enrolling student:', err)
      setError('Failed to enroll student')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!window.confirm('Are you sure you want to remove this enrollment?')) {
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)

      if (error) {
        console.error('Error removing enrollment:', error)
        setError('Failed to remove enrollment')
        return
      }

      setEnrollments(enrollments.filter(e => e.id !== enrollmentId))
    } catch (err) {
      console.error('Error removing enrollment:', err)
      setError('Failed to remove enrollment')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleOpenDialog = (type: 'subject' | 'instructor' | 'student' | 'course' | 'edit-course' | 'enroll-student') => {
    setDialogType(type)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError('')
    setSubjectForm({ name: '', description: '' })
    setCourseForm({ name: '', description: '', subjectId: '', instructorId: '' })
    setEditCourseForm({ name: '', description: '', subjectId: '', instructorId: '' })
    setEnrollmentForm({ studentId: '', courseId: '' })
    setSelectedCourse(null)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
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
                  <School color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{subjects.length}</Typography>
                    <Typography color="text.secondary">Subjects</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <People color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{instructors.length}</Typography>
                    <Typography color="text.secondary">Instructors</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MenuBook color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{students.length}</Typography>
                    <Typography color="text.secondary">Students</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assessment color="warning" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{courses.length}</Typography>
                    <Typography color="text.secondary">Courses</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Subjects" />
            <Tab label="Instructors" />
            <Tab label="Students" />
            <Tab label="Courses" />
            <Tab label="Enrollments" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Subjects</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('subject')}
              >
                Add Subject
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {subjects.map((subject) => (
                <Box key={subject.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {subject.name}
                      </Typography>
                      {subject.description && (
                        <Typography color="text.secondary">
                          {subject.description}
                        </Typography>
                      )}
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
              Instructors
            </Typography>
            <List>
              {instructors.map((instructor) => (
                <ListItem key={instructor.id} divider>
                  <ListItemText
                    primary={instructor.name}
                    secondary={instructor.username}
                  />
                  <Chip label="Instructor" color="primary" size="small" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Students
            </Typography>
            <List>
              {students.map((student) => (
                <ListItem key={student.id} divider>
                  <ListItemText
                    primary={student.name}
                    secondary={student.username}
                  />
                  <Chip label="Student" color="secondary" size="small" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Courses</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('course')}
              >
                Create Course
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {courses.map((course) => (
                <Box key={course.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                    <CardContent onClick={() => handleOpenEditCourse(course)}>
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
                      <Typography variant="body2" color="text.secondary">
                        Instructor: {(course as any).users?.name}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditCourse(course)
                        }}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCourse(course.id)
                        }}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Student Enrollments</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleEnrollStudent}
              >
                Enroll Student
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {enrollments.map((enrollment) => (
                <Box key={enrollment.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {(enrollment as any).users?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Username: {(enrollment as any).users?.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Course: {(enrollment as any).courses?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Subject: {(enrollment as any).courses?.subjects?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveEnrollment(enrollment.id)}
                        color="error"
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Container>

      {/* Add Subject Dialog */}
      <Dialog open={openDialog && dialogType === 'subject'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Subject</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Subject Name"
            fullWidth
            variant="outlined"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={subjectForm.description}
            onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddSubject} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog open={openDialog && dialogType === 'course'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            variant="outlined"
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={courseForm.subjectId}
              onChange={(e) => setCourseForm({ ...courseForm, subjectId: e.target.value })}
              label="Subject"
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Instructor</InputLabel>
            <Select
              value={courseForm.instructorId}
              onChange={(e) => setCourseForm({ ...courseForm, instructorId: e.target.value })}
              label="Instructor"
            >
              {instructors.map((instructor) => (
                <MenuItem key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddCourse} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={openDialog && dialogType === 'edit-course'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            variant="outlined"
            value={editCourseForm.name}
            onChange={(e) => setEditCourseForm({ ...editCourseForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editCourseForm.description}
            onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={editCourseForm.subjectId}
              onChange={(e) => setEditCourseForm({ ...editCourseForm, subjectId: e.target.value })}
              label="Subject"
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Instructor</InputLabel>
            <Select
              value={editCourseForm.instructorId}
              onChange={(e) => setEditCourseForm({ ...editCourseForm, instructorId: e.target.value })}
              label="Instructor"
            >
              {instructors.map((instructor) => (
                <MenuItem key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleEditCourse} variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enroll Student Dialog */}
      <Dialog open={openDialog && dialogType === 'enroll-student'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enroll Student in Course</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Student</InputLabel>
            <Select
              value={enrollmentForm.studentId}
              onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentId: e.target.value })}
              label="Student"
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name} ({student.username})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Course</InputLabel>
            <Select
              value={enrollmentForm.courseId}
              onChange={(e) => setEnrollmentForm({ ...enrollmentForm, courseId: e.target.value })}
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
          <Button onClick={handleSubmitEnrollment} variant="contained" disabled={loading}>
            {loading ? 'Enrolling...' : 'Enroll Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminDashboard