
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "favorites": {
                  Row: {
                    "created_at": string,"product_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"product_id": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"product_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "favorites_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "active": boolean,"attributes": (Database["public"]['Enums']["product_attribute"])[],"brand": string,"category": Database["public"]['Enums']["product_category"],"created_at": string,"description": string | null,"external_id": string | null,"id": string,"image_path": string | null,"key_ingredients": (string)[],"name": string,"price": number,"size_label": string | null,"skin_types": (Database["public"]['Enums']["skin_type"])[],"targets": (Database["public"]['Enums']["skin_concern"])[],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"attributes"?: (Database["public"]['Enums']["product_attribute"])[],"brand": string,"category": Database["public"]['Enums']["product_category"],"created_at"?: string,"description"?: string | null,"external_id"?: string | null,"id"?: string,"image_path"?: string | null,"key_ingredients"?: (string)[],"name": string,"price": number,"size_label"?: string | null,"skin_types"?: (Database["public"]['Enums']["skin_type"])[],"targets"?: (Database["public"]['Enums']["skin_concern"])[],"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"attributes"?: (Database["public"]['Enums']["product_attribute"])[],"brand"?: string,"category"?: Database["public"]['Enums']["product_category"],"created_at"?: string,"description"?: string | null,"external_id"?: string | null,"id"?: string,"image_path"?: string | null,"key_ingredients"?: (string)[],"name"?: string,"price"?: number,"size_label"?: string | null,"skin_types"?: (Database["public"]['Enums']["skin_type"])[],"targets"?: (Database["public"]['Enums']["skin_concern"])[],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "budget_max": number | null,"concerns": (Database["public"]['Enums']["skin_concern"])[],"created_at": string,"display_name": string,"id": string,"onboarding_completed": boolean,"preferences": (Database["public"]['Enums']["product_attribute"])[],"skin_type": Database["public"]['Enums']["skin_type"] | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "budget_max"?: number | null,"concerns"?: (Database["public"]['Enums']["skin_concern"])[],"created_at"?: string,"display_name"?: string,"id": string,"onboarding_completed"?: boolean,"preferences"?: (Database["public"]['Enums']["product_attribute"])[],"skin_type"?: Database["public"]['Enums']["skin_type"] | null,"updated_at"?: string
                  }
                  Update: {
                    "budget_max"?: number | null,"concerns"?: (Database["public"]['Enums']["skin_concern"])[],"created_at"?: string,"display_name"?: string,"id"?: string,"onboarding_completed"?: boolean,"preferences"?: (Database["public"]['Enums']["product_attribute"])[],"skin_type"?: Database["public"]['Enums']["skin_type"] | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"routine_items": {
                  Row: {
                    "created_at": string,"custom_name": string | null,"id": string,"notes": string | null,"photo_path": string | null,"product_id": string | null,"slot": Database["public"]['Enums']["routine_slot"],"step_order": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"custom_name"?: string | null,"id"?: string,"notes"?: string | null,"photo_path"?: string | null,"product_id"?: string | null,"slot": Database["public"]['Enums']["routine_slot"],"step_order"?: number,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"custom_name"?: string | null,"id"?: string,"notes"?: string | null,"photo_path"?: string | null,"product_id"?: string | null,"slot"?: Database["public"]['Enums']["routine_slot"],"step_order"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "routine_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "routine_items_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            "product_attribute": "vegano"|"cruelty_free"|"sin_fragancia"|"sin_alcohol"|"no_comedogenico"|"hipoalergenico","product_category": "limpiador"|"tonico"|"serum"|"hidratante"|"protector_solar"|"mascarilla"|"exfoliante"|"contorno_ojos","routine_slot": "manana"|"noche","skin_concern": "acne"|"manchas"|"antiedad"|"hidratacion"|"poros"|"enrojecimiento"|"luminosidad","skin_type": "seca"|"grasa"|"mixta"|"normal"|"sensible"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "product_attribute": ["vegano", "cruelty_free", "sin_fragancia", "sin_alcohol", "no_comedogenico", "hipoalergenico"],"product_category": ["limpiador", "tonico", "serum", "hidratante", "protector_solar", "mascarilla", "exfoliante", "contorno_ojos"],"routine_slot": ["manana", "noche"],"skin_concern": ["acne", "manchas", "antiedad", "hidratacion", "poros", "enrojecimiento", "luminosidad"],"skin_type": ["seca", "grasa", "mixta", "normal", "sensible"]
          }
        }
} as const
