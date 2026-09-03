'use client';

import React, { useState, useEffect, useRef } from 'react';

type Player = {
  id: string;
  name: string;
  position: string;
  number: number;
  status: 'Aktiv' | 'Skadad' | 'Frånvarande';
};

type PitchToken = {
  id: string;
  label: string;
  number: number | string;
  x: number; 
  y: number; 
  team: 'home' | 'away';
  positionType?: string;
};

type TrainingSession = {
  id: string;
  date: string;
  title: string;
  focus: string;
  duration: string;
};

type OpponentPlayer = {
  name: string;
  number: number;
  position: string;
  note?: string;
};

type OpponentTeam = {
  id: string;
  name: string;
  coach: string;
  formation: string;
  players: OpponentPlayer[];
};

type League = {
  id: string;
  name: string;
  teams: OpponentTeam[];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'oversikt' | 'trupp' | 'serier' | 'taktik' | 'traning' | 'ai'>('oversikt');

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  
  const [leagueSearchQuery, setLeagueSearchQuery] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<string>('');

  const [formation, setFormation] = useState<string>('4-3-3');

  const [pitchTokens, setPitchTokens] = useState<PitchToken[]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const pitchRef = useRef<HTMLDivElement | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const defaultLeagues: League[] = [
    {
      id: 'div4-mellersta-gotaland',
      name: 'Division 4 Mellersta Götaland',
      teams: [
        {
          id: 'lag-1',
          name: 'Gislaveds IS',
          coach: 'Anders Svensson',
          formation: '4-3-3',
          players: [
            { name: 'Elias Karlsson', number: 1, position: 'Målvakt' },
            { name: 'Oskar Nilsson', number: 4, position: 'Back', note: 'Stark i luftrummet' },
            { name: 'Filip Jonsson', number: 10, position: 'Mittfältare', note: 'Spelfördelare' },
            { name: 'Viktor Ek', number: 9, position: 'Forward', note: 'Snabb i djupled' }
          ]
        },
        {
          id: 'lag-2',
          name: 'Anderstorps IF',
          coach: 'Mikael Andersson',
          formation: '4-4-2',
          players: [
            { name: 'Axel Berg', number: 30, position: 'Målvakt' },
            { name: 'Simon Dahl', number: 2, position: 'Back' },
            { name: 'Rasmus Persson', number: 8, position: 'Mittfältare', note: 'Varningstät' },
            { name: 'Lucas Gran', number: 11, position: 'Forward' }
          ]
        }
      ]
    }
  ];

  const defaultPlayers: Player[] = [
    { id: '1', name: 'Robin Olsen', position: 'Målvakt', number: 1, status: 'Aktiv' },
    { id: '2', name: 'Viktor Johansson', position: 'Målvakt', number: 12, status: 'Aktiv' },
    { id: '3', name: 'Victor Lindelöf', position: 'Back', number: 3, status: 'Aktiv' },
    { id: '4', name: 'Isak Hien', position: 'Back', number: 4, status: 'Aktiv' },
    { id: '5', name: 'Dejan Kulusevski', position: 'Mittfältare', number: 10, status: 'Aktiv' },
    { id: '6', name: 'Alexander Isak', position: 'Forward', number: 9, status: 'Aktiv' }
  ];

  useEffect(() => {
    try {
      const savedLeagues = localStorage.getItem('coachhub_leagues');
      if (savedLeagues) {
        setLeagues(JSON.parse(savedLeagues));
      } else {
        setLeagues(defaultLeagues);
        localStorage.setItem('coachhub_leagues', JSON.stringify(defaultLeagues));
      }

      const savedSelectedLeague = localStorage.getItem('coachhub_selected_league');
      if (savedSelectedLeague) {
        setSelectedLeagueId(savedSelectedLeague);
      } else if (defaultLeagues.length > 0) {
        setSelectedLeagueId(defaultLeagues[0].id);
      }

      const savedPlayers = localStorage.getItem('coachhub_players');
      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      } else {
        setPlayers(defaultPlayers);
        localStorage.setItem('coachhub_players', JSON.stringify(defaultPlayers));
      }
    } catch (e) {
      console.error(e);
      setLeagues(defaultLeagues);
      setPlayers(defaultPlayers);
    }
  }, []);

  const handleSaveLeagueSelection = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    localStorage.setItem('coachhub_selected_league', leagueId);
  };

  const currentLeague = leagues?.find(l => l?.id === selectedLeagueId);
  const activeOpponentTeam = currentLeague?.teams?.find(t => t?.id === selectedOpponentTeamId);

  const setupPitchTokens = () => {
    const tokens: PitchToken[] = [];
    tokens.push({
      id: 'home-gk',
      label: 'MV',
      number: 1,
      x: 50,
      y: 92,
      team: 'home',
      positionType: 'Målvakt',
    });
    setPitchTokens(tokens);
  };

  useEffect(() => {
    setupPitchTokens();
  }, [formation, players, selectedOpponentTeamId]);

  const filteredLeagues = leagues?.filter(l => 
    l?.name && l.name.toLowerCase().includes(leagueSearchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
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
              👥 Truppen & Spelare ({players?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('serier')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'serier' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              🏆 Serier & Motståndare
            </button>
            <button
              onClick={() => setActiveTab('taktik')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'taktik' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              📋 Taktiktavla & Motstånd
            </button>
            <button
              onClick={() => setActiveTab('traning')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'traning' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              📅 Träning & Övningar
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

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'oversikt' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Välkommen tillbaka, Tränarn!</h2>
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Aktiva Spelare</p>
                <p className="text-3xl font-bold text-emerald-400">{players?.filter((p) => p?.status === 'Aktiv')?.length || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Serier sparade</p>
                <p className="text-3xl font-bold text-blue-400">{leagues?.length || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Träningspass</p>
                <p className="text-3xl font-bold text-purple-400">{sessions?.length || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Vald Formation</p>
                <p className="text-3xl font-bold text-amber-400">{formation}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trupp' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Truppen & Spelare ({players?.length || 0} st)</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Nr</th>
                    <th className="p-4">Namn</th>
                    <th className="p-4">Position</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {players?.map((player) => (
                    <tr key={player?.id} className="hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-emerald-400">#{player?.number}</td>
                      <td className="p-4 font-medium">{player?.name}</td>
                      <td className="p-4 text-slate-400">{player?.position}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {player?.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'serier' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">🏆 Serier & Motståndare (Fogis-koppling)</h2>
            <p className="text-xs text-slate-400 mb-6">Sök bland tillgängliga serier, spara din serie och nå motståndarlagens registrerade spelartrupper direkt.</p>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8">
              <label className="block text-xs font-bold uppercase text-emerald-400 mb-2">Sök och välj serie / cup:</label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Sök serie..."
                  value={leagueSearchQuery}
                  onChange={(e) => setLeagueSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={selectedLeagueId}
                  onChange={(e) => handleSaveLeagueSelection(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-emerald-400 font-semibold px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500 min-w-[280px]"
                >
                  <option value="">-- Välj & Spara serie --</option>
                  {filteredLeagues?.map((l) => (
                    <option key={l?.id} value={l?.id}>{l?.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {currentLeague ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-emerald-400">Aktiv Serie: {currentLeague?.name}</h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                    Fogis Synkad ✅
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentLeague?.teams?.map((team) => (
                    <div key={team?.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-white">{team?.name}</h4>
                          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 font-semibold">{team?.formation}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Tränare: {team?.coach}</p>

                        <h5 className="text-xs font-bold uppercase text-emerald-400 mb-2">Fogis-registrerade spelare</h5>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {team?.players?.map((tp, idx) => (
                            <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                              <div className="flex justify-between font-semibold">
                                <span>#{tp?.number} {tp?.name}</span>
                                <span className="text-slate-400">{tp?.position}</span>
                              </div>
                              {tp?.note && <p className="text-[11px] text-amber-300 mt-1 italic">💡 {tp.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOpponentTeamId(team?.id);
                          setActiveTab('taktik');
                        }}
                        className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-lg text-xs transition text-center"
                      >
                        🎯 Analysera på Taktiktavlan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
                Ingen serie vald. Sök och välj en serie ovan för att se motståndarlag och spelare.
              </div>
            )}
          </div>
        )}

        {activeTab === 'taktik' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold">Interaktiv Taktiktavla & Motstånd</h2>
                <p className="text-xs text-slate-400">
                  {activeOpponentTeam ? `Fokus mot: ${activeOpponentTeam.name}` : 'Ingen specifik motståndare vald'}
                </p>
              </div>
            </div>

            <div 
              ref={pitchRef}
              className="relative w-full max-w-3xl aspect-[2/3] bg-emerald-700 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl mx-auto select-none"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#065f46_0%,#047857_100%)] opacity-90 pointer-events-none" />
              {pitchTokens?.map((token) => (
                <div
                  key={token?.id}
                  style={{ left: `${token?.x}%`, top: `${token?.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-500 text-slate-950 border-2 border-white flex flex-col items-center justify-center font-bold text-xs shadow-lg z-20"
                >
                  <span>{token?.number}</span>
                  <span className="text-[9px] truncate max-w-[36px]">{token?.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'traning' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📅 Träning & Övningar</h2>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-slate-400 text-sm">
              Inga träningspass inlagda ännu.
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🤖 AI Tränarassistent</h2>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-6">
              <textarea
                rows={3}
                placeholder="Fråga AI om taktik, spelsystem eller motståndaranalys..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm focus:outline-none focus:border-emerald-500 mb-4"
              />
              <button onClick={() => setAiResponse("AI-råd: Fokusera på snabba omställningar mot detta motstånd.")} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-6 rounded-lg text-sm transition">
                Generera råd
              </button>
            </div>
            {aiResponse && (
              <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-xl text-sm text-slate-200">
                {aiResponse}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}