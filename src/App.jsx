import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, BookOpen, CalendarDays, Dumbbell, X, Aperture } from 'lucide-react'
import useParseKnowledge from './hooks/useParseKnowledge'
import EncyclopediaView from './components/EncyclopediaView'
import DiaryView from './components/DiaryView'
import DataInsights from './components/DataInsights'

const TABS = [
  { key: 'encyclopedia', label: '百科流', icon: BookOpen, desc: '动作知识库' },
  { key: 'diary', label: '日志流', icon: CalendarDays, desc: '训练日记' },
]

/** 从 location.hash 解析可还原状态：tab / 搜索词 / 部位筛选 / 标签筛选 / 展开项 */
function parseHashState() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return {
    tab: params.get('tab') === 'diary' ? 'diary' : 'encyclopedia',
    searchQuery: params.get('q') || '',
    parts: (params.get('parts') || '').split(',').filter(Boolean),
    tags: (params.get('tags') || '').split(',').filter(Boolean),
    expandedKeys: (params.get('exp') || '').split(',').filter(Boolean),
  }
}

export default function App() {
  const { encyclopedia, diary } = useParseKnowledge()

  // URL 状态同步：初始状态从 hash 恢复
  const initial = useMemo(parseHashState, [])
  const [activeTab, setActiveTab] = useState(initial.tab)
  const [searchQuery, setSearchQuery] = useState(initial.searchQuery)
  const [selectedParts, setSelectedParts] = useState(initial.parts)
  const [selectedTags, setSelectedTags] = useState(initial.tags)
  const [expandedKeys, setExpandedKeys] = useState(initial.expandedKeys)

  const stats = useMemo(() => {
    const exerciseCount = encyclopedia.reduce((sum, s) => sum + s.exercises.length, 0)
    return {
      exercises: exerciseCount,
      diaryEntries: diary.length,
      categories: encyclopedia.length,
    }
  }, [encyclopedia, diary])

  // 筛选元数据：部位列表 + 标签 Top10（供筛选 chips 与高亮复用）
  const filterMeta = useMemo(() => {
    const parts = encyclopedia.map(s => s.category)
    const tagFreq = {}
    encyclopedia.forEach(s =>
      s.exercises.forEach(ex =>
        String(ex.tags || '').split(/\s+/).filter(Boolean).forEach(t => {
          tagFreq[t] = (tagFreq[t] || 0) + 1
        })
      )
    )
    const tags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([t]) => t)
    return { parts, tags }
  }, [encyclopedia])

  // URL 状态同步：状态变更 → 写 hash（replaceState 避免历史堆积与循环触发）
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeTab !== 'encyclopedia') params.set('tab', activeTab)
    if (searchQuery) params.set('q', searchQuery)
    if (selectedParts.length) params.set('parts', selectedParts.join(','))
    if (selectedTags.length) params.set('tags', selectedTags.join(','))
    if (expandedKeys.length) params.set('exp', expandedKeys.join(','))
    const target = `#${params.toString()}`
    if (window.location.hash !== target) {
      history.replaceState(null, '', target)
    }
  }, [activeTab, searchQuery, selectedParts, selectedTags, expandedKeys])

  // URL 状态同步：hash 变化（前进/后退/手动编辑链接）→ 恢复状态
  useEffect(() => {
    const onHashChange = () => {
      const s = parseHashState()
      setActiveTab(s.tab)
      setSearchQuery(s.searchQuery)
      setSelectedParts(s.parts)
      setSelectedTags(s.tags)
      setExpandedKeys(s.expandedKeys)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const activeTabData = TABS.find(t => t.key === activeTab)

  const toggleExpanded = useCallback((key) => {
    setExpandedKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
  }, [])

  const togglePart = useCallback((part) => {
    setSelectedParts(prev => (prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]))
  }, [])

  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedParts([])
    setSelectedTags([])
  }, [])

  return (
    <div className="min-h-svh bg-brand-page">
      {/* 顶部导航栏 — 主色深墨绿渐变，一体化吸顶（含 Tab 与搜索栏） */}
      <header className="sticky top-0 z-50 brand-header-bg shadow-lg shadow-brand-primary/20">
        <div className="max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo 与标题 */}
          <div className="py-4 sm:py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-brand-primary/30 ring-2 ring-white/20">
                <Dumbbell size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-white leading-tight tracking-wide">
                  健身知识库
                </h1>
                <p className="text-[11px] sm:text-xs lg:text-sm text-white/80 mt-0.5">
                  <span className="font-bold text-brand-primary-light">{stats.exercises}</span> 个动作
                  <span className="mx-1 text-white/30">·</span>
                  <span className="font-bold text-brand-primary-light">{stats.diaryEntries}</span> 篇日记
                  <span className="mx-1 text-white/30">·</span>
                  <span className="font-bold text-brand-primary-light">{stats.categories}</span> 个分类
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-white/90 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
              <Aperture size={12} className="text-brand-accent-soft" />
              INTJ 浅系
            </span>
          </div>

          {/* Tab 切换 — 胶囊样式（激活态主色实底） */}
          <div className="pb-3 sm:pb-4">
            <div className="inline-flex bg-black/20 rounded-full p-1 ring-1 ring-white/10">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    aria-pressed={isActive}
                    className={`
                      relative flex items-center justify-center gap-2 min-h-[44px] px-5 sm:px-6 py-2.5
                      text-sm lg:text-base font-semibold rounded-full
                      transition-all duration-300 ease-out
                      ${isActive
                        ? 'brand-pill-active text-white shadow-lg shadow-black/10'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 搜索栏 — 浅色卡片 + 主色焦点环 */}
          <div className="pb-4 sm:pb-5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`在 ${activeTabData?.desc || ''} 中搜索... (如"练肩"、"中束"、"深蹲")`}
                aria-label="搜索"
                className="
                  w-full min-h-[48px] pl-11 pr-11 py-3
                  text-sm sm:text-base
                  bg-brand-card border-2 border-transparent rounded-2xl
                  placeholder:text-brand-text-placeholder text-brand-text
                  shadow-lg shadow-black/10
                  focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20
                  transition-all duration-200
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="清空搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-brand-text-placeholder hover:text-brand-primary hover:bg-brand-primary-soft transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div key={activeTab} className="animate-fade-in-up">
          {activeTab === 'encyclopedia' && (
            <>
              <DataInsights sections={encyclopedia} />
              <EncyclopediaView
                sections={encyclopedia}
                searchQuery={searchQuery}
                selectedParts={selectedParts}
                selectedTags={selectedTags}
                expandedKeys={expandedKeys}
                onToggleExpand={toggleExpanded}
                onTogglePart={togglePart}
                onToggleTag={toggleTag}
                parts={filterMeta.parts}
                tags={filterMeta.tags}
                onClearFilters={clearFilters}
              />
            </>
          )}
          {activeTab === 'diary' && (
            <DiaryView
              entries={diary}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </main>

      {/* 底部 */}
      <footer className="max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4 text-center text-xs text-brand-text-placeholder">
        <p>
          个人健身知识库 · <span className="text-brand-primary font-medium">持续更新中</span>
        </p>
      </footer>
    </div>
  )
}
