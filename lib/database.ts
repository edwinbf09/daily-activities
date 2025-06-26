import { neon } from "@neondatabase/serverless"
import type { ActivityData } from "./types"

// Verificar que existe la variable de entorno
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export async function initializeDatabase() {
  try {
    // Crear tabla si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        amount DECIMAL(10,2) DEFAULT 0,
        category VARCHAR(50) NOT NULL,
        is_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Crear índices para mejor rendimiento
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_is_paid ON activities(is_paid)`

    console.log("✅ Database initialized successfully")
    return true
  } catch (error) {
    console.error("❌ Error initializing database:", error)
    return false
  }
}

export async function getActivities(): Promise<ActivityData[]> {
  try {
    // Inicializar base de datos si es necesario
    await initializeDatabase()

    const activities = await sql`
      SELECT 
        id::text,
        name,
        description,
        date::text,
        amount::float,
        category,
        is_paid,
        created_at::text,
        updated_at::text
      FROM activities 
      ORDER BY created_at DESC
    `

    return activities as ActivityData[]
  } catch (error) {
    console.error("Error fetching activities:", error)
    return []
  }
}

export async function createActivity(
  activity: Omit<ActivityData, "id" | "created_at" | "updated_at">,
): Promise<ActivityData | null> {
  try {
    const [newActivity] = await sql`
      INSERT INTO activities (name, description, date, amount, category, is_paid)
      VALUES (${activity.name}, ${activity.description}, ${activity.date}, ${activity.amount}, ${activity.category}, ${activity.is_paid})
      RETURNING 
        id::text,
        name,
        description,
        date::text,
        amount::float,
        category,
        is_paid,
        created_at::text,
        updated_at::text
    `
    return newActivity as ActivityData
  } catch (error) {
    console.error("Error creating activity:", error)
    return null
  }
}

export async function updateActivity(id: string, updates: Partial<ActivityData>): Promise<ActivityData | null> {
  try {
    const [updatedActivity] = await sql`
      UPDATE activities 
      SET 
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        date = COALESCE(${updates.date}, date),
        amount = COALESCE(${updates.amount}, amount),
        category = COALESCE(${updates.category}, category),
        is_paid = COALESCE(${updates.is_paid}, is_paid),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id::text,
        name,
        description,
        date::text,
        amount::float,
        category,
        is_paid,
        created_at::text,
        updated_at::text
    `
    return updatedActivity as ActivityData
  } catch (error) {
    console.error("Error updating activity:", error)
    return null
  }
}

export async function deleteActivity(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM activities WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting activity:", error)
    return false
  }
}
