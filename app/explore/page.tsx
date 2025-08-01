'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Video, Eye, DollarSign, Calendar, Play, ExternalLink, Download } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  video_url: string
  original_video_path?: string
  reward_per_1000: number
  budget: number
  remaining_budget: number
  status: 'active' | 'paused'
  created_at: string
  creator?: {
    email: string
  } | null
}

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          creator:users(email)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const getVideoThumbnail = (videoUrl: string): string => {
    // YouTube video thumbnail extraction
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const youtubeMatch = videoUrl.match(youtubeRegex)
    
    if (youtubeMatch) {
      const videoId = youtubeMatch[1]
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    // TikTok video thumbnail extraction
    const tiktokRegex = /tiktok\.com\/@[^\/]+\/video\/(\d+)/
    const tiktokMatch = videoUrl.match(tiktokRegex)
    
    if (tiktokMatch) {
      // TikTok doesn't provide direct thumbnail URLs, so we'll use a placeholder
      return 'https://via.placeholder.com/320x180/ff0050/ffffff?text=TikTok+Video'
    }

    // Instagram video thumbnail extraction
    const instagramRegex = /instagram\.com\/p\/([^\/\n?#]+)/
    const instagramMatch = videoUrl.match(instagramRegex)
    
    if (instagramMatch) {
      // Instagram doesn't provide direct thumbnail URLs, so we'll use a placeholder
      return 'https://via.placeholder.com/320x180/e4405f/ffffff?text=Instagram+Video'
    }

    // Default placeholder for other platforms
    return 'https://via.placeholder.com/320x180/3b82f6/ffffff?text=Video+Preview'
  }

  const getVideoPlatform = (videoUrl: string): string => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return 'YouTube'
    } else if (videoUrl.includes('tiktok.com')) {
      return 'TikTok'
    } else if (videoUrl.includes('instagram.com')) {
      return 'Instagram'
    } else if (videoUrl.includes('facebook.com')) {
      return 'Facebook'
    } else if (videoUrl.includes('twitter.com')) {
      return 'Twitter'
    }
    return 'Other'
  }

  const openVideoPreview = (videoUrl: string) => {
    // Convert YouTube URLs to embed format
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const youtubeMatch = videoUrl.match(youtubeRegex)
    
    if (youtubeMatch) {
      const videoId = youtubeMatch[1]
      setSelectedVideo(`https://www.youtube.com/embed/${videoId}`)
    } else {
      // For other platforms, use the original URL
      setSelectedVideo(videoUrl)
    }
  }

  const closeVideoPreview = () => {
    setSelectedVideo(null)
  }

  const handleVideoDownload = async (campaign: Campaign) => {
    // If campaign has an original video file in Supabase Storage
    if (campaign.original_video_path) {
      try {
        // Generate a signed URL for secure download
        const { data, error } = await supabase.storage
          .from('videos')
          .createSignedUrl(campaign.original_video_path, 60) // 60 seconds expiry

        if (error) {
          console.error('Error generating signed URL:', error)
          alert('Failed to generate download link. Please try again.')
          return
        }

        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = data.signedUrl
        link.download = `${campaign.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Download failed:', error)
        alert('Download failed. Please try again.')
      }
    } else {
      // Fallback to external URL download (existing logic)
      const videoUrl = campaign.video_url
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
      const youtubeMatch = videoUrl.match(youtubeRegex)
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[1]
        // For YouTube videos, we'll use a third-party service or provide instructions
        const downloadUrl = `https://www.y2mate.com/youtube/${videoId}`
        window.open(downloadUrl, '_blank')
      } else {
        // For other platforms, try direct download
        try {
          const link = document.createElement('a')
          link.href = videoUrl
          link.download = 'video.mp4'
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } catch (error) {
          console.error('Download failed:', error)
          // Fallback: open in new tab
          window.open(videoUrl, '_blank')
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore Campaigns</h1>
              <p className="mt-2 text-gray-600">
                Browse available campaigns and start earning rewards
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/clipper">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/submit">
                <Button>Submit Your Work</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns available</h3>
            <p className="text-gray-600">Check back later for new campaigns!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={getVideoThumbnail(campaign.video_url)}
                    alt={`${campaign.title} thumbnail`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if thumbnail fails to load
                      e.currentTarget.src = 'https://via.placeholder.com/320x180/3b82f6/ffffff?text=Video+Preview'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Button
                      onClick={() => openVideoPreview(campaign.video_url)}
                      size="sm"
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {getVideoPlatform(campaign.video_url)}
                    </span>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 h-12 overflow-hidden">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 h-8 overflow-hidden">
                    {campaign.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="font-medium text-green-600">
                          {campaign.reward_per_1000} MAD per 1,000 views
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>
                          Budget: {campaign.remaining_budget} MAD remaining
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Posted {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                                     <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-500">
                       by {campaign.creator?.email || 'Unknown Creator'}
                     </span>
                     <div className="flex space-x-2">
                       <Button
                         onClick={() => openVideoPreview(campaign.video_url)}
                         size="sm"
                         variant="outline"
                       >
                         <Play className="h-3 w-3 mr-1" />
                         Preview
                       </Button>
                       <Button
                         onClick={() => handleVideoDownload(campaign)}
                         size="sm"
                         variant="outline"
                       >
                         <Download className="h-3 w-3 mr-1" />
                         Download
                       </Button>
                       <Link href={`/submit?campaign=${campaign.id}`}>
                         <Button size="sm">
                           Start Clipping
                         </Button>
                       </Link>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

             {/* Video Preview Modal */}
       {selectedVideo && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b">
               <h3 className="text-lg font-semibold">Video Preview</h3>
               <Button
                 onClick={closeVideoPreview}
                 variant="ghost"
                 size="sm"
               >
                 ✕
               </Button>
             </div>
             <div className="p-4">
               <div className="aspect-video bg-black rounded-lg overflow-hidden">
                 <iframe
                   src={selectedVideo}
                   className="w-full h-full"
                   frameBorder="0"
                   allowFullScreen
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   title="Video Preview"
                   onError={(e) => {
                     console.error('Video preview error:', e)
                   }}
                 />
               </div>
                               <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        // Convert embed URL back to regular URL for opening in new tab
                        const originalUrl = selectedVideo.includes('/embed/') 
                          ? selectedVideo.replace('/embed/', '/watch?v=')
                          : selectedVideo
                        window.open(originalUrl, '_blank')
                      }}
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                                         <Button
                       onClick={() => {
                         // Find the campaign that matches the selected video
                         const campaign = campaigns.find(c => {
                           const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
                           const youtubeMatch = c.video_url.match(youtubeRegex)
                           if (youtubeMatch) {
                             const videoId = youtubeMatch[1]
                             return selectedVideo.includes(videoId)
                           }
                           return c.video_url === selectedVideo
                         })
                         
                         if (campaign) {
                           handleVideoDownload(campaign)
                         } else {
                           alert('Campaign not found')
                         }
                       }}
                       variant="outline"
                     >
                       <Download className="h-4 w-4 mr-2" />
                       Download
                     </Button>
                  </div>
                  <Button onClick={closeVideoPreview}>
                    Close
                  </Button>
                </div>
             </div>
           </div>
         </div>
       )}
    </div>
  )
} 