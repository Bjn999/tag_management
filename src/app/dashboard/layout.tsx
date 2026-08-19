import React from "react";
import Link from "next/link";
import { checkAuthAndProfile } from "@/lib/auth-check";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  Cpu, 
  TrendingUp, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileCompletionModal from "./ProfileCompletionModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // التحقق من المصادقة والتأكد من أن المستخدم مشرف
  const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });

  const logoutAction = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* الشريط الجانبي (Sidebar) */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">MT</span>
            <span>نظام MyTag</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 px-4 py-6">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5 text-slate-400" />
            <span>لوحة الأداء</span>
          </Link>

          <Link 
            href="/dashboard/ai-tech" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors"
          >
            <Cpu className="h-5 w-5 text-slate-400" />
            <span>حسابات AI Tech</span>
          </Link>

          <Link 
            href="/dashboard/tag-market" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-slate-400" />
            <span>حسابات Tag Market</span>
          </Link>

          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors"
          >
            <Settings className="h-5 w-5 text-slate-400" />
            <span>الإعدادات</span>
          </Link>
        </nav>

        {/* معلومات المستخدم وزر تسجيل الخروج في أسفل الشريط */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">
              {user.profile?.full_name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{user.profile?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* شريط علوي للمحمول */}
        <header className="flex md:hidden h-16 items-center justify-between px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="bg-primary text-primary-foreground p-1 rounded">MT</span>
            <span>MyTag</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings" className="text-slate-500 hover:text-slate-900">
              <Settings className="h-5 w-5" />
            </Link>
            <form action={logoutAction}>
              <button className="text-rose-500 hover:text-rose-700">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        {/* شريط تنقل سفلي للمحمول للتنقل السريع */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-50">
          <Link href="/dashboard" className="flex flex-col items-center text-xs font-medium text-slate-600 hover:text-primary">
            <LayoutDashboard className="h-5 w-5" />
            <span>لوحة الأداء</span>
          </Link>
          <Link href="/dashboard/ai-tech" className="flex flex-col items-center text-xs font-medium text-slate-600 hover:text-primary">
            <Cpu className="h-5 w-5" />
            <span>AI Tech</span>
          </Link>
          <Link href="/dashboard/tag-market" className="flex flex-col items-center text-xs font-medium text-slate-600 hover:text-primary">
            <TrendingUp className="h-5 w-5" />
            <span>Tag Market</span>
          </Link>
          <Link href="/dashboard/settings" className="flex flex-col items-center text-xs font-medium text-slate-600 hover:text-primary">
            <Settings className="h-5 w-5" />
            <span>الإعدادات</span>
          </Link>
        </nav>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* مودال إكمال البروفايل — يظهر تلقائياً مرة واحدة بعد كل تسجيل دخول */}
        <ProfileCompletionModal
          isProfileComplete={user.isProfileComplete}
          defaultFullName={user.profile?.full_name || ""}
          defaultPhone={user.profile?.phone || ""}
        />
      </div>
    </div>
  );
}
