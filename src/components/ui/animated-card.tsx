'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type ReactNode, forwardRef } from 'react';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    variant?: 'default' | 'glass' | 'gradient' | 'glow';
    glowColor?: string;
    delay?: number;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
    ({ children, className, variant = 'default', glowColor, delay = 0, ...props }, ref) => {
        const baseStyles = 'relative overflow-hidden rounded-2xl p-6 transition-all duration-300';

        const variants = {
            default: 'border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/80',
            glass: 'border border-white/10 bg-white/5 backdrop-blur-xl dark:bg-black/20',
            gradient: 'border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-blue-50 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/30',
            glow: `border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/80 hover:shadow-[0_0_40px_${glowColor || 'rgba(139,92,246,0.15)'}]`,
        };

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.5,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                }}
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            >
                {/* Gradient overlay on hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
                <div className="relative z-10">{children}</div>
            </motion.div>
        );
    }
);

AnimatedCard.displayName = 'AnimatedCard';

export { AnimatedCard };
