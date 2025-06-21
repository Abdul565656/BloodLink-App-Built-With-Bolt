export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      blood_requests: {
        Row: {
          id: string
          patient_name: string
          blood_group: string
          hospital_name: string
          city: string
          contact_number: string
          reason: string | null
          urgency_level: string
          preferred_date: string
          preferred_time: string
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          patient_name: string
          blood_group: string
          hospital_name: string
          city: string
          contact_number: string
          reason?: string | null
          urgency_level: string
          preferred_date: string
          preferred_time: string
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          patient_name?: string
          blood_group?: string
          hospital_name?: string
          city?: string
          contact_number?: string
          reason?: string | null
          urgency_level?: string
          preferred_date?: string
          preferred_time?: string
          status?: string | null
          created_at?: string | null
        }
      }
      donors: {
        Row: {
          id: string
          full_name: string
          phone_number: string
          city: string
          blood_group: string
          last_donation_date: string | null
          is_available: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          phone_number: string
          city: string
          blood_group: string
          last_donation_date?: string | null
          is_available?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string
          city?: string
          blood_group?: string
          last_donation_date?: string | null
          is_available?: boolean | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}