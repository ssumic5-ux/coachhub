'use client';

import React, { useState } from 'react';
import { 
  Users, Calendar, Trophy, Settings, Layout, Plus, Search, 
  ChevronRight, Activity, Shield, Award, MessageSquare, Save
} from 'lucide-react';

export default function CoachHubDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-slate-950">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">CoachHub</h1>
              <span className="text-xs text-slate-400">MVP 1.0</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'Översikt', icon: Layout },
              { id: 'squad', label: 'Truppen & Spelare', icon: Users },
              { id: 'tactics', label: 'Taktiktavla', icon: Shield },
              { id: 'training', label: 'Träning & Övningar', icon: Calendar },
              { id: 'ai-assistant', label: 'AI Tränarassistent', icon: MessageSquare },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all">
            <Settings className="w-5 h-5" />
            Inställningar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Välkommen tillbaka, Tränarn!</h2>
            <p className="text-slate-400 text-sm">Här är översikten för ditt lag och nästa match.</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" />
            Ny Träningssession
          </button>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Aktiva Spelare</p>
              <p className="text-3xl font-bold mt-1">22</p>
            </div>
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Nästa Match</p>
              <p className="text-xl font-bold mt-1">Lördag 15:00</p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Truppens Form</p>
              <p className="text-3xl font-bold mt-1 text-emerald-400">88%</p>
            </div>
            <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl border border-purple-500/20">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tactical Overview Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Startelva & Taktik (4-3-3)</h3>
            <button className="text-slate-400 hover:text-emerald-400 text-sm flex items-center gap-1 transition-all">
              Redigera uppställning <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Simple Pitch Visualizer */}
          <div className="w-full h-64 bg-emerald-950/40 border border-emerald-500/30 rounded-xl relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 border border-emerald-500/20 rounded-xl m-2 pointer-events-none"></div>
            <div className="absolute w-32 h-32 border border-emerald-500/20 rounded-full pointer-events-none"></div>
            <p className="text-emerald-500/60 font-mono text-xs uppercase tracking-widest z-10">
              Interaktiv Taktiktavla Laddad
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}