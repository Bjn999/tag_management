import { checkAuthAndProfile } from "@/lib/auth-check";
import { redirect } from "next/navigation";

export default async function Home() {
  // للتحقق من المصادقة وتوجيهه تلقائياً
  await checkAuthAndProfile();
  
  redirect("/dashboard");
}

