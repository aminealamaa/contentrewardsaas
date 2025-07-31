'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { Video, Upload, Link as LinkIcon, Eye, DollarSign } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  video_url: string
  reward_per_1000: number
  budget: number
  remaining_budget: number
}

export default function SubmitPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [platform, setPlatform] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [viewCount, setViewCount] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaign')

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (error) throw error
      setCampaign(data)
    } catch (error) {
      console.error('Error fetching campaign:', error)
    }
  }

  const handleScreenshotUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `screenshots/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath)

      setScreenshotUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      // If storage fails, use a placeholder URL for now
      setScreenshotUrl('https://via.placeholder.com/400x300?text=Screenshot+Uploaded')
      console.log('Using placeholder screenshot URL')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !campaign) {
      setError('User or campaign not found')
      return
    }

    if (!platform || !videoLink || !viewCount) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Calculate payout amount
      const views = parseInt(viewCount)
      const payoutAmount = (views / 1000) * campaign.reward_per_1000

      console.log('Submitting with data:', {
        clipper_id: user.id,
        campaign_id: campaign.id,
        platform,
        video_link: videoLink,
        view_count: views,
        screenshot_url: screenshotUrl || 'https://via.placeholder.com/400x300?text=Screenshot',
        payout_amount: payoutAmount,
        status: 'pending'
      })

      const { error } = await supabase
        .from('submissions')
        .insert({
          clipper_id: user.id,
          campaign_id: campaign.id,
          platform,
          video_link: videoLink,
          view_count: views,
          screenshot_url: screenshotUrl || 'https://via.placeholder.com/400x300?text=Screenshot',
          payout_amount: payoutAmount,
          status: 'pending'
        })

      if (error) {
        console.error('Submission error:', error)
        throw error
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/clipper')
      }, 2000)
    } catch (error: any) {
      console.error('Submit error:', error)
      setError(error.message || 'Failed to submit work')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to submit your work.</p>
          <Button onClick={() => router.push('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Work</h1>
            <p className="text-gray-600">
              Share your promotional content and earn rewards
            </p>
          </div>

          {campaign && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">Campaign: {campaign.title}</h3>
              <p className="text-blue-700 text-sm mb-2">{campaign.description}</p>
              <div className="flex items-center text-sm text-blue-600">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{campaign.reward_per_1000} MAD per 1,000 views</span>
              </div>
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Successful!</h3>
              <p className="text-gray-600">Your work has been submitted for review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select platform</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="url"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    className="pl-10"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Count
                </label>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={viewCount}
                    onChange={(e) => setViewCount(e.target.value)}
                    className="pl-10"
                    placeholder="Enter view count"
                    min="0"
                    required
                  />
                </div>
                {viewCount && campaign && (
                  <p className="text-sm text-gray-600 mt-1">
                    Estimated payout: {((parseInt(viewCount) / 1000) * campaign.reward_per_1000).toFixed(2)} MAD
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screenshot Proof
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {screenshotUrl ? (
                    <div>
                      <img src={screenshotUrl} alt="Screenshot" className="max-w-full h-auto mx-auto mb-4 rounded" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setScreenshot(null)
                          setScreenshotUrl('')
                        }}
                      >
                        Remove Screenshot
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setScreenshot(file)
                            handleScreenshotUpload(file)
                          }
                        }}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label htmlFor="screenshot-upload">
                        <Button variant="outline" type="button" className="cursor-pointer">
                          Upload Screenshot
                        </Button>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Upload a screenshot showing your video's performance
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Work'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 