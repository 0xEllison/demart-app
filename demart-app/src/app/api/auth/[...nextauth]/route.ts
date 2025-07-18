import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // 如果 token 中有用户 ID，则将其添加到会话中
      if (token?.id) {
        session.user.id = token.id as string;
      }
      
      // 如果 token 中有更新的用户名，则更新会话中的用户名
      if (token?.name) {
        session.user.name = token.name as string;
      }
      
      // 如果 token 中有更新的用户头像，则更新会话中的用户头像
      if (token?.image) {
        session.user.image = token.image as string;
      }
      
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // 初始登录时，将用户数据添加到 token 中
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      
      // 当会话更新时，更新 token 中的数据
      if (trigger === "update" && session) {
        if (session.user?.name) {
          token.name = session.user.name;
        }
        if (session.user?.image) {
          token.image = session.user.image;
        }
      }
      
      return token;
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 