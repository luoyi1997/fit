import { useState, useMemo } from 'react'
import { Search, BookOpen, CalendarDays, Dumbbell, X, Flame } from 'lucide-react'
import useParseKnowledge from './hooks/useParseKnowledge'
import EncyclopediaView from './components/EncyclopediaView'
import DiaryView from './components/DiaryView'

const TABS = [
  { key: 'encyclopedia', label: '百科流', icon: BookOpen, desc: '动作知识库' },
  { key: 'diary', label: '日志流', icon: CalendarDays, desc: '训练日记' },
]

export default function App() {
  const { encyclopedia, diary } = useParseKnowledge()
  const [activeTab, setActiveTab] = useState('encyclopedia')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => {
    const exerciseCount = encyclopedia.reduce((sum, s) => sum + s.exercises.length, 0)
    return {
      exercises: exerciseCount,
      diaryEntries: diary.length,
      categories: encyclopedia.length,
    }
  }, [encyclopedia, diary])

  const activeTabData = TABS.find(t => t.key === activeTab)

  return (
    <div className="min-h-svh bg-slate-50">
      {/* 顶部导航栏 — 深墨绿渐变，一体化吸顶（含 Tab 与搜索栏） */}
      <header className="sticky top-0 z-50 brand-header-bg shadow-lg shadow-emerald-900/15">
        <div className="max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo 与标题 */}
          <div className="py-4 sm:py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-lime-500/25 ring-2 ring-white/20">
                <Dumbbell size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-white leading-tight tracking-wide">
                  健身知识库
                </h1>
                <p className="text-[11px] sm:text-xs lg:text-sm text-emerald-100/80 mt-0.5">
                  <span className="font-bold text-lime-300">{stats.exercises}</span> 个动作
                  <span className="mx-1 text-emerald-100/40">·</span>
                  <span className="font-bold text-lime-300">{stats.diaryEntries}</span> 篇日记
                  <span className="mx-1 text-emerald-100/40">·</span>
                  <span className="font-bold text-lime-300">{stats.categories}</span> 个分类
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-100/90 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
              <Flame size={12} className="text-orange-400" />
              运动活力
            </span>
          </div>

          {/* Tab 切换 — 胶囊样式（激活态荧光绿→橙渐变） */}
          <div className="pb-3 sm:pb-4">
            <div className="inline-flex bg-black/25 rounded-full p-1 ring-1 ring-white/10">
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
                        ? 'brand-pill-active text-emerald-950 shadow-lg shadow-lime-500/25'
                        : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon size={16} className={isActive ? 'text-emerald-900' : 'text-lime-300/80'} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 搜索栏 — 醒目易触达（浅色卡片 + 荧光绿焦点环） */}
          <div className="pb-4 sm:pb-5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`在 ${activeTabData?.desc || ''} 中搜索... (如"练肩"、"中束"、"深蹲")`}
                className="
                  w-full min-h-[48px] pl-11 pr-11 py-3
                  text-sm sm:text-base
                  bg-white border-2 border-transparent rounded-2xl
                  placeholder:text-slate-400 text-slate-800
                  shadow-lg shadow-black/10
                  focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/25
                  transition-all duration-200
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="清空搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
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
            <EncyclopediaView
              sections={encyclopedia}
              searchQuery={searchQuery}
            />
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
      <footer className="max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4 text-center text-xs text-slate-400">
        <p>
          个人健身知识库 · <span className="text-emerald-500 font-medium">持续更新中</span>
        </p>
      </footer>
    </div>
  )
}
