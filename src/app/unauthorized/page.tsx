import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function UnauthorizedPage() {
  const handleLogout = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">غير مصرح بالدخول</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          عذراً، هذا الحساب ليس لديه صلاحية الوصول إلى لوحة تحكم المشرفين. يرجى تسجيل الدخول بحساب مشرف معتمد.
        </p>
        <div className="flex flex-col gap-3">
          <form action={handleLogout}>
            <Button type="submit" variant="destructive" className="w-full py-5 font-semibold">
              تسجيل الخروج
            </Button>
          </form>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full py-5 font-semibold">
              العودة لصفحة الدخول
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
