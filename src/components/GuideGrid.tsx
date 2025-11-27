import { guides } from '@/lib/data';
import GuideCard from './GuideCard';

export default function GuideGrid() {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold font-headline">Organizational Guides</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </section>
  );
}
