/**
 * 密码哈希和验证工具
 * 使用 bcrypt 进行密码加密
 */

// 在浏览器环境中，我们需要使用 API 路由来处理密码哈希
// 因为 bcrypt 是 Node.js 库，不能在浏览器中直接使用

export async function hashPassword(password: string): Promise<string> {
  const response = await fetch('/api/auth/hash-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    throw new Error('Failed to hash password')
  }

  const data = await response.json()
  return data.hash
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const response = await fetch('/api/auth/verify-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password, hash }),
  })

  if (!response.ok) {
    return false
  }

  const data = await response.json()
  return data.verified
}


