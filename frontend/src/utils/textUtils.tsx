
export const renderContentWithMentions = (content: string) => {
  if (!content) return null;

  const parts = content.split(/(@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={index} className="text-blue-600 font-medium">
          {part}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
};
