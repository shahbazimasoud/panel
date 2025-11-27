import type { Guide } from '@/lib/types';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type LucideIcon = React.FC<React.SVGProps<SVGSVGElement>>;

type GuideCardProps = {
  guide: Guide;
};

export default function GuideCard({ guide }: GuideCardProps) {
  const Icon = (Icons as Record<string, LucideIcon>)[guide.icon] || Icons.HelpCircle;

  return (
    <Link href={guide.url} passHref>
      <Card className="flex h-full flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold">{guide.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">{guide.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
