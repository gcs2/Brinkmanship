"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";

interface EventOption {
    id: string;
    label: string;
    description: string;
}

interface DossierModalProps {
    event: {
        id: string;
        title: string;
        description: string;
        options: EventOption[];
    } | null;
    onSelectOption: (optionId: string) => void;
}

const DossierModal = ({ event, onSelectOption }: DossierModalProps) => {
    return (
        <AnimatePresence>
            {event && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl panel border-amber-accent/30 overflow-hidden shadow-[0_0_100px_rgba(255,176,0,0.15)]"
                    >
                        {/* Dossier Header */}
                        <div className="bg-amber-accent/10 border-b border-amber-accent/20 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-amber-accent" />
                                <h3 className="font-mono text-amber-accent uppercase tracking-[0.2em] text-sm">
                                    Priority Dossier // {event.id}
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Eyes Only</span>
                        </div>

                        {/* Event Content */}
                        <div className="p-8">
                            <h2 className="text-2xl font-mono text-[#e0e0e0] mb-4 uppercase tracking-wider">
                                {event.title}
                            </h2>
                            <p className="text-slate-400 leading-relaxed font-sans text-lg mb-8 border-l-2 border-slate-700 pl-6 italic">
                                "{event.description}"
                            </p>

                            <div className="grid gap-4">
                                {event.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => onSelectOption(option.id)}
                                        className="group flex items-start gap-4 p-4 text-left border border-slate-800 bg-noir-800 hover:border-amber-accent/50 hover:bg-amber-accent/5 transition-all outline-none"
                                    >
                                        <div className="mt-1 w-6 h-6 flex items-center justify-center border border-slate-700 group-hover:border-amber-accent transition-colors">
                                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-accent" />
                                        </div>
                                        <div>
                                            <div className="font-mono text-sm uppercase text-slate-300 group-hover:text-amber-accent transition-colors">
                                                {option.label}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 leading-normal">
                                                {option.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dossier Footer */}
                        <div className="p-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono text-slate-600 uppercase">
                            <span>Status: Critical Decision Required</span>
                            <span>Brinkmanship Logic Core 1.2.0</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DossierModal;
