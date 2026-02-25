import React from 'react';
import { Region } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Menu, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  region: Region;
  switchRegion: (r: Region) => void;
  toggleSidebar: () => void;
  totalImpact: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ region, switchRegion, toggleSidebar, totalImpact }) => {
  const regions: Region[] = ['US', 'UK', 'Global'];

  return (
    <header className="bg-card border-b border-border px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-serif font-bold text-base">
            Ox
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">OxNNet Economics</h1>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
              {region === 'US' ? 'US Market' : region === 'UK' ? 'UK NHS' : 'Global'} Impact Analysis
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Region selector */}
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => switchRegion(r)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                region === r
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Total impact badge */}
        <div className="hidden md:block text-right">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Impact</p>
          <p className="text-xl font-bold text-emerald-600 leading-none">{totalImpact}</p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Print
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
