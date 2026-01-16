// src/utils/textUtils.tsx
import React from 'react';

export const renderContentWithMentions = (content: string) => {
  if (!content) return null;
  return content.split(' ').map((word, index) => {
    if (word.startsWith('@')) {
      return (
        <span key={index} className="text-blue-600 font-medium mr-1">
          {word}{''}
        </span>
      );
    }
    return <span key={index} className="mr-1">{word} </span>;
  });
};