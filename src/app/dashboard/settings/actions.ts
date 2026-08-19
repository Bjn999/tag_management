"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkAuthAndProfile } from "@/lib/auth-check";

// تحديث البروفايل الشخصي للمشرف
export async function updateSupervisorProfile(prevState: any, formData: FormData) {
  try {
    const user = await checkAuthAndProfile({ requireProfile: true });
    
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;

    if (!fullName) {
      return { error: "الاسم الكامل حقل مطلوب." };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
      })
      .eq("id", user.profile?.id);

    if (error) {
      return { error: "حدث خطأ أثناء تحديث البيانات: " + error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: "تم تحديث بيانات البروفايل بنجاح!" };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}

// تحديث كلمة مرور المشرف
export async function updateSupervisorPassword(prevState: any, formData: FormData) {
  try {
    await checkAuthAndProfile({ requireProfile: true });
    
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
      return { error: "يرجى تعبئة حقول كلمة المرور." };
    }

    if (password !== confirmPassword) {
      return { error: "كلمتا المرور غير متطابقتين." };
    }

    if (password.length < 6) {
      return { error: "يجب أن تتكون كلمة المرور من 6 خانات على الأقل." };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      return { error: "فشل تحديث كلمة المرور: " + error.message };
    }

    return { success: "تم تغيير كلمة المرور بنجاح!" };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}
