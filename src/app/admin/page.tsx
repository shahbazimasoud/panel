import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>پنل ادمین</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>به پنل مدیریت OrgConnect خوش آمدید.</p>
          <p>
            در این بخش می‌توانید سامانه‌ها، کاربران و تنظیمات سایت را مدیریت کنید.
            این بخش در حال توسعه است.
          </p>
          <Link href="/" className="text-primary hover:underline">
             بازگشت به صفحه اصلی
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
