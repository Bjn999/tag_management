import React from "react";
import { checkAuthAndProfile } from "@/lib/auth-check";
import SettingsManager from "./SettingsManager";

export default async function SettingsPage() {
  const user = await checkAuthAndProfile({ requireProfile: true });

  const supervisorData = {
    fullName: user.profile?.full_name || "",
    email: user.email,
    phone: user.profile?.phone || "",
    role: user.profile?.role || "مشرف",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">الإعدادات</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          إدارة حسابك الشخصي، بيانات التواصل، وتغيير كلمة المرور الخاصة بلوحة التحكم
        </p>
      </div>

      <SettingsManager supervisor={supervisorData} />
    </div>
  );
}
