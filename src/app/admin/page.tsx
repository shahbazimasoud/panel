import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Welcome to the OrgConnect Admin Panel.</p>
          <p>
            Here you can manage systems, users, and site settings.
            This section is under development.
          </p>
          <Link href="/" className="text-primary hover:underline">
             Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
