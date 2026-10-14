import { useState, useEffect } from 'react';
import { LLMConfig, DEFAULT_CONFIG } from './types';
import ChatInterface from './components/ChatInterface';
import SettingsPanel from './components/SettingsPanel';
import { Settings, MessageSquare, Zap } from 'lucide-react';

const STORAGE_KEY = 'ai-chatbot-config';

function loadConfig(): LLMConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: LLMConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function App() {
  const [config, setConfig] = useState<LLMConfig>(loadConfig);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const handleSaveConfig = (newConfig: LLMConfig) => {
    setConfig(newConfig);
    setSettingsOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">AI Chatbot</h1>
            <p className="text-[11px] text-gray-500 leading-tight">
              {config.modelName} • {config.streamEnabled ? 'Streaming' : 'Non-streaming'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700">
            <Zap className={`w-3 h-3 ${config.apiKey ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className="text-[11px] text-gray-400">
              {config.apiKey ? 'Terhubung' : 'API Key belum diatur'}
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface config={config} />
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        config={config}
        onSave={handleSaveConfig}
        isOpen={settingsOpen}
        onToggle={() => setSettingsOpen(false)}
      />
    </div>
  );
}
