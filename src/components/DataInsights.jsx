import { useMemo } from 'react'
import { BarChart3, Hash, PieChart } from 'lucide-react'

/**
 * 数据洞察面板：动作总数 / 部位分布（CSS 条形图）/ 标签词频 TopN
 * 零图表库依赖，纯 div + 百分比宽度实现。
 */
export default function DataInsights({ sections }) {
  const insights = useMemo(() => {
    const exercises = sections.flatMap(s => s.exercises)
    const total = exercises.length

    const partCounts = sections
      .map(s => ({ category: s.category, count: s.exercises.length }))
      .filter(p => p.count > 0)
    const maxPart = Math.max(1, ...partCounts.map(p => p.count))

    const tagFreq = {}
    exercises.forEach(ex => {
      String(ex.tags || '').split(/\s+/).filter(Boolean).forEach(t => {
        tagFreq[t] = (tagFreq[t] || 0) + 1
      })
    })
    const topTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    return { total, partCounts, maxPart, topTags }
  }, [sections])

  if (insights.total === 0) return null

  return (
    <section aria-label="数据洞察面板" className="mb-6 sm:mb-8">
      <div className="bg-brand-card rounded-2xl border border-brand-border shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-brand-primary" />
          <h2 className="text-base sm:text-lg font-bold text-brand-text">数据洞察</h2>
          <span className="text-[11px] sm:text-xs text-brand-text-secondary">实时统计 · 知识库规模</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* 动作总数 */}
          <div className="bg-brand-page rounded-xl border border-brand-border px-4 py-3.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text-secondary mb-1">
              <Hash size={12} />
              动作总数
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-primary">{insights.total}</div>
            <div className="text-[11px] text-brand-text-placeholder mt-0.5">{sections.length} 个部位分类</div>
          </div>

          {/* 部位分布 — CSS 条形图 */}
          <div className="sm:col-span-2 bg-brand-page rounded-xl border border-brand-border px-4 py-3.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text-secondary mb-3">
              <PieChart size={12} />
              部位分布
            </div>
            <div className="space-y-2">
              {insights.partCounts.map(p => (
                <div key={p.category} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-14 sm:w-16 shrink-0 truncate text-[11px] sm:text-xs text-brand-text-secondary" title={p.category}>
                    {p.category}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-brand-border overflow-hidden">
                    <div
                      className="h-full rounded-full brand-gradient-bg"
                      style={{ width: `${(p.count / insights.maxPart) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-brand-text">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 标签词频 TopN */}
        {insights.topTags.length > 0 && (
          <div className="mt-4 bg-brand-page rounded-xl border border-brand-border px-4 py-3.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text-secondary mb-2.5">
              <Hash size={12} />
              标签词频 Top{insights.topTags.length}
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.topTags.map(([tag, count], i) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium bg-brand-accent-soft text-brand-accent px-2.5 py-1 rounded-full border border-brand-accent/15"
                >
                  <span className="text-brand-accent/60">#{i + 1}</span>
                  <span>{tag}</span>
                  <span className="font-bold text-brand-accent/70">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
