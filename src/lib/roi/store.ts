import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Report, Operation, GlobalSettings, ROIResult } from './types';

export const DEFAULT_SETTINGS: GlobalSettings = {
    language: 'PL',
    inflationRate: 0.042,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 282 * 24 * 60 * 60 * 1000).toISOString(),
    estTransformationCost: 0,
    minTransformationCost: 20000,
    implementationDurationDays: 275,
    transformationCostFactor: 0.15,
    breakdown: {
        peoplePercent: 30,
        processPercent: 5,
        techPercent: 65,
    },
};

export const DEFAULT_OPERATION: Omit<Operation, 'id'> = {
    name: 'Nowa operacja',
    category: 'Operacje',
    employeeCount: 1,
    avgHourlyRate: 50,
    employerCostEnabled: true,
    frequency: 1,
    frequencyUnit: 'day',
    timePerExecution: 15,
    timeUnit: 'minutes',
    efficiencyGain: 0.7,
    implementationDifficulty: 5,
    locEnabled: false,
    locActions: [],
    locMultiplier: 1,
    // Automation & AI
    automationPercent: 70,
    humanInLoopPercent: 20,
    tokenCostsEnabled: false,
    tokenCosts: {
        monthlyApiCalls: 1000,
        avgTokensPerCall: 2000,
        inputPricePerMToken: 2.5,  // GPT-4o default
        outputPricePerMToken: 10,
        modelName: 'GPT-4o',
    },
    // Hiring
    hiringEnabled: false,
    hiring: {
        count: 1,
        employeeGross: 5000,
        employerGross: 6020,
        useStandardEmployerCost: true,
        recruitmentCost: 0,
        onboardingCost: 0,
        newEmployeeErrorsCost: 0,
        badRecruitmentCost: 0,
        teamExpansionCost: 0,
    },
};

interface ROIStoreState {
    report: Report;
    savedReports: Report[];

    // Report Actions
    setClientInfo: (info: Partial<Report>) => void;
    loadReport: (report: Report) => void;
    saveCurrentReport: () => void;
    createNewReport: () => void;

    // Settings
    updateSettings: (settings: Partial<GlobalSettings>) => void;

    // Operations
    addOperation: (op?: Partial<Operation>) => void;
    updateOperation: (id: string, changes: Partial<Operation>) => void;
    removeOperation: (id: string) => void;
    duplicateOperation: (id: string) => void;

    // Calculations
    calculateOpAnnual: (op: Operation) => number;
    calculateLocAnnual: (op: Operation) => number;
    calculateTokenCostsAnnual: (op: Operation) => number;
    calculateAnnualCost: (op: Operation) => number;
    calculateFutureCost: (op: Operation) => number;
    calculateTransformationInvestment: (op: Operation) => number;
    calculateROI: (op: Operation) => ROIResult;
    calculateTotalSummary: () => {
        currentCost: number;
        futureCost: number;
        savings: number;
        investment: number;
        roi1Y: number;
        roi3Y: number;
    };
}

export const useROIStore = create<ROIStoreState>()(
    persist(
        (set, get) => ({
            report: {
                id: uuidv4(),
                reportNumber: 'R-' + new Date().getFullYear() + '-001',
                reportDate: new Date().toISOString().split('T')[0],
                clientName: '',
                currency: 'PLN',
                settings: DEFAULT_SETTINGS,
                operations: [],
            },
            savedReports: [],

            setClientInfo: (info) => set((state) => ({ report: { ...state.report, ...info } })),
            loadReport: (report) => set(() => ({ report })),

            saveCurrentReport: () => set((state) => {
                const existingIdx = state.savedReports.findIndex(r => r.id === state.report.id);
                const updatedReports = [...state.savedReports];
                if (existingIdx >= 0) {
                    updatedReports[existingIdx] = state.report;
                } else {
                    updatedReports.push(state.report);
                }
                return { savedReports: updatedReports };
            }),

            createNewReport: () => set((state) => {
                const nextNum = state.savedReports.length + 1;
                return {
                    report: {
                        id: uuidv4(),
                        reportNumber: 'R-' + new Date().getFullYear() + '-' + nextNum.toString().padStart(3, '0'),
                        reportDate: new Date().toISOString().split('T')[0],
                        clientName: '',
                        currency: 'PLN',
                        settings: DEFAULT_SETTINGS,
                        operations: [],
                    },
                };
            }),

            updateSettings: (newSettings) => set((state) => ({
                report: { ...state.report, settings: { ...state.report.settings, ...newSettings } },
            })),

            addOperation: (partial) => set((state) => ({
                report: {
                    ...state.report,
                    operations: [...state.report.operations, { ...DEFAULT_OPERATION, ...partial, id: uuidv4() }],
                },
            })),

            updateOperation: (id, updates) => set((state) => ({
                report: {
                    ...state.report,
                    operations: state.report.operations.map(op => op.id === id ? { ...op, ...updates } : op),
                },
            })),

            removeOperation: (id) => set((state) => ({
                report: {
                    ...state.report,
                    operations: state.report.operations.filter(op => op.id !== id),
                },
            })),

            duplicateOperation: (id) => set((state) => {
                const op = state.report.operations.find(o => o.id === id);
                if (!op) return {};
                const newOp = { ...op, id: uuidv4(), name: op.name + ' (kopia)' };
                return {
                    report: { ...state.report, operations: [...state.report.operations, newOp] },
                };
            }),

            // Calculations
            calculateOpAnnual: (op: Operation) => {
                let executionsPerYear = op.frequency;
                if (op.frequencyUnit === 'day') executionsPerYear = op.frequency * 252;
                if (op.frequencyUnit === 'week') executionsPerYear = op.frequency * 52;
                if (op.frequencyUnit === 'month') executionsPerYear = op.frequency * 12;

                let hoursPerExecution = op.timePerExecution;
                if (op.timeUnit === 'minutes') hoursPerExecution = op.timePerExecution / 60;

                let cost = executionsPerYear * hoursPerExecution * op.avgHourlyRate * op.employeeCount;
                if (op.employerCostEnabled) cost *= 1.204;
                return cost;
            },

            calculateLocAnnual: (op: Operation) => {
                if (!op.locEnabled || !op.locActions) return 0;
                return op.locActions.reduce((sum, a) => sum + (a.eventsPerMonth * 12 * a.avgCostPerEvent), 0);
            },

            calculateTokenCostsAnnual: (op: Operation) => {
                if (!op.tokenCostsEnabled || !op.tokenCosts) return 0;
                const tc = op.tokenCosts;
                const annualCalls = tc.monthlyApiCalls * 12;
                const totalTokens = annualCalls * tc.avgTokensPerCall;
                // Assuming 70% input, 30% output tokens distribution
                const inputTokens = totalTokens * 0.7;
                const outputTokens = totalTokens * 0.3;
                const inputCost = (inputTokens / 1_000_000) * tc.inputPricePerMToken;
                const outputCost = (outputTokens / 1_000_000) * tc.outputPricePerMToken;
                return inputCost + outputCost;
            },

            calculateAnnualCost: (op: Operation) => {
                return get().calculateOpAnnual(op) + get().calculateLocAnnual(op) + get().calculateTokenCostsAnnual(op);
            },

            calculateFutureCost: (op: Operation) => {
                const opFuture = get().calculateOpAnnual(op) * (1 - op.efficiencyGain);
                const locFuture = get().calculateLocAnnual(op) * (1 - op.efficiencyGain);

                let hiringAnnual = 0;
                if (op.hiringEnabled && op.hiring) {
                    const h = op.hiring;
                    const employer = h.useStandardEmployerCost ? (h.employeeGross * 1.204) : h.employerGross;
                    hiringAnnual = (h.employeeGross + employer) * 12 * h.count;
                }

                return opFuture + locFuture + hiringAnnual;
            },

            calculateTransformationInvestment: (op: Operation) => {
                const { report } = get();
                const settings = report.settings;
                const opAnnual = get().calculateOpAnnual(op);

                if (settings.estTransformationCost > 0) {
                    const totalOpex = report.operations.reduce((sum, o) => sum + get().calculateOpAnnual(o), 0);
                    const share = totalOpex > 0 ? opAnnual / totalOpex : 1;
                    return settings.estTransformationCost * share;
                }
                return opAnnual * settings.transformationCostFactor;
            },

            calculateROI: (op: Operation) => {
                const current = get().calculateAnnualCost(op);
                const future = get().calculateFutureCost(op);
                const annualSavings = current - future;

                let hiringInvestment = 0;
                if (op.hiringEnabled && op.hiring) {
                    const h = op.hiring;
                    hiringInvestment = (h.recruitmentCost || 0) + (h.onboardingCost || 0) + (h.newEmployeeErrorsCost || 0) + (h.badRecruitmentCost || 0);
                }

                const transInvestment = get().calculateTransformationInvestment(op);
                const totalInvestment = hiringInvestment + transInvestment;

                let roiPercent1Y = 0;
                let roiPercent3Y = 0;
                const roiValue1Y = annualSavings - totalInvestment;
                const roiValue3Y = (annualSavings * 3) - totalInvestment;
                let paybackMonths = annualSavings > 0 ? (totalInvestment / (annualSavings / 12)) : 99;

                if (totalInvestment > 0) {
                    roiPercent1Y = (roiValue1Y / totalInvestment) * 100;
                    roiPercent3Y = (roiValue3Y / totalInvestment) * 100;
                }

                if (paybackMonths > 99) paybackMonths = 99;
                if (paybackMonths < 0) paybackMonths = 0;

                return { roiPercent1Y, roiPercent3Y, roiValue1Y, roiValue3Y, paybackMonths, totalInvestment };
            },

            calculateTotalSummary: () => {
                const { report } = get();
                const ops = report.operations;

                const currentCost = ops.reduce((sum, op) => sum + get().calculateAnnualCost(op), 0);
                const futureCost = ops.reduce((sum, op) => sum + get().calculateFutureCost(op), 0);
                const savings = currentCost - futureCost;
                const investment = ops.reduce((sum, op) => sum + get().calculateTransformationInvestment(op), 0);
                const roi1Y = investment > 0 ? ((savings - investment) / investment) * 100 : 0;
                const roi3Y = investment > 0 ? (((savings * 3) - investment) / investment) * 100 : 0;

                return { currentCost, futureCost, savings, investment, roi1Y, roi3Y };
            },
        }),
        { name: 'vantage-roi-calculator' }
    )
);
