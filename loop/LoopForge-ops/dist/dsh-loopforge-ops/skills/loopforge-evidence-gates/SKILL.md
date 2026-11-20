---
name: loopforge-evidence-gates
description: LoopForge 证据门禁——query–reason–cite（引不出证据就沉默）、证据分级 E0规则检查/E1模型预测/E2模拟器/E3外部实测、严重度判定（SEV1-4 可机检判据、P 级等价、SEV1/2 判定需人工审批）、假通过拒绝（退出 0 但零检查项=FAIL，与真失败分标签，计数取同次运行最大值）、证据归属、fail-closed 与尝试预算、豁免书面化（含文档类改动绕过保留门的人审豁免通道）、渐进信任与 blast radius、零打扰求助白名单、override rate/FNR 优先于 raw accuracy。判定告警严重度、设计验收门或审批豁免时使用
---

# LoopForge 证据门禁（verify 契约②③ + 分诊判定）

值守时的判定与验收门禁，兼本包唯一机检器 check.py 的宿主技能。底线译自 dark-factory 先例工程契约（SKILL.md:17 "Evidence or it did not happen"、:79 零测试即 FAIL；包外工程，仅引用先例）与其失败分类学（references/gates.md）。

## 一、query–reason–cite：引不出证据就沉默

任何结论三步走：query（查台账/日志/证据文件，不查自己的记忆）→ reason（说出推理链）→ cite（落到可复核位置：文件路径+行号、台账条目号、证据文件名）。引不出证据就沉默——合法输出只有「未取证，不判定」+ 下一步取证动作。自信的错误答案比没有答案更糟：错误结论会被下游处置动作放大成真实变更，「不知道」只损失一次回答机会。

## 二、证据分级 E0–E3（预测/观测分列）

| 级 | 名称 | 来源 | 预测/观测 |
|---|---|---|---|
| E0 | 规则检查 | 脚本/正则/门禁本地判定（本包 check.py） | 观测，确定性 |
| E1 | 模型预测 | LLM 归纳、日志摘要、假设推断 | 预测，可错，须带置信度 |
| E2 | 模拟器 | 重放、sandbox、影子流量 | 观测，受控近似 |
| E3 | 外部实测 | 生产/真实环境命令输出 | 观测，最强 |

结论强度不得高于其最弱证据级；E1 不得单独支撑处置动作，须 E0/E2/E3 之一佐证。台账条目的 e_level 字段与 loopforge-rsi-ledger 共用此四级口径（check.py ledger 校验其合法值）。

**V 层↔E 级映射**（签发强度↔证据来源，保留门排序用；权威字段定义在 loopforge-rsi-ledger，本表只共口径）：

| V 层（谁签发） | 映射 E 级 | 保留档位 |
|---|---|---|
| V2 形式验证/机检签发 | E0 规则检查（check.py 等确定性判定） | 可自动永久保留 |
| V1 执行反馈签发 | E2 模拟器 / E3 外部实测 | 保留，须附 caveat 非空 |
| V0 学习型裁判签发 | E1 模型预测 | 降级暂存（staged:true），晋升须外部位阶更高复核 |
| Vi 内在信号（置信/自一致/自评） | 无——非法取值 | 机检直接 invalid，门结果拒绝 |

## 三、严重度判定 SEV1–4（可机检判据 + P 级等价）

| SEV | 可机检判据（命中即定级，待人审批） | P 级等价 |
|---|---|---|
| SEV1 | 全量用户不可用 / 资损进行中 / 数据损坏在扩散 | P1 critical |
| SEV2 | 核心功能降级且无 workaround / 错误率烧穿 SLO 预算 | P2 high |
| SEV3 | 局部降级有 workaround / 非核心路径受损 | P3 |
| SEV4 | 观感问题、单例异常、待观察噪声 | P4 low |

AI 可提议定级；SEV1 与 SEV2 判定必须人工审批后生效（SEV3/4 机检命中可直接落标签待复核）。判级置信度低时不猜，按 loopforge-shift-protocol 的路由动作升级给人并附已取到的证据。

## 四、假通过拒绝与证据归属（两标签分开）

证据文件三段式（先例 dark-factory factory.py:525）：`$ 命令行`、`# exit N in Xs`、原始输出。头部建议三锚点行：`# ts`、`# cwd`、`# cmdsha12`（命令原文 sha256 前 12 位，check.py 现算对照）。

| 信号 | 判定 | 处置 |
|---|---|---|
| 退出码非 0 | FAIL real failure (exit=N) | 带输出尾部返工，不原样重跑 |
| 退出码 0 ∧ 检查项计数 0 | FAIL false pass rejected (zero checks) | 拒收证据重采：修命令或修检查项 |
| 退出码 0 ∧ 计数 > 0 | PASS (checks=N) | 证据归档 |

计数取同次运行最大值（输出同时含 Ran 3 tests 与 5 passed 计 5——多计数行描述同一次运行，求和会双计虚增台账）；输出连可解析计数标记都没有，按零检查项 fail-closed 拒收（证据形态不合格）。多子检查拆多个证据文件，一项一命令一文件。复盘证据轴按两标签分开计数：real failure 计返工成本，false pass rejected 计证据采集缺陷，混计互相污染。

用法（绝对路径调用——值守 agent 的 cwd 不保证在包根）：

```bash
python E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py evidence <证据文件>
python E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py ledger <台账.jsonl>
python E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py memory <记忆库.jsonl> [--catalogue <目录.md>] [--write-catalogue <目录.md>]
```

包挪位时与 cordis.patch.yml 同款同步改此路径，或以 check.py --dump-config 查得的本包 skills 路径为前缀拼接 loopforge-evidence-gates/check.py。

三个子命令各管一摊（与 `check.py --help` 输出的子命令清单一致）：**evidence**（三段式证据文件：假通过拒绝+计数 max 语义）、**ledger**（台账条目：append/revision/override 三种 kind 各自必需字段+条件校验）、**memory**（记忆库事件流：add 六元组与 entry_id 唯一性、hit/stale/archive/refute/promote 的 target 引用完整性、promote 须 v_level∈{V1,V2}、`--catalogue` 视图一致性校验、`--write-catalogue` 重投影生成；数据模型与「先校验后读」纪律见 loopforge-shift-memory）。

ledger 机检分三档：**append 必需**（kind/e_level/version，草稿合法）；**revision 必需**（三门 g_policy/g_world/g_pair∈{pass,fail}+baseline+v_level+coupling+axes）；**override 必需**（object∈{severity,route,disposition,close}+ai_proposal+human_decision 非空）。**条件校验**（字段存在才查，对旧条目零影响）：条目含顶层 `rollout` 对象（至少含 `horizon` 正整数）即 rollout 条目，机检强制其 `e_level==E1`——预测性规划状态未经外部检查，进台账不得高于 E1；条目顶层 `gate_data` 指针须指向存在的文件（gate_data 是与 `matched_eval` 并列的顶层键、非其嵌套子键——写进 matched_eval 嵌套对象机检不查，等于绕过配对指针落地；堵「孤立组件各自过门即宣称配对成立」）；`cost_class` 三项与 `tokens` 同在时校验三项和=tokens；`blast_radius` 须 `^R[0-3]` 前缀（R0 只读/R1 单文件/R2 单实例/R3 全局）。

机检证明力点名：check.py evidence 校验的是证据文件的内部一致性（exit 码 ∧ 检查项计数），不证明命令实际被执行过——执行保证仍是散文纪律；如需独立验证，由处置执行体以外的角色重跑命令并比对输出。头部三锚点（ts/cwd/cmdsha12）供复盘证据轴抽查重跑比对。先例对照：dark-factory 由编排者独立 subprocess 重跑并写 evidence（factory.py:515-525），并明令 Never mark done from a worker's self-report alone（SKILL.md:99）；本包无独立执行体，这是保证力边界。

## 五、fail-closed、尝试预算与升级假设

门禁失败绝不静默放行，也绝不静默降级；同一工单尝试预算默认 3 次，预算内返工、预算耗尽转升级且不阻塞其他工单。每条升级必须带重试假设：下一步验证什么、为什么上次没成——没有假设的升级只是抛掷问题。

## 六、豁免书面化

绕过任何门的豁免必须书面：写明缺失的证明与残余风险，落复盘文档。learn 双轨中文档类改动（只改 .md，机检无检查项可计）可走人审豁免通道绕过保留门，但豁免记录仍必须写。未记录的豁免按假通过同级处理——它是流程缺陷，复盘 proof 轴就是抓它的。

## 七、渐进信任、blast radius 与求助白名单

信任阶梯：提议 → 影子（只记录不执行）→ 单实例作用域执行 → 放量。每个自主动作执行前必须标注 blast radius（影响半径：单文件 / 单实例 / 全局），未标注不得执行；放量前必须先过单实例作用域验证，跳级动作回退一级。零打扰原则：向人求助仅限 loopforge-ops-architecture「渐进信任三阶段与人工闸门」节定义的求助白名单（权威清单以该节为准，本节不重述）——白名单之外自己决策并留痕，白名单外求助一次即流程 bug，记台账 interventions 计数。

## 八、指标口径与 override 采集

只认本环境台账口径：override rate（人工否决率）与 FNR（漏报率）优先于 raw accuracy——高准确率配高漏报是危险组合，准确率单独永远不构成放行依据。跨环境数字不可比，不引外部 benchmark 当门禁证据。

**override 采集点**：override rate 的分子从 v0.2.0 起有机检采集机制——台账第三种 `kind=override` 条目记「人否决 AI 提议」事件，机检必需 `object`∈{severity（定级）/route（路由）/disposition（处置）/close（关单）}+`ai_proposal`+`human_decision` 非空。采集点三处，一处不漏：①SEV1/2 人审定级（AI 提议的级别被人改判）；②受限自动化阶段逐项审批（人拒绝 AI 提议的动作）；③复盘方案轴推翻当班判级。否决不落条目=分子丢失、override 率失真，按指标口径缺陷记复盘。三率（保留率/回滚率/override 率）的计算公式见 loopforge-ops-architecture「治理度量口径」节。

## 九、Bainbridge 脱环警示

自动化的监督者会失能（Bainbridge 1983《Ironies of Automation》）：门控越全自动，人越脱环。保留两项定期演练——人工接管演练（人实际接管跑一轮完整班次）与影子班次验证（人并行值守对照自动判定）；不演练的门控在真需要接管时无人会接管。

## 十、配套技能

- loopforge-shift-protocol：值守班次协议——低置信判级的路由动作、交接与升级流程出处。
- loopforge-rsi-ledger：RSI 台账——e_level 四级口径共用，check.py ledger 的校验对象。
- loopforge-shift-memory：跨班次记忆库——check.py memory 子命令的校验对象与「先校验后读」纪律出处。
