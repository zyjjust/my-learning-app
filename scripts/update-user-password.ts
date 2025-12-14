/**
 * 更新用户密码
 * 使用方法: npx tsx scripts/update-user-password.ts zzh 147369
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 请先配置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updatePassword(username: string, password: string) {
  console.log(`🔄 更新用户 "${username}" 的密码...`)

  try {
    // 哈希新密码
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // 更新密码
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('username', username)
      .select()
      .single()

    if (error) {
      console.error('❌ 更新密码失败:', error.message)
      return
    }

    if (data) {
      console.log('✅ 密码更新成功!')
      console.log('   用户名:', data.username)
      console.log('   新密码:', password)
      console.log('\n🎉 现在可以使用以下信息登录:')
      console.log('   用户名:', username)
      console.log('   密码:', password)
    } else {
      console.log('⚠️  用户不存在')
    }
  } catch (error: any) {
    console.error('❌ 发生错误:', error.message)
  }
}

const username = process.argv[2] || 'zzh'
const password = process.argv[3] || '147369'

updatePassword(username, password).then(() => {
  console.log('\n完成!')
  process.exit(0)
})

