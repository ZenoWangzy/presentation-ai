/**
 * Edge Runtime安全的NextAuth配置
 *
 * 此模块提供可以在Edge Runtime中使用的NextAuth功能
 * 避免复杂的数据库连接初始化
 */

import { serverEnv } from "./env";
import { createSimplePrismaClient } from "./db-edge-safe";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession, type Session } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

// 声明类型扩展
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      hasAccess: boolean;
      location?: string;
      role: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    hasAccess: boolean;
    role: string;
  }
}

/**
 * 创建简单的NextAuth适配器
 * 只在需要时初始化，避免Edge Runtime问题
 */
function createSimpleAdapter(): Adapter {
  console.log("🔐 创建Edge Runtime安全的NextAuth适配器...");

  try {
    const client = createSimplePrismaClient("nextauth-edge");
    const adapter = PrismaAdapter(client) as Adapter;

    console.log("✅ Edge Runtime安全适配器创建成功");
    return adapter;
  } catch (error) {
    console.error("❌ Edge Runtime适配器创建失败:", error);
    throw new Error(`适配器创建失败: ${error.message}`);
  }
}

/**
 * 简化的NextAuth配置
 * 移除复杂的数据库操作和Edge Runtime不兼容的功能
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.hasAccess = user.hasAccess;
        token.role = user.role;
        token.isAdmin = user.role === "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.hasAccess = token.hasAccess as boolean;
        session.user.role = token.role as string;
        session.user.isAdmin = token.role === "ADMIN";
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // 设置默认值，避免数据库查询
        user.hasAccess = false;
        user.role = "USER";
      }
      return true;
    },
  },

  // 适配器配置
  adapter: createSimpleAdapter(),

  // OAuth提供商
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }),
  ],

  debug: serverEnv.NODE_ENV === "development",
});

console.log("🔐 Edge Runtime安全NextAuth配置完成");