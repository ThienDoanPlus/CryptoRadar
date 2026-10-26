import React, { useState } from 'react';
import { TabId, MorningChecklistStep, CustomMacroAlert, CustomTokenUnlockAlert } from './types/cryptoRadar';
import { MORNING_CHECKLIST_STEPS } from './constants/routine';
import {
  getSavedMacroAlerts,
  saveMacroAlerts,
  getSavedUnlockAlerts,
  saveUnlockAlerts,
} from './services/alertService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Navbar, Footer } from './components/layout';
import {
  OverviewExecutive,
  PillarLiquidation,
  PillarWhalesArkham,
  PillarFarsideETF,
  PillarMacroForexFactory,
  PillarTokenUnlocks,
} from './components/pillars';
import {
  MorningRoutineModal,
  AlertCenterModal,
  PortalDirectoryModal,
  DataSourcesModal,
} from './components/modals';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const [isRoutineOpen, setIsRoutineOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);

  const [morningSteps, setMorningSteps] = useLocalStorage<MorningChecklistStep[]>(
    'cryptoradar_morning_steps',
    MORNING_CHECKLIST_STEPS
  );

  const [streakDays] = useLocalStorage<number>('cryptoradar_streak', 14);

  const [macroAlerts, setMacroAlerts] = useState<CustomMacroAlert[]>(() => getSavedMacroAlerts());
  const [unlockAlerts, setUnlockAlerts] = useState<CustomTokenUnlockAlert[]>(() => getSavedUnlockAlerts());

  const [isCompactMode, setIsCompactMode] = useLocalStorage<boolean>(
    'cryptoradar_compact_mode',
    false
  );

  const handleToggleCompactMode = () => {
    setIsCompactMode((prev) => !prev);
  };

  const handleSaveMacroAlerts = (alerts: CustomMacroAlert[]) => {
    setMacroAlerts(alerts);
    saveMacroAlerts(alerts);
  };

  const handleSaveUnlockAlerts = (alerts: CustomTokenUnlockAlert[]) => {
    setUnlockAlerts(alerts);
    saveUnlockAlerts(alerts);
  };

  const handleToggleStep = (stepId: number) => {
    setMorningSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const activeAlertCount =
    macroAlerts.filter((a) => a.isActive).length + unlockAlerts.filter((u) => u.isActive).length;

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-200 flex flex-col font-sans selection:bg-slate-700 selection:text-white">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenRoutine={() => setIsRoutineOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenPortals={() => setIsPortalsOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        activeAlertCount={activeAlertCount}
        isCompactMode={isCompactMode}
        onToggleCompactMode={handleToggleCompactMode}
      />

      <main
        className={`flex-1 max-w-7xl w-full mx-auto transition-all ${
          isCompactMode
            ? 'px-3 sm:px-4 lg:px-6 py-3 space-y-3'
            : 'px-4 sm:px-6 lg:px-8 py-6'
        }`}
      >
        {activeTab === 'overview' && (
          <OverviewExecutive
            onSelectTab={setActiveTab}
            onOpenRoutine={() => setIsRoutineOpen(true)}
            onOpenPortals={() => setIsPortalsOpen(true)}
            streakDays={streakDays}
            isCompact={isCompactMode}
          />
        )}

        {activeTab === 'liquidation' && <PillarLiquidation isCompact={isCompactMode} />}

        {activeTab === 'whales' && <PillarWhalesArkham isCompact={isCompactMode} />}

        {activeTab === 'etf' && <PillarFarsideETF isCompact={isCompactMode} />}

        {activeTab === 'macro' && (
          <PillarMacroForexFactory onOpenAlerts={() => setIsAlertsOpen(true)} isCompact={isCompactMode} />
        )}

        {activeTab === 'unlocks' && (
          <PillarTokenUnlocks onOpenAlerts={() => setIsAlertsOpen(true)} isCompact={isCompactMode} />
        )}
      </main>

      <Footer
        onOpenPortals={() => setIsPortalsOpen(true)}
        onOpenRoutine={() => setIsRoutineOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      <MorningRoutineModal
        isOpen={isRoutineOpen}
        onClose={() => setIsRoutineOpen(false)}
        steps={morningSteps}
        onToggleStep={handleToggleStep}
        onJumpToTab={(tab) => {
          setActiveTab(tab);
          setIsRoutineOpen(false);
        }}
        streakDays={streakDays}
      />

      <AlertCenterModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        macroAlerts={macroAlerts}
        onSaveMacroAlerts={handleSaveMacroAlerts}
        unlockAlerts={unlockAlerts}
        onSaveUnlockAlerts={handleSaveUnlockAlerts}
      />

      <PortalDirectoryModal
        isOpen={isPortalsOpen}
        onClose={() => setIsPortalsOpen(false)}
      />

      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
      />
    </div>
  );
}
