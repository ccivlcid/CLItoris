import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onTrigger: () => void;
  disabled?: boolean;
}

export default function InfiniteScrollTrigger({
  onTrigger,
  disabled = false,
}: InfiniteScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          onTrigger();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onTrigger, disabled]);

  return <div ref={ref} data-testid="scroll-sentinel" className="h-4" />;
}
