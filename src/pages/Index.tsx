import React, { useState, useMemo, useEffect } from 'react';
import InputSidebar from '@/components/dashboard/InputSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICards from '@/components/dashboard/KPICards';
import FinancialCharts from '@/components/dashboard/FinancialCharts';
import ResultsTable from '@/components/dashboard/ResultsTable';
import ReferencesPanel from '@/components/dashboard/ReferencesPanel';
import FormulaExplorer from '@/components/dashboard/FormulaExplorer';
import { DEFAULT_US_INPUTS, DEFAULT_UK_INPUTS, DEFAULT_GLOBAL_INPUTS } from '@/lib/constants';
import { calculateImpact } from '@/lib/modelLogic';
import { SimulationInputs, Region } from '@/lib/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'oxnnet-simulator-configs';

interface SavedConfig {
  id: string;
  name: string;
  timestamp: number;
  inputs: SimulationInputs;
}

const Index: React.FC = () => {
  const [inputs, setInputs] = useState<SimulationInputs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const configs = JSON.parse(saved) as SavedConfig[];
        if (configs.length > 0) {
          const latest = configs[configs.length - 1];
          if (latest.inputs?.region && latest.inputs?.annualBirths) return latest.inputs;
        }
      }
    } catch {}
    return DEFAULT_UK_INPUTS;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const results = useMemo(() => calculateImpact(inputs), [inputs]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const switchRegion = (region: Region) => {
    switch (region) {
      case 'US': setInputs(DEFAULT_US_INPUTS); break;
      case 'UK': setInputs(DEFAULT_UK_INPUTS); break;
      case 'Global': setInputs(DEFAULT_GLOBAL_INPUTS); break;
    }
  };

  const getSavedConfigs = (): SavedConfig[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  };

  const saveConfiguration = () => {
    try {
      const configs = getSavedConfigs();
      const newConfig: SavedConfig = {
        id: Date.now().toString(),
        name: `${inputs.region} – ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: Date.now(),
        inputs: { ...inputs },
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
    const config = configs.find(c => c.id === id);
    if (config) {
      setInputs(config.inputs);
      toast.success(`Loaded: ${config.name}`);
    }
  };

  const deleteConfiguration = (id: string) => {
    const configs = getSavedConfigs().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    toast.success('Configuration deleted');
  };

  const isUS = inputs.region === 'US';
  const locale = isUS ? 'en-US' : 'en-GB';
  const currency = isUS ? 'USD' : 'GBP';

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(val);

  const handleReferenceChange = (key: string, newValue: string) => {
    setInputs(prev => ({
      ...prev,
      inputReferences: { ...prev.inputReferences, [key]: newValue }
    }));
  };

  const updateBibEntry = (index: number, newValue: string) => {
    const newBib = [...inputs.bibliography];
    newBib[index] = newValue;
    setInputs(prev => ({ ...prev, bibliography: newBib }));
  };

  const removeBibEntry = (index: number) => {
    setInputs(prev => ({ ...prev, bibliography: prev.bibliography.filter((_, i) => i !== index) }));
  };

  const addBibEntry = () => {
    setInputs(prev => ({ ...prev, bibliography: [...prev.bibliography, "New Reference..."] }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <InputSidebar
        inputs={inputs}
        setInputs={setInputs}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onSave={saveConfiguration}
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
          getSavedConfigs={() => getSavedConfigs().map(({ id, name, timestamp }) => ({ id, name, timestamp }))}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
            {/* Section 1: KPIs */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Executive Summary</h2>
              <KPICards
                results={results}
                region={inputs.region}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            </section>

            {/* Section 2: Charts */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Financial Projections</h2>
              <FinancialCharts
                results={results}
                region={inputs.region}
              />
            </section>

            {/* Section 3: Detailed Table */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Detailed Analysis</h2>
              <ResultsTable
                results={results}
                inputs={inputs}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            </section>

            {/* Section 3.5: Formulas */}
            <section>
              <FormulaExplorer
                inputs={inputs}
                results={results}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            </section>

            {/* Section 4: References */}
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Evidence Base</h2>
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
