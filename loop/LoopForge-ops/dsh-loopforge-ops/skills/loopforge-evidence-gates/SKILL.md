---
name: loopforge-evidence-gates
description: LoopForge 证据门禁——query–reason–cite（引不出证据就沉默）、证据分级 E0规则检查/E1模型预测/E2模拟器/E3外部实测、严重度判定（SEV1-4 可机检判据、P 级等价、SEV1/2 判定需人工审批）、假通过拒绝（退出 0 但零检查项=FAIL，与真失败分标签，计数取同次运行最大值）、证据归属、fail-closed 与尝试预算、豁免书面化（含文档类改动绕过保留门的人审豁免通道）、渐进信任与 blast radius、零打扰求助白名单、override rate/FNR 优先于 raw accuracy。判定告警严重度、设计验收门或审批豁免时使用
---

# LoopForge 证据门禁（verify 契约②③ + 分诊判定）

值守时的判定与验收门禁，兼本包唯一机检器 check.py 的宿主技能。底线译自 dark-factory 契约（E:/sdd/dark-factory/SKILL.md:17 "Evidence or it did not happen"、:79 零测试即 FAIL）与其失败分类学（references/gates.md）。

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
python E:/loop/LoopForge-ops/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py evidence <证据文件>
python E:/loop/LoopForge-ops/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py ledger <台账.jsonl>
```

包挪位时与 cordis.patch.yml 同款同步改此路径，或以 check.py --dump-config 查得的本包 skills 路径为前缀拼接 loopforge-evidence-gates/check.py。

机检证明力点名：check.py evidence 校验的是证据文件的内部一致性（exit 码 ∧ 检查项计数），不证明命令实际被执行过——执行保证仍是散文纪律；如需独立验证，由处置执行体以外的角色重跑命令并比对输出。头部三锚点（ts/cwd/cmdsha12）供复盘证据轴抽查重跑比对。先例对照：dark-factory 由编排者独立 subprocess 重跑并写 evidence（factory.py:515-525），并明令 Never mark done from a worker's self-report alone（SKILL.md:99）；本包无独立执行体，这是保证力边界。

## 五、fail-closed、尝试预算与升级假设

门禁失败绝不静默放行，也绝不静默降级；同一工单尝试预算默认 3 次，预算内返工、预算耗尽转升级且不阻塞其他工单。每条升级必须带重试假设：下一步验证什么、为什么上次没成——没有假设的升级只是抛掷问题。

## 六、豁免书面化

绕过任何门的豁免必须书面：写明缺失的证明与残余风险，落复盘文档。learn 双轨中文档类改动（只改 .md，机检无检查项可计）可走人审豁免通道绕过保留门，但豁免记录仍必须写。未记录的豁免按假通过同级处理——它是流程缺陷，复盘 proof 轴就是抓它的。

## 七、渐进信任、blast radius 与求助白名单

信任阶梯：提议 → 影子（只记录不执行）→ 单实例作用域执行 → 放量。每个自主动作执行前必须标注 blast radius（影响半径：单文件 / 单实例 / 全局），未标注不得执行；放量前必须先过单实例作用域验证，跳级动作回退一级。零打扰原则：向人求助仅限 loopforge-ops-architecture「渐进信任三阶段与人工闸门」节定义的求助白名单（权威清单以该节为准，本节不重述）——白名单之外自己决策并留痕，白名单外求助一次即流程 bug，记台账 interventions 计数。

## 八、指标口径

只认本环境台账口径：override rate（人工否决率）与 FNR（漏报率）优先于 raw accuracy——高准确率配高漏报是危险组合，准确率单独永远不构成放行依据。跨环境数字不可比，不引外部 benchmark 当门禁证据。

## 九、Bainbridge 脱环警示

自动化的监督者会失能（Bainbridge 1983《Ironies of Automation》）：门控越全自动，人越脱环。保留两项定期演练——人工接管演练（人实际接管跑一轮完整班次）与影子班次验证（人并行值守对照自动判定）；不演练的门控在真需要接管时无人会接管。

## 十、配套技能

- loopforge-shift-protocol：值守班次协议——低置信判级的路由动作、交接与升级流程出处。
- loopforge-rsi-ledger：RSI 台账——e_level 四级口径共用，check.py ledger 的校验对象。
