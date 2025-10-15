import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

export interface User {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  studentId: string
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  studentId: string
}

// Initialize users file if it doesn't exist
export async function initializeUsersFile() {
  try {
    await fs.access(USERS_FILE)
  } catch {
    // File doesn't exist, create it with empty array
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
    await fs.writeFile(USERS_FILE, JSON.stringify([]))
  }
}

// Read users from file
export async function getUsers(): Promise<User[]> {
  await initializeUsersFile()
  const data = await fs.readFile(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

// Write users to file
export async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

// Get user from request
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

// Validate PMU email
export function isValidPMUEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@pmu.edu.sa')
}

// Generate student ID
export function generateStudentId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${year}${random}`
}

// Sanitize user data (remove password)
export function sanitizeUser(user: User): AuthUser {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}
