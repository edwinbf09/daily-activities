import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 400 })
    }

    // Crear usuario
    const [newUser] = await sql`
      INSERT INTO users (email, password, name)
      VALUES (${email}, ${password}, ${name})
      RETURNING id::text, email, name
    `

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
