"use client";

import React, { useState, useTransition } from "react";
import { 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Link as LinkIcon, 
  Plus, 
  TrendingUp, 
  Cpu, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { saveTagMarketAccount, deleteTagMarketAccount } from "./actions";

interface Investor {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  ai_tech: {
    id: string;
    sys_id: string;
  } | null;
  tag_market: {
    id: string;
    sys_id: string;
    email: string;
    password: string;
    mt5_user: string | null;
    mt5_pass: string | null;
    registration_link: string | null;
  } | null;
}

interface TagMarketManagerProps {
  investors: any[];
}

export default function TagMarketManager({ investors }: TagMarketManagerProps) {
  const [search, setSearch] = useState("");
  const [showTagPassId, setShowTagPassId] = useState<string | null>(null);
  const [showMt5PassId, setShowMt5PassId] = useState<string | null>(null);

  // Modals state
  const [saveOpen, setSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Selected Investor
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

  // Form states
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSaveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!selectedInvestor) return;

    // التحقق مجدداً في الواجهة من شرط وجود AI Tech
    if (!selectedInvestor.ai_tech) {
      setActionError("عذراً، يجب تفعيل حساب AI Tech أولاً لهذا المستثمر!");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("profileId", selectedInvestor.id);

    startTransition(async () => {
      const res = await saveTagMarketAccount(null, formData);
      if (res?.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(res?.success || "تم الحفظ بنجاح");
        setSaveOpen(false);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvestor) return;
    setActionError(null);

    startTransition(async () => {
      const res = await deleteTagMarketAccount(selectedInvestor.id);
      if (res?.error) {
        setActionError(res.error);
      } else {
        setDeleteOpen(false);
        setActionSuccess("تم حذف حساب Tag Market بنجاح");
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
  };

  // تصفية المستثمرين بالبحث
  const filteredInvestors = (investors as Investor[]).filter(
    (inv) =>
      inv.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* شريط البحث */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="بحث بالاسم أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          ملاحظة: يمكنك فقط إضافة حسابات Tag Market للمستثمرين الذين يملكون حسابات AI Tech نشطة.
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium">
          {actionSuccess}
        </div>
      )}

      {/* جدول عرض المستثمرين وبياناتهم في Tag Market */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-0">
          {filteredInvestors.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              لا يوجد مستثمرون حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">المستثمر</th>
                    <th scope="col" className="px-6 py-4 text-center">حالة AI Tech</th>
                    <th scope="col" className="px-6 py-4">حساب Tag Market</th>
                    <th scope="col" className="px-6 py-4">بيانات الـ MT5</th>
                    <th scope="col" className="px-6 py-4 text-center">الخيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestors.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{inv.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inv.ai_tech ? (
                          <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>نشط ({inv.ai_tech.sys_id})</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>غير متوفر</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inv.tag_market ? (
                          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 max-w-xs">
                            <div className="text-xs">
                              <span className="font-medium text-slate-400">معرف النظام:</span>{" "}
                              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{inv.tag_market.sys_id}</span>
                            </div>
                            <div className="text-xs">
                              <span className="font-medium text-slate-400">الايميل:</span>{" "}
                              <span className="text-slate-700 dark:text-slate-300">{inv.tag_market.email}</span>
                            </div>
                            <div className="text-xs flex items-center gap-1">
                              <span className="font-medium text-slate-400">كلمة المرور:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">
                                {showTagPassId === inv.tag_market?.id ? inv.tag_market?.password : "••••••••"}
                              </span>
                              <button 
                                type="button"
                                onClick={() => setShowTagPassId(showTagPassId === inv.tag_market?.id ? null : inv.tag_market?.id || null)}
                                className="text-slate-400 hover:text-slate-600 ml-1"
                              >
                                {showTagPassId === inv.tag_market?.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            {inv.tag_market.registration_link && (
                              <div className="text-xs flex items-center gap-1 border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1.5">
                                <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                                <a 
                                  href={inv.tag_market.registration_link}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium flex items-center gap-0.5"
                                >
                                  <span>رابط التسجيل للمستثمر</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">غير مضاف</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inv.tag_market && (inv.tag_market.mt5_user || inv.tag_market.mt5_pass) ? (
                          <div className="space-y-1 bg-indigo-50/50 dark:bg-indigo-950/10 p-2.5 rounded-lg border border-indigo-100/50 dark:border-indigo-950/30 max-w-xs">
                            <div className="text-xs">
                              <span className="font-medium text-slate-400">رقم الحساب:</span>{" "}
                              <span className="font-mono text-indigo-700 dark:text-indigo-400 font-bold">{inv.tag_market.mt5_user || "—"}</span>
                            </div>
                            <div className="text-xs flex items-center gap-1">
                              <span className="font-medium text-slate-400">كلمة مرور MT5:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">
                                {showMt5PassId === inv.tag_market?.id ? inv.tag_market?.mt5_pass : "••••••••"}
                              </span>
                              <button 
                                type="button"
                                onClick={() => setShowMt5PassId(showMt5PassId === inv.tag_market?.id ? null : inv.tag_market?.id || null)}
                                className="text-slate-400 hover:text-slate-600 ml-1"
                              >
                                {showMt5PassId === inv.tag_market?.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">لا يوجد بيانات MT5</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {inv.ai_tech ? (
                            <>
                              <Button 
                                variant={inv.tag_market ? "outline" : "default"} 
                                size="sm"
                                onClick={() => {
                                  setSelectedInvestor(inv);
                                  setActionError(null);
                                  setSaveOpen(true);
                                }}
                                className="flex items-center gap-1"
                              >
                                {inv.tag_market ? <Edit2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                <span>{inv.tag_market ? "تعديل" : "إضافة حساب"}</span>
                              </Button>
                              {inv.tag_market && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvestor(inv);
                                    setActionError(null);
                                    setDeleteOpen(true);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>حذف</span>
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">يتطلب حساب AI Tech أولاً</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* مودال إضافة وتحديث حساب Tag Market والـ MT5 */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إدارة حساب Tag Market و MT5 للمستثمر</DialogTitle>
            <DialogDescription>
              تعبئة وتحديث تفاصيل حساب Tag Market وحساب التداول MT5 للمستثمر: <strong>"{selectedInvestor?.full_name}"</strong>
            </DialogDescription>
          </DialogHeader>
          {selectedInvestor && (
            <form onSubmit={handleSaveSubmit}>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                {actionError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
                    {actionError}
                  </div>
                )}

                {/* تفاصيل حساب Tag Market */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">1. بيانات حساب Tag Market</h3>
                  
                  <div className="space-y-1">
                    <Label htmlFor="tagSysId">معرف الحساب في النظام (Sys ID)</Label>
                    <Input 
                      id="tagSysId" 
                      name="tagSysId" 
                      defaultValue={selectedInvestor.tag_market?.sys_id || ""} 
                      required 
                      placeholder="مثال: TAG_300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="tagEmail">البريد الإلكتروني للمنصة</Label>
                      <Input 
                        id="tagEmail" 
                        name="tagEmail" 
                        type="email" 
                        defaultValue={selectedInvestor.tag_market?.email || ""} 
                        required 
                        placeholder="email@tagmarket.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="tagPassword">كلمة المرور للمنصة</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="tagPassword" 
                          name="tagPassword" 
                          type="text" 
                          defaultValue={selectedInvestor.tag_market?.password || ""} 
                          required 
                          placeholder="أدخل كلمة المرور" 
                          className="pr-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="registrationLink">رابط التسجيل الخاص بالمستثمر</Label>
                    <div className="relative">
                      <LinkIcon className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="registrationLink" 
                        name="registrationLink" 
                        type="url"
                        defaultValue={selectedInvestor.tag_market?.registration_link || ""} 
                        placeholder="https://tagmarket.com/register?ref=..."
                        className="pr-10"
                      />
                    </div>
                  </div>
                </div>

                {/* تفاصيل حساب MT5 للتداول */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">2. بيانات حساب التداول MT5</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="mt5User">رقم حساب MT5</Label>
                      <Input 
                        id="mt5User" 
                        name="mt5User" 
                        defaultValue={selectedInvestor.tag_market?.mt5_user || ""} 
                        placeholder="مثال: 508823"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mt5Pass">كلمة مرور MT5</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="mt5Pass" 
                          name="mt5Pass" 
                          type="text" 
                          defaultValue={selectedInvestor.tag_market?.mt5_pass || ""} 
                          placeholder="كلمة مرور حساب التداول" 
                          className="pr-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6 flex-row-reverse sm:justify-start gap-2">
                <Button type="submit" disabled={isPending} className="flex-1 sm:flex-initial">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  <span>حفظ البيانات</span>
                </Button>
                <Button type="button" variant="outline" onClick={() => setSaveOpen(false)} className="flex-1 sm:flex-initial">
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* مودال تأكيد حذف حساب Tag Market فقط */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">تأكيد حذف حساب المنصة الثانية</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف حساب Tag Market والـ MT5 الخاص بالمستثمر <strong>"{selectedInvestor?.full_name}"</strong>؟
              (ملاحظة: هذا الإجراء لن يحذف بروفايل المستثمر ولا حسابه في AI Tech، فقط سيحذف حسابه في Tag Market).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row-reverse sm:justify-start gap-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteConfirm} 
              disabled={isPending}
              className="flex-1 sm:flex-initial"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              <span>حذف الحساب فقط</span>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteOpen(false)}
              className="flex-1 sm:flex-initial"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
