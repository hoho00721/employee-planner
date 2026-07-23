import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { tasks } from '@/db/schemas/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const all = await db.select().from(tasks).orderBy(tasks.date)
    return NextResponse.json({ tasks: all })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await db.insert(tasks).values(body).returning()
    return NextResponse.json({ task: created[0] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...rest } = body
    const updated = await db.update(tasks).set(rest).where(eq(tasks.id, id)).returning()
    return NextResponse.json({ task: updated[0] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '0')
    await db.delete(tasks).where(eq(tasks.id, id))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
