'use client';

import React, { useState, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState<'oversikt' | 'trupp' | 'taktik' | 'traning' | 'ai'>('oversikt');

  // Datatillstånd (State)
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  // Formulär - Spelare
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('Mittfältare');
  const [newPlayerNum, setNewPlayerNum] = useState<number | ''>('');

  // Formulär - Träning
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionFocus, setNewSessionFocus] = useState('');

  // Matchinfo & Dynamisk Taktik
  const [nextMatch, setNextMatch] = useState('Lördag 15:00 vs BK Häcken');
  const [formation, setFormation] = useState<string>('4-3-3');
  const [customFormationInput, setCustomFormationInput] = useState<string>('');

  // AI-Assistent
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Ladda från localStorage
  useEffect(() => {
    const savedPlayers = localStorage.getItem('coachhub_players');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    } else {
      setPlayers([
        { id: '1', name: 'Alexander Isak', position: 'Forward', number: 9, status: 'Aktiv' },
        { id: '2', name: 'Dejan Kulusevski', position: 'Mittfältare', number: 10, status: 'Aktiv' },
        { id: '3', name: 'Victor Lindelöf', position: 'Back', number: 3, status: 'Aktiv' },
        { id: '4', name: 'Robin Olsen', position: 'Målvakt', number: 1, status: 'Aktiv' },
      ]);
    }

    const savedSessions = localStorage.getItem('coachhub_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Spara till localStorage
  useEffect(() => {
    if (players.length > 0) localStorage.setItem('coachhub_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem('coachhub_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Funktioner för spelare och träning
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

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

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

  const handleCustomFormationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFormationInput.trim()) {
      setFormation(customFormationInput.trim());
      setCustomFormationInput('');
    }
  };

  const handleAiGenerate = () => {
    if (!aiPrompt) return;
    setAiResponse(
      `🤖 AI-RÅD FÖR: "${aiPrompt}"\n\n1. Rekommenderad Övning: 4v2 Smålagsspel med hög press i 15 min.\n2. Taktiskt skifte: Kliv högre med ytterbackarna när motståndarna spelar från målvakt.\n3. Fokus på nästa pass: Öva på sista passningen i sista tredjedelen.`
    );
  };

  // Beräkna rader för dynamisk taktikutskrift på planen
  const formationRows = formation.split('-').map((num) => parseInt(num, 10)).filter((num) => !isNaN(num));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* SIDOMENY */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl">
              C
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">CoachHub</h1>
              <span className="text-xs text-slate-400">MVP 1.0 Pro</span>
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
              📅 Träning & Övningar ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'ai' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              🤖 AI Tränarassistent
            </button>
          </nav>
        </div>
      </aside>

      {/* HUVUDINNEHÅLL */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* ÖVERSIKT */}
        {activeTab === 'oversikt' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Välkommen tillbaka, Tränarn!</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Aktiva Spelare</p>
                <p className="text-3xl font-bold text-emerald-400">{players.filter((p) => p.status === 'Aktiv').length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Planerade Träningspass</p>
                <p className="text-3xl font-bold text-blue-400">{sessions.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Vald Uppställning</p>
                <p className="text-3xl font-bold text-purple-400">{formation}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-bold mb-3">Nästa Match</h3>
              <input
                type="text"
                value={nextMatch}
                onChange={(e) => setNextMatch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-emerald-400 font-semibold focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TRUPPEN & SPELARE */}
        {activeTab === 'trupp' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Truppen & Spelare</h2>
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
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition">
                + Lägg till spelare
              </button>
            </form>

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
                        <button onClick={() => handleDeletePlayer(player.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">
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

        {/* TAKTIKTAVLA */}
        {activeTab === 'taktik' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Taktiktavla & Formation</h2>
                <p className="text-xs text-slate-400">Aktiv formation: <span className="text-emerald-400 font-bold">{formation}</span></p>
              </div>

              {/* Snabbval och Custom Formation */}
              <div className="flex flex-wrap items-center gap-2">
                {['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormation(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      formation === f ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}

                <form onSubmit={handleCustomFormationSubmit} className="flex gap-1 ml-2">
                  <input
                    type="text"
                    placeholder="Valfri (t.ex. 4-1-4-1)"
                    value={customFormationInput}
                    onChange={(e) => setCustomFormationInput(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-32 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    Använd
                  </button>
                </form>
              </div>
            </div>

            {/* Dynamisk Fotbollsplan */}
            <div className="bg-emerald-950/40 border-2 border-emerald-500/30 p-8 rounded-2xl relative min-h-[550px] flex flex-col justify-between items-center">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-48 h-48 border-4 border-white rounded-full"></div>
              </div>

              <div className="w-full text-center text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Anfall ➔</div>

              {/* Dynamisk Utskrivning av Rader baserat på valfri taktik */}
              <div className="w-full flex flex-col-reverse justify-around items-center flex-1 py-4 gap-6">
                {/* Målvakt alltid längst ner */}
                <div className="flex justify-center w-full">
                  <div className="bg-slate-900/90 border border-emerald-500/50 px-4 py-2 rounded-xl shadow-lg text-center">
                    <span className="text-xs font-bold text-emerald-400">#1</span>
                    <p className="text-xs font-bold text-white">{players[0]?.name || 'Målvakt'}</p>
                  </div>
                </div>

                {/* Dynamiska Rader (Försvar, Mittfält, Anfall osv.) */}
                {formationRows.map((count, rowIndex) => {
                  return (
                    <div key={rowIndex} className="flex justify-center items-center gap-4 w-full">
                      {Array.from({ length: count }).map((_, colIndex) => {
                        const playerIndex = (rowIndex * 3) + colIndex + 1;
                        const player = players[playerIndex % players.length];
                        return (
                          <div
                            key={colIndex}
                            className="bg-slate-900/90 border border-emerald-500/50 px-3 py-2 rounded-xl shadow-lg text-center min-w-[110px]"
                          >
                            <span className="text-[10px] font-bold text-emerald-400">#{player?.number || playerIndex + 1}</span>
                            <p className="text-xs font-bold text-white truncate">{player?.name || `Spelare ${playerIndex + 1}`}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="w-full text-center text-xs text-emerald-400 font-bold uppercase tracking-widest mt-2">Mål / Försvar</div>
            </div>
          </div>
        )}

        {/* TRÄNING & ÖVNINGAR */}
        {activeTab === 'traning' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Träningsplanering</h2>
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
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition">
                + Skapa Träningspass
              </button>
            </form>

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

        {/* AI TRÄNARASSISTENT */}
        {activeTab === 'ai' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🤖 AI Tränarassistent</h2>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-6">
              <label className="block text-sm font-medium mb-2 text-slate-300">Vad vill du ha hjälp med inför nästa pass/match?</label>
              <textarea
                rows={3}
                placeholder="t.ex. Ge mig en övning för att förbättra kontringsspelet..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm focus:outline-none focus:border-emerald-500 mb-4"
              />
              <button
                onClick={handleAiGenerate}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 px-6 rounded-lg text-sm transition"
              >
                Generera Taktiskt Råd
              </button>
            </div>

            {aiResponse && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl whitespace-pre-line text-emerald-300 text-sm">
                {aiResponse}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}