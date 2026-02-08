'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, ListTodo, BookOpen, AlertCircle, CheckCheck, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Notification {
    id: string;
    type: 'task' | 'knowledge' | 'alert' | 'panda';
    title: string;
    description: string;
    time: string;
    read: boolean;
    link?: string;
}

const ITEMS_PER_PAGE = 5;

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                const data = await res.json();
                setNotifications(data.notifications || []);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'task': return <ListTodo className="h-5 w-5 text-blue-500" />;
            case 'knowledge': return <BookOpen className="h-5 w-5 text-emerald-500" />;
            case 'alert': return <AlertCircle className="h-5 w-5 text-amber-500" />;
            case 'panda': return <span className="text-lg">🐼</span>;
            default: return <Bell className="h-5 w-5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'task': return 'Zadanie';
            case 'knowledge': return 'Wiedza';
            case 'alert': return 'Alert';
            case 'panda': return 'Panda';
            default: return 'Inne';
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const visibleNotifications = filteredNotifications.slice(0, visibleCount);
    const hasMore = visibleCount < filteredNotifications.length;
    const unreadCount = notifications.filter(n => !n.read).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-pulse text-muted-foreground">Ładowanie powiadomień...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        Powiadomienia
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Zarządzaj powiadomieniami i zostań na bieżąco
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        onClick={markAllAsRead}
                        className="gap-2"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Oznacz wszystkie jako przeczytane
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="text-2xl font-bold">{notifications.length}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Wszystkie</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-red-500 rounded-full" />
                            <span className="text-2xl font-bold">{unreadCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Nieprzeczytane</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4 text-blue-500" />
                            <span className="text-2xl font-bold">
                                {notifications.filter(n => n.type === 'task').length}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Zadania</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-emerald-500" />
                            <span className="text-2xl font-bold">
                                {notifications.filter(n => n.type === 'knowledge').length}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Aktualizacje</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs & List */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Lista powiadomień</CardTitle>
                        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
                            <TabsList className="h-8">
                                <TabsTrigger value="all" className="text-xs">Wszystkie</TabsTrigger>
                                <TabsTrigger value="unread" className="text-xs">
                                    Nieprzeczytane {unreadCount > 0 && `(${unreadCount})`}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Brak powiadomień</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {visibleNotifications.map((notification, index) => {
                                    const notificationContent = (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.05, duration: 0.2 }}
                                            className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${!notification.read
                                                ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                                                : 'bg-muted/30 border-transparent hover:border-border hover:bg-muted/50'
                                                }`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="mt-0.5 p-2 rounded-full bg-background shadow-sm">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <span className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {notification.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {getTypeLabel(notification.type)}
                                                    </Badge>
                                                    <span>{notification.time}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );

                                    // Wrap in Link if notification has a link — entire row is clickable
                                    if (notification.link) {
                                        return (
                                            <Link key={notification.id} href={notification.link} className="block">
                                                {notificationContent}
                                            </Link>
                                        );
                                    }

                                    return notificationContent;
                                })}
                            </AnimatePresence>

                            {/* "Zobacz więcej" pagination button */}
                            {hasMore && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="pt-4 text-center"
                                >
                                    <Button
                                        variant="outline"
                                        onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                                        className="gap-2"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                        Zobacz więcej ({filteredNotifications.length - visibleCount} pozostało)
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
