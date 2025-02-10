'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { LogOut, Package, Truck, Moon } from 'lucide-react'

type GiftBox = {
  id: number
  box_type: string
  delivery_type: string
  address: string | null
  recipient_name: string | null
  phone: string | null
  status: string
  tracking_number: string | null
  created_at: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [giftBox, setGiftBox] = useState<GiftBox | null>(null)
  const [formData, setFormData] = useState({
    box_type: '常规',
    delivery_type: '线下领取',
    address: '',
    recipient_name: '',
    phone: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchGiftBox()
  }, [])

  const fetchGiftBox = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('gift_boxes')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching gift box:', error)
      }
    } else {
      setGiftBox(data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (formData.delivery_type === '线上邮寄' &&
        (!formData.address || !formData.recipient_name || !formData.phone)) {
      setError('请填写完整的邮寄信息')
      return
    }

    const { error: submitError } = await supabase
      .from('gift_boxes')
      .insert([
        {
          user_id: user.id,
          ...formData
        }
      ])

    if (submitError) {
      if (submitError.code === '23505') {
        setError('您已经申请过礼盒，不能重复申请')
      } else {
        setError('申请提交失败，请稍后重试')
      }
      return
    }

    setSuccess('礼盒申请提交成功！')
    fetchGiftBox()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Moon className="h-8 w-8 text-amber-500" />
              <span className="ml-2 text-xl font-semibold">中秋礼盒申请系统</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-1" />
              退出
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {giftBox ? (
          <div className="card space-y-6">
            <div className="flex items-center justify-center mb-4">
              <Package className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">礼盒申请状态</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">礼盒类型</span>
                <span className="font-medium">{giftBox.box_type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">领取方式</span>
                <span className="font-medium">{giftBox.delivery_type}</span>
              </div>
              {giftBox.delivery_type === '线上邮寄' && (
                <>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">收件人</span>
                    <span className="font-medium">{giftBox.recipient_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">联系电话</span>
                    <span className="font-medium">{giftBox.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">收货地址</span>
                    <span className="font-medium">{giftBox.address}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">申请状态</span>
                <span className={`font-medium ${
                  giftBox.status === '已发货' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {giftBox.status}
                </span>
              </div>
              {giftBox.tracking_number && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">快递单号</span>
                  <span className="font-medium">{giftBox.tracking_number}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">申请中秋礼盒</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">礼盒类型</label>
                <select
                  className="input-field"
                  value={formData.box_type}
                  onChange={(e) => setFormData({ ...formData, box_type: e.target.value })}
                >
                  <option value="常规">常规</option>
                  <option value="清真">清真</option>
                </select>
              </div>

              <div>
                <label className="form-label">领取方式</label>
                <select
                  className="input-field"
                  value={formData.delivery_type}
                  onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}
                >
                  <option value="线下领取">线下领取</option>
                  <option value="线上邮寄">线上邮寄</option>
                </select>
              </div>

              {formData.delivery_type === '线上邮寄' && (
                <>
                  <div>
                    <label className="form-label">收件人姓名</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                      placeholder="请输入收件人姓名"
                    />
                  </div>

                  <div>
                    <label className="form-label">联系电话</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="请输入联系电话"
                    />
                  </div>

                  <div>
                    <label className="form-label">收货地址</label>
                    <textarea
                      className="input-field"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="请输入详细收货地址"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="btn-primary w-full">
                提交申请
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Image
            src="https://image.coze.run/?prompt=A%20festive%20Chinese%20Mid-Autumn%20Festival%20scene%20with%20lanterns%20and%20mooncakes%20in%20warm%20colors&image_size=landscape_16_9"
            alt="中秋节"
            width={600}
            height={337}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
