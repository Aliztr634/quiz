# Quiz App Deployment Guide

## Environment Variables

Make sure to set these environment variables in your deployment platform:

### Required Environment Variables:
```
VITE_SUPABASE_URL=https://ewghnfpqhwogudcxiahm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Z2huZnBxaHdvZ3VkY3hpYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTQ4MjQsImV4cCI6MjA3NDU3MDgyNH0.tShuKYZZLgQZnBWbzUSuF4QlrOU9ifRdkXk2oC5z5CI
```

## Deployment Platforms

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Set source to GitHub Actions
3. Use the provided workflow file

## Database Setup

1. Run the `complete_database_setup.sql` script in your Supabase SQL editor
2. Verify all tables are created with sample data
3. Check that RLS policies are properly configured

## Common Issues

### 404 Errors on Refresh
- Make sure SPA routing is configured (vercel.json, netlify.toml, _redirects)
- Check that all routes redirect to index.html

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Check that variables are set in deployment platform
- Restart deployment after adding variables

### Database Connection Issues
- Verify Supabase URL and anon key are correct
- Check that RLS policies allow access
- Ensure database is properly set up with sample data

## Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Troubleshooting

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test database connection
4. Check network requests in DevTools
