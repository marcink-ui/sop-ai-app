'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapPoint {
    x: number;
    y: number;
    intensity?: number;
}

interface HeatmapViewerProps {
    points: HeatmapPoint[];
    width?: number;
    height?: number;
    radius?: number;
    maxIntensity?: number;
    className?: string;
}

export function HeatmapViewer({
    points,
    width = 800,
    height = 600,
    radius = 40,
    maxIntensity = 10,
    className = '',
}: HeatmapViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Aggregate points to calculate intensity
    const aggregatedPoints = useMemo(() => {
        const grid: Map<string, { x: number; y: number; count: number }> = new Map();
        const cellSize = radius / 2;

        points.forEach(point => {
            const gridX = Math.floor(point.x / cellSize);
            const gridY = Math.floor(point.y / cellSize);
            const key = `${gridX}-${gridY}`;

            if (grid.has(key)) {
                const existing = grid.get(key)!;
                existing.count++;
            } else {
                grid.set(key, { x: point.x, y: point.y, count: 1 });
            }
        });

        return Array.from(grid.values());
    }, [points, radius]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw heatmap points
        aggregatedPoints.forEach(point => {
            const intensity = Math.min(point.count / maxIntensity, 1);

            // Create radial gradient for each point
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, radius
            );

            // Color based on intensity (green -> yellow -> red)
            const r = Math.round(255 * Math.min(intensity * 2, 1));
            const g = Math.round(255 * (1 - Math.max(0, (intensity - 0.5) * 2)));
            const alpha = 0.3 + intensity * 0.5;

            gradient.addColorStop(0, `rgba(${r}, ${g}, 0, ${alpha})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
        });
    }, [aggregatedPoints, width, height, radius, maxIntensity]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`relative ${className}`}
        >
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="rounded-lg border border-border/50 bg-muted/20"
            />

            {/* Legend */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <span className="text-xs text-muted-foreground">Mniej</span>
                <div className="w-24 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                <span className="text-xs text-muted-foreground">Więcej</span>
            </div>

            {/* Stats */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <div className="text-sm font-medium">{points.length} kliknięć</div>
                <div className="text-xs text-muted-foreground">{aggregatedPoints.length} hotspotów</div>
            </div>
        </motion.div>
    );
}
