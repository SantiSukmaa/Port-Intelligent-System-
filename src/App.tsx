import React, { useState } from 'react';
import { 
  PortData, 
  UserRole, 
  OperationalAlert, 
  OperationalCase, 
  SimulationScenario, 
  CaseStatus 
} from './types/dashboard.ts';
import { 
  INITIAL_PORTS, 
  EXECUTIVE_KPIS, 
  OPERATIONAL_ALERTS, 
  OPERATIONAL_CASES, 
  NATIONAL_TREND_DATA, 
  HOURLY_PREDICTION_DATA,
  SIMULATION_SCENARIOS
} from './data/mockData.ts';
import { Header } from './components/Header.tsx';
import { PageExecutiveSummary } from './components/PageExecutiveSummary.tsx';
import { PagePortDetail } from './components/PagePortDetail.tsx';
import { PagePortPortfolio } from './components/PagePortPortfolio.tsx';
import { PagePredictionSimulation } from './components/PagePredictionSimulation.tsx';
import { PageCaseManagement } from './components/PageCaseManagement.tsx';
import { PageFinancialAnalysis } from './components/PageFinancialAnalysis.tsx';
import { PageCustomerAnalytics } from './components/PageCustomerAnalytics.tsx';
import { PageDigitalTwin3D } from './components/PageDigitalTwin3D.tsx';
import { ModalAlerts } from './components/ModalAlerts.tsx';
import { ModalManualInput } from './components/ModalManualInput.tsx';
import { ModalComparePorts } from './components/ModalComparePorts.tsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('page_executive');
  const [currentRole, setCurrentRole] = useState<UserRole>('EXEC');
  const [isPeakSeason, setIsPeakSeason] = useState<boolean>(true); // Default to Peak season matching screenshot H-3
  const [ports, setPorts] = useState<PortData[]>(INITIAL_PORTS);
  const [selectedPort, setSelectedPort] = useState<PortData>(INITIAL_PORTS[0]); // Merak
  const [alerts, setAlerts] = useState<OperationalAlert[]>(OPERATIONAL_ALERTS);
  const [cases, setCases] = useState<OperationalCase[]>(OPERATIONAL_CASES);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(SIMULATION_SCENARIOS);

  // Modals state
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isPoskoOpen, setIsPoskoOpen] = useState<boolean>(false);
  const [comparePortIds, setComparePortIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  const handleOpenCompare = (ids: string[]) => {
    setComparePortIds(ids);
    setIsCompareOpen(true);
  };

  const handleAddCaseFromScenario = (newScenario: SimulationScenario) => {
    setScenarios([newScenario, ...scenarios]);
    const newCase: OperationalCase = {
      id: `case_${Date.now()}`,
      caseNumber: `KASUS-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newScenario.name,
      portId: newScenario.portId,
      portName: selectedPort.name,
      route: newScenario.route,
      urgency: 'Kritis',
      status: 'Menunggu pihak eksternal',
      responsibleOfficer: 'Tim Operasi Pusat ASDP',
      role: 'OPS_HQ',
      createdAt: 'Baru saja',
      responseDeadline: 'Dalam 2 Jam',
      internalApprover: 'Direktur Operasi ASDP',
      externalApprover: 'BPTD Wilayah Banten & Kakorslantas',
      officialLetterNo: 'ND.SIM-ASDP/X-2026',
      authority: 'Perlu persetujuan regulator',
      proposedAction: `Tambahan ${newScenario.addedTrips} Trip Layar dengan KMP Ferrindo V, optimalisasi port time, dan aktivasi buffer zone Tol KM 43.`,
      expectedOutcome: `Menuntaskan antrean menjadi ${newScenario.finalQueue} unit dengan surplus ekonomi Rp ${newScenario.netBenefitMillionRp.toFixed(0)} Jt.`,
    };
    setCases([newCase, ...cases]);
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: CaseStatus) => {
    setCases(cases.map((c) => c.id === caseId ? { ...c, status: newStatus } : c));
  };

  const handlePoskoReportSubmit = (report: {
    officerName: string;
    portId: string;
    roadQueueLengthKm: number;
    estimatedVehicles: number;
    ksopLetterNo: string;
    incidentType: string;
    notes: string;
  }) => {
    // Dynamically update port's roadAccess and queue
    setPorts(ports.map((p) => {
      if (p.id === report.portId) {
        return {
          ...p,
          totalQueueVehicles: p.totalQueueVehicles + Math.round(report.estimatedVehicles * 0.3),
          queueZones: {
            ...p.queueZones,
            roadAccess: p.queueZones.roadAccess + Math.round(report.estimatedVehicles * 0.4),
          },
        };
      }
      return p;
    }));

    // Add alert
    const targetPort = ports.find((p) => p.id === report.portId) || selectedPort;
    const newAlert: OperationalAlert = {
      id: `alert_${Date.now()}`,
      type: 'Kepadatan',
      urgency: 'Tinggi',
      title: `Laporan Posko: ${report.incidentType}`,
      description: `${report.notes} (Panjang antrean: ${report.roadQueueLengthKm} KM, Estimasi: ${report.estimatedVehicles} kend.)`,
      portId: report.portId,
      portName: targetPort.name,
      route: `${targetPort.mainRoute.origin} - ${targetPort.mainRoute.destination}`,
      timestamp: 'Baru saja',
      verified: true,
      referenceSource: `Posko Lapangan: ${report.officerName} · Surat ${report.ksopLetterNo}`,
      recommendedAction: 'Koordinasi posko pengamanan & percepatan loket Ferizy',
      authority: 'Perlu koordinasi eksternal',
    };
    setAlerts([newAlert, ...alerts]);
  };

  const portsToCompare = ports.filter((p) => comparePortIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#070d17] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Top Header Bar */}
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        isPeakSeason={isPeakSeason}
        onTogglePeakSeason={setIsPeakSeason}
        selectedPort={selectedPort}
        unreadAlertCount={alerts.length}
        onOpenAlertsModal={() => setIsAlertsOpen(true)}
        onOpenPoskoModal={() => setIsPoskoOpen(true)}
      />

      {/* Main Viewport Router */}
      <main className="flex-1 pb-10">
        {currentPage === 'page_executive' && (
          <PageExecutiveSummary
            ports={ports}
            kpis={EXECUTIVE_KPIS}
            alerts={alerts}
            selectedPort={selectedPort}
            onSelectPort={setSelectedPort}
            onNavigatePage={setCurrentPage}
            nationalTrend={NATIONAL_TREND_DATA}
            hourlyPrediction={HOURLY_PREDICTION_DATA}
          />
        )}

        {currentPage === 'page_port_detail' && (
          <PagePortDetail
            selectedPort={selectedPort}
            ports={ports}
            onSelectPort={setSelectedPort}
            onOpenPoskoModal={() => setIsPoskoOpen(true)}
            hourlyPrediction={HOURLY_PREDICTION_DATA}
          />
        )}

        {currentPage === 'page_digital_twin' && (
          <PageDigitalTwin3D />
        )}

        {currentPage === 'page_portfolio' && (
          <PagePortPortfolio
            ports={ports}
            onSelectPort={setSelectedPort}
            onNavigatePage={setCurrentPage}
            onOpenCompareModal={handleOpenCompare}
          />
        )}

        {currentPage === 'page_simulation' && (
          <PagePredictionSimulation
            ports={ports}
            selectedPort={selectedPort}
            onSelectPort={setSelectedPort}
            scenarios={scenarios}
            onAddCaseFromScenario={handleAddCaseFromScenario}
          />
        )}

        {currentPage === 'page_cases' && (
          <PageCaseManagement
            cases={cases}
            onUpdateCaseStatus={handleUpdateCaseStatus}
          />
        )}

        {currentPage === 'page_financial' && (
          <PageFinancialAnalysis />
        )}

        {currentPage === 'page_customer' && (
          <PageCustomerAnalytics />
        )}
      </main>

      {/* Modals */}
      <ModalAlerts
        alerts={alerts}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onNavigateToCase={() => {
          setIsAlertsOpen(false);
          setCurrentPage('page_cases');
        }}
      />

      <ModalManualInput
        isOpen={isPoskoOpen}
        onClose={() => setIsPoskoOpen(false)}
        ports={ports}
        selectedPort={selectedPort}
        onSubmitReport={handlePoskoReportSubmit}
      />

      <ModalComparePorts
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        portsToCompare={portsToCompare}
        onSelectPort={setSelectedPort}
        onNavigatePage={setCurrentPage}
      />
    </div>
  );
}
