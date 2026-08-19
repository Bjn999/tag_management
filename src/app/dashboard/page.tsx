import React from "react";
import Link from "next/link";
import { checkAuthAndProfile } from "@/lib/auth-check";
import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  Cpu, 
  TrendingUp, 
  UserPlus,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
  const supabase = await createClient();

  // جلب إحصائيات المستثمرين التابعين لهذا المشرف
  const { count: totalInvestors } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "مستثمر")
    .eq("supervisor_id", user.profile?.id);

  // جلب حسابات AI Tech المرتبطة بمستثمري هذا المشرف
  const { data: investors } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at, ai_tech(id, sys_id, email), tag_market(id, sys_id, email, registration_link)")
    .eq("role", "مستثمر")
    .eq("supervisor_id", user.profile?.id)
    .order("created_at", { ascending: false });

  // تحويل العلاقات إلى كائنات مفردة بشكل آمن
  const resolvedInvestors = investors?.map((inv: any) => {
    const aiTech = Array.isArray(inv.ai_tech) ? inv.ai_tech[0] : inv.ai_tech;
    const tagMarket = Array.isArray(inv.tag_market) ? inv.tag_market[0] : inv.tag_market;
    return {
      ...inv,
      ai_tech: aiTech || null,
      tag_market: tagMarket || null,
    };
  }) || [];

  const aiTechCount = resolvedInvestors.filter(inv => inv.ai_tech).length;
  const tagMarketCount = resolvedInvestors.filter(inv => inv.tag_market).length;

  // آخر 5 مستثمرين مضافين
  const recentInvestors = resolvedInvestors.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* الترحيب والعناوين */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">لوحة الأداء</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">مرحباً بك مجدداً، {user.profile?.full_name}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/ai-tech">
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>إدارة المستثمرين</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* بطاقات الإحصائيات (Metrics) */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">إجمالي المستثمرين تحتك</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalInvestors || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">حسابات المستثمرين النشطة</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">حسابات AI Tech المسجلة</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{aiTechCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">حسابات مفعلة على المنصة الأولى</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">حسابات Tag Market المسجلة</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{tagMarketCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">حسابات مفعلة على المنصة الثانية</p>
          </CardContent>
        </Card>
      </div>

      {/* آخر المستثمرين المضافين */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>آخر المستثمرين المضافين</CardTitle>
            <CardDescription>نظرة سريعة على آخر 5 مستثمرين وحالة حساباتهم في المنصات</CardDescription>
          </div>
          <Link href="/dashboard/ai-tech">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <span>عرض الكل</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentInvestors.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              لا يوجد مستثمرون مضافون حالياً. ابدأ بإضافة أول مستثمر من صفحة حسابات AI Tech.
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm text-right text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 rounded-r-lg">الاسم</th>
                    <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                    <th scope="col" className="px-6 py-3">رقم الهاتف</th>
                    <th scope="col" className="px-6 py-3 text-center">AI Tech</th>
                    <th scope="col" className="px-6 py-3 text-center">Tag Market</th>
                    <th scope="col" className="px-6 py-3 rounded-l-lg text-center">رابط التسجيل</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvestors.map((inv) => (
                    <tr key={inv.id} className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{inv.full_name}</td>
                      <td className="px-6 py-4">{inv.email}</td>
                      <td className="px-6 py-4">{inv.phone || "—"}</td>
                      <td className="px-6 py-4 text-center">
                        {inv.ai_tech ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            مفعل
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            غير مفعل
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inv.tag_market ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                            مفعل
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                            غير مفعل
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inv.tag_market?.registration_link ? (
                          <a 
                            href={inv.tag_market.registration_link}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <span>رابط</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
