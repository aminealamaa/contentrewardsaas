'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role || 'clipper'
      
      // Redirect based on role
      switch (role) {
        case 'creator':
          router.push('/dashboard/creator')
          break
        case 'clipper':
          router.push('/dashboard/clipper')
          break
        case 'admin':
          router.push('/admin')
          break
        default:
          router.push('/dashboard/clipper')
      }
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
} 