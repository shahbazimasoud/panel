import { Puzzle } from 'lucide-react';

export default function Header() {
  return (
    <header className="mb-8 md:mb-12">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Puzzle className="h-7 w-7" />
        </div>
        <h1 className="font-headline text-4xl font-bold text-foreground">
          OrgConnect
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        The comprehensive portal for your organizational systems. Quick and easy access to all your tools.
      </p>
    </header>
  );
}
