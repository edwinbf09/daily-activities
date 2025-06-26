import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const [user] = await sql`
      SELECT id, email, name FROM users WHERE email = ${email}
    `

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({ message: "Si el email existe, recibirás las instrucciones" })
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hora

    // Guardar token en la base de datos
    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expires = ${resetTokenExpires.toISOString()}
      WHERE email = ${email}
    `

    // En un entorno real, aquí enviarías el email
    // Por ahora, simularemos el envío
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}?token=${resetToken}`

    // Simular envío de email (en consola para desarrollo)
    console.log(`
    📧 EMAIL DE RECUPERACIÓN PARA: ${email}
    
    Hola ${user.name},
    
    Haz clic en el siguiente enlace para restablecer tu contraseña:
    ${resetUrl}
    
    Este enlace expira en 1 hora.
    
    Si no solicitaste este cambio, ignora este email.
    `)

    // En producción, aquí usarías un servicio como SendGrid, Resend, etc.
    // await sendEmail({
    //   to: email,
    //   subject: "Restablecer contraseña - Nuestra Agenda",
    //   html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña</p>`
    // })

    return NextResponse.json({
      message: "Te hemos enviado un email con las instrucciones para restablecer tu contraseña",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
