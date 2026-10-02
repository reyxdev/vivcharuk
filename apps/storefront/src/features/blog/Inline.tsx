import type { ReactNode } from 'react';
import { Link } from 'react-router';

/**
 * Inline marks of an article (22 §22.6): **bold**, *italic*, [link](url). Built as React
 * elements, never as HTML, so nothing a writer types can inject markup. Site links stay in the
 * app; external links open with rel="noopener".
 */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2]) out.push(<em key={k++}>{m[2]}</em>);
    else if (m[3] && m[4]) {
      const href = m[4];
      out.push(href.startsWith('/') ? <Link key={k++} to={href} className="underline">{m[3]}</Link>
        : /^https:\/\//.test(href) ? <a key={k++} href={href} target="_blank" rel="noopener noreferrer" className="underline">{m[3]}</a> : m[3]);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
