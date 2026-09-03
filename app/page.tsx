'use client';

import React, { useState, useEffect } from 'react';

// Typer för spelare och träningspass
type Player = {
  id: string;
  name: string;
  position: string;
  number: number;
  status: 'Aktiv' | 'Skadad' | 'Frånvarande';
};

type TrainingSession = {
  id: string;
  date: string;
  title: string;
  focus: string;
  duration: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'oversikt' | 'trupp' | 'taktik' | 'traning'>('oversikt');

  // Spelarlista (Hämtar från localStorage om det finns)
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('Mittfältare');
  const [newPlayerNum, setNewPlayerNum] = useState<number | ''>('');

  // Träningspass (Hämtar från localStorage om det finns)
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionFocus, setNewSessionFocus] = useState('');

  // Ladda sparad data från localStorage vid start
  useEffect(() => {
    const savedPlayers = localStorage.getItem('coachhub_players');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    } else {
      // Standardspelare
      setPlayers([
        { id: '1', name: 'Alexander Isak', position: 'Forward', number: 9, status: 'Aktiv' },
        { id: '2', name: 'Dejan Kulusevski', position: 'Mittfältare', number: 10, status: 'Aktiv' },
        { id: '3', name: 'Victor Lindelöf', position: 'Back', number: 3, status: 'Aktiv' },
      ]);
    }

    const savedSessions = localStorage.getItem('coachhub_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Spara ändringar till localStorage
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('coachhub_players', JSON.stringify(players));
    }
  }, [players]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('coachhub_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Lägg till spelare
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName || !newPlayerNum) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName,
      position: newPlayerPos,
      number: Number(newPlayerNum),
      status: 'Aktiv',
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setNewPlayerNum('');
  };

  // Ta bort spelare
  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  // Lägg till träningspass
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle || !newSessionDate) return;

    const newSession: TrainingSession = {
      id: Date.now().toString(),
      date: newSessionDate,
      title: newSessionTitle,
      focus: newSessionFocus || 'Allmänt',
      duration: '90 min',
    };

    setSessions([...sessions, newSession]);
    setNewSessionTitle('');
    setNewSessionDate('');
    setNewSessionFocus('');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidomeny */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl">
              C
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">CoachHub</h1>
              <span className="text-xs text-slate-400">MVP 1.0</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('oversikt')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'oversikt' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              📊 Översikt
            </button>
            <button
              onClick={() => setActiveTab('trupp')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'trupp' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              👥 Truppen & Spelare ({players.length})
            </button>
            <button
              onClick={() => setActiveTab('taktik')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'taktik' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              📋 Taktiktavla
            </button>
            <button
              onClick={() => setActiveTab('traning')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'traning' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              📅 Träning & Övningar
            </button>
          </nav>
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* ÖVERSIKT */}
        {activeTab === 'oversikt' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Välkommen tillbaka, Tränarn!</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Aktiva Spelare</p>
                <p className="text-3xl font-bold text-emerald-400">{players.filter(p => p.status === 'Aktiv').length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Planerade Träningspass</p>
                <p className="text-3xl font-bold text-blue-400">{sessions.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Truppens Form</p>
                <p className="text-3xl font-bold text-purple-400">92%</p>
              </div>
            </div>
          </div>
        )}

        {/* TRUPPEN & SPELARE */}
        {activeTab === 'trupp' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Truppen & Spelare</h2>

            {/* Formulär för ny spelare */}
            <form onSubmit={handleAddPlayer} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 grid grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Spelarnamn</label>
                <input
                  type="text"
                  placeholder="t.ex. Victor Lindelöf"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Position</label>
                <select
                  value={newPlayerPos}
                  onChange={(e) => setNewPlayerPos(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Målvakt">Målvakt</option>
                  <option value="Back">Back</option>
                  <option value="Mittfältare">Mittfältare</option>
                  <option value="Forward">Forward</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Tröjnummer</label>
                <input
                  type="number"
                  placeholder="10"
                  value={newPlayerNum}
                  onChange={(e) => setNewPlayerNum(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition"
              >
                + Lägg till spelare
              </button>
            </form>

            {/* Spelartabell */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Nr</th>
                    <th className="p-4">Namn</th>
                    <th className="p-4">Position</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {players.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-emerald-400">#{player.number}</td>
                      <td className="p-4 font-medium">{player.name}</td>
                      <td className="p-4 text-slate-400">{player.position}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {player.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-semibold"
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRÄNING & ÖVNINGAR */}
        {activeTab === 'traning' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Träningsplanering</h2>

            {/* Formulär för nytt pass */}
            <form onSubmit={handleAddSession} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 grid grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Datum</label>
                <input
                  type="date"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Rubrik / Pass</label>
                <input
                  type="text"
                  placeholder="t.ex. Anfallsspel & Avslut"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Fokusområde</label>
                <input
                  type="text"
                  placeholder="t.ex. Högt presspel"
                  value={newSessionFocus}
                  onChange={(e) => setNewSessionFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition"
              >
                + Skapa Träningspass
              </button>
            </form>

            {/* Pass-lista */}
            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-400 font-semibold uppercase">{s.date}</span>
                    <h3 className="text-lg font-bold mt-1">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Fokus: {s.focus} • Längd: {s.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAKTIKTAVLA */}
        {activeTab === 'taktik' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Taktiktavla (4-3-3)</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl flex items-center justify-center min-h-[400px]">
              <p className="text-slate-400">Interaktiv plan uppdaterad med truppens spelare.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}