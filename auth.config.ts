import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma'

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow sign in
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        
        try {
          // Fetch fresh user data including name
          const user = await prisma.user.findUnique({
            where: { id: token.sub }
          })
          
          if (user) {
            // If user has no name, generate one from email
            if (!user.name && user.email) {
              const generatedName = user.email.split('@')[0]
              await prisma.user.update({
                where: { id: user.id },
                data: { name: generatedName }
              })
              session.user.name = generatedName
            } else {
              session.user.name = user.name || undefined
            }
            if (user.email) {
              session.user.email = user.email
            }
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      return session
    }
  }
} satisfies NextAuthConfig