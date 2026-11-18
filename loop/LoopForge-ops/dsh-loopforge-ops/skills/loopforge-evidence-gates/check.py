#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""check.py —— dsh-loopforge-ops 唯一最小机检器（宿主技能 loopforge-evidence-gates）。

用法（绝对路径调用，值守 agent 的 cwd 不保证在包根；包挪位时与 cordis.patch.yml
同款同步改路径，或以 --dump-config 查得的本包 skills 路径为前缀拼接）：

  python <本文件绝对路径> evidence <证据文件> [--pattern <正则>]
  python <本文件绝对路径> ledger <台账.jsonl>
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

ledger：逐行校验 RSI 台账 JSONL——kind∈{append,revision}；append 须有 e_level∈{E0,E1,E2,E3}
与 version；revision 须有 g_policy/g_world/g_pair 三门结果与 baseline 对照版本；含决策的条目
（含 decision 字段或三件套任一字段）须有 prediction/uncertainty/utility 三件套。缺字段打印
具体条目号与缺失字段，退出码 3。

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

仅依赖标准库：re / json / sys / argparse / hashlib / datetime。
"""

import argparse
import datetime
import hashlib
import json
import re
import sys

DEFAULT_COUNT_RE = r'Ran\s+(\d+)\s+tests?|(\d+)\s+passed|Tests:\s+(\d+)|checks:\s+(\d+)'
E_LEVELS = ('E0', 'E1', 'E2', 'E3')
KINDS = ('append', 'revision')
DECISION_TRIPLE = ('prediction', 'uncertainty', 'utility')
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


def judge_ledger(text):
    """纯判定 RSI 台账 JSONL。返回 (exit_code, lines)；缺字段报条目号+字段名。"""
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
        if kind == 'append':
            if _missing(obj, 'e_level'):
                errors.append(f'条目 {idx}: 缺字段 e_level')
            elif obj.get('e_level') not in E_LEVELS:
                errors.append(f'条目 {idx}: 字段 e_level 非法（实际 {obj.get("e_level")!r}，须 {"|".join(E_LEVELS)}）')
            if _missing(obj, 'version'):
                errors.append(f'条目 {idx}: 缺字段 version')
        else:
            for f in ('g_policy', 'g_world', 'g_pair'):
                if _missing(obj, f):
                    errors.append(f'条目 {idx}: 缺字段 {f}（revision 三门结果）')
            if _missing(obj, 'baseline'):
                errors.append(f'条目 {idx}: 缺字段 baseline（对照版本）')
        if 'decision' in obj or any(not _missing(obj, f) for f in DECISION_TRIPLE):
            for f in DECISION_TRIPLE:
                if _missing(obj, f):
                    errors.append(f'条目 {idx}: 含决策但缺字段 {f}（prediction/uncertainty/utility 三件套必须齐）')
    if errors:
        return EXIT_INVALID, [f'invalid: 台账 {len(errors)} 项字段违规'] + errors
    return EXIT_PASS, [f'PASS: {total} 条台账条目字段齐全']


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
    code, lines = judge_ledger(text)
    print(f'ledger: {path}')
    for l in lines:
        print(l)
    return code


FIXTURE_CMD = 'py -m pytest tests/test_gate.py -q'
FIXTURE_VALID_OUTPUT = 'Ran 3 tests\n\n5 passed\nchecks: 2\n'
FIXTURE_VALID = (
    '# ts 2026-11-18T02:00:00+08:00\n'
    '# cwd E:/loop\n'
    '# cmdsha12 ' + hashlib.sha256(FIXTURE_CMD.encode('utf-8')).hexdigest()[:12] + '\n'
    '$ ' + FIXTURE_CMD + '\n'
    '# exit 0 in 4.2s\n'
) + FIXTURE_VALID_OUTPUT
FIXTURE_FALSE_PASS = (
    '# ts 2026-11-18T02:05:00+08:00\n'
    '# cwd E:/loop\n'
    '$ py scripts/run_checks.py --all\n'
    '# exit 0 in 0.8s\n'
    'all green, nothing to do\n'
)
FIXTURE_LEDGER = (
    '{"kind": "append", "e_level": "E1", "artifact": "triage-heuristics", "born_cost": 120}\n'
    '{"kind": "append", "e_level": "E2", "version": "v3"}\n'
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
    ap.print_help()
    return 2


if __name__ == '__main__':
    sys.exit(main())
