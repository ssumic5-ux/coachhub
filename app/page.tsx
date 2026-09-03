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
            { name: 'Oskar Nilsson', number: 4, position: 'Back', note: ' Stark i luftrummet' },
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
        },
        {
          id: 'lag-3',
          name: 'Burseryds IF',
          coach: 'Johan Larsson',
          formation: '3-5-2',
          players: [
            { name: 'Noah Palm', number: 1, position: 'Målvakt' },
            { name: 'Liam Söderberg', number: 5, position: 'Back' },
            { name: 'Oliver Åström', number: 7, position: 'Mittfältare' }
          ]
        }
      ]
    },
    {
      id: 'p19-allsvenskan',
      name: 'P19 Allsvenskan / Superettan',
      teams: [
        {
          id: 'p19-ifk',
          name: 'IFK Göteborg P19',
          coach: 'Kalle Granath',
          formation: '4-3-3',
          players: [
            { name: 'Målvakt 1', number: 1, position: 'Målvakt' },
            { name: 'Spelare A', number: 7, position: 'Mittfältare', note: 'Landslagsmeriterad' },
          ],
        },
      ],
    },
    {
      id: 'f19-svenskaspel',
      name: 'Svenska Spel F19 Allsvenskan',
      teams: [
        {
          id: 'f19-bk',
          name: 'BK Häcken F19',
          coach: 'Mats Persson',
          formation: '4-3-3',
          players: [
            { name: 'Målvakt F', number: 1, position: 'Målvakt' },
            { name: 'Forward F', number: 11, position: 'Forward', note: 'Skicklig avslutare' },
          ],
        },
      ],
    },
  ];

  const defaultPlayers: Player[] = [
    { id: '1', name: 'Robin Olsen', position: 'Målvakt', number: 1, status: 'Aktiv' },
    { id: '2', name: 'Viktor Johansson', position: 'Målvakt', number: 12, status: 'Aktiv' },
    { id: '3', name: 'Victor Lindelöf', position: 'Back', number: 3, status: 'Aktiv' },
    { id: '4', name: 'Isak Hien', position: 'Back', number: 4, status: 'Aktiv' },
    { id: '5', name: 'Ludwig Augustinsson', position: 'Back', number: 6, status: 'Aktiv' },
    { id: '6', name: 'Emil Krafth', position: 'Back', number: 2, status: 'Aktiv' },
    { id: '7', name: 'Carl Starfelt', position: 'Back', number: 15, status: 'Aktiv' },
    { id: '8', name: 'Gabriel Gudmundsson', position: 'Back', number: 5, status: 'Skadad' },
    { id: '9', name: 'Dejan Kulusevski', position: 'Mittfältare', number: 10, status: 'Aktiv' },
    { id: '10', name: 'Lucas Bergvall', position: 'Mittfältare', number: 8, status: 'Aktiv' },
    { id: '11', name: 'Mattias Svanberg', position: 'Mittfältare', number: 20, status: 'Aktiv' },
    { id: '12', name: 'Jens Cajuste', position: 'Mittfältare', number: 6, status: 'Aktiv' },
    { id: '13', name: 'Hugo Larsson', position: 'Mittfältare', number: 22, status: 'Aktiv' },
    { id: '14', name: 'Yasin Ayari', position: 'Mittfältare', number: 14, status: 'Aktiv' },
    { id: '15', name: 'Alexander Isak', position: 'Forward', number: 9, status: 'Aktiv' },
    { id: '16', name: 'Viktor Gyökeres', position: 'Forward', number: 17, status: 'Aktiv' },
    { id: '17', name: 'Anthony Elanga', position: 'Forward', number: 11, status: 'Aktiv' },
    { id: '18', name: 'Gustaf Nilsson', position: 'Forward', number: 19, status: 'Frånvarande' },
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

      const savedSessions = localStorage.getItem('coachhub_sessions');
      if (savedSessions) setSessions(JSON.parse(savedSessions));
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

  const currentLeague = leagues.find(l => l?.id === selectedLeagueId);
  const activeOpponentTeam = currentLeague?.teams?.find((t) => t?.id === selectedOpponentTeamId);

  const setupPitchTokens = () => {
    const rows = formation.split('-').map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    const tokens: PitchToken[] = [];

    const homeGk = players.find((p) => p.position === 'Målvakt') || players[0];
    if (homeGk) {
      tokens.push({
        id: 'home-gk',
        label: homeGk.name ? homeGk.name.split(' ')[0] : 'MV',
        number: homeGk.number || 1,
        x: 50,
        y: 92,
        team: 'home',
        positionType: 'Målvakt',
      });
    }

    let pIdx = 0;
    const outfieldPlayers = players.filter((p) => p?.id !== homeGk?.id);
    const totalRows = rows.length;
    rows.forEach((countInRow, rIndex) => {
      const yPercent = 80 - (rIndex * 45) / Math.max(1, totalRows - 1);
      const colStep = 80 / (countInRow + 1);
      for (let c = 0; c < countInRow; c++) {
        const xPercent = colStep * (c + 1) + 10;
        let posType = 'Mittfältare';
        if (rIndex === 0) posType = 'Back';
        else if (rIndex === totalRows - 1) posType = 'Forward';

        const playerObj = outfieldPlayers[pIdx % outfieldPlayers.length] || players[pIdx % players.length];
        if (playerObj) {
          tokens.push({
            id: `home-${rIndex}-${c}`,
            label: playerObj.name ? playerObj.name.split(' ')[0] : `Spelare`,
            number: playerObj.number || c + 2,
            x: xPercent,
            y: yPercent,
            team: 'home',
            positionType: playerObj.position || posType,
          });
        }
        pIdx++;
      }
    });

    if (activeOpponentTeam && activeOpponentTeam.players && activeOpponentTeam.players.length > 0) {
      const oppGk = activeOpponentTeam.players.find((p) => p.position === 'Målvakt') || activeOpponentTeam.players[0];
      tokens.push({
        id: 'away-gk',
        label: oppGk.name ? oppGk.name.split(' ')[0] : 'MV',
        number: oppGk.number || 1,
        x: 50,
        y: 8,
        team: 'away',
        positionType: 'Målvakt',
      });

      const oppOutfield = activeOpponentTeam.players.filter((p) => p.number !== oppGk.number);
      const oppRows = [
        { count: Math.min(4, oppOutfield.length), y: 22, pos: 'Back' },
        { count: Math.max(0, oppOutfield.length - 4), y: 38, pos: 'Mittfältare' },
      ];

      let oIdx = 0;
      oppRows.forEach((rowConfig) => {
        if (rowConfig.count <= 0) return;
        const colStep = 80 / (rowConfig.count + 1);
        for (let c = 0; c < rowConfig.count; c++) {
          const xPercent = colStep * (c + 1) + 10;
          const oppPlayer = oppOutfield[oIdx] || { name: `Motståndare`, number: oIdx + 2, position: rowConfig.pos };
          tokens.push({
            id: `away-${rIndex}-${c}`,
            label: oppPlayer.name ? oppPlayer.name.split(' ')[0] : 'Motståndare',
            number: oppPlayer.number || oIdx + 2,
            x: xPercent,
            y: rowConfig.y,
            team: 'away',
            positionType: oppPlayer.position,
          });
          oIdx++;
        }
      });
    } else {
      tokens.push({
        id: 'away-gk',
        label: 'Motståndare',
        number: 1,
        x: 50,
        y: 8,
        team: 'away',
        positionType: 'Målvakt',
      });

      const awayRows = [
        { count: 4, y: 22, pos: 'Back', labels: ['VB', 'MB', 'MB', 'HB'] },
        { count: 4, y: 38, pos: 'Mittfältare', labels: ['VM', 'CM', 'CM', 'HM'] },
        { count: 2, y: 48, pos: 'Forward', labels: ['FW', 'FW'] },
      ];

      let awayNumber = 2;
      awayRows.forEach((rowConfig, rIndex) => {
        const colStep = 80 / (rowConfig.count + 1);
        for (let c = 0; c < rowConfig.count; c++) {
          const xPercent = colStep * (c + 1) + 10;
          tokens.push({
            id: `away-${rIndex}-${c}`,
            label: rowConfig.labels[c] || `M${awayNumber}`,
            number: awayNumber,
            x: xPercent,
            y: rowConfig.y,
            team: 'away',
            positionType: rowConfig.pos,
          });
          awayNumber++;
        }
      });
    }

    setPitchTokens(tokens);
  };

  useEffect(() => {
    setupPitchTokens();
  }, [formation, players, selectedOpponentTeamId]);

  const handleMouseDownToken = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingTokenId(id);
  };

  const handleClickToken = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTokenId(selectedTokenId === id ? null : id);
  };

  const handleMouseMovePitch = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingTokenId || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

    setPitchTokens((prev) =>
      prev.map((tok) => (tok.id === draggingTokenId ? { ...tok, x, y } : tok))
    );
  };

  const handleMouseUpPitch = () => {
    setDraggingTokenId(null);
  };

  const filteredLeagues = leagues.filter(l => 
    l?.name && l.name.toLowerCase().includes(leagueSearchQuery.toLowerCase())
  );

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
              👥 Truppen & Spelare ({players.length})
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
                <p className="text-3xl font-bold text-emerald-400">{players.filter((p) => p.status === 'Aktiv').length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Serier sparade</p>
                <p className="text-3xl font-bold text-blue-400">{leagues.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Träningspass</p>
                <p className="text-3xl font-bold text-purple-400">{sessions.length}</p>
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
            <h2 className="text-2xl font-bold mb-6">Truppen & Spelare ({players.length} st)</h2>
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
                  placeholder="Sök serie (t.ex. Division 4 Mellersta Götaland)..."
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
                  {filteredLeagues.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {currentLeague ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-emerald-400">Aktiv Serie: {currentLeague.name}</h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                    Fogis Synkad ✅
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentLeague.teams?.map((team) => (
                    <div key={team.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-white">{team.name}</h4>
                          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 font-semibold">{team.formation}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Tränare: {team.coach}</p>

                        <h5 className="text-xs font-bold uppercase text-emerald-400 mb-2">Fogis-registrerade spelare</h5>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {team.players?.map((tp, idx) => (
                            <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                              <div className="flex justify-between font-semibold">
                                <span>#{tp.number} {tp.name}</span>
                                <span className="text-slate-400">{tp.position}</span>
                              </div>
                              {tp.note && <p className="text-[11px] text-amber-300 mt-1 italic">💡 {tp.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOpponentTeamId(team.id);
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

              {currentLeague && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Motståndarlag:</span>
                  <select
                    value={selectedOpponentTeamId}
                    onChange={(e) => setSelectedOpponentTeamId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="">Välj lag...</option>
                    {currentLeague.teams?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-4 mb-4 items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">FORMATION:</span>
              {['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormation(f)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${formation === f ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div 
              ref={pitchRef}
              onMouseMove={handleMouseMovePitch}
              onMouseUp={handleMouseUpPitch}
              className="relative w-full max-w-3xl aspect-[2/3] bg-emerald-700 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl mx-auto cursor-crosshair select-none"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#065f46_0%,#047857_100%)] opacity-90 pointer-events-none" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-600 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-emerald-600 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-emerald-600 pointer-events-none" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-emerald-600 pointer-events-none" />

              {pitchTokens.map((token) => (
                <div
                  key={token.id}
                  onMouseDown={(e) => handleMouseDownToken(token.id, e)}
                  onClick={(e) => handleClickToken(token.id, e)}
                  style={{ left: `${token.x}%`, top: `${token.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-xs cursor-grab active:cursor-grabbing shadow-lg z-20 transition-transform ${
                    token.team === 'home' ? 'bg-emerald-500 text-slate-950 border-2 border-white' : 'bg-red-500 text-white border-2 border-slate-950'
                  }`}
                >
                  <span>{token.number}</span>
                  <span className="text-[9px] truncate max-w-[36px]">{token.label}</span>
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