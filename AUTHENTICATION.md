# Student Authentication System

This document describes the authentication system implemented for the PMU Student Registration System.

## Features

- **Student Registration**: Students can register with PMU university emails (@pmu.edu.sa)
- **Secure Login**: Password-based authentication with bcrypt hashing
- **Session Management**: JWT tokens stored as HttpOnly cookies
- **Route Protection**: Middleware protects private routes
- **Modern UI**: Clean, responsive forms with Tailwind CSS

## Routes

### Public Routes
- `/` - Homepage (accessible to all)
- `/login` - Login page
- `/register` - Registration page

### Protected Routes
- `/profile` - Student profile
- `/schedule` - Student schedule
- `/courses` - Course catalog
- `/register-classes` - Course registration

## API Endpoints

- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login student
- `POST /api/auth/logout` - Logout student
- `GET /api/auth/me` - Get current user info

## Authentication Flow

1. **Registration**: Student provides PMU email, password, and personal details
2. **Email Validation**: Only @pmu.edu.sa emails are accepted
3. **Password Hashing**: Passwords are hashed with bcrypt (12 salt rounds)
4. **User Storage**: Users stored in `data/users.json`
5. **JWT Token**: Generated and stored as HttpOnly cookie (7-day expiry)
6. **Session Management**: Token verified on protected route access

## Security Features

- **PMU Email Validation**: Only university emails accepted
- **Password Strength**: Minimum 8 characters required
- **bcrypt Hashing**: Secure password storage
- **HttpOnly Cookies**: Prevents XSS attacks
- **JWT Tokens**: Secure session management
- **Route Protection**: Middleware blocks unauthorized access

## File Structure

```
lib/
├── auth.ts              # Authentication utilities
├── auth-context.tsx     # React context for auth state
└── utils.ts            # General utilities

app/
├── api/auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
├── login/page.tsx
├── register/page.tsx
└── register-classes/page.tsx

middleware.ts            # Route protection
data/users.json         # User storage
```

## Usage

### Environment Variables

Create a `.env.local` file with:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### Registration

1. Navigate to `/register`
2. Fill in personal details
3. Use a valid PMU email (@pmu.edu.sa)
4. Create a strong password (8+ characters)
5. Submit to create account

### Login

1. Navigate to `/login`
2. Enter PMU email and password
3. System validates credentials
4. Redirected to homepage on success

### Logout

1. Click user avatar in header
2. Select "Log out"
3. Session cleared and redirected to login

## Development

The system is designed for local development and demo purposes. For production:

1. Use a proper database instead of JSON files
2. Set strong JWT secrets
3. Enable HTTPS
4. Add rate limiting
5. Implement email verification
6. Add password reset functionality

## Testing

To test the authentication system:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/register`
3. Register with a PMU email
4. Login and access protected routes
5. Test logout functionality
