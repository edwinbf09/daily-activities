import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token y nueva contraseña son requeridos" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar token y que no haya expirado
    const [user] = await sql`
      SELECT id, email, name 
      FROM users 
      WHERE reset_token = ${token} 
      AND reset_token_expires > NOW()
    `

    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Actualizar contraseña y limpiar token
    await sql`
      UPDATE users 
      SET password = ${newPassword}, reset_token = NULL, reset_token_expires = NULL
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("Password reset confirm error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
