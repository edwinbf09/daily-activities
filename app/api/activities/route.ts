import { type NextRequest, NextResponse } from "next/server"
import { getActivities, createActivity } from "@/lib/database"

export async function GET() {
  try {
    const activities = await getActivities()
    return NextResponse.json(activities)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos requeridos
    if (!body.name || !body.date || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const activity = await createActivity({
      name: body.name,
      description: body.description || null,
      date: body.date,
      amount: Number(body.amount) || 0,
      category: body.category,
      is_paid: Boolean(body.is_paid),
    })

    if (!activity) {
      return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
    }

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
