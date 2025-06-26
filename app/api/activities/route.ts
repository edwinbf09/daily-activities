import { type NextRequest, NextResponse } from "next/server"
import { getActivities, createActivity } from "@/lib/database"

export async function GET() {
  try {
    const activities = await getActivities()
    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const activity = await createActivity(body)

    if (!activity) {
      return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
    }

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
