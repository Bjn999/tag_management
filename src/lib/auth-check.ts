import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email: string;
  isProfileComplete: boolean;
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role: "مشرف" | "مستثمر";
    supervisor_id: string | null;
  } | null;
}

/**
 * دالة للتحقق من مصادقة المستخدم والبروفايل الخاص به.
 * تقوم بالتوجيه تلقائياً إلى صفحة تسجيل الدخول أو إكمال البيانات (Onboarding) عند الحاجة.
 */
export async function checkAuthAndProfile(options: {
  requireProfile?: boolean;
  requireSupervisor?: boolean;
} = { requireProfile: true, requireSupervisor: false }): Promise<AuthUser> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }

  // جلب بيانات البروفايل عبر auth_id
  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  console.log('profile: ' + profile);
  if (profError) {
    console.log('profError: ' + profError.message);
  }

  // التحقق من اكتمال البروفايل: يجب أن يكون الاسم ورقم الهاتف مكتملَين
  const isProfileComplete =
    profile &&
    profile.full_name && profile.full_name.trim() !== "" &&
    profile.phone && profile.phone.trim() !== "";

  // لا نعيد توجيهاً هنا — المودال في لوحة التحكم سيتكفل بالإشعار

  /*if (profile?.email == "abajhnoon@gmail.com"){

  } else */
  // console.log(options.requireSupervisor + " && " + profile + " && " + user.email);
  if (options.requireSupervisor && profile?.role !== "مشرف") {
    redirect("/unauthorized");
  }

  return {
    id: user.id,
    email: user.email || "",
    isProfileComplete: !!isProfileComplete,
    profile: profile as AuthUser["profile"],
  };
}
