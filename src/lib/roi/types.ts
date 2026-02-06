export type FrequencyUnit = 'day' | 'week' | 'month' | 'year';
export type TimeUnit = 'minutes' | 'hours';
export type Category = 'Sprzedaż' | 'Marketing' | 'Produkt' | 'Operacje' | 'Finanse' | 'HR' | 'Support' | 'Inne';

export interface LOCAction {
    id: string;
    name: string;
    eventsPerMonth: number;
    avgCostPerEvent: number;
}

export interface HiringData {
    count: number;
    employeeGross: number;
    employerGross: number;
    useStandardEmployerCost: boolean;
    recruitmentCost: number;
    onboardingCost: number;
    newEmployeeErrorsCost: number;
    badRecruitmentCost: number;
    teamExpansionCost: number;
}

export interface Operation {
    id: string;
    name: string;
    category: Category;

    // Cost Variables
    employeeCount: number;
    avgHourlyRate: number;
    employerCostEnabled: boolean;

    // Time & Freq
    frequency: number;
    frequencyUnit: FrequencyUnit;
    timePerExecution: number;
    timeUnit: TimeUnit;

    // Optimization
    efficiencyGain: number; // 0-1
    implementationDifficulty: number; // 1-10

    // LOC (Lost Opportunity Cost)
    locEnabled: boolean;
    locActions: LOCAction[];
    locMultiplier: number;

    // Hiring
    hiringEnabled: boolean;
    hiring: HiringData;
}

export interface TransformationBreakdown {
    peoplePercent: number;
    processPercent: number;
    techPercent: number;
}

export interface GlobalSettings {
    language: 'PL' | 'EN';
    inflationRate: number;
    startDate: string;
    endDate: string;
    estTransformationCost: number;
    minTransformationCost: number;
    implementationDurationDays: number;
    transformationCostFactor: number;
    breakdown: TransformationBreakdown;
}

export interface ROIResult {
    roiPercent1Y: number;
    roiPercent3Y: number;
    roiValue1Y: number;
    roiValue3Y: number;
    paybackMonths: number;
    totalInvestment: number;
}

export interface Report {
    id: string;
    reportNumber: string;
    reportDate: string;
    clientName: string;
    currency: 'PLN' | 'EUR' | 'USD';
    settings: GlobalSettings;
    operations: Operation[];
}
