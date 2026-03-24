import { Icon } from '../common/Icon.js';
import { useUiStore } from '../../stores/uiStore.js';

interface MobileHelpModalProps {
  onClose: () => void;
}

export default function MobileHelpModal({ onClose }: MobileHelpModalProps) {
  const { t } = useUiStore();

  const guides = [
    { titleKey: 'mobileHelp.dualTitle', descKey: 'mobileHelp.dualDesc' },
    { titleKey: 'mobileHelp.actionsTitle', descKey: 'mobileHelp.actionsDesc' },
    { titleKey: 'mobileHelp.navTitle', descKey: 'mobileHelp.navDesc' },
    { titleKey: 'mobileHelp.refreshTitle', descKey: 'mobileHelp.refreshDesc' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#16213e] border border-gray-700 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-gray-700">
          <span className="text-[var(--accent-green)] font-mono text-xs font-bold">{t('mobileHelp.header')}</span>
          <button type="button" onClick={onClose} className="text-gray-500" aria-label={t('mobileHelp.closeAria')}>
            <Icon name="close" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {guides.map(({ titleKey, descKey }) => (
            <div key={titleKey} className="space-y-1">
              <h3 className="font-mono text-[var(--accent-amber)] text-xs uppercase tracking-wider font-bold">
                // {t(titleKey)}
              </h3>
              <p className="font-sans text-[13px] text-gray-300 leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-mono text-xs border border-[var(--accent-green)]/30 rounded-sm"
            >
              {t('mobileHelp.ack')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
