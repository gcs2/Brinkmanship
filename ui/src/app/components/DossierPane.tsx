"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronRight, Clock } from "lucide-react";

interface EventOption {
    id: string;
    label: string;
    description: string;
    lag_time?: number;
}

interface DossierPaneProps {
    event: {
        id: string;
        title: string;
        description: string;
        options: EventOption[];
    } | null;
    onSelectOption: (optionId: string) => void;
    onDismiss: () => void;
}

const DossierPane = ({ event, onSelectOption, onDismiss }: DossierPaneProps) => {
    return (
        <AnimatePresence>
            {event && (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
                    className="fixed top-0 right-0 h-full w-full max-w-lg z-[100] flex flex-col bg-noir-900 border-l border-amber-accent/20 shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
                >
                    {/* Header */}
                    <div className="bg-amber-accent/10 border-b border-amber-accent/20 p-5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-amber-accent" />
                            <h3 className="font-mono text-amber-accent uppercase tracking-[0.2em] text-xs">
                                Priority Dossier // {event.id}
                            </h3>
                        </div>
                        <button
                            onClick={onDismiss}
                            className="text-[10px] font-mono text-slate-500 uppercase hover:text-slate-300 transition-colors"
                        >
                            [Defer]
                        </button>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <h2 className="text-xl font-mono text-[#e0e0e0] mb-3 uppercase tracking-wider">
                            {event.title}
                        </h2>
                        <p className="text-slate-400 leading-relaxed font-sans text-sm mb-6 border-l-2 border-slate-700 pl-4 italic">
                            "{event.description}"
                        </p>

                        <div className="grid gap-3">
                            {event.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => onSelectOption(option.id)}
                                    className="group flex items-start gap-3 p-4 text-left border border-slate-800 bg-noir-800 hover:border-amber-accent/50 hover:bg-amber-accent/5 transition-all outline-none"
                                >
                                    <div className="mt-0.5 w-5 h-5 flex items-center justify-center border border-slate-700 group-hover:border-amber-accent transition-colors shrink-0">
                                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-mono text-xs uppercase text-slate-300 group-hover:text-amber-accent transition-colors">
                                            {option.label}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 leading-normal">
                                            {option.description}
                                        </div>
                                        {option.lag_time !== undefined && (
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600 font-mono">
                                                <Clock className="w-2.5 h-2.5" />
                                                <span>Resolves in ~{option.lag_time} days</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono text-slate-600 uppercase shrink-0">
                        <span>Status: Awaiting Directive</span>
                        <span>Brinkmanship Logic Core 2.0</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DossierPane;
