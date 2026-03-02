"use client";

import React from "react";
import { Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IntelFeedProps {
    logs: string[];
    pendingCount: number;
}

const IntelFeed = ({ logs, pendingCount }: IntelFeedProps) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
                <Radio className="w-3 h-3 text-amber-accent" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Intel Feed
                </span>
                {pendingCount > 0 && (
                    <span className="ml-auto text-[10px] font-mono text-amber-accent border border-amber-accent/30 px-1.5 py-0.5">
                        {pendingCount} pending
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                <AnimatePresence initial={false}>
                    {logs.length === 0 ? (
                        <p className="text-[10px] font-mono text-slate-700 italic">No operations resolved.</p>
                    ) : (
                        [...logs].reverse().map((log, i) => (
                            <motion.div
                                key={log + i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[10px] font-mono text-slate-500 leading-relaxed border-l border-slate-800 pl-2"
                            >
                                {log}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default IntelFeed;
