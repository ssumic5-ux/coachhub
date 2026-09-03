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
  x: number; // Procent av planens bredd (0 - 100)
  y: number; // Procent av planens höjd (0 - 100)
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

  // Datatillstånd
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string>('');
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<string>('');

  // Formulär - Spelare
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('Mittfältare');
  const [newPlayerNum, setNewPlayerNum] = useState<number | ''>('');

  // Formulär - Serieimport / Skapande
  const [newLeagueName, setNewLeagueName] = useState('');
  const [importPreset, setImportPreset] = useState('div4');

  // Formulär - Träning
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionFocus, setNewSessionFocus] = useState('');

  // Matchinfo & Dynamisk Taktik
  const [nextMatch, setNextMatch] = useState('Lördag 15:00 vs BK Häcken');
  const [formation, setFormation] = useState<string>('4-3-3');
  const [customFormationInput, setCustomFormationInput] = useState<string>('');

  // Färger för lag
  const [homeKitColor, setHomeKitColor] = useState<string>('#10b981'); // Grön
  const [awayKitColor, setAwayKitColor] = useState<string>('#ef4444'); // Röd

  // Spelare på planen
  const [pitchTokens, setPitchTokens] = useState<PitchToken[]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const pitchRef = useRef<HTMLDivElement | null>(null);

  // Rittavla (Canvas)
  const [drawingTool, setDrawingTool] = useState<'free' | 'arrow' | 'circle' | 'rect' | 'fill' | 'none'>('none');
  const [drawColor, setDrawColor] = useState<string>('#ffffff');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // AI-Assistent
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Standard-serier med förifyllda motståndare och spelartrupper
  const defaultLeagues: League[] = [
    {
      id: 'div4-gotaland',
      name: 'Division 4 Mellersta Götaland',
      teams: [
        {
          id: 'bk-hacket',
          name: 'BK Häcken FF',
          coach: 'Martin Eriksson',
          formation: '4-3-3',
          players: [
            { name: 'Lucas Berg', number: 1, position: 'Målvakt', note: 'Bra på utsparkar' },
            { name: 'Filip Johansson', number: 2, position: 'Back', note: 'Snabb ytterback' },
            { name: 'Simon Ek', number: 4, position: 'Back', note: 'Stark i luftrummet' },
            { name: 'Jesper Lind', number: 8, position: 'Mittfältare', note: 'Lagkapten, spelfördelare' },
            { name: 'Oskar Palm', number: 10, position: 'Forward', note: 'Vassa avslut, skottvillig' },
          ],
        },
        {
          id: 'IFK-varnamo-u',
          name: 'IFK Värnamo U',
          coach: 'Håkan Nilsson',
          formation: '4-4-2',
          players: [
            { name: 'Noah Stenberg', number: 1, position: 'Målvakt' },
            { name: 'Elias Franzén', number: 3, position: 'Back' },
            { name: 'Viktor Dahl', number: 6, position: 'Mittfältare', note: 'Hårt arbetande centralt' },
            { name: 'Emil Sandström', number: 9, position: 'Forward', note: 'Snabb i djupled' },
          ],
        },
        {
          id: 'if-elfsborg-2',
          name: 'IF Elfsborg B',
          coach: 'Stefan Larsson',
          formation: '3-5-2',
          players: [
            { name: 'William Gran', number: 30, position: 'Målvakt' },
            { name: 'Rasmus Hedlund', number: 5, position: 'Back' },
            { name: 'Kevin Wallin', number: 7, position: 'Mittfältare', note: 'Kreativ trequartista' },
            { name: 'Albin Zetterlund', number: 11, position: 'Forward', note: 'Vänsterfotad målskytt' },
          ],
        },
      ],
    },
  ];

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
        { id: '5', name: 'Viktor Gyökeres', position: 'Forward', number: 17, status: 'Aktiv' },
        { id: '6', name: 'Lucas Bergvall', position: 'Mittfältare', number: 8, status: 'Aktiv' },
      ]);
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

  // Hämta aktiv serie och motståndarlag
  const activeLeague = leagues.find((l) => l.id === activeLeagueId);
  const activeOpponentTeam = activeLeague?.teams.find((t) => t.id === selectedOpponentTeamId);

  // Sätt upp spelare på planen (Hemma + Vald Motståndare)
  const setupPitchTokens = () => {
    const rows = formation.split('-').map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    const tokens: PitchToken[] = [];

    // --- HEMMALAGET (11 SPELARE) ---
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

    // --- MOTSTÅNDARLAGET (Från vald serie eller Standard) ---
    if (activeOpponentTeam && activeOpponentTeam.players.length > 0) {
      // Placera motståndarens spelare om de finns sparade
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
      // Standard 11 motståndare i 4-4-2 om ingen specifik trupp valts
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

  // Byt ut spelare på token
  const handleSwapPlayer = (tokenId: string, newPlayerName: string, newPlayerNum: number) => {
    setPitchTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId) {
          return {
            ...tok,
            label: newPlayerName.split(' ')[0],
            number: newPlayerNum,
          };
        }
        return tok;
      })
    );
    setSelectedTokenId(null);
  };

  // Drag & Drop
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

  // Canvas Rithantering
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

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Hantera Serier
  const handleImportLeague = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName.trim()) return;

    const newLeagueObj: League = {
      id: Date.now().toString(),
      name: newLeagueName,
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
        {
          id: 'lag-2',
          name: 'Motståndarlag B',
          coach: 'Tränare B',
          formation: '4-3-3',
          players: [
            { name: 'Målvakt X', number: 1, position: 'Målvakt' },
            { name: 'Anfallare Y', number: 9, position: 'Forward', note: 'Snabb i djupled' },
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
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Aktiva Spelare</p>
                <p className="text-3xl font-bold text-emerald-400">{players.filter((p) => p.status === 'Aktiv').length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Aktiva Serier</p>
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

        {/* SERIER & MOTSTÅNDARANALYS */}
        {activeTab === 'serier' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">🏆 Serier & Motståndartrupper</h2>
            <p className="text-xs text-slate-400 mb-6">Importera din serie för att få tillgång till motståndarnas trupper och spelarnoteringar inför matcher och genomgångar.</p>

            {/* Importera ny serie */}
            <form onSubmit={handleImportLeague} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-2">Namn på serie / turnering</label>
                <input
                  type="text"
                  placeholder="t.ex. Division 4 Mellersta Götaland"
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-6 rounded-lg text-sm transition">
                + Importera Serie
              </button>
            </form>

            {/* Välj aktiv serie */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase">Aktiv Serie:</span>
              <select
                value={activeLeagueId}
                onChange={(e) => setActiveLeagueId(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-emerald-400 font-semibold px-4 py-2 rounded-lg text-sm focus:outline-none"
              >
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.teams.length} lag)
                  </option>
                ))}
              </select>
            </div>

            {/* Motståndarlag i serien */}
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

                      <h4 className="text-xs font-bold uppercase text-emerald-400 mb-2">Trupp & Nyckelspelare ({team.players.length})</h4>
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

        {/* TAKTIKTAVLA */}
        {activeTab === 'taktik' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold">Interaktiv Taktiktavla & Motstånd</h2>
                <p className="text-xs text-slate-400">
                  {activeOpponentTeam ? `Tränar mot: ${activeOpponentTeam.name}` : 'Välj motståndare under Serier eller kör standard 4-4-2'}
                </p>
              </div>

              {/* Välj motståndare snabbt direkt på tavlan */}
              {activeLeague && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Motståndarlag:</span>
                  <select
                    value={selectedOpponentTeamId}
                    onChange={(e) => setSelectedOpponentTeamId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="">Standard (4-4-2)</option>
                    {activeLeague.teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Formationer */}
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
              </div>
            </div>

            {/* INSTÄLLNINGAR FÖR LAGFÄRGER OCH RITVERKTYG */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Vårt Lag:</span>
                  <input
                    type="color"
                    value={homeKitColor}
                    onChange={(e) => setHomeKitColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Motståndare:</span>
                  <input
                    type="color"
                    value={awayKitColor}
                    onChange={(e) => setAwayKitColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>
              </div>

              {/* Verktyg */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawingTool('none')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    drawingTool === 'none' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  🖐️ Spelar-läge
                </button>
                <button
                  onClick={() => setDrawingTool('free')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    drawingTool === 'free' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ✏️ Rita
                </button>
                <button
                  onClick={() => setDrawingTool('arrow')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    drawingTool === 'arrow' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ➔ Pil
                </button>
                <button
                  onClick={() => setDrawingTool('circle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    drawingTool === 'circle' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ⭕ Cirkel
                </button>
              </div>

              {/* Rensa & Återställ */}
              <div className="flex items-center gap-3">
                <button
                  onClick={clearCanvas}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                >
                  🗑️ Rensa linjer
                </button>
                <button
                  onClick={setupPitchTokens}
                  className="bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                >
                  🔄 Återställ
                </button>
              </div>
            </div>

            {/* INTERAKTIV FOTBOLLSPLAN */}
            <div
              ref={pitchRef}
              onMouseMove={handleMouseMovePitch}
              onMouseUp={handleMouseUpPitch}
              onClick={() => setSelectedTokenId(null)}
              className="bg-emerald-800 border-4 border-slate-800 rounded-2xl relative h-[650px] overflow-hidden shadow-2xl select-none"
            >
              {/* PLANLINJER */}
              <div className="absolute inset-0 border-2 border-white/70 m-4 rounded-sm pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/70 transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-72 h-28 border-b-2 border-l-2 border-r-2 border-white/70"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-12 border-b-2 border-l-2 border-r-2 border-white/70"></div>

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-28 border-t-2 border-l-2 border-r-2 border-white/70"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-12 border-t-2 border-l-2 border-r-2 border-white/70"></div>
              </div>

              {/* CANVAS FÖR RITNING */}
              <canvas
                ref={canvasRef}
                width={800}
                height={650}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                className={`absolute inset-0 w-full h-full ${
                  drawingTool !== 'none' ? 'z-30 cursor-crosshair' : 'z-10 pointer-events-none'
                }`}
              />

              {/* SPELARTOKENS */}
              {pitchTokens.map((token) => {
                const isSelected = selectedTokenId === token.id;

                return (
                  <div
                    key={token.id}
                    onMouseDown={(e) => handleMouseDownToken(token.id, e)}
                    onClick={(e) => handleClickToken(token.id, e)}
                    style={{
                      left: `${token.x}%`,
                      top: `${token.y}%`,
                      backgroundColor: token.team === 'home' ? homeKitColor : awayKitColor,
                    }}
                    className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing px-2.5 py-1 rounded-full border-2 ${
                      isSelected ? 'border-yellow-400 scale-125 z-40' : 'border-white'
                    } shadow-xl flex items-center gap-1.5 transition-transform hover:scale-110 select-none`}
                  >
                    <span className="text-xs font-bold text-white">#{token.number}</span>
                    <span className="text-xs font-semibold text-white truncate max-w-[80px]">{token.label}</span>

                    {/* RULLISTA FÖR ATT BYTA SPELARE (Gäller främst hemmalaget) */}
                    {isSelected && token.team === 'home' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl z-50 w-56 text-slate-100"
                      >
                        <p className="text-[11px] font-semibold text-slate-400 mb-2 border-b border-slate-800 pb-1">
                          Byt ut mot truppspelare:
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {players.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSwapPlayer(token.id, p.name, p.number)}
                              className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-emerald-500/20 hover:text-emerald-400 flex justify-between items-center transition"
                            >
                              <span className="font-medium truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400">#{p.number}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                placeholder="t.ex. Hur ska vi pressa BK Häcken som spelar 4-3-3?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm focus:outline-none focus:border-emerald-500 mb-4"
              />
              <button
                onClick={handleAiGenerate}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py.5 px-6 rounded-lg text-sm transition"
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