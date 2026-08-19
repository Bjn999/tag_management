"use client";

import React, { useActionState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-slate-200/80 shadow-xl dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            تسجيل الدخول للمشرفين
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            أدخل البريد الإلكتروني وكلمة المرور للوصول إلى لوحة تحكم MyTag
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive dark:bg-destructive/20">
                {state.error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                كلمة المرور
              </Label>
              <div className="relative">
                <KeyRound className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full text-base font-semibold py-6 shadow-md"
              disabled={isPending}
            >
              {isPending ? "جاري تسجيل الدخول..." : "دخول"}
            </Button>
            <div className="text-center text-xs text-slate-400">
              نظام MyTag الآمن لإدارة المحافظ والحسابات
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
