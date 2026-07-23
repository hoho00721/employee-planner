import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { vacations } from '@/db/schemas/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const all = await db.select().from(vacations).orderBy(vacations.startDate)
    return NextResponse.json({ vacations: all })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await db.insert(vacations).values(body).returning()
    return NextResponse.json({ vacation: created[0] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...rest } = body
    const updated = await db.update(vacations).set(rest).where(eq(vacations.id, id)).returning()
    return NextResponse.json({ vacation: updated[0] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '0')
    await db.delete(vacations).where(eq(vacations.id, id))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
