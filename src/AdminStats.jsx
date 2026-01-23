import React, { useMemo } from 'react';
import { BarChart3, PieChart, Activity, TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const AdminStats = ({ reports }) => {
    const stats = useMemo(() => {
        const total = reports.length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const pending = reports.filter(r => r.status === 'pending').length;
        const inProgress = reports.filter(r => r.status === 'in-progress').length;

        // Category breakdown
        const categories = reports.reduce((acc, curr) => {
            const cat = curr.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            resolved,
            pending,
            inProgress,
            categories,
            resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
        };
    }, [reports]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
            {/* 1. Main Overview Card */}
            <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <BarChart3 size={20} />
                        <span className="font-bold text-xs uppercase tracking-widest">Total Reports</span>
                    </div>
                    <div className="text-5xl font-black mb-2">{stats.total}</div>
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                        <TrendingUp size={16} />
                        <span>{stats.resolutionRate}% Resolution Rate</span>
                    </div>
                </div>
            </div>

            {/* 2. Status Breakdown */}
            <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-6 text-slate-500">
                    <PieChart size={20} />
                    <span className="font-bold text-xs uppercase tracking-widest">Status Overview</span>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="font-bold text-sm text-slate-700">Resolved</span>
                        </div>
                        <span className="font-black text-slate-900">{stats.resolved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                                <AlertCircle size={16} />
                            </div>
                            <span className="font-bold text-sm text-slate-700">Pending</span>
                        </div>
                        <span className="font-black text-slate-900">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                <Clock size={16} />
                            </div>
                            <span className="font-bold text-sm text-slate-700">In Progress</span>
                        </div>
                        <span className="font-black text-slate-900">{stats.inProgress}</span>
                    </div>
                </div>
            </div>

            {/* 3. Category Distribution */}
            <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-6 text-slate-500">
                    <TrendingUp size={20} />
                    <span className="font-bold text-xs uppercase tracking-widest">Categories</span>
                </div>
                <div className="space-y-3">
                    {Object.entries(stats.categories).map(([cat, count]) => (
                        <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold px-1">
                                <span className="text-slate-600">{cat}</span>
                                <span className="text-slate-900">{count}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${(count / stats.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
