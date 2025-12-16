import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const where: any = {
    userId: session.user.id,
  }

  if (status && status !== 'all') {
    where.status = status
  }

  if (search) {
    where.task = {
      contains: search,
      mode: 'insensitive',
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
  })

  return NextResponse.json({ tasks })
}

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { task, deadline } = await req.json()

  if (!task || task.trim() === '') {
    return NextResponse.json({ error: 'Task cannot be empty' }, { status: 400 })
  }

  const newTask = await prisma.task.create({
    data: {
      userId: session.user.id,
      task: task.trim(),
      deadline: deadline ? new Date(deadline) : null,
      status: 'pending',
    }
  })

  return NextResponse.json({ task: newTask })
}