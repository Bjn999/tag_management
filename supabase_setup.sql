-- 1. إنشاء جدول البروفايلات (Profiles)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE, -- للمشرفين والمسجلين فعلياً في النظام
    full_name TEXT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('مشرف', 'مستثمر')) DEFAULT 'مستثمر',
    supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. إنشاء جدول حسابات AI Tech
CREATE TABLE public.ai_tech (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    sys_id TEXT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. إنشاء جدول حسابات Tag Market
CREATE TABLE public.tag_market (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    sys_id TEXT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NULL,
    mt5_user TEXT NULL,
    mt5_pass TEXT NULL,
    registration_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- تفعيل ميزة الحماية على مستوى الصفوف (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tech ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_market ENABLE ROW LEVEL SECURITY;

-- دالة للتحقق مما إذا كان المستخدم الحالي مشرفاً (تنفذ بصلاحيات مدير قاعدة البيانات لتجنب الدوران اللانهائي RLS Recursion)
CREATE OR REPLACE FUNCTION public.check_is_supervisor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE auth_id = user_id AND role = 'مشرف'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للحصول على معرف بروفايل المستخدم الحالي
CREATE OR REPLACE FUNCTION public.get_current_profile_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.profiles 
        WHERE auth_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. سياسات الأمان لـ profiles:
-- سياسة 1: السماح لكل مستخدم بقراءة ملفه الخاص فوراً (سريعة وبدون استدعاء للدالة)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = auth_id);

-- سياسة 2: السماح للمشرفين بقراءة باقي الملفات
CREATE POLICY "Supervisors can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.check_is_supervisor(auth.uid()));

-- سياسة 3: التعديل والإضافة والحذف للمشرفين فقط
CREATE POLICY "Supervisors full management" 
ON public.profiles FOR ALL 
USING (public.check_is_supervisor(auth.uid()))
WITH CHECK (public.check_is_supervisor(auth.uid()));

-- 2. سياسات الأمان لـ ai_tech و tag_market:
--- 1. القراءة: للمستثمر لقراءة حسابه، وللمشرف لقراءة كل الحسابات
CREATE POLICY "Allow read AI Tech accounts" 
ON public.ai_tech FOR SELECT 
USING (
    profile_id = public.get_current_profile_id(auth.uid()) OR 
    public.check_is_supervisor(auth.uid())
);

--- 2. ب) الإدارة الكاملة (إضافة/تعديل/حذف): للمشرفين فقط
CREATE POLICY "Allow supervisors to manage AI Tech accounts" 
ON public.ai_tech FOR ALL 
USING (public.check_is_supervisor(auth.uid()))
WITH CHECK (public.check_is_supervisor(auth.uid()));

--- 3. أ) القراءة: للمستثمر لقراءة حسابه، وللمشرف لقراءة كل الحسابات
CREATE POLICY "Allow read Tag Market accounts" 
ON public.tag_market FOR SELECT 
USING (
    profile_id = public.get_current_profile_id(auth.uid()) OR 
    public.check_is_supervisor(auth.uid())
);

-- ب) الإدارة الكاملة (إضافة/تعديل/حذف): للمشرفين فقط
CREATE POLICY "Allow supervisors to manage Tag Market accounts" 
ON public.tag_market FOR ALL 
USING (public.check_is_supervisor(auth.uid()))
WITH CHECK (public.check_is_supervisor(auth.uid()));


-- 4. محفز (Trigger) لإنشاء بروفايل تلقائياً عند تسجيل حساب جديد في Supabase Auth (خاص بالمشرفين الجدد)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (auth_id, email, role, full_name)
    VALUES (new.id, new.email, 'مشرف', '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-------------------------------------------------------
-- 1. إنشاء دالة واحدة لإضافة الحسابات الفرعية للمشرف
CREATE OR REPLACE FUNCTION public.handle_new_supervisor_accounts()
RETURNS TRIGGER 
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    -- إنشاء حساب في جدول ai_tech
    INSERT INTO public.ai_tech (profile_id, email)
    VALUES (NEW.id, NEW.email);

    -- إنشاء حساب في جدول tag_market
    INSERT INTO public.tag_market (profile_id, email)
    VALUES (NEW.id, NEW.email);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. إنشاء الـ Trigger بشرط WHEN الصحيح
DROP TRIGGER IF EXISTS on_supervisor_profile_created ON public.profiles;

CREATE TRIGGER on_supervisor_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    WHEN (NEW.role = 'مشرف') -- الاستخدام الصحيح للشرط بدلاً من WHERE
    EXECUTE FUNCTION public.handle_new_supervisor_accounts();

