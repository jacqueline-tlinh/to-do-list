import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          To-do List
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Organize your tasks efficiently with our simple and powerful todo list application.
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full bg-white text-blue-600 py-3 px-6 rounded-md border-2 border-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}