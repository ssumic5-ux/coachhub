'use client';

import React, { useState, useEffect, useRef } from 'react';

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

  // Färger för lag
  const [homeKitColor, setHomeKitColor] = useState<string>('#10b981'); // Grön
  const [awayKitColor, setAwayKitColor] = useState<string>('#ef4444'); // Röd

  // Rittavla (Canvas)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawingTool, setDrawingTool] = useState<'free' | 'arrow' | 'circle' | 'rect' | 'fill'>('free');
  const [drawColor, setDrawColor] = useState<string>('#ffffff'); // Vit standard för ritning
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Canvas Rithantering
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    if (!isDrawing || !canvasRef.current) return;
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
    if (!isDrawing || !canvasRef.current) return;
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
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold">Interaktiv Taktiktavla</h2>
                <p className="text-xs text-slate-400">Aktiv formation: <span className="text-emerald-400 font-bold">{formation}</span></p>
              </div>

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

                <form onSubmit={handleCustomFormationSubmit} className="flex gap-1 ml-2">
                  <input
                    type="text"
                    placeholder="Egen formation"
                    value={customFormationInput}
                    onChange={(e) => setCustomFormationInput(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-28 focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition">
                    OK
                  </button>
                </form>
              </div>
            </div>

            {/* INSTÄLLNINGAR FÖR LAGFÄRGER OCH RITVERKTYG */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-4">
              {/* Lagfärger */}
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
                  onClick={() => setDrawingTool('free')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    drawingTool === 'free' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ✏️ Frihand
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
                <button
                  onClick={() => setDrawingTool('rect')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    drawingTool === 'rect' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  🔲 Fyrkant
                </button>
                <button
                  onClick={() => setDrawingTool('fill')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    drawingTool === 'fill' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  🎨 Markera Yta
                </button>
              </div>

              {/* Ritfärg & Rensa */}
              <div className="flex items-center gap-3">
                {[
                  { color: '#ffffff', label: 'Vit' },
                  { color: '#facc15', label: 'Gul' },
                  { color: '#ef4444', label: 'Röd' },
                  { color: '#3b82f6', label: 'Blå' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setDrawColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      drawColor === c.color ? 'scale-125 border-emerald-400' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}

                <button
                  onClick={clearCanvas}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-semibold px-3 py-1.5 rounded-lg text-xs transition ml-2"
                >
                  🗑️ Rensa
                </button>
              </div>
            </div>

            {/* REALISTISK FOTBOLLSPLAN */}
            <div className="bg-emerald-800 border-4 border-slate-800 rounded-2xl relative min-h-[600px] flex flex-col justify-between items-center overflow-hidden shadow-2xl">
              {/* Rit-Canvas */}
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                className="absolute inset-0 w-full h-full z-20 cursor-crosshair"
              />

              {/* REALISTISKA LINJER */}
              <div className="absolute inset-0 border-2 border-white/70 m-4 rounded-sm pointer-events-none">
                {/* Mittlinje */}
                <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/70 transform -translate-y-1/2"></div>
                {/* Mittcirkel */}
                <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                {/* Övre Straffområde (Borta) */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-72 h-28 border-b-2 border-l-2 border-r-2 border-white/70"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-12 border-b-2 border-l-2 border-r-2 border-white/70"></div>

                {/* Nedre Straffområde (Hemma) */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-28 border-t-2 border-l-2 border-r-2 border-white/70"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-12 border-t-2 border-l-2 border-r-2 border-white/70"></div>
              </div>

              {/* MOTSTÅNDARLAGET (ÖVRE HALVA - ANFALLSRIKTNING) */}
              <div className="w-full flex justify-around items-center pt-8 z-10 pointer-events-none">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`away-${i}`}
                    style={{ backgroundColor: awayKitColor }}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs text-white shadow-lg"
                  >
                    M{i}
                  </div>
                ))}
              </div>

              {/* VÅRT LAG (NEDRE HALVA - DYNAMISK FORMATION) */}
              <div className="w-full flex flex-col-reverse justify-around items-center flex-1 pb-6 z-10 pointer-events-none gap-4">
                {/* Målvakt */}
                <div className="flex justify-center w-full">
                  <div
                    style={{ backgroundColor: homeKitColor }}
                    className="w-10 h-10 rounded-full border-2 border-white flex flex-col items-center justify-center shadow-lg"
                  >
                    <span className="text-[10px] font-bold text-white">#1</span>
                  </div>
                </div>

                {/* Spelare uppställda efter formation */}
                {formationRows.map((count, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center items-center gap-6 w-full">
                    {Array.from({ length: count }).map((_, colIndex) => {
                      const playerIndex = rowIndex * 3 + colIndex + 1;
                      const player = players[playerIndex % players.length];
                      return (
                        <div
                          key={colIndex}
                          style={{ backgroundColor: homeKitColor }}
                          className="px-3 py-1.5 rounded-full border-2 border-white shadow-lg text-center flex items-center gap-1.5"
                        >
                          <span className="text-xs font-bold text-white">#{player?.number || playerIndex + 1}</span>
                          <span className="text-xs font-semibold text-white truncate max-w-[80px]">
                            {player?.name ? player.name.split(' ')[0] : `P${playerIndex + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
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