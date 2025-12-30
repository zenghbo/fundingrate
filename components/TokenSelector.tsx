"use client";

import { useState } from "react";

interface TokenSelectorProps {
  tokens: string[];
  selectedToken: string;
  onSelectToken: (token: string) => void;
  onAddToken: (token: string) => void;
  onRemoveToken: (token: string) => void;
}

export default function TokenSelector({
  tokens,
  selectedToken,
  onSelectToken,
  onAddToken,
  onRemoveToken,
}: TokenSelectorProps) {
  const [newToken, setNewToken] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToken = () => {
    const token = newToken.toUpperCase().trim();
    if (token && !tokens.includes(token)) {
      onAddToken(token.endsWith("USDT") ? token : `${token}USDT`);
      setNewToken("");
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tokens.map((token) => (
        <div
          key={token}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            selectedToken === token
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
          onClick={() => onSelectToken(token)}
        >
          <span className="text-sm font-medium">{token}</span>
          {tokens.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveToken(token);
              }}
              className="ml-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddToken()}
            placeholder="e.g. BTC"
            className="w-24 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-green-500"
            autoFocus
          />
          <button
            onClick={handleAddToken}
            className="px-2 py-1 text-sm bg-green-600 rounded hover:bg-green-700"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewToken("");
            }}
            className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span className="text-sm">Add Token</span>
        </button>
      )}
    </div>
  );
}
