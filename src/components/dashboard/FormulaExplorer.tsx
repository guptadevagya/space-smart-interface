import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
} from 'lucide-react';
import {
  FormulaDefinition,
  CustomVariable,
  SimulationInputs,
} from '@/lib/types';
import { extractVariables, validateFormula } from '@/lib/formulaEngine';
import { INPUT_VARIABLE_LABELS } from '@/lib/defaultFormulas';

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

// Build a label map from formulas + input labels + custom vars
function buildLabelMap(
  formulas: FormulaDefinition[],
  customVars: CustomVariable[],
): Record<string, string> {
  const map: Record<string, string> = { ...INPUT_VARIABLE_LABELS };
  formulas.forEach((f) => {
    map[f.id] = f.name;
  });
  customVars.forEach((v) => {
    map[v.id] = v.name;
  });
  return map;
}

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
}> = ({
  def,
  value,
  error,
  allVarIds,
  labelMap,
  allValues,
  formatCurrency,
  formatNumber,
  onUpdate,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFormula, setEditFormula] = useState(def.formula);
  const [editName, setEditName] = useState(def.name);
  const [showVars, setShowVars] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedResult =
    def.format === 'currency' ? formatCurrency(value) : formatNumber(value);
  const usedVars = extractVariables(def.formula);

  const availableVarSet = new Set(allVarIds);
  const validationError = editing
    ? validateFormula(editFormula, availableVarSet)
    : null;

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
      const newFormula =
        editFormula.slice(0, start) + varId + editFormula.slice(end);
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
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={`border-border/50 ${error ? 'border-destructive/50' : ''}`}
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              {open ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                {def.name}
              </span>
              {error && (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              )}
              {def.isCustom && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Custom
                </Badge>
              )}
            </div>
            <span
              className={`text-sm font-semibold font-mono ${error ? 'text-destructive' : 'text-primary'}`}
            >
              = {error ? 'Error' : formattedResult}
              {def.unit && !error ? ` ${def.unit}` : ''}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 px-3 space-y-2">
            {editing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Formula name"
                    className="text-sm h-8"
                  />
                </div>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={editFormula}
                    onChange={(e) => setEditFormula(e.target.value)}
                    placeholder="e.g. annualBirths * fgrPrevalence"
                    className="font-mono text-xs h-8"
                    onFocus={() => setShowVars(true)}
                  />
                  {validationError && (
                    <p className="text-xs text-destructive mt-1">
                      {validationError}
                    </p>
                  )}
                </div>
                {showVars && (
                  <div className="bg-muted/50 rounded-md p-2 max-h-32 overflow-y-auto">
                    <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                      Click to insert variable
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {allVarIds.map((vid) => (
                        <button
                          key={vid}
                          type="button"
                          onClick={() => insertVariable(vid)}
                          className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-mono hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        >
                          {vid}
                          <span className="text-muted-foreground ml-1 text-xs">
                            {labelMap[vid] || ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs"
                    onClick={handleSave}
                    disabled={!!validationError}
                  >
                    <Check className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={handleCancel}
                  >
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/50 rounded-md p-2 font-mono text-xs text-muted-foreground">
                    {def.formula}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setEditing(true);
                      setShowVars(false);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  {onDelete && def.isCustom && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => onDelete(def.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {usedVars.map((vid) => (
                    <Badge
                      key={vid}
                      variant="outline"
                      className="text-xs font-normal gap-1"
                    >
                      {labelMap[vid] || vid}
                      <span className="text-muted-foreground font-mono">
                        {allValues[vid] !== undefined
                          ? formatNumber(allValues[vid])
                          : '?'}
                      </span>
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const AddFormulaForm: React.FC<{
  group: FormulaDefinition['group'];
  allVarIds: string[];
  labelMap: Record<string, string>;
  onAdd: (formula: FormulaDefinition) => void;
}> = ({ group, allVarIds, labelMap, onAdd }) => {
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
    setName('');
    setId('');
    setFormula('');
  };

  const insertVar = (vid: string) => {
    setFormula((prev) => prev + vid);
    inputRef.current?.focus();
  };

  return (
    <Card className="border-dashed border-border/50">
      <CardContent className="p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Add Formula
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Extra Savings)"
            className="text-xs h-7"
          />
          <Input
            value={id}
            onChange={(e) => setId(e.target.value.replace(/\s/g, ''))}
            placeholder="ID (e.g. extraSavings)"
            className="text-xs h-7 font-mono"
          />
        </div>
        <Input
          ref={inputRef}
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="Formula expression"
          className="text-xs h-7 font-mono"
        />
        {error && <p className="text-[10px] text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {allVarIds.slice(0, 20).map((vid) => (
            <button
              key={vid}
              type="button"
              onClick={() => insertVar(vid)}
              className="inline-flex rounded-full border border-border px-1.5 py-0 text-[10px] font-mono hover:bg-accent transition-colors cursor-pointer"
            >
              {vid}
            </button>
          ))}
          {allVarIds.length > 20 && (
            <span className="text-[10px] text-muted-foreground">
              +{allVarIds.length - 20} more
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'number' | 'currency')}
            className="text-xs h-7 border rounded px-2 bg-background text-foreground"
          >
            <option value="number">Number</option>
            <option value="currency">Currency</option>
          </select>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSubmit}
            disabled={!name || !id || !formula || !!error}
          >
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AddVariableForm: React.FC<{
  onAdd: (v: CustomVariable) => void;
}> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [value, setValue] = useState('0');
  const [format, setFormat] = useState<'number' | 'percent' | 'currency'>(
    'number',
  );

  const handleSubmit = () => {
    if (!name || !id) return;
    onAdd({ id, name, value: parseFloat(value) || 0, format });
    setName('');
    setId('');
    setValue('0');
  };

  return (
    <Card className="border-dashed border-border/50">
      <CardContent className="p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Add Custom Variable
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="text-xs h-7"
          />
          <Input
            value={id}
            onChange={(e) => setId(e.target.value.replace(/\s/g, ''))}
            placeholder="ID (camelCase)"
            className="text-xs h-7 font-mono"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value"
            className="text-xs h-7 flex-1"
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="text-xs h-7 border rounded px-2 bg-background text-foreground"
          >
            <option value="number">Number</option>
            <option value="percent">Percent (0-1)</option>
            <option value="currency">Currency</option>
          </select>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSubmit}
            disabled={!name || !id}
          >
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [showAddVar, setShowAddVar] = useState(false);
  const [showAddFormula, setShowAddFormula] = useState<
    FormulaDefinition['group'] | null
  >(null);

  const labelMap = useMemo(
    () => buildLabelMap(formulas, customVariables),
    [formulas, customVariables],
  );

  // All available variable IDs for autocomplete
  const allVarIds = useMemo(() => {
    const inputVarIds = Object.keys(INPUT_VARIABLE_LABELS);
    const customVarIds = customVariables.map((v) => v.id);
    const formulaIds = formulas.map((f) => f.id);
    return [...inputVarIds, ...customVarIds, ...formulaIds];
  }, [formulas, customVariables]);

  const handleUpdateFormula = (
    id: string,
    changes: Partial<FormulaDefinition>,
  ) => {
    setFormulas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes } : f)),
    );
  };

  const handleDeleteFormula = (id: string) => {
    setFormulas((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddFormula = (formula: FormulaDefinition) => {
    setFormulas((prev) => [...prev, formula]);
    setShowAddFormula(null);
  };

  const handleAddVariable = (v: CustomVariable) => {
    setCustomVariables((prev) => [...prev, v]);
    setShowAddVar(false);
  };

  const handleDeleteVariable = (id: string) => {
    setCustomVariables((prev) => prev.filter((v) => v.id !== id));
  };

  const groups: { key: FormulaDefinition['group']; title: string }[] = [
    { key: 'demographics', title: 'Demographics' },
    { key: 'clinical', title: 'Clinical Outcomes' },
    { key: 'financial', title: 'Financial Impact' },
  ];

  const printFormulaRows = formulas.map((f) => ({
    name: f.name,
    group: f.group,
    formula: f.formula,
    value: formulaValues[f.id] ?? 0,
    format: f.format,
  }));

  return (
    <>
      {/* Interactive version (hidden in print) */}
      <div className="print:hidden">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Model Formulas
              </h2>
              {open ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
              {!open && (
                <span className="text-xs text-muted-foreground/60 ml-2">
                  Click to expand — edit formulas, add variables
                </span>
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-5">
              {/* Toolbar */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setShowAddVar(!showAddVar)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Variable
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={onResetFormulas}
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset to Defaults
                </Button>
              </div>

              {/* Custom Variables */}
              {showAddVar && <AddVariableForm onAdd={handleAddVariable} />}
              {customVariables.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Custom Variables
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {customVariables.map((v) => (
                      <Badge
                        key={v.id}
                        variant="secondary"
                        className="text-xs gap-1.5 pr-1"
                      >
                        <span className="font-mono">{v.id}</span>
                        <span className="text-muted-foreground">
                          = {v.value}
                        </span>
                        <button
                          onClick={() => handleDeleteVariable(v.id)}
                          className="ml-0.5 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Formula Groups */}
              {groups.map((group) => {
                const groupFormulas = formulas.filter(
                  (f) => f.group === group.key,
                );
                return (
                  <div key={group.key}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {group.title}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] px-2"
                        onClick={() =>
                          setShowAddFormula(
                            showAddFormula === group.key ? null : group.key,
                          )
                        }
                      >
                        <Plus className="h-3 w-3 mr-0.5" /> Add
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      {groupFormulas.map((def) => (
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
                      ))}
                    </div>
                    {showAddFormula === group.key && (
                      <div className="mt-2">
                        <AddFormulaForm
                          group={group.key}
                          allVarIds={allVarIds}
                          labelMap={labelMap}
                          onAdd={handleAddFormula}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Print-only version — static table of all formula results */}
      <div className="hidden print:block">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Model Formulas
        </h2>
        {groups.map((group) => {
          const gf = printFormulaRows.filter((f) => f.group === group.key);
          if (gf.length === 0) return null;
          return (
            <div key={group.key} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {group.title}
              </h3>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {gf.map((f, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {f.name}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {f.formula}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {f.format === 'currency'
                            ? formatCurrency(f.value)
                            : formatNumber(f.value)}
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
