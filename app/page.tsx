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
  category: 'Pojkar' | 'Flickor' | 'Cuper';
  teams: OpponentTeam[];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'oversikt' | 'trupp' | 'serier' | 'taktik' | 'traning' | 'ai'>('oversikt');

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string>('');
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<string>('');

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('Mittfältare');
  const [newPlayerNum, setNewPlayerNum] = useState<number | ''>('');

  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueCategory, setNewLeagueCategory] = useState<'Pojkar' | 'Flickor' | 'Cuper'>('Pojkar');

  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionFocus, setNewSessionFocus] = useState('');

  const [formation, setFormation] = useState<string>('4-3-3');

  const [pitchTokens, setPitchTokens] = useState<PitchToken[]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const pitchRef = useRef<HTMLDivElement | null>(null);

  const [drawingTool, setDrawingTool] = useState<'free' | 'arrow' | 'circle' | 'rect' | 'fill' | 'none'>('none');
  const [drawColor, setDrawColor] = useState<string>('#ffffff');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Standardserier och cuper för 11-manna (Sverige)
  const defaultLeagues: League[] = [
    {
      id: 'p19-allsvenskan',
      name: 'P19 Allsvenskan / Superettan (17–19 år)',
      category: 'Pojkar',
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
        {
          id: 'p19-aik',
          name: 'AIK FF P19',
          coach: 'Jonas Björgren',
          formation: '4-2-3-1',
          players: [
            { name: 'Målvakt 2', number: 30, position: 'Målvakt' },
            { name: 'Anfallare B', number: 9, position: 'Forward', note: 'Mycket snabb i djupled' },
          ],
        },
      ],
    },
    {
      id: 'p17-allsvenskan',
      name: 'P17 Allsvenskan / Div 1 (16–17 år)',
      category: 'Pojkar',
      teams: [
        {
          id: 'p17-hammarby',
          name: 'Hammarby IF P17',
          coach: 'Stefan Billborn',
          formation: '4-3-3',
          players: [{ name: 'Keeper', number: 1, position: 'Målvakt' }],
        },
      ],
    },
    {
      id: 'p16-serie',
      name: 'P16 Nationell / Regional (16 år)',
      category: 'Pojkar',
      teams: [
        {
          id: 'p16-malmo',
          name: 'Malmö FF P16',
          coach: 'Ola Larsson',
          formation: '4-4-2',
          players: [{ name: 'Spelare M', number: 10, position: 'Mittfältare' }],
        },
      ],
    },
    {
      id: 'p15-serie',
      name: 'P15 11-manna (Första året 11v11 - 15 år)',
      category: 'Pojkar',
      teams: [
        {
          id: 'p15-lokalt',
          name: 'Distriktsmotstånd P15',
          coach: 'Tränare',
          formation: '4-3-3',
          players: [{ name: 'Spelare P15', number: 1, position: 'Målvakt' }],
        },
      ],
    },
    {
      id: 'f19-svenskaspel',
      name: 'Svenska Spel F19 Allsvenskan (Flickor 17–19 år)',
      category: 'Flickor',
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
    {
      id: 'f17-allsvenskan',
      name: 'F17 Allsvenskan / Div 1 (Flickor 15–17 år)',
      category: 'Flickor',
      teams: [
        {
          id: 'f17-ifk',
          name: 'IFK Värnamo F17',
          coach: 'Tränare F',
          formation: '4-4-2',
          players: [{ name: 'Spelare F17', number: 5, position: 'Back' }],
        },
      ],
    },
    {
      id: 'stora-cuper',
      name: 'Stora Cuper & Turneringar (11-manna)',
      category: 'Cuper',
      teams: [
        {
          id: 'gothia-cup',
          name: 'Gothia Cup (International)',
          coach: 'Okänd',
          formation: '4-3-3',
          players: [{ name: 'Motståndare Gothia', number: 9, position: 'Forward' }],
        },
        {
          id: 'dana-cup',
          name: 'Dana Cup (Danmark)',
          coach: 'Okänd',
          formation: '4-2-3-1',
          players: [{ name: 'Motståndare Dana', number: 10, position: 'Mittfältare' }],
        },
      ],
    },
  ];

  // Fullständig trupp med registrerade spelare
  const defaultPlayers: Player[] = [
    // Målvakter
    { id: '1', name: 'Robin Olsen', position: 'Målvakt', number: 1, status: 'Aktiv' },
    { id: '2', name: 'Viktor Johansson', position: 'Målvakt', number: 12, status: 'Aktiv' },
    // Backar
    { id: '3', name: 'Victor Lindelöf', position: 'Back', number: 3, status: 'Aktiv' },
    { id: '4', name: 'Isak Hien', position: 'Back', number: 4, status: 'Aktiv' },
    { id: '5', name: 'Ludwig Augustinsson', position: 'Back', number: 6, status: 'Aktiv' },
    { id: '6', name: 'Emil Krafth', position: 'Back', number: 2, status: 'Aktiv' },
    { id: '7', name: 'Carl Starfelt', position: 'Back', number: 15, status: 'Aktiv' },
    { id: '8', name: 'Gabriel Gudmundsson', position: 'Back', number: 5, status: 'Skadad' },
    // Mittfältare
    { id: '9', name: 'Dejan Kulusevski', position: 'Mittfältare', number: 10, status: 'Aktiv' },
    { id: '10', name: 'Lucas Bergvall', position: 'Mittfältare', number: 8, status: 'Aktiv' },
    { id: '11', name: 'Mattias Svanberg', position: 'Mittfältare', number: 20, status: 'Aktiv' },
    { id: '12', name: 'Jens Cajuste', position: 'Mittfältare', number: 6, status: 'Aktiv' },
    { id: '13', name: 'Hugo Larsson', position: 'Mittfältare', number: 22, status: 'Aktiv' },
    { id: '14', name: 'Yasin Ayari', position: 'Mittfältare', number: 14, status: 'Aktiv' },
    // Forwards / Anfallare
    { id: '15', name: 'Alexander Isak', position: 'Forward', number: 9, status: 'Aktiv' },
    { id: '16', name: 'Viktor Gyökeres', position: 'Forward', number: 17, status: 'Aktiv' },
    { id: '17', name: 'Anthony Elanga', position: 'Forward', number: 11, status: 'Aktiv' },
    { id: '18', name: 'Gustaf Nilsson', position: 'Forward', number: 19, status: 'Frånvarande' },
  ];

  useEffect(() => {
    const savedPlayers = localStorage.getItem('coachhub_players');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    } else {
      setPlayers(defaultPlayers);
      localStorage.setItem('coachhub_players', JSON.stringify(defaultPlayers));
    }

    const savedLeagues = localStorage.getItem('coachhub_leagues');
    if (savedLeagues) {
      const parsed = JSON.parse(savedLeagues);
      setLeagues(parsed);
      if (parsed.length > 0) setActiveLeagueId(parsed[0].id);
    } else {
      setLeagues(defaultLeagues);
      setActiveLeagueId(defaultLeagues[0].id);
      localStorage.setItem('coachhub_leagues', JSON.stringify(defaultLeagues));
    }

    const savedSessions = localStorage.getItem('coachhub_sessions');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  useEffect(() => {
    if (players.length > 0) localStorage.setItem('coachhub_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (leagues.length > 0) localStorage.setItem('coachhub_leagues', JSON.stringify(leagues));
  }, [leagues]);

  const activeLeague = leagues.find((l) => l.id === activeLeagueId);
  const activeOpponentTeam = activeLeague?.teams.find((t) => t.id === selectedOpponentTeamId);

  const setupPitchTokens = () => {
    const rows = formation.split('-').map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    const tokens: PitchToken[] = [];

    const homeGk = players.find((p) => p.position === 'Målvakt') || players[0] || { name: 'Målvakt', number: 1, position: 'Målvakt' };
    tokens.push({
      id: 'home-gk',
      label: homeGk.name.split(' ')[0],
      number: homeGk.number,
      x: 50,
      y: 92,
      team: 'home',
      positionType: 'Målvakt',
    });

    let pIdx = 0;
    const outfieldPlayers = players.filter((p) => p.id !== homeGk.id);
    const totalRows = rows.length;
    rows.forEach((countInRow, rIndex) => {
      const yPercent = 80 - (rIndex * 45) / Math.max(1, totalRows - 1);
      const colStep = 80 / (countInRow + 1);
      for (let c = 0; c < countInRow; c++) {
        const xPercent = colStep * (c + 1) + 10;
        let posType = 'Mittfältare';
        if (rIndex === 0) posType = 'Back';
        else if (rIndex === totalRows - 1) posType = 'Forward';

        const playerObj = outfieldPlayers[pIdx % outfieldPlayers.length] || players[pIdx % players.length] || { name: `Spelare ${pIdx + 1}`, number: pIdx + 2, position: posType };
        tokens.push({
          id: `home-${rIndex}-${c}`,
          label: playerObj.name.split(' ')[0],
          number: playerObj.number,
          x: xPercent,
          y: yPercent,
          team: 'home',
          positionType: playerObj.position || posType,
        });
        pIdx++;
      }
    });

    if (activeOpponentTeam && activeOpponentTeam.players.length > 0) {
      const oppGk = activeOpponentTeam.players.find((p) => p.position === 'Målvakt') || activeOpponentTeam.players[0];
      tokens.push({
        id: 'away-gk',
        label: oppGk.name.split(' ')[0],
        number: oppGk.number,
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
      oppRows.forEach((rowConfig, rIndex) => {
        if (rowConfig.count <= 0) return;
        const colStep = 80 / (rowConfig.count + 1);
        for (let c = 0; c < rowConfig.count; c++) {
          const xPercent = colStep * (c + 1) + 10;
          const oppPlayer = oppOutfield[oIdx] || { name: `Motståndare ${oIdx + 2}`, number: oIdx + 2, position: rowConfig.pos };
          tokens.push({
            id: `away-${rIndex}-${c}`,
            label: oppPlayer.name.split(' ')[0],
            number: oppPlayer.number,
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

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingTool === 'none') return;
    setSelectedTokenId(null);
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);

    if (drawingTool === 'free') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || drawingTool === 'none') return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const coords = getCanvasCoords(e);

    if (drawingTool === 'free') {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || drawingTool === 'none') return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const coords = getCanvasCoords(e);
    ctx.strokeStyle = drawColor;
    ctx.fillStyle = drawColor + '40';
    ctx.lineWidth = 3;

    if (drawingTool === 'rect') {
      ctx.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
    } else if (drawingTool === 'fill') {
      ctx.fillRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
    } else if (drawingTool === 'circle') {
      const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (drawingTool === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      const angle = Math.atan2(coords.y - startPos.y, coords.x - startPos.x);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x - 12 * Math.cos(angle - Math.PI / 6), coords.y - 12 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(coords.x - 12 * Math.cos(angle + Math.PI / 6), coords.y - 12 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = drawColor;
      ctx.fill();
    }
    setIsDrawing(false);
  };

  const handleImportLeague = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName.trim()) return;

    const newLeagueObj: League = {
      id: Date.now().toString(),
      name: newLeagueName,
      category: newLeagueCategory,
      teams: [
        {
          id: 'lag-1',
          name: 'Motståndarlag A',
          coach: 'Tränare A',
          formation: '4-4-2',
          players: [
            { name: 'Målvakt 1', number: 1, position: 'Målvakt' },
            { name: 'Spelare 2', number: 7, position: 'Mittfältare', note: 'Viktig spelfördelare' },
          ],
        },
      ],
    };

    setLeagues([...leagues, newLeagueObj]);
    setActiveLeagueId(newLeagueObj.id);
    setNewLeagueName('');
  };

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

  const handleAiGenerate = () => {
    if (!aiPrompt) return;
    setAiResponse(
      `🤖 AI-RÅD FÖR: "${aiPrompt}"\n\n1. Rekommenderad Övning: 4v2 Smålagsspel med hög press i 15 min.\n2. Taktiskt skifte: Kliv högre med ytterbackarna när motståndarna spelar från målvakt.\n3. Fokus på nästa pass: Öva på sista passningen i sista tredjedelen.`
    );
  };

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
              🏆 Serier & Motståndare (11-manna)
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
                <p className="text-slate-400 text-sm mb-1">Serier & Cuper</p>
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          player.status === 'Aktiv' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          player.status === 'Skadad' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
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

        {activeTab === 'serier' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">🏆 Nationella Serier & Cuper (11-manna)</h2>
            <p className="text-xs text-slate-400 mb-6">Alla svenska serier och cuper för flickor och pojkar från 15 år och uppåt.</p>

            <form onSubmit={handleImportLeague} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Namn på serie / cup</label>
                <input
                  type="text"
                  placeholder="t.ex. Distriktsserie P15"
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Kategori</label>
                <select
                  value={newLeagueCategory}
                  onChange={(e) => setNewLeagueCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Pojkar">Pojkar (15–19 år)</option>
                  <option value="Flickor">Flickor (15–19 år)</option>
                  <option value="Cuper">Cuper & Turneringar</option>
                </select>
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-6 rounded-lg text-sm transition">
                + Lägg till serie
              </button>
            </form>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase">Välj Serie / Cup:</span>
              <select
                value={activeLeagueId}
                onChange={(e) => setActiveLeagueId(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-emerald-400 font-semibold px-4 py-2 rounded-lg text-sm focus:outline-none"
              >
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    [{l.category}] {l.name}
                  </option>
                ))}
              </select>
            </div>

            {activeLeague && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeLeague.teams.map((team) => (
                  <div key={team.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{team.name}</h3>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 font-semibold">{team.formation}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Tränare: {team.coach}</p>

                      <h4 className="text-xs font-bold uppercase text-emerald-400 mb-2">Trupp & Noteringar ({team.players.length})</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {team.players.map((tp, idx) => (
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
                      className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-lg text-xs transition text-center"
                    >
                      🎯 Analysera på Taktiktavlan
                    </button>
                  </div>
                ))}
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

              {activeLeague && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Motståndarlag:</span>
                  <select
                    value={selectedOpponentTeamId}
                    onChange={(e) => setSelectedOpponentTeamId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="">Välj lag från serie...</option>
                    {activeLeague.teams.map((t) => (
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

              <canvas
                ref={canvasRef}
                width={600}
                height={900}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />

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
            <form onSubmit={handleAddSession} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 grid grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Datum</label>
                <input
                  type="text"
                  placeholder="t.ex. Tisdag"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Rubrik</label>
                <input
                  type="text"
                  placeholder="t.ex. Anfallsspel"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Fokus</label>
                <input
                  type="text"
                  placeholder="t.ex. Djupled"
                  value={newSessionFocus}
                  onChange={(e) => setNewSessionFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition">
                + Lägg till
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-white mb-1">{session.title}</h3>
                  <p className="text-xs text-slate-400">Fokus: {session.focus}</p>
                </div>
              ))}
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
              <button onClick={handleAiGenerate} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-6 rounded-lg text-sm transition">
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