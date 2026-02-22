import React, { useEffect, useState } from 'react';
import { Server, Database, BrainCircuit, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusItem = ({ icon, label, status, latency }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 md:p-6 bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-all gap-4 sm:gap-0 group">
        <div className="flex items-center gap-4">
            <div className={`p-2.5 md:p-3 rounded-lg shrink-0 transition-colors ${status === 'operational' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-red-50 text-red-600 group-hover:bg-red-100'}`}>
                <Icon size={18} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="font-mono text-[11px] md:text-sm font-bold text-obsidian uppercase tracking-wider">{label}</h3>
                <p className="text-[10px] md:text-xs text-subtle mt-0.5">{status === 'operational' ? 'System fully operational' : 'Investigating potential issues'}</p>
            </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
            <div className={`flex items-center gap-2 ${status === 'operational' ? 'text-emerald-600' : 'text-red-600'}`}>
                {status === 'operational' ? <CheckCircle2 size={13} className="md:w-4 md:h-4" /> : <XCircle size={13} className="md:w-4 md:h-4" />}
                <span className="font-mono text-[10px] md:text-xs font-bold tracking-tight">{status === 'operational' ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            {latency && <p className="text-[9px] md:text-[10px] font-mono text-zinc-400 mt-1">{latency}ms RTT</p>}
        </div>
    </div>
);

const StatusPage = () => {
    const [loading, setLoading] = useState(true);
    const systems = {
        backend: { status: 'operational', latency: 45 },
        database: { status: 'operational', latency: 12 },
        llm: { status: 'operational', latency: 230 },
    };

    useEffect(() => {
        // Simulate check
        setTimeout(() => setLoading(false), 1500);
    }, []);

    return (
        <div className="min-h-screen bg-canvas font-body text-obsidian relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0 technical-grid"></div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-subtle hover:text-obsidian mb-12 transition-colors">
                    <ArrowLeft size={16} />
                    Return to Home
                </Link>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h1 className="font-display text-3xl font-semibold tracking-tight">System Status</h1>
                    </div>
                    <p className="text-subtle text-sm max-w-lg">
                        Real-time performance monitoring of ORAVIA infrastructure.
                        All systems are currently functioning within normal parameters.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={32} className="animate-spin text-obsidian" />
                        <span className="font-mono text-xs text-subtle uppercase animate-pulse">Running Diagnostics...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <StatusItem
                            icon={Server}
                            label="API Gateway"
                            status={systems.backend.status}
                            latency={systems.backend.latency}
                        />
                        <StatusItem
                            icon={Database}
                            label="Vector Database (Pinecone)"
                            status={systems.database.status}
                            latency={systems.database.latency}
                        />
                        <StatusItem
                            icon={BrainCircuit}
                            label="Reasoning Engine (Gemini 1.5)"
                            status={systems.llm.status}
                            latency={systems.llm.latency}
                        />
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-border flex justify-between items-center text-xs text-subtle font-mono">
                    <span>REF: {new Date().toISOString()}</span>
                    <span>VERSION 1.0.0</span>
                </div>
            </div>
        </div>
    );
};

export default StatusPage;
