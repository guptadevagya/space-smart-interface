import React, { useState } from 'react';
import { Region, USProviderView } from '@/lib/types';
import { Button } from '@/components/ui/button';
import oxnnetLogo from '@/assets/oxnnet-logo.png';
import { Menu, Printer, Save, FolderOpen, Trash2, Clock, RotateCcw, MessageSquare, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getProviderById, US_TOTAL_BIRTHS } from '@/lib/providerProfiles';

interface SavedConfigMeta {
  id: string;
  name: string;
  timestamp: number;
  comment?: string;
  region?: Region;
}

interface DashboardHeaderProps {
  region: Region;
  switchRegion: (r: Region) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  totalImpact: string;
  onSave: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onResetDefaults: () => void;
  getSavedConfigs: () => SavedConfigMeta[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  region,
  switchRegion,
  toggleSidebar,
  isSidebarOpen,
  totalImpact,
  onSave,
  onLoad,
  onDelete,
  onResetDefaults,
  getSavedConfigs,
}) => {
  const regions: Region[] = ['UK', 'US', 'Global'];
  const [loadOpen, setLoadOpen] = useState(false);

  const configs = loadOpen ? getSavedConfigs() : [];

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return (
      d.toLocaleDateString() +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <header className="bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm h-[57px]">
      <div className="flex items-center gap-3 shrink-0">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleSidebar}
            title="Open sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2.5">
          <img src={oxnnetLogo} alt="OxNNet" className="h-8 w-8 object-contain" />
          <h1 className="text-sm font-bold text-foreground leading-tight">
            OxNNet Economics
          </h1>
        </div>
      </div>

      {/* Region selector */}
      <div className="flex items-center bg-muted rounded-lg p-0.5">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => switchRegion(r)}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                region === r
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Total impact badge */}
        <div className="hidden md:block text-right">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Total Impact
          </p>
          <p className="text-xl font-bold text-emerald-600 leading-none">
            {totalImpact}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="hidden sm:flex text-xs px-2.5"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Popover open={loadOpen} onOpenChange={setLoadOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex text-xs px-2.5">
                <FolderOpen className="h-3 w-3 mr-1" />
                Load
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-bold text-foreground">
                  Saved Configurations
                </p>
                <p className="text-xs text-muted-foreground">
                  Select a configuration to restore
                </p>
              </div>
              {configs.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    No saved configurations yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Save" to store your current setup.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-72">
                  <div className="divide-y divide-border">
                    {[...configs].reverse().map((cfg) => (
                      <div
                        key={cfg.id}
                        className="px-4 py-3 hover:bg-muted/40 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => {
                              onLoad(cfg.id);
                              setLoadOpen(false);
                            }}
                            className="text-left flex-1 min-w-0"
                          >
                            <p className="text-sm font-medium text-foreground truncate">
                              {cfg.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(cfg.timestamp)}
                              </span>
                              {cfg.region && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {cfg.region}
                                </Badge>
                              )}
                            </div>
                            {cfg.comment && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{cfg.comment}</span>
                              </p>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(cfg.id);
                            }}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Delete configuration"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetDefaults}
            className="hidden sm:flex text-xs px-2.5"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:flex print:hidden text-xs px-2.5"
          >
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
