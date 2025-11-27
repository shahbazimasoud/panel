import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import SystemGrid from '@/components/SystemGrid';
import PageHeader from '@/components/PageHeader';
import GuideGrid from '@/components/GuideGrid';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <MainLayout>
      <PageHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Header />
        <SystemGrid />
        <Separator className="my-8 md:my-12" />
        <GuideGrid />
      </main>
    </MainLayout>
  );
}
