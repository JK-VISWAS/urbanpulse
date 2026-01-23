import React from 'react';
import { Trash2, MapPin, Clock, ArrowUpRight, CheckCircle2, AlertCircle, Play } from 'lucide-react';

const ReportCard = ({ report, isAdmin, onDelete, onToggle }) => {
    // Format the Firebase timestamp into a readable string
    const formattedDate = report.createdAt?.toDate
        ? report.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Just now';

    return (
        <div className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full">

            {/* 1. IMAGE DISPLAY WITH STATUS OVERLAY */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {report.imageUrl ? (
                    <img
                        src={report.imageUrl}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        alt={report.title}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <MapPin size={40} strokeWidth={1} />
                    </div>
                )}

                {/* Category Badge Overlaid on Image */}
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.1em] shadow-sm">
                        {report.category || 'General'}
                    </span>
                </div>
            </div>

            {/* 2. CARD CONTENT */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3 gap-2">
                    <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                        {report.title}
                    </h4>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${report.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {report.status === 'Resolved' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {report.status || 'Pending'}
                    </div>
                </div>

                <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                    {report.description}
                </p>

                {/* Audio Message Player */}
                {report.audioUrl && (
                    <div className="mb-6 p-3 bg-indigo-50 rounded-2xl flex items-center gap-3 border border-indigo-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Play size={16} fill="currentColor" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase text-indigo-500 block mb-1">Voice Message</span>
                            <audio controls src={report.audioUrl} className="w-full h-8" />
                        </div>
                    </div>
                )}

                {/* 3. METADATA FOOTER */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span className="text-[11px] font-bold">{formattedDate}</span>
                        </div>
                        {report.location && (
                            <div className="flex items-center gap-1 max-w-[120px] sm:max-w-[150px]">
                                <MapPin size={14} className="text-indigo-400 flex-shrink-0" />
                                <span className="text-[11px] font-bold truncate" title={report.address || `Lvl. ${Math.round(report.location.lat)}`}>
                                    {report.address || `Lvl. ${Math.round(report.location.lat)}`}
                                </span>
                            </div>
                        )}
                    </div>
                    <button className="text-indigo-500 hover:text-indigo-700 transition-colors">
                        <ArrowUpRight size={18} />
                    </button>
                </div>

                {/* 4. ADMIN CONTROL PANEL */}
                {isAdmin && (
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => onToggle(report.id, report.status)}
                            className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${report.status === 'Resolved'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                                }`}
                        >
                            {report.status === 'Resolved' ? 'Re-open Case' : 'Resolve Issue'}
                        </button>
                        <button
                            onClick={() => onDelete(report.id)}
                            className="bg-rose-50 text-rose-500 p-3 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300"
                            title="Delete Report"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCard;