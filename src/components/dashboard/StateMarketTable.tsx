import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { STATE_MARKET_DATA, StateMarketData } from '@/lib/stateMarketData';
import { cn } from '@/lib/utils';
import { Search, ArrowUpDown } from 'lucide-react';

type SortKey = 'state' | 'totalBirths' | 'estPctControlled' | 'top3PctCombined';
type SortDir = 'asc' | 'desc';

const StateMarketTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalBirths');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'state' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let data = STATE_MARKET_DATA;
    if (q) {
      data = data.filter(
        (s) =>
          s.state.toLowerCase().includes(q) ||
          s.abbr.toLowerCase().includes(q) ||
          s.largestSystem.toLowerCase().includes(q),
      );
    }
    return [...data].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'state') return mul * a.state.localeCompare(b.state);
      return mul * ((a[sortKey] as number) - (b[sortKey] as number));
    });
  }, [search, sortKey, sortDir]);

  const totalBirths = STATE_MARKET_DATA.reduce((s, d) => s + d.totalBirths, 0);
  const idnCount = STATE_MARKET_DATA.filter((d) => d.systemType === 'idn').length;
  const ippCount = STATE_MARKET_DATA.filter((d) => d.systemType === 'ipp').length;

  const SortHeader: React.FC<{ label: string; field: SortKey; className?: string }> = ({
    label,
    field,
    className,
  }) => (
    <TableHead
      className={cn(
        'text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors',
        className,
      )}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn(
            'h-3 w-3',
            sortKey === field ? 'text-primary' : 'text-muted-foreground/40',
          )}
        />
      </span>
    </TableHead>
  );

  const pctBar = (value: number, max: number, color: string) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums w-12 text-right">
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold">
              50-State Obstetric Market Share Matrix
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {totalBirths.toLocaleString()} total births · {idnCount} IDN-led
              states · {ippCount} IPP-led states
            </CardDescription>
          </div>
          <div className="relative w-48 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search state or system…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
              <TableRow>
                <SortHeader label="State" field="state" />
                <SortHeader label="Total Births" field="totalBirths" className="text-right" />
                <TableHead className="text-xs font-bold uppercase tracking-wider">
                  Largest System
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center w-16">
                  Type
                </TableHead>
                <SortHeader label="% Controlled" field="estPctControlled" />
                <SortHeader label="Top 3 Combined" field="top3PctCombined" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.abbr} className="group">
                  <TableCell className="font-medium text-sm">
                    {row.state}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {row.totalBirths.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{row.largestSystem}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        'inline-block text-[10px] font-bold px-1.5 py-0.5 rounded',
                        row.systemType === 'idn'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-amber-500/10 text-amber-700',
                      )}
                    >
                      {row.systemType.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    {pctBar(row.estPctControlled, 0.65, 'bg-primary')}
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    {pctBar(row.top3PctCombined, 0.92, 'bg-emerald-500')}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    No states match "{search}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StateMarketTable;
