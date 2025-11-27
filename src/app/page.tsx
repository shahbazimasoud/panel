import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import SystemGrid from '@/components/SystemGrid';
import UserDirectory from '@/components/UserDirectory';
import PageHeader from '@/components/PageHeader';
import GuideGrid from '@/components/GuideGrid';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar side="left" collapsible="icon" className="border-r">
          <UserDirectory />
        </Sidebar>
        <SidebarInset>
          <PageHeader />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Header />
            <SystemGrid />
            <Separator className="my-8 md:my-12" />
            <GuideGrid />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
