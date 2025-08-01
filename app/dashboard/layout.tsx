'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Video, User, LogOut, Home } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Get user role from metadata
      const role = user.user_metadata?.role || 'clipper'
      setUserRole(role)
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <Video className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">ContentRewards</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                {userRole === 'creator' && (
                  <Link href="/dashboard/creator">
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      My Campaigns
                    </Button>
                  </Link>
                )}
                
                {userRole === 'clipper' && (
                  <>
                    <Link href="/dashboard/clipper">
                      <Button variant="ghost" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        My Submissions
                      </Button>
                    </Link>
                    <Link href="/explore">
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Explore Campaigns
                      </Button>
                    </Link>
                  </>
                )}
                
                {userRole === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 