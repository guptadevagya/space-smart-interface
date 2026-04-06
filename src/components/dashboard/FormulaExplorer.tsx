import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Calculator,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  AlertCircle,
  RotateCcw,
  Search,
  Beaker,
  DollarSign,
  Users,
  Activity,
} from 'lucide-react';
import {
  FormulaDefinition,
  CustomVariable,
  SimulationInputs,
} from '@/lib/types';
import { extractVariables, validateFormula } from '@/lib/formulaEngine';
import { INPUT_VARIABLE_LABELS } from '@/lib/defaultFormulas';
import { cn } from '@/lib/utils';

interface FormulaExplorerProps {
  inputs: SimulationInputs;
  formulas: FormulaDefinition[];
  setFormulas: React.Dispatch<React.SetStateAction<FormulaDefinition[]>>;
  customVariables: CustomVariable[];
  setCustomVariables: React.Dispatch<React.SetStateAction<CustomVariable[]>>;
  formulaValues: Record<string, number>;
  formulaErrors: Record<string, string>;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
  onResetFormulas: () => void;
}

function buildLabelMap(
  formulas: FormulaDefinition[],
  customVars: CustomVariable[],
): Record<string, string> {
  const map: Record<string, string> = { ...INPUT_VARIABLE_LABELS };
  formulas.forEach((f) => { map[f.id] = f.name; });
  customVars.forEach((v) => { map[v.id] = v.name; });
  return map;
}

const groupMeta: Record<string, { icon: React.ReactNode; label: string }> = {
  demographics: { icon: <Users className="h-3.5 w-3.5" />, label: 'Demographics' },
  clinical: { icon: <Activity className="h-3.5 w-3.5" />, label: 'Clinical' },
  financial: { icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Financial' },
};

// ── Formula Card ──
const FormulaCard: React.FC<{
  def: FormulaDefinition;
  value: number;
  error?: string;
  allVarIds: string[];
  labelMap: Record<string, string>;
  allValues: Record<string, number>;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
  onUpdate: (id: string, changes: Partial<FormulaDefinition>) => void;
  onDelete?: (id: string) => void;
}> = ({ def, value, error, allVarIds, labelMap, allValues, formatCurrency, formatNumber, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [editFormula, setEditFormula] = useState(def.formula);
  const [editName, setEditName] = useState(def.name);
  const [showVars, setShowVars] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedResult = def.format === 'currency' ? formatCurrency(value) : formatNumber(value);
  const usedVars = extractVariables(def.formula);
  const availableVarSet = new Set(allVarIds);
  const validationError = editing ? validateFormula(editFormula, availableVarSet) : null;

  const handleSave = () => {
    if (!validationError) {
      onUpdate(def.id, { formula: editFormula, name: editName });
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditFormula(def.formula);
    setEditName(def.name);
    setEditing(false);
  };

  const insertVariable = (varId: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart ?? editFormula.length;
      const end = inputRef.current.selectionEnd ?? editFormula.length;
      const newFormula = editFormula.slice(0, start) + varId + editFormula.slice(end);
      setEditFormula(newFormula);
      setTimeout(() => {
        inputRef.current?.focus();
        const pos = start + varId.length;
        inputRef.current?.setSelectionRange(pos, pos);
      }, 0);
    } else {
      setEditFormula((prev) => prev + varId);
    }
  };

  return (
    <div className={cn(
      'rounded-lg border bg-card transition-all',
      error ? 'border-destructive/40 bg-destructive/5' : 'border-border/60 hover:border-border',
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-sm font-medium text-foreground truncate">{def.name}</span>
          {error && <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
          {def.isCustom && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">Custom</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-semibold font-mono',
            error ? 'text-destructive' : 'text-foreground',
          )}>
            {error ? 'Error' : formattedResult}
            {def.unit && !error ? ` ${def.unit}` : ''}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => { setEditing(!editing); setShowVars(false); }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {onDelete && def.isCustom && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(def.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {editing ? (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Formula name"
            className="text-sm h-9"
          />
          <div>
            <Input
              ref={inputRef}
              value={editFormula}
              onChange={(e) => setEditFormula(e.target.value)}
              placeholder="e.g. annualBirths * fgrPrevalence"
              className="font-mono text-sm h-9"
              onFocus={() => setShowVars(true)}
            />
            {validationError && (
              <p className="text-xs text-destructive mt-1.5">{validationError}</p>
            )}
          </div>
          {showVars && (
            <div className="bg-muted/40 rounded-lg p-3 max-h-36 overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Insert variable</p>
              <div className="flex flex-wrap gap-1.5">
                {allVarIds.map((vid) => (
                  <button
                    key={vid}
                    type="button"
                    onClick={() => insertVariable(vid)}
                    className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs font-mono hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer gap-1"
                  >
                    {vid}
                    {labelMap[vid] && <span className="text-muted-foreground text-xs font-sans">({labelMap[vid]})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={!!validationError} className="h-8 text-xs">
              <Check className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* Read-only formula + dependency badges */
        <div className="px-4 pb-3 space-y-2">
          <div className="bg-muted/30 rounded-md px-3 py-2 font-mono text-xs text-muted-foreground">
            {def.formula}
          </div>
          {usedVars.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {usedVars.map((vid) => (
                <span key={vid} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-0.5">
                  <span className="font-mono">{labelMap[vid] || vid}</span>
                  <span className="text-muted-foreground/60">=</span>
                  <span className="font-mono">
                    {allValues[vid] !== undefined ? formatNumber(allValues[vid]) : '?'}
                  </span>
                </span>
              ))}
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
};

// ── Add Formula Form ──
const AddFormulaForm: React.FC<{
  group: FormulaDefinition['group'];
  allVarIds: string[];
  labelMap: Record<string, string>;
  onAdd: (formula: FormulaDefinition) => void;
  onCancel: () => void;
}> = ({ group, allVarIds, labelMap, onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [formula, setFormula] = useState('');
  const [format, setFormat] = useState<'number' | 'currency'>('number');
  const inputRef = useRef<HTMLInputElement>(null);

  const availableVarSet = new Set(allVarIds);
  const error = formula ? validateFormula(formula, availableVarSet) : null;

  const handleSubmit = () => {
    if (!name || !id || !formula || error) return;
    onAdd({ id, name, formula, group, format, isCustom: true });
    setName(''); setId(''); setFormula('');
  };

  const insertVar = (vid: string) => {
    setFormula((prev) => prev + vid);
    inputRef.current?.focus();
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">New formula</p>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="text-sm h-9" />
          <Input value={id} onChange={(e) => setId(e.target.value.replace(/\s/g, ''))} placeholder="Variable ID (camelCase)" className="text-sm h-9 font-mono" />
        </div>
        <Input ref={inputRef} value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="Formula expression" className="text-sm h-9 font-mono" />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
          {allVarIds.slice(0, 20).map((vid) => (
            <button key={vid} type="button" onClick={() => insertVar(vid)}
              className="inline-flex rounded-md border border-border px-2 py-0.5 text-xs font-mono hover:bg-accent transition-colors cursor-pointer">
              {vid}
            </button>
          ))}
          {allVarIds.length > 20 && <span className="text-xs text-muted-foreground self-center">+{allVarIds.length - 20} more</span>}
        </div>
        <div className="flex gap-2 items-center">
          <select value={format} onChange={(e) => setFormat(e.target.value as 'number' | 'currency')}
            className="text-sm h-9 border rounded-md px-3 bg-background text-foreground">
            <option value="number">Number</option>
            <option value="currency">Currency</option>
          </select>
          <Button size="sm" className="h-9" onClick={handleSubmit} disabled={!name || !id || !formula || !!error}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add formula
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Add Variable Form ──
const AddVariableForm: React.FC<{
  onAdd: (v: CustomVariable) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [value, setValue] = useState('0');
  const [format, setFormat] = useState<'number' | 'percent' | 'currency'>('number');

  const handleSubmit = () => {
    if (!name || !id) return;
    onAdd({ id, name, value: parseFloat(value) || 0, format });
    setName(''); setId(''); setValue('0');
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">New variable</p>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="text-sm h-9" />
          <Input value={id} onChange={(e) => setId(e.target.value.replace(/\s/g, ''))} placeholder="Variable ID (camelCase)" className="text-sm h-9 font-mono" />
        </div>
        <div className="flex gap-2">
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="text-sm h-9 flex-1" />
          <select value={format} onChange={(e) => setFormat(e.target.value as any)}
            className="text-sm h-9 border rounded-md px-3 bg-background text-foreground">
            <option value="number">Number</option>
            <option value="percent">Percent (0–1)</option>
            <option value="currency">Currency</option>
          </select>
          <Button size="sm" className="h-9" onClick={handleSubmit} disabled={!name || !id}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Main Component ──
const FormulaExplorer: React.FC<FormulaExplorerProps> = ({
  inputs,
  formulas,
  setFormulas,
  customVariables,
  setCustomVariables,
  formulaValues,
  formulaErrors,
  formatCurrency,
  formatNumber,
  onResetFormulas,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddVar, setShowAddVar] = useState(false);
  const [showAddFormula, setShowAddFormula] = useState<FormulaDefinition['group'] | null>(null);
  const [activeTab, setActiveTab] = useState('demographics');

  const labelMap = useMemo(() => buildLabelMap(formulas, customVariables), [formulas, customVariables]);

  const allVarIds = useMemo(() => {
    const inputVarIds = Object.keys(INPUT_VARIABLE_LABELS);
    const customVarIds = customVariables.map((v) => v.id);
    const formulaIds = formulas.map((f) => f.id);
    return [...inputVarIds, ...customVarIds, ...formulaIds];
  }, [formulas, customVariables]);

  const handleUpdateFormula = (id: string, changes: Partial<FormulaDefinition>) => {
    setFormulas((prev) => prev.map((f) => (f.id === id ? { ...f, ...changes } : f)));
  };
  const handleDeleteFormula = (id: string) => { setFormulas((prev) => prev.filter((f) => f.id !== id)); };
  const handleAddFormula = (formula: FormulaDefinition) => { setFormulas((prev) => [...prev, formula]); setShowAddFormula(null); };
  const handleAddVariable = (v: CustomVariable) => { setCustomVariables((prev) => [...prev, v]); setShowAddVar(false); };
  const handleDeleteVariable = (id: string) => { setCustomVariables((prev) => prev.filter((v) => v.id !== id)); };

  const groups: FormulaDefinition['group'][] = ['demographics', 'clinical', 'financial'];

  const errorCount = Object.keys(formulaErrors).length;

  const filteredFormulas = (group: FormulaDefinition['group']) => {
    const gf = formulas.filter((f) => f.group === group);
    if (!search) return gf;
    const q = search.toLowerCase();
    return gf.filter((f) => f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.formula.toLowerCase().includes(q));
  };

  const printFormulaRows = formulas.map((f) => ({
    name: f.name, group: f.group, formula: f.formula,
    value: formulaValues[f.id] ?? 0, format: f.format,
  }));

  return (
    <>
      {/* Interactive version */}
      <div className="print:hidden">
        <Collapsible open={open} onOpenChange={setOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calculator className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold">Model Formulas</CardTitle>
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                      {formulas.length}
                    </Badge>
                    {errorCount > 0 && (
                      <Badge variant="destructive" className="text-xs px-2 py-0 h-5">
                        {errorCount} error{errorCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
                </div>
                {!open && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Edit calculation logic, add custom variables and formulas
                  </p>
                )}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search formulas..."
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => { setShowAddVar(!showAddVar); setShowAddFormula(null); }}>
                    <Beaker className="h-3.5 w-3.5 mr-1.5" /> Variable
                  </Button>
                  <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => { setShowAddFormula(showAddFormula ? null : activeTab as FormulaDefinition['group']); setShowAddVar(false); }}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Formula
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 text-xs text-muted-foreground" onClick={onResetFormulas}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
                  </Button>
                </div>

                {/* Add forms */}
                {showAddVar && <AddVariableForm onAdd={handleAddVariable} onCancel={() => setShowAddVar(false)} />}
                {showAddFormula && (
                  <AddFormulaForm
                    group={showAddFormula}
                    allVarIds={allVarIds}
                    labelMap={labelMap}
                    onAdd={handleAddFormula}
                    onCancel={() => setShowAddFormula(null)}
                  />
                )}

                {/* Custom Variables */}
                {customVariables.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Custom variables</p>
                    <div className="flex flex-wrap gap-1.5">
                      {customVariables.map((v) => (
                        <Badge key={v.id} variant="secondary" className="text-xs gap-1.5 pr-1 h-7">
                          <span className="font-mono">{v.id}</span>
                          <span className="text-muted-foreground">= {v.value}</span>
                          <button onClick={() => handleDeleteVariable(v.id)} className="ml-0.5 hover:text-destructive transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabbed Formula Groups */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-3 h-10">
                    {groups.map((g) => {
                      const meta = groupMeta[g];
                      const count = filteredFormulas(g).length;
                      return (
                        <TabsTrigger key={g} value={g} className="text-xs font-medium gap-1.5">
                          {meta.icon}
                          {meta.label}
                          <span className="text-muted-foreground">({count})</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  {groups.map((g) => {
                    const gf = filteredFormulas(g);
                    return (
                      <TabsContent key={g} value={g} className="mt-3 space-y-2">
                        {gf.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                              {search ? 'No formulas match your search' : 'No formulas in this group'}
                            </p>
                          </div>
                        ) : (
                          gf.map((def) => (
                            <FormulaCard
                              key={def.id}
                              def={def}
                              value={formulaValues[def.id] ?? 0}
                              error={formulaErrors[def.id]}
                              allVarIds={allVarIds}
                              labelMap={labelMap}
                              allValues={formulaValues}
                              formatCurrency={formatCurrency}
                              formatNumber={formatNumber}
                              onUpdate={handleUpdateFormula}
                              onDelete={handleDeleteFormula}
                            />
                          ))
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Print-only version */}
      <div className="hidden print:block">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Model Formulas</h2>
        {groups.map((g) => {
          const gf = printFormulaRows.filter((f) => f.group === g);
          if (gf.length === 0) return null;
          return (
            <div key={g} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{groupMeta[g].label}</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {gf.map((f, i) => (
                      <div key={i} className="px-4 py-2 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-medium text-foreground">{f.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{f.formula}</p>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {f.format === 'currency' ? formatCurrency(f.value) : formatNumber(f.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FormulaExplorer;
