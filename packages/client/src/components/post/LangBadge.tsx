interface LangBadgeProps {
  lang: string;
}

export default function LangBadge({ lang }: LangBadgeProps) {
  return (
    <span className="text-purple-400 text-[11px] font-mono border border-purple-400/30 px-1.5 py-0.5 rounded-sm shrink-0">
      --lang={lang}
    </span>
  );
}
