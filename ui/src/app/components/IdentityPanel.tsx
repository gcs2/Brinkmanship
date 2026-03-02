"use client";

import React from "react";
import { User, Shield, Briefcase, Globe } from "lucide-react";

interface Advisor {
    id: string;
    name: string;
    role: string;
    specialty: string;
    trust: number;
}

interface PlayerProfile {
    country: string;
    leader_name: string;
    title: string;
    stress: number;
    nuclear_stockpile?: number;
}

interface IdentityPanelProps {
    profile: PlayerProfile;
    advisors: Advisor[];
}

export const IdentityPanel = ({ profile, advisors }: IdentityPanelProps) => {
    return (
        <div className="flex flex-col gap-4">
            {/* Player Profile */}
            <div className="panel p-4 border border-amber-accent/30 bg-noir-800/80">
                <div className="flex items-center gap-3 mb-3 border-b border-amber-accent/20 pb-2">
                    <div className="w-10 h-10 border border-amber-accent flex items-center justify-center bg-noir-900 shadow-[inset_0_0_10px_rgba(255,176,0,0.5)]">
                        <User className="w-5 h-5 text-amber-accent" />
                    </div>
                    <div>
                        <div className="text-xs font-mono text-amber-accent uppercase tracking-widest">{profile.leader_name}</div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">{profile.title} // {profile.country}</div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Executive Stress</span>
                        <span className="text-[10px] font-mono text-red-400">{profile.stress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-red-500 h-full" style={{ width: `${profile.stress}%` }} />
                    </div>

                    {profile.nuclear_stockpile !== undefined && (
                        <div className="mt-2 flex justify-between items-center border-t border-slate-800 pt-2">
                            <span className="text-[9px] font-mono text-amber-500 uppercase flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Arsenal
                            </span>
                            <span className="text-[10px] font-mono text-slate-300">{profile.nuclear_stockpile.toLocaleString()} Warheads</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Cabinet / Advisors */}
            <div className="panel p-0 border border-slate-700 bg-noir-900 overflow-hidden">
                <div className="bg-slate-800/50 p-2 text-[9px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-700">
                    Inner Circle
                </div>
                <div className="divide-y divide-slate-800/50 max-h-48 overflow-y-auto">
                    {advisors.map(adv => (
                        <div key={adv.id} className="p-3 hover:bg-slate-800/30 transition-colors flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center bg-noir-950 group-hover:border-slate-500 transition-colors">
                                {adv.specialty === 'defense' ? <Shield className="w-4 h-4 text-slate-500 group-hover:text-slate-300" /> : <Briefcase className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />}
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-mono text-[#e0e0e0] uppercase leading-none">{adv.name}</div>
                                <div className="text-[8px] font-mono text-slate-500 uppercase mt-1">{adv.role}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] font-mono text-slate-500 uppercase">Trust</div>
                                <div className={`text-[10px] font-mono ${adv.trust > 60 ? 'text-emerald-500' : adv.trust < 40 ? 'text-red-500' : 'text-amber-500'}`}>
                                    {adv.trust}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
