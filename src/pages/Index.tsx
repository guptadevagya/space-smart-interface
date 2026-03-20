import React, { useState, useMemo } from 'react';
import InputSidebar from '@/components/dashboard/InputSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICards from '@/components/dashboard/KPICards';
import FinancialCharts from '@/components/dashboard/FinancialCharts';
import ResultsTable from '@/components/dashboard/ResultsTable';
import ReferencesPanel from '@/components/dashboard/ReferencesPanel';
import FormulaExplorer from '@/components/dashboard/FormulaExplorer';
import USHeatmap from '@/components/dashboard/USHeatmap';
import ProviderComparison from '@/components/dashboard/ProviderComparison';
import StateMarketTable from '@/components/dashboard/StateMarketTable';
import {
  DEFAULT_US_INPUTS,
  DEFAULT_UK_INPUTS,
  DEFAULT_GLOBAL_INPUTS,
} from '@/lib/constants';
import { evaluateFormulas } from '@/lib/formulaEngine';
import {
  getDefaultFormulas,
  getInputVariableMap,
  formulaResultsToSimulation,
} from '@/lib/defaultFormulas';
import {
  SimulationInputs,
  Region,
  FormulaDefinition,
  CustomVariable,
  CustomParameter,
  USProviderView,
} from '@/lib/types';
import {
  getProviderById,
  getAggregateBirths,
  US_TOTAL_BIRTHS,
} from '@/lib/providerProfiles';
import { toast } from 'sonner';

const STORAGE_KEY = 'oxnnet-simulator-configs';

interface SavedConfig {
  id: string;
  name: string;
  timestamp: number;
  inputs: SimulationInputs;
  formulas?: FormulaDefinition[];
  customVariables?: CustomVariable[];
  customParameters?: CustomParameter[];
}

const mergeWithDefaultFormulas = (
  region: Region,
  savedFormulas?: FormulaDefinition[],
): FormulaDefinition[] => {
  const defaultFormulas = getDefaultFormulas(region);
  if (!savedFormulas?.length) return defaultFormulas;

  const savedById = new Map(
    savedFormulas.map((formula) => [formula.id, formula]),
  );
  const defaultIds = new Set(defaultFormulas.map((formula) => formula.id));

  const mergedDefaults = defaultFormulas.map((formula) => {
    const savedFormula = savedById.get(formula.id);
    return savedFormula ? { ...formula, ...savedFormula } : formula;
  });

  const extraCustomFormulas = savedFormulas.filter(
    (formula) => !defaultIds.has(formula.id),
  );

  return [...mergedDefaults, ...extraCustomFormulas];
};

const Index: React.FC = () => {
  const [inputs, setInputs] = useState<SimulationInputs>(() => {
    const defaultsByRegion: Record<Region, SimulationInputs> = {
      US: DEFAULT_US_INPUTS,
      UK: DEFAULT_UK_INPUTS,
      Global: DEFAULT_GLOBAL_INPUTS,
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const configs = JSON.parse(saved) as SavedConfig[];
        if (configs.length > 0) {
          const latest = configs[configs.length - 1];
          if (latest.inputs?.region && latest.inputs?.annualBirths) {
            const defaults =
              defaultsByRegion[latest.inputs.region] || DEFAULT_UK_INPUTS;
            return {
              ...defaults,
              ...latest.inputs,
              // Always restore national births for US
              annualBirths:
                latest.inputs.region === 'US'
                  ? US_TOTAL_BIRTHS
                  : latest.inputs.annualBirths,
              inputReferences: {
                ...defaults.inputReferences,
                ...(latest.inputs.inputReferences || {}),
              },
            };
          }
        }
      }
    } catch {}
    return DEFAULT_UK_INPUTS;
  });

  const [formulas, setFormulas] = useState<FormulaDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const configs = JSON.parse(saved) as SavedConfig[];
        if (configs.length > 0) {
          const latest = configs[configs.length - 1];
          return mergeWithDefaultFormulas(
            latest.inputs?.region || 'UK',
            latest.formulas,
          );
        }
      }
    } catch {}
    return getDefaultFormulas('UK');
  });

  const [customVariables, setCustomVariables] = useState<CustomVariable[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const configs = JSON.parse(saved) as SavedConfig[];
          if (
            configs.length > 0 &&
            configs[configs.length - 1].customVariables
          ) {
            return configs[configs.length - 1].customVariables!;
          }
        }
      } catch {}
      return [];
    },
  );

  const [customParameters, setCustomParameters] = useState<CustomParameter[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const configs = JSON.parse(saved) as SavedConfig[];
          if (
            configs.length > 0 &&
            configs[configs.length - 1].customParameters
          ) {
            return configs[configs.length - 1].customParameters!;
          }
        }
      } catch {}
      return [];
    },
  );

  const [providerView, setProviderView] = useState<USProviderView>('all');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isUS = inputs.region === 'US';

  // ── National-level results (always full U.S. for US region) ──
  const inputVarMap = useMemo(() => {
    const base = getInputVariableMap(inputs);
    customVariables.forEach((v) => {
      base[v.id] = v.value;
    });
    customParameters.forEach((p) => {
      base[p.id] = p.value;
    });
    return base;
  }, [inputs, customVariables, customParameters]);

  const { values: formulaValues, errors: formulaErrors } = useMemo(
    () => evaluateFormulas(formulas, inputVarMap),
    [formulas, inputVarMap],
  );

  const results = useMemo(
    () => formulaResultsToSimulation(formulaValues, inputs.region),
    [formulaValues, inputs.region],
  );

  // ── Provider-level results (only when a provider scope is active) ──
  const providerBirths = useMemo(() => {
    if (!isUS || providerView === 'all') return null;
    if (selectedProviderId) {
      const provider = getProviderById(selectedProviderId);
      return provider?.annualBirths ?? null;
    }
    return getAggregateBirths(providerView);
  }, [isUS, providerView, selectedProviderId]);

  const providerResults = useMemo(() => {
    if (providerBirths === null) return null;
    const providerVarMap = {
      ...inputVarMap,
      annualBirths: providerBirths,
    };
    const { values } = evaluateFormulas(formulas, providerVarMap);
    return formulaResultsToSimulation(values, 'US');
  }, [providerBirths, inputVarMap, formulas]);

  const selectedProvider = selectedProviderId
    ? getProviderById(selectedProviderId)
    : null;
  const providerLabel = isUS
    ? selectedProvider
      ? `${selectedProvider.name} (${selectedProvider.type.toUpperCase()})`
      : providerView === 'all'
        ? null
        : `All ${providerView.toUpperCase()}s`
    : null;

  // ── Helpers ──
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const switchRegion = (region: Region) => {
    switch (region) {
      case 'US':
        setInputs(DEFAULT_US_INPUTS);
        break;
      case 'UK':
        setInputs(DEFAULT_UK_INPUTS);
        break;
      case 'Global':
        setInputs(DEFAULT_GLOBAL_INPUTS);
        break;
    }
    setFormulas(getDefaultFormulas(region));
    setCustomVariables([]);
    setCustomParameters([]);
    setProviderView('all');
    setSelectedProviderId(null);
  };

  const resetFormulas = () => {
    setFormulas(getDefaultFormulas(inputs.region));
    toast.success('Formulas reset to defaults');
  };

  const getSavedConfigs = (): SavedConfig[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveConfiguration = () => {
    try {
      const configs = getSavedConfigs();
      const newConfig: SavedConfig = {
        id: Date.now().toString(),
        name: `${inputs.region} – ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: Date.now(),
        inputs: { ...inputs },
        formulas: [...formulas],
        customVariables: [...customVariables],
        customParameters: [...customParameters],
      };
      configs.push(newConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      toast.success('Configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    }
  };

  const loadConfiguration = (id: string) => {
    const configs = getSavedConfigs();
    const config = configs.find((c) => c.id === id);
    if (config) {
      setInputs(config.inputs);
      setFormulas(
        mergeWithDefaultFormulas(config.inputs.region, config.formulas),
      );
      if (config.customVariables) setCustomVariables(config.customVariables);
      else setCustomVariables([]);
      if (config.customParameters)
        setCustomParameters(config.customParameters);
      else setCustomParameters([]);
      toast.success(`Loaded: ${config.name}`);
    }
  };

  const deleteConfiguration = (id: string) => {
    const configs = getSavedConfigs().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    toast.success('Configuration deleted');
  };

  const locale = isUS ? 'en-US' : 'en-GB';
  const currency = isUS ? 'USD' : 'GBP';

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(val);

  const handleReferenceChange = (key: string, newValue: string) => {
    setInputs((prev) => ({
      ...prev,
      inputReferences: { ...prev.inputReferences, [key]: newValue },
    }));
  };

  const updateBibEntry = (index: number, newValue: string) => {
    const newBib = [...inputs.bibliography];
    newBib[index] = newValue;
    setInputs((prev) => ({ ...prev, bibliography: newBib }));
  };

  const removeBibEntry = (index: number) => {
    setInputs((prev) => ({
      ...prev,
      bibliography: prev.bibliography.filter((_, i) => i !== index),
    }));
  };

  const addBibEntry = () => {
    setInputs((prev) => ({
      ...prev,
      bibliography: [...prev.bibliography, 'New Reference...'],
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <InputSidebar
        inputs={inputs}
        setInputs={setInputs}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onSave={saveConfiguration}
        customParameters={customParameters}
        setCustomParameters={setCustomParameters}
        providerView={providerView}
        setProviderView={setProviderView}
        selectedProviderId={selectedProviderId}
        setSelectedProviderId={setSelectedProviderId}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DashboardHeader
          region={inputs.region}
          switchRegion={switchRegion}
          toggleSidebar={toggleSidebar}
          totalImpact={formatCurrency(results.financials.totalEconomicImpact)}
          onSave={saveConfiguration}
          onLoad={loadConfiguration}
          onDelete={deleteConfiguration}
          getSavedConfigs={() =>
            getSavedConfigs().map(({ id, name, timestamp }) => ({
              id,
              name,
              timestamp,
            }))
          }
          providerView={providerView}
          selectedProviderId={selectedProviderId}
          annualBirths={inputs.annualBirths}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
            {/* Section 1: KPIs — always national */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                {isUS ? 'U.S. National Summary' : 'Executive Summary'}
              </h2>
              <KPICards
                results={results}
                region={inputs.region}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            </section>

            {/* Section 1.5: Provider comparison — only when scoped */}
            {isUS && providerResults && providerLabel && (
              <section>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Provider Scope — {providerLabel}
                  <span className="ml-2 text-[10px] font-normal normal-case text-muted-foreground/70">
                    {(providerBirths || 0).toLocaleString()} births
                  </span>
                </h2>
                <ProviderComparison
                  providerResults={providerResults}
                  nationalResults={results}
                  providerLabel={providerLabel}
                  providerBirths={providerBirths || 0}
                  nationalBirths={inputs.annualBirths}
                  formatCurrency={formatCurrency}
                  formatNumber={formatNumber}
                />
              </section>
            )}

            {/* Section 2: Charts — always national */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                Financial Projections
              </h2>
              <FinancialCharts
                results={results}
                region={inputs.region}
                providerLabel={undefined}
              />
            </section>

            {/* Section 2.5: US Heatmap + State Market Table */}
            {isUS && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Geographic Distribution
                </h2>
                <USHeatmap
                  providerView={providerView}
                  selectedProviderId={selectedProviderId}
                />
                <StateMarketTable />
              </section>
            )}

            {/* Section 3: Detailed Table — always national */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                Detailed Analysis
              </h2>
              <ResultsTable
                results={results}
                inputs={inputs}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            </section>

            {/* Section 3.5: Formula Explorer */}
            <section>
              <FormulaExplorer
                inputs={inputs}
                formulas={formulas}
                setFormulas={setFormulas}
                customVariables={customVariables}
                setCustomVariables={setCustomVariables}
                formulaValues={formulaValues}
                formulaErrors={formulaErrors}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                onResetFormulas={resetFormulas}
              />
            </section>

            {/* Section 4: References */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                Evidence Base
              </h2>
              <ReferencesPanel
                inputs={inputs}
                onReferenceChange={handleReferenceChange}
                onBibUpdate={updateBibEntry}
                onBibRemove={removeBibEntry}
                onBibAdd={addBibEntry}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
