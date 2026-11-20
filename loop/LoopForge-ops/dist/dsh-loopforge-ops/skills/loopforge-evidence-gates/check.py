#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""check.py —— dsh-loopforge-ops 唯一最小机检器（宿主技能 loopforge-evidence-gates）。

用法（绝对路径调用，值守 agent 的 cwd 不保证在包根；包挪位时与 cordis.patch.yml
同款同步改路径，或以 --dump-config 查得的本包 skills 路径为前缀拼接）：

  python <本文件绝对路径> evidence <证据文件> [--pattern <正则>]
  python <本文件绝对路径> ledger <台账.jsonl>
  python <本文件绝对路径> memory <store.jsonl> [--catalogue <路径>] [--write-catalogue <路径>]
  python <本文件绝对路径> --selftest
  python <本文件绝对路径> --dump-config

evidence：解析三段式证据文件（$ 命令行 / # exit 码 / 原始输出段），按检查项计数判定：
  退出码非 0        -> FAIL real failure (exit=N)             出码 1，处置=带输出尾部返工
  退出码 0 ∧ 计数 0  -> FAIL false pass rejected (zero checks) 出码 2，处置=拒收证据重采
  退出码 0 ∧ 计数>0  -> PASS (checks=N)                        出码 0
两标签均失败但处置不同（先例 dark-factory references/gates.md 失败分类学）。
计数语义取最大值（对齐先例 scripts/factory.py:490-496 count_tests 的 best=max：同一命令
输出中多个计数行描述同一次运行，求和会双计虚增污染台账）；输出中连可解析计数标记都没有
时按 0 处理并判证据形态不合格（fail-closed，比先例严一格：先例无匹配返回 None 不必然判零）。
多子检查须拆为多个证据文件（巡检切片一项一命令一文件）。

ledger：逐行校验 RSI 台账 JSONL（v0.2.0 三档口径；全部新校验要么仅作用于 revision/override，
要么是存在才查的条件校验，旧 append 条目零影响）——
  必需档 append    kind / e_level（别名 evidence_level 两键认一，同在须同值）/ version；
  必需档 revision 三门 g_policy/g_world/g_pair（取值收紧 pass|fail）+ baseline + v_level
                  （V2|V1|V0；Vi 内在信号非法）+ coupling（independent|shared_judge|
                  self_rewrite）+ axes（target: deploy|training|evaluator|process ×
                  closure: in_loop|on_loop|closed）；联动：V0 强制 staged:true；coupling
                  同源强制 external_check 非空且 v_level≠V0；evaluator×closed 强制
                  human_gate 非空；
  必需档 override object（severity|route|disposition|close）+ ai_proposal + human_decision；
  条件档（存在才查）grounding_rate 0–1 且 axes.closure=closed 时须>0（纯闭环默认过期）/
                  reliability_criteria 非空子集 / pathways 三布尔 / imagined:true→admission
                  四乘子全真（式8）/ rollout 对象含 horizon 正整数→e_level==E1 / cost_class
                  三项和=tokens（缺任一侧跳过）/ blast_radius ^R[0-3] 前缀 / gate_data 指向
                  文件存在（相对台账文件目录解析）/ evidence_level 与 e_level 一致。
含决策的条目（含 decision 字段或三件套任一字段）须有 prediction/uncertainty/utility 三件套。
缺字段/取值违规打印具体条目号与字段名，退出码 3。

memory：逐行校验值守记忆 store JSONL（宿主技能 loopforge-shift-memory）——event 取值域
  add|hit|stale|archive|refute|promote；add 必需 entry_id（格式 mem-####，store 内全局唯一）
  +六元组 s/r/o/κ/unit(可选)/evidence{来源,锚点 两键必需}，κ∈{singular,list}；κ=list 必带
  incomplete∈{true,false}——缺键即 exit 3（强口径：缺键与显式 false 语义不同，不接受默认值）；
  hit/stale/archive/refute/promote 必需 target 且解析到 store 内先前 add 的 entry_id（解析不到
  exit 3，三个消费点共用同一引用系）；promote 必需 v_level∈{V1,V2} 与依据（used_by=执行反馈
  签发 / review_by=复盘人审，至少其一），V0 裁判与 Vi 内在信号签发机检直接拒绝——与 rsi-ledger
  保留门同一套 v_level 层级排序。--catalogue 按定版投影规则（首行来源声明+entry_id 升序单行式）
  重投影比对，不一致 exit 3——视图与库漂移是机检可抓的失败而非静默错误；--write-catalogue 为
  生成模式（catalogue 单一实现源，禁手写；同目录临时文件+os.replace 原子替换）。

机检证明力边界（书面点名）：evidence 的机检对象是 agent 自产的证据文件，只证其内部一致性
（exit 码 ∧ 检查项计数），不证明命令实际被执行过——执行保证仍为散文纪律；如需独立验证，
由处置执行体以外的角色重跑命令并比对输出。证据文件头部建议落 # ts / # cwd / # cmdsha12
（命令原文 sha256 前 12 位）三行作复盘证据轴抽查重跑的锚点；本脚本对 $ 命令行现算 cmdsha12
并与头部锚点对照（不匹配只告警不改判，该对照仍只是记录自洽）。先例对照：dark-factory 由
编排者独立 subprocess 重跑并写 evidence（factory.py:515-525），且明令 Never mark done from
a worker's self-report alone（SKILL.md:99）；本包无独立执行体，硬保证须外挂编排者角色重跑，
超出纯内容包能力（README 明示此强制力边界）。

默认计数正则逐字写死为下方 raw string（不得以元变量 N 字面写入——字面 N passed 对一切真实
输出恒计 0，机检器失效且不自知）；--pattern 留覆盖口供环境自定义标记（应含捕获数字的组）。
第四支 checks: 为值守扩展（先例 TEST_COUNT 只有三分支，factory.py:486）。

仅依赖标准库：re / json / sys / argparse / hashlib / datetime / os / tempfile。
"""

import argparse
import datetime
import hashlib
import json
import os
import re
import sys
import tempfile

DEFAULT_COUNT_RE = r'Ran\s+(\d+)\s+tests?|(\d+)\s+passed|Tests:\s+(\d+)|checks:\s+(\d+)'
E_LEVELS = ('E0', 'E1', 'E2', 'E3')
KINDS = ('append', 'revision', 'override')
DECISION_TRIPLE = ('prediction', 'uncertainty', 'utility')
# —— v0.2.0 台账口径常量（与 skills/loopforge-rsi-ledger/SKILL.md 字段三档总表逐条对应）——
GATE_RESULTS = ('pass', 'fail')                      # revision 三门取值收紧
V_LEVELS = ('V2', 'V1', 'V0')                        # 签发验证层级（Vi 内在信号非法）
COUPLINGS = ('independent', 'shared_judge', 'self_rewrite')
AXES_TARGETS = ('deploy', 'training', 'evaluator', 'process')
AXES_CLOSURES = ('in_loop', 'on_loop', 'closed')
OVERRIDE_OBJECTS = ('severity', 'route', 'disposition', 'close')
RELIABILITY_CRITERIA = ('error', 'calibration', 'drift', 'coverage')
PATHWAY_KEYS = ('uncertainty_aware_selection', 'multi_step_rollout', 'imagined_learning')
ADMISSION_KEYS = ('valid', 'min_utility', 'unc_cap', 'source_ok')
BLAST_RE = re.compile(r'R[0-3]')                     # R0 只读/R1 单文件/R2 单实例/R3 全局
MEM_EVENTS = ('add', 'hit', 'stale', 'archive', 'refute', 'promote')
MEM_ID_RE = re.compile(r'^mem-\d{4}$')
MEM_KAPPAS = ('singular', 'list')
PROMOTE_LEVELS = ('V1', 'V2')
CATALOGUE_PROVENANCE = (
    '<!-- 本文件由 check.py memory --write-catalogue 从 store 事件流原子重投影生成，禁手写；'
    '消费前先跑同命令 --catalogue 校验视图一致 -->'
)
EXIT_PASS, EXIT_REAL, EXIT_FALSE, EXIT_INVALID = 0, 1, 2, 3

EXIT_LINE_RE = re.compile(r'^#[ \t]*exit[ \t]+(-?\d+)', re.M)
CMD_LINE_RE = re.compile(r'^\$[ \t]*(.+?)[ \t]*$', re.M)
CMDHA_RE = re.compile(r'^#[ \t]*cmdsha12[ \t]+([0-9a-fA-F]{2,64})', re.M)


def parse_count(output, pattern=DEFAULT_COUNT_RE):
    """计数：所有命中的最大值（max 语义，绝不求和）。返回 (count, hits)。

    每个命中取第一个非 None 捕获组转 int；自定义 pattern 无捕获组或组内非数字时按
    命中次数计。无任何命中返回 (0, 0)——调用方按零检查项 fail-closed。
    """
    rx = re.compile(pattern, re.I)
    best = None
    hits = 0
    occurrence = 0
    for m in rx.finditer(output):
        hits += 1
        occurrence += 1
        groups = [g for g in m.groups() if g is not None] if m.groups() else [m.group(0)]
        for g in groups:
            if g.isdigit():
                val = int(g)
                best = val if best is None else max(best, val)
                break
    if best is None:
        return (occurrence if occurrence else 0), hits
    return best, hits


def judge_evidence(text, pattern=DEFAULT_COUNT_RE):
    """纯判定三段式证据文件。返回 (exit_code, lines)，不打印不读盘。"""
    m_cmd = CMD_LINE_RE.search(text)
    m_exit = EXIT_LINE_RE.search(text)
    if not m_cmd or not m_exit:
        return EXIT_INVALID, ['invalid: 证据形态不合格——须含 $ 命令行 与 # exit 码 两段']
    cmd = m_cmd.group(1).strip()
    code = int(m_exit.group(1))
    nl = text.find('\n', m_exit.end())
    output = text[nl + 1:] if nl != -1 else ''
    count, hits = parse_count(output, pattern)
    cmdsha12 = hashlib.sha256(cmd.encode('utf-8')).hexdigest()[:12]
    lines = [
        f'cmd: {cmd}',
        f'exit: {code}',
        f'checks: {count}（max 语义，同次运行多计数行取最大值；计数标记命中 {hits} 处）',
        f'cmdsha12: {cmdsha12}',
    ]
    m_anchor = CMDHA_RE.search(text)
    if m_anchor:
        if m_anchor.group(1).lower() == cmdsha12:
            lines.append('  头部锚点对照: 匹配')
        else:
            lines.append('  头部锚点对照: 不匹配——记录的命令与 $ 行不一致，抽查重跑优先核此处')
    else:
        lines.append('  头部无 cmdsha12 锚点（建议 $ 行前落 # ts / # cwd / # cmdsha12 三行）')
    if code != 0:
        tail = output.strip().splitlines()[-5:]
        lines.append(f'VERDICT: FAIL real failure (exit={code})')
        lines.append('  处置：带输出尾部返工，不要原样重跑同一命令')
        lines.append('  tail: ' + (' | '.join(tail) if tail else '(空输出)'))
        return EXIT_REAL, lines
    if count == 0:
        lines.append('VERDICT: FAIL false pass rejected (zero checks)')
        if hits == 0:
            lines.append('  处置：拒收证据重采——输出连可解析计数标记都没有，证据形态不合格（fail-closed）；修命令或修检查项后再跑')
        else:
            lines.append('  处置：拒收证据重采——命令健康但零检查项，什么都没被证明；修命令或修检查项后再跑')
        return EXIT_FALSE, lines
    lines.append(f'VERDICT: PASS (checks={count})')
    return EXIT_PASS, lines


def _missing(obj, field):
    v = obj.get(field)
    return v is None or (isinstance(v, str) and not v.strip())


def _num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _pos_int(v):
    return isinstance(v, int) and not isinstance(v, bool) and v > 0


def judge_ledger(text, ledger_dir=None):
    """纯判定 RSI 台账 JSONL（v0.2.0 三档口径）。返回 (exit_code, lines)；缺字段/取值违规
    报条目号+字段名。ledger_dir 提供时对 gate_data 做文件存在校验（相对路径相对该目录
    解析）；为 None 时跳过全部盘上检查（纯文本模式，供 selftest 纯函数断言）。
    """
    errors = []
    total = 0
    for idx, raw in enumerate(text.splitlines(), 1):
        s = raw.strip()
        if not s:
            continue
        total += 1
        try:
            obj = json.loads(s)
        except ValueError as err:
            errors.append(f'条目 {idx}: 行不是 JSON（{err}）')
            continue
        if not isinstance(obj, dict):
            errors.append(f'条目 {idx}: 不是 JSON 对象')
            continue
        kind = obj.get('kind')
        if kind not in KINDS:
            errors.append(f'条目 {idx}: 缺字段/非法 kind（实际 {kind!r}，须 {"|".join(KINDS)}）')
            continue
        # —— 双写键两键认一：evidence_level 是 e_level 的合法别名，同在须同值 ——
        raw_e = obj.get('e_level') if not _missing(obj, 'e_level') else None
        raw_ev = obj.get('evidence_level') if not _missing(obj, 'evidence_level') else None
        if raw_e is not None and raw_e not in E_LEVELS:
            errors.append(f'条目 {idx}: 字段 e_level 非法（实际 {raw_e!r}，须 {"|".join(E_LEVELS)}）')
        if raw_ev is not None and raw_ev not in E_LEVELS:
            errors.append(f'条目 {idx}: 字段 evidence_level 非法（实际 {raw_ev!r}，须 {"|".join(E_LEVELS)}）')
        if raw_e is not None and raw_ev is not None and raw_e != raw_ev:
            errors.append(f'条目 {idx}: e_level 与 evidence_level 同在但不一致（双写键两键认一，同在须同值）')
        e_eff = raw_e if raw_e in E_LEVELS else (raw_ev if raw_ev in E_LEVELS else None)
        # —— axes：revision 必需；其余 kind 存在才查取值域 ——
        axes = obj.get('axes')
        ax_pair = None
        if axes is not None:
            if isinstance(axes, dict):
                ax_t, ax_c = axes.get('target'), axes.get('closure')
                if ax_t not in AXES_TARGETS:
                    errors.append(f'条目 {idx}: axes.target 非法（实际 {ax_t!r}，须 {"|".join(AXES_TARGETS)}）')
                if ax_c not in AXES_CLOSURES:
                    errors.append(f'条目 {idx}: axes.closure 非法（实际 {ax_c!r}，须 {"|".join(AXES_CLOSURES)}）')
                if ax_t in AXES_TARGETS and ax_c in AXES_CLOSURES:
                    ax_pair = (ax_t, ax_c)
            else:
                errors.append(f'条目 {idx}: 字段 axes 非对象（须 {{target, closure}} 两轴）')
        v_level = obj.get('v_level')
        coupling = obj.get('coupling')
        if kind == 'append':
            if raw_e is None and raw_ev is None:
                errors.append(f'条目 {idx}: 缺字段 e_level')
            if _missing(obj, 'version'):
                errors.append(f'条目 {idx}: 缺字段 version')
        elif kind == 'override':
            if obj.get('object') not in OVERRIDE_OBJECTS:
                errors.append(f'条目 {idx}: 缺字段/非法 object（实际 {obj.get("object")!r}，须 {"|".join(OVERRIDE_OBJECTS)}）')
            if _missing(obj, 'ai_proposal'):
                errors.append(f'条目 {idx}: 缺字段 ai_proposal（override 必需：AI 提议内容）')
            if _missing(obj, 'human_decision'):
                errors.append(f'条目 {idx}: 缺字段 human_decision（override 必需：人否决决定）')
        else:  # revision
            for f in ('g_policy', 'g_world', 'g_pair'):
                if _missing(obj, f):
                    errors.append(f'条目 {idx}: 缺字段 {f}（revision 三门结果）')
                elif obj.get(f) not in GATE_RESULTS:
                    errors.append(f'条目 {idx}: 字段 {f} 非法（实际 {obj.get(f)!r}，须 {"|".join(GATE_RESULTS)}）')
            if _missing(obj, 'baseline'):
                errors.append(f'条目 {idx}: 缺字段 baseline（对照版本）')
            if _missing(obj, 'v_level'):
                errors.append(f'条目 {idx}: 缺字段 v_level（revision 必需：签发验证层级 V2|V1|V0）')
            elif v_level not in V_LEVELS:
                errors.append(f'条目 {idx}: 字段 v_level 非法（实际 {v_level!r}，须 {"|".join(V_LEVELS)}；Vi 内在信号（置信/自一致/似然/uncertainty 自评）为非法取值，机检直接拒绝）')
            if _missing(obj, 'coupling'):
                errors.append(f'条目 {idx}: 缺字段 coupling（revision 必需：生成器-评估器是否同源）')
            elif coupling not in COUPLINGS:
                errors.append(f'条目 {idx}: 字段 coupling 非法（实际 {coupling!r}，须 {"|".join(COUPLINGS)}）')
            if axes is None:
                errors.append(f'条目 {idx}: 缺字段 axes（revision 必需：target/closure 两轴）')
            # 保留门联动：V0 学习型裁判签发强制 staged 降级暂存
            if v_level == 'V0' and obj.get('staged') is not True:
                errors.append(f'条目 {idx}: v_level=V0（学习型裁判签发）必须 staged:true 降级暂存——机检强制；晋升须外部位阶更高复核（V2/V1 签发的新条目或人审 human_gate）')
            # 守护一（自证循环）：coupling 同源强制 external_check 且 v_level 不得为 V0
            if coupling in ('shared_judge', 'self_rewrite'):
                if _missing(obj, 'external_check'):
                    errors.append(f'条目 {idx}: coupling={coupling}（生成器与评估器同源）必须附 external_check 非空（一次外部位阶更高的验证）')
                if v_level == 'V0':
                    errors.append(f'条目 {idx}: coupling={coupling}（同源）时 v_level 不得为 V0（external_check 位阶须≥V1）')
            # 两轴最高审查级：evaluator×closed 强制 human_gate
            if ax_pair == ('evaluator', 'closed') and _missing(obj, 'human_gate'):
                errors.append(f'条目 {idx}: axes=evaluator×closed（自评估×闭环，最高审查级）必须附 human_gate 非空（人工闸门），禁止默认保留')
        # —— 条件校验（存在才查；对旧 append 条目零影响）——
        # 守护二（坍缩与多样性）：纯闭环默认过期
        if ax_pair is not None and ax_pair[1] == 'closed':
            gr = obj.get('grounding_rate')
            if gr is None or not _num(gr) or gr <= 0:
                errors.append(f'条目 {idx}: axes.closure=closed 须 grounding_rate>0（外源信号占比；纯闭环默认拒绝沉淀、只可暂存）')
        if 'grounding_rate' in obj:
            gr = obj.get('grounding_rate')
            if not _num(gr) or not (0 <= gr <= 1):
                errors.append(f'条目 {idx}: 字段 grounding_rate 非法（实际 {gr!r}，须 0–1 数值）')
        if 'reliability_criteria' in obj:
            rc = obj.get('reliability_criteria')
            if not isinstance(rc, list) or not rc or any(x not in RELIABILITY_CRITERIA for x in rc):
                errors.append(f'条目 {idx}: 字段 reliability_criteria 非法（实际 {rc!r}，须非空列表且元素∈{"|".join(RELIABILITY_CRITERIA)}）')
        if 'pathways' in obj:
            pw = obj.get('pathways')
            if not isinstance(pw, dict) or any(k not in pw for k in PATHWAY_KEYS) \
                    or any(not isinstance(pw.get(k), bool) for k in PATHWAY_KEYS):
                errors.append(f'条目 {idx}: 字段 pathways 非法（须对象且 {"|".join(PATHWAY_KEYS)} 三键齐、均为布尔；禁用通道触发算子记 0）')
        admission = obj.get('admission')
        if 'admission' in obj:
            if not isinstance(admission, dict) or any(k not in admission for k in ADMISSION_KEYS) \
                    or any(not isinstance(admission.get(k), bool) for k in ADMISSION_KEYS):
                errors.append(f'条目 {idx}: 字段 admission 非法（须对象且 {"|".join(ADMISSION_KEYS)} 四乘子齐、均为布尔，式8）')
        if obj.get('imagined') is True:
            if not isinstance(admission, dict):
                errors.append(f'条目 {idx}: imagined:true 条目必须附 admission（式8 四乘子 {"|".join(ADMISSION_KEYS)} 全真才可进训练数据）')
            elif all(k in admission for k in ADMISSION_KEYS) and any(admission.get(k) is not True for k in ADMISSION_KEYS):
                errors.append(f'条目 {idx}: imagined:true 但 admission 四乘子未全真（式8：任一为假即不得进训练数据）')
        if 'rollout' in obj:
            ro = obj.get('rollout')
            if not isinstance(ro, dict) or not _pos_int(ro.get('horizon')):
                errors.append(f'条目 {idx}: 字段 rollout 非法（须对象且 horizon 为正整数；可选 states_provenance）')
            if e_eff != 'E1':
                errors.append(f'条目 {idx}: rollout 条目 e_level 须为 E1（预测性规划状态未经外部检查，进台账不得高于 E1；实际有效值 {e_eff!r}）')
        if 'cost_class' in obj:
            cc = obj.get('cost_class')
            if not isinstance(cc, dict):
                errors.append(f'条目 {idx}: 字段 cost_class 非对象（须 {{verify, explore, write}} 数值）')
            else:
                vals = {}
                for k in ('verify', 'explore', 'write'):
                    if k in cc:
                        if not _num(cc[k]):
                            errors.append(f'条目 {idx}: cost_class.{k} 非数值（实际 {cc[k]!r}）')
                        else:
                            vals[k] = cc[k]
                tok = obj.get('tokens')
                if len(vals) == 3 and _num(tok) and abs(vals['verify'] + vals['explore'] + vals['write'] - tok) > 1e-9:
                    errors.append(f'条目 {idx}: cost_class 三项和≠tokens（{vals["verify"]}+{vals["explore"]}+{vals["write"]}≠{tok}，分账自洽失败；缺任一侧跳过不报错，写齐即须对账）')
        if 'blast_radius' in obj:
            br = obj.get('blast_radius')
            if not isinstance(br, str) or not BLAST_RE.match(br):
                errors.append(f'条目 {idx}: 字段 blast_radius 非法（实际 {br!r}，须 R0 只读/R1 单文件/R2 单实例/R3 全局 前缀）')
        if 'gate_data' in obj:
            gd = obj.get('gate_data')
            if not isinstance(gd, str) or not gd.strip():
                errors.append(f'条目 {idx}: 字段 gate_data 非法（须非空字符串文件路径）')
            elif ledger_dir is not None:
                gp = gd if os.path.isabs(gd) else os.path.join(ledger_dir, gd)
                if not os.path.isfile(gp):
                    errors.append(f'条目 {idx}: gate_data 指向文件不存在（{gd}）——孤立组件各自过门即宣称配对成立，机检拒绝')
        if 'decision' in obj or any(not _missing(obj, f) for f in DECISION_TRIPLE):
            for f in DECISION_TRIPLE:
                if _missing(obj, f):
                    errors.append(f'条目 {idx}: 含决策但缺字段 {f}（prediction/uncertainty/utility 三件套必须齐）')
    if errors:
        return EXIT_INVALID, [f'invalid: 台账 {len(errors)} 项字段违规'] + errors
    return EXIT_PASS, [f'PASS: {total} 条台账条目字段齐全']


def project_catalogue(entries):
    """按定版投影规则生成 catalogue 期望内容——单一实现源，与 SKILL.md（loopforge-shift-memory
    第二节）同步，改规则必须两处同步改。

    首行固定来源声明；其后每个 add 一行按 entry_id 升序；行格式
    `<entry_id> | <s> –<r>→ <o> | <κ> | <incomplete 段> | <状态段>`；hit/promote 不改目录行
    （命中计数与晋升档位查事件流，防双口径）。
    """
    lines = [CATALOGUE_PROVENANCE]
    for eid in sorted(entries):
        e = entries[eid]
        if e['κ'] == 'list':
            o_text = '、'.join(str(x) for x in e['o'])
            inc_text = 'incomplete:' + ('true' if e['incomplete'] else 'false')
        else:
            o_text = str(e['o'])
            inc_text = '-'
        status = '/'.join(e['marks']) if e['marks'] else 'active'
        lines.append(f"{eid} | {e['s']} –{e['r']}→ {o_text} | {e['κ']} | {inc_text} | {status}")
    return '\n'.join(lines) + '\n'


def judge_memory(text):
    """纯判定值守记忆 store JSONL。返回 (exit_code, lines, catalogue_text)。

    catalogue_text 为按投影规则重投影的期望目录内容（store 违规时为 None，不生成——
    fail-closed，坏库不投影）；--catalogue 用它比对、--write-catalogue 用它生成。
    """
    errors = []
    total = 0
    entries = {}
    for idx, raw in enumerate(text.splitlines(), 1):
        s = raw.strip()
        if not s:
            continue
        total += 1
        try:
            obj = json.loads(s)
        except ValueError as err:
            errors.append(f'事件 {idx}: 行不是 JSON（{err}）')
            continue
        if not isinstance(obj, dict):
            errors.append(f'事件 {idx}: 不是 JSON 对象')
            continue
        ev = obj.get('event')
        if ev not in MEM_EVENTS:
            errors.append(f'事件 {idx}: 缺字段/非法 event（实际 {ev!r}，须 {"|".join(MEM_EVENTS)}）')
            continue
        if ev == 'add':
            eid = obj.get('entry_id')
            if not isinstance(eid, str) or not MEM_ID_RE.match(eid):
                errors.append(f'事件 {idx}: add 缺字段/非法 entry_id（格式 mem-####，实际 {eid!r}）')
                eid = None
            elif eid in entries:
                errors.append(f'事件 {idx}: add 的 entry_id 重复（{eid} 已在事件 {entries[eid][0]} 落盘，store 内全局唯一）')
                eid = None
            for f in ('s', 'r', 'o', 'κ'):
                if _missing(obj, f):
                    errors.append(f'事件 {idx}: add 缺字段 {f}（六元组 s/r/o/κ/evidence，unit 可选）')
            kap = obj.get('κ')
            if kap not in MEM_KAPPAS:
                errors.append(f'事件 {idx}: κ 非法（实际 {kap!r}，须 {"|".join(MEM_KAPPAS)}）')
            elif kap == 'list':
                o = obj.get('o')
                if not isinstance(o, list) or not o or not all(isinstance(x, str) and x.strip() for x in o):
                    errors.append(f'事件 {idx}: κ=list 时 o 须为非空字符串列表')
                if 'incomplete' not in obj:
                    errors.append(f'事件 {idx}: κ=list 缺键 incomplete（强口径：必须显式 true|false，缺键即 invalid——缺键与显式 false 语义不同）')
                elif not isinstance(obj.get('incomplete'), bool):
                    errors.append(f'事件 {idx}: incomplete 须为布尔（实际 {obj.get("incomplete")!r}）')
            else:
                o = obj.get('o')
                if not isinstance(o, str) or not o.strip():
                    errors.append(f'事件 {idx}: κ=singular 时 o 须为非空字符串')
            evd = obj.get('evidence')
            if not isinstance(evd, dict) or _missing(evd, '来源') or _missing(evd, '锚点'):
                errors.append(f'事件 {idx}: add 缺字段 evidence（须为对象且 来源/锚点 两键必需——下一班可核验不盲信）')
            if eid is not None:
                entries[eid] = [idx, {'s': obj.get('s'), 'r': obj.get('r'), 'o': obj.get('o'),
                                      'κ': obj.get('κ'), 'incomplete': obj.get('incomplete'),
                                      'marks': []}]
            continue
        tgt = obj.get('target')
        if _missing(obj, 'target'):
            errors.append(f'事件 {idx}: {ev} 缺字段 target（须引用 store 内先前已存在的 entry_id）')
            continue
        if tgt not in entries:
            errors.append(f'事件 {idx}: {ev} 的 target 解析不到（{tgt!r} 不在先前 add 事件中——引用完整性破坏，三个消费点共用同一引用系）')
            continue
        if ev in ('stale', 'archive', 'refute'):
            entries[tgt][1]['marks'].append(ev)
        elif ev == 'promote':
            vl = obj.get('v_level')
            if vl not in PROMOTE_LEVELS:
                errors.append(f'事件 {idx}: promote 的 v_level 非法（实际 {vl!r}，晋升保留须 V1|V2——V0 裁判/Vi 自评签发机检直接拒绝，与 rsi-ledger 保留门同一套层级排序）')
            if _missing(obj, 'used_by') and _missing(obj, 'review_by'):
                errors.append(f'事件 {idx}: promote 缺依据（used_by=V1 执行反馈签发：被下一班实际使用 / review_by=复盘人审通道，至少其一非空）')
    if errors:
        return EXIT_INVALID, [f'invalid: memory store {len(errors)} 项违规'] + errors, None
    catalogue = project_catalogue({k: v[1] for k, v in entries.items()})
    return EXIT_PASS, [f'PASS: {total} 条记忆事件全部合规（add {len(entries)} 条，entry_id 唯一，target 引用完整）'], catalogue


def judge_catalogue(expected, actual):
    """视图一致性校验：store 重投影期望内容与现存 catalogue 逐行比对。返回 (exit_code, lines)。"""
    exp = expected.splitlines()
    act = actual.splitlines()
    diffs = []
    for i in range(max(len(exp), len(act))):
        e = exp[i] if i < len(exp) else '(期望无此行)'
        a = act[i] if i < len(act) else '(文件缺此行)'
        if e != a:
            diffs.append((i + 1, e, a))
    if diffs:
        lines = [f'invalid: catalogue 与 store 重投影不一致（{len(diffs)} 处漂移）——视图与库漂移是机检可抓的失败，禁止直接读旧目录']
        for i, e, a in diffs[:10]:
            lines.append(f'  行 {i}:')
            lines.append(f'    期望: {e}')
            lines.append(f'    实际: {a}')
        if len(diffs) > 10:
            lines.append(f'  …另有 {len(diffs) - 10} 处')
        lines.append('  处置：先 check.py memory <store> --write-catalogue <路径> 重投影，班末复盘证据轴记一次流程 bug（上一班漏跑生成义务），再以新目录续检')
        return EXIT_INVALID, lines
    return EXIT_PASS, [f'PASS: catalogue 与 store 重投影逐行一致（含来源声明行，共 {len(exp)} 行）']


def _read(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as fh:
        return fh.read()


def cmd_evidence_file(path, pattern):
    try:
        text = _read(path)
    except OSError as err:
        print(f'invalid: 无法读取证据文件 {path}: {err}')
        return EXIT_INVALID
    code, lines = judge_evidence(text, pattern)
    print(f'evidence: {path}')
    for l in lines:
        print(l)
    return code


def cmd_ledger_file(path):
    try:
        text = _read(path)
    except OSError as err:
        print(f'invalid: 无法读取台账文件 {path}: {err}')
        return EXIT_INVALID
    code, lines = judge_ledger(text, ledger_dir=os.path.dirname(os.path.abspath(path)))
    print(f'ledger: {path}')
    for l in lines:
        print(l)
    return code


def _atomic_write(path, text):
    """同目录临时文件 + os.replace 原子替换——读的一方不会看到半写状态的 catalogue。"""
    directory = os.path.dirname(os.path.abspath(path)) or '.'
    fd, tmp = tempfile.mkstemp(dir=directory, prefix='.catalogue-', suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(text)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def cmd_memory_file(path, catalogue=None, write_catalogue=None):
    try:
        text = _read(path)
    except OSError as err:
        print(f'invalid: 无法读取 memory store {path}: {err}')
        return EXIT_INVALID
    code, lines, expected = judge_memory(text)
    print(f'memory: {path}')
    for l in lines:
        print(l)
    if code != EXIT_PASS:
        return code
    if write_catalogue:
        try:
            _atomic_write(write_catalogue, expected)
        except OSError as err:
            print(f'invalid: 无法写入 catalogue {write_catalogue}: {err}')
            return EXIT_INVALID
        print(f'write-catalogue: {write_catalogue}（重投影 {expected.count(chr(10))} 行含来源声明行，原子替换完成——生成义务触发点：任何 store 事件落盘后立即跑本命令）')
    if catalogue:
        try:
            actual = _read(catalogue)
        except OSError as err:
            print(f'invalid: 无法读取 catalogue {catalogue}: {err}')
            return EXIT_INVALID
        ccode, clines = judge_catalogue(expected, actual)
        print(f'catalogue: {catalogue}')
        for l in clines:
            print(l)
        if ccode != EXIT_PASS:
            return ccode
    return EXIT_PASS


FIXTURE_CMD = 'py -m pytest tests/test_gate.py -q'
FIXTURE_VALID_OUTPUT = 'Ran 3 tests\n\n5 passed\nchecks: 2\n'
FIXTURE_VALID = (
    '# ts 2026-11-18T02:00:00+08:00\n'
    '# cwd /shift\n'
    '# cmdsha12 ' + hashlib.sha256(FIXTURE_CMD.encode('utf-8')).hexdigest()[:12] + '\n'
    '$ ' + FIXTURE_CMD + '\n'
    '# exit 0 in 4.2s\n'
) + FIXTURE_VALID_OUTPUT
FIXTURE_FALSE_PASS = (
    '# ts 2026-11-18T02:05:00+08:00\n'
    '# cwd /shift\n'
    '$ py scripts/run_checks.py --all\n'
    '# exit 0 in 0.8s\n'
    'all green, nothing to do\n'
)
FIXTURE_LEDGER = (
    '{"kind": "append", "e_level": "E1", "artifact": "triage-heuristics", "born_cost": 120}\n'
    '{"kind": "append", "e_level": "E2", "version": "v3"}\n'
)
# 台账草稿真实形状回归夹具（rsi-ledger.draft.jsonl 唯一一行逐字拷贝）——
# 双写键一致 / cost_class 1200+800+500=2500=tokens 自洽 / blast_radius R0 前缀 / prediction
# 六键嵌套 / coverage 对象形态：全部走条件校验或别名路径，v0.2.0 新口径下必须继续 PASS。
LEDGER_DRAFT_LINE = '{"kind":"append","entry_id":"rsi-0001","ts":"<ISO8601>","shift":"<YYYY-MM-DD>-<shift>","incident_id":"INC-0001","phase":"prediction","theta_k":"route-v1","phi_k":"triage-v1","version":"dsh-loopforge-ops@0.1.0","prediction":{"dedup":{"alerts":5,"distinct_keys":4,"echoes":1,"events":1},"severity":{"proposed":"SEV2","effective":null,"approval":"pending_ic"},"root_cause_hypothesis":{"primary":"app-side connection leak","alternatives":["slow query holding connections","traffic surge exceeding pool","DB max_connections saturation"],"db_outage_probability":0.05},"impact":{"affected_tenant_ratio":{"point":0.05,"upper":0.2},"data_loss":false},"mitigation_eta_min":30},"uncertainty":0.35,"utility":0.72,"observed":null,"evidence_level":"E1","e_level":"E1","decision":"append","reliability":"insufficient","coverage":{"observed":0,"required":3},"cost_class":{"verify":1200,"explore":800,"write":500},"tokens":2500,"tokens_estimated":true,"blast_radius":"R0 read-only triage; no production write","notes":"prediction frozen before action; observation to be appended as entry #2; append != revision; no gate evaluation"}'


def _ledger_line(**fields):
    """台账夹具生成：与真实条目同构的一行 JSON（selftest 用，防手写夹具漏字段形态）。"""
    return json.dumps(fields, ensure_ascii=False)
_MEM_ADD1 = (
    '{"event": "add", "entry_id": "mem-0001", "s": "db-connector", "r": "pool_max", "o": "10", '
    '"κ": "singular", "unit": "连接", "evidence": {"来源": "ops/conf/db.yaml", "锚点": "L42"}}\n'
)
FIXTURE_MEMORY_OK = (
    _MEM_ADD1
    + '{"event": "add", "entry_id": "mem-0002", "s": "db-connector", "r": "restart_causes", '
      '"o": ["连接池耗尽", "TLS 握手超时"], "κ": "list", "incomplete": false, '
      '"evidence": {"来源": "logs/db.log", "锚点": "2026-11-17 L88-L92"}}\n'
    + '{"event": "add", "entry_id": "mem-0003", "s": "cache-node-2", "r": "known_symptoms", '
      '"o": ["冷启动慢"], "κ": "list", "incomplete": true, '
      '"evidence": {"来源": "shifts/2026-11-17-night-handover.md", "锚点": "风险节第 2 条"}}\n'
    + '{"event": "hit", "target": "mem-0002"}\n'
    + '{"event": "stale", "target": "mem-0001"}\n'
    + '{"event": "promote", "target": "mem-0002", "v_level": "V1", "used_by": "shift-2026-11-18-day"}\n'
)
FIXTURE_MEM_PROMOTE_V0 = (
    _MEM_ADD1
    + '{"event": "promote", "target": "mem-0001", "v_level": "V0", "used_by": "shift-1"}\n'
)
FIXTURE_MEM_LIST_NO_INCOMPLETE = (
    '{"event": "add", "entry_id": "mem-0001", "s": "db-connector", "r": "restart_causes", '
    '"o": ["连接池耗尽"], "κ": "list", "evidence": {"来源": "logs/db.log", "锚点": "L88"}}\n'
)
FIXTURE_MEM_BAD_TARGET = '{"event": "hit", "target": "mem-9999"}\n'
FIXTURE_MEM_DUP_ID = (
    _MEM_ADD1
    + '{"event": "add", "entry_id": "mem-0001", "s": "cache-node-2", "r": "cold_start_sec", '
      '"o": "180", "κ": "singular", "evidence": {"来源": "logs/cache.log", "锚点": "L12"}}\n'
)
FIXTURE_MEM_BAD_EVENT = '{"event": "delete", "target": "mem-0001"}\n'
FIXTURE_MEM_NO_EVIDENCE = (
    '{"event": "add", "entry_id": "mem-0001", "s": "a", "r": "b", "o": "c", "κ": "singular"}\n'
)
FIXTURE_MEM_NO_ID = (
    '{"event": "add", "s": "a", "r": "b", "o": "c", "κ": "singular", '
    '"evidence": {"来源": "x", "锚点": "y"}}\n'
)
FIXTURE_MEM_PROMOTE_NO_BASIS = (
    _MEM_ADD1
    + '{"event": "promote", "target": "mem-0001", "v_level": "V1"}\n'
)
FIXTURE_MEM_PROMOTE_REVIEW = (
    _MEM_ADD1
    + '{"event": "promote", "target": "mem-0001", "v_level": "V2", "review_by": "review-2026-11-19"}\n'
)
COUNT_VECTORS = [
    ('Ran 3 tests', 3),
    ('5 passed', 5),
    ('checks: 2', 2),
    ('Tests: 7', 7),
    ('Ran 3 tests\n5 passed', 5),
    ('0 passed', 0),
    ('no tests ran', 0),
    ('N passed', 0),
    ('ran 1 test', 1),
    ('Tests:  4', 4),
]


def cmd_selftest(_args=None):
    results = []

    def check(name, cond):
        results.append((name, bool(cond)))

    # [1] 默认正则裸文本断言——先于完整流程，防夹具与正则同源误解及求和/max 口径漂移在
    #     selftest 内暴露而非假绿
    check("裸文本 'Ran 3 tests' 计 3", parse_count('Ran 3 tests')[0] == 3)
    check("裸文本 '5 passed' 计 5", parse_count('5 passed')[0] == 5)
    check("裸文本 'checks: 2' 计 2", parse_count('checks: 2')[0] == 2)
    check("多行 'Ran 3 tests\\n5 passed' 计 5（max 语义防双计，非 8）",
          parse_count('Ran 3 tests\n5 passed')[0] == 5)
    check('合法夹具裸文本（输出段）计数>0', parse_count(FIXTURE_VALID_OUTPUT)[0] > 0)
    for text, want in COUNT_VECTORS:
        check(f'计数向量 {text!r} -> {want}', parse_count(text)[0] == want)

    # [2] evidence 完整流程（夹具为真实形态输出）
    code_v, lines_v = judge_evidence(FIXTURE_VALID)
    check('夹具一（真实形态合法证据）-> PASS (checks=5)',
          code_v == EXIT_PASS and 'VERDICT: PASS (checks=5)' in lines_v)
    code_f, lines_f = judge_evidence(FIXTURE_FALSE_PASS)
    check('夹具二（命令健康+exit 0+无计数标记）-> FAIL false pass rejected (zero checks)',
          code_f == EXIT_FALSE and any('FAIL false pass rejected (zero checks)' in l for l in lines_f))

    # [3] ledger 完整流程
    code_l, lines_l = judge_ledger(FIXTURE_LEDGER)
    check('夹具三（缺 version 台账条目）-> invalid（报条目号+缺失字段）',
          code_l == EXIT_INVALID and any('条目 1' in l and 'version' in l for l in lines_l))

    # [3b] ledger 必需档：revision 收紧（三门 pass|fail+v_level+coupling+axes+三联动）与 override
    rev_core = dict(g_policy='pass', g_world='pass', g_pair='pass', baseline='route-v1',
                    version='dsh-loopforge-ops@0.2.0')
    axes_pc = {'target': 'process', 'closure': 'on_loop'}
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='V2',
                                                coupling='independent', axes=axes_pc, **rev_core))
    check('revision 合法（三门 pass+V2+independent+axes）-> PASS', code_r == EXIT_PASS)
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='V0', staged=True,
                                                coupling='independent', axes=axes_pc, **rev_core))
    check('revision V0 带 staged:true -> PASS（学习型裁判签发降级暂存合法）', code_r == EXIT_PASS)
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='Vi',
                                                coupling='independent', axes=axes_pc, **rev_core))
    check('revision v_level=Vi（内在信号签发）-> invalid（报 v_level 非法）',
          code_r == EXIT_INVALID and any('v_level 非法' in l for l in lines_r))
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='V0',
                                                coupling='independent', axes=axes_pc, **rev_core))
    check('revision V0 无 staged -> invalid（报降级暂存义务）',
          code_r == EXIT_INVALID and any('staged' in l for l in lines_r))
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='V1', coupling='independent',
                                                axes={'target': 'evaluator', 'closure': 'closed'}, **rev_core))
    check('revision evaluator×closed 无 human_gate -> invalid（最高审查级强制人工闸门）',
          code_r == EXIT_INVALID and any('human_gate' in l for l in lines_r))
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='V1', coupling='self_rewrite',
                                                axes=axes_pc, **rev_core))
    check('revision coupling=self_rewrite 无 external_check -> invalid（自证循环守护）',
          code_r == EXIT_INVALID and any('external_check' in l for l in lines_r))
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='V0', staged=True,
                                                coupling='shared_judge', external_check='V2 re-check',
                                                axes=axes_pc, **rev_core))
    check('revision coupling 同源但 v_level=V0 -> invalid（external_check 位阶须≥V1）',
          code_r == EXIT_INVALID and any('v_level 不得为 V0' in l for l in lines_r))
    bad_gates = dict(rev_core)
    bad_gates['g_policy'] = 'ok'
    code_r, lines_r = judge_ledger(_ledger_line(kind='revision', v_level='V2',
                                                coupling='independent', axes=axes_pc, **bad_gates))
    check('revision g_policy=ok -> invalid（三门取值收紧 pass|fail）',
          code_r == EXIT_INVALID and any('g_policy 非法' in l for l in lines_r))
    code_o, lines_o = judge_ledger(_ledger_line(kind='override', object='severity',
                                                ai_proposal='SEV3', human_decision='SEV1 人审定级'))
    check('override 合法（object+ai_proposal+human_decision）-> PASS', code_o == EXIT_PASS)
    code_o, lines_o = judge_ledger(_ledger_line(kind='override', ai_proposal='SEV3',
                                                human_decision='SEV1 人审定级'))
    check('override 缺 object -> invalid（报取值域）',
          code_o == EXIT_INVALID and any('object' in l for l in lines_o))

    # [3c] ledger 条件校验（存在才查；对旧 append 条目零影响）
    app = dict(kind='append', e_level='E1', version='dsh-loopforge-ops@0.2.0')
    code_c, lines_c = judge_ledger(_ledger_line(grounding_rate=1.5, **app))
    check('grounding_rate=1.5 -> invalid（0–1 取值域）',
          code_c == EXIT_INVALID and any('grounding_rate 非法' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(reliability_criteria=['accuracy'], **app))
    check('reliability_criteria=[accuracy] -> invalid（多选取值域）',
          code_c == EXIT_INVALID and any('reliability_criteria 非法' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(
        pathways={'uncertainty_aware_selection': 1, 'multi_step_rollout': True,
                  'imagined_learning': False}, **app))
    check('pathways 首键=1（非布尔）-> invalid（三布尔）',
          code_c == EXIT_INVALID and any('pathways 非法' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(imagined=True, **app))
    check('imagined:true 无 admission -> invalid（式8 四乘子准入）',
          code_c == EXIT_INVALID and any('必须附 admission' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(
        imagined=True, admission={'valid': True, 'min_utility': True, 'unc_cap': False,
                                  'source_ok': True}, **app))
    check('imagined:true admission 三真一假 -> invalid（四乘子须全真才进训练数据）',
          code_c == EXIT_INVALID and any('未全真' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(rollout={}, **app))
    check('rollout 缺 horizon -> invalid（谓词形状：正整数）',
          code_c == EXIT_INVALID and any('rollout 非法' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(kind='append', version='x@0.2.0', e_level='E2',
                                                rollout={'horizon': 3}))
    check('rollout 条目 e_level=E2 -> invalid（不得高于 E1）',
          code_c == EXIT_INVALID and any('不得高于 E1' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(
        rollout={'horizon': 3, 'states_provenance': 'pred@v2'}, **app))
    check('rollout horizon=3+states_provenance+E1 -> PASS（谓词合法形态）', code_c == EXIT_PASS)
    code_c, lines_c = judge_ledger(_ledger_line(
        cost_class={'verify': 100, 'explore': 100, 'write': 100}, tokens=500, **app))
    check('cost_class 和=300≠tokens=500 -> invalid（分账自洽）',
          code_c == EXIT_INVALID and any('cost_class 三项和≠tokens' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(
        cost_class={'verify': 1200, 'explore': 800, 'write': 500}, tokens=2500, **app))
    check('cost_class 和=tokens=2500 -> PASS（草稿同形数值）', code_c == EXIT_PASS)
    code_c, lines_c = judge_ledger(_ledger_line(cost_class={'verify': 1200, 'explore': 800}, **app))
    check('cost_class 缺 write 键且无 tokens -> PASS（缺任一侧跳过不报错）', code_c == EXIT_PASS)
    code_c, lines_c = judge_ledger(_ledger_line(blast_radius='local only', **app))
    check("blast_radius='local only' -> invalid（^R[0-3] 前缀）",
          code_c == EXIT_INVALID and any('blast_radius 非法' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(kind='append', version='x@0.2.0', e_level='E1',
                                                evidence_level='E2'))
    check('evidence_level=E2 与 e_level=E1 同在不一致 -> invalid（两键认一）',
          code_c == EXIT_INVALID and any('不一致' in l for l in lines_c))
    code_c, lines_c = judge_ledger(_ledger_line(kind='append', version='x@0.2.0',
                                                evidence_level='E1'))
    check('仅 evidence_level=E1（别名独用）-> PASS', code_c == EXIT_PASS)
    code_c, lines_c = judge_ledger(_ledger_line(axes={'target': 'deploy', 'closure': 'closed'}, **app))
    check('axes.closure=closed 无 grounding_rate -> invalid（纯闭环默认过期）',
          code_c == EXIT_INVALID and any('纯闭环' in l for l in lines_c))
    self_dir = os.path.dirname(os.path.abspath(__file__))
    code_g, lines_g = judge_ledger(_ledger_line(gate_data='check.py', **app), ledger_dir=self_dir)
    check('gate_data 指向存在文件（相对台账目录）-> PASS', code_g == EXIT_PASS)
    code_g, lines_g = judge_ledger(_ledger_line(gate_data='no-such-gate-artifact.bin', **app),
                                   ledger_dir=self_dir)
    check('gate_data 指向不存在文件 -> invalid（配对指针必须落地）',
          code_g == EXIT_INVALID and any('不存在' in l for l in lines_g))

    # [3d] 台账草稿真实形状回归（v0.1.0 存量条目在 v0.2.0 新口径下必须继续 PASS）
    code_d, lines_d = judge_ledger(LEDGER_DRAFT_LINE)
    check('台账草稿回归（双写键一致/cost_class 2500 自洽/R0 前缀/嵌套 prediction）-> PASS',
          code_d == EXIT_PASS and any('PASS: 1 条' in l for l in lines_d))

    # [4] memory 完整流程（值守记忆 store：取值域/entry_id 唯一/κ 强口径/target 引用完整/
    #     promote 晋升门槛/catalogue 投影与视图一致性）
    code_m, lines_m, cat_m = judge_memory(FIXTURE_MEMORY_OK)
    check('夹具四（合法 store：κ=list 带 incomplete:false 与 true 各一+promote 带 used_by）-> PASS',
          code_m == EXIT_PASS and any('PASS' in l for l in lines_m))
    for name, fixture, kw in [
        ('promote v_level=V0（裁判签发不得晋升，机检拒绝）', FIXTURE_MEM_PROMOTE_V0, 'v_level'),
        ('κ=list 缺 incomplete 键（强口径缺键即 invalid）', FIXTURE_MEM_LIST_NO_INCOMPLETE, 'incomplete'),
        ('target 解析不到先前 entry_id', FIXTURE_MEM_BAD_TARGET, 'target'),
        ('add 重复 entry_id', FIXTURE_MEM_DUP_ID, '重复'),
        ('事件取值域外（delete）', FIXTURE_MEM_BAD_EVENT, 'event'),
        ('add 缺 evidence 两键', FIXTURE_MEM_NO_EVIDENCE, 'evidence'),
        ('promote 缺 used_by/review_by 依据', FIXTURE_MEM_PROMOTE_NO_BASIS, '依据'),
        ('add 缺 entry_id', FIXTURE_MEM_NO_ID, 'entry_id'),
    ]:
        code_x, lines_x, _ = judge_memory(fixture)
        check(f'memory 违规夹具：{name} -> invalid', code_x == EXIT_INVALID and any(kw in l for l in lines_x))
    code_pr, _, _ = judge_memory(FIXTURE_MEM_PROMOTE_REVIEW)
    check('promote v_level=V2 + review_by（复盘人审通道）合法 -> PASS', code_pr == EXIT_PASS)
    cat_lines = cat_m.splitlines()
    check('目录首行为固定来源声明行（禁手写声明，单一实现源）', cat_lines[0] == CATALOGUE_PROVENANCE)
    ids = [l.split(' ')[0] for l in cat_lines[1:]]
    check('目录行按 entry_id 升序排列', ids == sorted(ids) and ids == ['mem-0001', 'mem-0002', 'mem-0003'])
    check('目录行渲染：singular 的 incomplete 段为 - 且 stale 标记进状态段',
          'mem-0001 | db-connector –pool_max→ 10 | singular | - | stale' in cat_lines)
    check('目录行渲染：list 两档 incomplete（false=可当穷举用/true=不得当穷举用）',
          'mem-0002 | db-connector –restart_causes→ 连接池耗尽、TLS 握手超时 | list | incomplete:false | active' in cat_lines
          and 'mem-0003 | cache-node-2 –known_symptoms→ 冷启动慢 | list | incomplete:true | active' in cat_lines)
    check('catalogue 视图一致（重投影==现存）-> PASS', judge_catalogue(cat_m, cat_m)[0] == EXIT_PASS)
    tampered = cat_m.replace('db-connector –restart_causes→', 'db-connector-x –restart_causes→')
    code_ct, lines_ct = judge_catalogue(cat_m, tampered)
    check('catalogue 手工改动一行后校验 -> invalid（视图漂移被抓，exit 3 语义）',
          code_ct == EXIT_INVALID and any('漂移' in l for l in lines_ct))

    for name, cond in results:
        print(f"  [{'ok' if cond else 'NG'}] {name}")
    passed = sum(1 for _, c in results if c)
    print(f'selftest: {passed}/{len(results)} 项断言通过')
    if passed == len(results):
        print('selftest ok')
        return EXIT_PASS
    print('selftest FAILED', file=sys.stderr)
    return 1


CHECK_ABS = __file__.replace('\\', '/')
SKILLS_DIR = CHECK_ABS.rsplit('/', 2)[0] if CHECK_ABS.count('/') >= 2 else '.'


def cmd_dump_config(_args=None):
    print(f'check_py: {CHECK_ABS}')
    print(f'skills_dir: {SKILLS_DIR}')
    print(f'count_pattern: {DEFAULT_COUNT_RE}')
    print('count_semantics: max（同次运行多计数行取最大值，绝不求和；无命中按 0 fail-closed）')
    print('header_anchor_example:')
    print(f"  # ts {datetime.datetime.now().astimezone().isoformat(timespec='seconds')}")
    print('  # cwd <运行时工作目录>')
    print(f'  # cmdsha12 <命令原文 sha256 前 12 位，如 {hashlib.sha256(b"echo hi").hexdigest()[:12]}>')
    return EXIT_PASS


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass
    ap = argparse.ArgumentParser(
        prog='check.py',
        description='dsh-loopforge-ops 唯一最小机检器：evidence 假通过拒绝 / ledger 台账字段 / '
                    '--selftest 夹具自检 / --dump-config 绝对路径。只证证据文件内部一致性，'
                    '不证明命令实际被执行过。')
    ap.add_argument('--selftest', action='store_true',
                    help='内置夹具自检后退出（先裸文本正则断言再全流程；全过输出 selftest ok）')
    ap.add_argument('--dump-config', action='store_true',
                    help='打印本机检器绝对路径与默认配置后退出（供值守 agent 拼接绝对路径）')
    sub = ap.add_subparsers(dest='command')
    pe = sub.add_parser('evidence', help='校验三段式证据文件，拒收零检查项假通过')
    pe.add_argument('file', help='证据文件路径')
    pe.add_argument('--pattern', default=DEFAULT_COUNT_RE,
                    help='自定义计数正则（默认内置四分支，须含捕获数字的组）')
    pl = sub.add_parser('ledger', help='逐行校验 RSI 台账 JSONL 字段')
    pl.add_argument('file', help='台账 JSONL 路径')
    pm = sub.add_parser('memory', help='校验值守记忆 store：事件取值域/entry_id 唯一/κ 强口径/target 引用完整/promote 晋升门槛')
    pm.add_argument('file', help='memory store JSONL 路径（默认 <账目根>/memory/shift-memory.jsonl，账目根=<包根>/../../）')
    pm.add_argument('--catalogue', help='视图一致性校验：现存 catalogue 与 store 重投影逐行比对，不一致 exit 3')
    pm.add_argument('--write-catalogue', help='生成模式：重投影结果原子写入该路径——catalogue 唯一合法来源，禁手写')
    args = ap.parse_args(argv)
    if args.selftest:
        return cmd_selftest(args)
    if args.dump_config:
        return cmd_dump_config(args)
    if args.command == 'evidence':
        try:
            re.compile(args.pattern, re.I)
        except re.error as err:
            print(f'invalid: --pattern 不是合法正则: {err}')
            return EXIT_INVALID
        return cmd_evidence_file(args.file, args.pattern)
    if args.command == 'ledger':
        return cmd_ledger_file(args.file)
    if args.command == 'memory':
        return cmd_memory_file(args.file, args.catalogue, args.write_catalogue)
    ap.print_help()
    return 2


if __name__ == '__main__':
    sys.exit(main())
