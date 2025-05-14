import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * 扩展Session类型
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  /** 扩展JWT类型 */
  interface JWT {
    id: string
    isAdmin?: boolean
  }
} 