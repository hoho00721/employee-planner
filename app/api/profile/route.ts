import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userProfile } from '@/db/schemas/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const profiles = await db.select().from(userProfile).limit(1)
    if (profiles.length === 0) return NextResponse.json({ profile: null })
    return NextResponse.json({ profile: profiles[0] })
  } catch {
    return NextResponse.json({ profile: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const existing = await db.select().from(userProfile).limit(1)
    if (existing.length > 0) {
      const updated = await db.update(userProfile)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(userProfile.id, existing[0].id))
        .returning()
      return NextResponse.json({ profile: updated[0] })
    }
    const created = await db.insert(userProfile).values(body).returning()
    return NextResponse.json({ profile: created[0] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
