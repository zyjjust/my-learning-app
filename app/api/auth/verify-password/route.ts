import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { password, hash } = await request.json()

    if (!password || !hash) {
      return NextResponse.json(
        { error: 'Password and hash are required' },
        { status: 400 }
      )
    }

    // 验证密码
    const verified = await bcrypt.compare(password, hash)

    return NextResponse.json({ verified })
  } catch (error: any) {
    console.error('Error verifying password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



