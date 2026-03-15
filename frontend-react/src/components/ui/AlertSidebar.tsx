import React from 'react';
import { Bell, Info, Clock, MapPin, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: number | string;
    source: string;
    timestamp?: string;
    lat?: number;
    lon?: number;
    affectedPopulation?: number;
    sourceUrl?: string;
}

interface AlertSidebarProps {
    alerts: Alert[];
    onAlertClick?: (alert: Alert) => void;
    open?: boolean;
    kpis?: {
        criticalAlerts: number;
        activeTeams: number;
        missingPersons: number;
    };
}

export const AlertSidebar: React.FC<AlertSidebarProps> = ({ alerts, onAlertClick, open = true, kpis }) => {
    if (!open) return null;

    const getSeverityStyles = (severity: number | string) => {
        const s = typeof severity === 'string' ? parseInt(severity) : severity;
        const lowerSeverity = severity.toString().toLowerCase();

        if (s >= 4 || lowerSeverity === 'perigo' || lowerSeverity === 'critical' || lowerSeverity === 'extremo') {
            return 'border-l-red-500 bg-red-500/5 text-red-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]';
        }
        if (s >= 2 || lowerSeverity === 'atenção' || lowerSeverity === 'high' || lowerSeverity === 'warning') {
            return 'border-l-amber-500 bg-amber-500/5 text-amber-200 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]';
        }
        return 'border-l-cyan-500 bg-cyan-500/5 text-cyan-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]';
    };

    return (
        <div className="absolute top-28 left-6 bottom-6 w-[340px] glass-panel z-40 flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-panel bg-mesh">
            <div className="px-8 py-7 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                        <Bell size={18} className="animate-glow rounded-full" />
                    </div>
                    <h2 className="text-[12px] font-black text-white uppercase tracking-[0.3em] font-display">Command Feed</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 animate-pulse">
                    {alerts.length} LIVE
                </div>
            </div>

            {kpis && (
                <div className="grid grid-cols-3 gap-3 p-5 border-b border-white/10 bg-white/2">
                    {[
                        { val: kpis.criticalAlerts, label: 'Alertas', color: 'text-red-400', bg: 'bg-red-500/5', bdr: 'border-red-500/10' },
                        { val: kpis.activeTeams, label: 'Equipes', color: 'text-cyan-400', bg: 'bg-cyan-500/5', bdr: 'border-cyan-500/10' },
                        { val: kpis.missingPersons, label: 'Buscas', color: 'text-orange-400', bg: 'bg-orange-500/5', bdr: 'border-orange-500/10' }
                    ].map((kpiItem, idx) => (
                        <div key={idx} className={`flex flex-col items-center p-3 rounded-2xl ${kpiItem.bg} border ${kpiItem.bdr} hover:bg-white/5 transition-colors duration-300`}>
                            <span className={`text-sm font-black ${kpiItem.color}`}>{kpiItem.val}</span>
                            <span className="text-[8px] uppercase font-bold opacity-40 tracking-widest mt-1">{kpiItem.label}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-30">
                        <Info size={32} strokeWidth={1.5} />
                        <span className="text-[10px] uppercase font-bold tracking-[0.4em]">Silence Protocol</span>
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div
                            key={alert.id}
                            onClick={() => onAlertClick?.(alert)}
                            className={`group p-5 glass-card rounded-2xl border-l-4 transition-all duration-500 cursor-pointer active:scale-[0.98] animate-stagger-1 ${getSeverityStyles(alert.severity)}`}
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5 font-mono">
                                    <Clock size={12} className="text-cyan-500/50" />
                                    {alert.timestamp ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: ptBR }) : 'Instant'}
                                </span>
                                {alert.lat && alert.lon && (
                                    <div className="p-1.5 rounded-lg bg-white/5 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <MapPin size={12} />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-[13px] font-black text-white mb-2 leading-tight group-hover:text-cyan-300 transition-colors font-display">
                                {alert.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4 font-medium opacity-80 group-hover:opacity-100">
                                {alert.description}
                            </p>

                            {alert.affectedPopulation && (
                                <div className="mb-4 px-3 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Est. Population Impact</span>
                                    <span className="text-[10px] font-black text-white">
                                        {alert.affectedPopulation.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full relative ${alert.source === 'INMET' ? 'bg-orange-400' : alert.source === 'CEMADEN' ? 'bg-blue-400' : 'bg-red-400'}`}>
                                        <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-20"></div>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">
                                        {alert.source}
                                    </span>
                                </div>
                                <Activity size={12} className="text-white/10 group-hover:text-cyan-500/40 transition-colors" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-5 bg-white/5 border-t border-white/10 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            Telemetry Link
                        </span>
                        <span className="text-emerald-400 font-mono">OP_SECURE</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-transparent"></div>
                        <div className="h-full bg-linear-to-r from-cyan-400 to-blue-500 w-[92%] shadow-[0_0_15px_rgba(6,182,212,0.5)] relative z-10" />
                    </div>
                </div>
            </div>
        </div>
    );
};
;
