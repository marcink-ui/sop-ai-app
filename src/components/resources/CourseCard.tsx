'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Target, Crown, ExternalLink } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    duration: number;
    level: string;
    externalUrl: string | null;
}

interface CourseCardProps {
    course: Course;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; icon: typeof Target }> = {
    BEGINNER: { label: 'Początkujący', color: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400', icon: Target },
    INTERMEDIATE: { label: 'Średnio-zaaw.', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400', icon: BookOpen },
    ADVANCED: { label: 'Zaawansowany', color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400', icon: Crown },
};

export function CourseCard({ course }: CourseCardProps) {
    const level = LEVEL_CONFIG[course.level] || LEVEL_CONFIG.BEGINNER;

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const handleClick = () => {
        if (course.externalUrl) {
            window.open(course.externalUrl, '_blank');
        }
    };

    return (
        <Card
            className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
            onClick={handleClick}
        >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-violet-500 to-purple-600 relative overflow-hidden">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white/50" />
                    </div>
                )}
                {course.externalUrl && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                        <ExternalLink className="h-3 w-3 text-white" />
                    </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(course.duration)}
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.description}
                </p>
                <Badge className={level.color}>
                    {level.label}
                </Badge>
            </CardContent>
        </Card>
    );
}
