import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // 生成密码哈希
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    return NextResponse.json({ hash })
  } catch (error: any) {
    console.error('Error hashing password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}













































