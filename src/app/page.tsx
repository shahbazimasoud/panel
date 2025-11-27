import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import SystemGrid from '@/components/SystemGrid';
import UserDirectory from '@/components/UserDirectory';
import PageHeader from '@/components/PageHeader';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarInset className="bg-background">
          <PageHeader />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Header />
            <SystemGrid />
          </main>
        </SidebarInset>
        <Sidebar side="right" collapsible="icon" className="border-l">
          <UserDirectory />
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}
