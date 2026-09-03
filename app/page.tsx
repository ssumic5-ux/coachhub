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
  x: number; //procent 0-100
  y: number; //procent 0-100
  team: 'home' | 'away';
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

type DrawTool = 'select' | 'arrow' | 'circle' | 'space';

type DrawingElement = {
  type: 'arrow' | 'circle' | 'space';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'oversikt' | 'trupp' | 'serier' | 'taktik' | 'traning' | 'ai'>('oversikt');

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  
  const [leagueSearchQuery, setLeagueSearchQuery] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<string>('');

  // Taktik & Plan-state
  const [homeFormation, setHomeFormation] = useState<string>('4-3-3');
  const [awayFormation, setAwayFormation] = useState<string>('4-4-2');
  const [homeColor, setHomeColor] = useState<string>('#10b981'); // Emerald
  const [awayColor, setAwayColor] = useState<string>('#ef4444'); // Red
  const [pitchTokens, setPitchTokens] = useState<PitchToken[]>([]);
  
  // Ritverktyg
  const [activeTool, setActiveTool] = useState<DrawTool>('select');
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [currentDraw, setCurrentDraw] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
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
    { id: '2', name: 'Victor Lindelöf', position: 'Back', number: 3, status: 'Aktiv' },
    { id: '3', name: 'Isak Hien', position: 'Back', number: 4, status: 'Aktiv' },
    { id: '4', name: 'Ludwig Augustinsson', position: 'Back', number: 6, status: 'Aktiv' },
    { id: '5', name: 'Emil Krafth', position: 'Back', number: 2, status: 'Aktiv' },
    { id: '6', name: 'Dejan Kulusevski', position: 'Mittfältare', number: 10, status: 'Aktiv' },
    { id: '7', name: 'Mattias Svanberg', position: 'Mittfältare', number: 20, status: 'Aktiv' },
    { id: '8', name: 'Jens Cajuste', position: 'Mittfältare', number: 18, status: 'Aktiv' },
    { id: '9', name: 'Alexander Isak', position: 'Forward', number: 9, status: 'Aktiv' },
    { id: '10', name: 'Viktor Gyökeres', position: 'Forward', number: 17, status: 'Aktiv' },
    { id: '11', name: 'Anthony Elanga', position: 'Forward', number: 11, status: 'Aktiv' }
  ];

  useEffect(() => {
    try {
      const savedLeagues = localStorage.getItem('coachhub_leagues');
      if (savedLeagues) setLeagues(JSON.parse(savedLeagues));
      else {
        setLeagues(defaultLeagues);
        localStorage.setItem('coachhub_leagues', JSON.stringify(defaultLeagues));
      }

      const savedSelectedLeague = localStorage.getItem('coachhub_selected_league');
      if (savedSelectedLeague) setSelectedLeagueId(savedSelectedLeague);
      else if (defaultLeagues.length > 0) setSelectedLeagueId(defaultLeagues[0].id);

      const savedPlayers = localStorage.getItem('coachhub_players');
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      else {
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

  // Generera koordinater för 11 spelare utifrån formation
  const getFormationCoords = (form: string, isHome: boolean) => {
    const tokens: PitchToken[] = [];
    
    // Y-intervall: Hemmalag spelar på nedre halvan (52 till 90), Bortalag på övre (10 till 48)
    const gkY = isHome ? 91 : 9;
    
    // Målvakt
    tokens.push({
      id: `${isHome ? 'home' : 'away'}-gk`,
      label: 'MV',
      number: isHome ? 1 : 30,
      x: 50,
      y: gkY,
      team: isHome ? 'home' : 'away'
    });

    let defY = isHome ? 74 : 26;
    let midY = isHome ? 53 : 47;
    let attY = isHome ? 30 : 70;

    let defX = [18, 38, 62, 82];
    let midX = [30, 50, 70];
    let attX = [25, 50, 75];

    if (form === '4-3-3') {
      defX = [18, 38, 62, 82];
      midX = [30, 50, 70];
      attX = [22, 50, 78];
    } else if (form === '4-4-2') {
      defX = [18, 38, 62, 82];
      midX = [15, 38, 62, 85];
      attX = [38, 62];
    } else if (form === '3-5-2') {
      defX = [25, 50, 75];
      midX = [15, 32, 50, 68, 85];
      attX = [38, 62];
    } else if (form === '5-3-2') {
      defX = [15, 30, 50, 70, 85];
      midX = [30, 50, 70];
      attX = [38, 62];
    } else if (form === '4-2-3-1') {
      defX = [18, 38, 62, 82];
      midX = [40, 60, 22, 50, 78]; 
      attX = [50];
    }

    // Backar
    defX.forEach((x, idx) => {
      tokens.push({
        id: `${isHome ? 'home' : 'away'}-def-${idx}`,
        label: `B${idx + 1}`,
        number: idx + 2,
        x,
        y: defY,
        team: isHome ? 'home' : 'away'
      });
    });

    // Mittfältare
    midX.forEach((x, idx) => {
      tokens.push({
        id: `${isHome ? 'home' : 'away'}-mid-${idx}`,
        label: `MF${idx + 1}`,
        number: idx + 6,
        x,
        y: midY,
        team: isHome ? 'home' : 'away'
      });
    });

    // Anfallare
    if (form === '4-2-3-1') {
      tokens.push({ id: `${isHome ? 'home' : 'away'}-st`, label: 'FW', number: 9, x: 50, y: isHome ? 18 : 82, team: isHome ? 'home' : 'away' });
    } else {
      attX.forEach((x, idx) => {
        tokens.push({
          id: `${isHome ? 'home' : 'away'}-att-${idx}`,
          label: `FW${idx + 1}`,
          number: idx + 9,
          x,
          y: attY,
          team: isHome ? 'home' : 'away'
        });
      });
    }

    return tokens;
  };

  useEffect(() => {
    const homeTokens = getFormationCoords(homeFormation, true);
    const awayTokens = getFormationCoords(awayFormation, false);
    setPitchTokens([...homeTokens, ...awayTokens]);
  }, [homeFormation, awayFormation]);

  // Drag-and-drop handhavande
  const handlePointerDownToken = (id: string, e: React.PointerEvent) => {
    if (activeTool === 'select') {
      e.stopPropagation();
      setDraggingTokenId(id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(3, Math.min(97, ((e.clientY - rect.top) / rect.height) * 100));

    if (draggingTokenId && activeTool === 'select') {
      setPitchTokens(prev => prev.map(t => t.id === draggingTokenId ? { ...t, x, y } : t));
    } else if (currentDraw) {
      setCurrentDraw(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  };

  const handlePointerUp = () => {
    if (currentDraw && activeTool !== 'select') {
      setDrawings(prev => [...prev, {
        type: activeTool as any,
        startX: currentDraw.startX,
        startY: currentDraw.startY,
        endX: currentDraw.endX,
        endY: currentDraw.endY,
        color: '#facc15' // Gul penna
      }]);
      setCurrentDraw(null);
    }
    setDraggingTokenId(null);
  };

  const handlePitchDown = (e: React.PointerEvent) => {
    if (activeTool !== 'select') {
      if (!pitchRef.current) return;
      const rect = pitchRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCurrentDraw({ startX: x, startY: y, endX: x, endY: y });
    }
  };

  const filteredLeagues = leagues?.filter(l => 
    l?.name && l.name.toLowerCase().includes(leagueSearchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg">
              C
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">CoachHub</h1>
              <span className="text-xs text-slate-400">Pro Taktik & Lagledning</span>
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
              📋 Taktiktavla & Plan (22 spelare)
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

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'oversikt' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Välkommen tillbaka, Tränarn!</h2>
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Aktiva Spelare</p>
                <p className="text-3xl font-bold text-emerald-400">{players?.length || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Serier sparade</p>
                <p className="text-3xl font-bold text-blue-400">{leagues?.length || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Hemmalag Form.</p>
                <p className="text-3xl font-bold text-amber-400">{homeFormation}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Bortalag Form.</p>
                <p className="text-3xl font-bold text-rose-400">{awayFormation}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trupp' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Truppen & Spelare ({players?.length || 0} st)</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
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
            <h2 className="text-2xl font-bold mb-2">🏆 Serier & Motståndare</h2>
            <p className="text-xs text-slate-400 mb-6">Sök bland tillgängliga serier och ladda motståndarlag.</p>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8">
              <input
                type="text"
                placeholder="Sök serie..."
                value={leagueSearchQuery}
                onChange={(e) => setLeagueSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500 mb-4"
              />
              <select
                value={selectedLeagueId}
                onChange={(e) => handleSaveLeagueSelection(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-semibold px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Välj serie --</option>
                {filteredLeagues?.map((l) => (
                  <option key={l?.id} value={l?.id}>{l?.name}</option>
                ))}
              </select>
            </div>

            {currentLeague && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentLeague?.teams?.map((team) => (
                  <div key={team?.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-white">{team?.name}</h4>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 font-semibold">{team?.formation}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Tränare: {team?.coach}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOpponentTeamId(team?.id);
                        setAwayFormation(team?.formation || '4-4-2');
                        setActiveTab('taktik');
                      }}
                      className="mt-4 w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold py-2.5 rounded-lg text-xs transition text-center"
                    >
                      🎯 Ladda motståndare på Taktiktavlan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Taktiktavla */}
        {activeTab === 'taktik' && (
          <div className="flex flex-col h-full pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-[10px] text-emerald-400 font-bold uppercase">Hemmalag Form / Färg</label>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={homeFormation}
                      onChange={(e) => setHomeFormation(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-white px-2 py-1 rounded"
                    >
                      <option value="4-3-3">4-3-3</option>
                      <option value="4-4-2">4-4-2</option>
                      <option value="3-5-2">3-5-2</option>
                      <option value="5-3-2">5-3-2</option>
                      <option value="4-2-3-1">4-2-3-1</option>
                    </select>
                    <input
                      type="color"
                      value={homeColor}
                      onChange={(e) => setHomeColor(e.target.value)}
                      className="w-7 h-6 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-rose-400 font-bold uppercase">Bortalag Form / Färg</label>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={awayFormation}
                      onChange={(e) => setAwayFormation(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-white px-2 py-1 rounded"
                    >
                      <option value="4-3-3">4-3-3</option>
                      <option value="4-4-2">4-4-2</option>
                      <option value="3-5-2">3-5-2</option>
                      <option value="5-3-2">5-3-2</option>
                      <option value="4-2-3-1">4-2-3-1</option>
                    </select>
                    <input
                      type="color"
                      value={awayColor}
                      onChange={(e) => setAwayColor(e.target.value)}
                      className="w-7 h-6 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Verktygsval */}
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
                <button
                  onClick={() => setActiveTool('select')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeTool === 'select' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  🖐️ Flytta
                </button>
                <button
                  onClick={() => setActiveTool('arrow')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeTool === 'arrow' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  ➡️ Pil
                </button>
                <button
                  onClick={() => setActiveTool('circle')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeTool === 'circle' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  ⭕ Cirkel
                </button>
                <button
                  onClick={() => setActiveTool('space')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeTool === 'space' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  🟩 Fri yta
                </button>
                <button
                  onClick={() => setDrawings([])}
                  className="px-2.5 py-1.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 ml-2"
                >
                  🗑️ Rensa
                </button>
              </div>
            </div>

            {/* Fotbollsplan behållare */}
            <div className="flex-1 flex items-center justify-center min-h-[550px]">
              <div 
                ref={pitchRef}
                onPointerDown={handlePitchDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full max-w-2xl aspect-[2/3] bg-emerald-600 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none cursor-crosshair touch-none"
              >
                {/* Gräs & Planlinjer */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#047857_0%,#065f46_100%)] pointer-events-none" />
                
                {/* Mittlinje */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/40 pointer-events-none" />
                {/* Mittcirkel */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full pointer-events-none" />

                {/* Straffområde uppe */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[16%] border-2 border-t-0 border-white/40 pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/5 h-[6%] border-2 border-t-0 border-white/40 pointer-events-none" />

                {/* Straffområde nere */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-[16%] border-2 border-b-0 border-white/40 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/5 h-[6%] border-2 border-b-0 border-white/40 pointer-events-none" />

                {/* SVG ritlager */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {drawings.map((d, i) => {
                    if (d.type === 'arrow') {
                      return (
                        <g key={i}>
                          <line x1={`${d.startX}%`} y1={`${d.startY}%`} x2={`${d.endX}%`} y2={`${d.endY}%`} stroke={d.color} strokeWidth="3" strokeDasharray="5,3" />
                          <circle cx={`${d.endX}%`} cy={`${d.endY}%`} r="4" fill={d.color} />
                        </g>
                      );
                    } else if (d.type === 'circle') {
                      const rx = Math.abs(d.endX - d.startX) / 2;
                      const ry = Math.abs(d.endY - d.startY) / 2;
                      const cx = (d.startX + d.endX) / 2;
                      const cy = (d.startY + d.endY) / 2;
                      return <ellipse key={i} cx={`${cx}%`} cy={`${cy}%`} rx={`${rx}%`} ry={`${ry}%`} stroke={d.color} strokeWidth="2.5" fill="none" strokeDasharray="3,3" />;
                    } else if (d.type === 'space') {
                      const rx = Math.abs(d.endX - d.startX) / 2;
                      const ry = Math.abs(d.endY - d.startY) / 2;
                      const cx = (d.startX + d.endX) / 2;
                      const cy = (d.startY + d.endY) / 2;
                      return <ellipse key={i} cx={`${cx}%`} cy={`${cy}%`} rx={`${rx}%`} ry={`${ry}%`} fill={d.color} fillOpacity="0.25" stroke={d.color} strokeWidth="2" />;
                    }
                    return null;
                  })}

                  {currentDraw && activeTool === 'arrow' && (
                    <line x1={`${currentDraw.startX}%`} y1={`${currentDraw.startY}%`} x2={`${currentDraw.endX}%`} y2={`${currentDraw.endY}%`} stroke="#facc15" strokeWidth="3" strokeDasharray="5,3" />
                  )}
                </svg>

                {/* Spelartokens (22 st) */}
                {pitchTokens?.map((token) => {
                  const isHome = token.team === 'home';
                  const bg = isHome ? homeColor : awayColor;
                  return (
                    <div
                      key={token?.id}
                      onPointerDown={(e) => handlePointerDownToken(token.id, e)}
                      style={{ left: `${token?.x}%`, top: `${token?.y}%`, backgroundColor: bg }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-white border-2 border-white flex flex-col items-center justify-center font-bold text-xs shadow-xl z-20 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    >
                      <span className="leading-none text-[12px]">{token?.number}</span>
                      <span className="text-[8px] truncate max-w-[34px] opacity-90">{token?.label}</span>
                    </div>
                  );
                })}
              </div>
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
              <button onClick={() => setAiResponse("AI-råd: Utnyttja ytorna på kanterna mot detta motstånd.")} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-6 rounded-lg text-sm transition">
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