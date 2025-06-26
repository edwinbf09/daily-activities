import { neon } from "@neondatabase/serverless"
import type { ActivityData } from "./types"

const sql = neon(process.env.DATABASE_URL!)

export async function getActivities(): Promise<ActivityData[]> {
  try {
    const activities = await sql`
      SELECT * FROM activities 
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
      RETURNING *
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
      RETURNING *
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
