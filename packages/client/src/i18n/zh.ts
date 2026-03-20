const zh: Record<string, string> = {
  // Nav
  'nav.feed.global': '$ feed --global',
  'nav.feed.local': '  feed --local',
  'nav.explore': '  explore',
  'nav.section.navigate': '// 导航',
  'nav.section.byLlm': '// 按LLM',
  'nav.section.me': '// 我',
  'nav.my.posts': '  我的帖子',
  'nav.starred': '  已收藏',

  // Feed
  'feed.empty.title': '$ feed --global',
  'feed.empty.subtitle': '> 找到 0 条帖子。',
  'feed.empty.body': '全局动态为空。\n成为第一个发帖的人。',
  'feed.empty.help': '$ post --help',
  'feed.empty.helpBody': '在上方编辑器输入内容\n然后按 Cmd+Enter 开始。',
  'feed.error.title': '$ feed --global',
  'feed.error.message': 'error: 连接被拒绝',
  'feed.error.body': '无法加载全局动态。\n服务器可能已关闭或连接中断。',
  'feed.error.retry': '$ 重试',
  'feed.loading': '$ loading --cursor={cursor} ...',

  // Composer
  'composer.placeholder': '在这里输入您的帖子...',
  'composer.hint': 'Cmd+Enter',
  'composer.hint.save': '保存为CLI',
  'composer.button.transform': 'LLM → CLI',
  'composer.button.submit': '发布',
  'composer.button.submitting': '发布中...',
  'composer.button.transforming': '转换中...',
  'composer.label': '> 用任何语言书写。LLM 将转换为 CLI。',
  'composer.repo.attach': '📎 仓库',
  'composer.repo.remove': '× 移除',

  // Post actions
  'post.action.reply': '↩ 回复',
  'post.action.fork': '◇ 分叉',
  'post.action.star': '★',
  'post.action.unstar': '☆',
  'post.copy': '⎘',
  'post.copied': '已复制!',
  'post.translate': '翻译 →{lang}',
  'post.translating': '翻译中...',
  'post.translated.from': '--translated-from={lang}',

  // Auth
  'auth.connect.title': '// 建立连接',
  'auth.connect.ssh': '$ ssh terminal.social',
  'auth.connect.keyNotFound': '> 未找到密钥。请通过提供商进行身份验证。',
  'auth.connect.button': '■ connect --provider=github    [Enter]',
  'auth.connect.connecting': '■ 连接中...',
  'auth.connect.scope.label': '// 可用权限',
  'auth.connect.scope.value': '--scope=read:user,user:email',
  'auth.connect.info1': 'info: 我们只读取您的公开资料。',
  'auth.connect.info2': 'info: 未请求仓库访问权限。',
  'auth.connect.redirecting': '> 正在重定向到 github.com...',
  'auth.connect.waiting': '> 等待授权 ░░░░░░░░░░',
  'auth.connect.success': '> 已通过 github 验证',

  // Setup
  'setup.title': '// 连接已建立。配置个人资料。',
  'setup.imported': '> 从 github 导入:',
  'setup.avatar': '  avatar: ✓ 已同步',
  'setup.name': '  name:',
  'setup.bio': '  bio:',
  'setup.repos': '  repos:',
  'setup.repos.public': ' 个公开',
  'setup.username.label': '$ register --user=',
  'setup.username.suggested': '(github 建议: {github})',
  'setup.username.placeholder': '选择用户名',
  'setup.displayName.label': '--display-name=',
  'setup.displayName.hint': '(可编辑)',
  'setup.bio.label': '--bio=',
  'setup.bio.hint': '(可编辑)',
  'setup.submit': '[Enter] 初始化个人资料',
  'setup.submitting': '初始化中...',

  // Settings
  'settings.title': '$ set --config',
  'settings.section.language': '// 语言',
  'settings.ui.lang': '--ui-lang=',
  'settings.post.lang': '--default-post-lang=',
  'settings.section.llm': '// LLM 密钥',
  'settings.section.account': '// 账户',

  // Errors
  'error.keyNotConfigured': 'API 密钥未配置。请在设置中添加。',
  'error.unauthorized': '请登录后继续。',
  'error.notFound': '未找到。',
  'error.serverError': '服务器错误。请重试。',

  // Time
  'time.just.now': '刚刚',
  'time.minutes': '{n}分钟前',
  'time.hours': '{n}小时前',
  'time.days': '{n}天前',

  // User menu
  'menu.profile': '我的主页',
  'menu.llm': 'LLM / CLI',
  'menu.settings': '设置',
  'menu.logout': '退出登录',
};

export default zh;
