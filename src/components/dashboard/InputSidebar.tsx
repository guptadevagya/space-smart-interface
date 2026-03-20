import React from 'react';
import { SimulationInputs, Region, CustomParameter, USProviderView } from '@/lib/types';
import {
  US_PROVIDERS,
  US_TOTAL_BIRTHS,
  getProvidersByType,
  getProviderById,
  getAggregateBirths,
} from '@/lib/providerProfiles';
import {
  DEFAULT_US_INPUTS,
  DEFAULT_UK_INPUTS,
  DEFAULT_GLOBAL_INPUTS,
} from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  BookOpen,
  RotateCcw,
  X,
  ChevronDown,
  Save,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface InputSidebarProps {
  inputs: SimulationInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulationInputs>>;
  isOpen: boolean;
  toggleSidebar: () => void;
  onSave: () => void;
  customParameters: CustomParameter[];
  setCustomParameters: React.Dispatch<React.SetStateAction<CustomParameter[]>>;
  providerView: USProviderView;
  setProviderView: (view: USProviderView) => void;
  selectedProviderId: string | null;
  setSelectedProviderId: (id: string | null) => void;
}

const getDefaults = (region: Region): SimulationInputs => {
  switch (region) {
    case 'US':
      return DEFAULT_US_INPUTS;
    case 'UK':
      return DEFAULT_UK_INPUTS;
    case 'Global':
      return DEFAULT_GLOBAL_INPUTS;
  }
};

interface InputGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAddParameter?: () => void;
}

const InputGroup: React.FC<InputGroupProps> = ({
  title,
  children,
  defaultOpen = true,
  onAddParameter,
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border border-border rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-1">
          {onAddParameter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddParameter();
              }}
              className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Add parameter"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-5 bg-card">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  isDefault?: boolean;
  formatDisplay?: (val: number) => string;
  onDelete?: () => void;
  onEditReference?: (ref: string) => void;
  disabled?: boolean;
}

const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  tooltip,
  isDefault = true,
  formatDisplay,
  onDelete,
  onEditReference,
  disabled = false,
}) => {
  const displayVal = formatDisplay ? formatDisplay(value) : value.toString();
  const [editingRef, setEditingRef] = React.useState(false);
  const [refValue, setRefValue] = React.useState(tooltip || '');

  return (
    <div className={cn('space-y-2 group/field', disabled && 'opacity-75')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {label}
          </label>
          {!isDefault && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
          <Popover open={editingRef} onOpenChange={setEditingRef}>
            <PopoverTrigger asChild>
              <button className="h-4 w-4 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors">
                <BookOpen className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" className="max-w-[280px] text-xs p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Reference
              </p>
              <input
                className="w-full text-xs bg-transparent border-0 border-b border-border focus:border-primary text-foreground px-0 py-1 outline-none"
                value={refValue}
                onChange={(e) => setRefValue(e.target.value)}
                onBlur={() => {
                  onEditReference?.(refValue);
                  setEditingRef(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onEditReference?.(refValue);
                    setEditingRef(false);
                  }
                }}
                placeholder="Enter source reference..."
              />
            </PopoverContent>
          </Popover>
          {onDelete && (
            <button
              onClick={onDelete}
              className="h-4 w-4 rounded-full flex items-center justify-center text-destructive/50 hover:text-destructive opacity-0 group-hover/field:opacity-100 transition-all"
              title="Remove parameter"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {prefix && (
            <span className="text-xs text-muted-foreground">{prefix}</span>
          )}
          <Input
            type="number"
            value={displayVal}
            disabled={disabled}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              if (!disabled && !isNaN(raw)) {
                onChange(suffix === '%' ? raw / 100 : raw);
              }
            }}
            className="h-7 w-24 text-xs text-right font-mono bg-muted/30 border-border disabled:cursor-not-allowed disabled:opacity-100"
          />
          {suffix && (
            <span className="text-xs text-muted-foreground">{suffix}</span>
          )}
        </div>
      </div>
      <Slider
        disabled={disabled}
        value={[suffix === '%' ? value * 100 : value]}
        onValueChange={([v]) => {
          if (!disabled) onChange(suffix === '%' ? v / 100 : v);
        }}
        min={suffix === '%' ? min * 100 : min}
        max={suffix === '%' ? max * 100 : max}
        step={suffix === '%' ? step * 100 : step}
        className={cn('w-full', disabled && 'pointer-events-none')}
      />
    </div>
  );
};

// Dialog for adding a new parameter
const AddParameterDialog: React.FC<{
  group: string;
  currPrefix: string;
  onAdd: (param: CustomParameter) => void;
}> = ({ group, currPrefix, onAdd }) => {
  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [value, setValue] = React.useState(0);
  const [min, setMin] = React.useState(0);
  const [max, setMax] = React.useState(1000);
  const [step, setStep] = React.useState(1);
  const [format, setFormat] = React.useState<'number' | 'percent' | 'currency'>(
    'number',
  );
  const [reference, setReference] = React.useState('');

  const handleAdd = () => {
    if (!label.trim()) return;
    const id = `custom_${label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;
    onAdd({
      id,
      label: label.trim(),
      value,
      min,
      max,
      step,
      format,
      group,
      reference,
    });
    setLabel('');
    setValue(0);
    setMin(0);
    setMax(1000);
    setStep(1);
    setFormat('number');
    setReference('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-xs text-primary hover:text-primary/80 font-semibold py-2 transition-colors">
          + Add Parameter
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Add Parameter to {group}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-8 text-xs"
              placeholder="e.g. Readmission Rate"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Format</Label>
              <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percent">Percentage</SelectItem>
                  <SelectItem value="currency">
                    Currency ({currPrefix})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Default Value</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Min</Label>
              <Input
                type="number"
                value={min}
                onChange={(e) => setMin(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Max</Label>
              <Input
                type="number"
                value={max}
                onChange={(e) => setMax(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Step</Label>
              <Input
                type="number"
                value={step}
                onChange={(e) => setStep(parseFloat(e.target.value) || 1)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Reference / Source</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="h-8 text-xs"
              placeholder="Enter citation..."
            />
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={handleAdd}
            disabled={!label.trim()}
          >
            Add Parameter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InputSidebar: React.FC<InputSidebarProps> = ({
  inputs,
  setInputs,
  isOpen,
  toggleSidebar,
  onSave,
  customParameters,
  setCustomParameters,
  providerView,
  setProviderView,
  selectedProviderId,
  setSelectedProviderId,
}) => {
  const defaults = getDefaults(inputs.region);
  const currPrefix = inputs.region === 'US' ? '$' : '£';

  const update = (key: keyof SimulationInputs, val: number) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const handleReferenceChange = (key: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      inputReferences: { ...prev.inputReferences, [key]: value },
    }));
  };

  const resetToDefaults = () => {
    setInputs(getDefaults(inputs.region));
    setCustomParameters([]);
  };

  const isChanged = (key: keyof SimulationInputs) =>
    inputs[key] !== defaults[key];

  const addCustomParam = (param: CustomParameter) => {
    setCustomParameters((prev) => [...prev, param]);
  };

  const updateCustomParam = (id: string, value: number) => {
    setCustomParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value } : p)),
    );
  };

  const deleteCustomParam = (id: string) => {
    setCustomParameters((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCustomParamRef = (id: string, reference: string) => {
    setCustomParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reference } : p)),
    );
  };

  const customByGroup = (group: string) =>
    customParameters.filter((p) => p.group === group);

  const renderCustomParams = (group: string) => {
    const params = customByGroup(group);
    if (params.length === 0) return null;
    return params.map((p) => (
      <SliderField
        key={p.id}
        label={p.label}
        value={p.value}
        onChange={(v) => updateCustomParam(p.id, v)}
        min={p.min}
        max={p.max}
        step={p.step}
        prefix={p.format === 'currency' ? currPrefix : undefined}
        suffix={p.format === 'percent' ? '%' : undefined}
        formatDisplay={
          p.format === 'percent' ? (v) => (v * 100).toFixed(1) : undefined
        }
        isDefault={false}
        tooltip={p.reference}
        onDelete={() => deleteCustomParam(p.id)}
        onEditReference={(ref) => updateCustomParamRef(p.id, ref)}
      />
    ));
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={toggleSidebar}
      />

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-[360px] bg-card border-r border-border flex flex-col h-full transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Model Configuration
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Adjust parameters to update projections
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={resetToDefaults}
              title="Reset to defaults"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable inputs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {inputs.region === 'US' && (
            <InputGroup title="Country Profile" defaultOpen={true}>
              <SliderField
                label="Annual Live Births"
                value={providerView === 'all' ? inputs.annualBirths : US_TOTAL_BIRTHS}
                onChange={(v) => {
                  if (providerView === 'all') update('annualBirths', v);
                }}
                min={1000}
                max={5000000}
                step={1000}
                disabled={providerView !== 'all'}
                isDefault={providerView === 'all' ? !isChanged('annualBirths') : true}
                tooltip={inputs.inputReferences.annualBirths}
                onEditReference={(ref) =>
                  handleReferenceChange('annualBirths', ref)
                }
              />
              {providerView !== 'all' && (
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  U.S. national births stay visible here while provider-level modeling runs below.
                </p>
              )}
            </InputGroup>
          )}

          {inputs.region === 'US' ? (
            <InputGroup title="Provider Profile">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Provider Type</label>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-0.5">
                  {(['idn', 'ipp'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => {
                        setProviderView(view);
                        setSelectedProviderId(null);
                        update('annualBirths', getAggregateBirths(view));
                      }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-bold rounded-md transition-all text-center',
                        providerView === view
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {view.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {providerView === 'all' ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
                  <p className="text-xs font-medium text-foreground">
                    Select IDN or IPP to drill into provider-level cohorts.
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                    Executive summary and charts are currently showing the full U.S. market.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Select {providerView.toUpperCase()}
                    </label>
                    <Select
                      value={selectedProviderId || '__aggregate__'}
                      onValueChange={(val) => {
                        if (val === '__aggregate__') {
                          setSelectedProviderId(null);
                          update('annualBirths', getAggregateBirths(providerView));
                        } else {
                          setSelectedProviderId(val);
                          const provider = getProviderById(val);
                          if (provider) update('annualBirths', provider.annualBirths);
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__aggregate__">
                          All {providerView.toUpperCase()}s ({getProvidersByType(providerView).length} systems)
                        </SelectItem>
                        {getProvidersByType(providerView).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProviderId && (() => {
                    const provider = getProviderById(selectedProviderId);
                    if (!provider) return null;
                    return (
                      <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                        <p className="text-xs font-semibold text-foreground">{provider.name}</p>
                        <p className="text-[10px] text-muted-foreground italic">
                          {provider.source}
                        </p>
                      </div>
                    );
                  })()}

                  <SliderField
                    label={selectedProviderId ? 'Provider Births' : 'Annual Births'}
                    value={inputs.annualBirths}
                    onChange={(v) => {
                      if (!selectedProviderId) update('annualBirths', v);
                    }}
                    min={1000}
                    max={5000000}
                    step={1000}
                    isDefault={!isChanged('annualBirths')}
                    tooltip={inputs.inputReferences.annualBirths}
                    onEditReference={(ref) =>
                      handleReferenceChange('annualBirths', ref)
                    }
                  />
                </>
              )}
              {renderCustomParams('Provider Profile')}
              <AddParameterDialog
                group="Provider Profile"
                currPrefix={currPrefix}
                onAdd={addCustomParam}
              />
            </InputGroup>
          ) : (
            <InputGroup title="Hospital Profile">
              <SliderField
                label="Annual Births"
                value={inputs.annualBirths}
                onChange={(v) => update('annualBirths', v)}
                min={1000}
                max={5000000}
                step={1000}
                isDefault={!isChanged('annualBirths')}
                tooltip={inputs.inputReferences.annualBirths}
                onEditReference={(ref) =>
                  handleReferenceChange('annualBirths', ref)
                }
              />
              {renderCustomParams('Hospital Profile')}
              <AddParameterDialog
                group="Hospital Profile"
                currPrefix={currPrefix}
                onAdd={addCustomParam}
              />
            </InputGroup>
          )}

          <InputGroup title="Clinical Assumptions">
            <SliderField
              label="FGR Prevalence"
              value={inputs.fgrPrevalence}
              onChange={(v) => update('fgrPrevalence', v)}
              min={0.01}
              max={0.2}
              step={0.005}
              suffix="%"
              isDefault={!isChanged('fgrPrevalence')}
              formatDisplay={(v) => (v * 100).toFixed(1)}
              tooltip={inputs.inputReferences.fgrPrevalence}
              onEditReference={(ref) =>
                handleReferenceChange('fgrPrevalence', ref)
              }
            />
            <SliderField
              label="Current Detection Rate"
              value={inputs.currentDetectionRate}
              onChange={(v) => update('currentDetectionRate', v)}
              min={0.1}
              max={0.8}
              step={0.01}
              suffix="%"
              isDefault={!isChanged('currentDetectionRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.currentDetectionRate}
              onEditReference={(ref) =>
                handleReferenceChange('currentDetectionRate', ref)
              }
            />
            <SliderField
              label="OxNNet Detection Rate"
              value={inputs.oxailisDetectionRate}
              onChange={(v) => update('oxailisDetectionRate', v)}
              min={0.3}
              max={0.95}
              step={0.01}
              suffix="%"
              isDefault={!isChanged('oxailisDetectionRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.oxailisDetectionRate}
              onEditReference={(ref) =>
                handleReferenceChange('oxailisDetectionRate', ref)
              }
            />
            <SliderField
              label="Current False Positive Rate"
              value={inputs.currentFalsePositiveRate}
              onChange={(v) => update('currentFalsePositiveRate', v)}
              min={0.05}
              max={0.8}
              step={0.01}
              suffix="%"
              isDefault={!isChanged('currentFalsePositiveRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.currentFalsePositiveRate}
              onEditReference={(ref) =>
                handleReferenceChange('currentFalsePositiveRate', ref)
              }
            />
            <SliderField
              label="OxNNet False Positive Rate"
              value={inputs.oxailisFalsePositiveRate}
              onChange={(v) => update('oxailisFalsePositiveRate', v)}
              min={0.05}
              max={0.5}
              step={0.01}
              suffix="%"
              isDefault={!isChanged('oxailisFalsePositiveRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.oxailisFalsePositiveRate}
              onEditReference={(ref) =>
                handleReferenceChange('oxailisFalsePositiveRate', ref)
              }
            />
            {renderCustomParams('Clinical Assumptions')}
            <AddParameterDialog
              group="Clinical Assumptions"
              currPrefix={currPrefix}
              onAdd={addCustomParam}
            />
          </InputGroup>

          <InputGroup title="Cost Parameters">
            {inputs.region === 'US' ? (
              <>
                <SliderField
                  label="Scan Reimbursement"
                  value={inputs.scanReimbursement}
                  onChange={(v) => update('scanReimbursement', v)}
                  min={50}
                  max={500}
                  step={10}
                  prefix="$"
                  isDefault={!isChanged('scanReimbursement')}
                  tooltip={inputs.inputReferences.scanReimbursement}
                  onEditReference={(ref) =>
                    handleReferenceChange('scanReimbursement', ref)
                  }
                />
                <SliderField
                  label="C-Section Cost"
                  value={inputs.cSectionCost}
                  onChange={(v) => update('cSectionCost', v)}
                  min={10000}
                  max={50000}
                  step={500}
                  prefix="$"
                  isDefault={!isChanged('cSectionCost')}
                  tooltip={inputs.inputReferences.cSectionCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('cSectionCost', ref)
                  }
                />
                <SliderField
                  label="NICU Daily Cost"
                  value={inputs.nicuDailyCost}
                  onChange={(v) => update('nicuDailyCost', v)}
                  min={1000}
                  max={15000}
                  step={100}
                  prefix="$"
                  isDefault={!isChanged('nicuDailyCost')}
                  tooltip={inputs.inputReferences.nicuDailyCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('nicuDailyCost', ref)
                  }
                />
                <SliderField
                  label="CP Verdict (Median)"
                  value={inputs.malpracticeClaimCost}
                  onChange={(v) => update('malpracticeClaimCost', v)}
                  min={1000000}
                  max={20000000}
                  step={100000}
                  prefix="$"
                  isDefault={!isChanged('malpracticeClaimCost')}
                  tooltip={inputs.inputReferences.malpracticeClaimCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('malpracticeClaimCost', ref)
                  }
                />
                <SliderField
                  label="Fetal Death Payout"
                  value={inputs.fetalDeathPayout}
                  onChange={(v) => update('fetalDeathPayout', v)}
                  min={100000}
                  max={2000000}
                  step={10000}
                  prefix="$"
                  isDefault={!isChanged('fetalDeathPayout')}
                  tooltip={inputs.inputReferences.fetalDeathPayout}
                  onEditReference={(ref) =>
                    handleReferenceChange('fetalDeathPayout', ref)
                  }
                />
                <SliderField
                  label="Litigation Success Rate"
                  value={inputs.litigationSuccessRate}
                  onChange={(v) => update('litigationSuccessRate', v)}
                  min={0.05}
                  max={1.0}
                  step={0.01}
                  suffix="%"
                  isDefault={!isChanged('litigationSuccessRate')}
                  formatDisplay={(v) => (v * 100).toFixed(0)}
                  tooltip={inputs.inputReferences.litigationSuccessRate}
                  onEditReference={(ref) =>
                    handleReferenceChange('litigationSuccessRate', ref)
                  }
                />
                <SliderField
                  label="Screening Uptake"
                  value={inputs.combinedTestRate}
                  onChange={(v) => update('combinedTestRate', v)}
                  min={0.3}
                  max={1.0}
                  step={0.005}
                  suffix="%"
                  isDefault={!isChanged('combinedTestRate')}
                  formatDisplay={(v) => (v * 100).toFixed(1)}
                  tooltip={inputs.inputReferences.combinedTestRate}
                  onEditReference={(ref) =>
                    handleReferenceChange('combinedTestRate', ref)
                  }
                />
              </>
            ) : (
              <>
                <SliderField
                  label="Growth Scan Cost"
                  value={inputs.growthScanCost}
                  onChange={(v) => update('growthScanCost', v)}
                  min={30}
                  max={300}
                  step={5}
                  prefix="£"
                  isDefault={!isChanged('growthScanCost')}
                  tooltip={inputs.inputReferences.growthScanCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('growthScanCost', ref)
                  }
                />
                <SliderField
                  label="Consultant Appointment"
                  value={inputs.consultantAppointmentCost}
                  onChange={(v) => update('consultantAppointmentCost', v)}
                  min={50}
                  max={400}
                  step={5}
                  prefix="£"
                  isDefault={!isChanged('consultantAppointmentCost')}
                  tooltip={inputs.inputReferences.consultantAppointmentCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('consultantAppointmentCost', ref)
                  }
                />
                <SliderField
                  label="Midwife Appointment"
                  value={inputs.midwifeAppointmentCost}
                  onChange={(v) => update('midwifeAppointmentCost', v)}
                  min={30}
                  max={200}
                  step={5}
                  prefix="£"
                  isDefault={!isChanged('midwifeAppointmentCost')}
                  tooltip={inputs.inputReferences.midwifeAppointmentCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('midwifeAppointmentCost', ref)
                  }
                />
                <SliderField
                  label="C-Section Cost"
                  value={inputs.cSectionCost}
                  onChange={(v) => update('cSectionCost', v)}
                  min={1000}
                  max={10000}
                  step={100}
                  prefix="£"
                  isDefault={!isChanged('cSectionCost')}
                  tooltip={inputs.inputReferences.cSectionCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('cSectionCost', ref)
                  }
                />
                <SliderField
                  label="NICU Daily Cost"
                  value={inputs.nicuDailyCost}
                  onChange={(v) => update('nicuDailyCost', v)}
                  min={500}
                  max={5000}
                  step={50}
                  prefix="£"
                  isDefault={!isChanged('nicuDailyCost')}
                  tooltip={inputs.inputReferences.nicuDailyCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('nicuDailyCost', ref)
                  }
                />
                <SliderField
                  label="CP Litigation"
                  value={inputs.malpracticeClaimCost}
                  onChange={(v) => update('malpracticeClaimCost', v)}
                  min={1000000}
                  max={25000000}
                  step={500000}
                  prefix="£"
                  isDefault={!isChanged('malpracticeClaimCost')}
                  tooltip={inputs.inputReferences.malpracticeClaimCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('malpracticeClaimCost', ref)
                  }
                />
                <SliderField
                  label="NND Litigation"
                  value={inputs.neonatalDeathLitigationCost}
                  onChange={(v) => update('neonatalDeathLitigationCost', v)}
                  min={100000}
                  max={2000000}
                  step={50000}
                  prefix="£"
                  isDefault={!isChanged('neonatalDeathLitigationCost')}
                  tooltip={inputs.inputReferences.neonatalDeathLitigationCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('neonatalDeathLitigationCost', ref)
                  }
                />
                <SliderField
                  label="Stillbirth Cost"
                  value={inputs.stillbirthLitigationCost}
                  onChange={(v) => update('stillbirthLitigationCost', v)}
                  min={1000}
                  max={20000}
                  step={500}
                  prefix="£"
                  isDefault={!isChanged('stillbirthLitigationCost')}
                  tooltip={inputs.inputReferences.stillbirthLitigationCost}
                  onEditReference={(ref) =>
                    handleReferenceChange('stillbirthLitigationCost', ref)
                  }
                />
                <SliderField
                  label="Oxailis Scan Cost"
                  value={inputs.oxailisScanCost}
                  onChange={(v) => update('oxailisScanCost', v)}
                  min={0}
                  max={50}
                  step={1}
                  prefix="£"
                  isDefault={!isChanged('oxailisScanCost')}
                  tooltip={
                    inputs.inputReferences.oxailisScanCost ||
                    'Cost per Oxailis scan'
                  }
                  onEditReference={(ref) =>
                    handleReferenceChange('oxailisScanCost', ref)
                  }
                />
                <SliderField
                  label="Combined Test Rate"
                  value={inputs.combinedTestRate}
                  onChange={(v) => update('combinedTestRate', v)}
                  min={0.5}
                  max={1.0}
                  step={0.01}
                  suffix="%"
                  isDefault={!isChanged('combinedTestRate')}
                  formatDisplay={(v) => (v * 100).toFixed(0)}
                  tooltip={
                    inputs.inputReferences.combinedTestRate ||
                    'Official Statistics - Antenatal screening standards'
                  }
                  onEditReference={(ref) =>
                    handleReferenceChange('combinedTestRate', ref)
                  }
                />
              </>
            )}
            {renderCustomParams('Cost Parameters')}
            <AddParameterDialog
              group="Cost Parameters"
              currPrefix={currPrefix}
              onAdd={addCustomParam}
            />
          </InputGroup>

          <InputGroup title="Risk Ratios" onAddParameter={() => {}}>
            {inputs.region === 'US' && (
              <>
                <SliderField
                  label="Emergency C-Section Rate"
                  value={inputs.emergencyCSectionRateUndiagnosed}
                  onChange={(v) =>
                    update('emergencyCSectionRateUndiagnosed', v)
                  }
                  min={0.1}
                  max={0.7}
                  step={0.01}
                  suffix="%"
                  isDefault={!isChanged('emergencyCSectionRateUndiagnosed')}
                  formatDisplay={(v) => (v * 100).toFixed(0)}
                  tooltip={
                    inputs.inputReferences.emergencyCSectionRateUndiagnosed
                  }
                  onEditReference={(ref) =>
                    handleReferenceChange(
                      'emergencyCSectionRateUndiagnosed',
                      ref,
                    )
                  }
                />
                <SliderField
                  label="Hypoxic Event Rate"
                  value={inputs.hypoxicEventRate}
                  onChange={(v) => update('hypoxicEventRate', v)}
                  min={0.001}
                  max={0.05}
                  step={0.001}
                  suffix="%"
                  isDefault={!isChanged('hypoxicEventRate')}
                  formatDisplay={(v) => (v * 100).toFixed(2)}
                  tooltip={inputs.inputReferences.hypoxicEventRate}
                  onEditReference={(ref) =>
                    handleReferenceChange('hypoxicEventRate', ref)
                  }
                />
              </>
            )}
            <SliderField
              label="CP Risk (if Hypoxic)"
              value={inputs.cerebralPalsyRisk}
              onChange={(v) => update('cerebralPalsyRisk', v)}
              min={0.01}
              max={0.3}
              step={0.005}
              suffix="%"
              isDefault={!isChanged('cerebralPalsyRisk')}
              formatDisplay={(v) => (v * 100).toFixed(1)}
              tooltip={inputs.inputReferences.cerebralPalsyRisk}
              onEditReference={(ref) =>
                handleReferenceChange('cerebralPalsyRisk', ref)
              }
            />
            {renderCustomParams('Risk Ratios')}
            <AddParameterDialog
              group="Risk Ratios"
              currPrefix={currPrefix}
              onAdd={addCustomParam}
            />
          </InputGroup>
        </div>

        <div className="px-4 py-3 border-t border-border shrink-0 flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onSave}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Configuration
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Values update projections in real-time
          </p>
        </div>
      </aside>
    </>
  );
};

export default InputSidebar;
