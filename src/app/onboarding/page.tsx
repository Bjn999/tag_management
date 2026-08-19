import { redirect } from "next/navigation";

// صفحة /onboarding لم تعد تُستخدم — المودال في لوحة التحكم يتكفل بهذه المهمة
export default function OnboardingPage() {
  redirect("/dashboard");
}
