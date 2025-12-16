import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const id = url.pathname.split('/').pop()

  if (!id) {
    return NextResponse.json({ error: 'Invalid task id' }, { status: 400 })
  }

  const body = await req.json()

  const data: any = {}

  if (typeof body.task === 'string') {
    data.task = body.task.trim()
  }

  if (body.status === 'done' || body.status === 'pending') {
    data.status = body.status
  }

  if ('deadline' in body) {
    data.deadline =
      body.deadline && !isNaN(Date.parse(body.deadline))
        ? new Date(body.deadline)
        : null
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existingTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (data.status === 'done' && existingTask.status !== 'done') {
    data.finishedTime = new Date()
  }

  if (data.status === 'pending') {
    data.finishedTime = null
  }

  const task = await prisma.task.update({
    where: { id },
    data,
  })

  return NextResponse.json({ task })
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    await prisma.task.delete({
      where: { 
        id,
        userId: session.user.id 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
}