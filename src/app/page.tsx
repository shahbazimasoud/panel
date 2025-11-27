import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import SystemGrid from '@/components/SystemGrid';
import UserDirectory from '@/components/UserDirectory';
import PageHeader from '@/components/PageHeader';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar side="left" collapsible="icon" className="border-r">
          <UserDirectory />
        </Sidebar>
        <SidebarInset className="bg-background">
          <PageHeader />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Header />
            <SystemGrid />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
