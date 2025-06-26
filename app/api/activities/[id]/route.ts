import { type NextRequest, NextResponse } from "next/server"
import { updateActivity, deleteActivity } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const activity = await updateActivity(params.id, body)

    if (!activity) {
      return NextResponse.json({ error: "Activity not found or failed to update" }, { status: 404 })
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await deleteActivity(params.id)

    if (!success) {
      return NextResponse.json({ error: "Activity not found or failed to delete" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 })
  }
}
