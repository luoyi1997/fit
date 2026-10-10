import { useMemo } from 'react'
import rawMd from '../../健身知识库.md?raw'

/**
 * 解析百科流（第一部分）— 新格式适配
 * 新格式: ## 🏋️‍♂️ / ### 一、练腹 / #### 动作名 / **【标签】** ...
 */
function parseEncyclopedia(content) {
  const sections = []

  // 按 ## 大类拆分（常规课 / 体态课）
  const megaBlocks = content.split(/(?=^## )/m).filter(b => b.trim())

  for (const block of megaBlocks) {
    const lines = block.trim().split('\n')
    const megaTitle = lines[0].replace(/^## /, '').trim()

    if (!megaTitle.includes('🏋') && !megaTitle.includes('🧘')) continue

    // 按 ### 部位拆分
    const bodyParts = block.split(/(?=^### )/m).filter(p => p.trim().match(/^### /))

    for (const part of bodyParts) {
      const partLines = part.split('\n')
      const partTitle = partLines[0].replace(/^### /, '').trim()

      // 按 #### 拆解每个动作
      const exerciseBlocks = part.split(/(?=^#### )/m).filter(e => e.trim().match(/^#### /))

      const exercises = []
      for (const eb of exerciseBlocks) {
        const ex = parseExerciseNew(eb.trim())
        if (ex) exercises.push(ex)
      }

      if (exercises.length > 0) {
        sections.push({ megaSection: megaTitle, category: partTitle, exercises })
      }
    }
  }

  return sections
}

function parseExerciseNew(text) {
  const lines = text.split('\n')

  // 第一行: "#### 动作名称（别名）"
  const firstLine = lines[0] || ''
  const nameMatch = firstLine.match(/^#### (.+)/)
  if (!nameMatch) return null

  const fullName = nameMatch[1].trim()
  const name = fullName.replace(/（.*?）$/, '').trim()
  const aliasMatch = fullName.match(/（(.*?)）/)
  const alias = aliasMatch ? aliasMatch[1] : ''

  let tags = '', target = '', muscles = '', params = ''
  let instructions = [], tips = [], notes = []
  let currentSection = ''

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 新格式 Bold 字段
    if (trimmed.includes('**【标签】**')) {
      tags = trimmed.replace(/\*\*【标签】\*\*\s*/, '').trim()
      currentSection = ''
    } else if (trimmed.includes('**【锻炼部位】**')) {
      target = trimmed.replace(/\*\*【锻炼部位】\*\*\s*/, '').trim()
      currentSection = ''
    } else if (trimmed.includes('**【发力肌肉】**')) {
      muscles = trimmed.replace(/\*\*【发力肌肉】\*\*\s*/, '').trim()
      currentSection = ''
    } else if (trimmed.includes('**【动作参数】**')) {
      params = trimmed.replace(/\*\*【动作参数】\*\*\s*/, '').trim()
      currentSection = 'params'
    } else if (trimmed.includes('**【动作要点step】**')) {
      currentSection = 'instructions'
    } else if (trimmed.includes('**【原稿记录、其他疑难点】**')) {
      currentSection = 'notes'
    // 旧格式兼容
    } else if (trimmed.startsWith('标签：')) {
      tags = trimmed.replace('标签：', '').trim()
      currentSection = ''
    } else if (trimmed.startsWith('目标肌群：')) {
      target += ' ' + trimmed.replace('目标肌群：', '').trim()
      currentSection = ''
    } else if (trimmed.startsWith('肌群作用：')) {
      muscles += ' ' + trimmed.replace('肌群作用：', '').trim()
      currentSection = ''
    } else if (trimmed.startsWith('📋 动作参数：')) {
      params = trimmed.replace('📋 动作参数：', '').trim()
      currentSection = 'params'
    } else if (trimmed.startsWith('🎯 动作要领：')) {
      currentSection = 'instructions'
      const rest = trimmed.replace('🎯 动作要领：', '').trim()
      if (rest) instructions.push(rest)
    } else if (trimmed.startsWith('💡')) {
      currentSection = 'tips'
      const tipText = trimmed.replace(/^💡\s*/, '')
      if (tipText) tips.push(tipText)
    } else if (trimmed.startsWith('📝')) {
      currentSection = 'notes'
    } else if (trimmed.startsWith('Q:') || trimmed.startsWith('A:')) {
      currentSection = 'tips'
      tips.push(trimmed)
    } else if (trimmed.match(/^\d+\.\s/)) {
      // 编号步骤 = instructions
      if (currentSection === 'instructions') {
        instructions.push(trimmed.replace(/^\d+\.\s/, '').trim())
      }
    } else if (trimmed.startsWith('- ')) {
      // 列表项，归入当前区域
      const item = trimmed.replace(/^- /, '').trim()
      if (currentSection === 'notes') notes.push(item)
      else if (currentSection === 'tips') tips.push(item)
      else if (currentSection === 'instructions') instructions.push(item)
    } else if (trimmed && !trimmed.startsWith('#')) {
      if (currentSection === 'instructions') {
        instructions.push(trimmed)
      } else if (currentSection === 'tips') {
        tips.push(trimmed)
      } else if (currentSection === 'notes') {
        notes.push(trimmed)
      } else if (currentSection === 'params') {
        params += ' ' + trimmed
      }
    }
  }

  const targetDisplay = [target.trim(), muscles.trim()].filter(Boolean).join(' | ')

  return {
    name,
    alias,
    tags,
    target: targetDisplay,
    params: params.trim(),
    instructions: instructions.filter(i => i),
    tips: tips.filter(t => t),
    notes: notes.filter(n => n),
    rawMarkdown: text,
  }
}

/**
 * 解析日志流（第二部分）— 新格式适配
 * 新格式: ### 2026-05-30 练腹 / **类型** / **【热身】** / **【正式组】** / **【拉伸】**
 */
function parseDiary(content) {
  const entries = []

  // 去掉 ## 大类标题行
  const diaryBlocks = content.split(/(?=^### \d{4})/m).filter(b => b.trim())

  for (const block of diaryBlocks) {
    const lines = block.trim().split('\n')
    const firstLine = lines[0] || ''

    const dateMatch = firstLine.match(/^### (\d{4}-\d{2}-\d{2})\s+(.+)/)
    if (!dateMatch) continue

    const entry = {
      date: dateMatch[1],
      title: dateMatch[2],
      type: '',
      sections: [],
      raw: block.trim(),
    }

    // 提取类型
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('**类型**')) {
        entry.type = trimmed.replace(/\*\*类型\*\*[：:]?\s*/, '').trim()
      }
    }

    // 解析分段：热身 / 正式组 / 拉伸 / 训练内容
    const contentStr = lines.slice(1).join('\n')
    const sectionHeaders = ['热身', '正式组', '拉伸', '训练内容', '有氧']
    const foundSections = []

    for (const header of sectionHeaders) {
      const re = new RegExp(`\\*\\*【${header}】\\*\\*\\s*`, 'g')
      let m
      while ((m = re.exec(contentStr)) !== null) {
        foundSections.push({ header, pos: m.index + m[0].length })
      }
    }
    foundSections.sort((a, b) => a.pos - b.pos)

    if (foundSections.length === 0) {
      // 无分段，收集所有列表项
      const items = []
      for (const line of lines.slice(1)) {
        const trimmed = line.trim()
        if (trimmed.startsWith('- ')) items.push(trimmed.replace(/^- /, ''))
        else if (trimmed && !trimmed.startsWith('**') && !trimmed.startsWith('#')) items.push(trimmed)
      }
      if (items.length > 0) {
        entry.sections.push({ header: '训练内容', items })
      }
    } else {
      for (let i = 0; i < foundSections.length; i++) {
        const start = foundSections[i].pos
        const end = (i + 1 < foundSections.length) ? foundSections[i + 1].pos - (foundSections[i + 1].header.length + 5) : contentStr.length
        const sectionContent = contentStr.substring(start, Math.min(end, contentStr.length))
        const items = sectionContent.split('\n').map(l => {
          let t = l.trim()
          if (t.startsWith('- ')) t = t.replace(/^- /, '')
          return t
        }).filter(l => l && !l.startsWith('##') && !l.startsWith('**类型'))
        
        if (items.length > 0) {
          entry.sections.push({ header: foundSections[i].header, items })
        }
      }
    }

    entries.push(entry)
  }

  return entries
}

export default function useParseKnowledge() {
  const data = useMemo(() => {
    const raw = rawMd.replace(/\r\n/g, '\n')

    const part2Start = raw.indexOf('# 第二部分：日志流（训练日记）')
    const part1Raw = raw.substring(0, part2Start).replace('# 第一部分：百科流（动作知识库）\n', '').trim()
    const part2Raw = raw.substring(part2Start).replace('# 第二部分：日志流（训练日记）\n', '').trim()

    const encyclopedia = parseEncyclopedia(part1Raw)
    const diary = parseDiary(part2Raw)

    return { encyclopedia, diary }
  }, [])

  return data
}

