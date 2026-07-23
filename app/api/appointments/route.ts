import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { appointments } from '@/db/schemas/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const all = await db.select().from(appointments).orderBy(appointments.date)
    return NextResponse.json({ appointments: all })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await db.insert(appointments).values(body).returning()
    return NextResponse.json({ appointment: created[0] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...rest } = body
    const updated = await db.update(appointments).set(rest).where(eq(appointments.id, id)).returning()
    return NextResponse.json({ appointment: updated[0] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '0')
    await db.delete(appointments).where(eq(appointments.id, id))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
