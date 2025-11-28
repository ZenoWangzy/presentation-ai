"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "服务器配置错误。请检查环境变量设置。",
        AccessDenied: "访问被拒绝。",
        Verification: "验证链接已过期或已被使用。",
        Default: "发生了未知错误。",
    };

    const errorMessage = errorMessages[error || "Default"] || errorMessages.Default;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-red-600">认证错误</h1>
                    <p className="text-gray-600">Authentication Error</p>
                </div>

                <div className="mb-6 rounded-lg bg-red-50 p-4">
                    <p className="mb-2 font-semibold text-red-800">错误类型: {error}</p>
                    <p className="text-red-700">{errorMessage}</p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/auth/signin"
                        className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
                    >
                        返回登录
                    </Link>
                    <Link
                        href="/"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-50"
                    >
                        返回首页
                    </Link>
                </div>

                {process.env.NODE_ENV === "development" && (
                    <div className="mt-6 rounded-lg bg-gray-100 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">调试信息:</p>
                        <pre className="overflow-x-auto text-xs text-gray-600">
                            {JSON.stringify({ error, searchParams: Object.fromEntries(searchParams.entries()) }, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
