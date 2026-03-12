import React, { useState } from 'react';
import { Region } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Menu, Printer, Save, FolderOpen, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SavedConfigMeta {
  id: string;
  name: string;
  timestamp: number;
}

interface DashboardHeaderProps {
  region: Region;
  switchRegion: (r: Region) => void;
  toggleSidebar: () => void;
  totalImpact: string;
  onSave: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  getSavedConfigs: () => SavedConfigMeta[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ region, switchRegion, toggleSidebar, totalImpact, onSave, onLoad, onDelete, getSavedConfigs }) => {
  const regions: Region[] = ['US', 'UK', 'Global'];
  const [loadOpen, setLoadOpen] = useState(false);

  const configs = loadOpen ? getSavedConfigs() : [];

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

      <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onSave} className="hidden sm:flex">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save
          </Button>
          <Popover open={loadOpen} onOpenChange={setLoadOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
                Load
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-bold text-foreground">Saved Configurations</p>
                <p className="text-[10px] text-muted-foreground">Select a version to restore</p>
              </div>
              {configs.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">No saved configurations yet.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Click "Save" to store your current setup.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="divide-y divide-border">
                    {[...configs].reverse().map((cfg) => (
                      <div key={cfg.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/40 transition-colors group">
                        <button
                          className="flex-1 text-left"
                          onClick={() => { onLoad(cfg.id); setLoadOpen(false); }}
                        >
                          <p className="text-xs font-medium text-foreground">{cfg.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTime(cfg.timestamp)}
                          </p>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(cfg.id); }}
                          className="text-destructive/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex print:hidden">
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;