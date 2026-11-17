# 黑灯工厂 v1：十轮迭代记录

> 目标：结合 karpathy-guidelines、gbrain-whllow、stitch-skills、skills-main，做出"软件设计 / 开发 / 测试验证"的无人值守 harness。
> 本文只记录**真实跑出来的东西**：每一次迭代的来源是一次失败观察，每一条度量来自 `report.json` 或复跑命令。

## 0. 架构

```
dark-factory/
  SKILL.md                编排协议（黑灯工厂怎么跑、谁在什么时候做什么）
  scripts/factory.py      确定性引擎（建房/校验/发包/验门/评审/报告）
  assets/                 brief spec design ticket 模板
  references/             composition design dispatch gates learn
```

- **引擎**管状态：`.factory/<slug>/state.json`，票的 attempt、drift、lead time 都在里面。
- **协议**管判断：SKILL.md 只规定循环与硬规则，不重复引擎的实现细节。
- **worker** 是 DSH subagent：一次一张 packet，拿到的是**指针**（`Read <packet> and execute it`），不是正文。外部 CLI（codex/claude）在本机配额不可用，已放弃。

## 1. 十轮迭代

| # | 触发观察 | 改动 | 验证 |
|---|---|---|---|
| 1 | 需要一个可复现的循环骨架 | `init/plan/next/packet/verify/record/block/review/report` 九个命令 + 票头格式（Status/Proof/Depends on） | spike 仓 `plan` PASS，`packet` 产出 worker 包 |
| 2 | spike worker 加了 `tests/__init__.py`（py3.14 下 `discover -s .` 只递归 package） | 把"包标记"写进 `references/design.md`；空 `__init__.py` 由 drift 改为 note | worker 自述与实测一致：`Ran 2 tests / OK` |
| 3 | spike 首次提交把 `__pycache__/*.pyc` 带进仓库 | `init` 往 `.gitignore` 追加 `__pycache__/`、`*.pyc`；清缓存后单独提交 | 提交 17fb95e "chore: stop tracking pycache" |
| 4 | plan 在 demo 上误报 "acceptance criteria are still placeholders" | 占位判断从 `"<" in text` 改为正则 `<(?:\.\.\.\|[A-Za-z][^<>\n]{0,78})>`，`<=` 不再误伤 | 同一份票 plan 由 FAIL 变 PASS |
| 5 | demo 三票并行时，两票可能写同一个文件 | `plan` 增加 Files 交集检查：`FAIL  NN and MM both write <path>; merge them` | 构造重叠票后 plan 在派发前拦住 |
| 6 | 指标自相矛盾：packet 用 attempt K，verify 自增到 K+1 | `packet` 记 `last_packet_attempt`，`verify` 默认复用它；同 attempt 重跑替换历史行 | `state.json` 里一张票的 attempts 与 history 长度一致 |
| 7 | worker 改了 Files 之外的文件，没人知道 | `changed_paths` + `drift` 字段 + `WARN scope drift: ...`，sibling 票的 Files 不算；新增 `--waive-drift` | 造 `notes.txt` 后出现精确 WARN；兄弟文件不误报 |
| 8 | 安装副本与源码可能悄悄分叉 | `doctor [--target]`：frontmatter、必需文件、SKILL ≤9000 B、逐文件 sha256 | `doctor` PASS（description 334 chars，SKILL 6272 B） |
| 9 | standards 评审发现 packet 02 嵌的是空白 spec 模板 | `spec_problems()` 三条断言（未填模板 / Seams 占位 / Acceptance 无条目）；`packet` 命中即 exit 2；把票 Notes 作为 "binding" 段注入 | guard 仓未填 spec 时 plan 3 条 FAIL、packet exit 2 |
| 10 | proof 评审指出"整套测试冒充切片证据" | `verify --expect-tests N`（数量不符判 FAIL）、通过时自动勾选验收框、evidence 随代码提交 | demo 04 用 `--expect-tests 22` 收尾；guard 01 用 `--expect-tests 2` |

迭代之间的两个解析 bug 值得单独记：

- `git()` 用 `.strip()` 会吃掉 `git status --porcelain` 首行前导空格，导致 `line[3:]` 错位，报出 `factory/tools/state.json` 这种丢点的假 drift；改为 `.rstrip()`。
- 未跟踪目录默认折叠成 `tests/`，与 Files 里的 `tests/test_calc.py` 永远对不上；改用 `--porcelain -uall` 展开到文件。

## 1b. 评审之后追加的三轮（11–13）

第一轮闭环跑完后，proof 轴评审没有放行，指出证据归属与覆盖缺口；以下三轮是因为它而做的改动：

| # | 触发观察 | 改动 | 验证 |
|---|---|---|---|
| 11 | proof 评审：01/02/03 的 evidence 记录的是整跑测试数，无法归属到切片 | `packet` 记录 `spec_sha`；`reference/design.md` 规定按模块跑 `python -m unittest tests.test_x`；lite 模式未传 `--expect-tests` 时打印归属告警 | demo 05 用 `--expect-tests 25` 收尾；guard 用 2/4 |
| 12 | proof 评审：01/02 的 packet 来自未定稿的 spec（`Status: draft` 占位），worker 读到旧契约 | `verify` 比较 spec 哈希，打印 "spec.md changed after the packet was cut"；`plan` 对未重切的旧包告警 | 改 spec 后 plan 立刻出现该 WARN |
| 13 | proof 评审：ticket 声称 `Branch: factory/01-*`，仓库只有 master | `plan` 检查 `git branch --list`，不存在即 WARN；ticket 模板不再生成 Branch 行 | demo `plan` 对 01/02/03 各出一条 WARN |

## 2. 三次真实运行

| 运行 | 票 | done | gate runs | first-pass | mean attempts | interventions | 结果 |
|---|---|---|---|---|---|---|---|
| spike `factory-spike` | greet, shout | 2 | 3 | 0.50 | 1.50 | 0 | greet 第 2 次尝试才过（首次漏了包标记） |
| demo `factory-demo` | truncate, slugify, wordcount, slugify-ascii | 4 | 4 | 1.00 | 1.00 | 0 | 22 tests；评审抓出 1 个真实规格违规并修复 |
| guard `factory-guard` | add, mul | 2 | 2 | 1.00 | 1.00 | 0 | 4 tests；验证了"未填 spec 拒绝派发" |

合计：8 张票、8 次门禁、2 个仓库提交闭环，人工介入 0。

## 3. 门禁抓到的东西（这才是 harness 的价值）

- **假通过**：spike 未实现切片时 `discover` 退出 0 但 `Ran 0 tests` → `verify` 判 FAIL（"false pass rejected"）。
- **越界**：`notes.txt` 不在 Files 里 → drift WARN；空 `__init__.py` → note 而非告警。
- **规格违规**：demo 的 `slugify("Café Olé")` 输出 `café-olé`，与 spec 的 ASCII-only 接缝冲突，且测试把它锁成了期望 → spec 轴评审 rework，补票 04 修复为 `caf-ol`。
- **证据归属**：整跑 21 tests 被当作单票证据 → `--expect-tests` 让每张票的数量可审计。

## 4. 已知限制（不粉饰）

1. **没有真正的并行隔离**：worker 共享同一工作树，靠 Files 不重叠来避免冲突；未接 worktree 分支。
2. **设计阶段是文档，不是渲染验证**：`DESIGN.md` 只约束语义（palette/typography/components），没有截图对比门禁。
3. **attempt 反馈依赖 gate 尾部**：如果失败原因是"理解错需求"，重试会重复错；这类要靠 escalation 的人工假设。
4. **review 仍是三份独立 prompt + subagent**：没有机械校验三个 verdict 的一致性（spec=ship 但 proof=rework 时以 rework 为准，靠人读）。
5. **外部 CLI worker 未接入**：codex/claude 本机配额不可用，harness 只跑 DSH subagent。

## 5. 复现

```powershell
$py = "C:\Users\13423\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
$f  = "E:\sdd\dark-factory\scripts\factory.py"

# 1) 新区
& $py $f init --repo E:\tmp\demo --slug demo --name "demo" --tickets "a;b" --mode lite
# 2) 写 spec 与票，然后
& $py $f plan   --slug demo
& $py $f packet --slug demo --ticket 01
# 3) 派 worker，回来后
& $py $f verify --slug demo --ticket 01 --expect-tests 2
& $py $f report --slug demo
# 4) 安装校验
& $py $f doctor --target C:\Users\13423\.dsh\skills\dark-factory
```

## 6. 下一步（v2 候选）

- worktree 隔离 + 自动合并，让 `--workers` 真正并行。
- `verify --mutation`：自动跑一次变异，证明测试能红。
- DESIGN.md 的截图对比门禁（可选，接 stitch 的渲染思路）。
- review 三轴的一致性检查：任一轴 rework 即整体 rework，并自动开修复票。
