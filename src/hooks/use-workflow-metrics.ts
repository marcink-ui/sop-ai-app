'use client';

import { useMemo } from 'react';
import { Node } from 'reactflow';

// ============================================
// COST MODEL PARAMETERS
// ============================================

interface CostParameters {
    // Labor costs
    hourlyRatePLN: number;           // Base hourly rate for employee
    overheadMultiplier: number;      // Company overhead (benefits, office, etc.)

    // AI/API costs  
    tokensPerMinute: number;         // Estimated API tokens used per minute of AI work
    costPer1kTokens: number;         // Cost per 1000 tokens (PLN)

    // Opportunity costs
    revenuePerHourPLN: number;       // Potential revenue generation per hour
    opportunityCostFactor: number;   // % of time that could generate revenue

    // Automation ROI
    automationCostPerNode: number;   // Implementation cost per automated node
    automationMaintenanceMonthly: number; // Monthly maintenance per automated node

    // Risk factors
    errorCostAverage: number;        // Average cost of an error/rework (PLN)
    trainingCostPerEmployee: number; // Training cost for complex processes
}

const DEFAULT_PARAMS: CostParameters = {
    // Labor - based on Polish market
    hourlyRatePLN: 120,              // ~120 PLN/h for mid-level
    overheadMultiplier: 1.4,         // 40% overhead

    // AI costs - based on GPT-4 pricing
    tokensPerMinute: 500,            // ~500 tokens per minute of AI interaction
    costPer1kTokens: 0.12,           // ~$0.03 * 4 PLN/USD

    // Opportunity costs
    revenuePerHourPLN: 300,          // Potential billable rate
    opportunityCostFactor: 0.3,      // 30% of time could be revenue-generating

    // Automation
    automationCostPerNode: 5000,     // 5000 PLN implementation cost
    automationMaintenanceMonthly: 200, // 200 PLN/month maintenance

    // Risk
    errorCostAverage: 500,           // 500 PLN average error cost
    trainingCostPerEmployee: 2000,   // 2000 PLN training for complex processes
};

// ============================================
// NODE METRICS INTERFACE
// ============================================

interface NodeMetrics {
    // Time
    timeMinutes?: number;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    occurrencesPerMonth?: number;

    // Complexity & Quality
    complexity?: number;              // 1-10
    errorRate?: number;               // 0-1 (probability of errors)

    // Cost components
    directCostMonthly?: number;       // Direct costs (tools, licenses)
    requiresAI?: boolean;             // Uses AI/API calls
    aiMinutesPerExecution?: number;   // Minutes of AI usage per run

    // Problem indicators
    problemScore?: number;            // 1-10 (frustration, bottleneck)
    employeeCount?: number;           // Number of people involved

    // Automation potential
    automation?: number;              // Current automation level 0-1
    automationPotential?: number;     // Possible automation 0-1
}

// ============================================
// CALCULATED METRICS
// ============================================

interface WorkflowMetrics {
    // === TIME ===
    totalTimeMinutes: number;
    totalTimeHours: number;
    monthlyTimeHours: number;         // Time spent per month

    // === COSTS (detailed breakdown) ===
    costs: {
        laborMonthly: number;           // Employee time cost
        overheadMonthly: number;        // Overhead costs
        aiTokensMonthly: number;        // API/AI costs
        directCostsMonthly: number;     // Tools, licenses
        opportunityCostMonthly: number; // Lost revenue potential
        errorCostMonthly: number;       // Cost of errors/rework
        totalMonthly: number;           // Sum of all costs
        totalYearly: number;
    };

    // === COMPLEXITY ===
    avgComplexity: number;
    maxComplexity: number;
    complexityDistribution: { low: number; medium: number; high: number };

    // === PROBLEM ANALYSIS ===
    avgProblemScore: number;
    totalErrorRisk: number;           // Combined error probability
    bottleneckNodes: number;          // Nodes with problemScore > 7

    // === EFFICIENCY SCORES ===
    efficiencyScore: number;          // 0-1
    reliabilityScore: number;         // 0-1 (inverse of error rate)

    // === ROI ANALYSIS ===
    roi: {
        automationCost: number;         // One-time cost to automate
        monthlySavings: number;         // Monthly savings after automation
        paybackMonths: number;          // Months to break even
        yearlyROI: number;              // % return first year
        roiPotential: number;           // 0-1 score
    };

    // === AUTOMATION ===
    automationLevel: number;          // Current 0-1
    automationPotential: number;      // Possible 0-1
    automationGap: number;            // Potential - Current

    // === NODE COUNTS ===
    nodeCount: number;
    nodesWithMetrics: number;
    processCount: number;
    sopCount: number;
    agentCount: number;
    decisionCount: number;
    handoffCount: number;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useWorkflowMetrics(
    nodes: Node[],
    customParams: Partial<CostParameters> = {}
): WorkflowMetrics {
    const params = { ...DEFAULT_PARAMS, ...customParams };

    return useMemo(() => {
        // Aggregators
        let totalTime = 0;
        let monthlyTime = 0;
        let totalComplexity = 0;
        let maxComplexity = 0;
        let totalProblem = 0;
        let totalAutomation = 0;
        let totalAutomationPotential = 0;
        let totalErrorRisk = 0;
        let nodesWithMetrics = 0;
        let directCosts = 0;
        let aiMinutes = 0;
        let bottleneckNodes = 0;
        let totalEmployees = 0;

        const complexityDist = { low: 0, medium: 0, high: 0 };
        const counts = { process: 0, sop: 0, agent: 0, decision: 0, handoff: 0 };

        // Process each node
        nodes.forEach(node => {
            const type = node.type as keyof typeof counts;
            if (type && type in counts) counts[type]++;

            const m = node.data as NodeMetrics;

            // Time calculations
            if (m.timeMinutes !== undefined) {
                totalTime += m.timeMinutes;
                const occurrences = m.occurrencesPerMonth || 20; // Default: daily (20 working days)
                monthlyTime += m.timeMinutes * occurrences;
                nodesWithMetrics++;
            }

            // Complexity
            if (m.complexity !== undefined) {
                totalComplexity += m.complexity;
                maxComplexity = Math.max(maxComplexity, m.complexity);
                if (m.complexity <= 3) complexityDist.low++;
                else if (m.complexity <= 6) complexityDist.medium++;
                else complexityDist.high++;
            }

            // Problem score
            if (m.problemScore !== undefined) {
                totalProblem += m.problemScore;
                if (m.problemScore > 7) bottleneckNodes++;
            }

            // Error rate
            if (m.errorRate !== undefined) {
                totalErrorRisk += m.errorRate;
            }

            // Direct costs
            if (m.directCostMonthly !== undefined) {
                directCosts += m.directCostMonthly;
            }

            // AI usage
            if (m.requiresAI && m.aiMinutesPerExecution !== undefined) {
                const occurrences = m.occurrencesPerMonth || 20;
                aiMinutes += m.aiMinutesPerExecution * occurrences;
            }

            // Employee count
            if (m.employeeCount !== undefined) {
                totalEmployees += m.employeeCount;
            }

            // Automation levels
            if (m.automation !== undefined) {
                totalAutomation += m.automation;
            }
            if (m.automationPotential !== undefined) {
                totalAutomationPotential += m.automationPotential;
            } else if (node.type === 'process') {
                // Default automation potential for processes
                totalAutomationPotential += 0.6;
            }
        });

        const nodeCount = nodes.length;
        const hasMetrics = nodesWithMetrics > 0;

        // === AVERAGES ===
        const avgComplexity = hasMetrics ? totalComplexity / nodesWithMetrics : 0;
        const avgProblemScore = hasMetrics ? totalProblem / nodesWithMetrics : 0;
        const avgAutomation = counts.process > 0 ? totalAutomation / counts.process : 0;
        const avgAutomationPotential = counts.process > 0 ? totalAutomationPotential / counts.process : 0;

        // === MONTHLY TIME ===
        const monthlyTimeHours = monthlyTime / 60;

        // === COST CALCULATIONS ===
        const laborCost = monthlyTimeHours * params.hourlyRatePLN;
        const overheadCost = laborCost * (params.overheadMultiplier - 1);
        const aiTokensCost = (aiMinutes * params.tokensPerMinute / 1000) * params.costPer1kTokens;
        const opportunityCost = monthlyTimeHours * params.revenuePerHourPLN * params.opportunityCostFactor;
        const errorCost = totalErrorRisk * params.errorCostAverage * 20; // 20 working days
        const totalMonthlyCost = laborCost + overheadCost + aiTokensCost + directCosts + opportunityCost + errorCost;

        // === EFFICIENCY SCORE ===
        // Based on: low problems, low complexity, high reliability
        const problemFactor = (10 - avgProblemScore) / 10;
        const complexityFactor = (10 - avgComplexity) / 10;
        const reliabilityFactor = 1 - (totalErrorRisk / Math.max(1, nodeCount));
        const efficiencyScore = (problemFactor * 0.4 + complexityFactor * 0.3 + reliabilityFactor * 0.3);

        // === ROI CALCULATIONS ===
        const automationCost = nodeCount * params.automationCostPerNode;
        const potentialSavings = totalMonthlyCost * avgAutomationPotential * 0.7; // 70% of costs recoverable
        const maintenanceCost = nodeCount * params.automationMaintenanceMonthly;
        const netMonthlySavings = potentialSavings - maintenanceCost;
        const paybackMonths = netMonthlySavings > 0 ? automationCost / netMonthlySavings : 999;
        const yearlyROI = netMonthlySavings > 0 ? ((netMonthlySavings * 12 - automationCost) / automationCost) * 100 : 0;
        const roiPotential = Math.min(1, Math.max(0, yearlyROI / 100));

        return {
            totalTimeMinutes: totalTime,
            totalTimeHours: Math.round((totalTime / 60) * 10) / 10,
            monthlyTimeHours: Math.round(monthlyTimeHours * 10) / 10,

            costs: {
                laborMonthly: Math.round(laborCost),
                overheadMonthly: Math.round(overheadCost),
                aiTokensMonthly: Math.round(aiTokensCost),
                directCostsMonthly: Math.round(directCosts),
                opportunityCostMonthly: Math.round(opportunityCost),
                errorCostMonthly: Math.round(errorCost),
                totalMonthly: Math.round(totalMonthlyCost),
                totalYearly: Math.round(totalMonthlyCost * 12),
            },

            avgComplexity: Math.round(avgComplexity * 10) / 10,
            maxComplexity,
            complexityDistribution: complexityDist,

            avgProblemScore: Math.round(avgProblemScore * 10) / 10,
            totalErrorRisk: Math.round(totalErrorRisk * 100) / 100,
            bottleneckNodes,

            efficiencyScore: Math.round(efficiencyScore * 100) / 100,
            reliabilityScore: Math.round((1 - totalErrorRisk / Math.max(1, nodeCount)) * 100) / 100,

            roi: {
                automationCost: Math.round(automationCost),
                monthlySavings: Math.round(netMonthlySavings),
                paybackMonths: Math.round(paybackMonths * 10) / 10,
                yearlyROI: Math.round(yearlyROI),
                roiPotential: Math.round(roiPotential * 100) / 100,
            },

            automationLevel: Math.round(avgAutomation * 100) / 100,
            automationPotential: Math.round(avgAutomationPotential * 100) / 100,
            automationGap: Math.round((avgAutomationPotential - avgAutomation) * 100) / 100,

            nodeCount,
            nodesWithMetrics,
            processCount: counts.process,
            sopCount: counts.sop,
            agentCount: counts.agent,
            decisionCount: counts.decision,
            handoffCount: counts.handoff,
        };
    }, [nodes, params]);
}

// Export types for use elsewhere
export type { CostParameters, NodeMetrics, WorkflowMetrics };
export { DEFAULT_PARAMS };
