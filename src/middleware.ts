import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge Runtime安全的中间件
 *
 * 此中间件完全避免使用PrismaClient和NextAuth适配器
 * 仅依赖JWT会话验证，确保Edge Runtime兼容性
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 从cookie中获取会话token（兼容 next-auth v4 与 auth.js v5）
  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  const isAuthPage = pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");

  // Always redirect from root to /presentation
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // 如果用户已登录（有session token）但在认证页面，重定向到主页
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // 如果用户未登录且尝试访问受保护的路由，重定向到登录页面
  if (!sessionCookie && !isAuthPage && !isApiRoute) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(request.url));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 配置中间件匹配规则，排除静态资源和API路由
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
