import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Map as MapIcon, 
  TreePine, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Cpu,
  Globe,
  Mountain,
  Home,
  Route,
  Wand2,
  Terminal,
  CheckCircle2
} from 'lucide-react';

// --- Constants ---
const AGENT_TYPES = [
  { id: 'main', name: 'Main Architect', icon: Cpu, color: 'text-blue-400' },
  { id: 'tile', name: 'Tile Generator', icon: Box, color: 'text-emerald-400' },
  { id: 'terrain', name: 'Terrain Shaper', icon: Mountain, color: 'text-amber-400' },
  { id: 'location', name: 'Location Designer', icon: MapIcon, color: 'text-purple-400' },
  { id: 'building', name: 'Structure Builder', icon: Home, color: 'text-red-400' },
  { id: 'road', name: 'Pathfinder', icon: Route, color: 'text-cyan-400' },
  { id: 'nature', name: 'Nature Decorator', icon: TreePine, color: 'text-green-400' },
  { id: 'polish', name: 'World Polisher', icon: Wand2, color: 'text-pink-400' },
];

const GENERATION_STAGES = [
  { id: 'planning', name: 'Planning & Blueprint', agent: 'main' },
  { id: 'tiles', name: 'Generating Base Tiles', agent: 'tile' },
  { id: 'terrain', name: 'Shaping Terrain', agent: 'terrain' },
  { id: 'locations', name: 'Placing Locations', agent: 'location' },
  { id: 'buildings', name: 'Constructing Buildings', agent: 'building' },
  { id: 'roads', name: 'Connecting Roads', agent: 'road' },
  { id: 'nature', name: 'Adding Nature', agent: 'nature' },
  { id: 'polish', name: 'Polishing World', agent: 'polish' },
];

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [modelType, setModelType] = useState('gpt-4');
  const [customModelId, setCustomModelId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [completedStages, setCompletedStages] = useState([]);
  
  const logsEndRef = useRef(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [logs]);

  const addLog = (agentId, message) => {
    const agent = AGENT_TYPES.find(a => a.id === agentId);
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      timestamp: timeString,
      agentId,
      agentName: agent ? agent.name : 'System',
      message
    }]);
  };

  const getCurrentModel = () => {
    if (modelType === 'custom') return customModelId || 'unknown-model';
    return modelType;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const runGenerationStep = (stageIndex) => {
    if (stageIndex >= GENERATION_STAGES.length) {
      setIsGenerating(false);
      setCurrentStageIndex(-1);
      addLog('main', 'World generation completed successfully!');
      return;
    }

    const stage = GENERATION_STAGES[stageIndex];
    setCurrentStageIndex(stageIndex);
    addLog(stage.agent, `Starting task: ${stage.name}`);

    const steps = [
      "Analyzing context...",
      "Calling Tool API...",
      "Processing response...",
      "Updating world state..."
    ];

    let stepCount = 0;
    const maxSteps = 3 + Math.floor(Math.random() * 2);

    const executeNextStep = () => {
      if (!isGenerating || isPaused) return;

      if (stepCount < maxSteps) {
        const randomStep = steps[Math.floor(Math.random() * steps.length)];
        addLog(stage.agent, randomStep);
        stepCount++;
        
        const timeoutId = setTimeout(executeNextStep, 600 + Math.random() * 400);
        timeoutsRef.current.push(timeoutId);
      } else {
        addLog(stage.agent, `Task completed: ${stage.name}`);
        setCompletedStages(prev => [...prev, stageIndex]);
        setCurrentStageIndex(-1);
        
        const timeoutId = setTimeout(() => {
          if (!isPaused && isGenerating) {
            runGenerationStep(stageIndex + 1);
          }
        }, 800);
        timeoutsRef.current.push(timeoutId);
      }
    };

    executeNextStep();
  };

  const handleStart = () => {
    if (!prompt.trim()) {
      addLog('system', 'Error: Please enter a world description.');
      return;
    }

    clearAllTimeouts();
    setIsGenerating(true);
    setIsPaused(false);
    setLogs([]);
    setCompletedStages([]);
    setCurrentStageIndex(-1);
    
    addLog('main', `Initializing generation for: "${prompt}"`);
    addLog('main', `Using model: ${getCurrentModel()}`);
    
    const timeoutId = setTimeout(() => {
      if (!isPaused) runGenerationStep(0);
    }, 1000);
    timeoutsRef.current.push(timeoutId);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      addLog('system', 'Generation resumed.');
      if (isGenerating && currentStageIndex === -1 && completedStages.length < GENERATION_STAGES.length) {
        const nextStage = completedStages.length;
        runGenerationStep(nextStage);
      }
    } else {
      addLog('system', 'Generation paused by user.');
    }
  };

  const handleStop = () => {
    clearAllTimeouts();
    setIsGenerating(false);
    setIsPaused(false);
    setCurrentStageIndex(-1);
    addLog('system', 'Generation stopped by user.');
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-[#2d2d2d] border-b border-black flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-blue-500" />
          <h1 className="font-bold text-gray-100 tracking-wide">AI WORLD GENERATOR</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded text-xs">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? (isPaused ? 'bg-amber-500' : 'bg-green-500 animate-pulse') : 'bg-gray-600'}`}></div>
            <span>{isGenerating ? (isPaused ? 'PAUSED' : 'GENERATING') : 'IDLE'}</span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded hover:bg-white/10">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#252525] border-r border-black flex flex-col shrink-0">
          <div className="p-3 border-b border-black/50 font-semibold text-xs uppercase text-gray-500">Agents</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {AGENT_TYPES.map(agent => {
              const Icon = agent.icon;
              const isActive = isGenerating && currentStageIndex !== -1 && GENERATION_STAGES[currentStageIndex]?.agent === agent.id;
              const isCompleted = completedStages.some(idx => GENERATION_STAGES[idx].agent === agent.id);
              
              return (
                <div key={agent.id} className={`
                  p-3 rounded-lg border flex flex-col items-center gap-2 transition-all
                  ${isActive ? 'bg-blue-900/20 border-blue-500 scale-105' : ''}
                  ${isCompleted ? 'bg-emerald-900/10 border-emerald-500/30 opacity-70' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-900/40 border-gray-800 opacity-50' : ''}
                `}>
                  {isCompleted && <CheckCircle2 size={12} className="absolute top-2 right-2 text-emerald-500" />}
                  {isActive && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>}
                  <Icon size={20} className={agent.color} />
                  <span className="text-[10px] text-center text-gray-400">{agent.name}</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 bg-[#111] relative flex flex-col">
          <div className="h-10 bg-[#2d2d2d] border-b border-black flex items-center px-4 gap-2">
            <Box size={16} className="text-gray-500"/>
            <MapIcon size={16} className="text-gray-500"/>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center space-y-4">
                  <Cpu size={64} className="text-blue-500 animate-spin mx-auto" />
                  <h2 className="text-xl font-bold text-white">Generating...</h2>
                  <p className="text-sm text-gray-400">
                    {currentStageIndex !== -1 ? GENERATION_STAGES[currentStageIndex].name : "Processing"}
                  </p>
                  <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${(completedStages.length / GENERATION_STAGES.length) * 100}%`}}></div>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-30">
                  <Globe size={80} className="mx-auto mb-4 text-gray-600" />
                  <p>Ready</p>
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 px-4 py-2 rounded-full">
              {!isGenerating ? (
                <button onClick={handleStart} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm">
                  <Play size={14} /> Generate
                </button>
              ) : (
                <>
                  <button onClick={handlePause} className="p-2 hover:bg-white/10 rounded-full">
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button onClick={handleStop} className="p-2 hover:bg-red-500/20 text-red-400 rounded-full">
                    <Square size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-[#252525] border-l border-black flex flex-col shrink-0">
          <div className="p-2 border-b border-black/50 font-semibold text-xs text-gray-500">Console</div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-[#1a1a1a]">
            {logs.length === 0 && <div className="text-gray-600 text-center mt-10">No logs</div>}
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-1 border-b border-gray-800/30 last:border-0">
                <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                <Terminal size={12} className="text-gray-500 shrink-0 mt-0.5" />
                <span className={`shrink-0 font-bold w-20 ${AGENT_TYPES.find(a => a.id === log.agentId)?.color || 'text-gray-400'}`}>[{log.agentName}]</span>
                <span className="text-gray-300 break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <div className="p-3 bg-[#2d2d2d] border-t border-black">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your world..."
              className="w-full h-24 bg-[#111] border border-gray-700 rounded p-2 text-xs text-gray-200 focus:border-blue-500 outline-none resize-none"
              disabled={isGenerating}
            />
          </div>
        </aside>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2d2d2d] border border-gray-700 rounded-lg w-full max-w-md p-4 space-y-4">
            <h3 className="font-bold text-gray-200">Settings</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Base URL</label>
              <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Model</label>
              <select value={modelType} onChange={(e) => setModelType(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded px-3 py-2 text-sm">
                <option value="gpt-4">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {modelType === 'custom' && (
              <div>
                <label className="block text-xs text-blue-400 mb-1">Custom Model ID</label>
                <input type="text" value={customModelId} onChange={(e) => setCustomModelId(e.target.value)} placeholder="Enter model ID" className="w-full bg-[#111] border border-blue-900 rounded px-3 py-2 text-sm text-blue-100" />
              </div>
            )}
            <button onClick={() => setShowSettings(false)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
