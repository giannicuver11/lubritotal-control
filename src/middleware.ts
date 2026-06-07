import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const path = req.nextUrl.pathname
  if (path.startsWith("/login") || path.startsWith("/api/auth")) return
  if (path.startsWith("/_next") || path.startsWith("/favicon") || path.startsWith("/logo")) return
  if (!req.auth) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo).*)"],
}
