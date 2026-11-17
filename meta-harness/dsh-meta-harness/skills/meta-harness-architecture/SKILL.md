---
name: meta-harness-architecture
description: meta-harness 系统架构总览——四平面+一数据面分层、五条贯穿性设计原则、三速自我进化模型、任务生命周期与四大子系统分工。任何涉及 meta-harness 的设计、实现、评审工作，先读此技能建立全局图景。
---

# meta-harness 架构总览

来源：E:/meta-harness/ARCHITECTURE.md（提炼版，引用章节号 §N 均指该文档）。meta-harness 是一个自我进化 agent 系统，架构提炼自 Multica（多 agent 协作工作台）与 Ruflo（agent 元驱动框架）；成本约束来自 RSI Tax 论文（arXiv:2611.13524v1），搜索机制来自 Meta-Harness 论文（arXiv:2603.28052v1），元循环制度条件来自 AutoDesign（arXiv:2608.13560v1），**无真值验证器场景的在线改进机制来自 Harness² 论文（arXiv:2610.14224v1，2026-11-17 附D D1–D10 轮引入）**。

## 分层：四平面 + 一数据面（§1）

- **控制面**：任务队列、admission 合同、事件 Hub、配额、技能/Agent 注册。
- **治理面**：策略引擎卡点、task_token、权限/预算、审计回执、人工评审门。
- **智能面**：学习闭环（捕获→学习→巩固→注入）、记忆库、路由器、元进化。
- **执行面**：本机 daemon、隔离 workdir、agent CLI 适配器、钩子桥。
- **数据面**：任务/转录/用量、记忆库（DB+向量）、模式/路由结果、审计/回执。

## 五条贯穿性设计原则（§1）

1. **执行与元数据分离**：agent 进程永远跑在用户控制的机器/沙箱里，控制面只流转元数据、prompt 载荷与转录。
2. **一切能力皆 MCP 工具、一切调用必过卡点**：CLI 只是薄封装，callMCPTool() 是唯一通道，策略引擎在通道上单点收口。
3. **文件级注入优于 prompt 内联**：技能和简报写进 workdir 里 provider 的原生发现路径（`.claude/skills/`、`CLAUDE.md`、`AGENTS.md`），由各 CLI 自己的机制加载，meta-harness 不解析、不转发内容本身。
4. **先计量、后控制，受限显式拒绝**：每类资源先建计量管道，控制策略挂在计量之上；资源耗尽返回结构化错误并留痕，绝不静默降级。
5. **自我改进必须为自己付费（RSI Tax 约束）**：端到端成本 = 任务执行 token + RSI Tax；即使更新被拒绝成本也已付出；赢不过自身成本的进化机制不上线（细节见 meta-harness-rsi-ledger 技能）。行为对比（无真值验证器任务的 Probe，Harness² §2.2 / ARCHITECTURE.md §2.4）是**无真值场景的降 Verify 税路径**——与 RSI Tax 约束兼容而非对立（§2.7 末段：这些机制本身就是降税手段）。

## 三速自我进化模型（§2.1）

| 循环 | 周期 | 产物 | 生效方式 | 审核强度 |
|---|---|---|---|---|
| 快循环：经验→模式 | 单任务内/任务间 | 模式置信度、路由结果、SRN 笔记 | 路由推荐 + 上下文注入 | 自动（置信度衰减兜底） |
| 慢循环：解法→技能 | 任务完成后 | SKILL.md 技能包 | 下次任务文件级注入 | agent 起草 + 人工审核 |
| 元循环：策略→更优策略 | 定期/手动 | harness 策略程序（单文件，可整体 diff） | sandbox 打分后晋级 | 仅可测改进才上线 |

成立前提：每一速的进化成本可测、可控、且被实测回报覆盖。快循环默认走 SRN 有界笔记地板（见 meta-harness-srn-notes 技能），重型管线仅条件启用。

**第四种形态（条件启用）：任务内在线改进环（§2.4 在线无真值模式，Harness² arXiv:2610.14224v1）**——无 ground-truth 验证器的任务上，以任务内 **Propose–Probe–Compose** 环替代 held-out 重打分：参考执行 + 双候选 + 同任务/同模型/同配置的行为对比（缓解/无变化/回归三态，不判对错）+ 证据驱动组合 + best-of-k 匿名选择。单任务内多轮执行 + 行为对比，**介于快循环与元循环之间**；按重型管线晋级规则（§2.7）对照 SRN 判决**条件启用、默认关闭**，递归深度 k=1 为默认地板档（§5.2）。

## 8 组件文件级挂载点速查（§2.4 单组件更新约束）

Harness² 实测形态：**8 组件各为一个文件、编辑即 diff**（论文附录 D.3 表5 原文 "Each is a file, so an edit is a diff"）。三层映射：顶层五组件 → 7 策略面 → 8 文件挂载点；**每次外环迭代只改一个组件**。设计评审时按下表对齐挂载点：

| 组 | 挂载点 | 说明 | → 五组件 |
|---|---|---|---|
| 上下文构建 | `systemprompt.md` / `guardrails.md` / `LongTermMEMORY.md` / `skills/⟨n⟩/SKILL.md` | 前三者每次调用注入；SKILL.md 调用时才载入 | Context and Memory |
| 工具接口 | `tool_guidance.md` / `scripts/⟨name⟩.py` | scripts 经 bash 执行——确定性能力执行一次，替代逐 token 重推理 | Tools and Specs |
| 编排 | `sub_agents/⟨n⟩/AGENT.md` | 唯一新增推理上下文的组件 | Orchestration |
| 中间件控制 | `plugin/⟨name⟩.ts` | 横截工具循环与轮次边界的 hook | Execution Runtime |

- Evaluation and Feedback 组**无日常编辑挂载点**：评估器受 §7.4 冻结纪律约束，修订走版本化通道。
- 编辑投资优先级：**skills > scripts > prompts**（Harness² 附录 E.1 表6 组件消融：去 skills 三域平均 −5.3、去 scripts −3.7（Office 最大 −7.4）、去 prompt 组仅 −1.5；消融不建立可加性——排序证据而非配额公式）。
- 脚本固化通道（§2.3）：重复推理模式固化为可执行脚本——技能（SKILL.md）改「模型知道什么」，脚本改「模型不必再想什么」。

## 任务生命周期（§6）

① issue @agent → L1 admission 四态结果（queued/coalesced/deferred/blocked + ReasonCode）→ ② 铸造 task_token（绑定 agent+task）+ 配额预留 → ③ daemon claim 载荷（issue/项目/工作区/人/前序会话的上下文快照）→ ④ 快循环注入 top-5 相关模式 + 简报写入（稳定区/易变区分开）→ ⑤ spawn agent CLI（隔离 workdir；每个工具调用过 L3 策略卡点；逐条转录落库；token 用量流式归集）→ ⑥ 完成后对注入模式做置信度反馈 + 记入 RSI 分类账 → 每 4 任务边界巩固 → ⑦ agent 以评论交付结果（用户只看评论）+ 默认开 PR + 配额结算 → ⑧ L5 人工评审门（人 review + merge 才推进 issue）→ ⑨ 慢循环沉淀技能 / 元循环策略进化。

## 四大子系统分工

- **上下文共享**决定 agent「看到什么」：三层上下文（任务层/工作区层/群体层）；claim 快照 + 双区简报；简报稳定区是 prompt-cache 前缀，易变值一律走 per-turn 消息；记忆库 supersedes 失效链；转录是上下文最后防线。
- **权限管控**决定「能做什么、以谁的身份、产出如何被人验收」：五层纵深防御（见 meta-harness-permission-budget 技能）。
- **自我进化**决定「这一次的经验如何改变下一次」：三速循环 + RSI 记账约束。
- **资源管理**决定「花多少、何时止损、超了怎么办」：五级预算模型 + 配额预约制（见 meta-harness-permission-budget 技能）。

## 配套技能（本束内）

- **meta-harness-rsi-ledger**：RSI Tax 分类账（Verify/Explore/Write 记账、后续使用追踪、花税前置防呆七条）。
- **meta-harness-srn-notes**：SRN 有界笔记协议与重型管线晋级/降级规则。
- **meta-harness-permission-budget**：五层纵深防御与五级预算模型。

对应系统提示片段在包内 prompts/ 目录（dsh 不自动发现 prompts/，需宿主或人工引用）。
