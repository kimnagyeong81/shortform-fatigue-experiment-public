import { Search, Cast } from 'lucide-react';

export default function ShortsHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">▶</span>
        </div>
        <span className="text-foreground font-bold text-lg tracking-tight">Shorts</span>
      </div>
      <div className="flex items-center gap-4">
        <Search className="w-5 h-5 text-foreground/80" />
        <Cast className="w-5 h-5 text-foreground/80" />
      </div>
    </header>
  );
}
