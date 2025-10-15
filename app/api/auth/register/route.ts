import { NextRequest, NextResponse } from 'next/server'
import {
  getUsers,
  saveUsers,
  hashPassword,
  generateToken,
  generateStudentId,
  isValidPMUEmail,
  sanitizeUser,
  User
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format and PMU domain
    if (!isValidPMUEmail(email)) {
      return NextResponse.json(
        { error: 'Please use a valid PMU email address (@pmu.edu.sa)' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const users = await getUsers()
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const hashedPassword = await hashPassword(password)
    const newUser: User = {
      id: require('crypto').randomUUID ? require('crypto').randomUUID() : `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      studentId: generateStudentId(),
      createdAt: new Date().toISOString()
    }

    // Save user
    users.push(newUser)
    await saveUsers(users)

    // Generate token
    const authUser = sanitizeUser(newUser)
    const token = generateToken(authUser)

    // Create response with token cookie
    const response = NextResponse.json(
      { 
        message: 'Registration successful',
        user: authUser
      },
      { status: 201 }
    )

    // Set HttpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
