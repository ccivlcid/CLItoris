const en: Record<string, string> = {
  // Nav
  'nav.feed.global': '$ feed --global',
  'nav.feed.local': '  feed --local',
  'nav.explore': '  explore',
  'nav.section.navigate': '// navigate',
  'nav.section.byLlm': '// by LLM',
  'nav.section.me': '// me',
  'nav.my.posts': '  my posts',
  'nav.starred': '  starred',

  // Feed
  'feed.empty.title': '$ feed --global',
  'feed.empty.subtitle': '> 0 posts found.',
  'feed.empty.body': 'The global feed is empty.\nBe the first to post.',
  'feed.empty.help': '$ post --help',
  'feed.empty.helpBody': 'Write something in the\ncomposer above and press\nCmd+Enter to get started.',
  'feed.error.title': '$ feed --global',
  'feed.error.message': 'error: connection refused',
  'feed.error.body': 'Failed to load the global feed.\nThe server might be down or\nyour connection is interrupted.',
  'feed.error.retry': '$ retry',
  'feed.loading': '$ loading --cursor={cursor} ...',

  // Composer
  'composer.placeholder': 'Type your post here...',
  'composer.hint': 'Cmd+Enter',
  'composer.hint.save': 'save as CLI',
  'composer.button.transform': 'LLM → CLI ↗',
  'composer.button.submit': 'post',
  'composer.button.submitting': 'posting...',
  'composer.button.transforming': 'transforming...',
  'composer.label': '> Write in any language. LLM translates to CLI.',
  'composer.repo.attach': '📎 repo',
  'composer.repo.remove': '× remove',

  // Post actions
  'post.action.reply': '↵ reply',
  'post.action.fork': '○ fork',
  'post.action.star': '★',
  'post.action.unstar': '☆',
  'post.copy': '⎘',
  'post.copied': 'copied!',
  'post.translate': 'translate →{lang}',
  'post.translating': 'translating...',
  'post.translated.from': '--translated-from={lang}',

  // Auth
  'auth.connect.title': '// establish connection',
  'auth.connect.ssh': '$ ssh terminal.social',
  'auth.connect.keyNotFound': '> key not found. authenticate via provider.',
  'auth.connect.button': '■ connect --provider=github    [Enter]',
  'auth.connect.connecting': '■ connecting...',
  'auth.connect.scope.label': '// available permissions',
  'auth.connect.scope.value': '--scope=read:user,user:email',
  'auth.connect.info1': 'info: we only read your public profile.',
  'auth.connect.info2': 'info: no repo access requested.',
  'auth.connect.redirecting': '> redirecting to github.com...',
  'auth.connect.waiting': '> waiting for authorization ░░░░░░░░░░',
  'auth.connect.success': '> authenticated via github',

  // Setup
  'setup.title': '// connection established. configure profile.',
  'setup.imported': '> imported from github:',
  'setup.avatar': '  avatar: ✓ synced',
  'setup.name': '  name:',
  'setup.bio': '  bio:',
  'setup.repos': '  repos:',
  'setup.repos.public': 'public',
  'setup.username.label': '$ register --user=',
  'setup.username.suggested': '(suggested from github: {github})',
  'setup.username.placeholder': 'choose a username',
  'setup.displayName.label': '--display-name=',
  'setup.displayName.hint': '(edit ok)',
  'setup.bio.label': '--bio=',
  'setup.bio.hint': '(edit ok)',
  'setup.submit': '[Enter] initialize profile',
  'setup.submitting': 'initializing...',

  // Settings
  'settings.title': '$ set --config',
  'settings.section.language': '// language',
  'settings.ui.lang': '--ui-lang=',
  'settings.post.lang': '--default-post-lang=',
  'settings.section.llm': '// LLM keys',
  'settings.section.account': '// account',

  // Settings — API tab
  'settings.api.description': 'Register local models (Ollama etc.), frontier models (OpenAI, Anthropic etc.), or other API services.',
  'settings.api.saving': 'saving...',
  'settings.api.add': 'add',
  'settings.api.cancel': 'cancel',
  'settings.api.remove': 'remove',
  'settings.api.confirmRemove': 'confirm?',
  'settings.api.registered': 'registered providers',
  'settings.api.empty': 'No providers registered.',

  // Errors
  'error.keyNotConfigured': 'API key not configured. Add it in Settings.',
  'error.unauthorized': 'Please log in to continue.',
  'error.notFound': 'Not found.',
  'error.serverError': 'Server error. Please try again.',

  // Time
  'time.just.now': 'just now',
  'time.minutes': '{n}m ago',
  'time.hours': '{n}h ago',
  'time.days': '{n}d ago',

  // User menu
  'menu.profile': 'my profile',
  'menu.llm': 'LLM / CLI',
  'menu.settings': 'settings',
  'menu.logout': 'logout',
};

export default en;
