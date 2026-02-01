
import { useState } from 'react';
import { Layer } from '../types';

export const useHistory = (initialLayers: Layer[]) => {
  const [history, setHistory] = useState<any[]>([JSON.parse(JSON.stringify(initialLayers))]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveHistory = (layers: Layer[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(layers)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = (setLayers: (layers: Layer[]) => void) => {
    if (historyIndex > 0) {
      const newLayers = JSON.parse(JSON.stringify(history[historyIndex - 1]));
      setLayers(newLayers);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = (setLayers: (layers: Layer[]) => void) => {
    if (historyIndex < history.length - 1) {
      const newLayers = JSON.parse(JSON.stringify(history[historyIndex + 1]));
      setLayers(newLayers);
      setHistoryIndex(historyIndex + 1);
    }
  };

  return { history, historyIndex, saveHistory, undo, redo };
};
