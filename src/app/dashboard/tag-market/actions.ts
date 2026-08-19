"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkAuthAndProfile } from "@/lib/auth-check";

// إضافة أو تعديل حساب Tag Market
export async function saveTagMarketAccount(prevState: any, formData: FormData) {
  try {
    const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
    
    const profileId = formData.get("profileId") as string;
    const tagSysId = formData.get("tagSysId") as string;
    const tagEmail = formData.get("tagEmail") as string;
    const tagPassword = formData.get("tagPassword") as string;
    const mt5User = formData.get("mt5User") as string;
    const mt5Pass = formData.get("mt5Pass") as string;
    const registrationLink = formData.get("registrationLink") as string;

    if (!profileId || !tagSysId || !tagEmail || !tagPassword) {
      return { error: "يرجى تعبئة جميع الحقول المطلوبة لمنصة Tag Market." };
    }

    const supabase = await createClient();

    // 1. التحقق من وجود حساب AI Tech أولاً لهذا المستثمر (شرط أساسي)
    const { data: aiTech, error: aiTechCheckError } = await supabase
      .from("ai_tech")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (aiTechCheckError || !aiTech) {
      return { error: "عذراً، لا يمكن إضافة حساب Tag Market لهذا المستثمر إلا بعد تفعيل حساب AI Tech له أولاً!" };
    }

    // 2. التحقق من ملكية المشرف للبروفايل
    const { data: profile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profileId)
      .eq("supervisor_id", user.profile?.id)
      .single();

    if (profileCheckError || !profile) {
      return { error: "غير مصرح لك بإدارة هذا المستثمر." };
    }

    // 3. تخزين أو تحديث بيانات حساب Tag Market
    const { error: tagError } = await supabase
      .from("tag_market")
      .upsert({
        profile_id: profileId,
        sys_id: tagSysId,
        email: tagEmail,
        password: tagPassword,
        mt5_user: mt5User || null,
        mt5_pass: mt5Pass || null,
        registration_link: registrationLink || null,
      }, { onConflict: "profile_id" });

    if (tagError) {
      return { error: "خطأ أثناء حفظ حساب Tag Market: " + tagError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tag-market");
    return { success: "تم حفظ بيانات حساب Tag Market والـ MT5 بنجاح!" };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}

// حذف حساب Tag Market فقط دون حذف المستثمر
export async function deleteTagMarketAccount(profileId: string) {
  try {
    const user = await checkAuthAndProfile({ requireProfile: true, requireSupervisor: true });
    const supabase = await createClient();

    // التحقق من ملكية المشرف للبروفايل
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profileId)
      .eq("supervisor_id", user.profile?.id)
      .single();

    if (!profile) {
      return { error: "غير مصرح لك." };
    }

    const { error } = await supabase
      .from("tag_market")
      .delete()
      .eq("profile_id", profileId);

    if (error) {
      return { error: "فشل حذف حساب Tag Market: " + error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tag-market");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}
