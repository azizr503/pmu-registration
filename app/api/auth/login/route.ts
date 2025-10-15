import { NextRequest, NextResponse } from 'next/server'
import {
  getUsers,
  verifyPassword,
  generateToken,
  sanitizeUser,
  isValidPMUEmail
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate PMU email
    if (!isValidPMUEmail(email)) {
      return NextResponse.json(
        { error: 'Please use a valid PMU email address (@pmu.edu.sa)' },
        { status: 400 }
      )
    }

    // Find user
    const users = await getUsers()
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const authUser = sanitizeUser(user)
    const token = generateToken(authUser)

    // Create response with token cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: authUser
      },
      { status: 200 }
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
