const ja: Record<string, string> = {
  // Nav
  'nav.feed.global': '$ feed --global',
  'nav.feed.local': '  feed --local',
  'nav.explore': '  explore',
  'nav.section.navigate': '// ナビゲート',
  'nav.section.byLlm': '// LLM別',
  'nav.section.me': '// 自分',
  'nav.my.posts': '  投稿一覧',
  'nav.starred': '  スター済み',

  // Feed
  'feed.empty.title': '$ feed --global',
  'feed.empty.subtitle': '> 0 件の投稿。',
  'feed.empty.body': 'グローバルフィードは空です。\n最初に投稿してみましょう。',
  'feed.empty.help': '$ post --help',
  'feed.empty.helpBody': '上のコンポーザーに内容を入力し\nCmd+Enter を押して開始してください。',
  'feed.error.title': '$ feed --global',
  'feed.error.message': 'error: 接続が拒否されました',
  'feed.error.body': 'グローバルフィードを読み込めませんでした。\nサーバーがダウンしているか、接続が切れている可能性があります。',
  'feed.error.retry': '$ 再試行',
  'feed.loading': '$ loading --cursor={cursor} ...',

  // Composer
  'composer.placeholder': 'ここに投稿を入力...',
  'composer.hint': 'Cmd+Enter',
  'composer.hint.save': 'CLIとして保存',
  'composer.button.transform': 'LLM → CLI',
  'composer.button.submit': '投稿',
  'composer.button.submitting': '投稿中...',
  'composer.button.transforming': '変換中...',
  'composer.label': '> どの言語でも書いてください。LLM が CLI に変換します。',
  'composer.repo.attach': '📎 リポジトリ',
  'composer.repo.remove': '× 削除',

  // Post actions
  'post.action.reply': '↩ 返信',
  'post.action.fork': '◇ フォーク',
  'post.action.star': '★',
  'post.action.unstar': '☆',
  'post.copy': '⎘',
  'post.copied': 'コピー済み!',
  'post.translate': '翻訳 →{lang}',
  'post.translating': '翻訳中...',
  'post.translated.from': '--translated-from={lang}',

  // Auth
  'auth.connect.title': '// 接続を確立する',
  'auth.connect.ssh': '$ ssh terminal.social',
  'auth.connect.keyNotFound': '> キーが見つかりません。プロバイダーで認証してください。',
  'auth.connect.button': '■ connect --provider=github    [Enter]',
  'auth.connect.connecting': '■ 接続中...',
  'auth.connect.scope.label': '// 利用可能な権限',
  'auth.connect.scope.value': '--scope=read:user,user:email',
  'auth.connect.info1': 'info: 公開プロフィールのみ読み取ります。',
  'auth.connect.info2': 'info: リポジトリアクセスは不要です。',
  'auth.connect.redirecting': '> github.com にリダイレクト中...',
  'auth.connect.waiting': '> 認証待ち ░░░░░░░░░░',
  'auth.connect.success': '> github で認証されました',

  // Setup
  'setup.title': '// 接続完了。プロフィールを設定してください。',
  'setup.imported': '> github からインポート:',
  'setup.avatar': '  avatar: ✓ 同期済み',
  'setup.name': '  name:',
  'setup.bio': '  bio:',
  'setup.repos': '  repos:',
  'setup.repos.public': ' 個公開',
  'setup.username.label': '$ register --user=',
  'setup.username.suggested': '(github の提案: {github})',
  'setup.username.placeholder': 'ユーザー名を選択',
  'setup.displayName.label': '--display-name=',
  'setup.displayName.hint': '(編集可)',
  'setup.bio.label': '--bio=',
  'setup.bio.hint': '(編集可)',
  'setup.submit': '[Enter] プロフィール初期化',
  'setup.submitting': '初期化中...',

  // Settings
  'settings.title': '$ set --config',
  'settings.section.language': '// 言語',
  'settings.ui.lang': '--ui-lang=',
  'settings.post.lang': '--default-post-lang=',
  'settings.section.llm': '// LLM キー',
  'settings.section.account': '// アカウント',

  // Errors
  'error.keyNotConfigured': 'API キーが設定されていません。設定で追加してください。',
  'error.unauthorized': '続行するにはログインしてください。',
  'error.notFound': '見つかりません。',
  'error.serverError': 'サーバーエラーが発生しました。再試行してください。',

  // Time
  'time.just.now': 'たった今',
  'time.minutes': '{n}分前',
  'time.hours': '{n}時間前',
  'time.days': '{n}日前',

  // User menu
  'menu.profile': 'マイプロフィール',
  'menu.llm': 'LLM / CLI',
  'menu.settings': '設定',
  'menu.logout': 'ログアウト',
};

export default ja;
