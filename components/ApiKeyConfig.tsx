"use client";

import { useState } from "react";
import { ApiCredentials } from "@/lib/types";

interface ApiKeyConfigProps {
  credentials: ApiCredentials | null;
  onSave: (credentials: ApiCredentials) => void;
  onClear: () => void;
}

export default function ApiKeyConfig({ credentials, onSave, onClear }: ApiKeyConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const handleSave = () => {
    if (apiKey && apiSecret) {
      onSave({ apiKey, apiSecret });
      setApiKey("");
      setApiSecret("");
      setIsOpen(false);
    }
  };

  const hasCredentials = credentials?.apiKey && credentials?.apiSecret;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg transition-colors ${
          hasCredentials
            ? "bg-green-600/20 text-green-400 border border-green-600"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }`}
      >
        {hasCredentials ? "API Connected" : "Configure API"}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <h3 className="text-lg font-semibold mb-3">Binance API Credentials</h3>
          <p className="text-sm text-gray-400 mb-4">
            Required for viewing your personal funding income. Keys are stored locally in your browser.
          </p>

          {hasCredentials ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-400">
                <span className="text-green-400">API Key:</span>{" "}
                {credentials.apiKey.substring(0, 8)}...
              </div>
              <button
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Clear Credentials
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
              />
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="API Secret"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleSave}
                disabled={!apiKey || !apiSecret}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Credentials
              </button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
