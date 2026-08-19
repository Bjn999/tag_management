"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeProfile(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;

  if (!fullName || !phone || !role) {
    return { error: "يرجى ملء جميع الحقول المطلوبة." };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // تحديث البروفايل عبر auth_id مع .select() للتحقق من نجاح التحديث فعلياً
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone,
      role: role,
    })
    .eq("auth_id", user!.id)
    .select();

  if (error) {
    return { error: "حدث خطأ أثناء حفظ البيانات: " + error.message };
  }

  // إذا رجعت 0 صفوف، فـ RLS منع التحديث بصمت
  if (!data || data.length === 0) {
    return {
      error: "فشل حفظ البيانات بسبب سياسة الأمان (RLS). يرجى تطبيق سياسة UPDATE في Supabase (راجع التعليمات أدناه في الصفحة)."
    };
  }

  redirect("/dashboard");
}
