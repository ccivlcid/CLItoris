// Unicode range heuristics for language detection.
// Detection priority: Korean → Japanese → Chinese → English (default).

const KO_RANGE = /[\uAC00-\uD7A3]/;  // Hangul syllables
const JA_RANGE = /[\u3040-\u30FF]/;  // Hiragana + Katakana
const ZH_RANGE = /[\u4E00-\u9FFF]/;  // CJK Unified Ideographs

export type DetectableLang = 'en' | 'ko' | 'zh' | 'ja';

export function detectLang(text: string): DetectableLang {
  if (KO_RANGE.test(text)) return 'ko';
  if (JA_RANGE.test(text)) return 'ja';
  if (ZH_RANGE.test(text)) return 'zh';
  return 'en';
}
