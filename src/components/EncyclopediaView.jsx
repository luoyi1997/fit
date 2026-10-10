import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, Tag, Target, Dumbbell, Lightbulb, NotebookPen } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

function ExerciseCard({ exercise, isExpanded, onToggle, index }) {
  const hasNotes = exercise.notes && exercise.notes.length > 0

  return (
    <div
      className="
        bg-white rounded-2xl border border-emerald-900/5 shadow-sm
        hover:shadow-xl hover:shadow-emerald-900/5 hover:border-lime-300/60
        transition-all duration-300 animate-fade-in-up overflow-hidden group
      "
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      {/* 卡片头部 */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 sm:px-6 lg:px-7 py-4 sm:py-5 lg:py-6 flex items-start justify-between gap-4 hover:bg-gradient-to-br hover:from-lime-50/70 hover:to-orange-50/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {exercise.name}
          </h4>
          {exercise.alias && (
            <span className="inline-block text-xs lg:text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1.5">
              {exercise.alias}
            </span>
          )}
          {exercise.tags && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {exercise.tags.split(/\s+/).filter(t => t).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] sm:text-xs font-medium bg-lime-100 text-emerald-700 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {exercise.params && (
            <p className="text-sm lg:text-base text-slate-600 mt-2 flex items-center gap-1.5">
              <Dumbbell size={14} className="shrink-0 text-orange-400" />
              <span>{exercise.params}</span>
            </p>
          )}
        </div>
        <span className={`mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-orange-500' : 'text-slate-300 group-hover:text-emerald-500'}`}>
          <ChevronDown size={22} />
        </span>
      </button>

      {/* 展开详情 — grid-rows 平滑动画 */}
      <div className={`expand-grid ${isExpanded ? 'open' : ''}`}>
        <div className="expand-grid-inner">
          <div className="px-5 sm:px-6 lg:px-7 pb-5 sm:pb-6 lg:pb-7 border-t border-lime-100/60 pt-4 sm:pt-5 lg:pt-6">
            {/* 目标肌群 */}
            {exercise.target && (
              <div className="mb-4 lg:mb-5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 mb-1.5 lg:mb-2">
                  <Target size={14} />
                  <span>目标肌群</span>
                </div>
                <p className="text-sm lg:text-base text-emerald-900 bg-gradient-to-r from-emerald-50 to-lime-50 rounded-xl px-4 py-2.5 border border-emerald-100/70">
                  {exercise.target}
                </p>
              </div>
            )}

            {/* 动作要领 */}
            {exercise.instructions.length > 0 && (
              <div className="mb-4 lg:mb-5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 mb-1.5 lg:mb-2">
                  <Dumbbell size={14} />
                  <span>动作要领</span>
                </div>
                <ul className="space-y-2 lg:space-y-2.5 ml-1">
                  {exercise.instructions.map((inst, i) => (
                    <li key={i} className="text-sm lg:text-base text-slate-700 flex gap-2">
                      <span className="text-lime-500 mt-0.5 shrink-0 select-none">-</span>
                      <MarkdownRenderer content={inst} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 疑难点答疑 */}
            {exercise.tips.length > 0 && (
              <>
                <div className="border-t border-orange-100/60 my-4 lg:my-5" />
                <div className="mb-4 lg:mb-5">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-orange-500 mb-1.5 lg:mb-2">
                    <Lightbulb size={14} />
                    <span>疑难点 / 知识补充</span>
                  </div>
                  <div className="bg-orange-50/60 rounded-xl px-4 py-2.5 lg:py-3 space-y-1 border border-orange-100/70">
                    {exercise.tips.map((tip, i) => (
                      <div key={i} className="text-sm lg:text-base text-slate-600 leading-relaxed">
                        <MarkdownRenderer content={tip} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 原稿记录 */}
            {hasNotes && (
              <>
                <div className="border-t border-amber-100/60 my-4 lg:my-5" />
                <div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-600 mb-2 lg:mb-3">
                    <NotebookPen size={14} />
                    <span>原稿记录</span>
                  </div>
                  <div className="bg-amber-50/70 rounded-xl px-4 py-3 lg:py-3.5 space-y-2 border border-amber-200/60">
                    {exercise.notes.map((note, i) => (
                      <div key={i} className="text-sm lg:text-base text-slate-600 leading-relaxed">
                        <MarkdownRenderer content={note} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 原稿记录 — 卡片底部始终可见的预览 */}
      {hasNotes && !isExpanded && (
        <div className="border-t border-lime-100/60 bg-gradient-to-r from-lime-50/50 to-orange-50/30 px-5 sm:px-6 lg:px-7 py-3 lg:py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-amber-500 mb-1">
            <NotebookPen size={12} />
            <span>原稿记录</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
            {exercise.notes[0].replace(/\n/g, ' ')}
          </p>
        </div>
      )}
    </div>
  )
}

export default function EncyclopediaView({ sections, searchQuery }) {
  const [expandedMap, setExpandedMap] = useState({})

  const toggleExercise = (key) => {
    setExpandedMap(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // 搜索过滤
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sections

    const q = searchQuery.toLowerCase()
    return sections.map(section => ({
      ...section,
      exercises: section.exercises.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        ex.tags.toLowerCase().includes(q) ||
        ex.target.toLowerCase().includes(q) ||
        (ex.alias && ex.alias.toLowerCase().includes(q)) ||
        ex.instructions.some(i => i.toLowerCase().includes(q)) ||
        ex.notes.some(n => n.toLowerCase().includes(q))
      ),
    })).filter(section => section.exercises.length > 0)
  }, [sections, searchQuery])

  // 搜索时自动展开匹配的结果
  useEffect(() => {
    if (!searchQuery.trim()) return
    const newMap = {}
    filtered.forEach(section => {
      section.exercises.forEach((ex, i) => {
        newMap[`${section.category}-${i}`] = true
      })
    })
    setExpandedMap(prev => ({ ...newMap, ...prev }))
  }, [searchQuery])

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Tag size={48} className="mx-auto mb-4 opacity-40 text-emerald-300" />
        <p className="text-lg font-medium text-slate-500">没有匹配的动作</p>
        <p className="text-sm mt-1">试试其他关键词</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {filtered.map((section) => {
        if (section.exercises.length === 0) return null
        return (
          <div key={section.category}>
            {/* 分类标题 — 渐变装饰条 */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-1 rounded-full brand-gradient-bg" />
                <span className="text-[11px] sm:text-xs lg:text-sm text-emerald-600 uppercase tracking-wider font-semibold">
                  {section.megaSection}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900">
                {section.category}
              </h3>
              <div className="mt-2.5 h-[2px] w-full bg-gradient-to-r from-lime-300 via-emerald-300 to-transparent rounded-full" />
            </div>
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-5">
              {section.exercises.map((exercise, i) => {
                const key = `${section.category}-${i}`
                const expanded = expandedMap[key] || false
                return (
                  <ExerciseCard
                    key={key}
                    exercise={exercise}
                    isExpanded={expanded}
                    onToggle={() => toggleExercise(key)}
                    index={i}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
