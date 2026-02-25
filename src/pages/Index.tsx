import React, { useState, useMemo, useEffect } from 'react';
import InputSidebar from '@/components/dashboard/InputSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICards from '@/components/dashboard/KPICards';
import FinancialCharts from '@/components/dashboard/FinancialCharts';
import ResultsTable from '@/components/dashboard/ResultsTable';
import ReferencesPanel from '@/components/dashboard/ReferencesPanel';
import { DEFAULT_US_INPUTS, DEFAULT_UK_INPUTS, DEFAULT_GLOBAL_INPUTS } from '@/lib/constants';
import { calculateImpact } from '@/lib/modelLogic';
import { SimulationInputs, Region } from '@/lib/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'oxnnet-simulator-config';

const Index: React.FC = () => {
  const [inputs, setInputs] = useState<SimulationInputs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SimulationInputs;
        if (parsed.region && parsed.annualBirths) return parsed;
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

  const saveConfiguration = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
      toast.success('Configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    }
  };

  const loadConfiguration = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SimulationInputs;
        if (parsed.region && parsed.annualBirths) {
          setInputs(parsed);
          toast.success('Configuration loaded');
          return;
        }
      }
      toast.error('No saved configuration found');
    } catch {
      toast.error('Failed to load configuration');
    }
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
