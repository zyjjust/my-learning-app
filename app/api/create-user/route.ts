import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // 创建用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自动确认邮箱
      user_metadata: {
        name: name || email.split('@')[0],
      },
    })

    if (authError) {
      // 如果 admin API 不可用，使用普通 signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      // 创建用户资料
      if (data.user) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
          level: 1,
          current_xp: 0,
          gold_coins: 0,
          streak: 0,
        })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: data.user,
      })
    }

    // 如果使用 admin API 成功
    if (authData.user) {
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authData.user.id,
        email: authData.user.email,
        name: name || email.split('@')[0],
        level: 1,
        current_xp: 0,
        gold_coins: 0,
        streak: 0,
      })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: authData.user,
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}















