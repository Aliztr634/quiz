# Quiz Application

A comprehensive quiz application built with React, Vite, TypeScript, and Supabase. Features role-based authentication, real-time exam functionality, and a clean, responsive UI.

## Features

### Authentication & Roles
- **Admin**: Manage users, subjects, and course assignments
- **Instructor**: Create exams, manage questions, view student progress
- **Student**: Take exams, view results, access enrolled courses

### Exam Functionality
- Per-question timers with automatic progression
- Multiple-choice questions with instant feedback
- Real-time exam attempts and scoring
- Resume incomplete exams

### Real-time Features
- Live updates when instructors modify exams
- Real-time progress tracking
- Instant result calculation

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Custom user table (no Supabase Auth)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `database_schema.sql` into the SQL Editor
4. Run the SQL to create all tables and sample data

### 2. Environment Configuration

1. Copy `env.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Login Credentials

The SQL schema includes sample users with these credentials:

### Admin
- **Email**: admin@quiz.com
- **Password**: admin123

### Instructor
- **Email**: john.doe@quiz.com
- **Password**: instructor123
- **Email**: jane.smith@quiz.com
- **Password**: instructor123

### Student
- **Email**: student1@quiz.com
- **Password**: student123
- **Email**: student2@quiz.com
- **Password**: student123

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── lib/               # Utilities and configurations
│   ├── auth.ts        # Custom authentication logic
│   └── supabase.ts    # Supabase client and types
├── pages/             # Main application pages
│   ├── AdminDashboard.tsx
│   ├── InstructorDashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── Exam.tsx
│   └── Login.tsx
└── App.tsx            # Main application component
```

## Key Features Implementation

### Custom Authentication
- Uses a custom `users` table instead of Supabase Auth
- Password hashing with bcryptjs
- Session management with localStorage
- Role-based access control

### Exam System
- Dynamic question loading with timers
- Per-question countdown with auto-advance
- Answer persistence and resume functionality
- Real-time score calculation

### Real-time Updates
- Supabase subscriptions for live data
- Automatic UI updates when data changes
- Optimistic updates for better UX

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `subjects` - Course subjects (Math, Science, etc.)
- `courses` - Individual courses
- `enrollments` - Student-course relationships
- `exams` - Exam definitions
- `questions` - Individual exam questions
- `exam_attempts` - Student exam sessions
- `answers` - Student answers to questions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Pages**: Add to `src/pages/` and update routing in `App.tsx`
2. **New Components**: Add to `src/components/` with TypeScript interfaces
3. **Database Changes**: Update `database_schema.sql` and TypeScript interfaces
4. **Authentication**: Modify `src/lib/auth.ts` for new auth requirements

## Production Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure environment variables are set in production
4. Configure CORS settings in Supabase for your domain

## Security Considerations

- Passwords are hashed using bcryptjs
- Row Level Security (RLS) is enabled on all tables
- Input validation on all forms
- Session tokens expire after 24 hours
- No sensitive data stored in localStorage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.