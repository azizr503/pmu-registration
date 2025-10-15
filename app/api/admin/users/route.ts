import { NextRequest, NextResponse } from 'next/server'
import { getUsers, getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (you can modify this logic)
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // For now, allow any authenticated user to view users
    // You can add admin role checking here later
    const users = await getUsers()
    
    // Return sanitized user data (without passwords)
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      studentId: user.studentId,
      createdAt: user.createdAt
    }))

    return NextResponse.json({ users: sanitizedUsers })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
