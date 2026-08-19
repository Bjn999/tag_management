import React from "react";
import { checkAuthAndProfile } from "@/lib/auth-check";
import { createClient } from "@/lib/supabase/server";
import TagMarketManager from "./TagMarketManager";

export default async function TagMarketPage() {
  const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
  const supabase = await createClient();

  // جلب كافة المستثمرين والبيانات التابعة لهم
  const { data: investors } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      ai_tech (
        id,
        sys_id
      ),
      tag_market (
        id,
        sys_id,
        email,
        password,
        mt5_user,
        mt5_pass,
        registration_link
      )
    `)
    .eq("role", "مستثمر")
    .eq("supervisor_id", user.profile?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">إدارة حسابات Tag Market</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          إدارة وتفعيل حسابات المنصة الثانية وبيانات MT5 للمستثمرين المفعل لديهم حساب AI Tech
        </p>
      </div>

      <TagMarketManager investors={investors || []} />
    </div>
  );
}
