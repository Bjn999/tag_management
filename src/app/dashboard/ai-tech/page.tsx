import React from "react";
import { checkAuthAndProfile } from "@/lib/auth-check";
import { createClient } from "@/lib/supabase/server";
import InvestorManager from "./InvestorManager";

export default async function AiTechPage() {
  const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
  const supabase = await createClient();

  // جلب كافة المستثمرين وحسابات AI Tech التابعة لهذا المشرف
  const { data: investors } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      created_at,
      ai_tech (
        id,
        sys_id,
        email,
        password
      )
    `)
    .eq("role", "مستثمر")
    .eq("supervisor_id", user.profile?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">إدارة حسابات AI Tech</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          قم بإنشاء مستثمرين جدد وتعبئة بيانات حساباتهم على منصة AI Tech الأولى
        </p>
      </div>

      <InvestorManager initialInvestors={investors || []} />
    </div>
  );
}
