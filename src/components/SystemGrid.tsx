import { systems } from '@/lib/data';
import SystemCard from './SystemCard';

export default function SystemGrid() {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold font-headline">سامانه‌های سازمانی</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {systems.map((system) => (
          <SystemCard key={system.id} system={system} />
        ))}
      </div>
    </section>
  );
}
