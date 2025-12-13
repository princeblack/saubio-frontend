interface SimpleMarkdownProps {
  content: string;
  className?: string;
}

type MarkdownBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'hr' };

const headingClasses: Record<number, string> = {
  1: 'text-3xl font-semibold text-saubio-forest',
  2: 'text-2xl font-semibold text-saubio-forest',
  3: 'text-xl font-semibold text-saubio-forest',
  4: 'text-lg font-semibold text-saubio-forest',
  5: 'text-base font-semibold text-saubio-forest',
  6: 'text-base font-semibold text-saubio-forest',
};

const cleanInline = (value: string) =>
  value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim();

const parseMarkdown = (content: string): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = [];
  const lines = content.replace(/\r/g, '').split('\n');
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const level = Math.min(trimmed.match(/^#+/)?.[0].length ?? 1, 6);
      const text = cleanInline(trimmed.replace(/^#{1,6}\s+/, ''));
      blocks.push({ type: 'heading', level, text });
      index += 1;
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }

    if (/^[*-]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const listLine = lines[index].trim();
        if (!/^[*-]\s+/.test(listLine)) {
          break;
        }
        items.push(cleanInline(listLine.replace(/^[*-]\s+/, '')));
        index += 1;
      }
      if (items.length > 0) {
        blocks.push({ type: 'list', items });
      }
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const paragraphLine = lines[index];
      const paragraphTrimmed = paragraphLine.trim();
      if (!paragraphTrimmed) {
        index += 1;
        break;
      }
      if (/^#{1,6}\s+/.test(paragraphTrimmed) || /^[*-]\s+/.test(paragraphTrimmed) || /^[-*_]{3,}$/.test(paragraphTrimmed)) {
        break;
      }
      paragraphLines.push(paragraphTrimmed);
      index += 1;
    }
    const paragraphText = cleanInline(paragraphLines.join(' ').replace(/\s+/g, ' ').trim());
    if (paragraphText) {
      blocks.push({ type: 'paragraph', text: paragraphText });
    }
  }

  return blocks;
};

export function SimpleMarkdown({ content, className }: SimpleMarkdownProps) {
  const blocks = parseMarkdown(content);
  const baseClass = 'mt-8 space-y-4 text-saubio-slate';
  const articleClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <article className={articleClass}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const level = Math.min(block.level, 6);
          const classNameForHeading = `${headingClasses[level] ?? headingClasses[4]} ${index === 0 ? 'mt-0' : 'mt-8'}`;
          switch (level) {
            case 1:
              return (
                <h2 key={`heading-${index}`} className={classNameForHeading}>
                  {block.text}
                </h2>
              );
            case 2:
              return (
                <h3 key={`heading-${index}`} className={classNameForHeading}>
                  {block.text}
                </h3>
              );
            case 3:
              return (
                <h4 key={`heading-${index}`} className={classNameForHeading}>
                  {block.text}
                </h4>
              );
            case 4:
            case 5:
            case 6:
            default:
              return (
                <h5 key={`heading-${index}`} className={classNameForHeading}>
                  {block.text}
                </h5>
              );
          }
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className="list-disc space-y-2 pl-6 text-base leading-relaxed">
              {block.items.map((item, itemIndex) => (
                <li key={`list-${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'hr') {
          return <div key={`hr-${index}`} className="my-8 border-t border-saubio-slate/20" />;
        }

        return (
          <p key={`paragraph-${index}`} className="text-base leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </article>
  );
}
