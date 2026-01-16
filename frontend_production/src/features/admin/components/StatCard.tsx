import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
    trend?: string;
    description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, description }) => {
    const iconColors = {
        blue: 'text-cyan-600 bg-slate-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700',
        green: 'text-emerald-600 bg-slate-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700',
        yellow: 'text-amber-600 bg-slate-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700',
        purple: 'text-violet-600 bg-slate-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700',
        red: 'text-red-600 bg-slate-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700',
    };

    const isPositive = trend?.startsWith('+') || trend?.includes('nouveau');

    return (
        <Card className="group flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-xl shadow-navy-darker/5 border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-card-dark dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0">
                <div className="space-y-1">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-slate-400">
                        {title}
                    </CardTitle>
                    <p className="text-3xl font-black tracking-tight text-navy-deep dark:text-white">
                        {value}
                    </p>
                </div>
                <div className={cn("rounded-2xl p-4 border transition-transform group-hover:scale-110", iconColors[color])}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {(trend || description) && (
                    <div className="flex items-center gap-2">
                        {trend && (
                            <span className={cn(
                                "flex items-center text-sm font-bold",
                                isPositive ? "text-emerald-500" : "text-text-muted dark:text-slate-400"
                            )}>
                                {isPositive && <TrendingUp className="mr-0.5 h-4 w-4" />}
                                {trend}
                            </span>
                        )}
                        <span className="text-sm font-medium text-text-muted dark:text-slate-500">
                            {description || 'depuis le mois dernier'}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;