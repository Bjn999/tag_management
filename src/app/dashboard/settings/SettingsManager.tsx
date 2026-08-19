"use client";

import React, { useActionState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { updateSupervisorProfile, updateSupervisorPassword } from "./actions";

interface Supervisor {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface SettingsManagerProps {
  supervisor: Supervisor;
}

export default function SettingsManager({ supervisor }: SettingsManagerProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateSupervisorProfile, null);
  const [passwordState, passwordAction, isPasswordPending] = useActionState(updateSupervisorPassword, null);

  return (
    <Tabs defaultValue="profile" className="w-full space-y-6">
      <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex w-full sm:w-auto">
        <TabsTrigger value="profile" className="px-6 py-2.5 rounded-lg text-sm font-semibold">الملف الشخصي</TabsTrigger>
        <TabsTrigger value="security" className="px-6 py-2.5 rounded-lg text-sm font-semibold">الأمان والحماية</TabsTrigger>
      </TabsList>

      {/* تبويب الملف الشخصي */}
      <TabsContent value="profile">
        <form action={profileAction}>
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">تحديث الملف الشخصي</CardTitle>
              <CardDescription>قم بتعديل بياناتك الشخصية للوحة التحكم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileState?.error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
                  {profileState.error}
                </div>
              )}
              {profileState?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium">
                  {profileState.success}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      defaultValue={supervisor.fullName} 
                      required 
                      className="pr-10" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="phone" 
                      name="phone" 
                      defaultValue={supervisor.phone} 
                      className="pr-10" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">البريد الإلكتروني (حساب الدخول)</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      defaultValue={supervisor.email} 
                      disabled 
                      className="pr-10 bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">البريد الإلكتروني مرتبط بنظام المصادقة ولا يمكن تعديله يدوياً.</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="role">الدور في النظام</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="role" 
                      defaultValue={supervisor.role} 
                      disabled 
                      className="pr-10 bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 flex justify-start">
              <Button type="submit" disabled={isProfilePending} className="px-6">
                {isProfilePending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                <span>حفظ التغييرات</span>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>

      {/* تبويب الأمان */}
      <TabsContent value="security">
        <form action={passwordAction}>
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">تغيير كلمة المرور</CardTitle>
              <CardDescription>قم بتعيين كلمة مرور جديدة لتأمين حساب المشرف الخاص بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordState?.error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
                  {passwordState.error}
                </div>
              )}
              {passwordState?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium">
                  {passwordState.success}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="password">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="pr-10" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="pr-10" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 flex justify-start">
              <Button type="submit" disabled={isPasswordPending} className="px-6">
                {isPasswordPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                <span>تحديث كلمة المرور</span>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>
    </Tabs>
  );
}
