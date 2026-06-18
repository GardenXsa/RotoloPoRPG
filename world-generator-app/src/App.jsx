import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Play, Pause, Square, Globe, Mountain, Building2, 
  TreePine, Waves, Zap, MessageSquare, ChevronRight, Layers,
  Map, Hammer, Eye, Save, FolderOpen, RefreshCw
} from 'lucide-react';
import './App.css';

// Agent types
const AGENT_TYPES = {
  MAIN: { id: 'main', name: 'Main Agent', icon: Zap, color: '#ffd700' },
  TILE: { id: 'tile', name: 'Tile Agent', icon: Layers, color: '#00bcd4' },
  TERRAIN: { id: 'terrain', name: 'Terrain Agent', icon: Mountain, color: '#4caf50' },
  LOCATION: { id: 'location', name: 'Location Agent', icon: Map, color: '#ff9800' },
  BUILDING: { id: 'building', name: 'Building Agent', icon: Building2, color: '#f44336' },
  POLISH: { id: 'polish', name: 'Polish Agent', icon: Eye, color: '#9c27b0' },
  ROAD: { id: 'road', name: 'Road Agent', icon: ChevronRight, color: '#607d8b' },
  NATURE: { id: 'nature', name: 'Nature Agent', icon: TreePine, color: '#8bc34a' },
  WATER: { id: 'water', name: 'Water Agent', icon: Waves, color: '#2196f3' },
};

// Generation stages
const STAGES = [
  { id: 'planning', name: 'Planning', description: 'Creating world blueprint' },
  { id: 'tiles', name: 'Tile Generation', description: 'Creating asset tiles' },
  { id: 'terrain', name: 'Terrain Creation', description: 'Generating landmass and geography' },
  { id: 'locations', name: 'Location Placement', description: 'Placing cities, villages, points of interest' },
  { id: 'buildings', name: 'Building Construction', description: 'Constructing structures and interiors' },
  { id: 'roads', name: 'Road Network', description: 'Creating roads and paths' },
  { id: 'nature', name: 'Nature Distribution', description: 'Adding vegetation and natural elements' },
  { id: 'water', name: 'Water Systems', description: 'Creating rivers, lakes, oceans' },
  { id: 'polishing', name: 'Polishing', description: 'Final touches and optimizations' },
];

function App() {
  // State
  const [apiSettings, setApiSettings] = useState({
    baseUrl: 'http://localhost:8080',
    apiKey: '',
    model: 'gpt-4',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [worldDescription, setWorldDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [activeAgents, setActiveAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [worldStats, setWorldStats] = useState({
    tiles: 0,
    terrainChunks: 0,
    locations: 0,
    buildings: 0,
    roads: 0,
    natureObjects: 0,
  });
  const [viewportMode, setViewportMode] = useState('3d');
  
  const logsEndRef = useRef(null);
  const generationInterval = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Add log entry
  const addLog = (agent, message, type = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      agent,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };

  // Simulate agent activity
  const simulateAgentActivity = () => {
    const stage = STAGES[currentStage];
    
    if (!stage) {
      stopGeneration();
      return;
    }

    // Randomly activate agents based on stage
    const possibleAgents = getPossibleAgentsForStage(stage.id);
    const activeAgentType = possibleAgents[Math.floor(Math.random() * possibleAgents.length)];
    const agentDef = Object.values(AGENT_TYPES).find(a => a.id === activeAgentType);
    
    if (agentDef && !activeAgents.find(a => a.type === agentDef.id)) {
      activateAgent(agentDef);
    }

    // Generate random action
    const actions = getActionsForStage(stage.id);
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    if (agentDef) {
      addLog(agentDef.name, action);
      
      // Update stats
      updateStats(stage.id);
    }

    // Progress to next stage occasionally
    if (Math.random() > 0.7) {
      setCurrentStage(prev => Math.min(prev + 1, STAGES.length - 1));
    }
  };

  const getPossibleAgentsForStage = (stageId) => {
    const mapping = {
      planning: ['main'],
      tiles: ['main', 'tile'],
      terrain: ['main', 'terrain'],
      locations: ['main', 'location'],
      buildings: ['main', 'location', 'building'],
      roads: ['main', 'road'],
      nature: ['main', 'nature'],
      water: ['main', 'water'],
      polishing: ['main', 'polish'],
    };
    return mapping[stageId] || ['main'];
  };

  const getActionsForStage = (stageId) => {
    const actions = {
      planning: [
        'Analyzing world description...',
        'Creating initial blueprint...',
        'Defining world boundaries...',
        'Setting up generation parameters...',
        'Planning resource distribution...',
      ],
      tiles: [
        'Generating grass tile variants...',
        'Creating rock formations...',
        'Designing building components...',
        'Creating texture atlases...',
        'Optimizing tile memory usage...',
      ],
      terrain: [
        'Generating heightmap...',
        'Carving river valleys...',
        'Creating mountain ranges...',
        'Smoothing terrain transitions...',
        'Adding erosion details...',
      ],
      locations: [
        'Placing city coordinates...',
        'Scattering village locations...',
        'Positioning points of interest...',
        'Validating location spacing...',
        'Creating location boundaries...',
      ],
      buildings: [
        'Constructing residential buildings...',
        'Building commercial structures...',
        'Creating industrial facilities...',
        'Generating interior layouts...',
        'Adding architectural details...',
      ],
      roads: [
        'Connecting major cities...',
        'Creating local road networks...',
        'Building bridges over rivers...',
        'Adding path markers...',
        'Optimizing road geometry...',
      ],
      nature: [
        'Planting forests...',
        'Scattering trees...',
        'Adding bushes and shrubs...',
        'Creating meadows...',
        'Distributing rocks and boulders...',
      ],
      water: [
        'Carving riverbeds...',
        'Creating lakes...',
        'Setting ocean levels...',
        'Adding waterfalls...',
        'Configuring water physics...',
      ],
      polishing: [
        'Checking for clipping issues...',
        'Optimizing draw calls...',
        'Adding ambient occlusion...',
        'Fine-tuning lighting...',
        'Running quality checks...',
      ],
    };
    return actions[stageId] || ['Working...'];
  };

  const updateStats = (stageId) => {
    setWorldStats(prev => ({
      ...prev,
      tiles: stageId === 'tiles' ? prev.tiles + Math.floor(Math.random() * 10) : prev.tiles,
      terrainChunks: stageId === 'terrain' ? prev.terrainChunks + Math.floor(Math.random() * 5) : prev.terrainChunks,
      locations: stageId === 'locations' ? prev.locations + Math.floor(Math.random() * 3) : prev.locations,
      buildings: stageId === 'buildings' ? prev.buildings + Math.floor(Math.random() * 8) : prev.buildings,
      roads: stageId === 'roads' ? prev.roads + Math.floor(Math.random() * 4) : prev.roads,
      natureObjects: stageId === 'nature' ? prev.natureObjects + Math.floor(Math.random() * 20) : prev.natureObjects,
    }));
  };

  const activateAgent = (agentDef) => {
    setActiveAgents(prev => {
      if (prev.find(a => a.type === agentDef.id)) return prev;
      return [...prev, { ...agentDef, startTime: Date.now() }];
    });

    // Deactivate after random time
    setTimeout(() => {
      setActiveAgents(prev => prev.filter(a => a.type !== agentDef.id));
    }, 2000 + Math.random() * 3000);
  };

  const startGeneration = () => {
    if (!worldDescription.trim()) {
      addLog('System', 'Please enter a world description first!', 'error');
      return;
    }

    setIsGenerating(true);
    setCurrentStage(0);
    setLogs([]);
    setWorldStats({
      tiles: 0,
      terrainChunks: 0,
      locations: 0,
      buildings: 0,
      roads: 0,
      natureObjects: 0,
    });
    
    addLog('Main Agent', `Starting generation for: "${worldDescription}"`, 'success');
    
    generationInterval.current = setInterval(simulateAgentActivity, 1500);
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setCurrentStage(0);
    if (generationInterval.current) {
      clearInterval(generationInterval.current);
      generationInterval.current = null;
    }
    setActiveAgents([]);
    addLog('System', 'Generation stopped', 'warning');
  };

  const pauseGeneration = () => {
    if (generationInterval.current) {
      clearInterval(generationInterval.current);
      generationInterval.current = null;
    }
    addLog('System', 'Generation paused', 'info');
  };

  const resumeGeneration = () => {
    if (!generationInterval.current && isGenerating) {
      generationInterval.current = setInterval(simulateAgentActivity, 1500);
      addLog('System', 'Generation resumed', 'info');
    }
  };

  return (
    <div className="app">
      {/* Top Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <Globe className="logo-icon" />
          <h1>AI World Generator</h1>
        </div>
        
        <div className="toolbar-center">
          <div className="stage-indicator">
            <span className="stage-label">Stage:</span>
            <span className="stage-name">{STAGES[currentStage]?.name}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="toolbar-right">
          <button className="tool-btn" onClick={() => setShowSettings(true)}>
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - Hierarchy */}
        <div className="panel left-panel">
          <div className="panel-header">
            <FolderOpen size={16} />
            <span>World Hierarchy</span>
          </div>
          <div className="panel-content">
            <div className="tree-item">
              <ChevronRight size={14} />
              <Globe size={14} />
              <span>World</span>
            </div>
            <div className="tree-item tree-child">
              <ChevronRight size={14} />
              <Mountain size={14} />
              <span>Terrain ({worldStats.terrainChunks})</span>
            </div>
            <div className="tree-item tree-child">
              <ChevronRight size={14} />
              <Map size={14} />
              <span>Locations ({worldStats.locations})</span>
            </div>
            <div className="tree-item tree-child">
              <ChevronRight size={14} />
              <Building2 size={14} />
              <span>Buildings ({worldStats.buildings})</span>
            </div>
            <div className="tree-item tree-child">
              <ChevronRight size={14} />
              <TreePine size={14} />
              <span>Nature ({worldStats.natureObjects})</span>
            </div>
            <div className="tree-item tree-child">
              <ChevronRight size={14} />
              <Waves size={14} />
              <span>Water Bodies</span>
            </div>
          </div>
        </div>

        {/* Center - Viewport */}
        <div className="viewport-container">
          <div className="viewport-toolbar">
            <button 
              className={`viewport-mode ${viewportMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewportMode('3d')}
            >
              <Globe size={16} />
              3D View
            </button>
            <button 
              className={`viewport-mode ${viewportMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewportMode('map')}
            >
              <Map size={16} />
              Map View
            </button>
            <div className="viewport-stats">
              <span>Tiles: {worldStats.tiles}</span>
              <span>Buildings: {worldStats.buildings}</span>
              <span>Locations: {worldStats.locations}</span>
            </div>
          </div>
          
          <div className="viewport">
            {isGenerating ? (
              <div className="generation-visualizer">
                <div className="grid-world">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`grid-cell ${Math.random() > 0.7 ? 'active' : ''}`}
                      style={{
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: getCellColor(i),
                      }}
                    />
                  ))}
                </div>
                
                {/* Active Agents Overlay */}
                <div className="active-agents">
                  {activeAgents.map(agent => (
                    <div key={agent.type} className="agent-badge" style={{ borderColor: agent.color }}>
                      <agent.icon size={14} style={{ color: agent.color }} />
                      <span>{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-viewport">
                <Globe size={64} opacity={0.3} />
                <p>Enter a world description and click Generate to start</p>
              </div>
            )}
          </div>

          {/* Bottom - Input */}
          <div className="input-panel">
            <div className="input-wrapper">
              <MessageSquare size={20} />
              <textarea
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                placeholder="Describe your world... (e.g., 'A post-apocalyptic world inspired by Stalker universe with abandoned cities, dangerous anomalies, and mysterious zones')"
                disabled={isGenerating}
              />
            </div>
            <div className="action-buttons">
              {!isGenerating ? (
                <button className="btn-primary" onClick={startGeneration}>
                  <Play size={18} />
                  Generate
                </button>
              ) : (
                <>
                  <button className="btn-warning" onClick={pauseGeneration}>
                    <Pause size={18} />
                    Pause
                  </button>
                  <button className="btn-danger" onClick={stopGeneration}>
                    <Square size={18} />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Inspector & Logs */}
        <div className="panel right-panel">
          <div className="tabs">
            <button className="tab active">
              <Hammer size={14} />
              Agents
            </button>
            <button className="tab">
              <MessageSquare size={14} />
              Logs
            </button>
          </div>
          
          <div className="panel-content">
            {/* Active Agents */}
            <div className="agents-section">
              <h3>Active Agents</h3>
              <div className="agents-grid">
                {activeAgents.map(agent => (
                  <div key={agent.type} className="agent-card" style={{ borderLeftColor: agent.color }}>
                    <agent.icon size={20} style={{ color: agent.color }} />
                    <div className="agent-info">
                      <span className="agent-name">{agent.name}</span>
                      <span className="agent-status">Working...</span>
                    </div>
                  </div>
                ))}
                {activeAgents.length === 0 && (
                  <p className="no-agents">No active agents</p>
                )}
              </div>
            </div>

            {/* Available Agents */}
            <div className="agents-section">
              <h3>Available Agents</h3>
              <div className="agents-list">
                {Object.values(AGENT_TYPES).map(agent => (
                  <div key={agent.id} className="agent-item">
                    <agent.icon size={16} style={{ color: agent.color }} />
                    <span>{agent.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs */}
            <div className="logs-section">
              <h3>Activity Log</h3>
              <div className="logs-container">
                {logs.map(log => (
                  <div key={log.id} className={`log-entry ${log.type}`}>
                    <span className="log-time">{log.timestamp}</span>
                    <span className="log-agent" style={{ color: getAgentColor(log.agent) }}>
                      [{log.agent}]
                    </span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>API Settings</h2>
              <button onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Base URL</label>
                <input
                  type="text"
                  value={apiSettings.baseUrl}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="http://localhost:8080"
                />
              </div>
              <div className="form-group">
                <label>API Key</label>
                <input
                  type="password"
                  value={apiSettings.apiKey}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key"
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <select
                  value={apiSettings.model}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, model: e.target.value }))}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowSettings(false)}>
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getCellColor(index) {
  const colors = ['#4caf50', '#2196f3', '#ff9800', '#795548', '#607d8b'];
  return colors[index % colors.length];
}

function getAgentColor(agentName) {
  const agent = Object.values(AGENT_TYPES).find(a => a.name === agentName);
  return agent ? agent.color : '#ffffff';
}

export default App;
