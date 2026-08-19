"use client";

import React, { useEffect, useState, useActionState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { completeProfile } from "@/app/onboarding/actions";

// مفتاح الجلسة في sessionStorage — يُحذف بعد كل تسجيل دخول جديد
const SESSION_KEY = "mt_profile_modal_shown";

interface ProfileCompletionModalProps {
  isProfileComplete: boolean;
  defaultFullName?: string;
  defaultPhone?: string;
}

export default function ProfileCompletionModal({
  isProfileComplete,
  defaultFullName = "",
  defaultPhone = "",
}: ProfileCompletionModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(completeProfile, null);

  useEffect(() => {
    // يظهر المودال إذا:
    // 1. البروفايل غير مكتمل
    // 2. أو لم يظهر في هذه الجلسة بعد (حتى لو مكتمل، يظهر مرة واحدة لكل login)
    const alreadyShownThisSession = sessionStorage.getItem(SESSION_KEY) === "true";

    if (!alreadyShownThisSession) {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, []);

  // عند نجاح الحفظ، يُغلق المودال تلقائياً
  useEffect(() => {
    if (!state?.error) {
      setTimeout(() => setOpen(false), 800);
    }
  }, [state]);

  // لا تُظهر المودال أبداً إذا كان المستخدم لا يريده ببساطة
  if (!open) return null;

  const missingFields: string[] = [];
  if (!defaultFullName) missingFields.push("الاسم الكامل");
  if (!defaultPhone) missingFields.push("رقم الهاتف");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {isProfileComplete ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>مراجعة ملفك الشخصي</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>إكمال بيانات ملفك الشخصي</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {isProfileComplete
              ? "بياناتك مكتملة. يمكنك تحديثها في أي وقت."
              : `لاحظنا أن الحقول التالية ناقصة: ${missingFields.join("، ")}. يُرجى تعبئتها للاستمرار باستخدام النظام.`}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
              {state.error}
            </div>
          )}
          {!state?.error && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 text-sm p-3 rounded-lg font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>تم حفظ البيانات بنجاح!</span>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="modal_fullName">الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="modal_fullName"
                name="fullName"
                defaultValue={defaultFullName}
                required
                placeholder="مثال: أحمد باجنون"
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="modal_phone">رقم الهاتف</Label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="modal_phone"
                name="phone"
                defaultValue={defaultPhone}
                required
                placeholder="+966500000000"
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="modal_role">الدور في النظام</Label>
            <Select name="role" defaultValue="مشرف">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر دورك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="مشرف">مشرف</SelectItem>
                <SelectItem value="مستثمر">مستثمر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              <span>حفظ البيانات</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              {isProfileComplete ? "إغلاق" : "لاحقاً"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
