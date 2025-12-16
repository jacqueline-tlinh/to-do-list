'use client'

import { useState } from 'react'
import { EditTaskDialog } from './edit-task-dialog'

type Task = {
  id: string
  task: string
  deadline: string | null
  status: string
  finishedTime: string | null
  createdAt: string
}

type TaskItemProps = {
  task: Task
  onUpdated: () => void
  onDeleted: () => void
}

export function TaskItem({ task, onUpdated, onDeleted }: TaskItemProps) {
  const [deleting, setDeleting] = useState(false)

  const toggleStatus = async () => {
    const newStatus = task.status === 'pending' ? 'done' : 'pending'
    
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    
    onUpdated()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    setDeleting(true)
    await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    onDeleted()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isOverdue = task.deadline && task.status === 'pending' && new Date(task.deadline) < new Date()

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${task.status === 'done' ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={toggleStatus}
          className="mt-1 flex-shrink-0"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            task.status === 'done' 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 hover:border-green-500'
          }`}>
            {task.status === 'done' && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-gray-900 ${task.status === 'done' ? 'line-through' : ''}`}>
            {task.task}
          </p>
          
          <div className="flex flex-wrap gap-3 mt-2 text-sm">
            <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              📅 {formatDate(task.deadline)}
            </span>

            {isOverdue && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                Overdue
              </span>
            )}

            {task.status === 'done' && task.finishedTime && (
              <span className="text-green-600">
                ✓ Completed {formatDate(task.finishedTime)}
              </span>
            )}

            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                task.status === 'done'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {task.status === 'done' ? 'Done' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <EditTaskDialog task={task} onUpdated={onUpdated} />
          
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Delete task"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}