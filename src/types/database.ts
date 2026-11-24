export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileSex = "female" | "male";
export type ProfileMode = "ckd" | "post_aki";
export type BpArm = "left" | "right";
export type BpPosition = "sitting" | "standing" | "lying";
export type ReminderType = "lab" | "control" | "medication";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          birth_date: string | null;
          sex: ProfileSex | null;
          mode: ProfileMode | null;
          bp_target_systolic: number | null;
          bp_target_diastolic: number | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          birth_date?: string | null;
          sex?: ProfileSex | null;
          mode?: ProfileMode | null;
          bp_target_systolic?: number | null;
          bp_target_diastolic?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          birth_date?: string | null;
          sex?: ProfileSex | null;
          mode?: ProfileMode | null;
          bp_target_systolic?: number | null;
          bp_target_diastolic?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      lab_results: {
        Row: {
          id: string;
          user_id: string;
          measured_at: string;
          creatinine: number | null;
          creatinine_unit: string | null;
          urea: number | null;
          urea_unit: string | null;
          potassium: number | null;
          acr: number | null;
          acr_unit: string | null;
          egfr: number | null;
          is_acute_illness: boolean | null;
          reference_notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          measured_at: string;
          creatinine?: number | null;
          creatinine_unit?: string | null;
          urea?: number | null;
          urea_unit?: string | null;
          potassium?: number | null;
          acr?: number | null;
          acr_unit?: string | null;
          egfr?: number | null;
          is_acute_illness?: boolean | null;
          reference_notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          measured_at?: string;
          creatinine?: number | null;
          creatinine_unit?: string | null;
          urea?: number | null;
          urea_unit?: string | null;
          potassium?: number | null;
          acr?: number | null;
          acr_unit?: string | null;
          egfr?: number | null;
          is_acute_illness?: boolean | null;
          reference_notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      bp_logs: {
        Row: {
          id: string;
          user_id: string;
          measured_at: string;
          systolic: number;
          diastolic: number;
          pulse: number | null;
          arm: BpArm | null;
          position: BpPosition | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          measured_at: string;
          systolic: number;
          diastolic: number;
          pulse?: number | null;
          arm?: BpArm | null;
          position?: BpPosition | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          measured_at?: string;
          systolic?: number;
          diastolic?: number;
          pulse?: number | null;
          arm?: BpArm | null;
          position?: BpPosition | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          type: ReminderType | null;
          title: string;
          remind_at: string;
          location: string | null;
          notes: string | null;
          is_done: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: ReminderType | null;
          title: string;
          remind_at: string;
          location?: string | null;
          notes?: string | null;
          is_done?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: ReminderType | null;
          title?: string;
          remind_at?: string;
          location?: string | null;
          notes?: string | null;
          is_done?: boolean | null;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          slug: string | null;
          title: string;
          category: string | null;
          summary: string | null;
          body: string | null;
          source: string | null;
          source_url: string | null;
          reviewed_at: string | null;
          reviewer: string | null;
          read_minutes: number | null;
          published: boolean | null;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          title: string;
          category?: string | null;
          summary?: string | null;
          body?: string | null;
          source?: string | null;
          source_url?: string | null;
          reviewed_at?: string | null;
          reviewer?: string | null;
          read_minutes?: number | null;
          published?: boolean | null;
        };
        Update: {
          id?: string;
          slug?: string | null;
          title?: string;
          category?: string | null;
          summary?: string | null;
          body?: string | null;
          source?: string | null;
          source_url?: string | null;
          reviewed_at?: string | null;
          reviewer?: string | null;
          read_minutes?: number | null;
          published?: boolean | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type LabResult = Tables<"lab_results">;
export type BpLog = Tables<"bp_logs">;
export type Reminder = Tables<"reminders">;
export type Article = Tables<"articles">;
