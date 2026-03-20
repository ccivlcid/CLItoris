const ko: Record<string, string> = {
  // Nav
  'nav.feed.global': '$ feed --global',
  'nav.feed.local': '  feed --local',
  'nav.explore': '  explore',
  'nav.section.navigate': '// 탐색',
  'nav.section.byLlm': '// LLM별',
  'nav.section.me': '// 나',
  'nav.my.posts': '  내 게시물',
  'nav.starred': '  즐겨찾기',

  // Feed
  'feed.empty.title': '$ feed --global',
  'feed.empty.subtitle': '> 0개의 게시물.',
  'feed.empty.body': '피드가 비어 있습니다.\n첫 번째로 게시해보세요.',
  'feed.empty.help': '$ post --help',
  'feed.empty.helpBody': '위의 작성창에 내용을 입력하고\nCmd+Enter를 눌러 시작하세요.',
  'feed.error.title': '$ feed --global',
  'feed.error.message': 'error: 연결이 거부되었습니다',
  'feed.error.body': '피드를 불러오지 못했습니다.\n서버가 다운되었거나 연결이 끊겼을 수 있습니다.',
  'feed.error.retry': '$ 다시 시도',
  'feed.loading': '$ loading --cursor={cursor} ...',

  // Composer
  'composer.placeholder': '하고 싶은 말을 그냥 쓰세요. LLM이 CLI로 번역하고, 둘 다 올라갑니다.',
  'composer.hint': 'Cmd+Enter',
  'composer.hint.save': 'CLI로 저장',
  'composer.button.transform': 'LLM → CLI ↗',
  'composer.button.submit': '게시',
  'composer.button.submitting': '게시 중...',
  'composer.button.transforming': '변환 중...',
  'composer.label': '> 어떤 언어로든 쓰세요. LLM이 CLI로 변환합니다.',
  'composer.repo.attach': '📎 저장소',
  'composer.repo.remove': '× 제거',

  // Post actions
  'post.action.reply': '↵ 답글',
  'post.action.fork': '○ 포크',
  'post.action.star': '★',
  'post.action.unstar': '☆',
  'post.copy': '⎘',
  'post.copied': '복사됨!',
  'post.translate': '번역 →{lang}',
  'post.translating': '번역 중...',
  'post.translated.from': '--translated-from={lang}',

  // Auth
  'auth.connect.title': '// 연결 설정',
  'auth.connect.ssh': '$ ssh terminal.social',
  'auth.connect.keyNotFound': '> 키를 찾을 수 없습니다. 공급자를 통해 인증하세요.',
  'auth.connect.button': '■ connect --provider=github    [Enter]',
  'auth.connect.connecting': '■ 연결 중...',
  'auth.connect.scope.label': '// 사용 가능한 권한',
  'auth.connect.scope.value': '--scope=read:user,user:email',
  'auth.connect.info1': 'info: 공개 프로필만 읽습니다.',
  'auth.connect.info2': 'info: 저장소 접근 권한 없음.',
  'auth.connect.redirecting': '> github.com으로 리디렉션 중...',
  'auth.connect.waiting': '> 인증 대기 중 ░░░░░░░░░░',
  'auth.connect.success': '> github를 통해 인증되었습니다',

  // Setup
  'setup.title': '// 연결 완료. 프로필을 설정하세요.',
  'setup.imported': '> github에서 가져온 정보:',
  'setup.avatar': '  avatar: ✓ 동기화됨',
  'setup.name': '  name:',
  'setup.bio': '  bio:',
  'setup.repos': '  repos:',
  'setup.repos.public': '개 공개',
  'setup.username.label': '$ register --user=',
  'setup.username.suggested': '(github 제안: {github})',
  'setup.username.placeholder': '사용자명 선택',
  'setup.displayName.label': '--display-name=',
  'setup.displayName.hint': '(수정 가능)',
  'setup.bio.label': '--bio=',
  'setup.bio.hint': '(수정 가능)',
  'setup.submit': '[Enter] 프로필 초기화',
  'setup.submitting': '초기화 중...',

  // Settings
  'settings.title': '$ set --config',
  'settings.section.language': '// 언어',
  'settings.ui.lang': '--ui-lang=',
  'settings.post.lang': '--default-post-lang=',
  'settings.section.llm': '// LLM 키',
  'settings.section.account': '// 계정',

  // Settings — API tab
  'settings.api.description': '로컬 모델(Ollama 등), 프론티어 모델(OpenAI, Anthropic 등), 기타 서비스의 API를 등록하여 언어모델에 접근합니다.',
  'settings.api.saving': '저장 중...',
  'settings.api.add': '추가',
  'settings.api.cancel': '취소',
  'settings.api.remove': '제거',
  'settings.api.confirmRemove': '확인?',
  'settings.api.registered': '등록된 프로바이더',
  'settings.api.empty': '등록된 프로바이더가 없습니다.',

  // Errors
  'error.keyNotConfigured': 'API 키가 설정되지 않았습니다. 설정에서 추가하세요.',
  'error.unauthorized': '계속하려면 로그인하세요.',
  'error.notFound': '찾을 수 없습니다.',
  'error.serverError': '서버 오류가 발생했습니다. 다시 시도해주세요.',

  // Time
  'time.just.now': '방금 전',
  'time.minutes': '{n}분 전',
  'time.hours': '{n}시간 전',
  'time.days': '{n}일 전',

  // User menu
  'menu.profile': '내 프로필',
  'menu.llm': 'LLM / CLI',
  'menu.settings': '설정',
  'menu.logout': '로그아웃',
};

export default ko;
