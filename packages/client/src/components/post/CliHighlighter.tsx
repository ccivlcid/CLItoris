interface CliHighlighterProps {
  code: string;
}

type TokenType = 'command' | 'flag' | 'value' | 'operator' | 'comment' | 'text';

interface Token {
  type: TokenType;
  text: string;
}

const COMMAND_RE = /^(post|star|fork|reply|follow|unfollow|set|register|analyze)\b/;

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];
    if (ch === undefined) break;

    // Comment
    if (ch === '#') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // Line continuation — render as pilcrow ¶
    if (ch === '\\') {
      tokens.push({ type: 'operator', text: '¶' });
      i++;
      continue;
    }

    // Flag: starts with --
    const next = line[i + 1];
    if (ch === '-' && next === '-') {
      const eqIdx = line.indexOf('=', i);
      const spaceIdx = line.indexOf(' ', i);
      const hasEqBeforeSpace =
        eqIdx !== -1 && (spaceIdx === -1 || eqIdx < spaceIdx);

      if (hasEqBeforeSpace) {
        // --flag=value
        tokens.push({ type: 'flag', text: line.slice(i, eqIdx + 1) });
        i = eqIdx + 1;

        const valCh = line[i];
        if (valCh === '"' || valCh === "'") {
          const closeIdx = line.indexOf(valCh, i + 1);
          const valEnd = closeIdx !== -1 ? closeIdx + 1 : line.length;
          tokens.push({ type: 'value', text: line.slice(i, valEnd) });
          i = valEnd;
        } else {
          const valEnd2 = line.indexOf(' ', i);
          const end = valEnd2 !== -1 ? valEnd2 : line.length;
          const val = line.slice(i, end);
          const isEnum = /^(public|private|unlisted|true|false)$/.test(val);
          tokens.push({ type: isEnum ? 'operator' : 'value', text: val });
          i = end;
        }
      } else {
        // --flag without value
        const flagEnd = spaceIdx !== -1 ? spaceIdx : line.length;
        tokens.push({ type: 'flag', text: line.slice(i, flagEnd) });
        i = flagEnd;
      }
      continue;
    }

    // Command keyword
    const cmdMatch = COMMAND_RE.exec(line.slice(i));
    if (cmdMatch) {
      const word = cmdMatch[0];
      tokens.push({ type: 'command', text: word });
      i += word.length;
      continue;
    }

    // Consume whitespace
    if (ch === ' ') {
      let spEnd = i;
      while (spEnd < line.length && line[spEnd] === ' ') spEnd++;
      tokens.push({ type: 'text', text: line.slice(i, spEnd) });
      i = spEnd;
      continue;
    }

    // Default: consume until space or --
    let end = i + 1;
    while (end < line.length && line[end] !== ' ') end++;
    tokens.push({ type: 'text', text: line.slice(i, end) });
    i = end;
  }

  return tokens;
}

const colorMap: Record<TokenType, string> = {
  command: 'text-green-400 font-bold',
  flag: 'text-sky-400',
  value: 'text-amber-400',
  operator: 'text-purple-400',
  comment: 'text-gray-600 italic',
  text: 'text-gray-300',
};

export default function CliHighlighter({ code }: CliHighlighterProps) {
  const lines = code.split('\n');

  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
      {lines.map((line, lineIdx) => {
        const tokens = tokenizeLine(line);
        return (
          <span key={lineIdx}>
            {tokens.map((tok, tokIdx) => (
              <span key={tokIdx} className={colorMap[tok.type]}>
                {tok.text}
              </span>
            ))}
            {lineIdx < lines.length - 1 && '\n'}
          </span>
        );
      })}
    </pre>
  );
}
