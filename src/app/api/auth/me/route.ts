import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
