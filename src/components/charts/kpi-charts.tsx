'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar
} from 'recharts';

// Common chart colors
const COLORS = {
    violet: '#8B5CF6',
    purple: '#A855F7',
    cyan: '#06B6D4',
    blue: '#3B82F6',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#F43F5E',
    slate: '#64748B'
};

const GRADIENT_COLORS = [
    COLORS.violet,
    COLORS.cyan,
    COLORS.emerald,
    COLORS.amber,
    COLORS.rose
];

// Custom tooltip styling
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-3 shadow-lg">
                <p className="text-sm font-medium text-foreground mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-semibold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ============================================
// TREND LINE CHART - SOP Growth Over Time
// ============================================
interface TrendLineChartProps {
    data: Array<{ name: string; sops: number; agents: number }>;
    height?: number;
}

export function TrendLineChart({ data, height = 300 }: TrendLineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="sopGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.violet} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.violet} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="agentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor' }}
                />
                <YAxis
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="sops"
                    name="SOPs"
                    stroke={COLORS.violet}
                    strokeWidth={2}
                    fill="url(#sopGradient)"
                />
                <Area
                    type="monotone"
                    dataKey="agents"
                    name="Agenci AI"
                    stroke={COLORS.cyan}
                    strokeWidth={2}
                    fill="url(#agentGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ============================================
// STACKED BAR CHART - MUDA by Department
// ============================================
interface StackedBarChartProps {
    data: Array<{
        department: string;
        transport: number;
        inventory: number;
        motion: number;
        waiting: number;
        overproduction: number;
        overprocessing: number;
        defects: number;
    }>;
    height?: number;
}

export function MudaStackedBarChart({ data, height = 300 }: StackedBarChartProps) {
    const mudaTypes = [
        { key: 'transport', name: 'Transport', color: COLORS.violet },
        { key: 'inventory', name: 'Zapasy', color: COLORS.cyan },
        { key: 'motion', name: 'Ruch', color: COLORS.emerald },
        { key: 'waiting', name: 'Oczekiwanie', color: COLORS.amber },
        { key: 'overproduction', name: 'Nadprodukcja', color: COLORS.rose },
        { key: 'overprocessing', name: 'Nadprzetwarzanie', color: COLORS.blue },
        { key: 'defects', name: 'Defekty', color: COLORS.slate }
    ];

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis
                    dataKey="department"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {mudaTypes.map((muda) => (
                    <Bar
                        key={muda.key}
                        dataKey={muda.key}
                        name={muda.name}
                        stackId="a"
                        fill={muda.color}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}

// ============================================
// RADIAL PROGRESS - Automation Completion
// ============================================
interface RadialProgressProps {
    value: number;
    label: string;
    color?: string;
    size?: number;
}

export function RadialProgress({
    value,
    label,
    color = COLORS.violet,
    size = 200
}: RadialProgressProps) {
    const data = [
        { name: label, value, fill: color }
    ];

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={12}
                    data={data}
                    startAngle={90}
                    endAngle={90 - (360 * value) / 100}
                >
                    <RadialBar
                        background={{ fill: 'hsl(var(--muted))' }}
                        dataKey="value"
                        cornerRadius={10}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{value}%</span>
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
        </div>
    );
}

// ============================================
// DONUT CHART - Distribution
// ============================================
interface DonutChartProps {
    data: Array<{ name: string; value: number }>;
    height?: number;
}

export function DonutChart({ data, height = 250 }: DonutChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

// ============================================
// SIMPLE LINE CHART - Single Metric Trend
// ============================================
interface SimpleLineChartProps {
    data: Array<{ name: string; value: number }>;
    color?: string;
    height?: number;
}

export function SimpleLineChart({
    data,
    color = COLORS.violet,
    height = 100
}: SimpleLineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// ============================================
// KPI STAT CARD with Sparkline
// ============================================
interface KpiStatCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    sparklineData?: Array<{ name: string; value: number }>;
    color?: string;
    icon?: React.ReactNode;
}

export function KpiStatCard({
    title,
    value,
    change,
    changeLabel = 'vs last month',
    sparklineData,
    color = COLORS.violet,
    icon
}: KpiStatCardProps) {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <div className="rounded-xl border border-border bg-card/50 p-5 hover:border-violet-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {icon && (
                        <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${color}20` }}
                        >
                            {icon}
                        </div>
                    )}
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                </div>
                {change !== undefined && (
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPositive
                            ? 'text-emerald-500 bg-emerald-500/10'
                            : isNegative
                                ? 'text-rose-500 bg-rose-500/10'
                                : 'text-muted-foreground bg-muted'
                            }`}
                    >
                        {isPositive ? '+' : ''}{change}%
                    </span>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                    {change !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
                    )}
                </div>

                {sparklineData && (
                    <div className="w-24 h-12 opacity-60 group-hover:opacity-100 transition-opacity">
                        <SimpleLineChart data={sparklineData} color={color} height={48} />
                    </div>
                )}
            </div>
        </div>
    );
}
