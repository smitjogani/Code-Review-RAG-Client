import React, { useEffect, useState } from 'react';
import { ArrowRight, Terminal, Search, Shield, Cpu, Activity, Database, GitBranch, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const GridCell = () => {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        // Random pulse effect to simulate data activity
        const interval = setInterval(() => {
            setPulse(Math.random() > 0.95);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={cn(
                "iso-cell w-full h-full border border-zinc-200/50 bg-white/5",
                pulse && "animate-[dataPulse_4s_infinite]"
            )}
        ></div>
    );
};

const LandingPage = () => {
    return (
        <div className="relative min-h-screen bg-zinc-100 text-zinc-950 font-body selection:bg-brand-red selection:text-white overflow-x-hidden">

            {/* Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-999 bg-noise opacity-[0.03] mix-blend-overlay"></div>

            {/* Navigation */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
                <div className="glass border border-zinc-200 flex items-center justify-between p-3 shadow-sm rounded-sm">
                    <Link to="/" className="flex items-center gap-3 pl-4 pr-6 border-r border-zinc-200">
                        <img src="/favicon.svg" alt="Oravia" className="w-6 h-6" />
                        <span className="font-display font-bold tracking-tight text-lg text-obsidian">ORAVIA</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-0 h-full">
                        {[
                            { name: 'Intelligence', id: 'intelligence' },
                            { name: 'Methodology', id: 'methodology' }
                        ].map((item, i) => (
                            <React.Fragment key={i}>
                                <a href={`#${item.id}`} className="group relative px-6 py-2 block font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors">
                                    <span className="absolute inset-0 bg-zinc-200 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 -z-10"></span>
                                    {item.name}
                                </a>
                                {i < 1 && <div className="w-px h-4 bg-zinc-200"></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    <Link to="/chat" state={{ showUploadModal: true }} className="bg-zinc-950 text-white px-5 py-2 text-xs font-mono uppercase tracking-wide hover:bg-brand-red transition-colors duration-200">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="intelligence" className="relative min-h-[90vh] flex flex-col md:flex-row items-center justify-between pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto overflow-hidden">

                <div className="w-full md:w-3/5 z-10 flex flex-col gap-8 md:pr-12">
                    <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand-emerald animate-pulse"></span>
                        // ARCHITECTURAL INTELLIGENCE V.2.4
                    </div>

                    <h1 className="text-hero font-display font-semibold leading-[0.9] tracking-tight text-zinc-950">
                        AUDIT THE CODE<br />
                        <span className="text-zinc-400">NOT JUST THE SYMPTOMS.</span>
                    </h1>

                    <p className="font-body text-base md:text-lg text-zinc-500 max-w-xl leading-relaxed">
                        ORAVIA leverages RAG and Gemini 1.5 to decode complex architectural lineage. Identify structural risks and technical debt with precision.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
                        <Link to="/chat" state={{ showUploadModal: true }} className="group flex items-center gap-3 bg-zinc-950 text-white pl-6 pr-4 py-4 hover:bg-obsidian transition-colors duration-300 shadow-lg shadow-zinc-950/20">
                            <span className="font-mono text-sm uppercase tracking-wide">Initialize Audit</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Isometric Visual */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full md:w-[50%] h-[600px] md:h-[800px] opacity-20 md:opacity-100 pointer-events-none md:pointer-events-auto overflow-visible z-0 flex items-center justify-center perspective-distant">
                    <div className="iso-container w-[300px] h-[300px] md:w-[500px] md:h-[500px] grid grid-cols-10 gap-1 p-4 border border-zinc-200 bg-white/10 backdrop-blur-sm shadow-xl scale-75 md:scale-100">
                        {Array.from({ length: 100 }).map((_, i) => (
                            <GridCell key={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Marquee */}
            <section className="border-y border-zinc-200 bg-white py-4 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 bg-white z-20 px-4 flex items-center border-r border-zinc-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] sm:relative sm:border-r-0 sm:shadow-none sm:mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">INTEGRATIONS:</span>
                </div>

                <div className="marquee-container w-full">
                    <div className="marquee-content flex gap-8 md:gap-12 items-center pl-8">
                        {[
                            { name: "REACTION", meta: "optimized 2.4s", color: "text-brand-emerald bg-brand-emerald/10" },
                            { name: "NEXTJS", meta: "LCP: -15%", color: "text-brand-blue bg-brand-blue/10" },
                            { name: "PYTHON", meta: "Analysis: FAST", color: "text-zinc-500 bg-zinc-100" },
                            { name: "JAVA", meta: "Status: Linked", color: "text-brand-emerald bg-brand-emerald/10" },
                            { name: "DOTNET", meta: "Risk: Low", color: "text-brand-red bg-brand-red/10" },
                            { name: "GO", meta: "Gophered", color: "text-brand-blue bg-brand-blue/10" },
                            // Repeat for infinite scroll
                            { name: "BLACKSTONE", meta: "deployed $40M", color: "text-brand-emerald bg-brand-emerald/10" },
                            { name: "VANGUARD", meta: "Assets: +12%", color: "text-brand-blue bg-brand-blue/10" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="font-display font-semibold text-lg tracking-tight">{item.name}</span>
                                <span className={cn("font-mono text-[10px] px-1 py-0.5 rounded-sm", item.color)}>[{item.meta}]</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid ("Structural Alpha") */}
            <section id="methodology" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="mb-12 flex items-baseline justify-between border-b border-zinc-200 pb-4">
                    <h2 className="text-section font-display font-medium tracking-tight text-zinc-950">ARCHITECTURAL AUDIT</h2>
                    <span className="font-mono text-xs text-zinc-400 hidden sm:block">SYSTEM_ANALYSIS_V.01</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
                    {/* Large Feature */}
                    <div className="md:col-span-2 lg:row-span-2 bg-white p-6 sm:p-8 md:p-12 group relative overflow-hidden flex flex-col justify-between min-h-[350px] md:min-h-[450px] border border-transparent hover:border-zinc-200 transition-all duration-500 hover:shadow-2xl hover:bg-zinc-50/50">
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-b from-brand-emerald/20 to-transparent -translate-y-full group-hover:translate-y-[450px] transition-transform duration-[2.5s] ease-in-out z-10 opacity-0 group-hover:opacity-100"></div>
                        <div className="absolute inset-x-0 top-0 h-px bg-brand-emerald opacity-0 group-hover:opacity-100 -translate-y-full group-hover:translate-y-[450px] transition-transform duration-[2.5s] ease-in-out z-20"></div>

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <Cpu className="w-8 h-8 text-zinc-300 group-hover:text-brand-emerald transition-colors duration-300" strokeWidth={1.5} />
                                <span className="font-mono text-[10px] text-zinc-400">01</span>
                            </div>
                            <h3 className="font-mono text-xs sm:text-sm uppercase tracking-wider mb-4 group-hover:text-brand-emerald transition-colors font-bold">Lineage Tracing</h3>
                            <p className="font-display text-xl sm:text-2xl md:text-3xl text-zinc-800 leading-tight tracking-tight">Map the entire decision graph of your codebase. Understand why patterns exist before refactoring them.</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-wrap gap-4 font-mono text-[9px] md:text-[10px] text-zinc-400">
                            <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-brand-emerald"></div> RAG_ENGINE: GEMINI 2.0</span>
                            <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-zinc-300"></div> STATUS: READY</span>
                        </div>
                    </div>

                    {/* Sub Feature 1 */}
                    <div className="bg-white p-6 sm:p-8 group relative overflow-hidden h-64 border border-transparent hover:border-zinc-200 transition-all duration-500 hover:shadow-xl hover:bg-zinc-50/50">
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-b from-brand-blue/20 to-transparent -translate-y-full group-hover:translate-y-64 transition-transform duration-[1.5s] ease-in-out z-10 opacity-0 group-hover:opacity-100"></div>
                        <div className="absolute inset-x-0 top-0 h-px bg-brand-blue opacity-0 group-hover:opacity-100 -translate-y-full group-hover:translate-y-64 transition-transform duration-[1.5s] ease-in-out z-20"></div>
                        <div className="flex justify-between items-start mb-4">
                            <Layers className="w-6 h-6 text-zinc-300 group-hover:text-brand-blue transition-colors" strokeWidth={1.5} />
                            <span className="font-mono text-[10px] text-zinc-400">02</span>
                        </div>
                        <h3 className="font-mono text-xs sm:text-sm uppercase tracking-wider mb-2 group-hover:text-brand-blue transition-colors font-bold">Context Clusters</h3>
                        <p className="font-body text-xs sm:text-sm text-zinc-500 leading-relaxed">Vectorized code chunks mapped by semantic relevance, ensuring audit accuracy across modules.</p>
                    </div>

                    {/* Sub Feature 2 */}
                    <div className="bg-white p-6 sm:p-8 group relative overflow-hidden h-64 border border-transparent hover:border-zinc-200 transition-all duration-500 hover:shadow-xl hover:bg-zinc-50/50">
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-b from-brand-red/20 to-transparent -translate-y-full group-hover:translate-y-64 transition-transform duration-[1.5s] ease-in-out z-10 opacity-0 group-hover:opacity-100"></div>
                        <div className="absolute inset-x-0 top-0 h-px bg-brand-red opacity-0 group-hover:opacity-100 -translate-y-full group-hover:translate-y-64 transition-transform duration-[1.5s] ease-in-out z-20"></div>
                        <div className="flex justify-between items-start mb-4">
                            <Activity className="w-6 h-6 text-zinc-300 group-hover:text-brand-red transition-colors" strokeWidth={1.5} />
                            <span className="font-mono text-[10px] text-zinc-400">03</span>
                        </div>
                        <h3 className="font-mono text-xs sm:text-sm uppercase tracking-wider mb-2 group-hover:text-brand-red transition-colors font-bold">Risk Velocity</h3>
                        <p className="font-body text-xs sm:text-sm text-zinc-500 leading-relaxed">Identify high-complexity code spikes in real-time, focusing your review on mission-critical paths.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-100 border-t border-zinc-200 pt-20 pb-0 relative overflow-hidden">
                <div className="px-6 md:px-12 max-w-[1600px] mx-auto border-t border-zinc-200 py-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 w-full">
                    <p className="font-mono text-[10px] text-zinc-400 uppercase">© 2026 Smit Jogani. All rights reserved.</p>
                    <p className="font-mono text-[10px] text-zinc-400 uppercase">Data accuracy subject to carrier latency.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
