import { useState } from 'react';
import { LLMConfig, DEFAULT_CONFIG } from '../types';
import { Settings, X, RotateCcw, Eye, EyeOff, Save } from 'lucide-react';

interface SettingsPanelProps {
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SettingsPanel({ config, onSave, isOpen, onToggle }: SettingsPanelProps) {
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
  };

  const update = (key: keyof LLMConfig, value: string | number | boolean) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Konfigurasi LLM</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Endpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              API Endpoint URL
            </label>
            <input
              type="url"
              value={localConfig.endpoint}
              onChange={(e) => update('endpoint', e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL endpoint API (OpenAI-compatible format)
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localConfig.apiKey}
                onChange={(e) => update('apiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Model Name
            </label>
            <input
              type="text"
              value={localConfig.modelName}
              onChange={(e) => update('modelName', e.target.value)}
              placeholder="gpt-3.5-turbo"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              System Prompt
            </label>
            <textarea
              value={localConfig.systemPrompt}
              onChange={(e) => update('systemPrompt', e.target.value)}
              placeholder="You are a helpful assistant."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Temperature
              </label>
              <input
                type="number"
                value={localConfig.temperature}
                onChange={(e) => update('temperature', parseFloat(e.target.value) || 0)}
                min={0}
                max={2}
                step={0.1}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Max Tokens
              </label>
              <input
                type="number"
                value={localConfig.maxTokens}
                onChange={(e) => update('maxTokens', parseInt(e.target.value) || 0)}
                min={1}
                max={128000}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Top P */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Top P
              </label>
              <input
                type="number"
                value={localConfig.topP}
                onChange={(e) => update('topP', parseFloat(e.target.value) || 0)}
                min={0}
                max={1}
                step={0.05}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Stream Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Streaming Response
            </label>
            <button
              onClick={() => update('streamEnabled', !localConfig.streamEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localConfig.streamEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localConfig.streamEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Default
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Tersimpan!' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
