#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
健身知识库素材合并脚本 (merge_notes.py)
========================================
功能：
  把「素材目录/输入文件」中按模板书写的 .md 笔记条目，合并进 健身知识库.md。
  只新增缺失条目，同名动作自动去重跳过，日期已存在的日志自动跳过，天然幂等。

用法：
  python merge_notes.py [--kb <知识库路径>] [--src <素材目录>] [--input <额外文件>...]
  默认 --kb 指向 output/fitness-app-redesign/健身知识库.md
  默认 --src 指向 E:/01-正经日记/03-减肥日记/健身笔记（只扫描 *.md，docx 等忽略）

输出：
  stdout 打印 JSON 报告：{ added, duplicated_skipped, diary_added, diary_skipped }
  合并前自动备份 健身知识库.md.bak（与知识库同目录）
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

# ---------- 默认路径 ----------
OUTPUT_DIR = Path(r"C:\Users\ly177\AppData\Roaming\Tencent\Marvis\User\oAN1i2RXakqb1eKthpobcwtBJrUQ\workspace\conv_0046984cb7d14d999d1ab6fdddad7e1f\output\fitness-app-redesign")
DEFAULT_KB = OUTPUT_DIR / "健身知识库.md"
DEFAULT_SRC = Path(r"E:\01-正经日记\03-减肥日记\健身笔记")

PART1_HEAD = "# 第一部分：百科流（动作知识库）"
PART2_HEAD = "# 第二部分：日志流（训练日记）"

DATE_RE = re.compile(r"^### (\d{4}-\d{2}-\d{2})\s+(.+)$")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def split_parts(raw: str):
    """返回 (part1, part2) 文本。"""
    p2 = raw.find(PART2_HEAD)
    if p2 < 0:
        p2 = len(raw)
    p1 = raw.find(PART1_HEAD)
    start1 = p1 if p1 >= 0 else 0
    part1 = raw[start1:p2].replace(PART1_HEAD + "\n", "", 1)
    part2 = raw[p2:]
    return part1, part2


def collect_existing_actions(part1: str):
    """返回 {动作基础名: 完整标题}，基础名 = 去掉「（别名）」后的名称。"""
    names = {}
    for line in part1.splitlines():
        m = re.match(r"^#### (.+)$", line.strip())
        if m:
            full = m.group(1).strip()
            base = re.sub(r"（.*?）$", "", full).strip()
            names[base] = full
    return names


def collect_existing_dates(part2: str):
    dates = set()
    for line in part2.splitlines():
        m = DATE_RE.match(line.strip())
        if m:
            dates.add(m.group(1))
    return dates


def parse_template(text: str):
    """
    解析模板文件，返回 dict:
      sections: [ {title, items: [条目原文块...] } ]   （百科区）
      diaries:  [ {date, title, block} ]                （日志区）
    模板结构：
      ## 模板说明（可省略）
      ### 练肩
      #### 动作名
      ...条目正文...
      ### 日志
      ### 2026-06-22 高间歇有氧
      ...日志正文...
    """
    sections = []
    diaries = []
    current_section = None
    current_items = []
    pending_diary = None  # 日志区标记

    for line in text.splitlines():
        s = line.strip()
        if s.startswith("### "):
            # 新的一节
            title = s[4:].strip()
            # 判断是否为日志条目（### YYYY-MM-DD ...）
            dm = DATE_RE.match(s)
            if dm:
                # 先收尾上一个 section
                if current_section is not None:
                    sections.append({"title": current_section, "items": current_items})
                    current_section, current_items = None, []
                pending_diary = {"date": dm.group(1), "title": dm.group(2), "lines": [s]}
            else:
                if pending_diary is not None:
                    pending_diary["lines"].append(s)  # 日志内嵌套###（罕见），并入
                else:
                    if current_section is not None:
                        sections.append({"title": current_section, "items": current_items})
                    current_section = title
                    current_items = []
            continue
        if s.startswith("#### ") and pending_diary is None:
            # 新条目
            if current_section is None:
                current_section = "未分类"
                current_items = []
            current_items.append(line)
            continue
        # 普通行
        if pending_diary is not None:
            pending_diary["lines"].append(line)
        elif current_section is not None:
            current_items.append(line)

    if current_section is not None:
        sections.append({"title": current_section, "items": current_items})
    if pending_diary is not None:
        diaries.append(pending_diary)

    return {"sections": sections, "diaries": diaries}


def split_exercise_blocks(items):
    """把条目行列表拆成若干个「#### 开头」的块。"""
    blocks = []
    cur = []
    for line in items:
        if line.strip().startswith("#### "):
            if cur:
                blocks.append(cur)
            cur = [line]
        else:
            cur.append(line)
    if cur:
        blocks.append(cur)
    return ["\n".join(b).strip() + "\n" for b in blocks]


def match_section(title, part1):
    """在知识库百科区找包含该标题的部位标题；找不到返回 None。"""
    for line in part1.splitlines():
        s = line.strip()
        if s.startswith("### "):
            part_title = s[4:].strip()
            if title in part_title or part_title in title:
                return s
    return None


def insert_exercise_block(part1, block, section_title):
    """把条目块插入 part1 对应部位末尾（该部位最后一个动作块之后、下个###/##之前）。"""
    heading = match_section(section_title, part1)
    if heading is None:
        # 追加新部位到百科区末尾（第二部分之前）
        new_part = f"\n### {section_title}\n\n{block}\n---\n"
        idx = part1.rstrip().rfind("\n")
        # 在 part1 末尾插入；若以 ## 大类结尾则插在其后
        return part1.rstrip() + "\n" + new_part + "\n", True
    # 找到该部位结束位置（下一个 ### 或文件末尾）
    lines = part1.splitlines(keepends=True)
    in_part = False
    insert_at = len(part1)
    for i, ln in enumerate(lines):
        if ln.strip().startswith("### "):
            if ln.strip() == heading:
                in_part = True
                continue
            if in_part:
                insert_at = len("".join(lines[:i]))
                break
    if not in_part:
        insert_at = len(part1)
    before = part1[:insert_at].rstrip()
    after = part1[insert_at:]
    new_part = before + "\n\n" + block + "\n---\n" + after
    # 若 after 以换行开头，保留
    return new_part, True


def insert_diary(part2, diary_entry):
    """把新日志插入 part2 常规课日志区末尾；体态课判断类型插入体态区。"""
    block = "\n".join(diary_entry["lines"]).strip() + "\n"
    is_posture = "体态" in diary_entry.get("type_text", "")
    # 判断类型：在块内找 **类型** 行
    type_line = ""
    for ln in diary_entry["lines"]:
        if "**类型**" in ln:
            type_line = ln
            break
    if "体态" in type_line:
        is_posture = True
    # 找插入点：常规课/体态课日志区末尾
    if is_posture:
        anchor = "## 🧘‍♀️ 体态课训练日志"
    else:
        anchor = "## 🏋️‍♂️ 常规课训练日志"
    idx = part2.find(anchor)
    if idx < 0:
        return part2.rstrip() + "\n\n" + block + "\n", True
    # 在该区最后一个条目（---）之后插入
    tail = part2[idx:]
    insert_at = idx + len(tail.rstrip())
    new_tail = tail.rstrip() + "\n\n" + block + "\n---\n"
    return part2[:idx] + new_tail + tail[len(tail.rstrip()):], True


def main():
    ap = argparse.ArgumentParser(description="健身知识库素材合并")
    ap.add_argument("--kb", default=str(DEFAULT_KB))
    ap.add_argument("--src", default=str(DEFAULT_SRC))
    ap.add_argument("--input", nargs="*", default=[])
    args = ap.parse_args()

    kb_path = Path(args.kb)
    if not kb_path.exists():
        print(json.dumps({"error": f"知识库文件不存在: {kb_path}"}, ensure_ascii=False))
        sys.exit(1)

    # 收集输入文件：--input 显式 + --src 目录下 *.md
    inputs = [Path(p) for p in args.input]
    src_dir = Path(args.src)
    if src_dir.exists():
        for f in sorted(src_dir.glob("*.md")):
            if f not in inputs:
                inputs.append(f)
    inputs = [f for f in inputs if f.exists()]
    if not inputs:
        print(json.dumps({"error": "没有找到可合并的 .md 输入文件"}, ensure_ascii=False))
        sys.exit(1)

    raw = read_text(kb_path)
    part1, part2 = split_parts(raw)
    existing_actions = collect_existing_actions(part1)
    existing_dates = collect_existing_dates(part2)

    report = {"added": [], "duplicated_skipped": [], "diary_added": [], "diary_skipped": []}

    for in_file in inputs:
        parsed = parse_template(read_text(in_file))
        for sec in parsed["sections"]:
            for block in split_exercise_blocks(sec["items"]):
                if not block.strip():
                    continue
                first = block.strip().splitlines()[0]
                m = re.match(r"^#### (.+)$", first.strip())
                if not m:
                    continue
                full = m.group(1).strip()
                base = full  # 以完整标题去重，括号变体视为独立条目（与知识库现有风格一致）
                if base in existing_actions:
                    report["duplicated_skipped"].append({"action": full, "existing": existing_actions[base], "source": str(in_file)})
                    continue
                part1, _ok = insert_exercise_block(part1, block, sec["title"])
                existing_actions[base] = full
                report["added"].append({"action": full, "section": sec["title"], "source": str(in_file)})

        for d in parsed["diaries"]:
            if d["date"] in existing_dates:
                report["diary_skipped"].append({"date": d["date"], "title": d["title"], "reason": "日期已存在"})
                continue
            part2, _ok = insert_diary(part2, d)
            existing_dates.add(d["date"])
            report["diary_added"].append({"date": d["date"], "title": d["title"]})

    # 备份 + 写回
    backup = kb_path.with_suffix(kb_path.suffix + ".bak")
    shutil.copy2(kb_path, backup)
    new_content = raw[: raw.find(PART1_HEAD)] + PART1_HEAD + "\n" + part1.rstrip() + "\n\n" + PART2_HEAD + "\n" + part2.lstrip("\n") if False else \
        raw[: raw.find(PART1_HEAD)] if raw.find(PART1_HEAD) >= 0 else ""
    # 更稳妥的重组方式：保留原文件前缀（若有），替换 part1+part2 区域
    if raw.find(PART1_HEAD) >= 0:
        new_content = raw[: raw.find(PART1_HEAD)] + PART1_HEAD + "\n" + part1.rstrip() + "\n\n" + PART2_HEAD + "\n" + part2[len(PART2_HEAD):].lstrip("\n") + "\n"
    else:
        new_content = PART1_HEAD + "\n" + part1.rstrip() + "\n\n" + PART2_HEAD + "\n" + part2.lstrip("\n") + "\n"
    kb_path.write_text(new_content, encoding="utf-8")

    report["backup"] = str(backup)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
