import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'creator' | 'clipper' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'creator' | 'clipper' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'creator' | 'clipper' | 'admin'
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string
          video_url: string
          reward_per_1000: number
          budget: number
          remaining_budget: number
          status: 'active' | 'paused'
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description: string
          video_url: string
          reward_per_1000: number
          budget: number
          remaining_budget?: number
          status?: 'active' | 'paused'
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string
          video_url?: string
          reward_per_1000?: number
          budget?: number
          remaining_budget?: number
          status?: 'active' | 'paused'
          created_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          clipper_id: string
          campaign_id: string
          platform: string
          video_link: string
          view_count: number
          screenshot_url: string
          status: 'pending' | 'approved' | 'rejected'
          payout_amount: number
          is_paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          clipper_id: string
          campaign_id: string
          platform: string
          video_link: string
          view_count: number
          screenshot_url: string
          status?: 'pending' | 'approved' | 'rejected'
          payout_amount?: number
          is_paid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          clipper_id?: string
          campaign_id?: string
          platform?: string
          video_link?: string
          view_count?: number
          screenshot_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          payout_amount?: number
          is_paid?: boolean
          created_at?: string
        }
      }
    }
  }
} 