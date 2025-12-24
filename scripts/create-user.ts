/**
 * 创建 Supabase 用户的脚本
 * 使用方法: npx tsx scripts/create-user.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('请先配置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUser(username: string, password: string) {
  // 使用用户名作为邮箱前缀
  const email = `${username}@learning-app.local`
  const name = username

  console.log(`正在创建用户: ${username} (${email})...`)

  try {
    // 注册用户
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (error) {
      console.error('创建用户失败:', error.message)
      
      // 如果用户已存在，尝试登录
      if (error.message.includes('already registered')) {
        console.log('用户已存在，尝试登录...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) {
          console.error('登录失败:', signInError.message)
          return
        }
        
        console.log('登录成功!')
        console.log('用户信息:', signInData.user)
        return
      }
      
      return
    }

    if (data.user) {
      console.log('✅ 用户创建成功!')
      console.log('用户 ID:', data.user.id)
      console.log('邮箱:', data.user.email)
      
      // 创建用户资料
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: data.user.id,
        email: data.user.email,
        name: name,
        level: 1,
        current_xp: 0,
        gold_coins: 0,
        streak: 0,
      })

      if (profileError) {
        console.error('创建用户资料失败:', profileError.message)
      } else {
        console.log('✅ 用户资料创建成功!')
      }
    } else {
      console.log('⚠️  用户创建成功，但需要邮箱确认')
      console.log('请在 Supabase Dashboard 中确认用户邮箱，或使用管理员 API')
    }
  } catch (error: any) {
    console.error('发生错误:', error.message)
  }
}

// 执行创建用户
const username = process.argv[2] || 'zzh'
const password = process.argv[3] || '147369'

createUser(username, password).then(() => {
  console.log('\n完成!')
  process.exit(0)
})













































