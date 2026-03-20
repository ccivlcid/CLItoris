export default function ChannelTab() {
  const TRENDING = ['#llm', '#terminal', '#typescript', '#rust', '#devops', '#ai-tools'];

  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-6 space-y-4">
        <p className="text-[var(--text-faint)] text-xs font-mono">// channel subscriptions</p>

        <div className="border border-yellow-400/20 bg-yellow-400/5 px-4 py-3">
          <p className="text-yellow-400 font-mono text-sm">$ channel --status</p>
          <p className="text-yellow-400/70 font-mono text-xs mt-1">&gt; channels not yet implemented (Phase 3)</p>
        </div>

        <div className="space-y-2 opacity-40 pointer-events-none select-none">
          <p className="text-[var(--text-muted)] font-mono text-xs">$ channel --list</p>
          <p className="text-[var(--text-faint)] font-mono text-sm">&gt; no subscriptions yet.</p>
        </div>
      </div>

      <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-6 space-y-3">
        <p className="text-[var(--text-faint)] text-xs font-mono">// trending channels (preview)</p>
        <div className="flex flex-wrap gap-2">
          {TRENDING.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 border border-[var(--border)] text-[var(--text-faint)] font-mono text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-[var(--text-faint)] font-mono text-xs">// join channels once Phase 3 ships</p>
      </div>
    </div>
  );
}
