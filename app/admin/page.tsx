'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { LogOut, Package, Search, Moon } from 'lucide-react'

type GiftBox = {
  id: number
  user_id: string
  box_type: string
  delivery_type: string
  address: string | null
  recipient_name: string | null
  phone: string | null
  status: string
  tracking_number: string | null
  created_at: string
  user_email: string
}

export default function AdminPage() {
  const [giftBoxes, setGiftBoxes] = useState<GiftBox[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchGiftBoxes()
  }, [])

  const fetchGiftBoxes = async () => {
    const { data: boxesData, error: boxesError } = await supabase
      .from('gift_boxes')
      .select('*, users!gift_boxes_user_id_fkey(email)')
      .order('created_at', { ascending: false })

    if (boxesError) {
      console.error('Error fetching gift boxes:', boxesError)
      return
    }

    // Transform the data to match our GiftBox type
    const transformedData = boxesData.map(box => ({
      ...box,
      user_email: box.users.email
    }))

    setGiftBoxes(transformedData as GiftBox[])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleUpdateTracking = async (id: number, tracking_number: string) => {
    setError(null)
    setSuccess(null)

    const { error: updateError } = await supabase
      .from('gift_boxes')
      .update({
        tracking_number,
        status: '已发货'
      })
      .eq('id', id)

    if (updateError) {
      setError('更新快递单号失败')
      return
    }

    setSuccess('快递单号更新成功')
    fetchGiftBoxes()
  }

  const filteredGiftBoxes = giftBoxes.filter(box =>
    box.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.phone?.includes(searchTerm)
  )

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
              <span className="ml-2 text-xl font-semibold">中秋礼盒管理系统</span>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">礼盒申请记录</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {error && <div className="error-message mb-4">{error}</div>}
          {success && <div className="success-message mb-4">{success}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申请人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    礼盒类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    领取方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    收件信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGiftBoxes.map((box) => (
                  <tr key={box.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {box.user_email}
                      </div>
                      <div className="text-sm text-gray-500">
                        申请时间: {new Date(box.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {box.box_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {box.delivery_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {box.delivery_type === '线上邮寄' ? (
                        <div className="text-sm text-gray-900">
                          <div>{box.recipient_name}</div>
                          <div>{box.phone}</div>
                          <div className="text-gray-500">{box.address}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${box.status === '已发货' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {box.status}
                      </span>
                      {box.tracking_number && (
                        <div className="text-sm text-gray-500 mt-1">
                          快递单号: {box.tracking_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {box.delivery_type === '线上邮寄' && box.status === '申请中' && (
                        <button
                          onClick={() => {
                            const tracking = prompt('请输入快递单号')
                            if (tracking) {
                              handleUpdateTracking(box.id, tracking)
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          填写快递单号
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Image
            src="https://image.coze.run/?prompt=A%20modern%20logistics%20center%20with%20packages%20and%20workers%20in%20warm%20lighting&image_size=landscape_16_9"
            alt="物流中心"
            width={600}
            height={337}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
