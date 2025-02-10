'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Moon, Gift } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError('邮箱或密码错误')
      return
    }

    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Moon className="w-12 h-12 text-amber-500 animate-float" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">中秋礼盒申请系统</h1>
          <p className="text-gray-600">欢迎使用2024年中秋礼盒申请系统</p>
        </div>

        <div className="card bg-white/80 backdrop-blur">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              登录
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>测试账号说明：</p>
            <p>员工账号：e0001@example.com - e0010@example.com</p>
            <p>管理员账号：admin@example.com</p>
            <p>密码与邮箱相同</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Gift className="w-6 h-6 text-amber-500" />
          <Image
            src="https://image.coze.run/?prompt=A%20traditional%20Chinese%20mooncake%20with%20decorative%20patterns%20in%20warm%20golden%20tones%20against%20a%20light%20background&image_size=square"
            alt="中秋月饼"
            width={100}
            height={100}
            className="rounded-full shadow-lg"
          />
          <Gift className="w-6 h-6 text-amber-500" />
        </div>
      </div>
    </div>
  )
}
