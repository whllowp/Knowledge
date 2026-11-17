# meta-harness 系统架构设计

> **自我进化 · 上下文共享 · 权限管控 · 资源管理**
>
> 本文档提炼自两个参考实现：
> - **multica-main**（`multica-main/multica-main/`）——多 agent 协作工作台。核心贡献：控制面/执行面分离的本机 daemon 架构、以 issue 为枢纽的上下文汇聚、分层审批门。
> - **ruflo-main**（`ruflo-main/ruflo-main/`）——agent 元驱动框架（meta-harness）。核心贡献：钩子驱动的自学习闭环、分层记忆库、策略引擎权限卡点。
>
> 文中标注的文件路径均相对各自仓库根目录，可回溯到具体实现。

---

## 0. 两个参考项目的架构画像

### 0.1 Multica：控制面/执行面分离的"任务看板"

```
浏览器/桌面/IM ──► Server(Go/Chi + PostgreSQL) ◄── 实时事件 Hub(WS)
                        │  任务队列 agent_task_queue
                        │  claim 时铸造 task_token(绑定 agent+task)
                        ▼ WS 唤醒 + 轮询兜底
                   Daemon(用户本机常驻进程)
                        │  隔离 workdir + 注入技能包/运行简报
                        ▼ spawn
                   26 种 agent CLI(Claude Code/Codex/…)
                        │  转录/用量流式回传(500ms 批量)
                        ▼
                   task_message(逐条 tool call 落库,可回放)
```

关键事实：**代码永不离开用户机器**。服务端只存元数据、prompt 载荷与执行转录；repo 检出与 agent 进程都在本机 daemon（`server/internal/daemon/daemon.go`，架构文档 `apps/docs/content/docs/developers/architecture.mdx`）。

### 0.2 Ruflo：钩子驱动的"学习闭环"

```
Claude Code/Codex 钩子(stdin JSON)
  → hook-handler.cjs / ruflo-hook.cjs(跨平台桥)
  → ruflo hooks <子命令> CLI
  → callMCPTool()  ──► authorizeMcpTool() 策略卡点(每次调用必过)
  → hooks_* 处理器 → 多汇聚点(routing-outcomes.json / .swarm/memory.db / 神经轨迹 / 信息素)
  → route 钩子在下次 UserPromptSubmit 时按 PageRank+相似度注入 top-5 模式
  → session-end 巩固(去重/PageRank 重算/记忆分级失效)
  → daemon 12 个后台 worker 持续优化
```

关键事实：**MCP-First**（ADR-005）——CLI 命令是薄封装，全部业务逻辑在 MCP 工具处理器（`v3/@claude-flow/cli/src/mcp-tools/`），主实现在 `v3/@claude-flow/` monorepo（版本 3.41.2）。

### 0.3 借鉴矩阵

| 能力维度 | 主要借鉴 | 次要借鉴 |
|---|---|---|
| 自我进化·快循环（模式学习） | Ruflo 学习闭环（hooks → 模式置信度 → 路由注入） | — |
| 自我进化·慢循环（技能沉淀） | Multica Skills（SKILL.md 包 + agent 绑定 + 文件级注入） | Ruflo hooks_pretrain 流水线 |
| 自我进化·元循环（策略进化） | Ruflo metaharness_evolve（Darwin 变异 + sandbox 打分） | — |
| 自我进化·元循环·搜索空间与反馈接口 | Meta-Harness 论文（arXiv:2603.28052v1）§3/Table 3/附录 D：代码空间搜索 + 源码/轨迹/分数三元组反馈 | Ruflo metaharness_evolve（预定义变异算子路线，作结构级重写的起点） |
| 上下文共享·任务上下文 | Multica claim 载荷快照 + 运行简报（prompt-cache 稳定前缀） | — |
| 上下文共享·持久记忆 | Ruflo memory.db（SQLite+HNSW）+ 分层失效 + 混合检索 | Multica issue_source_context 快照 |
| 上下文共享·群体协同 | Ruflo 消息总线/共享命名空间 | Multica issue 评论枢纽 + 实时事件 |
| 权限管控·入口/配额 | Multica admission 合同 + autopilot 配额 | Ruflo BudgetLimit |
| 权限管控·会话凭证 | Multica task_token（绑定 agent+task，仅哈希落库） | Ruflo AuthScope 单调收缩 |
| 权限管控·工具卡点 | Ruflo AgenticPolicyEngine + 权限预设 + PreToolUse 拦截 | Multica MCP 治理 defaultDeny |
| 权限管控·进程隔离 | Multica execenv（隔离 workdir + 进程树收割） | Ruflo safe-executor |
| 权限管控·产出评审 | Multica PR close-intent/merge 门 + worktree 分支 | Ruflo 签名回执 Receipt |
| 资源·计量与配额 | Multica task_usage 三级 rollup + autopilot 配额预约制 | Ruflo BudgetLimit 策略卡点 |
| 资源·并发与调度 | Multica lease/heartbeat/stale-steal + 分层看门狗 | Ruflo 信息素调度（EMA 降权停用） |
| 资源·上下文经济学 | Multica 简报稳定前缀（缓存优先）+ 技能包限额 | Ruflo 滑动窗口/巩固触发/3-tier 模型路由 |

**第三参考源（成本约束）**：arXiv:2611.13524v1《The RSI Tax: When Recursive Self-Improvement Is Not Worth the Cost》——该论文把 Multica/Ruflo 这一类的重型自进化系统作为被审计对象（其评测对象 Meta-Harness 即 Stanford IRIS 的 harness 自动搜索框架，本机副本在 `E:\coding\meta-harness-main`），给出 RSI Tax 记账框架与 SRN 有界笔记基线。它不提供新机制，而是**为第 2 章全部机制加上成本准入条件**：论文实测重型方法税率 100%~393%、验证环节占税 74.8%~93.6%、23.7%~63.6% 的税花在从未被后续使用的产物上。本文 2.6/2.7 及第 5/7 章的相关条款均由此而来。注：其被审计框架的原论文（arXiv:2603.28052v1）自本轮起同时作为**机制来源**被正面吸收（见矩阵新增行与附录索引"机制来源"块）——两篇论文的引用从"单向成本警示"变为"机制 + 成本"双向。

**第四参考源（元循环制度条件）**：arXiv:2608.13560v1《AutoDesign: Meta-Harness Optimization for Long-Horizon Agentic Design》——与第三参考源互补：RSI Tax 给成本约束（什么不值得付税），AutoDesign 给"**值得付税的元循环**"的正面制度条件——单组件更新约束、合取式验收门 + dev 集信息隔离、持久化优化记录 ℒ、优化期评估器与冻结外部评估器分离、HITL 双通道（§3.2/§5.1）——合答"重型管线在什么制度下才配赢过 SRN"（三方关系见 2.7 末段）。轮次记录见附B R11 与附C。

---

## 1. 总体分层架构

meta-harness 采用**四平面 + 一数据面**架构。Multica 证明了这个拓扑的可运维性（一个服务端调度成百上千个本机运行时），Ruflo 证明了智能面可以以钩子方式挂在任意 agent CLI 上而不侵入宿主。

```
┌─────────────────────────────────────────────────────────────────┐
│  控制面 Control Plane（借鉴 Multica server）                      │
│  任务队列 · admission 合同 · 事件 Hub · 配额 · 技能/Agent 注册     │
├─────────────────────────────────────────────────────────────────┤
│  治理面 Governance Plane（Ruflo 策略引擎 + Multica 审批门）        │
│  策略引擎卡点 · task_token · 权限/预算 · 审计回执 · 人工评审门     │
├─────────────────────────────────────────────────────────────────┤
│  智能面 Intelligence Plane（借鉴 Ruflo）                          │
│  学习闭环(捕获→学习→巩固→注入) · 记忆库 · 路由器 · 元进化         │
├─────────────────────────────────────────────────────────────────┤
│  执行面 Execution Plane（借鉴 Multica daemon + Ruflo hooks）      │
│  本机 daemon · 隔离 workdir · agent CLI 适配器 · 钩子桥          │
├─────────────────────────────────────────────────────────────────┤
│  数据面 Data Plane                                                │
│  任务/转录/用量 · 记忆库(DB+向量) · 模式/路由结果 · 审计/回执      │
└─────────────────────────────────────────────────────────────────┘
```

五条贯穿性设计原则（两个参考项目 + RSI Tax 论文共同验证）：

1. **执行与元数据分离**：agent 进程永远跑在用户控制的机器/沙箱里，控制面只流转元数据、prompt 载荷和转录（Multica security-model）。
2. **一切能力皆 MCP 工具、一切调用必过卡点**：CLI 只是薄封装，`callMCPTool()` 是唯一通道，策略引擎在通道上单点收口（Ruflo ADR-005/324）。
3. **文件级注入优于 prompt 内联**：技能和简报写进 workdir 里 provider 的原生发现路径（`.claude/skills/`、`CLAUDE.md`、`AGENTS.md`），由各 CLI 自己的机制加载——meta-harness 不解析、不转发内容本身（Multica 的关键反直觉决策）。
4. **先计量、后控制，受限显式拒绝**：每一类资源（token/并发/存储/调度席位）先建计量管道，控制策略挂在计量之上；资源耗尽返回结构化错误并留痕，绝不静默降级（详见第 5 章）。
5. **自我改进必须为自己付费（RSI Tax 约束）**：自我进化本身消耗 token——**即使更新最终被拒绝，这笔成本也已经付了**。端到端成本 = 任务执行 token + RSI Tax（arXiv:2611.13524v1）。该论文实测：重型自进化方法（Meta-Harness/EvoSkill/RRSI）的税率达任务执行成本的 100%~393%，而一个 ≤2048 token 的有界笔记基线（SRN）以 <0.4% 的更新成本达到同等准确率。因此第 2 章每个进化机制都必须同时携带"成本预算"与"实测回报"，赢不过自身成本的机制不上线（见 2.6/2.7）。

---

## 2. 自我进化子系统

### 2.1 设计目标与"三速"模型

自我进化不是一个循环，而是**三个速度不同、产物不同、审核强度不同的循环**：

| 循环 | 周期 | 产物 | 生效方式 | 审核强度 |
|---|---|---|---|---|
| 快循环：经验→模式 | 单任务内/任务间 | 模式置信度、路由结果、记忆条目 | 路由推荐 + 上下文注入 | 自动（带置信度衰减兜底） |
| 慢循环：解法→技能 | 任务完成后 | SKILL.md 技能包 | 下次任务文件级注入 | agent 起草 + 人工审核 |
| 元循环：策略→更优策略 | 定期/手动 | harness 策略参数 | sandbox 打分后晋级 | 仅可测改进才上线 |

> **成立前提（RSI Tax 警示）**：上表三速默认成立的前提是每一速的进化成本可测、可控、且被实测回报覆盖。arXiv:2611.13524v1 的证据恰好相反：不受约束的自进化，其自身开销会超过它所增强的任务执行（Meta-Harness 类方法税率 >100%）。因此本架构的快循环以 SRN 有界笔记为默认地板（见 2.7），重型管线是**条件启用**而非默认常开（记账见 2.6，晋级规则见 2.7）。

### 2.2 快循环：经验 → 模式（借鉴 Ruflo 学习闭环）

四阶段数据流，每个阶段都有明确落点：

**① 捕获（Capture）**——挂在宿主生命周期钩子上，零额外调用成本：
- `PostToolUse(Write|Edit)` → 追加洞察到 `pending-insights.jsonl`；**失败也记录**（`tool_response.is_error`/非零退出码），负例与正例同样是一等公民（Ruflo `.claude/helpers/hook-handler.cjs:352-364`，ADR-174）。
- 任务结束钩子 → 对**上次注入的模式做置信度反馈**：成功 +0.05，失败 −0.02（`intelligence.cjs:691-697`）——注入了什么、效果如何，闭环可测。

**② 学习（Learn）**——一次任务完成写入多个汇聚点（Ruflo `v3/@claude-flow/cli/src/mcp-tools/hooks-tools.ts:1520` 的 7 个汇聚点）：
- 路由结果表（task/agent/success/quality/keywords，滑动窗口 ≤500 条）；
- 记忆库模式命名空间 + 镜像文件；
- 任务→结果因果边（task→outcome causal edge）；
- 判别式路由学习器：按 **agent 内支持度 × 平均质量 × IDF × 判别占比** 给关键词打分，产出 `learned-<agent>` 模式，与静态模式合并（静态优先，`v3/@claude-flow/cli/src/services/learned-routing.ts`，#2839）。

**③ 巩固（Consolidate）**——**有界节奏**批量收敛（节奏约束源自 arXiv:2611.13524v1 的周期方法协议）：
- 更新边界固定为**每 4 个任务**（论文 SRN/Meta-Harness 评测协议同款边界），而非每任务触发——高频更新的边际收益递减而税线性增长；
- **支撑集有界**：仅取最近窗口（且以失败任务为主），判定只用标量验证器结果，**禁止为更新决策追加 LLM-judge rollout**；
- 去重（id + 内容哈希）→ 3 次以上编辑的文件生成 "hot path" 洞察 → 重建相似度/时间边 → **PageRank 重算**（damping 0.85，节点上限保护）→ 写 `ranked-context.json`（本步及其重算属于 Explore 类税收，受 2.7 晋级规则约束——SRN 地板配置下不执行）；
- 后台 daemon worker（Ruflo 12 worker：optimize/consolidate/predict/audit/benchmark/testgaps…）**由常驻改为预算触发**：任务落盘队列保留，但仅当 L5 进化预算（5.2）有余额时消费；预算为零时 worker 空转不执行——"持续优化"不是免费背景进程，每一轮都从 RSI 预算扣税。

**④ 注入（Feedback→行为）**——下次 `UserPromptSubmit` 时：
- 用 **0.6×trigram-Jaccard + 0.4×PageRank** 取 top-5 模式注入上下文，路由器同时给出 agent 推荐（置信度 + 理由）。Ruflo 源码注释明言此步 "Closes the learning loop"（`hooks-tools.ts:190-249`）。

**meta-harness 实现要点**：置信度必须带**时间衰减**（Ruflo 每小时 −0.005、访问 +0.03）和**稳定阈值**（`minUsagesForStable=5` 次使用才视为稳定模式），防止早期噪声固化。

### 2.3 慢循环：解法 → 技能（借鉴 Multica Skills）

Multica 没有全自动的 issue→run→skill 提炼管道，其设计是 **"agent 自己写技能 + 人工审核"**——这个克制值得继承：

**技能数据模型**（Multica `server/migrations/008_structured_skills.up.sql`）：
- `skill(id, workspace_id, name, description, content=SKILL.md 正文, config JSONB)` —— **workspace 级作用域**；
- `skill_file(id, skill_id, path, content)` —— 技能附属文件（限额：单文件 1MiB、整包 8MiB、256 文件，daemon 与服务端两侧一致校验）；
- `agent_skill(agent_id, skill_id, enabled)` —— **agent↔skill 多对多绑定**，支持 per-agent / per-runtime 开关；
- `config.origin {type, source_url}` —— 溯源记录，支持从上游 **refresh 同步且保留 id 与绑定**。

**四种技能来源**（meta-harness 全部保留）：
1. URL 导入（github / 技能市场）；
2. 本地归档上传；
3. **运行时本地发现**：daemon 扫描用户机器上 `~/.claude/skills`、`~/.codex/skills`、跨工具共享的 `~/.agents/skills`（20+ provider 路径映射），经心跳上报入库；同名校验**"仅创建者可覆盖"**（MUL-2701/2800）；
4. **平台内建技能**：把平台自身的 API 契约（issue/mention/skill 用法文档）做成 SKILL.md，go:embed 进二进制，每个 agent 都收到（`server/internal/service/builtin_skills/`）——**meta-harness 的自描述文档也应该是这样一个内建技能**。

**注入是文件级的**（Multica 最关键的反直觉决策）：daemon 把每个技能写进任务 workdir 的 provider 原生技能目录（Claude→`{workDir}/.claude/skills/{name}/SKILL.md`，Codex→CODEX_HOME，OpenClaw→`{workDir}/skills/`，默认→`.agent_context/skills/`），简报里只放索引，聊天中可用 `/技能名` 显式选中。daemon 侧有按 `workspace/source/id/hash` 键的磁盘缓存 + SHA-256 清单校验（`daemon/skill_cache.go`）。

**技能同受 RSI 记账约束**（arXiv:2611.13524v1）：技能的起草（agent 生成 SKILL.md）计入 Write，人工审核的比对成本不计税（人的时间不在 token 账上，但仍进审计日志）；入库技能携带 `born_cost/used_count/last_used`。**注入 ≠ 使用**——技能只有被显式选中（`/技能名`）或其对结果的影响可归因时才计使用；连续 N 个任务窗口 `used_count=0` 的技能降出注入索引（仍可显式调用），对齐论文"unretrieved artifacts 是纯浪费"的结论。

**harness 改进库（慢循环第二类产物，arXiv:2610.14224v1 §2.3/附录 D.2）**：在线无真值模式（2.4）完整采纳的组件不随任务丢弃，沉淀为可复用库条目——**完整采纳的组件树**（可执行文件**原样保留而非散文摘要**，论文附录 D.2："Executable components are retained rather than summarised as prose"）+ **EXPERIENCE.md**（记录为何被选中/解决什么 recurring weakness/适用情形/支持证据）+ 按需检视索引。三条制度约束：
- **入档门槛**：经验**仅在有执行对比证据时保留**——"仅输出被选中"不构成可迁移性（论文原文 "selecting an output alone does not establish transferability"）；证据不足不新增条目（与 2.6.1 "注入 ≠ 使用"同哲学：先证明可迁移，再花保存与携带的钱）；
- **选择性复用而非自动继承**：下任务仍从**公共基线 harness 出发**，经 Propose 按需复用/改编库条目（论文附录 E.2 实测：库来源占修改文件 22%（LAB/WB-office）/47%（JobBench），但仅 2–10% 保留过半行——**改编多于复制**，自动整包继承必致上下文污染）；
- **探测税资产化**：库积累后支持**免探测直接改进**（论文 §4：k=5 库在无进一步探测下 Code/Web/Office +0.9/+4.4/+5.1；JobBench 库迁移到 WorkBench 三域 +0.6/+0.5/+2.9）——把 Probe 的 Explore 税转化为一次性资产投入；表3 消融 w/o library −3.1/−1.8 佐证库为独立增益源。计税不变：入档计 Write、Propose 复用决策计 Explore（2.6），条目携带 born_cost/used_count/last_used（2.6.1）。

**脚本固化通道（慢循环第三条沉淀路径，arXiv:2610.14224v1 附录 D.3 表5）**：重复出现的推理模式固化为**可执行脚本**（挂载点 `scripts/⟨name⟩.py`，经 bash 运行）——论文定义原文："A new deterministic capability, **executed instead of being reasoned through token by token**"：确定性能力执行一次，替代逐 token 重推理——既省重复推理税，又消除逐次执行的漂移。与技能注入互补分工：**技能（SKILL.md）改"模型知道什么"，脚本改"模型不必再想什么"**；固化触发对齐本节既有节奏——同一推理模式在支撑集窗口内重复出现即候选固化，投资次序按 2.4 组件消融优先级（skills > scripts > prompts）；脚本起草与入档计 Write、携带 born_cost/used_count/last_used（与技能同规则，2.6/2.6.1）。

### 2.4 元循环：策略进化（借鉴 Ruflo metaharness + arXiv:2603.28052v1 + arXiv:2608.13560v1 + arXiv:2610.14224v1）

meta-harness 自身的参数也应该可进化，但必须**可测、可回滚**：

- **变异面（升级为代码空间搜索，arXiv:2603.28052v1 §3）**：现行做法把 harness 拆成 7 个策略面做预定义变异（Ruflo ADR-153 Darwin：`planner / contextBuilder / reviewer / retryPolicy / toolPolicy / memoryPolicy / scorePolicy`）——论文明确论证该路线**表达能力受限**；升级为：每个策略面序列化为**可整体 diff/审查的单文件程序**（论文 harness 实测 100–1000 行），允许 proposer 做**结构级重写**（新检索算法/新 prompt 架构/新学习策略/新记忆结构），而非只填模板或调常数。初始种群从**现有手工基线（各策略面默认配置）复制**初始化，而非随机（论文从领域基线 zero-shot/few-shot/ACE 初始化）。**双候选范围划分强制规则（arXiv:2610.14224v1 §2.2/表3）**：每个改进轮（离线元循环提案轮与在线无真值模式 ② Propose 步 alike）必须同时产出两个候选——**不变候选**（目标限定四类可跨领域复发的 agentic 缺陷：**planning / tool use / context management / delegation**，论文原文 "targets agentic deficiencies that may recur across domains, such as planning, tool use, context management, or delegation"）+ **领域特定候选**（针对**当前领域的知识/流程/约束**）。论据：同预算下去掉范围划分是最大掉分项之一（表3 消融 **w/o scoping：WorkBuddy-Bench/JobBench −2.9/−3.7**，后者为 JobBench 三项消融中最大）——两候选共享同一份参考执行与 Probe 预算，划分只是对既有 Propose 调用的目标约束，**规则本身零额外成本**；不变候选的四类缺陷恰与本节 7 策略面中的 planner / toolPolicy / contextBuilder / memoryPolicy 相通（delegation 对应 3.5 跨 agent 协同），可复用现有变异面；
- **单组件更新约束（arXiv:2608.13560v1 §2.1/§3.2）**：引入论文五组件分解作为顶层变更范围层——`Context and Memory / Tools and Specs / Execution Runtime / Orchestration / Evaluation and Feedback`；现有 7 策略面映射为其子项（contextBuilder/memoryPolicy→Context and Memory，toolPolicy→Tools and Specs，planner/retryPolicy→Orchestration，reviewer/scorePolicy→Evaluation and Feedback，执行面机制→Execution Runtime）。**每次外环迭代只改一个组件**（组件内可跨多文件）——论文信用分配可解释的关键，归因清晰可降低"晋级边际 > 验证噪声"判定所需样本量。**文件级挂载点清单（arXiv:2610.14224v1 §2.1/附录 D.3 表5）**：Harness² 实测形态的 **8 组件各为一个文件、编辑即 diff**（原文 "Each is a file, so an edit is a diff"），作为第三层并入上述映射（顶层五组件 → 7 策略面 → 8 文件挂载点）：**上下文构建组**（`systemprompt.md`/`guardrails.md`/`LongTermMEMORY.md` 每次调用注入，`skills/⟨n⟩/SKILL.md` 调用时才载入）→ Context and Memory；**工具接口组**（`tool_guidance.md`；`scripts/⟨name⟩.py` 经 bash 执行）→ Tools and Specs；**编排组**（`sub_agents/⟨n⟩/AGENT.md`——唯一新增推理上下文的组件）→ Orchestration；**中间件控制组**（`plugin/⟨name⟩.ts`，横截工具循环与轮次边界的 hook）→ Execution Runtime；Evaluation and Feedback 组无日常编辑挂载点（评估器受 7.4 冻结纪律约束、修订走版本化通道）。**编辑投资优先级按组件消融排序：skills > scripts > prompts**（附录 E.1 表6：去 skills 三域平均 −5.3、去 scripts −3.7（Office 最大 −7.4）、去 prompt 组仅 −1.5；基座 72.4/完整 80.8；论文注明消融不建立可加性——此为排序证据而非配额公式）——与 Meta-Harness 附录 D"skill 文本是最强杠杆"互证（arXiv:2603.28052v1）；
- **反参数调参晋级门（arXiv:2603.28052v1 + 本机副本 SKILL.md 反参数调参规则）**：与在位基线"逻辑相同、仅常数不同"的参数变体**不进 sandbox**——好候选改变根本机制，坏候选只调数字。**执行级证据接入（arXiv:2610.14224v1 §2.2）**：在线无真值模式下该门获得执行级形态——Probe 三态中的**『行为无变化』≈仅常数不同**（候选与参考同任务/同模型/同配置执行而行为未变，即未改变机制），**直接拒绝、只记 Explore**；**『回归』直接拒绝**；**仅『缓解』进 Compose**——三态判定产自 Probe 已付费的候选 rollout，**零新增成本**（离线静态判据查代码、在线执行判据查行为，同一门的两级证据；分流细则落 2.6.2 第 1 条）；
- **评估与反馈接口**：`metaharness_score/genome` 对当前策略组合打分（ADR-150 评估面）；`harness-flywheel` 用 harvest 语料 → train/held-out 分割 → 门槛 → **不可变回执**（ADR-176）。sandbox 反馈升级为**"源码 + 执行轨迹 + 分数"三元组**（arXiv:2603.28052v1 Table 3 消融：完整接口 median 50.0/best 56.7，仅分数 34.6/41.3，中位 +15.4 分）——执行轨迹直接复用 3.4 已落库的 task_message 转录，**不新增 rollout 税**；仅 proposer 读取文件的 token 计入 Explore 类，与 2.6 记账兼容；
- **在线无真值模式：任务内 Propose–Probe–Compose 改进环（arXiv:2610.14224v1 §2.2）**：上文各晋级门均以 held-out 重打分为前提，2.7 SRN 地板又要求判定只依赖标量验证器结果——**对无 ground-truth 验证器的任务，两条路径都不可用**。此时以任务内对比式改进替代 held-out 重打分：① **参考执行**——任务的首次正常执行即为参考（**归任务调用**，不计 RSI 税）；② **Propose**——针对参考执行暴露的缺陷提**双候选**；③ **Probe**——**同任务、同模型、同配置**执行候选，与参考做行为对比，产出**缓解/无变化/回归**三态判定，**不判答案对错**（论文原文明言对比 "inform subsequent composition rather than verify task correctness"——只供后续组合，不验证任务正确性）；④ **Compose**——证据驱动地从合并/修改/采纳单项/保留在位者中决策，**每项决策绑定具体观察而非假定分数增益**（论文 Table 3 消融：w/o composition 在 WorkBuddy-Bench/JobBench 上 −1.6/−1.9，组合步骤本身有独立贡献）。⑤ **最终选择（best-of-k 匿名纪律，§2.2 Final Selection）**：k>1 时最终交付由 agentic selector **对匿名化交付物**（对照任务请求与源材料）**比较选出，仅返回已有输出、绝不合成新内容**（论文原文 "returns an existing output without access to its originating harness or synthesizing new content"；选择阶段不改 harness，k=1 时旁路选择）；**参考执行的交付物始终留在候选池**——改进环最坏情况退化为正常执行，**改进实验失败不损任务交付**；被选输出对应的 harness 打**『采纳』标记（ℋₜ⋆，adoption 而非 verified optimality）**，进 3.4 转录与 ℒ 记录（2.5）。**计税与边界**：整环按 2.7 重型管线晋级规则**条件启用**（对照 SRN 判决，默认关闭）；Probe 候选执行（额外 rollout）与 Propose 提案生成计入 **Explore 税**（2.6 三分类中的"额外 rollout/提案生成"项）；行为对比不保证正确性、只作证据不作验证（论文附录 F：执行随机性与共享模型偏差限制证据可靠性，采纳的改动也不保证迁移到其他任务）——故 Compose 产物不因"对比显示缓解"自动晋级，仍须过 2.6.2 防呆检查与 7.4 双轴报告；
- **人工介入双通道（arXiv:2608.13560v1 §3.2/§6，只给方向不改实现）**：① **方向性指导 g_t**——自然语言输入 planner，防优化停滞/过早收敛，提案函数扩展为 P(H_t, τ_t, s_t, ℒ, g_t)；② **评估器修订通道**——人工发现优化期评估器 R_meta 系统性偏差时显式修订（必须版本化）；无指导时外环完全自主。与 2.3 "agent 起草 + 人工审核"的克制哲学一致；
- **晋级规则（RSI Tax 成本门 + 合取式验收门）**：RSI Tax 论文实测 Meta-Harness 类框架的税 **74.8% 花在验证**（arXiv:2611.13524v1）——元循环是最大潜在税源，因此晋级流程加五道门：
  0. **第 0 层接口验证**（arXiv:2603.28052v1 Algorithm 1 + 附录 D-5）：候选进 sandbox 前先过**秒级零 LLM 成本冒烟**（导入模块/实例化类/极小样本调用一次），畸形候选拦截成本近零，**排在决策不变式检查之前**（细则见 2.6.2 第 0 条）；
  1. **廉价静态门前置**（零 LLM 调用）：候选变异先过 2.6.2 的决策不变式检查 + 预期效应量估计——预期效应量 × 任务流剩余长度 < 验证成本预算的候选，直接不进 sandbox；
  2. **评估 rollout 上限**：held-out 分割一次生成、多次复用（不因每次变异重新 harvest）；评估 rollout 数量设硬顶，超顶即降采样；
  3. **晋级边际 > 验证噪声**：只晋升级差超过验证本身测量噪声的改进（否则"改进"只是噪声的重新抽样）；回执不可变，含本次晋级的 Verify/Explore/Write 完整分账；
  4. **合取式验收 + dev 信息隔离**（arXiv:2608.13560v1 §3.2）：`J_train(候选) > J_train(在位者) ∧ J_dev(候选) ≥ J_dev(在位者)`；dev 集轨迹与分数**绝不暴露给提案生成器**（论文原文 "never exposed to P"），仅用于门控；被拒迭代保留在位者并记入 ℒ（见 2.5）。

### 2.5 存储模型汇总

```
.claude-flow/            # 快循环工作数据（Ruflo 惯例）
  pending-insights.jsonl    # 未巩固洞察（追加写）
  routing-outcomes.json     # 路由结果滑动窗口(≤500)
  ranked-context.json       # PageRank 排序后的注入候选
  daemon-queue/*.json       # 后台 worker 任务队列
  rsi-ledger.jsonl          # RSI 分类账(追加写: 每笔 Verify/Explore/Write → 产物id)
  note.md                   # SRN 有界笔记(≤2048 token, 见 2.7)
.swarm/
  memory.db                 # 主记忆库(SQLite+向量索引, AES-256-GCM 可选静态加密)
  permission-audit.jsonl    # 权限审计(追加写)
  permissions.jsonl         # 当前授权清单
metaharness/                # 元循环候选日志 + ℒ 优化记录(见下方规范)
harnesslib/<id>/            # harness 改进库(2.3 第二类慢循环产物): 完整采纳组件树(可执行原样) + EXPERIENCE.md + 索引
skill/skill_file/agent_skill  # 慢循环技能(服务端 DB, workspace 级)
pattern/routing_outcomes/memory 条目统一携带 born_cost·used_count·last_used (见 2.6.1)
```

**元循环候选日志目录（arXiv:2603.28052v1 附录 D + 本机副本目录形态）**——规范化为论文形态：

```
metaharness/
  candidates/<id>/         # 每个已评估候选一个目录: 源码 + 分数 + 完整执行轨迹(复用 3.4 转录)
    pending_eval.json      # proposer 结构化产出: name/file/hypothesis/axis/base_system/components(假设必须可证伪)
  val/ · logs/             # 搜索期结果(进化反馈唯一来源)
  results/test/            # 终评结果——与搜索期物理分目录, 进化期间永不暴露(见 7.4 纪律 5)
  ledger.jsonl             # ℒ 元循环优化记录(追加写, 见下)
```

纪律：全部 JSON 机器可读、层级组织、命名一致以利 grep/regex；proposer 经文件系统自适应按需访问（grep/cat，不打包进上下文）；可选小 CLI——列 Pareto 前沿/显示 top-k/diff 两次运行的代码与结果——省 proposer 导航 token（附录 D-4）；离线经验（其他模型 rollout、已解语料）转成同构目录以 **warm-start** 新搜索。

**ℒ 元循环优化记录（arXiv:2608.13560v1 §3.2）**：每次外环迭代追加一条：harness 快照、轨迹与分数、所选组件（2.4 五组件之一）、更新计划、代码改动、接受/拒绝决定、repository checkpoint（**dev 数据不入档**）。**被拒迭代也入档**，供下轮提案者避免重复探索（与 2.6.2 提案空闲轮上限互补）；外环维持**单活跃 harness**、不做树搜索，回滚靠 ℒ + checkpoint——支持跨迭代比较、复现与回滚。

### 2.6 RSI Tax 分类账：Verify / Explore / Write 记账（借鉴 arXiv:2611.13524v1）

论文的核心方法论是**把自我改进调用与任务调用严格分离记账**，meta-harness 全盘采纳：

**税率**：`ρ = N_RSI / N_task`（自我改进 token / 任务执行 token）。论文实测不受约束的重型方法 ρ 达 100%~393%——即"改进的开销超过被改进的任务本身"。

**三分类 + 残差**（每一笔进化调用必须归入其一）：

| 分类 | 含义 | meta-harness 中的典型项 |
|---|---|---|
| **Verify** | 验证在位者/候选（在已完成的支撑任务上重打分） | sandbox 回放、frontier 重打分、smoke test、元循环 held-out 评估、注入消融 |
| **Explore** | 探索（额外 rollout、提案生成、轨迹判定、embedding） | 巩固前的重算、路由学习器重训、神经轨迹训练、提案搜索轮、**在线无真值模式的 Probe 候选执行与行为对比分析**（见下口径） |
| **Write** | 写入/修订持久状态 | 写 pattern/记忆条目/SKILL.md/笔记/策略参数、因果边写入、**在线无真值模式的 Compose/反思/写 harness 改进库条目** |

**在线无真值模式的记账口径（arXiv:2610.14224v1）**：**参考执行归任务调用**——它同时是任务交付候选（2.4 ⑤ 最终选择），不计 RSI 税；**Probe 候选执行与行为对比分析记 Explore**——论文明言行为对比 "inform subsequent composition rather than verify task correctness"，不构成正确性验证，**不得记 Verify**；**Compose/反思/写 harness 改进库（2.3）记 Write**。

**记账规则**：
1. 任务调用与 RSI 调用**调用域不相交**（ disjoint）——同一批 token 不得双记；
2. 每笔成本**归集到它关联的产物**（某条 pattern、某个技能、某次策略变异），并打上"后续是否被实际使用"标记（见 R3/2.6 后续使用）；
3. 无法归类三类的进 "Other" 残差，**残差占比 >10% 视为记账缺陷**，需补分类而不是忽略；
4. **被拒绝的更新照常计税**——这是"税"的定义：候选生成+验证的成本不因最终未采纳而消失。

**预算接口**：RSI 预算挂接 5.2 的 L5 层（税率上限 + 单轮更新 token 上限），与权限检查共用策略引擎卡点（预算即策略）。

### 2.6.1 后续使用追踪（subsequent-use tracking）

论文发现 23.7%~63.6% 的 RSI Tax 花在**从未被后续任务使用的产物**上（unretrieved memory bundles 是典型案例）。对策：

- 每个进化产物（pattern/记忆条目/技能/笔记/策略参数）携带三个计量字段：`born_cost`（诞生成本，含其 Verify+Explore+Write 分摊）、`used_count`、`last_used`；
- "使用"的定义要严格：**注入 ≠ 使用**——只有产物被注入后确实影响了行为（被引用/被采纳/结果归因非零）才计 `used_count`；
- 巩固时计算**浪费率** = 未使用产物的累计 born_cost / 总 RSI 支出；浪费率连续两个窗口 >25% 时，自动收紧该类产物的生成预算并归档最旧的未使用产物；
- 审计口径与论文一致：后续使用是**描述性**证据（用了≠有用，没用≠可删），归档默认可恢复。

### 2.6.2 Verify/Explore 前置防呆（论文浪费案例的制度化）

论文附录 D 的两个案例给出了极端数字，meta-harness 把它们直接写成**花任何 Verify/Explore 预算前的强制检查**；本轮按两篇论文再补两条（第 0 条拦截畸形候选、第 4 条定验证环节的成本次序）：

0. **第 0 层接口验证（arXiv:2603.28052v1 Algorithm 1 + 附录 D-5）**：候选进 sandbox 前先过**秒级零 LLM 成本冒烟**——导入模块/实例化类/极小样本调用一次（本机副本形态：`uv run python -c "from ... import *; print('OK')"`）；畸形候选拦截成本近零，排在第 1 条决策不变式检查之前（轻量验证先于昂贵评测）；
1. **决策不变式检查（反"603k 案"）**：论文观测到系统花 603k token 验证一个**按构造就不可能被接受**的候选（验证结果无论如何都改变不了决策）。规则：验证开始前必须先断言 `∃ 决策路径: 候选胜出`——若候选被约束（预算上限/类型不匹配/单调性保证/在位者构造性占优）预先排除，**跳过验证直接拒绝**，只记 Explore。**执行级形态（arXiv:2610.14224v1 §2.2，融合 2.4 反参数调参门）**：在线无真值模式下，Probe 三态中的**『行为无变化』**（反参数调参门的执行级证据——行为未变 ≈ 仅常数不同）与**『回归』**均使"候选胜出"的决策路径不存在——**不进 Compose 及后续晋级验证，直接拒绝、只记 Explore**，仅**『缓解』**继续；三态判定产自 Probe 已付费的候选 rollout，本条检查**零新增成本**；
2. **提案空闲轮上限（反"58M 案"）**：论文观测到搜索阶段消耗 5800 万 token 却**一个提案都没产出**。规则：搜索轮（Explore）必须每轮产出提案或显式的"继续搜索"理由；连续 2 个空闲轮即终止本轮搜索并回执失败——搜索不是可以无限烧预算的合法状态；
3. **支撑集预筛**：Verify 只在"结果可翻转决策"的支撑任务上跑（frontier 边界附近的任务），在稳赢/稳输任务上重打分是纯 Verify 浪费（论文：验证占重型方法总税的 74.8%~93.6%，是第一削减对象）；
4. **验证成本阶梯（arXiv:2608.13560v1 §4.3）**：确定性 blocking 规则检查（零 LLM 成本）→ 标量验证器 → 模型/VLM 评判（最贵、最后置，仅前级未通过或需主观维度时介入）——论文"规则先行 + VLM 后置"与 RSI Tax"验证占税 74.8%~93.6%"互证，是第一削减对象之内的排序纪律；
5. **无新证据即停（arXiv:2610.14224v1 附录 G）**：在线无真值模式的 Probe 连续无新证据即**停止本轮递归**——论文附录 G 原文 "stop when additional probes yield little new evidence"（按任务难度与既有经验相关性分配探索预算的自适应递归；论文列为未来方向，本架构即行制度化）；与第 2 条提案空闲轮上限**同构**——probe 与搜索一样不是可无限烧预算的合法状态；判定产自 Probe 已付费 rollout 的对比记录，**零新增调用**；
6. **失败模式三防（arXiv:2610.14224v1 附录 E.6/图14 + §2.2）**：该文对九个回归案例的归因分类，制度化为在线无真值模式的三条防呆——① **候选间信息隔离**：Compose 可读全部执行证据，但**候选生成阶段不得继承另一候选未经当前任务证据核实的假设**（E.6：错误前提可跨候选传播——literal-key 要求与未核实 cache 假设，致 2–11 分损失）；② **选择保守化**：行为对比证据**不足以分辨质量时默认保留在位者/参考交付**（E.6：WB-code 中 55 分输出曾被选过 95 分、LAB 覆盖变窄 54→26）；采纳按论文 §2.2 Final Selection 记法以星号标注 **H*ₜ = 采纳（adoption）而非验证最优（verified optimality）**；③ **编辑绑定目标缺陷**：每次编辑显式绑定目标缺陷类别（对接 2.4 双候选范围划分 scoping），**未针对可观察缺陷的提案直接拒**（E.6 第三类：结果变异、judge 判定缺失、编辑未针对被评标准）。注意：E.6 所示分数为事后评估、管线运行时不可见——三防只能在已付费证据上判，**不新增评估调用**。

第 1–3 条在策略引擎卡点内执行，检查本身零 LLM 调用（纯条件判断）；第 0 条为零 LLM 成本的秒级冒烟；第 4 条是验证环节的成本排序纪律；第 5 条是在线无真值模式的自适应停止准则；第 6 条是在线无真值模式的失败模式三防。违反即阻断并留审计记录。

### 2.7 SRN 地板基线与重型管线晋级规则（借鉴 arXiv:2611.13524v1）

论文最重要的正面结论：**SRN（Simple Reflection with Notes）**——一个刻意简化的有界笔记基线——在全部四个评测设定中准确率追平或超过 Meta-Harness/EvoSkill/RRSI，而总 token 少 65.6%~71.0%（相对 Static 基线：平均 +4.7 准确率点，仅 +3.6% token）。meta-harness 因此把 SRN 立为快循环的**默认地板**，2.2 的重型管线降级为**条件启用**。

**SRN 快循环规范（默认开启，几乎零税）**：
- **单条笔记 ≤2048 token**，全量替换式重写（不是追加）；
- **固定更新边界**：每 4 个任务更新一次（不是每任务、不是会话结束）；
- **有界支撑集**：仅从最近窗口的**失败任务**中提取，判定只依赖**标量验证器结果**（成功/失败/部分），不做 LLM-judge 轨迹评判；
- **一次生成调用**完成重写；**无效响应保持原笔记不变**（静默保留，不重试）；
- **零额外结构**：无候选验证、无并行 rollout、无检索搜索、无 embedding——更新调用预算 <0.4% 总 token（论文实测水位）；
- 笔记注入走简报"稳定区"（prompt-cache 友好），每次重写后视为新的缓存前缀版本。

**重型管线（2.2 全套）晋级规则**——默认关闭，逐项启用：
1. 每个重型组件（判别式路由学习器 / PageRank 巩固 / 神经轨迹 / cross-encoder 重排…）必须在与"仅 SRN"的对照实验中证明：**Δ准确率 > 该组件的边际 RSI Tax 折算成本**（按 7.4 双轴协议评测）；
2. 晋级判决本身计入 Verify 类税收，且是**一次性成本**——同一组件不重复晋级评审，降级则同样需要证据；
3. 组件可独立晋级/降级，不做全有全无——目标是"最便宜的够用配置"（论文证明这通常就是 SRN 本身）。

**降级通道（自动）**：任一组件连续两个评测窗口未能保住晋级时的优势边际，自动降回关闭并留回执。

**与两篇机制论文的互补关系（防误读为矛盾）**：Meta-Harness 论文（arXiv:2603.28052v1）的三个机制本身就是 RSI Tax 的**降税手段**，而非与之对立——① 轨迹反馈（2.4）提高每单位 Verify 的信息量：论文实测 0.1× 评估量即达文本优化器最终表现（§4.1/Figure 1/4），对应"验证占税 74.8%~93.6%"的第一削减路径是**让每次验证更值**，而非单纯少验；② 难搜索集 + 快评测（7.4 纪律 6）压缩 Verify 规模（附录 D-2："快而有区分度的评测胜过大评测"）；③ 接口验证（2.6.2 第 0 条）零成本拦截无效评估（附录 D-5）。AutoDesign（arXiv:2608.13560v1）同理：单组件更新与合取验收门降低归因噪声、ℒ 记录避免重复探索，都是让同样的 Verify 预算买到更多有效改进。因此：**快循环仍以 SRN 为地板不动；"代码空间搜索 + 轨迹反馈"全套仅元循环/慢循环条件启用**，晋级仍按本节双轴协议对照 SRN 判决（7.4）——机制论文回答"怎么搜更值"，制度条件论文回答"什么约束下才值得搜"，RSI Tax 论文回答"值不值得搜"。

---

## 3. 上下文共享子系统

### 3.1 三层上下文模型

```
┌─ 任务层(短生命周期) ──────────────────────────────┐
│ claim 载荷快照 · 运行简报 · per-turn 提示 · 会话续接 │
├─ 工作区层(长生命周期) ────────────────────────────┤
│ 记忆库(DB+向量) · 技能包 · workspace context · 项目资源 │
├─ 群体层(跨 agent/跨会话/跨机器) ────────────────────┤
│ issue 评论枢纽 · 消息总线 · 共享命名空间 · 联邦(可选)  │
└──────────────────────────────────────────────────┘
```

### 3.2 任务上下文组装：claim 快照 + 双区简报（借鉴 Multica）

**claim 载荷即上下文快照**。daemon 领取任务时，服务端一次下发（Multica `internal/handler/daemon.go buildClaimedTaskResponse:2194`）：
- **issue 上下文**：标题/描述、触发评论全文 + 合并评论（启动前的多条评论折叠进一次 run）、增量评论计数；
- **项目上下文**：project 及其资源（`github_repo | local_directory`，后者带执行模式 `in_place | parallel(worktree)`）；repo 只下发元数据，agent 按需 `checkout`（daemon 侧 repocache）；
- **工作区上下文**：`workspace.context`（全工作区共享的背景说明）；
- **人**：请求用户、任务发起人；
- **会话延续**：`PriorSessionID / PriorWorkDir`——同 (agent, issue) 对的后续任务用 `--resume <session_id>` 续接 CLI 原生会话；
- **结构化附件**：agent 经专用命令 `attachment download/upload` 存取。

**运行简报分"稳定区 + 易变区"**（Multica 最重要的工程约束，MUL-5377）：
- **稳定区**写入 workdir 的 provider 原生配置文件（Claude→`CLAUDE.md`、CodeBuddy→`CODEBUDDY.md`、其余→`AGENTS.md`），内容为命令索引/仓库/项目背景/技能索引/输出契约；用 marker 块**原位替换、绝不截断用户已有文件**。它是 **prompt-cache 前缀**，必须跨 run 稳定；
- **易变区**（发起人、会话延续提示、每 run 变化的值）全部走 **per-turn user message**——否则每 run 都打碎缓存，成本雪崩。

**环境快照块（arXiv:2603.28052v1 附录 B.3，env bootstrap）**：agent 循环开始前用**单条复合 shell 命令**采集沙箱快照（cwd、`/app` 目录列表——大目录截断 20 条、语言及版本、包管理器、可用内存），15 秒超时、静默失败、约 80 行实现；论文 TerminalBench-2 上 89 题中 7 题获益（依赖冷门工具链的任务省 2–4 轮环境探测）。落位纪律：每任务 workdir 独立、快照随任务变，按原则 3（文件级注入优于 prompt 内联）**写入任务 workdir 文件（如 `ENVIRONMENT.md`）+ 简报索引一行**，或走首条 per-turn 消息——**绝不写入简报稳定区**（会打碎 prompt-cache 前缀，MUL-5377）。

**provenance 锚点（arXiv:2608.13560v1 §4.1）**：简报与记忆注入/提取的**每个元素必须携带来源锚点**（issue 评论 id、`文件路径:行号`、上游 URL）——对齐论文"每个提取元素保留源位置引用"；上下文构建一次、跨任务内步骤复用，不重复构建。锚点同时是 2.6.1 后续使用追踪的证据源：产物被引用即可归因"确实影响了行为"，把"注入 ≠ 使用"从启发式升级为**可观测事件**。

### 3.3 持久记忆库（借鉴 Ruflo）

- **单一事实源**：SQLite（sql.js WASM）+ 内置 HNSW 向量索引（`v3/@claude-flow/cli/src/mcp-tools/memory-tools.ts`），旧 JSON 存储自动迁移；
- **时序分层失效**：Zep/Graphiti 风格的 `validFrom / validUntil / supersedes`——冲突事实**"失效+归档"而非覆盖**，历史可查（`v3/@claude-flow/memory/src/tiered-memory.ts`）；
- **混合检索**：BM25 + 向量 + MMR 多样性 + cross-encoder 重排（`smart-retrieval.ts`）；embedding 走 384 维确定性回退，不强制依赖外部服务；
- **控制器分级懒加载**：L1（高频：reasoningBank/hybridSearch）→ L5（低频：graphTransformer），按需实例化（`controller-registry.ts`）；
- **工具面**：`memory_store/retrieve/search/delete/stats/migrate/import/export` 一套 MCP 工具统一暴露，且支持**导入宿主原生记忆**（如 Claude Code 的 `~/.claude/projects/<hash>/memory/*.md`，注意 Win32/WSL 路径哈希差异）；
- **检索利用率治理（arXiv:2611.13524v1）**：论文案例"unretrieved memory bundles"——精心构建、从未被检索的记忆包是纯税。三条对策：① `memory_stats` 增加**检索命中率**（条目被检索次数/条目数）与**注入引用率**（注入后被实际使用的比例）两个指标；② 记忆条目连续 2 个巩固窗口零检索 → 移出向量索引（保留冷存档，可显式找回）；③ **注入消融**作为周期性 Verify 作业（有硬性 token 顶）：同一任务流跑"有注入/无注入"对照，注入未带来可测增益 → 收紧注入预算——消融本身从 L5 进化预算扣税，且优先级低于快循环反馈。

### 3.4 执行转录与溯源（借鉴 Multica）

- **逐条落库**：`task_message(id, task_id, seq, type, tool, content, input JSONB, output, created_at)`——每个 tool call/text/thinking 都带**序号 + 时间戳**，前端可完整回放（`packages/views/common/task-transcript/`）；
- **issue 是上下文汇聚点**：intent（issue）↔ run（agent_task_queue）↔ 决策（评论）↔ diff（PR 链接表）全部挂在同一 issue 上；**agent 的最终结果必须以评论交付**（简报明示"用户看不到你的终端，只看评论"），人回复/@mention 其他 agent 触发新 run——这就是人机共享上下文的物理形态；
- **不可变来源快照**：`issue_source_context` 把"产生该 issue 的原任务快照"（锚点评论、附件）状态机化（pending→attached→abandoned），quick-create 时携带不可变历史上下文；
- **实时分发**：事件总线 → WS Hub 推 `issue:* / comment:* / task:*`；变更审计落 `activity_log`（actor = member/agent/system）。

### 3.5 跨 agent 协同

- **消息总线**：EventEmitter + 环形双端队列，目标 1000 msg/s，带 ack/重试队列（Ruflo `v3/@claude-flow/swarm/src/message-bus.ts`）；
- **共享记忆命名空间**：`sharedMemoryNamespace: "agent-teams"` + agent mailbox；**agent 完成任务即触发模式训练**（`trainPatternsOnComplete: true`，Ruflo `.claude/settings.json`）；
- **共识与分工**：任务认领账本（claims_issue/release）、广播、共识原语；Ruflo 的信息素自适应（EMA 评分，低分 agent 自动暂停调度，ADR-330）可作为负载均衡的软策略；
- **跨机联邦（可选扩展）**：签名 Nostr 事件中继——每条消息都是可验证作者身份的签名事件，网关侧私有通道只有密文（ADR-386）；`0600` 权限持久身份密钥。

### 3.6 关键设计决策

1. 简报 = prompt-cache 前缀，稳定性压倒灵活性；易变值一律走 per-turn 消息。
2. 技能注入到文件系统，不内联进 prompt——让 provider 原生机制加载。
3. 记忆冲突靠 supersedes 链，不做破坏性覆盖。
4. 转录是上下文的最后防线：即使记忆/简报全错，人仍能从 issue + 转录重建一切。

---

## 4. 权限管控子系统

### 4.1 五层纵深防御

```
L1 入口层   admission 合同 + 配额/限流          (Multica admission.go / autopilot quota)
L2 会话层   task_token 绑定 + 授权单调收缩       (Multica task_token / Ruflo AuthScope)
L3 工具层   策略引擎卡点 + 权限预设 + 预算       (Ruflo AgenticPolicyEngine)
L4 进程层   隔离 workdir + safe-executor + 进程树收割 (Multica execenv / Ruflo safe-executor)
L5 产出层   人工评审门 + 不可变审计              (Multica PR merge 门 / Ruflo Receipt)
```

### 4.2 入口层：admission 合同（借鉴 Multica）

每次入队请求（评论 mention / autopilot / 指派 / 重跑 / chat）返回**显式四态结果** `queued | coalesced | deferred | blocked` + 稳定 ReasonCode，**绝不静默 no-op**；blocked 原因不泄露私有 agent 存在性（枚举安全）。autopilot 侧配额预约制（reservation 状态机 + 幂等，超额返回结构化错误），webhook 触发带防重放投递表。

### 4.3 会话层：凭证绑定 + 委托收缩

- **task token**（Multica 核心机制）：claim 时服务端铸造**绑定 (agent, task) 的短期 token**，仅哈希落库；注入执行环境为专用环境变量；**daemon 管理的执行环境绝不回落用户全局 token**——防止 agent 产物以错误 actor 身份落地；任务结束撤销。所有回写（评论/附件/PR）都以此 token 鉴权，服务端由此知道"这条评论真的是那个 agent 在那个任务里写的"。
- **授权单调收缩**（Ruflo ADR-144）：agent 间委托时，SendMessage 携带 AuthScope，**每跳只能减权限不能加**（OAuth 式语义）；`STRICT_AUTH` 模式强制启用。

### 4.4 工具层：策略引擎单点收口（借鉴 Ruflo）

- **卡点位置**：`callMCPTool()` 内部，**每次工具调用先 `authorizeMcpTool()` 再执行**，返回时过可选内容护栏（ADR-146）——一处收口胜过散落的检查；
- **权限预设三档**（Ruflo `v3/@claude-flow/cli/src/permission/permission-set.ts`）：`strict / standard / permissive`，每档定义 allowedTools/deniedTools/allowedPaths/deniedPaths/allowedNetworkHosts，**deny 永远优先**；strict 档只读 agent 仅许 Read/Grep/Glob、禁网、禁 `.env/secrets/key/pem`。注意其诚实自述：**这是元数据+审计层，不是运行时沙箱**——真正的子进程隔离在 L4；
- **PreToolUse 拦截**：宿主钩子在工具执行前同步判定，危险命令黑名单（`rm -rf /`、格式化、fork 炸弹）命中即 `exit 1` 阻断；
- **预算与审批**：策略引擎内置 BudgetLimit（如 `maxToolCallsPerTurn: 200`）与 Approval 流（挂起待批）；每次放行产出**签名回执 Receipt**；
- **MCP 治理 defaultDeny**：MCP 工具面默认全部拒绝、按需放行；MCP 工具不允许 shell/网络/写盘（这些发生在宿主原生层，由宿主权限体系管）（Ruflo `.harness/mcp-policy.json`，ADR-150）；
- **注入防御**：共享注入短语目录（"ignore previous instructions"/越狱/外泄类）供两处消费——运行时消息扫描（命中即隔离该消息）+ 静态工具组合扫描。

### 4.5 进程层：执行面沙箱（借鉴 Multica execenv）

- 每任务独立 workdir（prepare/reuse 走子进程助手以便可超时杀 syscall）；任务结束**进程树收割**（reapProcessTree，防止孤儿进程）；中毒目录标记处理；
- agent 进程 spawn 一律 `execFile` 无 shell + 命令白名单 + 参数黑名单正则 + 超时/缓冲上限 + 默认禁 sudo（Ruflo `security/src/safe-executor.ts`）；
- 看门狗分层：总超时 / 语义不活动超时 / 首轮无进展超时 / 空闲看门狗，且**"终态已读则不是 hang"**（人看着输出流时放宽）；
- 失败按原因分类重试（网络类退避重试，其他类停机报错），孤儿任务由服务端回收 + stale steal。

### 4.6 产出层：人工评审门（借鉴 Multica）

评审门不是独立子系统，而是**三个机制的组合**：
1. **PR 门**：改代码的 run 默认开 PR 再发评论；webhook 双扫描（链接扫描 `PREFIX-N` + 关闭意图扫描 `Closes/Fixes MUL-123`）——**只有 PR 真正 merge，带 close-intent 的 issue 才自动推进 done**，而 merge 由人完成；
2. **分支门**：本地目录 worktree 模式下 agent 在独立分支产出 `BranchName`，由人合并；
3. **审计门**：`permission-audit.jsonl` 追加写 + 当前授权清单 + 策略回执，三者构成不可变审计链；`activity_log` 记录 actor_type=member/agent/system 的每次变更。

元循环的人工介入双通道（方向性指导 g_t / 评估器修订，arXiv:2608.13560v1 §3.2，见 2.4）同样挂接本层：人只给方向或修订评判标准，不直接改 harness 实现。

### 4.7 密钥与静态数据

- agent 密钥以**掩码哨兵**回显（防"掩码回写覆盖真密钥"），写时合并 + 审计差量（Multica `handler/agent_env.go`）；
- VCS/集成 secret 用 SecretBox 加密存储；**broker token 只给 daemon 本地、绝不进 agent 进程**；插件 hook 由服务端代签，daemon 不持签名 secret；
- 记忆库可选静态加密 AES-256-GCM（magic header 标识格式版本）；敏感文件强制 0600/0700 + 原子写（Ruflo `src/fs-secure.ts`）。

---

## 5. 资源管理与资源控制策略

资源管理横跨三个平面：**控制面**管计量与调度（usage rollup、队列、租约），**治理面**管预算与配额（策略引擎卡点），**执行面**管进程与缓冲（看门狗、进程树收割）。两个参考项目给出了互补的一半：Multica 证明"计量→预留→结算"的配额闭环，Ruflo 证明"预算与权限同卡点"的执行模型。

### 5.1 资源分类与计量：先计量，后控制

| 资源类 | 计量单位 | 采集点 | 归集与 rollup |
|---|---|---|---|
| Token/成本 | input/output/cache_read/cache_write tokens | daemon 运行中/结束时上报 | `task_usage`（UNIQUE task+provider+model，累计式）→ 小时/日/仪表盘三级 rollup（pgcron 管道，Multica 032/073/076/101/102 迁移） |
| 工具调用 | 次/turn | 策略引擎调用计数器 | 预算检查点（`maxToolCallsPerTurn: 200`） |
| 并发席位 | 运行中任务数 | 控制面队列状态 | agent 级 `max_concurrent_tasks` |
| 进程/CPU | 进程树 | daemon spawn/收割 | 进程树收割 + 分层看门狗 |
| 存储 | 字节/文件数 | 上传与注入**双侧** | 技能包限额（1MiB/文件、8MiB/包、256 文件）+ 转录/记忆保留策略 |
| 网络/API | 请求速率/体积 | webhook/联邦网关 | 限流 + body ≤256KiB + 防重放投递表 |
| 调度租约 | lease 持有 | 控制面 | task_lease/prepare_lease + 心跳 + stale steal |

设计纪律（Multica 验证）：用量列是**权威成本列**（213 迁移），rollup 预聚合让仪表盘不扫原始行；每一类资源先有计量管道、控制策略挂在计量之上——**没有度量的控制是盲切**。

### 5.2 五级预算模型：计量 → 预留 → 结算

| 层级 | 预算内容 | 执行点 |
|---|---|---|
| L1 turn 级 | 工具调用数（≤200/turn）、输出缓冲上限 | `callMCPTool()` 内 BudgetLimit 检查（Ruflo policy-runtime） |
| L2 任务级 | 总 token 上限、总超时、重试次数 ceiling | 策略引擎 + daemon 看门狗 + `MaybeRetryFailedTask` |
| L3 agent/工作区级 | 并发上限、模型档位（model/service_tier）、配额周期 | `max_concurrent_tasks` + autopilot 配额 |
| L4 全局级 | 限流、租约池、云端额度 | webhook 限流 + lease/heartbeat/stale-steal |
| L5 进化级（RSI 预算） | 税率 ρ 上限（初始 ≤10%）、单轮更新 token 上限、浪费率上限 25%、**递归深度 k 上限（默认 k=1 地板档，见下）** | 2.6 分类账 + 策略引擎卡点（与权限同点检查） |

L5 是本架构区别于两个参考项目的增量：论文证明自进化若不设独立预算，其开销会吞噬全部收益（Meta-Harness 税率 >100%、验证独占 74.8%）。预算执行沿用配额预约制三段式：**入队预留 → 完成结算 → 拒绝/失败释放**（被拒绝的候选只结算 Explore+Write，不计入 Verify 结果预算）。

**配额预约制**（Multica `service/autopilot_quota.go`，352-359 迁移）是预算执行的标准形态：入队前先**预留**（reservation 状态机 + 幂等键，防并发重复扣减），完成时**结算**，取消/失败时**释放**；超额返回结构化错误 `{Used, Reserved, Limit, ResetAt}`——可程序化处理，且**刻意不含商业文案**（Multica 有意为之，资源错误的消费者是程序和看板）。

**预算即策略**：Ruflo 把 BudgetLimit 做进 `AgenticPolicyEngine`，一次 `authorizeMcpTool()` 同时回答"允不允许"和"还有没有额度"——预算检查与权限检查共用同一个卡点，而不是散落在各处各查各的。

**预算耗尽回退（arXiv:2608.13560v1 §4.3）**：任务级预算耗尽不立即报错，而是**从保留的尝试历史经回退序列选可交付候选**（论文原文机制）；但须遵守 5.6 总原则"绝不静默降级"：回退产物打 **degraded 标记**并留审计记录——**可观测的降级交付优于不可观测的失败**。

**递归预算 k 旋钮（arXiv:2610.14224v1 §2.2.2/§4 图5）**：在线无真值模式（2.4）的递归深度参数化为 **k**（每任务候选数 / 组合会话数 / 链式步数），纳入 L5 进化预算：**k=1 为默认地板档**（与 2.7 SRN 地板哲学一致——先证明 k>1 值得付税），上调须按 2.7 晋级规则对照 k=1 判决。**执行形态按预算与任务形态选择**（§2.2.2）：**并行递归**——宽度优先，k 个候选/组合会话可并发，论文原文 "k controls its width rather than its depth"，**降低延迟但不减少总计算量**；**顺序递归**——深度链式，携带精炼后 harness 与累积执行证据进后续步，后步可 "retain, revise, or correct earlier changes using both current and previous evidence"（保留/修订/**纠正**前步）。**低 k 档性价比证据**（§4 图5）：两种递归均随 k=1→5 单调上升，且 **k=2 已超过全部基线在 k=5 的表现**——大部分增益集中在前两步，k 默认低开有据。单次 rollout 资源上限按论文附录 D.1 形态：**200 模型轮 / 3600 秒**，且 rollout 间无跨任务记忆（探测与任务隔离）。

### 5.3 并发与调度控制

- **并发上限**：agent 级 `max_concurrent_tasks`；daemon 批量 claim（单机一次 claim 覆盖全部 runtime，不支持的 404 降级为单 runtime 老路径，MUL-4257）；
- **并发冲突三策略**：`skip / queue / replace`（autopilot concurrency_policy）——**跳过必须留痕**（`recordSkippedRun`），可观测性与执行本身同等重要；
- **租约机制**：task_lease + prepare_lease（可续期 `ExtendTaskPrepareLease`，124 迁移）；调度器心跳 + **stale steal**（超时租约可被其他 worker 偷走）；孤儿任务由服务端 `RecoverOrphanedTasks` 回收——三层兜底保证队列不积压僵尸任务；
- **看门狗分层**（Multica `daemon.go:9272` runIdleWatchdog 语义）：总超时 / **语义不活动超时**（长时间无有效产出）/ 首轮无进展超时 / 空闲看门狗；且 **TerminalObserved 覆盖**——"人正看着输出流"不算 hang。语义不活动比墙钟时间更接近真实"卡死"信号；
- **重试预算**：按失败原因设 ceiling（provider_network 类退避重试，其他类停机报错）；`max_attempts<=1` 显式关闭；**重试同样消耗配额**——防止重试风暴绕过预算；任务预算耗尽不是重试场景——走 5.2 预算耗尽回退（degraded 标记 + 审计留痕）；
- **软调度**：信息素自适应（EMA 评分，低分 agent 自动暂停调度，Ruflo ADR-330）——把资源分配与质量反馈联动，不浪费席位在持续低产的 agent 上。

### 5.4 上下文与记忆的资源控制（"上下文经济学"）

上下文窗口和记忆库是最容易被忽视的稀缺资源，也是 meta-harness 区别于一般任务系统的重点：

**Token 经济学（缓存优先）**
- **cache_read 是最便宜的 token**：简报稳定前缀的全部意义在此——易变值移出简报就是为了保住缓存命中率（Multica MUL-5377）；
- **注入有预算**：route 钩子只注入 **top-5** 模式（不是 top-50）；简报用 slim 版（`buildMetaSkillContentSlim`，Section×Kind 矩阵按需裁剪）；
- **模型分层路由**：3-tier model routing——路由/分类/例行判定走便宜模型，规划/评审走强模型（Ruflo 根 CLAUDE.md）；
- **harness 强化 × 模型分层联动（arXiv:2608.13560v1 §5.2 Table 3）**：论文实测 harness 增益与模型强度**负相关**——弱模型增益最大（DeepSeek V4 Pro +19.56、Seed 2.1 Pro +17.82、GLM 5.2 +14.01），强模型最小（GPT-5.5 +5.59、Claude 4.8 +5.01）。推论：**便宜模型挂强 harness 边际回报最高**（论文 Pareto：Seed 2.1 Pro $2.75/张达 GPT-5.5 裸分的 88%）——3-tier 路由的廉价档位应优先获得 harness 强化投资，而非把重型管线只配给强模型。**三点补强（arXiv:2610.14224v1 §3.2/§4/附录 E.3）**：① **harness 资产跨模型迁移复用**——为强执行器精炼的 harness 组件可直接迁移给弱执行器：附录 E.3 实测为 Gemini 3.5 Flash 精炼的 harness 迁移到 GLM-5 后 Code 58.4→75.8（**+17.3**），Gemini 3.7 Flash / Claude Opus 4.8 亦各有增益（论文注明收益随执行器与领域波动大）——harness 改进库（2.3）条目须标记**可迁移性**，跨模型复用**不重新付探测税**（Probe 税一次性资产化的又一形态）；② **同模型自改可行**——§4 五种执行器（GLM-5 到 Claude Opus 5）在全部基准均改进、GLM-5 在 LAB +13.7，论文结论原文 "harness refinement need not rely on a stronger editor"——**不需要"必须更强模型当编辑器"的成本假设**（论文仅证明"不必更强"，编辑器用更便宜档位未测；本架构按 3-tier 自行选档、编辑器调用照常计税）；③ **"弱模型 + 改进 harness > 强模型裸分"为 3-tier 路由显式选型依据**——§3.2 实测 GLM-5 一步对比精炼后 75.7/75.3 超 Gemini 3.5 Flash 基础分 72.4/74.5（原文 "A weaker model with an improved harness can thus outperform a stronger one with its original harness"；JobBench 上模式反转——Gemini 获益更大，故选型依据按域分账而非全局断言）。

**记忆库防膨胀**
- 滑动窗口：routing-outcomes ≤500 条（有界数据结构）；
- 图算法上限：PageRank ≤5000 节点 / ≤10 万次比较 / 30 轮迭代（超限保护，不无限重算）；
- **巩固触发式 GC**：活跃轨迹 ≥10 条才触发巩固；置信度每小时衰减 −0.005、访问 +0.03——不活跃记忆自然沉降，无需独立清理作业；
- supersedes 失效链：冲突记忆"失效+归档"而非无限追加；
- 显式压缩/导出工具：`memory_compress` / `memory_export`；
- **检索成本阶梯**：BM25+向量混合（便宜）→ MMR 多样性 → cross-encoder 重排（贵，放最后）；控制器 L1-L5 分级懒加载，低频组件不实例化；
- **注入即计税**：每次检索+重排+注入的 token 计入 RSI 账（Explore 类），注入产物按 2.6.1 规则跟踪后续使用——检索链路的每一级都要能回答"这级花掉的 token 换来了什么"。

### 5.5 存储与保留策略

- **技能包限额双侧一致**：单文件 1MiB / 整包 8MiB / ≤256 文件，daemon 与服务端**两侧同校验**（上传侧和注入侧都拦）；技能缓存按 `workspace/source/id/hash` 键 + SHA-256 清单——缓存失效靠哈希，不靠清理；
- **转录增长**：task_message 追加写 + `(task_id, seq)` 索引；用量预聚合（hourly/daily rollup）避免仪表盘扫原始行；
- **清理任务有独立预算**：issue_source_context 专用 sweeper；中毒 workdir 标记后处理；孤儿任务回收——清理本身也是消耗资源的作业，必须有界；
- **迁移纪律即资源纪律**：不加外键/级联，关系在应用层维护——避免级联删除放大写负载。

### 5.6 执行位置与总原则

| 执行点 | 机制 | 借鉴 |
|---|---|---|
| `callMCPTool()` 卡点 | BudgetLimit + 调用计数（每 turn 检查） | Ruflo |
| 预算/权限同卡点 | 一次 authorize 同时回答"允不允许 + 有没有额度" | Ruflo |
| 入队 admission | 配额预留（reservation + 幂等）+ 四态合同 | Multica |
| daemon 运行时 | 分层看门狗 + 缓冲上限 + 进程树收割 | Multica |
| 调度器 | lease/heartbeat/stale-steal + 孤儿回收 | Multica |
| 记忆/路由 | 滑动窗口 + 巩固触发 + 算法上限 + 分层检索 | Ruflo |

总原则：**资源受限时显式拒绝，绝不静默降级**——配额超额返回结构化错误（含 ResetAt），并发跳过留痕，admission 绝不静默 no-op。这与权限子系统的 admission 合同哲学一脉相承：可观测的"不"，优于不可观测的"慢"。

---

## 6. 四大子系统的协同：一个任务的完整生命周期

```
 ① 用户在 issue 里 @agent
    ▼ L1 admission：queued(+ReasonCode) · 配额检查 · 合并评论折叠
 ② 控制面铸造 task_token(绑定 agent+task) · 配额预留(reservation 状态机+幂等键)
    ▼ WS 唤醒 daemon(本机)
 ③ daemon claim 载荷 = 上下文快照(issue/项目/工作区/人/前序会话)
    ▼ 治理面：技能包按 agent_skill 绑定筛选、SHA-256 校验、注入原生技能目录
 ④ 智能面：快循环注入 top-5 相关模式(PageRank+相似度) + agent 路由推荐
    ▼ 简报写入 CLAUDE.md/AGENTS.md(稳定前缀) + per-turn 消息(易变区)
 ⑤ spawn agent CLI(隔离 workdir · execFile 无 shell · 进程树可收割 · 分层看门狗)
    │  每个工具调用 ─ L3 策略引擎卡点(权限预设→PreToolUse→预算→回执)
    │  每条消息/工具调用 → task_message(seq+时间戳)流式落库 → WS 实时分发
    │  token 用量 → task_usage 流式归集 → 小时/日 rollup
 ⑥ 任务完成：快循环反馈(注入模式置信度 ±) → 洞察入 pending-insights.jsonl · 记入 RSI 分类账(2.6)
    ▼ 每 4 任务边界：巩固(去重/PageRank/记忆 supersedes) · 有界支撑集 · worker 仅在 L5 进化预算有余额时触发
    ▼ (若 2.4 在线无真值模式启用) 最终交付 = 匿名比较已有输出(含参考执行)选出·绝不合成新内容——最坏退化为正常执行, 改进失败不损交付; 被选输出打『采纳』标(ℋₜ⋆, 非验证最优)入转录(3.4)与 ℒ
 ⑦ agent 以评论交付结果(用户只看评论) · 默认开 PR · 配额结算(完成结算/取消释放)
    ▼ L5 评审门：人 review + merge → issue 自动推进 done
 ⑧ (慢循环) 解法可沉淀为技能：agent 起草 SKILL.md(计 Write 税) → 人工审核 → 携 born_cost 入库 → 下次任务注入
 ⑨ (元循环·定期) 策略面结构级变异(单组件约束) → 五道门(接口验证/静态门/评估上限/噪声边际/合取验收) → sandbox 打分(源码+轨迹+分数) → ℒ 入档 → 7.4 双轴报告晋级
```

四个子系统在该流程中的分工：**上下文共享**决定 agent"看到什么"，**权限管控**决定它"能做什么、以谁的身份、产出如何被人验收"，**自我进化**决定"这一次的经验如何改变下一次"，**资源管理**决定"花多少、何时止损、超了怎么办"。

---

## 7. 落地建议

### 7.1 分期路线

| 阶段 | 范围 | 验收标志 |
|---|---|---|
| **M1 骨架** | 控制面任务队列 + daemon spawn 一种 CLI + 隔离 workdir + task_message 转录 + task_token + **task_usage 计量** | 一个 issue 触发一次可回放的 run；用量可查（计量先于控制） |
| **M2 上下文** | claim 快照 + 简报稳定/易变双区 + 技能文件级注入 + 评论交付闭环 + **技能包限额双侧校验** | 简报跨 run 不打碎 prompt-cache；/技能名 可用 |
| **M3 权限+预算** | admission 合同 + 策略引擎卡点（权限+BudgetLimit 同点）+ 权限预设三档 + PR 评审门 + 审计日志 + **配额预约制** | defaultDeny 下所有 MCP 调用有回执；PR merge 才关 issue；超额返回结构化错误 |
| **M4 进化·快** | **SRN 有界笔记地板（2.7）** + 钩子捕获(含负例) + 置信度反馈 + 路由结果 + top-5 注入 + 巩固 + **滑动窗口/巩固触发等记忆预算** | 注入的模式可被下次任务的成功/失败修正；记忆库体积有界；**RSI 分类账可查：ρ ≤10%、浪费率 ≤25%** |
| **M5 进化·慢/元** | 技能起草-审核流 + workspace 技能库 + metaharness 打分/变异 + **2.6.2 防呆五则 + 2.4 五道门 + ℒ 优化记录** | 一个解法变成技能并被复用；策略改进有不可变回执；**每次晋级附 7.4 双轴报告（对照 SRN）**；三条可查项：①元循环候选 100% 先过接口验证（秒级冒烟日志可查）才计 sandbox 评估；②sandbox 反馈含完整轨迹（抽查 proposer 读取记录应同时含历史源码与轨迹文件，arXiv:2603.28052v1 附录 A.1 实测占比 41%/40%）；③held-out 结果目录进化期间零访问（permission-audit 可查） |

### 7.2 核心数据表（最小集）

```
任务域    issue / agent_task_queue(attempt, session_id, work_dir, branch_name)
          task_message(seq, tool, input, output)
资源域    task_usage(权威成本列) + usage_hourly/daily rollup(pgcron)
          quota_period / quota_reservation(状态机+幂等键)
          task_lease · prepare_lease(心跳续期, stale steal)
凭证域    task_token(哈希) / daemon_pairing_session / permission_audit(追加)
进化域    skill / skill_file / agent_skill(enabled) / pattern(置信度, usages)
          routing_outcomes(滑动窗口≤500) / memory(主库+向量, supersedes 链)
          rsi_ledger(Verify/Explore/Write→产物id, 追加写) + 产物计量字段
          born_cost·used_count·last_used(含 note.md 有界笔记)
协同域    comment(多态作者, 线程) / activity_log / issue_source_context
```

### 7.3 必须写进代码注释的五条教训

1. Ruflo 的 permission-set 自述"这是元数据层不是沙箱"——权限体系每一层都要诚实标注自己的真实边界；
2. Multica 把易变值移出简报（MUL-5377）——上下文组装的第一约束是缓存稳定性，不是信息完整性；
3. Ruflo 同时记录失败工具调用作为负例（ADR-174）——进化系统的质量取决于负样本，不只正样本；
4. Multica 配额超额错误刻意不含商业文案（`AutopilotQuotaExceededError{Used,Reserved,Limit,ResetAt}`）——资源错误的消费者是程序和看板，结构化优先于说辞。
5. RSI Tax 论文的账本触目惊心（23.7%~63.6% 的税花在从未被使用的产物上）——**先证明产物会被使用，再花生成它的钱**；进化系统的第一交付物是账本，第二才是准确率。

### 7.4 评测协议：准确率/令牌双轴（RSI 审计，借鉴 arXiv:2611.13524v1）

第 2 章任何进化机制的上线/晋级/降级（2.7 规则）都必须通过本协议出报告，**没有双轴报告的改进不算改进**：

**任务流（两种形态）**
- **链式流**：任务链（前序任务的产物是后续任务的输入，如论文 SWE-Chain-Evo 的 7 链 × 15 任务 = 105 位置）——考察跨任务积累与遗忘；
- **固定序流**：独立任务固定顺序（如论文 Terminal-Bench 2.1 的 89 任务）——考察无积累场景下进化是否纯属开销。

**协议纪律**
1. **先评分、后反馈**：每个任务的 outcome 必须在它的结果被用于任何更新之前完成评分——否则评测被进化过程污染（论文协议同款）；
2. **任务/RSI 调用不相交记账**（2.6），报告必须给出 ρ 及 Verify/Explore/Write 分解与浪费率；
3. **对照组固定三档**：`Static`（无进化）/ `SRN`（有界笔记地板）/ `被测配置`——重型组件的晋级判决只与 SRN 比，不与 Static 比（赢过 Static 不说明值得花税）；
4. **双 backbone**：至少两个模型底座重复（论文用 DeepSeek V4.1 Flash 与 GPT-6 Luna；2328 个 method-task 对）——单 backbone 的结论不可信；
5. **搜索集/held-out 物理分割（arXiv:2603.28052v1 §3）**：进化反馈仅来自搜索集；held-out（终评）结果独立目录存放、**进化期间零访问**（本机副本 results/ 目录注释 "never exposed during evolution"）——"先评分后反馈"之外的第二条卫生纪律；
6. **搜索集构造**：优先取基线做错的样本与困难子集，规模控制在每次晋级**约 50 次完整评估**（arXiv:2603.28052v1 附录 D-2："快而有区分度的评测胜过大评测"）——直接压缩 Verify 税，强化 2.6.2-3 支撑集预筛；
7. **优化期评估器与冻结外部评估器分离（arXiv:2608.13560v1 §5.1/§6）**：优化期评估器 R_meta 构建后冻结；最终评测的权重/rubric/gate 在比较前**人工冻结**且外环不可触碰；模型评判输入脱敏（只收渲染图与源摘要，无系统身份与生成 prompt）；**record-level ceiling 封顶**（P0 完整性违规封顶 40，先封顶后求均值）；评估器演化必须版本化，并以冻结参考任务、对抗探针、定期人工审计锚定（§6：否则 reward-hack a moving target）。

**报告指标**：最终准确率 `A(T)`、总 token `N(T)`、税率 `ρ`、相对 SRN 的**净 token 溢价**（Δ准确率是否 > Δ税）——四项并列呈现，任何单项美化都视为报告无效。在线无真值模式/harness 改进的报告另增**过程证据列：工具错误率与工具调用数变化**（arXiv:2610.14224v1 附录 E.4 表7，设定 Gemini 3.5 Flash/OpenCode/k=1）——论文实测错误率**全线下降**（WB 0.8%→0.5%、JobBench 14.4%→9.1%、LAB 2.0%→1.6%，相对 −37.5%/−36.8%/−20%）而调用数**有升有降**（WB 20.0→17.8 即 −11%，JobBench 27.4→32.8 即 +19.7%，LAB 20.8→25.2 即 +21.2%），论文明言以此 "distinguish more reliable tool use from fewer calls"、精炼 "can improve performance without shortening execution"——harness 改进的实质是**『更可靠』而非『更省调用』，单看调用量会误判改进方向**。多目标场景（如准确率 vs 上下文成本）返回 **Pareto 前沿而非单点**（arXiv:2603.28052v1 §3），由使用者按需选点，与四指标并列互补。**外环总成本必须披露（arXiv:2608.13560v1 反面案例）**：AutoDesign 报告了外环规模（7 天/224 subagents/≥123 迭代/54 更新）却未报告外环自身 token/费用——正是 2.6 分类账要防的盲点；任何元循环报告必须给出外环 Verify/Explore/Write 分账与税率 ρ，**缺账不视为改进**。

---

## 附：主要参考文件索引

**Multica**
- 架构：`apps/docs/content/docs/developers/architecture.mdx`、`apps/docs/content/docs/security-model.mdx`
- claim 快照：`server/internal/handler/daemon.go`（buildClaimedTaskResponse / buildClaimedTaskResponse:2294）
- 简报注入：`server/internal/daemon/execenv/runtime_config.go`、`runtime_config_sections.go`
- 技能：`server/migrations/008_structured_skills.up.sql`、`server/internal/daemon/local_skills.go`、`skill_cache.go`
- 审批门：`server/internal/handler/vcs_webhook.go`、`server/internal/handler/admission.go`
- 资源：`server/migrations/032_task_usage` + 073/076/101/102(rollup)、`352-359_autopilot_quota_*` + `server/internal/service/autopilot_quota.go`(配额预约)；看门狗 `server/internal/daemon/daemon.go:9272`(runIdleWatchdog)；租约 124 迁移 + `server/internal/scheduler/`(heartbeat/stale-steal)
- daemon：`server/internal/daemon/daemon.go`、`pkg/agent/`（26 CLI 适配器）

**Ruflo**
- 学习闭环：`.claude/helpers/intelligence.cjs`、`hook-handler.cjs`；`v3/@claude-flow/cli/src/mcp-tools/hooks-tools.ts`
- 路由学习：`v3/@claude-flow/cli/src/services/learned-routing.ts`
- 记忆：`v3/@claude-flow/cli/src/mcp-tools/memory-tools.ts`、`v3/@claude-flow/memory/src/tiered-memory.ts`、`controller-registry.ts`
- 策略引擎：`v3/@claude-flow/security/src/policy/engine.ts`、`v3/@claude-flow/cli/src/services/policy-runtime.ts`、`v3/@claude-flow/cli/src/permission/permission-set.ts`
- 元进化：`v3/@claude-flow/cli/src/mcp-tools/metaharness-tools.ts`、`src/services/harness-flywheel.ts`
- 资源：`.harness/mcp-policy.json`(maxToolCallsPerTurn: 200)、`v3/@claude-flow/security/src/policy/engine.ts`(BudgetLimit/审批/回执)、`.claude/helpers/intelligence.cjs`(PageRank 上限/巩固触发/置信度衰减)、根 `CLAUDE.md`(3-Tier Model Routing)

**RSI Tax 论文与 Meta-Harness 框架（成本约束源）**
- 论文：arXiv:2611.13524v1《The RSI Tax: When Recursive Self-Improvement Is Not Worth the Cost》——RSI Tax 定义与分解（§3）、SRN 基线（§4）、主结果：SRN 以 −65.6%~−71.0% token 追平重型方法（§5）、浪费案例（附录 D）
- 被审计框架本机副本：`E:\coding\meta-harness-main`（arXiv:2603.28052，Stanford IRIS）——`reference_examples/{text_classification,terminal_bench_2}/meta_harness.py`（harness 搜索循环）、`memory_system.py`、`agents/baseline_kira.py`（论文同款 KIRA 基线）

**Meta-Harness 原论文（机制来源，arXiv:2603.28052v1，Stanford IRIS）**
- §3 搜索循环：harness = 单文件有状态程序（实测 100–1000 行）；代码空间搜索优于模板/预定义变异算子；无父选择规则；proposer 从不见测试集；多目标返回 Pareto 前沿。Algorithm 1：初始化种群（领域基线复制）→ 评估 → proposer 查询文件系统提出候选 → 接口验证 → 评估入 D → 返回 Pareto 前沿
- Table 3 反馈接口消融：完整接口（源码+轨迹+分数）50.0/56.7 vs 仅分数 34.6/41.3 vs 分数+摘要 34.9/38.7。附录 A.1：proposer 每轮读文件中位 82 个（41% 源码/40% 轨迹/6% 分数），访问非马尔可夫；A.2：混淆变量识别、"纯增益"转向、独立失败模式组合。附录 B.1/B.3：Label-Primed Query、Draft Verification、环境快照（~80 行/15s 超时/静默失败）。附录 D：skill 文本是最强杠杆；难搜索集 + 约每次晋级 50 次完整评估（"快而有区分度的评测胜过大评测"）；JSON/层级/regex 友好命名；小 CLI（前沿/top-k/diff）+ warm-start；轻量验证先于昂贵评测；评测自动化置于 proposer 之外
- 官方代码副本 SKILL.md：`E:\coding\meta-harness-main\meta-harness-main\reference_examples\text_classification\.claude\skills\meta-harness\SKILL.md`——反参数调参规则、6 探索轴 A–F、/tmp 强制原型、uv run import 接口验证、pending_eval.json（hypothesis/axis/base_system/components）、MemorySystem 接口、results/ "never exposed during evolution"

**AutoDesign 论文（元循环制度条件来源，arXiv:2608.13560v1）**
- §2.1 五组件分解；§3.2 单组件更新约束、合取式验收门（J_train 严格升 ∧ J_dev 不降）、dev 对提案者不可见、ℒ 优化记录 + repository checkpoint、单活跃 harness、HITL 双通道（g_t / 评估器修订）；§4.1 provenance 锚点与上下文一次构建复用；§4.3 确定性 blocking 先行 + VLM 后置脱敏、K=12 上限、预算耗尽回退序列；§5.1 PosterBench 冻结外部评估器、record-level ceiling（P0=40 先封顶后均值）；§5.2 Table 3：七配置增益 +5.59~+19.56（与模型强度负相关）、Pareto（LongCat $0.27/55.13、Seed 2.1 Pro $2.75/71.83、GPT-5.5 $10.02/81.46）；贡献列表：7 天/224 subagents/≥123 迭代/54 更新（未披露外环 token/费用，反面案例）

---

## 附B：11 轮优化记录（R1–R10 参考 arXiv:2611.13524v1，2026-11-13；R11 参考 arXiv:2608.13560v1）

| 轮 | 论文依据 | 修改位置 | 摘要 |
|---|---|---|---|
| R1 | 端到端成本 = 任务执行 + RSI Tax；重型方法税率 100%~393%（§1/§3） | 原则 5 · 0.3 第三参考源 · 2.1 警示 | RSI Tax 立为第一性约束：赢不过自身成本的进化机制不上线 |
| R2 | 成本会计与 Verify/Explore/Write 三分解（§3.1/3.2） | 新增 2.6/2.6.1 · 5.2 升为五级（L5 进化预算） | 进化调用三分类记账 + 税率 ρ；被拒更新照常计税；预算与权限共用策略引擎卡点 |
| R3 | 后续使用追踪：23.7%~63.6% 的税花在从未使用的产物（§3.3） | 2.5 存储模型 · 2.3 技能记账 · 7.2 数据表 | 产物统一携带 born_cost/used_count/last_used；注入 ≠ 使用；浪费率 >25% 自动收紧 |
| R4 | SRN：−65.6%~−71.0% token 追平准确率；更新调用 <0.4%（§4/§5） | 新增 2.7 | SRN 有界笔记（≤2048 token/每 4 任务/单次生成调用）为快循环默认地板；重型管线改为证据晋级 + 自动降级 |
| R5 | 附录 D 浪费案例：58M token 无提案搜索、603k 决策不变式验证 | 新增 2.6.2 | 花税前三条前置防呆（纯条件判断零 LLM 成本）：决策不变式检查 / 提案空闲轮上限 / 支撑集预筛 |
| R6 | 周期更新协议：每 4 任务边界 + 有界支撑集（§2.1） | 2.2 ③ 巩固 | 更新节奏固定每 4 任务；支撑集有界 + 仅标量判定（禁 LLM-judge rollout）；daemon worker 由常驻改为预算触发 |
| R7 | 验证环节占重型方法总税 74.8%~93.6%（§3.2/§5.2） | 2.4 元循环晋级规则 | 三道成本门：廉价静态门前置 / 评估 rollout 上限 + held-out 复用 / 晋级边际 > 验证噪声 |
| R8 | 附录 D：unretrieved memory bundles | 3.3 记忆库 · 5.4 记忆防膨胀 | 检索命中率 + 注入引用率两指标；零检索条目移出索引；注入消融封顶作业；注入即计税 |
| R9 | 任务流与指标协议：A(T)/N(T)/净 token 溢价（§2.2/§2.3） | 新增 7.4 · 教训 5 | 双轴评测协议：先评分后反馈、三档对照（Static/SRN/被测）、双 backbone、四指标并列缺一无效 |
| R10 | 全文综合 | 6 生命周期 · 7.1 分期验收 · 附录索引 · 本日志 | 生命周期全程税账标注；M4 验收加 ρ≤10%/浪费率≤25%，M5 验收加双轴报告；论文与被审计框架入附录 |
| R11 | AutoDesign（arXiv:2608.13560v1）列为第四参考源：RSI Tax 给成本约束，AutoDesign 给"值得付税的元循环"的正面制度条件（§3.2/§5.1） | 0.3 新增第四参考源 · 2.4/2.5/7.4 制度条款 · 附C | 单组件更新约束、合取式验收门 + dev 隔离、ℒ 优化记录、冻结评估器分离、HITL 双通道入正文；与 RSI Tax 合答"重型管线在什么制度下才配赢过 SRN" |

---

## 附C：论文驱动优化记录（2603.28052 + 2608.13560，2026-11-16）

本轮在 v2（四子系统 + RSI Tax 约束 + 附B R1–R10）基础上，依据两篇论文研读结果做结构化优化：**论文A** = Meta-Harness 原论文（arXiv:2603.28052v1，Stanford IRIS，补"机制"——怎么搜更值）；**论文B** = AutoDesign（arXiv:2608.13560v1，补"制度条件"——什么约束下才值得搜）。与第三参考源 RSI Tax（arXiv:2611.13524v1，"值不值得搜"）的三方关系见 2.7 末段。所有修改不改变章节编号，R1–R11 条款全部保留；受门数变化牵连的旧表述（6 生命周期⑨、7.1 M5 的"三道门/防呆三则"）已同步为"五道门/防呆五则"。

| 轮 | 论文依据 | 修改位置 | 摘要 |
|---|---|---|---|
| C1 | 论文A §3/Table 3/附录 D | 0.3 矩阵新增行 · 附录索引新增"机制来源"块 | 引用从"单向成本警示"（仅 RSI Tax 视角）转为"机制+成本"双向：新增"元循环·搜索空间与反馈接口"矩阵行与论文机制条目（搜索循环/轨迹消融/附录 A/D） |
| C2 | 论文B §2.1/§3.2/§5.1 | 0.3 新增第四参考源段 · 附B 改题 + R11 | AutoDesign 列为第四参考源：RSI Tax 给成本约束，AutoDesign 给"值得付税的元循环"正面制度条件，合答"重型管线在什么制度下才配赢过 SRN" |
| C3 | 论文A §3（Advantages of code-space search）+ 本机副本 SKILL.md 反参数调参规则 | 2.4 变异面条目 | 7 策略面预定义变异升级为代码空间搜索：策略配置序列化为可整体 diff/审查的单文件程序（100–1000 行），允许结构级重写；初始种群从手工基线复制而非随机；新增反参数调参晋级门（仅常数不同不进 sandbox） |
| C4 | 论文B §2.1/§3.2（五组件 + "exactly one of the five harness components"） | 2.4 新增单组件更新约束条目 | 五组件分解（Context and Memory/Tools and Specs/Execution Runtime/Orchestration/Evaluation and Feedback）为顶层变更范围层，7 策略面映射为子项；每次外环迭代只改一个组件，信用分配可解释、降归因噪声 |
| C5 | 论文A Table 3（完整接口 50.0/56.7 vs 仅分数 34.6/41.3，中位 +15.4） | 2.4 评估与反馈接口条目 | sandbox 反馈升级为"源码+执行轨迹+分数"三元组；轨迹复用 3.4 task_message 转录不加 rollout 税，proposer 读文件 token 计 Explore，与 2.6 记账兼容 |
| C6 | 论文B §3.2（合取验收 ∧ "never exposed to P"） | 2.4 晋级门新增第 4 条 | 晋级判据改合取式 J_train(候选)>J_train(在位) ∧ J_dev(候选)≥J_dev(在位)；dev 集轨迹与分数绝不暴露给提案生成器，仅用于门控；被拒保留在位者并记入 ℒ |
| C7 | 论文B §3.2/§6（g_t 方向指导 / 评估器修订通道） | 2.4 新增人工介入双通道条目 · 4.6 收尾句 | 方向性指导 g_t 自然语言输入 planner（提案函数扩展 P(H_t, τ_t, s_t, ℒ, g_t)）防停滞/过早收敛；评估器修订须版本化；人只给方向不改实现，与 2.3 克制哲学一致 |
| C8 | 论文A Algorithm 1 + 附录 D-5（接口验证，轻量验证先于昂贵评测） | 2.4 晋级门新增第 0 条 · 2.6.2 新增第 0 条 | 候选进 sandbox 前过秒级零 LLM 成本冒烟（导入模块/实例化类/极小样本调用，本机副本形态 uv run python -c "from … import *"），畸形候选近零成本拦截，排在决策不变式检查之前 |
| C9 | 论文A 附录 D + 本机副本目录形态（candidates/、pending_eval.json、results/ "never exposed"） | 2.5 新增元循环候选日志目录规范 | 每个已评估候选一个目录（源码/分数/完整轨迹）；pending_eval.json 结构化产出（假设必须可证伪）；全部 JSON/层级/regex 友好；搜索期(val/logs)与终评(results/test)物理分目录；小 CLI（前沿/top-k/diff）省导航 token；离线经验同构 warm-start |
| C10 | 论文B §3.2（ℒ：快照/轨迹分数/组件/计划/改动/决定/checkpoint） | 2.5 新增 ℒ 元循环优化记录规格 | 每次外环迭代追加 ℒ（dev 数据不入档）；被拒迭代也入档避免重复探索；单活跃 harness 不做树搜索，回滚靠 ℒ + checkpoint |
| C11 | 论文B §4.3（blocking checks 先行、VLM 批评者仅在其未通过时介入） | 2.6.2 新增第 4 条 | 验证成本阶梯制度化：确定性 blocking 检查（零 LLM）→ 标量验证器 → 模型/VLM 评判（最贵最后置），与 RSI Tax"验证占税 74.8%~93.6%"互证 |
| C12 | 论文A §4.1/Figure 1/4（0.1× 评估量）+ 附录 D-2/D-5；论文B §3.2 | 2.7 新增末段 | 澄清两篇论文与 RSI Tax 互补而非矛盾：轨迹反馈提高每单位 Verify 信息量、难搜索集压 Verify 规模、接口验证零成本拦截、单组件/合取门降归因噪声——快循环仍 SRN 地板，全套机制仅元循环条件启用，晋级仍对照 SRN 判决 |
| C13 | 论文A 附录 B.3（环境快照 ~80 行/15s/静默失败，89 题中 7 题获益） | 3.2 新增环境快照块 | agent 循环前单条复合 shell 命令采集快照（cwd//app 截断 20 条/语言版本/包管理器/内存）；写 workdir ENVIRONMENT.md + 简报索引一行或首条 per-turn 消息，绝不写入简报稳定区（MUL-5377） |
| C14 | 论文B §4.1（"Every extracted element retains a reference to its location in x"） | 3.2 新增 provenance 锚点 | 注入/提取元素强制携带来源锚点（issue 评论 id/文件路径:行号/上游 URL）；上下文构建一次跨步骤复用；锚点使 2.6.1"注入≠使用"从启发式升级为可观测事件 |
| C15 | 论文B §4.3（预算耗尽经回退序列选可交付候选） | 5.2 新增预算耗尽回退段 · 5.3 重试预算补句 | 任务级预算耗尽不立即报错，从尝试历史经回退序列选可交付候选；回退产物打 degraded 标记留审计——可观测的降级交付优于不可观测的失败（不违反"绝不静默降级"） |
| C16 | 论文B §5.2 Table 3（增益与模型强度负相关 + Pareto） | 5.4 新增 harness 强化×模型分层联动条目 | 弱模型 harness 增益最大（DeepSeek V4 Pro +19.56/Seed 2.1 Pro +17.82/GLM 5.2 +14.01）、强模型最小（GPT-5.5 +5.59/Claude 4.8 +5.01）：3-tier 廉价档优先获得 harness 强化投资（Seed 2.1 Pro $2.75/张达 GPT-5.5 裸分 88%） |
| C17 | 论文A §3（proposer 从不见测试集）+ 附录 D-2（约 50 次完整评估/轮）+ 本机副本 results/ 注释 | 7.4 协议纪律新增第 5/6 条 | 搜索集/held-out 物理分割（held-out 独立目录、进化期间零访问）为"先评分后反馈"之外第二条卫生纪律；搜索集优先取基线做错样本与困难子集、每次晋级约 50 次完整评估，直接压缩 Verify 税 |
| C18 | 论文B §5.1/§6（PosterBench 冻结/脱敏/record-level ceiling/版本化锚定）；论文A §3（Pareto 前沿） | 7.4 协议纪律新增第 7 条 · 报告指标扩写 | 优化期 R_meta 冻结、终评权重/rubric/gate 人工冻结外环不可触碰；模型评判输入脱敏；record-level ceiling（P0=40 先封顶后均值）；评估器演化须版本化并以冻结参考任务/对抗探针/人工审计锚定；多目标返回 Pareto 前沿而非单点 |
| C19 | 论文B 贡献列表（7 天/224 subagents/≥123 迭代/54 更新，三次定向抓取确认未报告外环 token/费用） | 7.4 报告指标扩写 | 新增"外环总成本必须披露"条款：任何元循环报告必须给出外环 Verify/Explore/Write 分账与税率 ρ，缺账不视为改进（AutoDesign 未披露外环费用为反面案例） |
| C20 | 论文A Algorithm 1/附录 A.1（读文件占比源码 41%/轨迹 40%）/本机副本 results/ 纪律 | 7.1 M5 验收标志扩写（含"防呆三则→五则"同步） | M5 补三条可查验收：①元循环候选 100% 先过接口验证（秒级冒烟日志可查）才计 sandbox 评估；②sandbox 反馈含完整轨迹（proposer 读取记录同时含历史源码与轨迹文件）；③held-out 结果目录进化期间零访问（permission-audit 可查） |

---

## 附D：本论文 10 轮优化记录（Harness²：Recursive Agent Harnessing for an Open World，arXiv:2610.14224v1，2026-11-17 起）

| 轮 | 论文依据 | 修改位置 | 摘要 |
|---|---|---|---|
| D1 | §2.2（Probe 明言对比 "inform subsequent composition rather than verify task correctness"——只供后续组合、不验证任务正确性）；Table 3（w/o composition：WorkBuddy-Bench/JobBench −1.6/−1.9）；附录 F（行为对比不保证正确性，只作证据不作验证） | 2.4 新增『在线无真值模式』条目 · 2.4 标题引用列表 | 无 ground-truth 验证器的任务以任务内 Propose–Probe–Compose 替代 held-out 重打分：参考执行归任务调用、Propose 双候选、Probe 同任务同模型同配置三态行为对比（缓解/无变化/回归，不判对错）、Compose 证据驱动四路决策（每项绑定具体观察）；整环按 2.7 条件启用（对照 SRN 判决），Probe 候选执行计 Explore 税 |
| D2 | §2.2 Propose（invariant candidate "targets agentic deficiencies that may recur across domains, such as planning, tool use, context management, or delegation"；domain-specific candidate 针对当前领域知识/流程/约束）；表3（w/o scoping：WorkBuddy-Bench/JobBench −2.9/−3.7，JobBench 三项消融中最大） | 2.4 变异面条目扩写 | 双候选范围划分制度化：每个改进轮必须同时产出不变候选（限定 planning/tool use/context management/delegation 四类跨领域缺陷）+ 领域特定候选（当前领域知识/流程/约束）；两候选共享参考执行与 Probe 预算，规则零额外成本；四类缺陷与 7 策略面（planner/toolPolicy/contextBuilder/memoryPolicy）相通可复用变异面，并约束在线无真值模式 ② Propose 步 |
| D3 | §2.2 Probe（三态判定：缓解目标缺陷/行为无变化/引入回归，D1 轮已对照原文核实）；融合点：2.4 反参数调参门（本机 SKILL.md 规则）+ 2.6.2 第 1 条决策不变式检查 | 2.4 反参数调参门扩写 · 2.6.2 第 1 条补句 | 行为对比三态接入现有晋级门：『行为无变化』作为反参数调参门的执行级证据（行为未变 ≈ 仅常数不同）与『回归』均使决策路径不存在——直接拒绝只记 Explore，不进 Compose 及后续晋级验证；仅『缓解』进 Compose；三态产自 Probe 已付费 rollout，零新增成本 |
| D4 | §2.3 + 附录 D.2（库条目 = 完整采纳组件树，可执行原样保留 "Executable components are retained rather than summarised as prose" + EXPERIENCE.md 记录为何被选中/解决什么 recurring weakness/适用情形/支持证据）；附录 E.2（库来源占修改文件 22%/47% 但仅 2–10% 保留过半行——改编多于复制）；§4（k=5 库免探测 Code/Web/Office +0.9/+4.4/+5.1；JobBench 库迁移 WB 三域 +0.6/+0.5/+2.9）；表3（w/o library −3.1/−1.8，D1 轮已核实）；入档门槛原文 "selecting an output alone does not establish transferability" | 2.3 新增 harness 改进库段 · 2.5 目录树新增 harnesslib/ 行 | 慢循环技能库升级为 harness 改进库：条目 = 完整可执行组件树 + EXPERIENCE.md + 索引；入档门槛 = 仅执行对比证据可入档（输出被选中 ≠ 可迁移，证据不足不新增）；下任务从公共基线出发经 Propose 选择性复用/改编而非自动继承（改编多于复制）；库积累后免探测直接改进，Probe 探测税转化为一次性资产投入；计税不变（入档 Write/复用决策 Explore，携带 born_cost 等计量字段） |
| D5 | §2.1/附录 D.3 表5（8 组件各一文件 "Each is a file, so an edit is a diff"，四组：上下文构建/工具接口/编排/中间件控制；脚本定义 "A new deterministic capability, executed instead of being reasoned through token by token"）；附录 E.1 表6（去 skills 三域平均 −5.3、去 scripts −3.7 且 Office −7.4、去 prompt 组仅 −1.5；基座 72.4/完整 80.8；论文注明消融不建立可加性） | 2.4 单组件更新约束扩写（挂载清单+投资优先级） · 2.3 新增脚本固化通道段 | 8 组件文件级挂载点清单并入五组件映射（顶层五组件→7 策略面→8 文件挂载点；Evaluation and Feedback 无日常挂载点，走 7.4 冻结/版本化）；编辑投资优先级 skills>scripts>prompts（附录 E.1 表6 组件消融，与 Meta-Harness 附录 D"skill 文本是最强杠杆"互证）；慢循环新增脚本固化通道：重复推理模式固化为可执行脚本（执行替代逐 token 重推理），与技能互补（技能改"知道什么"、脚本改"不必再想什么"） |
| D6 | §2.2.2（并行递归 "k controls its width rather than its depth"、顺序递归携带累积证据且后步可 "retain, revise, or correct earlier changes using both current and previous evidence"）；§4 图5（两种递归 k=1→5 单调上升，k=2 已超全部基线 k=5）；附录 G（"stop when additional probes yield little new evidence"——论文列为未来方向，本架构即行制度化）；附录 D.1（rollout 上限 200 模型轮/3600 秒，rollout 间无跨任务记忆） | 5.2 L5 行加 k 旋钮 + 新增递归预算段 · 2.6.2 新增第 5 条并同步总结句 | 递归预算 k 参数化：k=1 默认地板档纳入 L5（上调按 2.7 对照 k=1 判决）；并行（宽度/降延迟不减算力）与顺序（深度链式/累积证据/可保留修订纠正前步）按预算与任务形态选择；k=2 已超全部基线 k=5（增益集中前两步）；新增『无新证据即停』第 5 条防呆（与第 2 条提案空闲轮上限同构，判自已付费 rollout 零新增调用）；rollout 上限 200 轮/3600 秒 |
| D7 | §3.2（GLM-5 获益更大，一步精炼 75.7/75.3 超 Gemini 3.5 Flash 基础分 72.4/74.5，原文 "A weaker model with an improved harness can thus outperform a stronger one with its original harness"；JobBench 模式反转已如实注明）；§4（五种执行器同模型自改全部基准均改进、GLM-5 LAB +13.7、"harness refinement need not rely on a stronger editor"）；附录 E.3（为 Gemini 3.5 Flash 精炼的 harness 迁移 GLM-5：Code 58.4→75.8 即 +17.3，收益随执行器/域波动） | 5.4 C16 联动条目扩写三点 | ① harness 资产跨模型迁移复用：库条目标记可迁移性，跨模型复用不重付探测税（E.3 +17.3）；② 同模型自改可行：无需"更强编辑器"成本假设（论文仅证明"不必更强"，更便宜档位未测、按 3-tier 选档照常计税）；③ "弱模型+改进 harness > 强模型裸分"为 3-tier 路由显式选型依据（按域分账，JobBench 反转注明） |
| D8 | 附录 E.6/图14（九个回归三分类：选择偏好弱候选——WB-code 55 分输出被选过 95 分、LAB 覆盖变窄 54→26；错误前提跨候选传播——literal-key 要求与未核实 cache 假设致 2–11 分损失；第三类——结果变异/judge 判定缺失/编辑未针对被评标准；所示分数为事后评估、管线运行时不可见）；§2.2 Final Selection（星号记法 H*ₜ = adoption rather than verified optimality，本轮核实实际位于 §2.2 而非 E.6） | 2.6.2 新增第 6 条并同步总结句 | 失败模式三防：①候选间信息隔离（Compose 读全部执行证据，候选生成阶段不继承他候选未经当前任务证据核实的假设）；②选择保守化（行为对比证据不足时默认保留在位者/参考交付，采纳以星号标注"采纳而非验证最优"）；③编辑绑定目标缺陷类别（对接 2.4 scoping，未针对可观察缺陷的提案直接拒）；三防只在已付费证据上判、零新增评估调用 |
| D9 | §2.2 Final Selection（"an agentic selector compares anonymized deliverables against the task request and source materials"；"returns an existing output without access to its originating harness or synthesizing new content"；"ℋt⋆ … the star indicates adoption rather than verified optimality"；选择阶段不改 harness，k=1 旁路选择） | 2.4 在线无真值模式新增 ⑤ 最终选择 · 6 生命周期图插入选择行 | best-of-k 匿名选择纪律：k>1 时最终交付从已有执行输出（含参考执行）中匿名比较选出、绝不合成新内容（选择阶段不改 harness）；参考执行交付物始终留在候选池——改进环最坏退化为正常执行，改进实验失败不损任务交付；被选输出打『采纳』标记（ℋₜ⋆，非验证最优），进 3.4 转录与 ℒ 记录 |
| D10 | §2.2（Probe 定义与对比用途，行为对比不验证正确性——D1 轮已核实原句）；附录 E.4 表7（错误率 WB 0.8%→0.5%/JobBench 14.4%→9.1%/LAB 2.0%→1.6%，相对 −37.5%/−36.8%/−20%；调用数 WB 20.0→17.8 即 −11%、JobBench 27.4→32.8 即 +19.7%、LAB 20.8→25.2 即 +21.2%；原文 "distinguish more reliable tool use from fewer calls"、"can improve performance without shortening execution"；设定 Gemini 3.5 Flash/OpenCode/k=1） | 2.6 三分类表两行扩写 + 表后新增记账口径段 · 7.4 报告指标增过程证据列 | Probe/Compose 记账口径：参考执行归任务调用（同时是交付候选，不计 RSI 税）；Probe 候选执行与行为对比分析记 Explore（不构成正确性验证，不得记 Verify）；Compose/反思/写库记 Write；双轴报告增工具错误率与调用数过程证据列——错误率全线降而调用数有升有降，改进实质是『更可靠』而非『更省调用』，单看调用量会误判方向 |
