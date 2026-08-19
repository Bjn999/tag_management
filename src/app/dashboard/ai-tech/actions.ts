"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkAuthAndProfile } from "@/lib/auth-check";

// إضافة مستثمر جديد مع حساب AI Tech الخاص به
export async function addInvestorWithAiTech(prevState: any, formData: FormData) {
  try {
    const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
    const supervisorId = user.profile?.id;

    if (!supervisorId) {
      return { error: "فشل التحقق من هوية المشرف." };
    }

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    
    const aiSysId = formData.get("aiSysId") as string;
    const aiEmail = formData.get("aiEmail") as string;
    const aiPassword = formData.get("aiPassword") as string;

    if (!fullName || !email || !aiSysId || !aiEmail || !aiPassword) {
      return { error: "يرجى تعبئة جميع الحقول المطلوبة." };
    }

    const supabase = await createClient();

    // 1. إنشاء البروفايل للمستثمر في جدول profiles
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        full_name: fullName,
        email: email,
        phone: phone || null,
        role: "مستثمر",
        supervisor_id: supervisorId,
      })
      .select()
      .single();

    if (profileError) {
      return { error: "خطأ أثناء إضافة البروفايل: " + profileError.message };
    }

    // 2. إنشاء حساب AI Tech المرتبط بالبروفايل الجديد
    const { error: aiTechError } = await supabase
      .from("ai_tech")
      .insert({
        profile_id: newProfile.id,
        sys_id: aiSysId,
        email: aiEmail,
        password: aiPassword,
      });

    if (aiTechError) {
      // التراجع عن إنشاء البروفايل في حال فشل إنشاء حساب المنصة لمنع البيانات المعلقة
      await supabase.from("profiles").delete().eq("id", newProfile.id);
      return { error: "خطأ أثناء إضافة حساب AI Tech: " + aiTechError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/ai-tech");
    return { success: "تم إضافة المستثمر وحساب AI Tech بنجاح!" };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}

// تعديل بيانات مستثمر وحساب AI Tech
export async function editInvestorWithAiTech(prevState: any, formData: FormData) {
  try {
    const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
    
    const profileId = formData.get("profileId") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    
    const aiSysId = formData.get("aiSysId") as string;
    const aiEmail = formData.get("aiEmail") as string;
    const aiPassword = formData.get("aiPassword") as string;

    if (!profileId || !fullName || !email || !aiSysId || !aiEmail || !aiPassword) {
      return { error: "يرجى ملء جميع الحقول المطلوبة." };
    }

    const supabase = await createClient();

    // 1. تحديث البروفايل
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        email: email,
        phone: phone || null,
      })
      .eq("id", profileId)
      .eq("supervisor_id", user.profile?.id); // أمان إضافي للتأكد أنه تحت نفس المشرف

    if (profileError) {
      return { error: "خطأ أثناء تعديل بيانات البروفايل: " + profileError.message };
    }

    // 2. تحديث أو إدخال حساب AI Tech (Upsert)
    const { error: aiTechError } = await supabase
      .from("ai_tech")
      .upsert({
        profile_id: profileId,
        sys_id: aiSysId,
        email: aiEmail,
        password: aiPassword,
      }, { onConflict: "profile_id" });

    if (aiTechError) {
      return { error: "خطأ أثناء تحديل حساب AI Tech: " + aiTechError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/ai-tech");
    return { success: "تم تحديث بيانات المستثمر وحسابه بنجاح!" };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}

// حذف مستثمر
export async function deleteInvestor(profileId: string) {
  try {
    const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
    const supabase = await createClient();

    // حذف البروفايل (سيقوم النظام بحذف الحسابات التابعة له تلقائياً بسبب ON DELETE CASCADE)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId)
      .eq("supervisor_id", user.profile?.id);

    if (error) {
      return { error: "فشل الحذف: " + error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/ai-tech");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}
