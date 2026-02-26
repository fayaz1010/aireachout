
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName?: string | null
      lastName?: string | null
      companyName?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName?: string | null
    lastName?: string | null
    companyName?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    firstName?: string | null
    lastName?: string | null
    companyName?: string | null
  }
}
