/**
 * NextAuth 认证配置模块
 *
 * 此模块负责配置NextAuth.js认证系统，解决环境变量和数据库连接问题
 *
 * 核心特性：
 * 1. 使用服务端专用环境变量模块
 * 2. 使用NextAuth专用的数据库连接
 * 3. 详细的认证流程调试信息
 * 4. 健壮的错误处理机制
 */

import { serverEnv } from "./env";
import { getNextAuthDb } from "./db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession, type Session } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

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
 * 创建NextAuth适配器（使用应用内的 NextAuth 专用 PrismaClient）
 * - 避免硬编码 DATABASE_URL
 * - 避免在 ESM 中使用 require()
 * - 统一复用 src/server/db.ts 的 nextauth 连接
 */
function createNextAuthAdapter(): Adapter {
  console.log("🔐 创建 NextAuth PrismaAdapter（使用共享 nextauth 连接）...");

  try {
    const adapterClient = getNextAuthDb();

    console.log(
      "✅ 使用 serverEnv.DATABASE_URL 创建适配器:",
      serverEnv.DATABASE_URL.replace(/\/\/.*@/, "//***:***@")
    );

    // 创建适配器
    const adapter = PrismaAdapter(adapterClient) as Adapter;
    console.log("✅ NextAuth PrismaAdapter 创建成功");

    // 包装适配器以添加额外的错误处理和调试信息
    const wrappedAdapter = {
      ...adapter,
      async createUser(user: any) {
        try {
          console.log("🔐 创建用户:", user.email);
          return await adapter.createUser!(user);
        } catch (error) {
          console.error("❌ 创建用户失败:", error);
          throw error;
        }
      },
      async getUser(id: string) {
        try {
          console.log("🔐 获取用户:", id);
          return await adapter.getUser!(id);
        } catch (error) {
          console.error("❌ 获取用户失败:", error);
          throw error;
        }
      },
      async getUserByAccount(provider_providerAccountId: { provider: string; providerAccountId: string }) {
        try {
          console.log("🔐 通过账户获取用户:", provider_providerAccountId);
          return await adapter.getUserByAccount!(provider_providerAccountId);
        } catch (error: any) {
          console.error("❌ 通过账户获取用户失败:", error);
          console.error("💥 错误详情:", {
            provider: provider_providerAccountId.provider,
            providerAccountId: provider_providerAccountId.providerAccountId,
            databaseUrl: serverEnv.DATABASE_URL.replace(/\/\/.*@/, "//***:***@"),
            errorMessage: error?.message,
          });
          throw error;
        }
      },
      async linkAccount(account: any) {
        try {
          console.log("🔐 关联账户:", account.userId, account.provider);
          return await adapter.linkAccount!(account);
        } catch (error) {
          console.error("❌ 关联账户失败:", error);
          throw error;
        }
      },
    };

    return wrappedAdapter;
  } catch (error: any) {
    console.error("❌ NextAuth适配器创建失败:", error);

    // 提供详细的错误诊断
    if (error instanceof Error) {
      console.error("💥 错误详情:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    throw new Error(`NextAuth适配器创建失败: ${error?.message}`);
  }
}

/**
 * 验证Google OAuth配置
 */
function validateGoogleOAuthConfig(): boolean {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = serverEnv;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("❌ Google OAuth配置缺失:");
    console.error("   GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "***已设置***" : "***未设置***");
    console.error("   GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "***已设置***" : "***未设置***");
    return false;
  }

  console.log("✅ Google OAuth配置验证通过");
  return true;
}

/**
 * 初始化NextAuth配置
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  // 信任主机配置，确保在开发环境下正确处理重定向
  trustHost: true,

  // 会话策略
  session: {
    strategy: "jwt",
  },

  // 回调函数配置
  callbacks: {
    /**
     * JWT回调 - 在JWT创建和更新时调用
     */
    async jwt({ token, user, trigger, session }) {
      console.log("🔐 JWT回调触发:", { trigger: trigger || "initial", hasUser: !!user });

      // 首次登录时设置用户信息
      if (user) {
        console.log("👤 首次登录，设置用户信息:", { id: user.id, role: user.role });
        token.id = user.id;
        token.hasAccess = user.hasAccess;
        token.name = user.name;
        token.image = user.image;
        token.picture = user.image;
        token.location = (user as Session["user"]).location;
        token.role = user.role;
        token.isAdmin = user.role === "ADMIN";
      }

      // 处理会话更新
      if (trigger === "update" && (session as Session)?.user) {
        console.log("🔄 会话更新触发");

        try {
          const user = await getNextAuthDb().user.findUnique({
            where: { id: token.id as string },
            select: { id: true, hasAccess: true, role: true, location: true },
          });

          console.log("📊 数据库用户信息:", user);

          if (session) {
            token.name = (session as Session).user.name;
            token.image = (session as Session).user.image;
            token.picture = (session as Session).user.image;
            token.location = (session as Session).user.location;
            token.role = (session as Session).user.role;
            token.isAdmin = (session as Session).user.role === "ADMIN";
          }

          if (user) {
            token.hasAccess = user?.hasAccess ?? false;
            token.role = user.role;
            token.isAdmin = user.role === "ADMIN";
            token.location = user.location;
          }
        } catch (error) {
          console.error("❌ 会话更新时查询用户失败:", error);
        }
      }

      return token;
    },

    /**
     * 会话回调 - 在会话创建时调用
     */
    async session({ session, token }) {
      console.log("🔐 会话回调触发");

      session.user.id = token.id as string;
      session.user.hasAccess = token.hasAccess as boolean;
      session.user.location = token.location as string;
      session.user.role = token.role as string;
      session.user.isAdmin = token.role === "ADMIN";

      console.log("👤 会话用户信息:", {
        id: session.user.id,
        role: session.user.role,
        hasAccess: session.user.hasAccess,
        isAdmin: session.user.isAdmin,
      });

      return session;
    },

    /**
     * 登录回调 - 在用户登录时调用
     */
    async signIn({ user, account }) {
      console.log("🔐 登录回调触发:", { provider: account?.provider, email: user.email });

      if (account?.provider === "google") {
        try {
          const nextAuthDb = getNextAuthDb();

          const dbUser = await nextAuthDb.user.findUnique({
            where: { email: user.email! },
            select: { id: true, hasAccess: true, role: true, name: true, image: true },
          });

          console.log("📊 数据库查询结果:", dbUser ? "用户已存在" : "用户不存在");

          if (dbUser) {
            user.hasAccess = dbUser.hasAccess;
            user.role = dbUser.role;
            user.name = dbUser.name || user.name;
            user.image = dbUser.image || user.image;

            console.log("👤 已存在用户信息:", {
              id: dbUser.id,
              role: dbUser.role,
              hasAccess: dbUser.hasAccess,
            });
          } else {
            user.hasAccess = false;
            user.role = "USER";

            console.log("👤 新用户默认配置:", { hasAccess: false, role: "USER" });
          }
        } catch (error) {
          console.error("❌ 登录时查询用户失败:", error);
          // 即使数据库查询失败，也允许登录
          user.hasAccess = false;
          user.role = "USER";
        }
      }

      console.log("✅ 登录验证通过");
      return true;
    },
  },

  // 适配器配置
  adapter: createNextAuthAdapter(),

  // OAuth提供商配置
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  // 调试配置
  debug: serverEnv.NODE_ENV === "development",

  // 事件处理
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("🎯 NextAuth事件 - 用户登录:", {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },

    async signOut({ session, token }) {
      console.log("🚪 NextAuth事件 - 用户登出:", {
        userId: token?.id,
        email: session?.user?.email,
      });
    },

    async createUser({ user }) {
      console.log("👶 NextAuth事件 - 创建用户:", {
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    },
  },

  // 页面配置
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});

/**
 * 认证系统初始化日志
 */
console.log("🔐 NextAuth配置完成");
console.log("📊 认证配置状态:", {
  googleOAuth: validateGoogleOAuthConfig(),
  adapter: "PrismaAdapter",
  sessionStrategy: "JWT",
  environment: serverEnv.NODE_ENV,
});
