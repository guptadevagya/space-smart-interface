import React from 'react';
import { SimulationInputs, Region } from '@/lib/types';
import { DEFAULT_US_INPUTS, DEFAULT_UK_INPUTS, DEFAULT_GLOBAL_INPUTS } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info, RotateCcw, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InputSidebarProps {
  inputs: SimulationInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulationInputs>>;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const getDefaults = (region: Region): SimulationInputs => {
  switch (region) {
    case 'US': return DEFAULT_US_INPUTS;
    case 'UK': return DEFAULT_UK_INPUTS;
    case 'Global': return DEFAULT_GLOBAL_INPUTS;
  }
};

interface InputGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border border-border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-5 bg-card">
          {children}
        </div>
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
}

const SliderField: React.FC<SliderFieldProps> = ({
  label, value, onChange, min, max, step, prefix, suffix, tooltip, isDefault = true, formatDisplay
}) => {
  const displayVal = formatDisplay ? formatDisplay(value) : value.toString();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">{label}</label>
          {!isDefault && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[250px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
          <Input
            type="number"
            value={displayVal}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              if (!isNaN(raw)) {
                onChange(suffix === '%' ? raw / 100 : raw);
              }
            }}
            className="h-7 w-24 text-xs text-right font-mono bg-muted/30 border-border"
          />
          {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[suffix === '%' ? value * 100 : value]}
        onValueChange={([v]) => onChange(suffix === '%' ? v / 100 : v)}
        min={suffix === '%' ? min * 100 : min}
        max={suffix === '%' ? max * 100 : max}
        step={suffix === '%' ? step * 100 : step}
        className="w-full"
      />
    </div>
  );
};

const InputSidebar: React.FC<InputSidebarProps> = ({ inputs, setInputs, isOpen, toggleSidebar }) => {
  const defaults = getDefaults(inputs.region);
  const currPrefix = inputs.region === 'US' ? '$' : '£';

  const update = (key: keyof SimulationInputs, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const resetToDefaults = () => setInputs(getDefaults(inputs.region));

  const isChanged = (key: keyof SimulationInputs) =>
    inputs[key] !== defaults[key];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-[360px] bg-card border-r border-border flex flex-col h-full transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">Model Configuration</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Adjust parameters to update projections</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetToDefaults} title="Reset to defaults">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={toggleSidebar}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable inputs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <InputGroup title="Hospital Profile">
            <SliderField
              label="Annual Births"
              value={inputs.annualBirths}
              onChange={(v) => update('annualBirths', v)}
              min={1000} max={50000} step={500}
              isDefault={!isChanged('annualBirths')}
              tooltip={inputs.inputReferences.annualBirths}
            />
          </InputGroup>

          <InputGroup title="Clinical Assumptions">
            <SliderField label="FGR Prevalence" value={inputs.fgrPrevalence} onChange={(v) => update('fgrPrevalence', v)}
              min={0.01} max={0.20} step={0.005} suffix="%" isDefault={!isChanged('fgrPrevalence')}
              formatDisplay={(v) => (v * 100).toFixed(1)}
              tooltip={inputs.inputReferences.fgrPrevalence} />
            <SliderField label="Current Detection Rate" value={inputs.currentDetectionRate} onChange={(v) => update('currentDetectionRate', v)}
              min={0.10} max={0.80} step={0.01} suffix="%" isDefault={!isChanged('currentDetectionRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.currentDetectionRate} />
            <SliderField label="OxNNet Detection Rate" value={inputs.oxailisDetectionRate} onChange={(v) => update('oxailisDetectionRate', v)}
              min={0.30} max={0.95} step={0.01} suffix="%" isDefault={!isChanged('oxailisDetectionRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.oxailisDetectionRate} />
            <SliderField label="Current False Positive Rate" value={inputs.currentFalsePositiveRate} onChange={(v) => update('currentFalsePositiveRate', v)}
              min={0.05} max={0.80} step={0.01} suffix="%" isDefault={!isChanged('currentFalsePositiveRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.currentFalsePositiveRate} />
            <SliderField label="OxNNet False Positive Rate" value={inputs.oxailisFalsePositiveRate} onChange={(v) => update('oxailisFalsePositiveRate', v)}
              min={0.05} max={0.50} step={0.01} suffix="%" isDefault={!isChanged('oxailisFalsePositiveRate')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.oxailisFalsePositiveRate} />
          </InputGroup>

          <InputGroup title="Cost Parameters">
            {inputs.region === 'US' ? (
              <>
                <SliderField label="Scan Reimbursement" value={inputs.scanReimbursement} onChange={(v) => update('scanReimbursement', v)}
                  min={50} max={500} step={10} prefix="$" isDefault={!isChanged('scanReimbursement')}
                  tooltip={inputs.inputReferences.scanReimbursement} />
                <SliderField label="C-Section Cost" value={inputs.cSectionCost} onChange={(v) => update('cSectionCost', v)}
                  min={5000} max={30000} step={500} prefix="$" isDefault={!isChanged('cSectionCost')}
                  tooltip={inputs.inputReferences.cSectionCost} />
                <SliderField label="NICU Daily Cost" value={inputs.nicuDailyCost} onChange={(v) => update('nicuDailyCost', v)}
                  min={1000} max={8000} step={100} prefix="$" isDefault={!isChanged('nicuDailyCost')}
                  tooltip={inputs.inputReferences.nicuDailyCost} />
                <SliderField label="Malpractice Settlement" value={inputs.malpracticeClaimCost} onChange={(v) => update('malpracticeClaimCost', v)}
                  min={500000} max={10000000} step={100000} prefix="$" isDefault={!isChanged('malpracticeClaimCost')}
                  tooltip={inputs.inputReferences.malpracticeClaimCost} />
              </>
            ) : (
              <>
                <SliderField label="Growth Scan Cost" value={inputs.growthScanCost} onChange={(v) => update('growthScanCost', v)}
                  min={30} max={300} step={5} prefix="£" isDefault={!isChanged('growthScanCost')}
                  tooltip={inputs.inputReferences.growthScanCost} />
                <SliderField label="Consultant Appointment" value={inputs.consultantAppointmentCost} onChange={(v) => update('consultantAppointmentCost', v)}
                  min={50} max={400} step={5} prefix="£" isDefault={!isChanged('consultantAppointmentCost')}
                  tooltip={inputs.inputReferences.consultantAppointmentCost} />
                <SliderField label="Midwife Appointment" value={inputs.midwifeAppointmentCost} onChange={(v) => update('midwifeAppointmentCost', v)}
                  min={30} max={200} step={5} prefix="£" isDefault={!isChanged('midwifeAppointmentCost')}
                  tooltip={inputs.inputReferences.midwifeAppointmentCost} />
                <SliderField label="C-Section Cost" value={inputs.cSectionCost} onChange={(v) => update('cSectionCost', v)}
                  min={1000} max={10000} step={100} prefix="£" isDefault={!isChanged('cSectionCost')}
                  tooltip={inputs.inputReferences.cSectionCost} />
                <SliderField label="NICU Daily Cost" value={inputs.nicuDailyCost} onChange={(v) => update('nicuDailyCost', v)}
                  min={500} max={5000} step={50} prefix="£" isDefault={!isChanged('nicuDailyCost')}
                  tooltip={inputs.inputReferences.nicuDailyCost} />
                <SliderField label="CP Litigation" value={inputs.malpracticeClaimCost} onChange={(v) => update('malpracticeClaimCost', v)}
                  min={1000000} max={25000000} step={500000} prefix="£" isDefault={!isChanged('malpracticeClaimCost')}
                  tooltip={inputs.inputReferences.malpracticeClaimCost} />
                <SliderField label="NND Litigation" value={inputs.neonatalDeathLitigationCost} onChange={(v) => update('neonatalDeathLitigationCost', v)}
                  min={100000} max={2000000} step={50000} prefix="£" isDefault={!isChanged('neonatalDeathLitigationCost')}
                  tooltip={inputs.inputReferences.neonatalDeathLitigationCost} />
                <SliderField label="Stillbirth Cost" value={inputs.stillbirthLitigationCost} onChange={(v) => update('stillbirthLitigationCost', v)}
                  min={1000} max={20000} step={500} prefix="£" isDefault={!isChanged('stillbirthLitigationCost')}
                  tooltip={inputs.inputReferences.stillbirthLitigationCost} />
              </>
            )}
          </InputGroup>

          <InputGroup title="Risk Ratios">
            <SliderField label="Emergency C-Section Rate" value={inputs.emergencyCSectionRateUndiagnosed} onChange={(v) => update('emergencyCSectionRateUndiagnosed', v)}
              min={0.10} max={0.70} step={0.01} suffix="%" isDefault={!isChanged('emergencyCSectionRateUndiagnosed')}
              formatDisplay={(v) => (v * 100).toFixed(0)}
              tooltip={inputs.inputReferences.emergencyCSectionRateUndiagnosed} />
            <SliderField label="Hypoxic Event Rate" value={inputs.hypoxicEventRate} onChange={(v) => update('hypoxicEventRate', v)}
              min={0.001} max={0.05} step={0.001} suffix="%" isDefault={!isChanged('hypoxicEventRate')}
              formatDisplay={(v) => (v * 100).toFixed(2)}
              tooltip={inputs.inputReferences.hypoxicEventRate} />
            <SliderField label="CP Risk (if Hypoxic)" value={inputs.cerebralPalsyRisk} onChange={(v) => update('cerebralPalsyRisk', v)}
              min={0.01} max={0.30} step={0.005} suffix="%" isDefault={!isChanged('cerebralPalsyRisk')}
              formatDisplay={(v) => (v * 100).toFixed(1)}
              tooltip={inputs.inputReferences.cerebralPalsyRisk} />
          </InputGroup>
        </div>

        <div className="px-4 py-3 border-t border-border text-[10px] text-center text-muted-foreground shrink-0">
          Values update projections in real-time
        </div>
      </aside>
    </>
  );
};

export default InputSidebar;
