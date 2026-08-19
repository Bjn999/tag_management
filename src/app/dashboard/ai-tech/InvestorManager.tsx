"use client";

import React, { useState, useTransition } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  Phone,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { addInvestorWithAiTech, editInvestorWithAiTech, deleteInvestor } from "./actions";

interface Investor {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  ai_tech: {
    id: string;
    sys_id: string;
    email: string;
    password: string;
  } | null;
}

interface InvestorManagerProps {
  initialInvestors: any[];
}

export default function InvestorManager({ initialInvestors }: InvestorManagerProps) {
  const [search, setSearch] = useState("");
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
  
  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Selected items state
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  
  // Form states
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await addInvestorWithAiTech(null, formData);
      if (res?.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(res?.success || "تم الحفظ");
        setAddOpen(false);
        // إعادة تعيين النجاح بعد فترة
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    if (selectedInvestor) {
      formData.append("profileId", selectedInvestor.id);
    }
    
    startTransition(async () => {
      const res = await editInvestorWithAiTech(null, formData);
      if (res?.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(res?.success || "تم التحديث");
        setEditOpen(false);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvestor) return;
    setActionError(null);
    
    startTransition(async () => {
      const res = await deleteInvestor(selectedInvestor.id);
      if (res?.error) {
        setActionError(res.error);
      } else {
        setDeleteOpen(false);
        setActionSuccess("تم حذف المستثمر وحساباته بنجاح");
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
  };

  // تصفية المستثمرين بالبحث
  const filteredInvestors = (initialInvestors as Investor[]).filter(
    (inv) =>
      inv.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات والبحث */}
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
        <Button onClick={() => { setActionError(null); setAddOpen(true); }} className="w-full md:w-auto flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة مستثمر جديد</span>
        </Button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium">
          {actionSuccess}
        </div>
      )}

      {/* جدول عرض المستثمرين */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-0">
          {filteredInvestors.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              لا يوجد مستثمرون يطابقون بحثك.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">الاسم الكامل</th>
                    <th scope="col" className="px-6 py-4">بيانات التواصل</th>
                    <th scope="col" className="px-6 py-4">حساب AI Tech</th>
                    <th scope="col" className="px-6 py-4 text-center">الخيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestors.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">معرف البروفايل: {inv.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{inv.email}</span>
                        </div>
                        {inv.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{inv.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inv.ai_tech ? (
                          <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 max-w-xs">
                            <div className="text-xs">
                              <span className="font-medium text-slate-400">معرف النظام:</span>{" "}
                              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{inv.ai_tech.sys_id}</span>
                            </div>
                            <div className="text-xs">
                              <span className="font-medium text-slate-400">الايميل:</span>{" "}
                              <span className="text-slate-700 dark:text-slate-300">{inv.ai_tech.email}</span>
                            </div>
                            <div className="text-xs flex items-center gap-1">
                              <span className="font-medium text-slate-400">كلمة المرور:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">
                                {showPasswordId === inv.ai_tech?.id ? inv.ai_tech?.password : "••••••••"}
                              </span>
                              <button 
                                type="button"
                                onClick={() => setShowPasswordId(showPasswordId === inv.ai_tech?.id ? null : inv.ai_tech?.id || null)}
                                className="text-slate-400 hover:text-slate-600 ml-1"
                              >
                                {showPasswordId === inv.ai_tech?.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400">
                            لا يوجد حساب AI Tech
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedInvestor(inv);
                              setActionError(null);
                              setEditOpen(true);
                            }}
                            className="flex items-center gap-1 text-slate-600 dark:text-slate-300"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>تعديل</span>
                          </Button>
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

      {/* مودال إضافة مستثمر جديد */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة مستثمر جديد وتفعيل AI Tech</DialogTitle>
            <DialogDescription>
              أدخل البيانات الشخصية للمستثمر وتفاصيل حسابه لمنصة AI Tech الأولى
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              {actionError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
                  {actionError}
                </div>
              )}
              
              {/* قسم البروفايل */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">1. بيانات البروفايل (الأساسية)</h3>
                
                <div className="space-y-1">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="fullName" name="fullName" required placeholder="مثال: صالح محمد" className="pr-10" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="email">البريد الإلكتروني للاتصال</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="email" name="email" type="email" required placeholder="name@email.com" className="pr-10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="phone" name="phone" placeholder="+9665..." className="pr-10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* قسم AI Tech */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">2. بيانات حساب AI Tech</h3>
                
                <div className="space-y-1">
                  <Label htmlFor="aiSysId">معرف الحساب في النظام (Sys ID)</Label>
                  <Input id="aiSysId" name="aiSysId" required placeholder="مثال: AIT_9088" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="aiEmail">البريد الإلكتروني للمنصة</Label>
                    <Input id="aiEmail" name="aiEmail" type="email" required placeholder="email@aitech.com" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="aiPassword">كلمة المرور للمنصة</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="aiPassword" name="aiPassword" type="text" required placeholder="أدخل الباسورد" className="pr-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex-row-reverse sm:justify-start gap-2">
              <Button type="submit" disabled={isPending} className="flex-1 sm:flex-initial">
                {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                <span>إنشاء وتفعيل الحساب</span>
              </Button>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1 sm:flex-initial">
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* مودال تعديل بيانات المستثمر وحسابه */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستثمر وحساب AI Tech</DialogTitle>
            <DialogDescription>
              تحديث بيانات الاتصال ومعلومات الدخول الخاصة بمنصة AI Tech
            </DialogDescription>
          </DialogHeader>
          {selectedInvestor && (
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                {actionError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
                    {actionError}
                  </div>
                )}
                
                {/* قسم البروفايل */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">1. البيانات الأساسية</h3>
                  
                  <div className="space-y-1">
                    <Label htmlFor="edit_fullName">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="edit_fullName" 
                        name="fullName" 
                        defaultValue={selectedInvestor.full_name} 
                        required 
                        className="pr-10" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="edit_email">البريد الإلكتروني للاتصال</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="edit_email" 
                          name="email" 
                          type="email" 
                          defaultValue={selectedInvestor.email} 
                          required 
                          className="pr-10" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit_phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="edit_phone" 
                          name="phone" 
                          defaultValue={selectedInvestor.phone || ""} 
                          className="pr-10" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* قسم AI Tech */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">2. بيانات حساب AI Tech</h3>
                  
                  <div className="space-y-1">
                    <Label htmlFor="edit_aiSysId">معرف الحساب في النظام (Sys ID)</Label>
                    <Input 
                      id="edit_aiSysId" 
                      name="aiSysId" 
                      defaultValue={selectedInvestor.ai_tech?.sys_id || ""} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="edit_aiEmail">البريد الإلكتروني للمنصة</Label>
                      <Input 
                        id="edit_aiEmail" 
                        name="aiEmail" 
                        type="email" 
                        defaultValue={selectedInvestor.ai_tech?.email || ""} 
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit_aiPassword">كلمة المرور للمنصة</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="edit_aiPassword" 
                          name="aiPassword" 
                          type="text" 
                          defaultValue={selectedInvestor.ai_tech?.password || ""} 
                          required 
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
                  <span>حفظ التعديلات</span>
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1 sm:flex-initial">
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* مودال تأكيد الحذف */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
              <span>تأكيد حذف المستثمر</span>
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف المستثمر <strong className="text-slate-900 dark:text-white">"{selectedInvestor?.full_name}"</strong>؟
              هذا الإجراء سيقوم بحذف البروفايل، وحساب AI Tech وحساب Tag Market المرتبطين به نهائياً ولا يمكن التراجع عنه.
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
              <span>حذف نهائي</span>
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
