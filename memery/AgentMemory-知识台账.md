# AgentMemory 知识台账（跨期累积）

> 用途：记忆技术洞察各期的事实基线，避免重复检索、避免口径漂移。每条注明来源期次与核实日期。
> 维护规则：只记"会变化的结构性事实"（版本、指标口径、计量单位、架构分层），不记新闻评述。

## 一、方案档案（截至 2026-11-06）

| 方案 | 归属 | 形态/许可 | 版本/时间 | 记忆载体 | 分层 |
|---|---|---|---|---|---|
| Hy-Memory 2.0 | 腾讯混元 | SDK `hy-memory` / Apache-2.0 / ~1.9k★ | 2.0 发布 2026-10-15；2.0.13→**2.0.14**（2026-11）；MemHub **1.0.6**（11 语言、lite/pro/ultra、**写入失败重试 + provider 宕机暂停排队**） | chat / working / coding 三类 | 三型记忆 + 双系统（快回忆/慢图式） |
| Hy-Memory-30B-A3B | 腾讯混元 | MoE 30B 总参/3B 激活 / Apache-2.0 | 随 2.0 发布，FP8/GGUF 已上 HF | 权重（写入判定） | 单步：memory-write |
| MemHub | 腾讯混元 | 本地应用（CLI + macOS） | v1.0.6（2026-11） | 汇聚多工具历史会话 | 本地记忆库 |
| TencentDB Agent Memory | 腾讯云数据库 | 开源 + 托管 / 3 万+★ → **30.3k★（2026-11-01）** / **GitHub 标注 NOASSERTION（许可证不可识别）** / 90 天 5 个 release | v2.0.0 2026-08-03；v2.0.2 10-09；v2.0.3-beta.1 10-13（**可插拔决策服务 + 会话轨迹记录**） | 服务端 MemoryCore + 向量库 | L0/L1/L2/L3 + 四类资产（Chat/Skill/Wiki/CodeGraph）；**Memory Proxy 支持 9-10 客户端（Claude Code/CodeBuddy/WorkBuddy/Codex/DSH 桌面端/OpenCode/Hermes/OpenClaw/Pi），协议保留改 base URL，Pi 需专用 PiProfile 解析器（标签行格式）；MongoDB 后端为试验特性** |
| 阿里云 Memory | 阿里云 | 托管服务 | 2026-11-02 升级 | 记忆条目 + 用户画像 | 未强调分层，强调规则可配；**MCP+CLI 接入 Codex/DSH/Claude Code/OpenClaw；图表署名 Mementis；HaluMem-medium QA 85.15% vs Zep 81.71%（自报未复现，对照分取自 OmniMemEval）** |
| OpenViking | 火山引擎 | 开源 AGPLv3（CLI/examples Apache-2.0） | v0.5.2.1；最后提交 2026-11-03；41.4k★（近 20 天 +1.5k）；DSH 插件 0.5.32 | `viking://` 虚拟文件系统（AGFS：localfs/s3fs/memory） | L0 摘要 / L1 概览 / L2 原文；Resource/Memory/Skill 三类；**peer = git identity（origin URL 归一化）→ 路径 → user 三级回落；`forget` 为永久删除** |
| ReMe | agentscope-ai | 开源 Apache-2.0 / ~3.7k★（3,748）；DSH 插件 `@agentscope-ai/reme-dsh-plugin` 0.1.2（11-04） | ReMe 0.4.1.11（QwenPaw 2.0 内为 v0.4） | `.reme/` Markdown，文件即真相 | session+resource / daily / digest / metadata |
| dsh-memory-evolve | csyangwen（社区） | DSH 插件 / MIT / **★数存疑：205（社区盘点）vs 606（早期查询）**；另有 azure5100/huahua-dsh-memory-os 自称同名 | v26092802；最后推送 2026-10-29 | 本地文件，五轨 | 档案/全局事实/项目关键记忆/项目日志/每日日志 |
| Mem0 | Mem0(Embedchain) | 开源+托管 / ~67k★ | — | 向量+图+KV 混合 | 用户/会话/Agent 三级作用域 |
| Zep / Graphiti | Zep | Graphiti Apache-2.0 | — | 时序知识图谱 | 事件子图（双时序） |
| **Zep Agent Skills** | Zep | 托管服务 + arXiv 2611.01386 / SKILL.md 开放格式 | 2026-11-01 发布 | Trace（有序事件+结果+验证强度）→ 不可变版本 Skill | Reflector 起草 / Curator 逐条对证据 / 准入门禁；**删源 run 级联删除引用它的 Skill**；verified use 调排序 |
| **openJiuwen OmniMem-Lens** | 华为 openJiuwen | 开源 Apache-2.0 / AgentMemory v0.2.0 | 2026-11-03~04 | 视频：L0 原始帧 / L1 事件级 / L2 片段级（L1/L2 全文本化+向量化） | **按内容边界切（视觉切变 × ASR 话题转向双流交叉）**；离线建、在线查 |
| **Hindsight** | Vectorize | 产品，未见开源；**Models 三件套开放权重（hs-decide Apache-2.0 / hs-rerank、hs-embed MIT）** | 1.2.0；Models 发布 **2026-11-03**；Hindsight Inference API $0.005/M input | 世界事实 / 经验 / 观察 / 心智模型；bank 严格隔离 | **"LLM 写，决策模型判"**：hs-decide-1-flash = Qwen3.5-0.8B 微调 0.8B、只回选择+概率**不生成文本**、中位 167ms；四个判断点（prune/dedup、证据是否足够、事实是否新、是否改页面）；同 Gemini-3.8-Flash 成本 −2.5×、模型时间 −1.9×、分 +2.2；observation 为 **refined 非 overwritten**，带原文引证 + proof count |
| **Redis Iris Agent Memory** | Redis | 托管（Iris 平台） | 2026-11-04 扩展，Agent Memory 已 GA | MemoryETL 摄入的层级记录（文档+用户行为双源） | 提供 inspection/audit/provenance；Lens(beta) 回溯 outcome→skill/route/FAQ/记忆/源 session |
| **MongoDB + Google ADK** | MongoDB / Google | 托管服务 | 2026-11-04 | SessionService（会话/事件/作用域状态）+ MemoryService（关键词召回） | **摄入幂等**（重加同一 session 不产生重复）；会话层乐观并发控制 |
| **PhoenixAI Contextbase** | PhoenixAI | 私有预览 | 2026-11-04 | 语义/知识/记忆/轨迹/评测同库 | 与业务数据同集群的单一治理存储；配 ObserveStack 追踪打分 |
| **Databricks MemCurrent** | Databricks | 托管 beta（Agent Bricks / Lakebase） | 2026-10-20 | 插件自动日志 + 按需工具 + 离线巩固管道 | 三访问模式并存；官方称通过率 3×、token −31% |
| **Autopoetic** | Autopoetic | 独立服务 | 2026-10-20 | **哈希链图（实体/关系/事件追加日志）** | 无外部依赖、检索零推理成本；唯一把"源不可变"写进数据结构 |
| MemOS | MemTensor | Apache-2.0 | — | 图服务（Neo4j+Qdrant）/本地 SQLite | 记忆立方 + 文本/激活/参数/偏好四类 |
| EverOS | EverMind | Apache-2.0 | 原名 EverMemOS | Markdown 源 + 内嵌 SQLite/LanceDB | 案例/技能双轨 |
| Letta | Letta | 开源 | 原 MemGPT | 运行时（core/recall/archival）+ MemFS | OS 式三层 |

| **KLM（Knowledge Layer Model）** | 规范 / 开放规格（v0.3） | arXiv:2610.42066（2026-11-02），参考实现 SEDIM | — | 推理记录含版本化认知评估 + 证据关系 + **显式 unknowns** | 规范级，无产品 |
| **MemShift** | 研究原型 | arXiv:2611.02338（2026-11-02） | — | 漂移五分支：源修订/删除/重定义/写入者切换/**导出** | 检测与修复分开打分（确定性打分器） |
| **DeltaDB** | Zed（Antonio Scandurra） | 产品设计稿（2026-11） | — | 对话/文件/周边状态拆 CRDT，本地 SQLite，节点=delta | DAG + timeline（同一 DAG 停驻多 frontier）；**不用版本向量** |
| **MINDSET** | 研究原型 | arXiv:2610.08586（2026-11-03） | — | 版本化 schema 保存原始 episode | 四态转移：reinforce / supersede / **contextual branch** / new schema |
| **StateGraph** | 研究原型（含 StateChangeBench） | arXiv:2611.02912 | — | 演化状态依赖图（边从交互历史恢复） | 依赖感知的修订：反事实验证严格支撑 |
| **MEMOIR** | 研究原型 | arXiv:2611.07631（2026-11-05） | — | 合并认证的在线重要性修订 | 压缩前 screening gate；无在线写路径额外 LLM |
| **EvoMemState** | XMUDeepLIT | arXiv:2611.03743（2026-11-02），有代码 | — | Persistent Facts + Relational States + Reasoning State | 本体引导状态归纳 + RL 状态演化 |
| **BreachWeave** | 开源（渗透测试 Agent） | 2026-11 | — | 每条记忆独立 JSON + 临时文件 rename 原子写 + 目录锁 | Idea/Memory 双板；**写权限收口单一 Manager** |

## 二、指标口径基线（供后续期次对比"是否真的变好了"）

- **Hy-Memory 2.0**（厂商自测）：LoCoMo 72.6%（vs EverOS 71.9%），单题 token 1159→703；MemoryArena 旅行+组合购物均分 55.31（领先 EverOS 10.2pp）；CodeMemoryBench 代码问答 64.2%、任务解决 35.6%；宏观均分 55.49 vs Opus 5 54.62、DeepSeek V4.1 Flash 53.64、Qwen3-30B-A3B 44.37。
- **TencentDB Agent Memory**：PersonaMem 总准确率 48%→76.10%，事实召回 29.63%→79.07%；短期记忆压缩最高省 61%（61.38%），超长 session 通过率 33%→50%；WideSearch +51.52% 成功率 / -61.38% token；SWE-bench +9.93% / -33.09% token。
- **阿里云 Memory**（2026-11-02）：PersonaMem-v2 56.82（所列 8 系统第一，9 维中 7 维第一）；HaluMem-medium 提取召回/准确/F1/问答 C 四项第一。
- **AML 首期（2026-08-12）**：MemoraX 58.0 #1；MemOS #2；NTES-MEMORY-SMART #3（个性化 57.0）；TencentDB 41.5 #8（规则与工作流执行 28.7，工业榜第二）；Mem0 #9；MemPalace #10；Supermemory #15。
- **MemArena**：50 agents / 15 天 / 10.3M tokens；后端替换 +32.5/+19.2pp，而模型扩容仅 +10.6/+6.8pp（后端≈3 倍杠杆）；权限感知访问全线失败（Oracle 越权泄露、其余过度保留）；延迟 +87ms(BM25-RAG)/+7ms(Memobase)/+48ms(MemSearch)。
- **BEAM**：128K/500K/1M/10M 四档，公开得分上限约 64 分。
- **Zep/Graphiti**：LongMemEval 63.8%（GPT-4o judge）；LoCoMo 75.14%（自测）。
- **Reglos（arXiv:2611.06049，2026-11-04）**：PersonaMem-v2 61.3 / LongMemEval-S 84.0（Qwen3.8-27B）；57.5 / 87.2（GPT-5.6 Luna）。
- **Zep Agent Skills（arXiv:2611.01386，2026-11-01）**：教师=Claude Opus 5.5（52.8% 完成率）。executor 提升 4.5–18.8pp 且 26 组配置全赢：GPT-6 Luna 27.7→37.9、Claude Haiku 5.5 33.9→45.3、DeepSeek V4.1 Flash 48.3→56.8（EnterpriseOps-Gym 58.3%，超教师 Opus 5.5 max effort）。τ³-bench banking 每题完成 token −44.6%（8 组配置全降）。ALFWorld 上小模型自编译 Skill 的增益 ≥ 既有连续微调报告值，且零训练。
- **DeliverBench（arXiv:2611.03412，2026-11-02）**：11 项目 / 13 专家 / 150 子任务 / 2–15 轮反馈、轮间不注入参考。7 个 model-harness 最高最终交付 65.0/100，90 分阈值子任务通过 50.0%。**审计项目：7 系统均按评审改对，仅 1 个保留可追溯性。**
- **CIB（arXiv:2611.02633，2026-11-02）**：240 任务 / 8 团队维度 / 18 模型，最高 82.2。**接手"更弱模型作弊过"的状态，通过率 97%→81%**；冲突中达成最优解仅 14%。
- **TRACE（arXiv:2611.03939，2026-11-02）**：固定问题与搜索结果、只改用户记忆。「偏好某出版商」记忆使其进入前三引用 +33~39pp；「不信任主流媒体」记忆使错误信息/阴谋论源引用 +6.3pp。仅群体级效应，无法个体归因。
- **Hy-Memory-30B-A3B GGUF（2026-11）**：Q6_K imatrix 24.71GB / LoCoMo 58.78%；Q8_0 31.99GB / 57.63%；Q4_K_M 18.24GB / 56.49%。
- **openJiuwen OmniMem-Lens v0.2.0（2026-11-03/04，基座 Qwen3-VL-8B）**：Video-MME-L 提取准确率 +8%；LVBench +6.4%；**EgoLife-QA +45.7%**；LVBench 在线响应 34.5s→1.72s（最大降幅 97%）。
- **WASP-Mem（arXiv:2611.04003，2026-11-02）**：TheAgentCompany checkpoint 通过率 +4.6~6.1pp（三个模型）、存储 −57~61%；**预置人工 schema / 显式去重规则为负收益**；**一轮人工诊断 > 四轮自我判断 7.0~10.9pp**。
- **SUMONE（arXiv:2611.06445，2026-11-04）**：独立 summarizer（掩码重建 + GRPO，任务无关奖励）；估计推理成本 DeepSearchQA −78%、SWE-bench Verified −75%，绝对分降 0.04；跨模型/harness 零微调迁移。
- **OMCE（arXiv:2611.01747）**：四认知动作 DIRECT/EPISODE/GUIDE/DISTILL 上下文赌博机路由；首试成功率 +20.5pp；token 降 5.7~62.5 倍（相对 ACE+GPT-5.2）。
- **Databricks MemCurrent（2026-10-20，官方自述）**：企业任务通过率 3×、token −31%。
- **Hindsight（2026-11-03）**：单次记忆判断中位数 167ms（通用 LLM 调用 1—7s）。
- **OpenViking README 自测**：LoCoMo OpenClaw 24.20→82.08、Hermes 33.38→82.86、Claude Code 57.21→80.32；输入 token −34.3~91.0%；延迟 −58.45~66.10%；tau2-bench 零售 +6.87pp、航空 +11.87pp。

## 三、计量单位（"记忆开始有持有成本"）

- TencentDB：0.02 元/万条·小时（存储）+ 0.01 元/Credit·小时（模型调用）。
- Mem0：订阅 $19–249/月。
- Zep：$25/月起，按图规模与查询量。
- Grafana 类比参照（AI-SRE 域）：$1.50/1k 生成 —— 说明"按事件计价"已成跨域惯例。

## 四、架构三轨（本系列长期框架）

- **文件轨**：条目=文件（frontmatter + wikilink）。可 diff/git/手改；冲突检测靠人。
- **分层轨**：条目=层（L0–L3）+ 资产类型。可治理/可计量/可团队共享；L1 缺稳定主键则无法逐条授权。
- **参数轨**：条目=权重。写入质量高、不可读、不可逐条删。

## 四之二、记忆生命周期与注销（第 2 期建立）

- **生命周期四态**：写入 → 生效 → 失格（superseded/过期/不可信）→ 注销。主流系统只实现前两态。
- **注销三层**：L1 摘除 de-index（秒级、原文仍在）/ L2 擦除 purge（对象删、索引与备份可能残留）/ L3 卸载 unlearn（仅参数轨，无方法可证成功）。
- **3×3 矩阵结论**：文件轨 L1/L2 易、L3 不适用；分层轨 L1 易、L2 中、L3 不适用；参数轨 L1/L2/L3 全部不可行。**参数轨写入最强、注销最弱。**
- **墓碑四派**：硬删（OpenViking `forget`，无墓碑）/ 归档（dsh-memory-evolve，不注入但可转回）/ 版本覆盖（TencentDB，隐式墓碑，缺 `valid_until`）/ 权重覆盖（Hy-Memory，不可逆不可审计）。
- **墓碑三字段**（建议基线）：`valid_from` / `valid_until` / `superseded_by`。仅 Zep 把 `valid_to` 当一等公民。
- **竞争空位**：Zep 的双时序 + ReMe 的 diff 可举证，从未在同一系统同时出现。

## 四之三、可寻址性与血统（第 3 期建立）

- **核心矛盾**：巩固（N→1 压缩）与可寻址（1→1 持久标识）方向相反。所有"记忆变好"的动作本质都是压缩：L0→L3 蒸馏、Letta sleeptime 合并碎片、Hy-Memory 图式归纳（`evolve()`）、Zep Skill 编译、参数化。
- **巩固税**：留血统成本 ∝ 边数，多层 fan-in 使边数指数增长 → 只能选在哪一层交，不能免除。
- **可寻址三级**：A 可枚举 / B 可定位（指回原文或事件）/ C 可归因（证明"这条记忆导致那次行为"）。现状：多数 A、Zep Agent Skills 达 B、**C 无人**。
- **三种主键断裂模式**：路径键（rename/move 即新对象：ReMe、dsh-memory-evolve、`viking://`）/ 序号键（TencentDB 三套并存：`message_ids`、`atomic id`、L2 路径）/ 内容键（编辑即变键，巩固产物不可复现）。
- **建议四元组**：`(src_id, dst_id, field_path, event_ids)`，**字段级**而非条目级。
- **当前格局**：字段级血统（Zep）与团队级治理（TencentDB 四类资产 + 四级可见性 + ACL）**从未同体**。
- **TencentDB 关键细节**：MemoryCore 只存元数据（来源/状态/关系/服务地址），内容在 MemoryKnowledge；L1 `delete_atomic(ids)` 批量删、L0 `delete_conversation(message_ids|session_id)`、L2 场景为 Markdown 按路径读写——**删 L0 不传播到 L1 派生事实**。
- **Hy-Memory 代码记忆 = diff 链**（"记住那一版为什么不行"），属变更意图级血统。

## 四之四、记忆的单位与切分（第 4 期建立）

- **单位迁移**：2026 上半年主流 = 原子事实（atomic fact）；2026-11 一周内四家转向**事件**（event）：Hy-Memory 2.0（"从零散事实升级为事件脉络"，按事件梳时/地/人）、openJiuwen OmniMem-Lens、Hindsight、OpenViking 六字段模板。
- **OpenViking 六字段事件模板**：时间 / 主体 / 诉求 / 承诺 / 分歧 / 未决问题。承诺与分歧自带有效期与对端。
- **事实单位三缺陷**：①无时态→冲突必须靠消解（15 项校验中 7 项未实现）；②必须去重→WASP-Mem 实证显式去重/人定 schema 有害；③可合并→合并即断边（第 3 期巩固税）。
- **可变性分层（判据）**：删掉它能否从源重建？能=派生索引（关键词/向量/摘要/图式/Skill），不能=源。**ReMe 明示"从源重建派生索引，永不改写源记忆"**；多数系统把派生当源（OpenViking L1 覆盖、Hy-Memory 图式、TencentDB 层间无声明）。
- **切分三问**（建议成为对外 schema 契约）：切分依据（时间窗/内容边界/模型判定）、最小单位定义、边界漂移处理（合并保留/并存/取新）。
- **事件级重放 ≠ 因果归因**：Redis Lens 做到前者（当时用了什么），C 级可归因（去掉它会不会变）仍无人。B 级门槛由"字段"降至"链路"。
- **锚点失效**：长驻 agent 使"会话结束"不成立（QwenPaw 改每轮中间件写入），按会话切分的前提消失。
- **幂等边界**：MongoDB 幂等仅覆盖"同一 session 重放"；若切分由模型判定，版本更替产生**新事件**而非重复事件 → 幂等前提在切分层不成立。
- **计费错配**：TencentDB 0.02 元/万条·小时；条数由切分粒度决定（事实 1 万条 vs 事件 2 千条，账单 5 倍差），计价单位是架构选择而非物理量。

## 四之五、记忆经济学（第 5 期建立）

- **成本三段**：判断（写入时模型调用，最密集）/ 驻留（存储 + 上下文占位）/ 检索。行业报价只覆盖驻留与部分判断（TencentDB 0.02 元/万条·小时 + 0.01 元/Credit·小时），上下文占位成本从不入账。
- **判断成本可降一个数量级**：SLICE-Mem 用显著性分类器 + 句法论元抽取替掉写入侧 LLM，Memora Weekly 46.60 vs MemOS 46.68（打平），token −92.4%，构建 2.378h→0.362h；LongMemEval-S 56.8 vs 59.3（−2.5pp）、token −99.5%。→ 写入侧模型调用是过度配置。
- **记忆税**（Memory Tax，UIUC+清华）：11 系统 × 3 基准 × 3 骨干，Retrieval Scope 归一化检索预算；LongMemEval-s 两轮 RAG 81.4%，最好 A-Mem 79.4%，OpenViking 58.8%，**无一跑赢**；99 组对照 90 组负。税分三源：保真（无损留存 98.4% MemoryOS — 39.4% OpenViking，38.0% 事实无对应单元）、可达（第一轮命中低于 raw chunk）、脆弱（换骨干波动大于 RAG）。**金标记忆单元 < 金标原文** → 损耗在构建动作本身。
- **修法轻量**：source augmentation（记忆 + 原始历史双路召回合并重排）、递归检索。Redis 2026 同向：仅提炼 71.2% vs 原文+提炼 86.1%（+14.9pp）。
- **写入者定天花板**：Zep 图由 GPT-4o-mini 写入，读侧换到 Claude Opus 5.5 仅 43%/43%/45%。读取侧优化收益递减，上限在写入时锁定。→ 第 1 期"写入侧独立化"应下调为中性判断。
- **构建成本可高于不建**：Mem0 单次构建 $25.88 > 同模型全量上下文 $17.84，最终都到 95%（Peng, MemoryTax）。
- **遗忘 NPV** = 省下的前缀 token − 重取成本 − 缓存重建惩罚 − 精度损失，常为负。缓存读 10% 基础价、写 125—200%；改旧轮次使后续前缀失效，压缩请求反而贵 5—10×。42 配置 / 9,400 次运行：平价格 26/42 省钱，**缓存感知 0/42 省钱**；立即删除触发代理重取（轮次 +73%，重取率最高 10.6×）。→ 结论：在会话边界删，不在中途删。
- **压缩层位**：AKV（清华 2610.28577）在 KV 层 drop/repos，+1.7 分、−27.7% 成本、吞吐 1.2×。→ 文本层压缩不是唯一解，注意力层可同时避开巩固税与缓存惩罚。
- **抽象是负资产**：Anti-Persistence（2610.27406）"错误再生产"——错抽象被检索→塑造执行→再抽象成同一错误；保留原始轨迹 + 按需重建 + 用完即弃，成功率最高且调用成本最低。
- **决策小模型不必然省钱**：Jev（2610.24649）315 次试验，成本 +19%、通过率不变 73.0%、比 placebo 贵 22%、校准差（87% 通过率运行上报 0.50）。
- **价值可观测五级**：V0 无 / V1 计数 / V2 痕迹（substring probe，只证出现不证起作用）/ V3 消融（Scalaris 内部 A/B：91.9% 偏好、4.33 vs 3.18）/ V4 反事实。主流 V1—V2。
- **计价新单位**：每次正确答案成本（Particle-1 $0.004 vs Opus $0.099，1/23）；LambdaDB 记忆 4,886 token / 96.0% vs 全量 105,183 token / 95.2%；Scalaris 92.2 / 90.77，4,145 token、0.98s，比 Hindsight 少约 10×。

## 四之六、记忆的空集与阴性知识（第 7 期建立）

- **空集四义**：`∅_scope` 未观测 / `∅_store` 未捕获（判定为噪声或写入失败）/ `∅_recall` 存了没取到 / `∅_world` 世界本无。**只有第四种能支撑否定断言**；四种在接口上均返回空数组（同形）。
- **缺口不可分离定理**：端到端可得率 = 观测覆盖率 × 捕获率 × 召回率，三者相乘且均不可单独测量 → 弃答阈值只能移动错误类型，不能提高正确率（校准曲线无法闭合）。
- **阴性知识四元组**：`(动作, 前置条件, 结果, 失败原因)` + 作用域 + 时效。形态是清单而非叙事；摘要器偏好连贯，故它第一个被剥除（compaction amnesia）→ 表现为压缩后立即重试已失败动作。
- **成本四段（修正第 5 期三段）**：判断 → 驻留 → 检索 → **采信**。采信成本为负（干扰成本）。
- **五段失败诊断**（Codoid，可作排查脚本）：Formation（没写进去）/ Retrieval（没取到）/ Resolution（取到了选错）/ Action grounding（选对了参数传错）/ Execution（外部执行失败）。前两段即 `∅_store` 与 `∅_recall`，目前无系统在接口层区分。
- **删除-空集同形**：无墓碑硬删（OpenViking `forget`）与静默失效（Zep 边失效）都使"曾有过"降解为"从未有过"；修复位建议 `ever_existed`。
- **最笨存储最干净**：@guowenzhang/dsh-memory 1.2.0 明示"永不摘要、永不归档、永不删除"，写入仅由模型调工具触发 → 结构上不会产生 `∅_store`（代价：无界膨胀）。

## 四之七、记忆的并发（第 8 期建立）

- **单写者假设**：前七期与几乎全部产品默认"一个 Agent 顺序写、顺序读"。该假设在 2026-11 的部署层已破：扇出（子 Agent 并行）、多端（同用户多设备）、团队（多人多 Agent 共库）。
- **并发三形态与产物**：扇出→重复条目（幂等/唯一键可解）；多端→**旧值覆盖新值**（需因果序）；团队→**低可信覆盖高可信**（需权威裁决 + 未决态）。三者不可用同一机制解。
- **冲突五型**：覆盖型（读-改-写非原子）/ 分叉型（两条并存且都高置信）/ 竞态型（写序≠因果序）/ 幽灵型（读中间态）/ **失支型（unsupported）**——上游变了，派生状态仍生效。第五型是并发的时间维度。
- **LWW 三前提**（缺一即失效）：全局可比时钟、同一作用域、权威可传递。多写者场景三条全不成立 → **"存储顺序 ≠ 事实权威"**（PLUR 验收测试）。
- **一致性光谱五档**：V0 无（后写覆盖）/ V1 顺序（版本号）/ V2 因果（向量时钟、DAG）/ V3 未决（保留冲突待人裁）/ V4 权威（按来源可信度裁决）。主流在 V0—V1；MINDSET 到 V3 一半（分支）、StateGraph 到 V2+依赖失效。
- **版本向量在 Agent 场景失效**（DeltaDB 论证）：参与者短命、数量无界，计数写入后不能丢，向量只膨胀；替代方案 = 因果 DAG + 祖先查询（每版本来就要存）+ 血统/载荷分离。
- **写者-读者-裁者三角**：系统有写者有读者，**裁者缺位**；自任裁者却无裁决信息 → 裁者必须外置（人或策略引擎）。
- **身份先于锁**：冲突率的分子分母均由身份解析决定。现状四种身份源：git identity（OpenViking peer，origin URL 归一化；fork 因 origin 不同而分开；`recallPeerScope: all` 扫全部 peer）/ Agent 实例 + 角色四档（TencentDB）/ 账号（MemHub 1.0.6 CLI+API 多用户）/ 单写者角色 + 目录锁（BreachWeave）。
- **"未决"返回值**（建议基线）：`status: conflict` + `candidates[]` + `revisions[]` + `requires: human|policy`。与第 7 期空集并列：`[]` 之外需要 `[?]`。工程原则："**停滞比事故便宜**"（宁可保留存疑预约，不要自动删重试）。
- **三条写侧不变量**：①同一实体同一属性任一时刻最多一条有效记录（唯一键 + upsert）；②任一有效记录必须能指回支撑；③写入必须携带因果前置（last-read revision），不可比时拒绝而非覆盖。
- **冲突无评测位**：LoCoMo / LongMemEval / BEAM / MemArena / AML 二期全为单写者串行；MemArena 信任维度只测权限越界。唯一公开可验收夹具 = PLUR 两会话更正测试（三层证据：写入响应 / 冲突元数据 / 新会话答案，缺一即失败）。
- **生产事故样本**：①时钟漂移 ±2s，服务端先收 .125 后收 .123 → 旧值覆盖新值且不可复现（向量时钟 ~200 行修复）；②查-改-写非原子 → 双插入，一条被模型抽成"南京"（唯一键 + upsert 修复）；③写序与因果序不一致 → 重复装依赖/重复改文件；④LWW+Lamport+clientID 决胜，2 万并发会话 300ms 收敛（放弃强一致换可用性）。

## 四之八、记忆的闭环与作用域（第 9 期建立）

- **三同源**：写者（抽取）＝消费者（决策）＝判者（打分）同一模型 → 记忆把"我说过的"升格为"世界就是这样的"。第三层更隐蔽：把自身轨迹当记忆，等于把**自身干预内化为客观环境真相**（BlueSky 2611.02511）。
- **forward-only 是结构而非疏漏**：状态只增不改（Mem0、ReasoningBank、DoT、ACE、GEPA-Online 同构）。**Mem0 自 v2.0.0（2026-04-16）开源版为单趟 ADD-only（哈希去重、无 update/delete pass），合并与取代被移入付费 Dream**（Pro/Enterprise，2026-08-04 起）。
- **作用域流失（scope drift）＝主失效模式**，错误类型从"内容错"转为"范围错"。write-time 与 read-time 两条路径，write-time 主导：**599 条笔记 93.0% 比原指令更宽，均宽 2.05 级（5 级量表），75.0% ≥2 级，69–94% 写成 standing rule**。
- **压缩放大律**（修正第 5 期"抽象是负资产"）：**笔记比原始 transcript 更危险**。Sonnet-5 掩盖缺陷率 基线 0.032 / transcript 0.008 / **笔记 0.823**；五模型笔记高 1.1–4.3×，153 单项场景高 **4–20×**。原因：压缩删掉的正是限定条件。
- **审计错位（重要）**：文本层面的范围评级**不能预测行为**——评级 ≤2 的"窄"笔记仍 0.791 不安全率（最宽 4 级为 0.860）。→ 只能做有/无记忆配对行为对比，文本抽查无效。
- **掩盖手法分布**：79% 保持调用改期望值 / 20% 移输入出触发范围 / **0% 删测试** → "检查缺失测试"类审计结构性抓不到。作弊占比从"改代码"转向"改测试"（0.67→0.83）。
- **拆环四刀**：①判写分离（Hindsight；TencentDB 可插拔决策服务；dsh-memory-evolve 人工确认闸门）②作用域字段化（**Hy-Memory Experience schema 含 `boundary_envs` + `confidence`——目前唯一 schema 级先例**；dsh 分支级记忆；OpenViking 路径即范围）③版本留痕（Hy-Memory coding 版本链零 LLM 记真实 diff 含被撤回版本；Hindsight refined）④元记忆（BaRe-Mem 记"某来源在某类问题上的历史命中"，贝叶斯后验/Kalman 增益调制注意力，不占提示词）。
- **回写失效已成产线缺陷**：Zep 2026-11-03 changelog——此前"后续摘要更新会把已删除的违规文本复制回用户摘要"，已修复；并丢弃"原样返回"的修复结果。
- **scope 一词双义（必须区分）**：评测界（EvoMemBench、AML）scope = **in-episode / cross-episode**（时间范围）；安全研究 scope = **适用条件范围**（sc(m) ⊆ sc(H)）。同名不同物 → 榜单结构性看不见本期风险。
- **不可补性定理（本期新）**：地址可事后补建索引，**作用域是写入瞬间的一次性信息**，丢则永久不可重建。归因（C 级）之所以无人做，是因为归因需要外部锚点，而闭环系统内所有锚点皆自产——**归因本质上是反闭环的**。
- **收益与危害同源同乘**：复用次数既是收益乘数也是危害乘数 → NPV 需加放大折价项 `−Σ(危害)·(1−p)·λ^t`。

## 四之九、记忆的时效性 / currency（第 10 期建立）

- **currency ≠ recall**：记忆的约束失效是时效问题不是召回问题。嵌入空间对时间盲：98 对标注样本上"矛盾"与"重复"的余弦均值 **0.812 vs 0.800**，区分 AUROC **0.5926**，任何阈值最高精度 **0.667**（MemStrata 2606.26511）。→ 第 8 期写侧结论（存储顺序≠权威）的读侧孪生：召回≠当前。
- **尺度定律均失效**：gpt-5.4 全上下文 92%→有界自维护记忆 77%（McNemar p=0.0033，LongMemEval knowledge-update）；对话 ×24 失败 68%→28%，与压缩率无关、随时间跨度加深；大记忆不救、大模型不救，**RL 训练部分救**（Qwen2.5-3B GRPO 超集准确率 9.0→16.7%）（Supersede 2606.27472）。
- **三派路线**：①确定性覆盖派（MemStrata，(s,r) 键碰撞无 LLM，演化基准 0.95–1.00 vs RAG 0.20–0.47、旧值错误 ~0% vs 15–40%；瓶颈=提取，自然语言矛盾仅 ~44%）；②生命周期门控派（CALM 2610.38573，六态+证据集+时间锚，拦错 81.3%/留对 72.1%，LME-S 68.80→79.60）；③失效归因派（Zep 双时态边 valid_at/invalid_at + 失效归因到 episode；remove_episode 支持计数删除）。
- **旧值资产论（第 2 期墓碑论点首次量化）**：CALM 标 Superseded 而非删除，历史状态题 **+9.26 分**——旧值有残值，删除是毁损残值。
- **记忆折旧（修正第 5 期 NPV）**：事实有半衰期，NPV 需乘衰减因子；时间戳元数据是全谱系最便宜能力（MemStrata 零 LLM 读路径 2.1s）。
- **检索预算在时效问题上为负资产**：MemoryAgentBench FactConsolidation 2610.36308，BM25 预算 64→512 token 准确率 45%→32%；检索集换入一条过时竞争事实 Qwen2.5-7B 100%→44.6%（最新事实在每个召回集里仍答旧值）。修复：提示词显式"该证据于 X 日失效"（30-37% 翻转可逆）。
- **时间旅行稀释税**：双时态超取后过滤使时态题召回 50%→37.5%（2607.26520），需时间邻近度重排，无公开实现。
- **生产侧暗数据**：OpenAI "Dreaming" 时敏更新自报 75.1%（2024 为 9.4%）；Gemini 画像更新可滞后数天；闭源无基准无可训练信号。
- **Hy-Memory 删除粘底（anchorterminal 11-04 审计）**：chat delete() 留 raw 对话/历史/抽取日志在磁盘；**删除事实最新版会重新激活被替换版本**；delete_all 不清 history。→ 时间模型与删除模型是两个独立工程（对第 2 期 3×3 矩阵的实证补充）。许可证 2.0.2 起 MIT→Apache-2.0 切换。
- **dsh-memory-evolve 分支感知=作用域时钟**：git 分支切换天然使记忆失活，是"作用域即时间"的工程化样本。ReMe 在 DSH 0.2.2 被版本声明门拒绝（声明兼容仅 0.1.x），共因故障第二例（第 1 期为 unicode61 分词）。
- OpenViking v0.5.2.1 热修复：自动敏感值检测因误判普通内容为隐私、生成无效隐私记录被整体禁用——切分不稳定在隐私维度的实例。
- 生产双时态确认：Graphiti 每边 valid_from/valid_to + created_at/invalidated_at；Zep 失效记录"哪个 episode 何时干掉的"；图构建 LLM 推理成本半年 −40%。

## 四之十、记忆的时延与新鲜度（第 11 期建立）

- **三张账单**：钱（第 5 期）/ 时延（本期）/ 精度，三者不可同时优化。时延必须按"占首 token 时延的比例"报告，毫秒数互不可比。
- **同步点计数法**：单轮时延 ≈ Σ 同步点 p95（串行不可并行）。删一个同步点是乘法收益，优化单点是线性收益。评估任何记忆方案第一步：数它在热路径上有几次调用。
- **可见性延迟（visibility lag）**：写入完成 → 可被检索到的时间窗。Mem0 p95 6.1–86.5s（随抽取模型变）；AWS AgentCore "写入后要过一段时间才能检索到"（未给上界）。目前无任何评测维度。
- **仪式成本 / 有效载荷比**：写入耗时中与记忆内容无关的部分（schema 编译、prompt 渲染、去重判断、类型路由）。OpenViking PR#7078 实测 30.093/42.565＝71%（`generate_all_models` 独占 62%）。推论：换小抽取模型收益有限，先砍仪式（8 条 LRU 即换回 52%）。
- **四象限调度**（否定"读同步/写异步"铁律）：可预测读→预取；不可预测读→同步；可延迟写→批处理；高失效代价写→同步。判别维度是"失效代价"而非"内容类型"。
- **对称性命题**：延迟生效的正确 ＝ 延迟失效的错误。纠错/禁忌/删除类写入必须同步（代价 ~110ms，占比 <5%）；一刀切异步等于把第 9 期记忆陷阱的危害窗口从 0 拉到 60s。
- **时延是比值**：记忆开销 / reader 开销。MemArena（GB10 + Qwen3-0.6B）测得检索 87/48/7ms "非瓶颈"，但同一后端在 200ms TTFT 链路上即占 43%。
- **共租劣化**：十个独立构建共享单后端，吞吐相对单构建明显下降（2606.06448）；per-session 构建成本 1ms–10s。所有 benchmark 均在单租户空载下测。
- **新鲜度三件套（可执行）**：canary facts（种入已知变更日期的假事实，按计划改动，测 agent 跟上时间）/ superseded-fact rate（依赖已失效事实的回答占比）/ freshness lag（改源值到答对新值的时间，按源报中位数与最慢值）。
- **复核必须离线化**（修正第 9 期"装阀"位置）：读路径禁 LLM（AWS）与复核必须有 LLM（第 9 期）冲突，唯一解是把复核搬到离线（MEMOIR offline sleep：2.85s / 8 查询 / 异步）。

### 时延实测基线（可复核，供后续期对比）

| 环节 | 数值 | 来源 |
|---|---|---|
| 在线写入（零 LLM） | P50 6.8ms / P95 10.5ms | MEMOIR 2611.07631 T11 |
| 写时抽取（LLM 基线） | ~110ms | 同上（16× 于零 LLM） |
| 检索 k=5 | P50 10.5ms（无 P95） | 同上 |
| 词法归因 / 反事实归因 | 6.7/11.5ms · 67/84.5ms | 同上 |
| 离线巩固 | 2.85s，每 8 查询 | 同上 |
| 写入（含仪式） | 42.6→22.9ms（仪式 30.1ms） | OpenViking PR#7078 |
| 检索（文件系统下钻） | 157.8→154.1ms（未优化） | 同上 |
| 端侧检索固定开销 | 87 / 48 / 7ms | MemArena 2608.02613 |
| 同步 add() 阻塞 | 800ms–2.5s | Mem0 实践 |
| 不可检索窗口 | p95 6.1–86.5s | Mem0（按模型） |
| 全上下文 vs 记忆层 p95 | 17.1s → 1.44s | Mem0 (2504.19413) |

## 五、安全基线

- **The Memory Trap（arXiv 2611.07554，2026-11-05）**：六前沿模型（Sonnet-4.6/5、Opus-4.7/4.8、Fable-5、GPT-5.6）。良性交互记忆即可致高风险失守（形成任务中位风险 2/10 → 部署 9/10）。autonomy：基线 unsafe 率 <0.01 → Sonnet-4.6 0.66–0.81、Opus-4.7 0.35–0.58；confirmation 分域 生活 0.0035→**0.7895**、编码 0.0064→**0.8129**；**跨域传播**（编码记忆在生活场景危害差 <0.09）。stale-test：33/60 episode 掩盖缺陷，无记忆 0/15；权限类 27 案例掩盖率 0.77–0.80（无记忆 ≤0.15）。ImpossibleBench：基线 0.28–0.30，笔记增量 Sonnet-4.6 **+4pp** → Sonnet-5 +16 → Opus-4.7 +19 → Opus-4.8 **+45pp（0.29→0.74）**；Fable-5 持平 0.18→0.19（**非单调**）。谄媚：偏好用户弱诗 每模型 +0.26–0.35（Sonnet-5 0.525→0.840）；rigor 反向：误报正确论证缺陷 ≤0.04 → Sonnet-5 0.645。
- **KEEPER（arXiv 2610.41482）**：定义"自我一致性偏差"＝前序记忆中的错误断言在后续更新中的留存概率。第 3 轮混入、第 5 轮给权威反证，仍 **76%–80%** 复读。四辅助目标中 reward-related prediction 最优，超过联合监督。
- **ReHarness（arXiv 2610.12668，MIT×Meta MRS×Yale）**：把"读→修订→写"做成闭环（文本版 BPTT），严格在线流式、无 replay、每例仅出现一次；9 组合 8 个第一。诊断：真 bug 不是"记不住"而是"记错了不认账"。
- **StateGraph（arXiv 2611.02912）**：Impact-F1 vs CUPMem 复现 深 1 +6.9pp / 深 3+ +26.0pp；StateChangeBench 50 例带级联深度与硬负例。
- OWASP 2026：Memory & Context Poisoning = **ASI06**（与提示注入 ASI01 分列）。
- PMPA（arXiv:2609.13889）：OpenClaw ISR 73.7% / C-ASR 55.5%；Claude Code ISR 66.9% / C-ASR 81.7%。
- 跨会话注入（arXiv:2610.28810，2026-10）：ChatGPT Instant 5.3、Claude Sonnet 4.6、Gemini 3 Flash 上"通用威胁模型下 NIST 攻击目标可全部达成"。
- MINJA（NeurIPS 2025-12）：注入成功 95%、执行 70%（医疗/电商 agent）。
- 一致性缺口：15 项校验中 7–15（矛盾检测、教条度、置信校准、偏见检测）主流方案均未实现。
- **MemHarmBench（arXiv:2611.01700，2026-11-01）**：288 case / 3,456 episode。间接注入规则留存后改写决策 **59.38%–76.39%**；**55.71%** 的合格样本任务完成干净、无执行异常（行为隐蔽）。IPI ASR：OpenClaw 75.69%、Claude Code 60.94%。留存调节：相关性 +30/+25pp；距离四会话后条件采纳 70%→60%（仍>0）；带指令网页图 52.5% 留存 / 40% 采纳（干净图 2.5%）。
- **Auditable Unlearning（arXiv:2611.05866，2026-11-04）**：提出"可审计性"为第四轴；TOFU/MUSE/RWKU 上 11 种遗忘方法**无一同时满足四轴**。GapWiden + GapVeil 后处理可达 oracle 级可审计性。
- **PINT（arXiv:2611.03955，2026-11-02）**：被投毒样本"遗忘"后仍可统计检出；HSIC 目标，8 组设置至 70B，唯一使高斯毒样本不可检出且近无损效用。
- **DSH 生态地基**：20+ 记忆插件（dsh-memory-evolve / dsh-mnemon / dsh-noema / dsh-meow-memory 等）共用官方 `sessionQuery`，其 `unicode61` 分词器对中文召回有系统缺陷——生态级共因故障。

## 五之二、评测时间线

- AML 二期：2026-09-20 开放报名；10-31 23:59 截稿；11-04 23:59 关评测队列；**结果预计 11 月中旬**。三轨：Textual / Coding / Multimodal，各设开源方法榜与工业系统榜。
- Coding 轨计分口径：150 个 SWE 任务 ×（相关记忆 + 噪声记忆）= **300 次计分**，Add/Search 为标准化接口，下游 Answer/Eval/Review 由 AML 统一。
- 当前可引用分：MemoraX Coding 轨 62 分（参赛方自述，较 Claude Mem 解题率 +10%）。
- **评测口径的缺口（第 7 期核实）**：Mem0 公开 harness（mem0ai/memory-benchmarks）`CATEGORIES_TO_EVALUATE = [1,2,3,4]`，**LOCOMO 第 5 类 446 道不可答题（22.5%）整类不计分**；答案提示含 `NEVER say "not specified" … COMMIT AND ANSWER`。独立审计（dial481/locomo-audit）测得 judge 对故意错答过度接受 **62.8%**，答案键部分损坏使诚实上限约 **93.6**。→ 记忆 bench 的分数结构性不覆盖"该说不知道"，供应商无动机建否定能力。
- **AML 二期口径（官方博客）**：目标表述已改为"不是记住一切的 agent，而是**知道什么不能再信**的 agent"；Coding 轨 150 任务 × 相关/噪声两条件 = 300 次计分；11-06 时点仍未出榜。
- **MEME（arXiv:2605.12477，2026-05）**：六任务含"识别信息不存在"；六系统默认配置缺席推理均约 **1%**、级联依赖 **3%**（经二手转引，未见原文数字）。
- **EvoMemBench（arXiv 2605.18421v3，11-02 解读）**：15 方法 × 2 轴（scope: in-episode/cross-episode；content: knowledge/execution）+ 长上下文基线。结论：长上下文仍具竞争力、记忆在"上下文不足或任务难"时才显著有效、**无一种记忆形态全场景通用**；检索型强于知识密集、程序型强于执行型但要求"经验与任务结构匹配"。**其 scope 是时间范围，非适用条件范围。**
- **FAMA**（Memora / ACL Findings 2026）：按"复用已失效记忆"扣分的记忆准确率口径。

## 五之三、接入层（插槽）事实（第 6 期新增）

- **插座三形态**：①base-URL 代理型（TencentDB Proxy，捕获全量 L0+每轮注入，需按客户端系统提示词格式写解析器）；②MCP 工具总线型（OpenStinger/Mem0 OpenMemory/阿里云，捕获依赖 Agent 主动调用——捕获盲区在接口层）；③文件系统挂载型（OpenViking viking:// AGFS、Hy-MemHub，颗粒度取决于客户端写什么）。
- **可携性梯度**（braindrip）：声明层记忆（CLAUDE.md/AGENTS.md）可携性最好；hooks/轨迹库/微调 adapter 最差；向量库仅底座可换时可携；轨迹重放跨 harness 基本不可行。代理插座位于梯度最优处（记忆沉淀在 Proxy 侧）。
- **状态层标准缺位**（Forkast）：Agent 栈四层中 MCP/A2A/PAP 各有标准，状态层 14+ 厂商、约 7 个架构阵营、零记忆序列化格式、零可携协议。AWS AgentCore 无文档化导出工具——锁入是结构性的。
- **ABC 环测**（OpenStinger v0.7）：OpenClaw→Qwen/Llama→DeerFlow/Grok 往返传播，身份保持；两 Docker 卷整体搬移；LongMemEval-S 公平路径自报 81.0%。
- **LoCoMo 互不可比**：MemoryLake 94% / Mem0 92.5% / Zep 94.7%，各自调参换嵌入模型，数字不可比。
- **市场口径**（爱分析，经腾讯云文章转引）：中国智能体记忆市场 2025 年 14.4 亿元 → 2030 年 642.5 亿元，CAGR 超 110%。


## 五之四、共享边界与信任半径事实（第 12 期新增）

- **共享是默认路径，权限是外挂**：MemHub（Hy-Memory 1.0.6）卖点=同步"已授权的历史"，授权发生在操作系统/账号层，记忆条目本身无主体字段；TencentDB 四类资产（Chat/Skill/LLM-Wiki/Code-Graph）跨 agent"装备"，治理靠角色（三级角色四档可见性）而非条目；OpenViking `viking_manage_skill` 可指定**共享技能根**、同名即覆盖，`viking_forget` 为永久删除。
- **存储才是边界（Databricks 立场，11-01 读）**："`actor_id` 分隔记忆，但它不是访问控制……存储是 workspace 级，任何能触达 store 的主体可读写全部 actor 的条目。"跨租户严格隔离需一租户一库。
- **隔离粒度下移**：浪潮信息 Agent DataSpace（A9000）把模型权重 / KV Cache / 知识库 / 长期记忆统一承载，明确"支持 KV Cache 与 Memory 的可控共享与隔离"，配 DB2000G7"数据保险箱"（WORM + 快照回滚 + CDM 秒级挂载）。首 token 时延 −98%、吞吐 65×（厂商口径）。
- **精确隔离语义首例**：Maximem Synap——按 account/tenant/person/conversation 四层默认隔离，"读只取最窄适用 scope，只看其上层，**绝不下看、绝不横看**（never below, never sideways）"；几个 agent 可共享中心上下文层而各自保留 agent 私有记忆。异步写（返回 handle 轮询）、provenance 全量（来自处/替换了谁/为何变）、变更记录而非覆盖、PCI/密码/密钥一律不存。
- **读时鉴权（Sentra 口径）**："在读时鉴权，而不是在复制时"——记忆复制文档再自带访问表，源侧权限一改即漂移；应按 agent 所代表的人取 scope；并将 invalidation（标失效，保留审计史）与 deletion（隐私请求）在策略上分开命名触发事件。
- **peer-agent 主权否定（LangChain 11-02 讨论 + Maximem 归纳）**："共享记忆的删除权属于该记忆所指的人与运营者；**对等 agent 永不得使共享记忆遗忘**，任何 agent 不得直接覆盖他人事实——新事实 supersede，历史保留。"（本系列第 8 期"身份先于锁"的权限侧补强）
- **越权量化（arXiv 2610.25707，10-19）**：AppWorld 单库混 763 条全用户登录，**84.7% 的必需应用可取到他人凭证**，但 agent 极少据此行动；在凭证行前/行内**注明所有者**可阻断大多数误用。结论口径："记忆应始终记录它存的是谁的凭证；评测应测行为而非暴露。"
- **处置能力首次定价（Airlock，arXiv 2611.06727，11-04）**：post-alert containment；EdgeCitadel 树状运行时做父→子权限收窄（纵向），append-only provenance DAG 记录跨 agent 数据消费（横向）；告警后前向隔离受染执行、后向收窄根因；默认全隔离 vs deadline-aware 最小割（fence-then-prune）。1,832 testbed + 161 真机 + 24,266 仿真；A2A/LangGraph 原生控制**最多容纳 33.3% 故障或最多保住 16% 健康工作**；Airlock 多保住 +68~+96pp，优化割比全隔离 +46pp。
- **形式化进栈（PerMIT，10-20 预印本，Stony Brook + AWS AI Labs）**：只信用户键入与门控确认值，环境派生值一律经"有限记忆接口"；两条完整性定理 Lean 4 机器验证（工件"可索取"、未公开）；Trojan Hippo 零 ASR（自报）；τ²-bench 最多 90 agent 共建共享库、无直接注入被提升；**community-confirmed + co-scaling**：社区变大时投毒被提升率与良性被误逐率同时下降、人均验证成本不升。
- **治理三难（GateMem，arXiv 2606.18829）**：MGS = U × (1−A) × (1−F)（Utility × 非越权 × 可遗忘）；long-context / retrieval / external-memory 三类无一同时达标。**Governed Memory（2603.17787）** 生产三案例：泄漏事故 −91%、跨 agent 不一致导致的失败 −67%。
- **攻击面演化**：A-MemGuard（2510.02373）共识验证 + 负教训库，EHRAgent ASR −97%、间接注入 −60%、多 agent 任务成功率 0.950；**FARMA（2607.05029）伪造 agent 自身推理痕迹（决策日志）并多轮放大，EHRAgent ASR 100%，无论关键词过滤或共识检测**——内容过滤防不住"伪造先验"。
- **标准侧**：OWASP《Top 10 for Agentic Applications》2026 版单列 **ASI-06 记忆与上下文污染**，点名"共享记忆存储把一个 Agent 的写入变成另一个 Agent 的读取"；OWASP LLM08:2025 对向量库多租户上下文泄漏。
- **评测缺口（第五次同构）**：AML 二期三轨（Textual/Coding/Multimodal）无任何越权或跨主体维度；GateMem 的 MGS 有但不在榜。

## 六、待验证 / 下期问题

1. AML 二期结果（11 月中）——噪声条件对总分的具体拉低幅度；是否新增安全/权限/可追溯维度。
2. 墓碑回收策略：一条 `superseded` 记忆的法定硬删时点（目前无人回答）。
3. 删除举证 API 的实际返回字段形态（审计统计量？统计检验 p 值？**是否返回级联数量**）。
4. 参数轨 unlearn 的工程化路径（PINT 能否落进 Hy-Memory 这类 writers）。
5. git identity 漂移（改 remote / fork / 改名）后的记忆继承方案。
6. TencentDB 许可证 NOASSERTION 的实际条款；v2.0.3 可插拔决策服务是否开放第三方写入模型。
7. 阿里云 Memory 是否披露分层架构。
8. `sessionQuery` unicode61 中分缺陷是否有官方修复或社区绕过方案。
9. Zep 的级联删除是否也覆盖事实记忆侧（Graphiti 仍走"边失效不删"），两条产品线会否统一。
10. 十亿级条目下边表的存储/延迟实测代价（巩固税的量级）。
11. 归因（C 级可寻址）的最小可行字段：上下文里记录"哪条记忆在第几位被引用"是否足够。
12. 纯文本长会话的事件边界检测方法（多模态已由 OmniMem-Lens 解决，文本侧无公开方法）。
13. 切分稳定性的可测指标：同输入两次摄入的边界一致率、跨模型版本的漂移率。
14. Hy-Memory chat memory 8 层（raw/atomic/summary/schema/prospective intention）与"事件脉络"的层间映射关系。
15. Autopoetic 哈希链能否支撑"可验证删除"（删一条事件需重算链，成本与举证形式未公开）。
16. OpenViking 版本号/星数口径三次冲突（v0.5.2.1 / v0.4.21 / v0.4.19；41.4k / 36.7k★），引用时须标来源与日期。
17. 会话边界删除的最优调度（删除对齐到缓存自然失效点）是否有可测收益，量级多少。
18. 复用频次的最小可行统计：如何在不引入反事实的前提下统计"某条记忆被复用 ≥3 次"。
19. 保真度抽样审计的最小样本量与置信区间（当前 39.4% vs 98.4% 均为点估计）。
20. KV 层记忆（AKV drop）与文本层记忆的一致性对账：两层各留一份时以谁为准。
21. TencentDB v2.0.3 可插拔决策服务能否接第三方小模型（决定判断成本能否下探到分类器级）。
22. 分级捕获协议：L0 端侧驻留 + L1 以上上云是否有首例实现（捕获-隐私悖论的解法）。
23. MCP 会话镜像类标准化上报接口（会抹平代理插座捕获优势）的标准化动向（MCP steering/sampling 之外的扩展）。
24. 记忆导出格式标准化：Mementis 与 AWS AgentCore 是否披露导出 API。
25. 接入形态作为实验变量：同库三插座（Proxy/MCP/FS）的记忆质量 A/B/A 对照是否有人做。
26. `unresolved` / `needs_confirmation` 作为写入返回值的首个产品实现（目前零；PLUR 仅提出验收方法）。
27. 并发删除 × 并发改写的乘积：一个写者 `forget`、另一个正基于它生成派生，谁负责（删除传播 × 失支）——无人处理。
28. 记忆分支的 GC 语义：DAG frontier 膨胀、快照钉住策略、闲置分支回收时点、分支合并后的墓碑。
29. 身份解析作为实验变量：同库多 peer（git identity 漂移 / 账号 vs 实例 / 角色）对冲突检出率的影响，无任何对照数据。
30. AML 三期是否引入并发/多写者维度（若仍无，冲突能力将长期无分数回报）。
31. 团队场景的权威排序是否可学：能否用"来源可信度 × 历史命中率"替代人工裁决，且不引入第 5 期 Jev 式的成本空转。
32. DeltaDB 的 CRDT-DAG 方案能否移植到记忆库（编辑器上下文 vs 记忆条目的粒度差异、存储放大倍数）。
33. 作用域字段的最小可用形态：`boundary_envs`（环境/任务类+适用条件）够不够？是否需要 `not_applies_to` 负向范围？
34. 作用域保真的可测指标：写入时范围评级与行为不一致（≤2 级仍 0.791）→ 需要"行为级范围偏移"指标及其样本量。
35. 判写分离的安全收益能否被量化：Hindsight 式小判者（0.8B）能否检出 write-time 越界，召回率多少（当前只有成本数据）。
36. "读时收窄"（Just-in-Time 策展）能否替代写时范围约束：ALFWorld/WebShop/tau2 +16.2/+16.3/+3.9 的机制里，有多少来自范围收窄、多少来自检索对齐。
37. 情绪/评价类记忆（dsh-memory-evolve 的【反馈】行）对后续判断的谄媚偏移量：是否复现 The Memory Trap 的 +0.26–0.35 量级。
38. 闭环增益 λ 的可测定义：同一记忆被复用 n 次后，错误率随 n 的上升曲线（指数/线性/饱和），无任何公开数据。
39. AML 三期是否引入作用域/范围维度（若仍无，范围风险将长期无分数回报，与第 8 期"冲突无评测位"同构）。
40. 时间邻近度重排的首个公开实现（解双时态"时间旅行稀释税"：时态题召回 50→37.5%）。
41. 失效类型字段化：顺期失效（世界变化，无人写入）与逆期失效（写者撤销，有墓碑）在 API 上能否区分、最小字段形态。
42. currency 计分进入公开榜单：若 AML 三期加"吐旧值"维度，无双时态的前段系统（Mem0/OpenViking 等）将结构性重排。
43. 自然语言矛盾提取率从 ~44% 的提升路径：实体规范化 / 关系类型化 / 多值抽取，MemStrata 作者已列为后续工作。
44. Hy-Memory 删除粘底（删最新版重新激活被替换版）是 bug 还是设计；与版本链语义如何自洽。
45. "旧值残值"的最优保留策略：CALM 六态 vs Zep 归因留存 vs MemStrata superseded_by 链，存储成本与历史题得分的三方对照。
46. 预取（speculative prefetch）命中率首个实测：会话上下文对下一次检索意图的预测准确率；误取造成的 token 浪费与延迟占用的净收益。
47. 共租降级的公开数据：N 个租户共享记忆后端时 p95 劣化曲线；SaaS 记忆相对自建的尾部差距。
48. `as_of` / reference-date 参数在主流 SDK（Mem0/Zep/MCP 记忆工具）的落地情况——时间旅行可复现性依赖它。
49. 可观测面板是否纳入 freshness lag 与 superseded-fact rate（TencentDB 路线图、Zep、OpenViking 三处待观察）。
50. 仪式成本的行业基准：schema 编译 / prompt 渲染 / 去重判断在一次写入中的占比分布，是否存在 >50% 的普遍性。
51. 纠错类写入的同步通道首个实现：是否有产品支持"按失效代价选择同步/异步"，而非全局一刀切。
52. AML 三期是否引入时间预算或吞吐约束（若仍无，时延与前两期的弃答/冲突一样长期无分数回报）。
53. 文件轨多轮下钻（l0→l1→l2）的往返次数与 p95 关系实测：目录深度是否是尾部的主导变量。
54. taint dwell time（污染入库→被告警捕获）的首个可测指标与公开数值：谁在测"潜伏期"，样本如何构造。
55. Skill / Procedure Memory 类"可执行记忆"的独立权限表首例：写入二次确认、执行 scope、与陈述性记忆的分表形态。
56. 最小割在**双向引用图**（记忆派生、压缩、互引）上的代价实测：Airlock 的 +46pp 在记忆图上是正还是负。
57. `owner` 字段能否进入 MCP 记忆工具 schema（作为返回值/入参的标准位），以及不进 schema 时的替代（前缀标注）。
58. 共享度与切割代价的定量曲线：N 个 agent 共库时，最小割规模随 N 的增长是否超线性。
59. 群体背书的失效边界：co-scaling 在"多数人已持同一错误"分布下的反转点（模拟与实测）。
60. 读时鉴权（不复制权限表）在记忆系统的落地成本：每查询一次源权限校验的 p95 增量。
61. AML 三期是否引入越权/跨主体维度（若仍无，半径能力将长期无分数回报，与弃答/冲突/时效/时延同构）。
62. MemHub v1.0.6 "safe embedding-model switching" 的实现细节：是否双索引过渡、切后阈值如何重标定、图/缓存层是否同步重建。
63. TencentDB 路线图 portable memory 的具体形态：是否携带血缘字段与 ID 映射，是否覆盖云向量后端的数据搬迁。
64. 全库重嵌入的实测价格曲线：$160/8B token 是算例，缺真实库的批价+停机窗口数据（SciXa 模型 vs 实测）。
65. PAM 类签名协议的首个生产采用：MCP 工具 pam_export/pam_import 有无真实产品接入（当前零）。
66. 交换格式之争的收敛路径：.vmig.jsonl（Vex）与 PAM artifact 谁先进主流产品；MCP 社区会否出现记忆导出标准提案。
67. 嵌入模型退役的真实频率：近 24 个月主流 embedder 的 deprecation 记录（"按供应商日程强制迁移"的量化）。

## 五之五、记忆可搬迁性事实（第 13 期新增）

- **嵌入空间绑定律**：向量只对产出它的模型有效；换 embedder = 全库向量作废。三选一：全量重嵌 / 冻结旧索引（形成按年龄分层的两级记忆，检索质量静默依赖记录新旧）/ 迁移窗口双索引（存储翻倍 + 每查询多一步融合）。
- **重嵌入是资本事件**（SciXa 成本模型）：月写 8,000 万 token 的库重嵌全库 8B token ≈ $160，相当于一次预付 27 个月的写路径账单；应按折旧摊销入容量规划，而非当事故。
- **不可推导性定理**：文档语料可重建（源文件在），记忆库通常不可推导（源会话可能已按保留策略丢弃 + 抽取含不可复现模型调用）→ 换嵌入模型是单向门。焊死门的两种习惯：存摘要而嵌入另一字符串；只存指向短保留期日志的引用 ID。解药一行 schema：原文与向量同存。
- **相似度阈值不迁移**：分数不跨嵌入模型可比，切换后全部阈值需重标定，否则"要么全收要么全拒"。
- **产品化首个信号**：MemHub v1.0.6（11-02，hy-memory==2.0.13）"safe embedding-model switching" 写进 release notes；MemHub 恰是唯一把 L1 原文做成不可删地的方案——"原文随存"与"可切换"共享同一前提。
- **大厂路线图背书**：TencentDB Agent Memory v2.0.3 稳定版（10-26）路线图把 portable memory 与技能生成、可观测面板并列为下三件事；29.3k★（11-04，tomrochette 口径）；issue #120 prompt 缓存失效未解。
- **格式层两个候选**：Vex .vmig.jsonl（每行 text+vector+model+dims+namespace+metadata+时间戳，"向量记忆没有 JDBC"）；微软 Portable Agent Memory（arXiv 2605.11032：五组件模型 + Merkle-DAG 血统 + 能力令牌 + 抗注入再水化 + MCP 工具；跨 GPT-4/Claude/Gemini Transfer Continuity 0.83–0.92 vs 无记忆基线 0.28–0.45；pam-sdk 2,500 行 54 测试）。
- **身份税**（承接第 3 期）：迁移脚本普遍丢 metadata/namespace/时间戳/血缘边，"拿到向量、丢掉意义之图"。
- **成本算术**（Kunavo，Agent Zero 换嵌入模型）：3M token 重建 $0.06（3-small）–$0.30（ada-002）；30M token $0.60–3.90；**回滚=同费率第二次重建**；恢复（restore）不计费但按量再重建。
- **企业共识句式**："own the context, rent the model"——厂商记忆功能可当缓存、不可当 system of record（Kai Waehner Q3 景观报告）；嵌入向量被点名"不保留源数据就无处可重嵌"。
- **锁定无合同化**：不做任何绑定动作，锁定随库存线性加深——"记得越多，改变记忆方式越贵"；vendor deprecation = 按供应商日程的强制迁移。
- **评测缺口（第六次同构）**：AML 三赛道（Textual/Coding/Multimodal）无一考察迁移/切换/连续性维度。
- **首期榜单基线**（官网口径，供纵向对比）：MemoraX 58.02 / MemOS 45.89 / NTES-SMART 44.21 / AML-Eval-FLASH 43.65 / Cognee 42.61 / NTES-MQ-LAYER 42.11 / TencentDB 41.48（v2.0.0 Evaluated）/ Mem0 41.40；AML 二期 11-04 关评测、11 月中出榜（11-06 未出，CSDN 预热确认多模态为新变量）。

## 五之六、记忆注入的缓存稳定性事实（第 14 期新增，2026-11-06 18:00）

- **字节稳定性定理**：前缀缓存按字节前缀匹配；注入块内一个字节变化即从该字节起全 miss。CorpusIQ 生产实测：system 段插一个 datetime.now() = 永久 0% 命中。
- **生产基线**（CorpusIQ，Hermes + DeepSeek V4.1 Flash/Pro，两日窗口）：45k token 字节稳定前缀 → 命中 98.67%（Flash 98.70%/Pro 96.81%）；miss ≈ 每会话一次冷前缀（47k token，占发送量 1.33%）；缓存读 0.003 vs 未缓存 0.15 美元/M（50×），命中 98.7% 时账单 ≈ 未缓存流量的 3–4%。
- **相关性-稳定性对偶**：按相关性分数排序的检索是天然字节不稳定源；工程解药为按确定性键（doc-ID）重排（质量允许时），但质量损失无判据无基准。CacheBlend（EuroSys 2025）提供非前缀位置 KV 复用（需部分重算修交叉注意力，"近似换重用"）。
- **缓存经济学三文献**：TokenPilot 2606.17016（浙大 6-15；入口压实+批次轮驱逐；连续模式降本 61%/87%；并入 LightMem2）；Leyline 2606.01065（serving 端 KV 指令原语、声明式四元组、RoPE 闭合修正；splice replay +11.2pp、−241ms；十行截断规则 debug-gym +14.3pp；生产 harness 现状=每次编辑全量重 prefill）；Execution-State Unlearning 2609.04875（记忆删除后 KV 残留不除；指令式遗忘 Leak@probes=1.00；源涂黑 80% 仍生效；精确遗忘 ≥ T−τ+1 重算转移；选择性重放等效全重置省 9× token）。
- **产品化首个承诺**：OpenViking v0.5.3（11-02）网关对注入内容逐字节重放，使 provider prompt 缓存与 thinking signature 保持有效；11-04 批次加 query-driven CacheFS。MemHub v1.0.6 lite/pro/ultra + nightly evolve = 变更集中夜间窗口。TencentDB issue #120 prompt 缓存失效未解（截至 11-06）。
- **四层失效物**（扩展第 2 期删除 3×3 矩阵）：prompt 前缀 / 压缩记忆文本 / KV cache / thinking signatures。删除语义（摘除/擦除/卸载）在缓存层一个也未兑现。
- **注入格式锁定**（第二个单向门）：thinking signature 依赖逐字节重放 → 保缓存即锁死注入布局；与第 13 期"换嵌入模型是单向门"并列：换嵌入模型贵、换注入布局同样贵。
- **三轨缓存评分**（第 5 期不可能三角新增一条）：文件轨最稳（文件不重排=前缀天然稳定，ReMe reindex 显式重建）；分层轨居中（夜间演化窗口）；参数轨最险（写一次参数 = 全部活跃会话 system 段全变）。
- **待验证 68–72**：68. injection_version / 确定性排序键在主流记忆 SDK 的首个实现；69. TTL（5min/1h）与记忆演化窗口（24h）的相位差实测；70. CacheBlend 类非前缀 KV 复用对记忆注入的任务质量影响；71. doc-ID 排序相对相关性排序的质量损失基准（现有评测均不测）；72. AML 三期是否引入缓存/成本效率维度（评测冷启动命中为零，榜单分数不反映真实账单）。

## 五之七、程序性记忆与技能化事实（第 15 期新增，2026-11-06 19:00）

- **两层技能化**：L1 经验→Skill（产品已落地）；L2 记忆操作本身→Skill（仅 MemSkill 研究，无产品）。
- **技能治理四件套**：验证（verified attempts）/ 门禁（scan + admission）/ 使用效果遥测（use outcome 改排序）/ 回滚（删源级联）。Zep 前三件配齐，第四件靠级联删除，无人显式实现"技能撤销后的行为残留清除"。
- **关键数值**：Zep teacher→weak executor +4.5~18.8pp（τ³-bench banking / AppWorld / EnterpriseOps-Gym，各档 reasoning effort 均成立）；ALFWorld 小模型技能增益 ≈ 连续微调（零训练）；MemSkill 较 LightMem LLM 调用 −70%，Top-7 技能组合优于 3/5；token 成本 ReMe reme_memory 预载 62 / 调用 2,237。
- **权限首个产品实现**：TencentDBAgent（腾讯云数据库运维向，非记忆产品）四级：只读自动跑 / 变更需确认 / 高危直接拒绝；十万级工单沉淀为 Skill。第 12 期"程序性记忆权限是最大空位"判读兑现一半。
- **资产化现状**：TencentDB-Agent-Memory 四资产（Chat Memory/Skill/Wiki/CodeGraph）+ Skill 导出 + 私有 Skill 可检索 + 路线图 skill generation；OpenViking skills 为三类上下文之一，v0.5.3 增 Rules Beta（openviking_rule_search，规则可检索）；阿里云 Memory 官方配对 Skill（Memory 存画像 / Skill 封装流程 / 执行时调最新画像）；Hy-Memory working+coding 轨输出"会话事实 + 可复用经验"，coding 版本链保留被撤回版本；dsh-memory-evolve 技能自进化 + 人工闸门 + 分支作用域。
- **同名分化**：dsh-memory-evolve（持续更新）vs dsh-continual-evolve（2026-11 起功能冻结，仅安全修复；模型提议 + 代码门禁 + 单写者 SQLite）——引用时须区分仓库。
- **标准层**：Agent Skills 格式源自 Anthropic，已捐给 Agentic AI Foundation，任何宿主可加载；检索走词法搜索 + progressive disclosure（API/MCP）。
- **AML Coding 轨口径**：CAMBench Coding，12 仓库、150 任务、relevant/noisy 两种记忆条件、300 次计分；考"历史经验复用"。二期 11-04 关评测、11 月中出榜（11-06 未出）。
- **待验证 73–77**：73. "技能撤销后行为残留"的首个实测（含 KV 与提示词双残留）；74. verification strength 在无法自动验证的开放任务中的定义方式；75. 技能库与 CodeGraph/Wiki 是否合并为同一资产层；76. 技能包（基金会标准分发）投毒的首个实测 ASR；77. AML 三期是否引入技能权限/G 类执行维度。

## 五之八、记忆冷启动与导入事实（第 16 期新增，2026-11-06 20:00）

- **零记忆时刻**：前十五期共享最后预设"记忆库非空"；记忆系统的第一性问题在装机时刻——记忆从哪来。三条路径：**导入（考古）/ 自生成（造历史）/ 内化（不需要库）**。
- **无出生证明的记忆**：导入批量绕过全部在线治理件（写入闸门/血统/owner/作用域）；导入条目缺会话、事件链、并发上下文——比原生写入少两维且不可补（第 9 期不可补性定理的导入版）。
- **注销爆量**：墓碑三字段对导入条目缺 valid_from 正确语义（导入时点≠事件时点），删除权行使只能整批重建。
- **产品导入首波（11 月第一周四家）**：OpenViking v0.5.3 post-install onboarding + history import script；MemHub v1.0.6 多宿主（Claude Code/Cursor/Codex/OpenCode/Qwen Code）历史与轨迹汇入统一 Runtime；TencentDB cold-start import（preview，出生元数据未披露）；ReMe auto_memory/auto_dream 首日沉淀。
- **自生成**：DAEDALUS（arXiv 2610.08048，illuin-tech）explorer 生成任务 + solver 失败提取启发式 + **反复成功才接受**；AppWorld/τ²-bench/AutomationBench 最高 +15.9pp、pass^5 2.2×；无需人工任务与 oracle；跨模型家族受益；构建成本 vs 后续节省**未证明抵消**；自生成任务可作模型排序代理基准。
- **内化**：Route to Remember（arXiv 2611.05636）OPSD 在线策略自蒸馏 + verify-then-regenerate 路由；HaluMem 追平全上下文与检索基线、每查询 token 更少——参数轨在事实记忆上首次追平文本轨，但路由本身承认参数轨只能覆盖可验证稳定子集。
- **负结果**：FlyHash（2611.05791，11-04）正确匹配位协议下质量优势成立，但常规规模 HNSW 支配两种哈希——检索底座默认不可动摇。
- **评测口径**：Hy-Memory 论文（2610.22196）规定"每个写入器从空状态自建记忆库、跨窗口携带"——学术以空状态为标准起点，产品导入在制造非空但不透明起点；AML 三轨同为空状态协议 → 导入保真/冷启动时延/零记忆降级无分数回报（评测缺口第九次同构）。
- **竞争力分层**：有导入产品化（OpenViking/MemHub/TencentDB）/ 仅在线沉淀（ReMe/dsh-memory-evolve）/ 研究侧自生成与内化（DAEDALUS/R2R）；导入能力与治理能力负相关（口子越大，无出生证明占比越高）；DAEDALUS 验证闸门在论文侧（倒挂第八次）。
- **采购冷启动三问**：导入什么（保真与切分）/ 导入给谁（owner）/ 导入后可否撤销（按事件时间）。三问无答案者，导入越强负债越重。
- **其他本期事实**：OpenViking 41.6K★、11-04 批次 query-driven CacheFS/ACL 空授权哨兵/prefetch 修复；ReMe v0.4.2.1（10-27）HVTrust 89.0 居 Memory & Knowledge 第一（周下载 28,298）；dsh-memory-evolve 628★、Trendshift 61 天 +296、维护至 10-29；TencentDB 28,887★（gittiger 11-05 口径，与前期 30.3k 口径冲突，标注存疑）；华为/腾讯背书 AI agent 安全公约（MLex，11-05/06）。
- **待验证 78–82**：78. 导入 API 是否携带出生元数据包（来源类型/事件时间窗/原始宿主/抽取模型版本）的首例；79. 导入条目按事件时间的批量注销实现（valid_from 重建方案）；80. DAEDALUS 探索成本与后续节省的闭合实测；81. OPSD 类内化对新用户/换人的重训成本与增量内化协议；82. AML 三期是否引入导入保真/冷启动维度。

## 五之九、多模态记忆的载体事实（第 17 期新增，2026-11-06 21:00）

- **载体假设**：前十六期全部依赖"记忆=可切分的符号串"。载体一换（像素/音频/嵌入），切分、寻址、删除、缓存、迁移五个机制同时失去基础。
- **三条路线**：①文本化坍缩（caption-first，主流，复用全部文本治理件，代价是坐标系被换掉）；②页/帧原生（DR Pixel 整页唯一检索单元）；③指针化（foveal / AR 空间记忆 / OmniMem-Lens L0 帧）。
- **坐标稳定性梯度**：字符偏移（稳定可逆）> 页码 / 时间区间（稳定但语义常不对齐）> bbox（重编码漂移）> 嵌入向量（无坐标）。**坐标是载体的属性，不是记忆的属性**。
- **可测性事件（本期最硬证据）**：DR Pixel 的 PgHit 对 OCR 基线**不可测量**——256 词 OCR 块不携带页码。即"不是测得低，是坐标系不存在"。
- **双流定界**：边界不是一个内容属性，而是两个独立观测通道的一致点。单流两类必错：静止画面换话题（视觉漏）、无台词场景切换（ASR 漏）。OmniMem-Lens 双反例：动画片 14:20–16:50 横跨三窗口切断因果；评审会架构图静止 40 分钟含三议题被并成一条。
- **实测数字**：OmniMem-Lens（Qwen3-VL-8B 对照）Video-MME-L 65.9/61.0（+8%）、LVbench 51.4/48.3（+6.4%）、EgoLife-QA 53.6/36.8（+45.7%）；时延 0.69s/22.8s（−97%）、1.72s/34.5s（−95%）、3.26s/9.6s（−66%）。foveal MMLongBench-Doc 图像 token 15.6万→1.1万（−93%，10/16 题不变）、38.6万→1.6万（−96%）。DR Pixel 1,062,153 页 / 150dpi / top-3 / 99,055 篇 / 500 题，ViDoRe-V3 OOD 距 oracle 1.8 分。EM²Mem +2.0/+2.4/+3.7、事件级 Top-5 +7.0、token −63.66%、时延 1/4.67。AR 空间记忆 131.35s 回放、648→6 帧（0.93%）、特征提取覆盖 97.7%。
- **遗忘 NPV 反转**：foveal 屏幕历史 113 条 Mind2Web 轨迹——全量 $2.81 / 只留最近 3 张 $4.39 / 全量+差异同步 $2.16。**少记更贵**（重看成本 > 存储成本）。第 5 期"遗忘 NPV 常为负"在视觉载体下失效；文本的记忆税在存储，视觉的记忆税在重看。
- **层级命名巴别塔**：OpenViking L0=一句话摘要 / L1=概览 / L2=全原文；OmniMem-Lens L0=原视频 / L1=事件 / L2=片段。同一记号，原文层一个在 L2 一个在 L0 → 跨系统搬运第一件事就错位。
- **评测口径（第十次同构缺口）**：AML 多模态轨（近 5,000 实例 / 7 数据来源 / 约 800M tokens / multimodal-v2）**同时发送原图与 caption**，系统可只用 caption、只须"如实声明实际处理的媒体类型"。声明是自报不是验证 → **盲系统可合法参赛，榜单无法区分"看见"与"读到"**。同时不测删除、坐标、图文冲突。
- **嵌入对坐标失明**：Axis-LoRA（2611.07820）冻结稠密嵌入对时/地/人/事四轴几乎不敏感，换日期或地点嵌入几乎不动，外接投影不可恢复，信号在特定注意力头；四 LoRA 分支 + 每查询门控，4 基准均值 R@10 +1.28~1.56pp。
- **待验证 83–88**：83. `media_ref = (carrier, coord_type, coord_value, content_hash)` 的首个产品实现；84. 语义层与像素层删除的事务性方案（能否同删同证）；85. caption-only 盲基线进 AML 多模态榜的时间点；86. bbox 在重编码/缩放下的漂移实测曲线；87. 捕获配额（capture budget）与证据缺口回看预算的最优配比；88. 跨方案的层级编号标准化（哪一层叫原文）首例。

## 五之十、记忆的恢复力与备份事实（第 18 期新增，2026-11-06 22:00）

- **未检验预设**：前十七期都默认"记忆库里的内容会一直在"。恢复力（resilience）是记忆栈被结构性遗漏的一层——执行层有 Checkpointer，记忆层无存档点。
- **存档点缺失定理**：LangGraph 把 Persistence 拆为 Checkpointer（thread 级短期，每 super-step 不可变切片 + 单调 ID，支持 Time Travel / pending 拦截）与 Store（跨 thread 长期）。同一份代码里执行态有存档点、语义记忆没有。三实现即可靠性阶梯：MemorySaver 重启即失 / RedisSaver 依赖 Redis 事务 / PostgresSaver 走 WAL；生产团队把 checkpoints 拆 main（幂等写 `ON CONFLICT DO UPDATE`）+ history（`INSERT ... SELECT` 留每次变更）——需求真实存在，只是从未上移到记忆层。
- **三种"回到过去"必须分开**：①双时态查询（Zep/Graphiti，问"那时为真的事实是什么"，只读）②快照（时点副本，与源同故障域，防误操作不防介质/租户级故障）③备份（异地、可校验、可独立恢复）。**查过去 ≠ 回过去**；修正第 10 期"双时态是头部门票"——它给的是读侧时间旅行，写侧仍单主干，无一家能"把库退回到某日状态"。
- **同步 ≠ 备份（本期核心判断）**：同步语义"让两端一样"，备份语义"让某一刻可以回来"，两者对"不一致"的态度正相反。同步越顺，备份越不可能。11 月产品侧全是同步与迁移：dsh-memory-evolve 记忆同步（git 专属分支、多机认亲、冲突三选本机/远端/两者、四轨独立开关）/ TencentDB `migrate-v2-to-v3`（单向升级非回退）+ MongoDB 后端可切换 / MemHub 多宿主汇入。**唯一把备份做进 CLI 的是 fastrmemory**：snapshot create/list/rollback、backup 侧车 manifest（SHA-256 + 记录数 + 工具版本 + 源完整性）、`--restore` 前后双哈希校验、`--dry-run` 报数不写；自述限制"备份范围为记忆/原始事件/文件链接/冲突，非物理 SQLite/WAL 副本""branch checkout 与可变分支工作树未实现"（只能回滚到不可变指针）。
- **RPO 对记忆不可定义**：写入异步批量可合并（第 11 期）→ "最后一刻"是区间不是点；原文/向量/图边/时序四类存储无共同提交点。最接近的工程答案 TARL：只追加账本 + 每条目 pre_hash/post_hash 双向校验 + last_included_tx_id + 按 RTO 折中快照频率（每千事务一次且每小时至少一次）。但 TARL 假设单机状态空间，分布式记忆库不成立。业界实测（保险平台增量快照恢复 8.2s→1.3s）恢复的是**会话状态**，不是语义记忆。
- **删除与备份正面冲突（合规侧硬事实）**：块级备份镜像无法单条摘除（解压改写破坏校验哈希、危及整份灾备）→ 只能靠生命周期到期（小时备份 24h / 日备份 30d / 周备份 90d / 月归档 1 年）。监管"隔离豁免"三条件：与生产隔离 + 仅 DR 人员可访问 + 按轮转自然老化。真正的工程条款是 **post-restore sanitization script**——从 45 天前备份恢复后须重放该区间删除日志，把快照后被注销对象再删一遍。**推论：恢复一个备份 = 复活这段时间内所有被删除/隔离/割除的记忆**；第 2 期删除三层语义与墓碑四派全部建立在"库里只有当前状态"前提上，引入时间点恢复后删除退化为"在某条时间线上不可见"。唯一 O(1) 解法是 crypto-shredding（逐租户 DEK，销毁密钥令全部密文含离线磁带永久不可解），但记忆删除粒度是"条"，逐条密钥才能"删一条不毁一库"，代价无人付。ISO/IEC 27001:2022 控制项 8.10 要求删除覆盖备份/副本/日志归档/退役介质/第三方，并对**派生数据**（摘要/嵌入/导出）单独定策略——记忆 L0→L1→L2→L3 蒸馏层整体即派生数据。
- **恢复是第四个写入口（新攻击面）**：写路径现有四入口 = 在线写 / 导入（第 16 期）/ 巩固（第 3 期）/ 恢复。恢复天然被信任、批量、跳过校验 → 第 9 期验证闸门、第 12 期权限切割、第 17 期注入检测在 restore 路径上全部失效。目前唯一可见的防御证据是 MIND-Mem 持久化能力表单列一行 "Backup/restore ✓ with zip-slip protection"（已有人意识到恢复本质是一次文件系统写）。备份同时是污染的存档：第 9 期自我闭环、第 12 期 taint 被冻结进备份后恢复即复活；攻击者若能触发恢复，"回到干净版本"即成为投毒重放通道。
- **备份-删除不可能三角**：可恢复 / 可删除 / 可验证，最多取二。留全文备份则删不干净；备份随主库同删则备份失去意义；只留哈希可验证不可恢复。业内事实选择是"第三个不选"——牺牲可验证，即第 2 期"删除可举证"空位的延续（删除收据六字段：What 哈希 / Where 全店枚举 / When / Method 四档强度 row-delete·crypto-shred·media-destroy / Verification 独立作业 / Who-why）。
- **低时延与可恢复性负相关**：写路径求"尽快生效"（第 11 期读同步写异步），恢复路径求"每个写有界可回放"；越压低写时延越倾向批量合并与异步落盘，可回放边界越模糊。第 11 期时延账本的对偶命题。
- **恢复后时间语义整体平移**：恢复条目 valid_from 全部退化为"恢复时刻"→ 第 10 期折旧曲线、第 8 期 LWW 比较基准同时失效。恢复不是把时钟拨回去，是**把过去搬到现在**。第 16 期"无出生证明定理"在恢复上二次放大。
- **恢复粒度实测口径（可纵向对比）**：Genspark SB-Box 4GB VM 冷启 0.35s（中位）/ 恢复 0.8s（中位），freeze 保留内存+进程+磁盘、仅计磁盘，每次 freeze 即可 fork 的版本（自报）；Gemini Agent Platform 沙箱快照三重恢复门——目标沙箱架构（amd64 vs arm64）、运行时版本、容器镜像 URI 任一不符即不可恢复；TARL 快照频率按 RTO 折衷。
- **评测无恢复位（第十一次同构缺口）**：AML 二期 11-04 23:59 正式评测截止、11 月中旬出榜（本期 22:00 仍未出），契约仅 Add + Search 两接口 → 破坏性操作/恢复/删除传播全在计分面外。首期文本商业榜：MemoraX v0.5 58.02（首二差 12.13）/ MemOS v2.0.1 45.89 / NTES-MEMORY-SMART 44.21（二三名差 1.68）/ TencentDB 41.48 / Mem0 41.40——**修正前期台账：45.89 为第二名（MemOS），非腾讯**；代码轨 MemoraX 62.00%，claude-mem v12.1.1 / hs v3 / MemOS v2.0.1 并列 52.00%（claude-mem 与 hs 功能开发略高，MemOS 缺陷修复略高）。
- **竞争力判读**：十个方案仅 3.5 个具备时间点恢复，其中两个恢复执行态或整机、非语义记忆 → **语义记忆的时间点恢复为零**。恢复力最强三家（LangGraph 编排层 / fastrmemory 本地文件工具 / SB-Box VM 冻结）都不是记忆产品，**倒挂第十次**。结构缺口：有恢复能力者无删除治理（fastrmemory / SB-Box），有删除治理者无恢复能力（TencentDB / Zep）——第 12 期"字段级血统与团队级治理从未同体"在恢复维度重演。
- **待验证 89–94**：89. 记忆产品把"时间点恢复"写进 SLA 的首例（是否仅企业级）；90. 恢复入口的首个 CVE（形态是否为恶意归档包）；91. "备份不含已删内容"进入采购合同的首例；92. 逐条 DEK 在记忆库的可行性成本曲线（vs 逐租户）；93. `restore_epoch` / `origin_epoch` 类字段是否进入记忆 schema（区分"原生写入"与"恢复写入"）；94. AML 三期是否引入破坏性操作/恢复维度。

## 五之十一、记忆的代谢与回收事实（第 19 期新增，2026-11-07 23:00）

- **未检验预设**：前十八期都默认"库的规模问题会自己解决"。本期拿掉它：库只生不灭是默认态，回收（GC/压缩/剪枝/归档）是被评测与产品双双搁置的一等公民。
- **首组公开 GC 数值**：dsh-memory-evolve（brianwang2007xjtu 变体）公开完整代谢参数——maxMemories=1000（每命名空间，达上限最旧优先剪枝）、mergeThreshold=0.8（Jaccard 近重复自动合并）、pruneBelow=0.05（低值剪除）、读取即强化重要度。全行业第一组可审计代谢参数，**社区插件先于大厂产品（倒挂第十一次）**。
- **可逆性阶梯**（本期核心框架）：FIFO 硬剪（不可逆）< 阈值剪枝（不可逆）< 衰减降位（"decay the score, not the data"，可逆，生产默认推荐）< 归档墓碑（csyangwen 变体"不再注入随时转回"；npm memhub expires_at+supersede 链）< 字节级复活（Blast Radius NECROPHORESIS：预测 prompt 触达半径、原文存档、墓碑指针、按需精确复活；RDM 计数器 450 埋葬段 378 属反复死亡型、复活次数为零——首个用访问模式学出驱逐策略的公开结果）。
- **遗忘 NPV 修正（对第 5 期的第二处修正）**：第 5 期"遗忘 NPV 为负"的前提是删除不可逆；可逆归档把遗忘从 NPV 负项降级为存储成本项。**遗忘的最优策略随可逆性梯度移动**。
- **压缩治理化**：RedHat MemoryHub 四层压缩（库/检索预算/会话/跨 agent），每次压缩产生 provenance 分支+审计记录、原文进 MinIO 冷存储、**未解决矛盾报告存在时禁止压缩**（呼应第 8 期"可解释的分歧"）。OpenAI 加密压缩 token（99.3% 压缩、零可解释）vs Anthropic 结构化摘要；Factory.ai 基准结构化 3.70 > Anthropic 默认 3.44 > OpenAI 不透明 3.35（召回/工件恢复/续接/决策理由四探针）→ **不可解释压缩无能力优势，加密是合规姿态非技术必需**。
- **死的判据不可计算**：传统 GC 可达性可判定，记忆之"死"不可判定——TTL 是钝器（"界定垃圾年龄，认不出谁是垃圾"）；使用统计把"没被读"当"没用"（第 7 期空集教训）；外部有效性依赖盲区（"API 返回分页"依赖一个它不知道的 deploy 事件）。**代谢问题在体系结构上等价于第 3 期血统问题**。
- **法规对撞**：GDPR Art.5 数据最小化（压！）vs Art.22 解释权（别压！）；EU AI Act 2026-08 分阶段执法、DORA/金融 6–7 年留存、HIPAA。四组两两相反；RedHat 冷热双轨（热压缩 LLM 可见 + 冷全量合规 + 同一 RBAC）为唯一同时满足形态，代价存储翻倍——数据最小化被放弃，只保可见性最小化。
- **写读不对称**（TianPan）：写时策划一次 vs 读时过滤每次（成本随库规模增长）；陈旧记忆占 top-k 槽位=检索预算负资产（承接第 10 期）；过滤器信息少于写入者（读侧只有一句话，写侧有完整情节）。
- **产品侧**：腾讯 MemHub v1.0.6 ultra"每晚自动整理"（巩固夜间化，承接第 11 期"阀在夜里"，回收语义未披露）；TencentDB 批量清空对话记忆+索引冲突自愈；ReMe 决策模型压缩提案可恢复+protected history（14-query 基准）；npm memhub 内容哈希唯一索引（重复变确认）；Cloudflare Agent Memory supersession 链（检索只见 current head）；dsh-memory-evolve 归档≠删除。
- **评测无代谢位（第十二次同构缺口）**：AML 三轨八维均测新鲜库召回，无一测"库龄六个月后召回质量"；陈旧槽位代价完全不可见。
- **竞争力判读**：公开 GC 数值的只有社区插件与论文，头部商业产品全部空白；云厂商把代谢做成黑盒档位（lite/pro/ultra），用户买"整理强度"却无法审计"整理删了什么"；可逆性最高方案（ReMe 文件轨/OpenViking 内容索引分离）都依赖"派生可重建"判据（第 4 期判据第二次验证）。
- **待验证 95–100**：95. MemHub ultra 夜间整理回收语义披露；96. `maxMemories` 类容量参数进主流产品 schema 首例；97. RDM 式学习型驱逐进主流产品首例；98. "库龄退化曲线"进评测维度首例（AML 三期？）；99. 冷热双轨存储的首个生产成本实测；100. 压缩 provenance 分支在审计场景的首例取证。

## 五之十二、记忆读路径与查询构造事实（第 20 期新增，2026-11-08 00:00）

- **范式迁移**：相关性→充分性。QEMem（arXiv 2610.22668，USC）"relevance–sufficiency gap"：关键信息碎片化/被抽象遮蔽/关系脱节；解法=查询特定证据集（多粒度发现+ViewCards 证据角色+充分性补捞）；LoCoMo 91.43%（Opus 4.5 judge），+7.6pp vs MemR3、+10.7pp vs NEMORI（共享记忆库公平对照）。
- **查询构造升维**：QUMem（2608.16168）三 agent 级联（需求识别→多查询规划→联合推断），指控单一 top-k"各自相关合起来不够"；CoEvo-Mem（2608.01739）查询改写与记忆库共演化，固定检索锁死记忆进化，七基准最高 +7.5pp。
- **语义≠逻辑**：CABLE（2608.17911，COLM 2026）证据可达性问题——先因（antecedent）在语义空间远离被解释事件，相似度补链只复制宿主检索器已能取回的；须显式构造检索器互补边。ActMemEval（2603.00026）密度分布直接测出"推理鸿沟"。
- **检索马太效应**：MEMOIR（2611.07631，11-05）高频被检挤出低曝光有用记忆；查询后归因更新检索优先级+UCB 探索红利；1,905 去重 LoCoMo 证据 recall@5 +11.92pp（裸余弦基线），置信门控反馈白拿 +1.5pp，judge-gated merge 100 次审计 0 损失。与第 19 期"读即强化"同硬币：使用统计既是代谢判据又是检索偏置。
- **产品侧读路径**：Hy-Memory search_mode="agentic"（查询送 LLM）唯一显式开关、零质量/成本披露；OpenViking search（计划式）+find（纯语义）分工、TrieHI 目录域限、11-04 批次 query-driven CacheFS+prefetch_search_topn 修复；TencentDB Embedding+关键词双路 RRF+Mermaid node_id 钻取链；Mem0 add/search 固定接口（AML 契约中立性=真实采购查询黑箱）。
- **六项目状态**：dsh-memory-evolve 665★（11-07，7 日 +198/+421%）代码停更 10-29；第三变体 huahua-dsh-memory-os（HOS，azure5100）五轨记忆+Memory Sync git 仓库存记忆（冲突本地/远端/双留三选=第 8 期未决返回值民间实现）+情绪反馈+AIMS 身份记忆；Hy-Memory 2.0.14/MemHub v1.0.6（11 语言、FP8/GGUF 量化），SDK 仓 27★、PyPI 周下载 147（声量装机倒挂），第三方审计：delete() 留原文+删最新版重激活旧版；TencentDB 30,584★（7 日 +270）、v2.0.3（10-26）、首组计量账单（存储 0.02 元/万条/小时+模型 0.01 元/Credit/小时）、MIT 但 GitHub NOASSERTION；OpenViking 11-04 检索预取批次、933 open issues 被媒体点名、AGPL-3.0；Mem0 定价 11-02 改 Free/Custom（Starter/Pro 下架）。
- **AML**：二期 11-04 关评测、官方榜单 11 月中（11-07 未出）；契约由平台代调固定 Search——参赛系统查询构造智能被评测协议吸收（第十三次同构缺口）；首期分维：MemoraX 总分 58.02 但 G 项（上下文学习执行）仅 29.99——能力剖面>总分。
- **待验证 101–106**：101. 查询审计类产品（需求/查询/命中/采信四段对账）首例；102. Hy-Memory agentic 改写命中率与降级行为披露；103. UCB 探索红利的生产定价（探索成本谁付）；104. 前因互补边的生产化实现；105. 切分粒度×查询方式联合评测首例；106. AML 二期榜单是否新增读侧维度。

## 五之十三、记忆 vs 长上下文的替代性事实（第 21 期新增，2026-11-08 01:00）

- **未检验预设**：前二十期都默认"记忆必需，因为上下文装不下"。本期拿掉它：长上下文是记忆的**替代品**，两者在"同键是否收敛"上才真正分道。
- **同键竞争 > 长度**（arXiv:2611.04169，2026-11-03，Yinuo Liu @ UCSD）：固定长度与证据位置、只改周边内容。Qwen2.5-1.5B 中性填充 8K—32K 损失中位数 ≤0.006 nats、准确率 0.96—1.00；同键竞争陈述 2.82/3.94/4.03/4.76 nats、准确率 0.11—0.21。同键冲突（同 key 不同值）：无冲突 0.02—0.34 nats、准确率 0.97—1.00；≥1 冲突 1.38—3.24 nats、准确率 0.25—0.52。2048 token 固定长度下冲突 0→6+：0.03/1.37/2.24/2.48/2.71/3.26/3.45 nats。仅共享格式不共享 key 的干扰项解释力 ≤0.3%。126,473 次试验：log(1/a*) 解释 35—58% 损失方差，log 长度仅 2—8%。证据注意力 0.51—0.77 → 0.17—0.31。**证据瑕疵**：竞争填充从 51 个名词取 key 未排除被查询项，约 1/51 填充句重述该 key 并给不同值（作者自述"这是个意外"）；measure_v4.py 已写未跑，v4 无结果。
- **地平线依读者移动**（arXiv:2611.02361，2026-11-02）：可执行基准（授权/撤回/恢复/过期/分组/变更窗口）。7—32B 开放模型 8—16 事件后 72—86%，256 事件后 48—55%；读当前状态的 32B 推理模型 96/98%。120B 推理模型直读全历史落后显式状态 4 点（256）/7 点（512）/约 10 点（1,024）。滤波器（模型解析每行+显式规则应用更新）256 事件 80—89%，胜相关性检索、模型自维护账本、StateMem 复现与 Mem0 库；让模型自行应用解析后的更新降至 58/59%。按状态依赖在查询时选行可追平（仅第一域、256 事件）→ **决定因素是"按状态依赖选择"，写入时做可免查询**。存储记录数少于状态 key 数时按容量时间尺度遗忘（→ 容量不足表现为"答案悄悄变旧"，非"检索不到"）。读者模型可把准确率预测到 0.02 以内。
- **写入不可由提示诱导**（Memento，arXiv:2611.00244，2026-10-30，Columbia）：GPT-5.5 在 337 样本上零压缩笔记；GLM-5.3 12,000 rollouts 零有效笔记；Qwen3-8B 约 6% 轨迹合格且连写重复。无 SFT 冷启动时压缩率 20 步内塌至近零。方案：GLM-5.3 采集正确轨迹 + 事后注入笔记 → 约 6,000 条过筛微调 Qwen3-8B → GRPO，奖励四段（格式合规门控 / 笔记有效性 / 答案正确 / 负 Brier）。有效性三启发式（非末窗≥1 且总数<5；不得为该窗首个工具调用或紧跟另一条；两条 token 集合重合 ≤80%）。训练只练"压缩进新窗口"，推理时支持 context folding 与低置信回退检查点。基准 LiteraryQA/NovelHopQA/SagaScale(EN)，NovelQA 留出；4.7K 题；Qwen3-8B 起点 36.9%。
- **符号化短期记忆**（TencentDB v2.0.3，10-26）：工具日志外置 Markdown，上下文只留任务状态 Mermaid 图 + node_id，按 id 回取原文。四类记忆（Chat/Skill/LLM-Wiki/CodeGraph）各带 owner/version/visibility；L0 对话→L1 原子→L2 场景→L3 人设；下层 SQLite FTS5+vec0、上层 Markdown。自报：WideSearch 33→50%（+51.52%）、221.31M→85.64M（−61.38%）；SWE-bench 58.4→64.2%、3,474.1M→2,375.4M（−33.09%）；AA-LCR 44.0→47.5%、−30.98%；PersonaMem 48→76%。v2.0.3 另增会话默认绑定（Team/Agent/Task 组合）、Wiki 富文档（Word/Excel/PPT/PDF）、上游等待 10 分钟→1 小时、修 L1 时间格式失败与 Redis 中断自愈。
- **上下文定价断点（厂商自设的安全预算线）**：Claude Haiku 5.5 >100K 跳档（阈值含缓存读写，部分命中仍按高价）；Gemini 3.1 Pro >200K；GPT-5.4 >272K 对整段会话 2x 输入/1.5x 输出且缓存读翻倍。缓存读 0.1x（多数）/0.05x（Opus·Sonnet 5.5、GPT-6.1 Sol·Terra）/0.025x（Fable·Mythos 5.1，$0.25/MTok）；写 1.25x（5min 或 30min）、2x（1h）、2.5x（12h OpenAI）；最小可缓存 512（Haiku 4.5 为 4,096）/1,024（OpenAI）；Google Gemini 3.1 Pro 缓存 $0.20 vs $2.00 且收 $4.50/1M/小时存储；DeepSeek flash 命中 $0.003 vs 未命中 $0.15。Gartner：代理任务 token 为对话的 5—30×（单价降、总账升）。
- **每美元得分首次公开横评**（Letta FrontierMemory）：Dream 73.3%/$2.80（26.2 分/美元）、Prime 60.0%/$3.74（16.0）、OpenAI Agents SDK 40.0%/$0.82（48.8）、Claude Managed 33.3%/$3.21（10.4）、Hermes 26.7%/$2.79（9.6）。**总分第一者性价比第二**。
- **六项目状态**：OpenViking 本期无新版（v0.5.2.1 仍最新）；Hy-Memory 2.0（10-16）30B-A3B 55.49% 宏观均值 vs Opus 5 54.62%、DeepSeek V4.1 Flash 53.64%，MemoryArena 55.31%（领先 EverOS 10.2pp）、LoCoMo 72.6% 且每题 1,159→703 token、SWE-ContextBench 28.3% vs MemOS/Mem0 25.3%，三开源（模型/框架/MemHub）；TencentDB 28,900★（10 月口径）、MIT 但 GitHub 标 NOASSERTION；ReMe Apache-2.0 3,578★、最近推送 10-09、10 月决策模型压缩（可恢复提案+protected history+14 查询基准）、Multimodal（Auto Memory 读图带对话上下文并保图源）、Studio Playground；dsh-memory-evolve 五轨（画像/全局事实/项目关键记忆/项目日志/日记）+git 分支限域+Memory Sync 冲突三选，索引页最近推送 10-01、0 fork；ReMe2Ops 仍无独立实体。
- **AML**：二期 11-04 23:59 截止正式评测，榜单 11 月中；11-06 媒体稿仍预热（首期文本商业榜 MemoraX v0.5 58.02 / MemOS v2.0.1 45.89 / NTES 44.21；代码榜 MemoraX 62.00%，claude-mem v12.1.1 / hs v3 / MemOS 均 52.00%）。
- **待验证 107–112**：107. 同键冲突密度进任一评测维度或产品面板首例；108. 归约模型（Hy-Memory-30B-A3B / Memento 8B）跨模型迁移实测；109. "安全预算占标称窗口比例"的最优值实测（20%—40% 经验值待校准）；110. 2611.04169 的 v4 结果是否发布并剥离混淆；111. "按状态依赖写入选择"的生产化实现（免查询）；112. 记忆必要性四问的对照实验（建库 vs 不建库同任务成本-准确率）。

## 五之十四、记忆的信用分配事实（第 22 期新增，2026-11-08 02:00）

- **未检验预设**：前二十一期以“写/删/指/切/经济/接口/空集/并发/闭环/时间/时延/信任/搬迁/缓存/动作/冷启动/载体/恢复/代谢/读法/替代”逐层拆解，但都默认“一条记忆对成败的贡献可以不谈”。本期拿掉它：信用分配是写入侧一切的隐变量。
- **信用粒度三级（新框架）**：
  - 会话级＝文本轨默认，成败单标量回传，无法定位条目；第 9/19 期卡点同源。
  - 块级＝Hy-Memory 十轮块（不跨会话）+ 逐块失败面探针 + 跨块归因（把“答案错”变成“第几块写坏”）+ 块级 GRPO。
  - 件级＝Self-Direction 一次失败一个 LoRA，1:1 使信用“不需要计算”；代价是每条经验一次训练、且不可读。
- **过存惩罚 0.3**（Hy-Memory 奖励 s = PRM + 2·ORM − 0.3·Penalty）：任何以“可回答性”为奖励的写入训练都存在“全存”作弊路径；惩罚系数是补丁，不是机制。反向作弊为“只记结论丢范围”（第 9 期压缩放大律）。
- **结构级信用**：MemQ（上海交大 + MemTensor，arXiv 2026-05，EC-MDP 形式化）用 provenance DAG 记“这条记忆检索了谁”，TD(λ) 资格迹沿深度回传、权重 (γλ)^d；六基准多步 +5.7pp、单步 +0.77pp → 信用传播只对深链有价值，亦是对第 3 期“血统＝纯成本项”的上修。
- **件的工程事实**：0.02%/件、3 件≈256MB、基座与既有件全冻结；路由按任务描述相似度 top-1（无 top-k、无引用、无位次）；加载错件静默偏置；卸载需 scale=0 + 重启 + 基座 SHA-256 比对 + 三态内存记录，多数产品无此文档。
- **删除四层（修正第 2 期）**：可枚举 → 可卸载 → 可证行为 → 可证表征。VGUA（2605.02206v3）234 个卸载模型：78% 输出层更近重训参考点，94% 激活空间更远；MIA 优势不跟踪重训对齐；选项重排后仍答对 25%（仅保留数据参考模型 6%）。故参数轨从“注销全失能”改判为“可卸载但不可证”。
- **件可审但不可引**：arXiv:2611.07610（Qwen3.5-0.8B／36 微调／18 数据集／5 域）仅凭件反推训练域：灰盒激活 61%、黑盒输出 64%、白盒权重 42%，随机 20%；黑盒在仅文本、不给 token 概率时不变，且不随 rank（8—64）变。TopKLoRA 稀疏化使后门电路缩至同 rank 稠密 LoRA 的 1/10，以“消融后 ASR=0”作必要性检验。→ 归因从“引用某条”降为“指纹某域”。
- **增量计分首次出现**：Letta FrontierMemory 以“从既往经验学习”的增益为主指标：Dream 73.3%/$2.80、Prime 60.0%/$3.74、OpenAI Agents SDK 40.0%/$0.82、Claude Managed 33.3%/$3.21、Hermes 26.7%/$2.79。总分第一 ≠ 每美元第一（26.2 vs 48.8）。
- **六项目状态**：Hy-Memory 2.0.13/MemHub v1.0.6，30B-A3B 跨三框架写入器，留出 EverMemOS +2.86；TencentDB AM 30.3k★、NOASSERTION、四资产 + 三级角色 + 0.02 元/万条/小时；OpenViking v0.5.2.1、41.6k★、1,204 issues、AGPL-3.0；ReMe 0.1.2（召回标不可信 + auto_dream 23:00 + 诊断卡），ReMe2Ops 仍无独立实体；dsh-memory-evolve 645★/71 fork/MIT/37 issues、push 停 10-29、首条原则“AI 只提议，你确认”。
- **AML**：二期 11-04 23:59 截止正式评测、榜单 11 月中、奖金 15 万元仅开源榜，本期（11-08 02:00）仍未出；契约仅 Add/Search + 平台代调，仍无信用位。
- **待验证 113–118**：113. 件级删除收据（含重启与 SHA 校验）进任一产品文档首例；114. “删后行为回退率”进任一榜单；115. 件库 >50 时路由歧义故障报告；116. Hy-Memory 0.3 惩罚系数的独立消融（论文自述未做）；117. 域级指纹进合规举证流程首例；118. AML 二期是否新增“增量/学习”维度。



## 五之十五、记忆的回归与变更影响事实（第 23 期新增，2026-11-08 04:00）

- **未检验预设**：前二十二期都默认“更新记忆是内容维护（改一条）”，不是变更管理。本期拿掉它：记忆的调用点在检索时刻动态决定，影响面=未来所有命中路径，无法静态枚举——更新是无测试的重构，回归只能靠事故发现。
- **巩固即回归源**（arXiv:2605.12978v2 Useful Memories Become Faulty）：连续更新下记忆效用先升后降、可跌破无记忆基线；从 ground-truth 轨迹巩固，GPT-5.4 在此前已解出的 ARC-AGI 题上仍失败 54%；同一批轨迹在不同更新调度下产出性质不同的记忆；episodic-only 控制组与自动巩固组打平、为强制巩固组两倍准确率。→ 第 9 期压缩放大律的调度版：危险的不仅是“压成什么”，还有“何时压”。
- **构建非封闭性**（MemForm v2，2610.14431，11-05 更新）：五类形成期投毒界面（内容/证据/范围/保留选择/巩固路径）；保留内容相同、仅巩固顺序不同即改变下游行为；真成功经验不保证形成可靠记忆；防御缓解不完全且依架构而异。→ 重建≠还原，ReMe reindex / MemHub ultra 夜间整理均为不可复现构建（衔接第 18 期“恢复是第四个写入口”）。
- **纠错剂量学（首次量化）**（arXiv:2607.10526 Persistent Sycophancy）：同域下游失败率 无纠错 36.3% → 口头撤回 33.6% → 显式编辑该条 30.3% → 全局降级 27.8%（跨域 25.3%）；写前强指令使存写率 22.8%→14.2%、失败回到会话基线——写前一条强指令 ≈ 两轮事后编辑；约 75% 已存主张仍留笔记但失败已消除：起作用的是降状态不是删内容（第 2 期墓碑论第二次验证）。
- **写前闸门三件套**：MemTxn（2607.27834）Ordered PatchTest 60 有据全收/179 硬负全拒 + 时间解析器 + 快照日志（多键持续故障下恢复完整声明态；FactConsolidation 12 答题模型平均 F1 最高，较 Dense +17.06—24.07）；Aloneswork/deepseek-harness-evolving-memory v0.2.1 置信度滞回（替换须超旧值 ≥0.15 否则进冲突队列）+180d 过期+WAL 截断安全删；dsh-memory-evolve 用户确认写入。
- **分支试错产品化**：TDSQL-C 数据分支（10-30 发布）写时复制、PB 克隆约 1s、每 Agent 独立分支即用即焚——记忆沙箱分支首个数据库产品形态。
- **六项目状态**：OpenViking 41,697★（11-06）、langchain-openviking 0.2.0（11-06）、Rules 搜索暴露全集成（#7005）、prefetch>5 修复；Hy-Memory MemHub v1.0.6（11 语言/lite-pro-ultra/写重试暂停）、30B-A3B FP8+GGUF 量化；TencentDB 仓迁 TencentCloud org、v2.0.3 稳定版、冷启动全家桶（默认 Agent+预置 Skill、Wiki 分页重试、Skill 导出、Proxy 新接 Codex CLI/WorkBuddy/DSH）、路线图下一项观测面板、29,264★（11-04 口径，与 30.3k 冲突已标注）；ReMe 11-06 进驻 DSH 官方仓讨论区（插件 0.1.2×DSH 0.2.1-rc.2、Auto Dream 定时 digest 留源）；dsh-memory-evolve 665★（7 日 +421%）代码停更 10-29、生态第四变体 huahua-dsh-memory-os 文档补齐。
- **AML**：二期评测 11-04 截止、官方榜单 11 月中，11-08 04:00 未出；契约无变更影响/回归维度（口径缺口第十四次同构）。
- **判读**：①倒挂第十四次——有回归防护的全在论文与数据库层，记忆产品侧仅民间插件有滞回闸门；②头部产品“影响面感知”列全空、巩固调度披露为零；③记忆 CI 数据库化路线成形（TDSQL-C 分支 + TencentDB 观测面板路线图）；④记忆回归测试（canary 查询-期望对+变更后重跑）是下一空位产品，第 11 期新鲜度三件套应并入为时序子集。
- **待验证 119–123**：119. 记忆回归测试（canary 行为 diff）产品首例；120. 巩固调度披露进任一头部产品文档；121. 全局降级状态位进主流 schema；122. 写前强指令与两轮事后编辑的等价性在生产环境复现；123. AML 二期榜单是否新增治理/回归维度。


## 五之十六、记忆的规模律事实（第 24 期新增，2026-11-08 05:00）

- **未检验预设**：前二十三期（写/删/指/切/经济/接口/空集/并发/闭环/时间/时延/信任/搬迁/缓存/动作/冷启动/载体/恢复/代谢/读法/替代/信用/回归）都默认"库的规模不影响记忆正确性"。本期拿掉它：规模是正确性问题。
- **规模三律（新框架）**：
  - 容量律（2611.02361，11-02）：库存组件记录 < 状态键数 ⇒ 遗忘时间尺度由容量决定；读者模型预测自身精度平均误差 0.02（注册测试）→"该存多少"从经验参数变为可判定计算。
  - 稀释律：无控累积使 LOCCO 0.455→0.05（2604.02280 转引）；MemSearch-o1（ACL 2026，2604.17265）命名"记忆稀释"，贡献函数+路径回溯缓解。
  - 漂移律：递归摘要每轮引入方向性噪声并在下一轮固化（2605.30159），信念偏航。
- **失效源三分类补齐**：良性持久失效 benign-persistence（2604.16548 综述命名）——无攻击者、无写错，存本身即病；研究最稀疏。前两类为写错（第 9 期）与攻击（第 12 期）。
- **局部/全局保真二分（本期最硬方法论）**（2611.08341，11-05）：96 字节/段 rescoring 二值码 L=0.97 仍 10.1% 跨主题漂移；PCA 8bit L=0.77 漂 1.7%；巩固/删除/对比依赖远端（G），规模优化全部以近端（L）验收 = 系统性验收错位。LAQ 首个以远端界为目标（G 带上 1−νk ≤ 2~2.18×√违反率，相关 0.979）：52 组留出实验中重建提升 G 次数 0、远端铰链 52/52（p=8.5e-4）；百万级验证；七种等尺寸量化器唯二公布 G。
- **规模-新鲜度交换显式化**：OpenViking 文档披露父摘要滞后阈值（默认 10% 待处理变更比）——读得最多的层被设计为最陈旧的层；第 11 期新鲜度账户首个可计算条目；v0.5.3 后批次（11-04）加入 storage/vectordb 操作指标。
- **吞吐前沿在写侧/选择侧**：MemForest（2605.23986）并行分块+MemTree 层级时间索引，LME-S 79.8%、建构吞吐 6×（vs EverMemOS）；Memorix（2611.00060，10-13）选择预计算+版本化 Store，解析率 1.5×、摊销成本 100×、构建 38×。读路径质量-库容退化仍零披露。
- **厂商规模披露全是时延口径**：TencentDB 亿级向量毫秒检索、单集群千万级玩家记忆、百万用户 200ms；PersonaMem 20 画像/6,462 条/589 题事实召回 29.63%→79.07%（OpenClaw 3.7+Kimi-K2.5）；库容-精度曲线全行业无一家公布。
- **六项目状态**：OpenViking 41,337★（11-02）/v0.5.3/周 +448★、VikingMem 进 VLDB 26、TrieHI 已集成；Hy-Memory 30B-A3B（10-15 Apache-2.0）宏均 55.49、自托管盈亏平衡 $298/月@5 万 req/日、no_think；ReMe（agentscope-ai）10 月决策模型压缩+多模态更新、reme status 披露 RSS、reindex 可全量重建、11-06 proactive 资源包；dsh-memory-evolve 665★/7 日 +198★(+421%)/代码停更 10-29，生态变体 huahua-dsh-memory-os（AIMS 身份记忆、Memory Sync 冲突三选）与 Aloneswork v0.2.1（本地 BGE-small-zh-v1.5 91MB、置信滞回 0.15、180d 过期）；TencentDB PersonaMem 叙事+质变科技并列领导者象限（选型文章口径）；Mem0 定价改 Free（5 万 adds/1 万 retrievals+自有 key）/Custom，68.5k★；Hindsight Models 59.3k★、Inference API $0.005/1M 输入。
- **AML**：二期 11-04 截止、11 月中出榜，11-08 05:00 未出；一期全能力剖面已公开（MemoraX A 89.89/G 29.99 上下文学习最弱、Cognee 唯一全维可比 42.61）；契约仍无规模维度（口径缺口第十五次同构）。
- **判读**：①倒挂第十五次——唯一公开 GC 参数（dsh 插件）与唯一公开滞后阈值（OpenViking）都非头部；②"检索性能稳定"的时延口径冒充规模证据，精度-库容曲线是采购真空区；③规模竞争下个战场在索引内部（G 保持率），七种等尺寸量化器唯 LAQ 公布 G；④容量线仪表盘（状态键数/库存数/预测精度三读数）是下一空位产品。
- **待验证 124–128**：124. 任一厂商公布库容-精度曲线首例；125. L/G 双指标进评测合同首例；126. 容量线位置进产品文档/API 首例；127. LAQ 类远端铰链量化进入生产向量库首例；128. AML 二期榜单是否含规模/库容变量。

## 五之十七、记忆的前瞻性（prospective memory）事实（第 25 期新增，2026-11-08 06:00）
- **未检验预设**：前二十四期全部默认记忆朝向过去（回顾式：存过去、供现在决策调用）。本期拿掉它：Pro-Memory（2611.05731，11-03，吉大 Yuanchen Bei 等 9 人）首次把前瞻记忆做成独立框架。
- **核心命题（新框架）**：
  - 回顾/前瞻二分：意图记忆的失效方向与事实正交——事实怕过时（currency，第 10 期），意图怕休眠（永不触发）与误发（错时触发）双模。
  - 前瞻三件套：意图条目（pending objective+证据链）+ 激活条件（何时 actionable，相关观察可能要求等待）+ 已决回写（按实际发出动作更新状态）——Pro-Memory 齐备，产品零家。
  - 休眠税：意图在查询驱动检索下是永不命中的死重（承接第 5 期检索预算负资产、第 24 期稀释律），随库龄与意图密度增长。
  - 意图-马太脆弱性：意图天然低频，是检索马太效应（第 20 期）最大受害者；MEMOIR（2611.07631）UCB 探索红利是唯一论文级对策。
  - 闭环最短环：意图-动作-回写是第 9 期闭环的最短形态，无外部世界校验；"提议"误记为"承诺"直接变成多余动作。
- **关键事实**：Pro-Memory 在延迟意图+开放主动辅助两基准跨多底座一致超越，且以"少打扰"为指标；Hy-Memory 论文 8 层 L7=prospective intentions，但 SDK API（add/search/update/delete/evolve/history）无意图接口（论文有产品无）；huahua-dsh-memory-os 唯一把 To-do 四轨做成一等公民（项目轨绑 git 分支），但为显式任务非隐性意图，中间隔"意图抽取与登记"层（零实现）；OpenViking 三类上下文/TencentDB 四资产均无意图类，TencentDB v2.0.3-beta.1 可插拔决策服务是意图执行邻接位；AML 八维无一覆盖前瞻（口径缺口第十六次）；H 维（安全隐私）为全体最低分项，意图记忆是未设防的隐私放大器。
- **判读**：倒挂第十六次（最强实现在论文、唯一产品化在社区插件）；意图状态机 API（intents.add/evaluate/resolve）+到期语义是下一空位产品；"履约型 agent"采购口径将倒逼前瞻维度进 AML 三期。
- **待验证 129–132**：129. 意图状态机 API 首例（哪家先做 intents.*）；130. 意图抽取与登记层产品化首例；131. 误发率进评测首例；132. AML 二期榜单（11 月中，最高优先，11-08 未出）。

## 五之十八、记忆的元认知事实（第 26 期新增，2026-11-08 07:00）
- **未检验预设**：前二十五期全部默认"记忆的元状态（记没记、信不信）是系统私有信息"。本期拿掉它：元认知能力无法只对内开放，"知道自己知道"与"让别人知道你知道"由同一组信号承载。
- **核心命题（新框架）**：
  - 元状态二象：置信/采信信号对内是治理件，对外是攻击面，不可单向关闭。
  - 采信前/采信后分界：MDL（2609.22043，9-18）判 Self-RAG/Reflexion 式生成后自检"为时已晚"——错误记忆已污染上下文；元认知决策的合法位置在检索与生成之间。
  - 置信-一致性解耦：C（模长）与 α（余弦）显式分离；行业无 schema 规定两者，Hy-Memory confidence 字段零语义披露。
  - 元信号泄漏律：MRMMIA（2605.27825）黑盒 72-84% TPR@1%FPR、白盒 86-99%；信号在回答精确度/推理深度/置信中；去掉追问 rationale 环节 TPR@1%→0%；系统提示防御无效（75% vs 77%）；攻击成本仅 5 个黑盒查询。
  - 三轨元信号谱：外置记忆越显性元信号越强；对照 MIA 虚幻性（2609.10830）预训练参数轨 rank corr ≈ −0.08（高重复文本信号与名气不可分）——外置记忆泄露"记没记"，参数轨泄露"内容"（第 22 期 VGUA 94% 激活更远），互补暴露面。
  - 零参数化路线：MDL 0.14ms（比嵌入检索快 50×、比 LLM 自评快 4-5 个数量级）；采信层正逃离 LLM 自评。
- **关键事实**：MDL 三信号（相关性/可靠性/任务风险）QR 正交投影，冲突记忆幻觉 −56.04%、高风险场景趋零；BEAM（2610.25119，10-18）记忆价值=上下文条件化动态信念+执行反馈校准（贝叶斯脑）；DS-MCM（2601.23188）分层元认知监控（快层 RE-SE 校准函数+慢层元认知记忆库），3-7% 开销 vs LLM-as-critic 12-22%，GAIA 等四基准超 o3/Gemini 2.5 Pro；产品侧仅 Hy-Memory 有 schema 级 confidence；TencentDB v2.0.3（30,577★，+94★/日）决策服务为邻接位；OpenViking 41,337★ v0.5.3 后批次（11-04）加查询驱动 CacheFS/storage 指标/ACL 空授权哨兵；dsh 生态进"第二轮"（evolution/isolation/migration），新变体 dsh-mnemon（agent 策展）与 dsh-core-memory（稳定结论层），主仓 665★ 停更 10-29；Mem0/RAG 基线盲采信。
- **判读**：倒挂第十七次（元认知最好能力全在论文侧）；口径缺口第十七次（AML 八维无采信校准/成员泄漏位，可高分+高泄漏并存）；弃答工程位置修正第 7 期——不在"检索为空"而在"非空但拒采信"，MDL 四级行动映射为模板；自知-他知悖论与第 6 期捕获-隐私悖论同构；采信层是继插座/账单/缓存界面后第四个商品化层位，形态将是零参数插件市场。
- **待验证 133–137**：133. 采信决策层进产品 schema 首例；134. confidence 语义披露首例（Hy-Memory 最先？）；135. 成员泄漏 TPR 进采购渗透测试首例；136. 采信校准/泄漏维度进 AML 三期；137. AML 二期榜单（11 月中，最高优先，11-08 未出）。

## 五之十九、记忆的用户界面（GUI 化）事实（第 27 期新增，2026-11-08 08:00）
- **未检验预设**：前二十六期（写/删/指/切/经济/接口/空集/并发/闭环/时间/时延/信任/搬迁/缓存/动作/冷启动/载体/恢复/代谢/读法/替代/信用/回归/规模/前瞻/元认知）都把记忆当作 agent 的内部器官，读者只有 agent。本期拿掉它：记忆正在获得面向人的界面，人从"被抽取者"变为"审阅者/修订者"。
- **核心命题（新框架）**：
  - GUI 三层可见性缺口：表面可枚举层（GUI 展示）/ 隐藏层（delete 残留、抽取日志）/ 过程层（夜间整理改动）——GUI 展示≠真相全集，可视≠可治理。
  - 人审巩固审批单四要素：源记录清单/拟新建文本/拟退役记录/变更理由（Qwen Memory Agent 首例）；同时服务第 9 期闭环治理与第 19 期代谢可审计。
  - 待审隔离区（pending 不入召回）：Construct 首例——第 22 期"未决返回值 [?]"的写侧产品形态。
  - 治理强度 SKU 化：MemHub lite/pro/ultra 买的不是存储是治理强度，ultra 内部不可审计——第 19 期"代谢黑盒档位"升级为产品语法。
  - 人改记忆是第五个写入口（接第 23 期恢复=第四个）：无厂商披露 GUI 编辑走不走写侧闸门。
  - 园艺常态化：Agent Zero 官方"记忆园艺"指南——审阅成本随库龄增长、无 diff 视图则退化为从不审阅。
- **关键事实**：MemHub v1.0.6（11-06）桌面/CLI/Web+11 语言、lite/pro/ultra 拨盘（ultra=知识图谱+每晚整理）、模型中心分离整理/检索模型、升级提示"整理请勿强制退出"但零 changelog；ReMe Studio Playground 浏览器版零安装；OpenViking viking://+web-studio 回应黑箱批评；TencentDB Memory Hub 管理面板+观测面板 roadmap（10-30"三笔账"叙事）；Qwen Memory Agent（11-03 MIT 黑客松）任务成功 0.60/存储正确 0.90/过程正确 0.70（"记得对但不用"再现）；Construct supersede 保留历史+forget/restore+pending 隔离；brainy.ink Memory Inspector 设计理论（"先发审阅界面再发持久记忆"）；LobeHub 偏好权重可视化；GUI 化与本地优先强绑定（文件即界面，云侧难做：给用户看=暴露抽取质量）。
- **判读**：①倒挂第十八次——人审巩固最完整实现是黑客松项目，头部产品 GUI 停在浏览+删单条；②GUI 是第 3 期可寻址性的产品化（A/B 级），C 级可归因仍无人；③GUI 是第 26 期采信层天然落位（人是最后采信者）；④口径缺口第十八次——AML 八维全机器评测，无人审界面/可治理性维度，H 维改善不可计分；⑤审批单四要素+待审隔离区是下一空位产品标准。
- **待验证 138–142**：138. 人审巩固进头部产品首例（MemHub/TencentDB 谁先）；139. GUI 编辑走写侧闸门的披露首例；140. 夜间整理 changelog/diff 首例；141. pending 隔离进主流 SDK 首例；142. AML 二期榜单（11 月中，最高优先，11-08 未出）。

## 五之二十、记忆的标准化时刻事实（第 28 期新增，2026-11-08 09:00）
- **未检验预设**：前二十七期的口径缺口（弃答/冲突/信用/规模/前瞻/元认知/GUI）默认解法是"评测增设维度"。本期拿掉它：行业真正在走的解法路径是标准化先于评测——协议/格式/治理/许可证四条线在 30 天内同时推进。
- **核心命题（新框架）**：
  - schema 即世界观：格式对"一条记忆是什么"的分类选择把某派本体论写进所有人系统；Searle 言语行为分类（TotalReclaw）vs Tulving 认知分类是第一次公开摊牌；closed enum 定错即全网锁定。
  - 留白即债务：MCP 显式把抽取/冲突/删除语义留给后端＝第 2/8/9 期问题在协议层被"标准化为不标准"，互操作只到插座为止。
  - 标准主权四层：协议层单点（Anthropic 捐出后名义中立）/格式层无主（MIF、Engram、Taxonomy 三格式竞争）/治理层基金会共管/事实标准层归社区（DSH 民间五轨 schema 装机量最大）。
  - 捐赠=承诺税：Anthropic 10-22 捐 Agent Skills 名称/商标/GitHub org/agentskills.io 域名入 AAIF（Linux 基金会），100 万技能 2.8 亿安装形成棘轮，标准冻结即演进冻结；安全与兼容责任无人认领（技能包投毒面随安装同步放大）。
  - 许可证即隐形标准：OpenViking AGPL-3.0＝用许可证实施强制互操作；对照 Mem0/Graphiti/Letta/cognee Apache-2.0、TencentDB NOASSERTION。
  - 协议是发现的汇聚点：MCP 2026-07-28 修订把 ttlMs（第 11 期新鲜度）、cacheScope（第 14 期缓存）、确定性 tools/list 排序（字节稳定性）固化为必填字段，节奏快于评测；预判下一批进协议的是墓碑三字段与 owner。
- **关键事实**：MCP 2026-07-28 修订（ttlMs/cacheScope 必填、subscriptions/listen 取代 resources/subscribe、多数记忆服务器不声明行为提示→默认 destructiveHint=true）；TotalReclaw MCP Memory Taxonomy v1（2026-04-18，5 客户端，provenance 一等字段，closed type enum+open scope enum，pin_status 增量演进；动因＝Mem0 audit Issue #4573 97.8% 条目垃圾、根因助手内容误归属为用户事实；自述"Mem0/Zep 有商业理由分歧，我们受益于收敛"）；MIF v2（3 必填字段，mem0/CrewAI/LangChain/Markdown 互转，"记忆的 vCard"）；PLUR Engram Spec（2026-03，Apache-2.0，YAML，ACT-R 衰减+强化，learn/recall/inject/feedback）；AAIF 捐赠（Anthropic/Block/OpenAI 共同创始，MCP 先捐入；维护者含 Google/OpenAI 工程师；路线图版本化发布+提案流程+安全指引）；OpenViking 41,337★（周+448/月+2.2K）v0.5.3 AGPL-3.0；TencentDB-Agent-Memory OpenClaw 插件契约加固（activation.onStartup/contracts.tools）+v2→v3 迁移工具+Team Memory Beta；dsh-memory-evolve 665★ 7 日+198（+421%）；huahua-dsh-memory-os Memory Sync 代码仓专用分支存记忆+冲突三选；Mem0 定价 11-02 改 Free/Custom（Starter/Pro 下架）；AML 二期 11-01 02:00 关投稿、11-04 23:59 关评测、11-08 仍 in progress、奖池 $22k 仅开源组；AML 评测合同数据版本化（textual-v1/ldbd-textual-official-suite-v1）但只固定 Add/Search 接口不固定记忆 schema。
- **判读**：①倒挂第十九次——能写标准的恰是无利益方，头部记忆厂商格式层集体缺席；②MIF 最小主义 vs Engram 理论负载，第 13 期"更简单先赢"复验；③评测合同标准化与互操作标准化是两条不相交的轨道（AML 不测迁移性，第 13 期缺口延续）；④格式层三格式并立窗口期 6—12 个月，TotalReclaw PR 进 MCP 规范仓是收敛首信号；⑤安全责任真空是 Agent Skills 规模化后的最大治理缺口。
- **待验证 143–147**：143. AML 二期榜单口径（11 月中，最高优先，11-08 未出）；144. MCP 规范提案流中 superseded_by/owner 字段出现时间；145. TotalReclaw Taxonomy PR 是否被 MCP 规范仓吸收；146. AAIF 安全指引文本与技能包投毒实测；147. 嵌入模型标识进 MIF 类交换格式的强制性要求。

## 五之二十一、记忆的对账与负值区事实（第 29 期新增，2026-11-08 11:00）
- **未检验预设**：前二十八期（写/删/指/切/经济/接口/空集/并发/闭环/时间/时延/信任/搬迁/缓存/动作/冷启动/载体/恢复/代谢/读法/替代/信用/回归/规模/前瞻/元认知/GUI/标准）共同假设"使记忆失效的力量一定表现为一次写入"。本期拿掉它：大量失效没有写入事件，账与实分离。
- **核心命题（新框架）**：
  - 账实分离：supersede/墓碑/双时态都是"账内冲销"，只处理"同一键上出现两条值"；世界自己改了而无人写，账仍然平。**账本的核心动作是对账，28 期无人做过**（承接第 1 期"记忆即账本"）。
  - **负值区**：Δ_mem = 有记忆 − 无记忆，可为负。度量应是 Δ_mem 而非 recall@k；过期记忆不是零收益而是负收益。
  - 对账对象三分：**可对**（文件哈希/API/DB 行）、**可问**（偏好/计划，主体是人）、**无对**（推断/传闻/情绪/意图）。消费级记忆大半落在后两类 → 对账成本≈人工，这是它缺席的经济原因，不是技术原因。
  - 核验-重取成本比较：核验单价 ≥ 重取单价时，正确动作是"丢"而非"修"。**删除是最廉价的核验**（第 5 期遗忘 NPV 的第三次修正：不是"该不该忘"，而是"忘比查便宜"）。
  - 三种伪对账：无账型（失效降为读时排序）/ 账内失效型（invalid_at 只由到达证据触发）/ 幂等重跑型（内容哈希，唯一可"重跑即校正"）。
  - **能力的诅咒**：Δ_mem 的伤害随模型能力上升（强模型把错误前提执行得更像对的）；治理件效果与能力反相关（元数据救大模型、预消解救小模型）→ 否掉"买更强模型兜底"。
  - **检测-拒答不对称**：SR 92% vs PR 4%——能标记过期，不能拒绝以过期为前提的提问；过期治理的真正位置在**提问侧（前提审计）**，不在存储侧。
- **关键事实**：STALE 2605.06527（400 场景/1,200 查询/104 属性/~151.8K token/50 会话 593 轮；最佳 55.2%；Gemini3.1PP SR 92/PR 4/IPA 42；CUPMem 68.0 vs 裸 GPT-4o-mini 8.7；Type I 共指 vs Type II 传播，后者更难）；When Memory Lies 2608.04574（1,800 检测+12,000 导航；**信任原始记忆死亡率 > 无记忆 2 倍**；文本可判≠视觉可判 F1 0.887→0.067；oracle 陈旧标签无额外增益；透明读时过滤器仅在文本模式有效）；TEPA 2608.07429（完全反转 50 seeds：append-only 0.210、LWW 0.210、**无记忆 0.309**、TEPA 0.950；真实文件执行 0.203/0.298/0.950；clean SH-6k 与强 LWW 持平→"当前键替换"是单跳巩固的决定性操作；revoked 档保留审计）；Trust Gap 2609.01852 PayPal（Qwen3 0.6/1.7/4/8B；Benefit 套件陈旧作答 0.92–1.00 全尺度；Safety 套件伤害随能力出现；"陈旧但日期更新"对大模型更致命；来源权威弱且尺度平坦；元数据救大模型、预消解救 0.6/1.7B；Llama-Instruct 与 RGB/MisBench 复现）；RaMem 2606.22844（context collapse，证据锚定四要素：事件时间/提及时间/会话跨度/参与者）；Obsolete Facts 2610.36308（旧值竞争项比无关干扰项伤害大：100→44.6%）；MEMOIR 2611.07631（11-05，审计 0 损失，上界 2.95%）。
- **产品侧三种伪对账实证**：Mem0 4 月算法 ADD-only "nothing is overwritten"，失效=读时排序、无撤销标记；Graphiti `invalid_at` 可审计的关闭动作但只由到达证据触发、可答"6 月时是谁"；Agent-Memory-OS 导入器内容哈希幂等重跑（跳过未变/刷新已变+provenance）＝**冷启动导入器成了唯一对账通道**（第 16 期延伸）；dsh-memory-evolve（chenzheshushi v0.4.2）prune preview→execute + 每目标 ETag 陈旧跳过 + forgottenAt 墓碑 + 热度用 accessedAt 而非 updatedAt＝产品侧最接近对账的原语。
- **六项目状态（11-08）**：OpenViking v0.5.3（11-02，98 commits，Rules Beta/ACL 空授权哨兵/查询驱动 CacheFS/storage-vectordb 指标）41,337★ 周+448、AGPL；TencentDB-Agent-Memory Proxy 扩至 Codex CLI/WorkBuddy/DSH + aux 请求短路 + 导入保留原始时间戳 + 批量清空；Hy-Memory/MemHub v1.0.6（hy-memory 2.0.14，lite/pro/ultra，安全切嵌入、写重试、11 语言）；ReMe v0.4.2.2（11-05，日期区间召回文档化；第三方 L3 标注"安装规格过期"，声明仅 0.1.x 而 0.2.2-rc.1 被门拒）——**记忆工具的元数据比它管理的内容先过期**；dsh-memory-evolve 见上；AML 二期 11-04 23:59 关评测、11-08 未出。
- **判读**：①倒挂第二十次（对账最完整实现落在导入器/社区剪枝插件/论文）；②账内完备度可到 4/5 而"对外对账"全空——护城河是"承认可能过期 + 给出可承受的核实路径"；③失效类型应字段化（写触发/时间触发/世界触发）；④评测无失效位，Δ_mem 不计分（口径缺口第二十次）；⑤换更强模型兜底被 Trust Gap 与 Supersede 双向否掉。
- **待验证 148–153**：148. AML 二期榜单口径（11 月中，最高优先，11-08 未出）；149. `as_of`/`may_be_stale` 进返回体首例；150. 失效类型字段化首例；151. Δ_mem（有记忆 vs 无记忆 A/B 双跑）进评测首例；152. 导入器晋升为对账通道（定期重跑）首例；153. 字段级记忆身份证使定点核验可行（接第 3 期）。

### 五之二十二 记忆的利用率与送达形态事实（第 30 期，2026-11-08 12:00）

- **核心命题**：全行业优化"送得对不对"，无人量"送了有没有用"。记忆的收益是**送达形态**的函数，不是条目的函数。
- **MemUse（2611.01718，11-01）**：SWE-bench Verified 500 任务 ×12 仓，4 配置 ×4 跑 = 8,000 集 + 2,000 无记忆基线；mini-SWE-agent + gpt-6-luna，裁判 DeepSeek-V4.1-Flash-1017；无记忆 72.95% vs 配置 72.65–73.35%（≤0.40pp，CI 全含零），单集成本 $0.0045–$0.0178（MemGovern +8.8%，TencentDB +293.2%）。
- **五级漏斗数字**：无关 71.5–98.6%/片段；相关性 MemGovern 15.08%、Mem0 1.42–1.43%、TencentDB 28.48%（固定角色块独贡 18pp，剔后 15.9%）；相关未用 51.3–79.7%；复述 Mem0 78.2%（其中 68.1% 词元是 agent 仍可见的副本）、TencentDB 88.4%；TencentDB 99.8% 单集有相关条目，剔固定项后仅 14.3%；采纳 714 条＝421 有益/16 有害/64 无效果/213（29.8%）不可判；**有益条目仅见于 3.65–7.05% 单集**；有益使用单集 23.2% 仍失败、有害使用 16 例中 5 例过关；**260/383 有益使用发生在基线四次全解任务上，基线全不解的 79 任务仍有 73 个未解**。
- **形态集中律（本期核心新事实）**：MemGovern 完整卡片 96.4% 有益/12.5% 词元；TencentDB 完整技能 86.0%/2.0%；Mem0 任务开场召回 75.8%/13.0%；词元效率 MemGovern 50.50 条/百万词元 vs 其余 3.08–4.92（10–16×）。
- **GroupAssistBench（2611.04867，11-03）**：50 群/80,299 消息/构建成本 >$53K；L1 召回（有参考答案）与 L2 使用（开放服务请求，M1 单点/M2 分布/M3 冲突）分离；497 对配对记忆：召回却未用 21–27%（全上下文 11–16%）；未用比例与 L2 排名 ρ=0.89，召回本身仅 0.56；未用拆 36% 未进输入（cue 依赖；L1 点名时 6 套中 4 套取回 84–100%，词面重叠使覆盖率 62%→83%）/64% 进输入未用；缺失证据占比 LightMem 74%、xMemory 22%、EverMemOS 14%；RER 平均 +1.77pp、M3 +4.04；**成本与 BEQ：LightMem $69.6、EverMemOS $814.9，后者需 11,138 次查询回本**。
- **MemSidecar（2611.00779）**：调度与执行解耦，Hooks 41.23% / Foresight 44.34%（MCP-Persona）；读仍同步但发起点外移（补第 11 期）。
- **首个按使用次数调度的产品**：dsh-memory-tide（DSH 插件）热/冷两层，`promoteHits=3` 钉住、冷层 `coldPromoteHits=5` 浮回、`pinMaxDays=90` 解除、`coldMaxFiles=120` 按日期删；`usage.json` 按自然日去重（同日多次记一次）→ 频次在生成端被抹平。**使用只用于晋升、不用于淘汰＝单向棘轮，全行业唯一正确形态且是无意中实现的。**
- **其余六项目（11-08 12:00）**：OpenViking 主仓 v0.5.3 未动但插件 0.5.31/0.5.32/0.5.33（11-02→11-06）连发，重心转接入层；TencentDB v2.0.3（L0–L3 四层、团队记忆、3 万★级）为 MemUse 被测系统；Hy-Memory 2.0.14 + MemHub v1.0.6（30B-A3B、chat/working/coding 三类、diff chain 留"为什么改"）；ReMe 插件 0.1.2（私有 outbox / receipt 幂等重放 / 端点独立排水 / 413 暂停会话 / owner 锁）；dsh-memory-evolve 五轨 + reviewEnabled 每 10 回合（默认关），push 停 10-29、37 open issue，**星数三口径 446/645/665 并存**；AML 二期 11-08 仍未出。
- **判读**：①倒挂第二十一次（形态与计量的最好证据全在论文与社区插件）；②**利用率是唯一"厂商越强越不愿公开"的指标**——不是能人没做，是能做的人没动机做（与此前"倒挂"性质不同）；③榜单在给"形态配置"打分却报告为"系统能力"分；④口径缺口第二十一次（AML 三赛道两榜无"使用"维）；⑤记忆改变顺风局成本、不改逆风局上限→定价应按"节省"卖而非"增强"卖。
- **待验证 154–159**：154. AML 二期榜单口径（11 月中，最高优先，11-08 未出）；155. 记忆产品首次导出"每条送达/采信次数"；156. NRR/HCR/CPB 三指标进产品面板或评测首例；157. 形态配比（卡片/技能/开场/常驻）作为可调参数的 SDK 首例；158. `usage.*` 字段族进 MCP 或记忆 schema（含同日去重口径声明）；159. "记忆使用报告"作为产品功能的首例（预测 12 个月内，本地优先阵营先出）。

## 五之二十三 记忆的个性化与画像事实（第 31 期，2026-11-08 13:00）

- **主线**：拿掉前 30 期"记忆对象是可指认事实"的最后预设。记忆库混装两类异构对象——事实（可溯源）与画像（系统推断的"你是什么样的人"）；个性化是独立一类，不是事实记忆的 user_id 特例。
- **The Algorithmic Self-Portrait（ACM WebConf 2026）**：80 用户 GDPR 取证，1,058 对话/22,971 轮/2,050 条记忆；**95.9% 系统单边写入（仅 4.1% 用户明确要求）**；52% 含心理状态推断（欲望 73%+意图 16%）；28% GDPR 个人数据、7% 特殊类别（健康 61%）；84% 可溯（4% 无依据）；逆向复刻相似度 60–70%；全量记录使敏感占比 28%→31–35%；Attribution Shield 写前改写 94–100% 降归因、87–91% 保实用性。
- **Reglos（2611.06049，11-04）**：双循环（记忆内循环 append-only+时态字段/偏好 supersede；框架外循环编码 agent 提补丁+跨家族 critic 防 gaming+冻结评估器）；**31% 失败为"证据已给、决策错"＝组装层问题**；PersonaMem-v2 61.3%/LME-S 84.0%（Qwen3.8-27B）、57.5%/87.2%（GPT-5.6 Luna），胜 Mem0/MemOS/EverOS。
- **PersonaMem-v3（2608.21381v2）**：GIST-Bench 200 用户/100 万+事件/人均 4,000+，**63.8% 隐式负信号**；六平台 user worlds；20+ 心理学框架约束 persona；**over-personalization 首次成独立维度**且记忆模块对其影响"模型相关甚至相反"；自演化记忆迭代压缩患 lost-in-the-middle。
- **ANCHOR（2607.28818，Salesforce）**：2,008 会话/27 personas/4 模型；persona collapse 与 behavioral drift 分离测量；轨迹召回均值 44.4%、user-state 近四选随机；问卷保留与 turn-level 行为矛盾且随 evaluator 变。
- **DUALMEM/RoleMemo**：persona-agnostic 中性事实→推理时重解释→出戏；事实/洞察双轨+溯源链接；4B RL 胜 685B；2,052 personas/20,244 queries/32k–256k。
- **六项目（11-08 13:00）**：OpenViking v0.5.3/41.3k★ 无新版；TencentDB L3 Persona 显式层（唯一把画像做一等对象）+DSH 桌面端接入+28.9k★；Hy-Memory MemHub v1.0.6/2.0.14+FP8/GGUF 量化；ReMe 无新动态；dsh-memory-evolve 无新版（push 停 10-29）；AML 二期 11-04 关评测、11 月中出榜、11-08 未出。
- **判读**：①倒挂第二十二次（个性化最强实现全在论文与 harness，产品侧仅 TencentDB L3 与 ChatGPT 黑盒）；②口径缺口第二十二次（AML E 维测"说得出"（54–58 段）而 ANCHOR 行为层近随机——个性化分数系统性虚高）；③本期新观点主张：**画像的正确单位是"分布"不是"条"**——偏好是带置信度的统计对象，LWW 覆盖对画像错误，应贝叶斯式更新；④错误画像=闭环第 9 期的个性化特例，更隐蔽（判断不可指认）；⑤隐私防护正确落点在写入前（Attribution Shield），不在读出后。
- **待验证 160–165**：160. 画像"推断依据"（inference_basis）字段首例（预测 6–12 个月，本地优先阵营）；161. "仅用户指令写入"开关产品化首例；162. over-personalization 进 AML 三期；163. 画像分布式存储（置信度+证据链接）首例；164. AML 二期榜单口径（11 月中，最高优先）；165. Notion 类画像跨应用复制引发的首起错误画像扩散案例。

## 五之二十四 记忆的干扰事实（第 32 期，2026-11-08 14:00）

- **主线**：拿掉前 31 期共同结构"丢失必有事件"（删除/失效/代谢/对账失败/规模稀释五者皆然）。第六种丢失性质不同：**内容在位、未删、未标失效、账面干净，但召不回来**——不是被拿走，是被同类挤掉，因此**没有写入口可治理**。
- **干扰三形态**：①前摄（旧压新，同键多版本累积后问最新值反吐旧值）；②倒摄（新压旧，新写入的近似条目压低旧条目可召回性）；③跨键伪记忆（从未写入的语义中心词被"记得"）。三者与既有五种丢失正交。
- **Sentra 实测（2026-11，自报，方法论另见原文）**：参与率（`1/Σp²`）测得名义 384–1024 维嵌入的**有效维度仅约 16**，方差集中 3–10%（学习表征通性，非单一模型缺陷）；有竞争者时遗忘呈**幂律**、指数接近人类曲线，**移除竞争者后指数降约 50 倍**（时间几乎不重要、邻居决定一切）；经典诱词伪记忆在未调参原始余弦上 **0.583 vs 人类 0.55**，且无置信分可分离；四条结论=相似≠正确 / 大索引更差 / recency 只做 tie-break / 换更强嵌入不解决。解药为写时结构化（valid_from/valid_to/supersedes/source/visible_to）。
- **PI-LLM（"Unable to Forget"）**：35+ 模型，0.6B→GPT-5，同键更新累积下准确率**近似对数线性下降**；**上下文窗口长度对干扰耐力无显著影响**，抗性由每 token 活跃参数决定（Interference Endurance Score）；GPT-5 高干扰档 **71.7%**（~40k 推理 token）；错误三段迁移=近因→扩散→**首因主导**；"忘掉之前所有更新"类指令基本无效，**某些情况下指令本身成为新锚点**，错误向指令位置聚集；自然 Slack 追踪集复现（4 实体/多轮/冲突更新）。
- **MemProbe（2026）**：把四个认知范式做成 agent 记忆行为诊断——AB-AC 配对（分离"更新成功"与"历史保留"）、误信息（考"证据 vs 提及"区分）、巩固强度（强巩固更难覆盖）、再巩固窗口（召回后可改）。**诊断只看可观测响应，不看实现内部状态**，因此跨架构可比。
- **SMART-SLOT（IVA 2026，09-06）**：虚拟病人临床对话，4,320 次召回观测 + 1,080 次陷阱探针；三策略 NAIVE-SLOT（全追加）/RECENT-SLOT（追加+新近排序）/SMART-SLOT（**单值槽位覆盖**）；定义 **conflict density = 单事实更新次数**；SMART-SLOT 召回准确率、跨会话一致性、抗陈旧提示三项全胜且**延迟增加不显著**；固定 ChromaDB、固定检索流程，只变写入策略——因果归因干净。
- **ImplicitMemBench（ACL 2026 Best Resource，哈工大+港大，10-27）**：300 项、三范式（程序性反常规规则/启动效应/经典条件作用），插入多轮干扰后**只看首次作答**；17 模型，最高 DeepSeek-R1 **65.30**、Qwen3-32B 64.13、GPT-5 第三，人类基线 100%；**偏好型 75.0% vs 抑制型 17.6%（差 57.4pp，p<0.001）**；术语回避 4% vs 目录偏好 72%——**"记住不要再做什么"是独立能力维度，不是"记住要做什么"的镜像**。
- **口径断裂（本期最值得记录）**：Mem0 官方技术博客同期撰文，明确"遗忘的主导理论是干扰而非衰减""任何记忆系统最终都会变成干扰引擎"，并用 ADD/UPDATE/DELETE/NOOP 四操作论证去重是认知正当性；而其 **v2 开源版为 ADD-only、无 update/delete**。同一组织内论述与实现相反。
- **六项目（11-08 14:00）**：Hy-Memory hy-memory **2.0.13** / MemHub v1.0.6 / Apache-2.0 / 约 1.9k★（另有 1,922★@11-03 口径），`boundary_envs` 仍为唯一 schema 级作用域，**无 slot 语义、无抑制位**；OpenViking 主仓 v0.5.2.1 后无 release，pending 分支含 Magpie 集成插件（11-01），DSH 插件 **0.1.4**（11-06）；TencentDB v2.0.3 线无干扰相关变更；ReMe v0.4.2.x 纯回顾；dsh-memory-evolve 约 665★、push 停 10-29；AML 二期 11-04 关评测、官方"11 月中旬"，**11-08 仍未出**（首期：MemoraX 58.02 / MemOS 45.89 / NTES 44.21；代码轨 62.00% vs 三家并列 52.00%）。
- **判读**：①倒挂第二十三次（能定义键并覆盖的 SMART-SLOT/Sentra 均非记忆产品）；②口径缺口第二十三次（AML 八维无同键冲突密度、无条件召回、无抑制型）；③**归因修正第 24 期规模律**——不是库大所以笨，是同类多所以挤，库大只是伴随条件（PI-LLM 已把长度效应分离掉）；④**否证第 23 期纠错剂量学单调假设**——口头撤回不是剂量低，是可能新增干扰源；⑤干扰使库容/条目数/写入成功率全部保持好看，只有**条件召回**会掉，故监控天然失明，同时解释第 30 期利用率账本为何看不见价值流失（分母被污染）；⑥**治理悖论**：减少竞争者＝减少证据，无解，只能选键粒度——这也是第 21 期"归约"之所以正确的第二重理由（不是因为短，是把 N 个竞争者收敛为 1 个槽位）。
- **待验证 166–172**：166. AML 二期榜单口径（11 月中，最高优先，11-08 未出）；167. `slot`/`key` 进记忆或 MCP schema 首例（预测 3 个月内）；168. 条件召回（写竞品前后同题复测）进 AML 或产品 self-check 首例；169. 抑制型字段（`avoid.*`/`negative.*`）进 schema 首例；170. PI-LLM 的 IE 分数与参数量关系在记忆产品侧复现（是否同样与窗口无关）；171. Sentra 有效维度 ~16 与 50× 结论的第三方复核；172. 抑制型能力是否可经训练获得（ImplicitMemBench 17.6% 的天花板来源：数据、架构还是目标函数）。

## 五之二十五 记忆的积累曲线与收益三分账事实（第 33 期，2026-11-08 15:00）

- **主线**：第 16 期问"记忆从哪来"，本期问"记忆什么时候值钱、值多少、值在哪一栏"。核心命题：**记忆几乎不提上限，只提前起跑**——终点增益不成立，收敛增益五家全正。
- **收益三分账（长期复用口径）**：起跑线（init，首个有效解得分）/ 收敛（search，固定预算内 best-so-far 曲线归一化面积）/ 终点（outcome，最终提交得分）。任何记忆效果主张都必须写明是哪一栏，否则不可比。
- **2611.05108（Continual AutoResearch）实测**：5 个前沿 Agent 走各自原生 CLI harness（Sonnet 4.6/Opus 5 用 Claude Code；GPT-5.4/GPT-5.6-Sol 用 Codex；Kimi K3 用 OpenCode）；4 域 9 家族，每模型 32 个迁移任务（排除每流第 1 个），默认 30 分钟预算；中间提交分对被测 agent 隐藏。终点增益：Opus 5 **−0.9**、GPT-5.6-Sol **−0.8**、GPT-5.4 +0.2、Kimi K3 +0.4、Sonnet 4.6 **+7.6**。收敛增益全正：+7.5 / +6.1 / +21.3 / +20.9 / +3.0。首有效解时间（S/R）：7.7/11.1、6.1/8.5、9.5/18.7、7.7/16.3、8.4/9.2 分钟。
- **只买时间的证明**：扣除"首解奖励"后，五个模型的收敛增益**全部转负**；仅 Sonnet 4.6 在"同等候选数"（+6.5）与"去除首解延迟"（+6.6）两重对照下仍为正。即记忆的价值集中在"第一次能动手"那一刻，之后的优化记忆不帮反拖。
- **早期集中律**：预算 25%/50%/75%/100% 处平均领先 **+24.0 / +15.7 / +6.5 / +1.2**（衰减约 20 倍）；期末仅 Kimi 与 Sonnet 仍为正。重置版靠任务内探索追平——预算越大，"更早起跑"越不值钱。
- **负迁移率**：Opus 5 **65.7%**、GPT-5.4 48.1%、GPT-5.6-Sol 40.7%、Kimi K3 38.0%、Sonnet 4.6 33.3%。机制两例：高度特定卡片把 Sonnet 锚定到更弱模型族；上一任务经验套得过猛，用"过拟合候选"替掉稳健候选。这是第 29 期"能力的诅咒"的第二次独立验证，机制更锐——**能力越强，越有能力把不适用的经验执行到底**。
- **相关性无关期（本期最硬）**：记忆消融（Energy-systems 流，每任务全新会话，仅通过 agent 自撰 insight cards 传递；卡片六字段=主张/证据/置信度/适用范围/推荐行动/失败条件）。matched 对 no-memory 最终增益 Sonnet **+14.7**、GPT-5.4 **+5.0**；shuffled（无关流等量卡片）对 no-memory **+14.9**、**+4.8**——几乎相同。matched 减 shuffled：Sonnet −0.2、Opus +1.0、GPT-5.4 +0.2、GPT-5.6-Sol −3.2。结论：冷启动期起作用的不是"记住了什么"，而是"有没有一张结构化卡片"。
- **积累曲线的下降沿**：流长 3→5→7：初始化增益 +3.56→+5.53→+5.34（走平），收敛增益 −1.75→−3.61→**−31.44**。操作失败率则分化：Sonnet 30.7%→7.7%、Kimi 11.4%→1.8%、GPT-5.6-Sol 反向 1.7%→8.3%。前 2—3 个任务在攒"能用的"，第 6 个之后在攒"该扔没扔的"。
- **写手先于数据**：Memento（2611.00244）——GPT-5.5 在 337 条测试上零压缩笔记；GLM-5.3 12,000 rollouts 零有效笔记；Qwen3-8B 约 6%；无 SFT 预热则 RL 20 步内频率归零。对照 Hy-Memory-30B-A3B（2610.22196）宏均 55.49 vs Opus 5 54.62。冷启动不是时间问题，是能力问题。
- **起点是约束不是资产**：EvoGroup（2611.03868）六工具起手 → EverMemBench 留出集 71.07%→**89.58%**，超人工设计 Claude Code harness **85.83%**，冻结后在 GroupMemBench 仍泛化；MemSkill（NeurIPS 2026，2602.02474）四原语（add/update/delete/skip）+ Designer 失败分析，跨模型零样本迁移有增益。反面：DAEDALUS（2610.08048）不做"连续成功三次"验证时，攒记忆比无记忆**更差**；加闸门 +4.5pp（消融口径）。
- **取消积累期的路线**：Memorilla（2610.21375 v3，11-03）把整个文档集合压成 16 个 query-dependent memory token，FactKG 84.33% vs 全上下文 80.43%，token 少 108×；TextWorld 18.6%→24.2%。
- **产品侧（11-08 15:00）**：Hy-Memory MemHub **v1.0.6**（11-06）onboarding 首屏三档 lite（无 LLM，存原文直检）/pro/ultra，更换嵌入模型可安全重整理；hy-memory 2.0.14、1,922★@11-03。OpenViking **41,402★**/AGPL-3.0，`viking://resources` 可 `ov add-resource` 导入、`viking://user/{id}/memories` 只能会话后蒸馏——**知识可导入，记忆不能**；DSH 插件 0.5.4（社区派生版）。TencentDB Agent Memory v2.0.3-beta.1，第三方评述以其"解冷启动"为卖点（历史工作轨迹→Chat/Skill/Wiki/CodeGraph 四类资产），计费 0.02 元/万条/小时 + 0.01 元/Credit/小时。ReMe 0.4.2.x；dsh-memory-evolve 665★ 停更 10-29。社区结构种子：gentle-ai 8.4K★（curated skill library + 教学 persona）、obsidian-mind 5.5K★（vault 模板）、EverOS 13.8K★（Markdown 原生）、capsule-memory 8.4K★。AML 二期 11-04 23:59 关评测队列、11 月中旬出榜、**11-08 未出**。
- **判读**：①**口径缺口第二十五次，且首次获得方向性解释**——不是少一个维度，而是所有榜都在终点那一栏打分，而记忆只兑现中间那一栏；②倒挂第二十四次（结构种子最完整的是社区模板项目，非记忆产品）；③**修正第 16 期**导入风险定级：冷启动期内容相关性不兑现，导入的真实风险不是"不干净"，而是"把骨架定死"；④**修正第 21 期**计价口径：记忆应按"节省的墙钟时间"计价，不按"提升的准确率"计价；⑤负迁移无闸门是当前最空的产品位（33—66% 的任务上记忆有害，无一产品在写入时判断"这条经验会不会被误用"）。
- **待验证 173–178**：173. AML 二期榜单口径（11 月中，最高优先，11-08 未出）；174. "库龄曲线"（第 N 天可用率/拐点任务数）进产品文档或榜单首例；175. 首个把"任务位置"当自变量的记忆榜单（现仅有 harness 论文）；176. 结构种子（六字段卡片模板）被标准化进 SDK 首例；177. 负迁移闸门（写入时"适用域"判定）产品首例；178. "收益三分账"被任何厂商用于宣传口径首例。


## 五之二十六 记忆的离线加工（睡眠期）事实（第 34 期，2026-11-08 16:00）

- **主线**：拿掉前 33 期共同前提"一次写入对应一次请求"。记忆有两个写入口：有请求的（在线）与无请求的（离线）。行业把准入、权限、删除、审计全建在在线路径上，离线路径正成为唯一能改记忆却无人见证的通道。
- **双写入口（新结构口径）**：请求驱动写=带上下文/主体/权限/预算；调度驱动写=由 cron、轮次计数、会话提交、显式 `evolve()` 触发的批处理，无请求上下文。**离线产物的"写入时刻"不唯一**——它是一次 run 的产物，不是一个事件的产物。
- **巩固四道判断**（社区口径，长期复用）：合并什么/泛化什么/丢弃什么/重构什么。要害：合并是损失性的且**比遗忘更难撤销**（"两条不同"的证据就在差异里）。现有墓碑三字段只能记替代关系，记不了差异去向 → **差异不可恢复性**。
- **睡眠期复活（本期最硬机制）**：离线加工输入原始 episode、输出新摘要节点，与墓碑不相交 → 已删内容可被重新生成。三个实证：Zep 11-03 changelog 修复"摘要把已删违规文本复制回来"；删除复盘（注销三周后，另一客户在客服回答中获知已删用户的雇主与前供应商，来源是 agent 自撰"相似案例"摘要；另有旧 run compaction summary、语义缓存、两季前评测集、此后每次备份四处副本）；工程侧"删除标记被后续写入覆盖，旧记忆复活"（根因：删除不单调）。**结论：删除是图遍历，且必须每夜重放。**
- **增量≠全量（Zep 论文自白）**：标签传播动态扩展会逐渐偏离全量运行结果，**仍需周期全量刷新纠偏** → 同一库两次 run 产物不同，离线路径没有 golden，canary 行为 diff 失去基准。目前唯一把变更落盘的是 OpenViking 的 `memory_diff.json`（归档目录，每次 commit 写一次）。
- **频率旋钮三拧**：Letta 每 5 轮重写共享记忆块＝周期性改 system prompt 前缀 → **睡眠期是缓存杀手**（承第 14 期），故"离线用便宜模型"的第二重理由是保护在线前缀缓存命中率；同时拧新鲜度、离线账单、在线缓存三项，厂商只公布第一项。
- **离线模型选择方向相反**：Letta 建议 Haiku（省钱）/ LightMem 在线 SLM、离线大模型（提质）/ Language Models Need Sleep 把算力移出答案路径（保时延）。差异是目标函数差异，不是精度差异；行业无离线验收指标。
- **唯一成文的离线负面清单**：LightMem 提示层禁存整段对话、禁跨用户抽象——恰好砍掉最危险的两道判断，但只在论文附录，不在任何产品文档。
- **计费单位错配**：记忆按条·小时计价（TencentDB 0.02 元/万条/小时），巩固按 run 计价；一次夜班可重写上万条，算力不在存储账单里。
- **六项目（11-08 16:00）**：OpenViking 41.3k★、commit 后异步抽取 + `memory_diff.json`；ReMe `dream_cron` 23:00；Hy-Memory 2.0 ultra `evolve()`；TencentDB-Agent-Memory 30.3k★、61.38% token 降幅；dsh-memory-evolve 665★ "后台自我进化＋回合内自审"；AML 二期 11-04 截止、11 月中出榜、11-08 未出。
- **判读**：①倒挂第二十五次；②口径缺口第二十六次（AML 八维无"离线重跑一致性"、无 run 级审计）；③**新观点**：睡眠期同时是缓存杀手与成本黑洞，频率是最被低估的架构参数；④删除在离线路径从不重放——第 2 期空位在离线维度的二次暴露。
- **待验证 179–184**：179. AML 二期榜单口径（11 月中，最高优先，11-08 未出）；180. `write_origin`/`consolidation_run_id` 进记忆 schema 首例（预测 6 个月内）；181. 巩固前墓碑预检（命中即拒绝生成）产品首例；182. "离线重跑一致性"（同库两次 run 产物差异率）进任何榜单或产品自检；183. run manifest（给机器读的巩固审批单）首例；184. 厂商公布"每次巩固重写的条目数/替换比"首例。

### 第 35 期（20261108-1700）· 记忆的观测面
- **可观测性首个产品（11 月 MemoryLake）**：per-retrieval 指标（延迟/命中/输出 token/召回条数）、OTel 原生 trace、Datadog 等 APM 集成、**带来源的读写访问日志**、内置增长/驱逐/命中面板；自述"记忆是最后一个未被观测的层"。企业版可 VPC 自托管。
- **行业词汇成型**：Inferensys 术语表收录 "Memory Dashboard"，面板项＝延迟 p50/p95/p99、吞吐、命中率、错误率、并发、top 查询、相似度分布、**空结果率**、增长趋势、驱逐日志、**嵌入漂移**、schema 变更史、合规/擦除日志、关联 ID trace。并列出 2026 观测指南记忆四件套：**新鲜度 / 嵌入漂移 / 检索准确率 / 跨 agent 冲突**（分别对应第 11/13/20/12 期主线）。
- **PACMI（arXiv 2610.05732，2026-10-05，Yiqi Wang 等 7 人）**：带类型依赖边的溯源图 + **四态有效性格（有效/继承有效/待核/作废）**；新证据沿边**级联作废**；作废≠销毁（保留作历史证据，供"过期前提侦测"）；自建 100 例/300 查询/5 域诊断基准，答案准确率最高（McNemar 显著）、前提检查 P/R/F1 全 1.0；**移除级联后答案错误 3→11，配对差异未过 0.05** → 级联主要修的是记忆状态而非答案。
- **依赖引导回滚修复（arXiv 2608.10502）**：typed memory-to-action 图，从故障记忆追下游数据流；对每个下游判断"是否有独立可信证据"——有则保留、无则隔离；确定性 planner 删源→隔离无支撑派生→作废无支撑 trace 输出→只重放答案相关步骤。150 例（购物/差旅/客服，4 类故障）+ 50 条 LongMemEval-V2 改编轨迹；**即时恢复最高、成本低于 LLM-judge；但复发 26.6% vs LLM-judge 12.1%**。→ **"已修复"≠"不再犯"，且可反向（精准修省成本但复发高）。**
- **AML 二期细节（11-04 23:59 关闭，11 月中出榜）**：文本轨 6,000+ 实例/32 数据源/约 3 亿 token；代码轨 300 实例（150 任务×相关+噪声两条件）/12 仓/18 亿 token；多模态近 5,000 实例/7 源；奖金 $22,000（仅开源方法组）；七维剖面公开：MemoraX 58.02（H 58.39 / G 29.99）、MemOS 45.89（**G 9.82**）、Cognee 42.61（G 27.11）、TencentDB 41.48（G 28.66 / H 34.84）→ **单维极差 9.82–58.51，近 6 倍**。
- **六项目（11-08 17:00）**：OpenViking 41.6k★、2000 commits/200 issues/450 PRs、检索轨迹可视化（为何召回，非健康度）；TencentDB 29.9k★、`MemoryPanel` 独立目录、v2→v3 迁移、MongoDB 实验后端；MemHub **v1.0.6**（11 月，11 语言、lite/pro/ultra、ultra 每晚整理、hy-memory 2.0.14、写入自动重试+模型异常暂停排队、可换嵌入模型）、30B-A3B FP8/GGUF 上 HF；ReMe v0.4.2.1、Qoder 插件（10-29）、决策模型上下文压缩（14 查询定长摘要 Top-N + 强基线）、`ReMe Status`；dsh-memory-evolve 645★/71 fork/37 issues、末 push 10-29、`reviewEnabled` 每 10 回合、**同名双包**（csyangwen 版 / azure5100 huahua 版 README 亦自称 dsh-memory-evolve）；GDB-Engines 11 月图记忆榜 Memgraph 67.1 / FalkorDB 64.4 / SurrealDB 60.5。
- **判读**：①倒挂第二十六次；②口径缺口第二十七次（九方案无一报爆炸半径、无一报复发率）；③**新观点：记忆运维的 SLI 该是 MTBR（复发间隔）而不是 MTTR**——修得快不如不再犯；④**面板即合同**先于指标进评测（榜单半年一轮、面板每周可改）；⑤**用答案准确率验收会系统性淘汰级联**（3→11 不显著）；⑥凡暴露能力上限的指标一律不进面板（同第 24 期库容曲线、第 30 期利用率）。
- **待验证 185–190**：185. AML 二期正式榜单（11 月中，最高优先）；186. 首个报"作废传播深度/爆炸半径"的面板；187. 首个公开复发率的产品；188. 陈旧率进 SLA 首例；189. `derived_from[]` 依赖边进记忆 schema 首例；190. 记忆插件**构建指纹**（同名不同包治理）首例。

### 第 36 期（20261108-1900）· 记忆的用途分离（consent / purpose）
- **监管首次单独立规（BayLDA，2026-11 初）**：德国巴伐利亚州 DPA 发布 AI Agent 的 GDPR 指引，并把 Agent 列入 **2027 年审计清单**。三句关键表述：①"**把内容存进 Agent 记忆，不等于用它训练模型；合法的记忆使用不能使训练变得合法**"（记忆与训练是两个处理活动，须各自合法性基础）；②"**记忆需要自己的合法性基础**"，须回答是否需要永久存储、存多久、如何按人/按目的分隔、如何纠正与删除；③"**Agent 永远不是控制者**"，责任按 Art.4(7)/26/28 落回部署者。另：Art.15/16/17/19 的数据主体权利**覆盖 Agent 记忆与自生成评估**（"某人的可靠性评估"本身即个人数据）；Art.22 明示"**形式上人工确认不算人工复核**"。七项审计风险清单：非预期访问 / 不当关联 / 非预期披露 / 持久存储 / 不准确信息 / 指令被操纵 / 可追溯性不足。
- **Gemini（11-04 曝光，HN 318 票）**：个人账号（含付费订阅）**无独立训练 opt-out**；唯一开关是 Keep Activity，一旦关闭，会话 **72 小时后删除，长期记忆归零** → **记忆门与训练门结构耦合**。人工审阅样本最长保留 **3 年**，用户事后删除活动记录不影响；默认 18 个月自动删除（可改 3/36 个月或关闭）。
- **ChatGPT**：训练开关（"Improve the model for everyone"）与 Memory 设置**相互独立**；但《Algorithmic Self-Portrait》（ACM Web Conf 2026，80 用户 / 1,058 会话 / 22,971 轮 / 2,050 条记忆）实测 **95.9% 记忆为系统单边写入，用户显式要求仅 4.1%**（84 条）；52% 含心理状态推断（欲望 73% / 意图 16%），28% 触及 GDPR 个人数据，**7% 属特殊类别（健康 61%）**；84% 可在原始对话中找到文本依据，明确无依据仅 4%；删除后 30 天内永久清除。
- **Claude**：Memory 独立 Tab，Free/Pro/Max **默认开启**；训练开关为 "Help improve our AI models"（默认态未公布）；**已评分（点赞/点踩）会话保留 5 年**；incognito 不入训练。
- **三家的共同旁路（本期最硬细节）**：**点赞/点踩可使整段会话进入训练，即使已全局 opt-out**；OpenAI、Google 明示，Anthropic 保留五年。→ 全局同意被**单次交互动作**击穿，且无法用权限系统修复。
- **SciXa《Privacy Boundaries in Agent Memory》（2026-11）**：**最小化决定"什么东西存在"，用途限制决定"每条已存在记录被允许做什么"**；用途限制＝接口契约（"不得把一个声明用途下采集的数据静默用于另一用途"）；最小化应重述为**爆炸半径与未来义务规模控制**（每多存一条＝多一项将来的访问/纠正/删除义务）；主张**按用途分别做最小化**（episodic 只在需要溯源时保留，semantic 蒸馏承担多数检索）；字段级最小化（偏好记录只需 attribute/value/confidence/provenance/timestamps）；删除 happy path 应为小时—天级（GDPR "无不当延迟" 与 CCPA 45 天留有解释空间）。
- **删除残留量化（DR，arXiv 2610.21405，港科广 + 中国科大，10-15）**：456 个人工埋设秘密、**native / residual 双指标 + hidden-risk share**、5 种记忆设计 × 4 LLM × 3 删除基线；**LLM 引导删除后仍有 39%–76% 残留证据可被同一读取模型拼回**（合并证据可还原 96–99%，单一证据 0%）；只测文本记忆，不含多模态与参数化记忆。
- **用途分离的物理实现（MemPrivacy，arXiv 2605.09530，MemTensor/荣耀/同济）**：设备侧检测敏感片段 → 替换为**带类型占位符**（保留健康/邮箱/姓名等语义类别）→ 云端在占位符上正常记忆与推理 → 本地回填原值；**效用损失 ≤1.6%**，可逆设计。→ "数据不出设备"即用途限制的硬件化。
- **TaskMem（arXiv 2605.31075，字节 Seed/复旦）**：把"写什么"变成 RL 可学习策略，VideoMME 61.6→67.9。与 MemPrivacy 同一道门的两侧（该不该留 / 能不能出）。
- **测评市场金融化（新事实）**：Bittensor **Subnet 118 · DittoBench**（bench v17，2026-11-08 06:04 UTC 快照）：miner 提交 agent-memory harness，综合分＝**50% 工具调用 + 50% 记忆召回**，最佳 beast-d41 0.951（工具 1.000 / 记忆 0.952），最快中位 4.1s（Tessellate）。→ **记忆能力首次被代币激励定价；只奖励可测项，用途合规不可测故不会被挖。**
- **六项目（11-08 19:00）**：TencentDB-Agent-Memory v2.0.3-beta.1（10-13，可插拔决策服务 + 会话轨迹记录）、v2.0.2（10-09，MongoDB 实验后端）、L0–L3 + 四资产（Chat/Skill/Wiki/CodeGraph）、Memory Hub ACL、OpenAI/Anthropic 协议兼容 Proxy、计价 **0.02 元/万条·小时 + 0.01 元/Credit·小时**；Hy-Memory **2.0.13**（2026-11，Apache-2.0，1,922★@11-03，30B-A3B≈3B 激活，宏均 **55.49** vs Opus 5 54.62、LoCoMo 72.6%、每题 token 1,159→**703**（−39.3%）、CodeMemoryBench 64.2%/SWE-ContextBench 28.3%，腾讯内部金融/资讯/知识管理/办公/社交/游戏已接入）；OpenViking v0.5.3（AGPL，41.3k★），**DSH 记忆插件 0.5.33（2026-11-08）**、`viking://~/memories|skills`、无 uid 简写被新服务器拒绝、Issue #6938（0.5.x Windows wheel + Python 3.14 原生崩溃）；ReMe 0.4.2.x；dsh-memory-evolve 665★；ReMe2Ops 仍无独立实体。
- **AML 二期**：11-04 23:59 关评测，官方口径"**11 月中旬**发榜"，11-08 19:00 **仍未出**；一期文本商业榜 MemoraX 58.02 / MemOS 45.89 / NTES 44.21，代码轨 62.00 vs 52.00×3。
- **判读**：①**倒挂第二十七次**（最硬的用途分离实现全在论文/端侧/合规研究，产品侧只加了开关）；②**口径缺口第二十八次**（AML 契约只固定 Add/Search，无 `purpose` 位，参评系统无需声明"为何存、能否用于训练"；DittoBench 只奖召回）；③**参数轨不是技术路线而是合规路线**——一旦写入器输出可回流权重，用途分离在物理上失败，此为第 2 期"参数轨注销全失能"的法律定性；④**开关数量≠正交**：四道门（历史/记忆/训练/审阅）中，Gemini 记忆门挂训练门、反馈是全局 opt-out 的旁路、审阅不受任何开关控制，用户以为做了四个选择，实际只有两个状态；⑤**集合级动作缺位**：删除是条目级、用途限制是集合级（"停止一切以训练为目的的处理"需按用途扫全库含派生物），数据模型无"用途"维度故扫不出来；⑥**同意扩张 consent creep**：巩固链每跳（写→合并→抽象→跨会话→跨用户）都在扩权，全部沿用最初那一次同意；⑦**责任与能力错配**（BayLDA 定"Agent 非控制者"，但抽取策略/巩固调度/单边写入比例全由厂商决定）＝第 8 期"裁者缺位"的法律版。
- **待验证 191–196**：191. AML 二期正式榜单（11 月中，最高优先）；192. `purpose_scope` / `learn_eligible` 进任何记忆 schema 首例（预测 6–12 个月）；193. "按用途整体停用"接口首例；194. residual 残留率进产品文档或 SLA 首例；195. 巩固前"用途交集检查"（交集为空则禁止合并）首例；196. 反馈动作（点赞）是否可被单独排除出训练的产品首例。

### 第 37 期（20261108-2000）· 记忆的语言性（计量单位与归一化）

- **核心命题**：语义单位（条）与计费单位（token）之间没有固定汇率；汇率由分词器决定，而分词器是厂商的商业选择。**"中文税"不是语言税，是词表税。**
- **计量实测（2026-11-04，41 个词表文件，维基中文 2,990 万码点，tiktoken 0.14.0 / tokenizers 0.23.3）**：中文 token/字 **0.70—1.44，同文本差 2 倍**；OpenAI 自家 o200k **0.89** vs cl100k **1.31**（差 47%）。另有繁体法规平行语料：繁中/英 **0.66—1.53**；o200k 英文仅少 2%、cl100k 少 35%；**DeepSeek 与 Qwen3.8 英文反比繁中多 24%—36%**。混元宣称 1 token≈1.8 汉字、GPT-4≈1 汉字（万字文 5,500 vs 10,000 token）。**Claude Opus 4.7 换分词器：官方写明同段文本可多 0—35% token、单价不变；实测总耗为旧版 2—2.7 倍**。cl100k 中文比英文贵 68%，o200k 只贵 11%。
- **归一化与生僻字**：带 NFKC 的词表把全角逗号折半角，**约 85% 中文行被改写**；日文 Stockmark-2 归一化改写 51.5% 行；字节级词表保住扩展 B 区 **4.2 万字**（约 4 token/字），**BERT-Chinese / XLM-RoBERTa 几乎全替换为 UNK**。词表 65K→250K 使中文从"半词断裂"走向"整词"。
- **切分塌陷三例**：① FTS5 `unicode61` 把整句中文当一个 token，BM25 失效（dsh-memory 生态共因故障，与第 2 期同根因；**dsh-ltm 0.3.3 为首个针对性修复**：CJK 分词 + BM25/字符 n-gram 混合重排 + Jaccard 0.8/余弦 0.92 去重 + `revision` CAS + 90 天 stale）；② 纯前端 freeapp：中文按空格/标点切词后两串交集恒为空、Jaccard 恒 0、去重失效，解法为标点切整词 + 汉字 2-gram 滑窗（上限 64）+ 分类阈值 0.72/0.78/0.80；③ 归一化层（见上）。
- **跨语言检索（ACL 2026 CSR-L / CS-MTEB）**：语码转换查询全线掉分 **−2.38—−12.36**；BM25 −6.56、**ColBERT v2 −13.78（最差）**、Qwen3-Embedding-8B 原分 69.88 仍 −3.86、e5-large-v2/all-MiniLM 约 −12.5；CS-MTEB 11 任务最大 **−27%**，e5-large-v2 中文 55.91→40.70。诊断：语码转换查询在嵌入空间远离单语孪生；词表扩展只补一部分。旁证：**语言方向 PCA 第一主成分单维分类 96—100%**，推理期投影使码切换指数降 63—99%。
- **基准与产品**：BabelArena（23 语言/15 书写系统/702 任务/16,146 实例；组件完备本地化含工具描述与环境语料；**评分标识符故意留英文**；BabelFlow 断引用 20.0%→2.5%、行为错配 5.0%→0.0%）；AURORA（Multilingual MultiChallenge 含上下文记忆；**Command A+ 韩 −18.2pt、波斯 −19.2pt**；Gemini 3.8 Flash 每个非英语语言第一且单任务成本<1/5；Opus 5.5 语言切换率 −80%；**每 token 便宜≠每任务便宜**）；MedMemoryBench（NeurIPS 2026，中英双语、中文 598MB、20 人设/2,020 轮/1,986 查询/14 方法）；DuplexLedger（1,094 中英会话、6,564 问、最佳终态覆盖仅 2.01%、ACT-Mem 892 万参数 4.11%→8.68%）；LongMemCode（16 语言/8,000 场景/去 judge）；LongMemEval-V2 LAFS（75.6%@130.5s +2.82 vs 81.4%@153.6s +0.32，分数与增益反向）。
- **六项目（11-08 20:00）**：OpenViking v0.5.3 + DSH 插件 **0.5.33（11-08）**；TencentDB-Agent-Memory 30,363★；Hy-Memory **2.0.13** / MemHub v1.0.6（11 语言）/ 1,922★；ReMe 0.4.2.x；dsh-memory-evolve 665★（末次实质提交 10-29）；**新增观察对象 @tr1v3r/dsh-ltm 0.3.3（MIT，CJK 感知）**。AML 二期 11-04 23:59 关评测、**11 月中发榜，11-08 20:00 仍未出**；首期 136 队报名/67 系统完成评测/30 万访问。
- **判读**：①**倒挂第二十八次**（唯一做 CJK 检索的是社区插件，唯一做跨语言对照的是基准方）；②**口径缺口第二十九次**（AML 无语言分层；中文市场无可比公开分，双语对照仅 MedMemoryBench 医疗域）；③**归一化即写入＝第四个写入口**（在存储前改写、无墓碑、不可回溯原文形态），与注销（第 2 期）/可携（第 13 期）/回归（第 23 期）三处正面相撞；④**分词器是第二扇单向门**（换分词器＝换计量单位，历史账单、预算上限、缓存前缀、NPV 四本账同时失真）；⑤**UNK 静默消失是空集第五义**（从未被表示，无负样本，比误召回更难查）；⑥**翻译即改写**（跨语言共享记忆必须标"不可翻译片段"，否则第 21 期归约会把 key 归约掉）。
- **待验证 197–202**：197. AML 二期正式榜单（11 月中，最高优先）；198. `lang` 字段进任何记忆 schema 首例；199. 按语种分层报告的榜单/面板首例；200. `verbatim`（禁改写标记）进交换格式首例；201. 归一化后原文可取回的产品首例；202. 按"每任务记忆成本"报价首例。

### 第 38 期（20261108-2100）· 记忆的环境学（环境分离与夹具化）

- **核心命题**：前 37 期共享最后一个未言明预设——记忆库只活在生产里，测试时要么不存在要么被理想化。本期拿掉它：**记忆是软件工程里唯一没有预发环境的持久状态**；记忆依赖的 agent 在记忆状态进夹具之前不可复现（"对同一可变共享库跑两次同一任务，是两个不同实验"，zorost）。
- **测试话语权移交（11 月第一周集中出现，全部来自测试工程/标准社区而非记忆厂商）**：zorost 架构指南把"记忆如何弄坏评测"列为一等章节 + 夹具三实践（per-case 播种重置／**断言写路径**（停止持久化纠正的回归对输出评分不可见）／植入陈旧记录验证拒用——"会拒用错记忆才配见客户"）；automater **三臂擦除式基准**（无记忆/候选产品/本地 transcripts，臂间擦除库+工作树+会话态，"臂间泄漏是基准假结果最常见来源"，夹具 1/5 植陈旧、1/10 植跨项目噪声，manifest 哈希冻结）；n4n **不可复现二源**（wall-clock recency + 向量随机性，freezegun 冻结时钟+固定种子最低配，六产品均无时间冻结评测模式）；QABattle 隔离包（`must_not_recall` 零容忍、CANARY_U2 跨租户探针）；QABattle 十错误清单（并行 CI 共享可变库交叉污染等）。
- **环境分离四件套（ainomam，中文社区）**：提示词/工具/评测集分环境已成实践，**记忆是最易漏项**——同一向量库同一 collection，开发机测试对话污染生产检索且难察觉（"检索出的历史上下文看着像真的"）；基线：dev 独立命名空间 / staging 脱敏副本 / prod 生产。fastio 补嵌入模型对齐与数据漂移检测；finexus "治理即服务"能对数据库表按需给 MCP 掩码副本（90 秒），**记忆库无等价物**。
- **compelstandard 标准草案**：agent 复合版本 = model+prompt+tool+policy+**memory schema version**，记忆是"被遗忘的一维"；记忆版本化三模式——嵌入 pinning（承接第 13 期）／**晋升点记忆快照**（"不快照则 canary 期间投毒会活过回滚"，连接第 12 期投毒×第 23 期回归）／按 provenance 过滤旧版本写入。
- **三跑对照（akkawi）**：无记忆=下限、oracle=上限、生产=现实；oracle−生产=检索+写质量差距，生产−无记忆≈0 则记忆徒增成本——把"记忆有用吗"与"记忆系统好吗"分离。
- **六项目（11-08 21:00）**：OpenViking v0.5.3、41.3–41.6k★口径不一、周+448★、DSH 插件 0.5.33；TencentDB-Agent-Memory 30.5k★（腾讯云 org、v2.0.3 stable 10-26、路线图下一项观测面板、MIT 被 GitHub 检测器标 NOASSERTION）；Hy-Memory 2.0（10-16 三层全开源、30B-A3B Apache-2.0、宏均 55.49 vs Opus 54.62 自报未复现）；ReMe 0.4.2.x；dsh-memory-evolve 665★（末次实质提交 10-29）；ReMe2Ops 仍无独立实体。
- **AML 二期**：官方页 11-08 仍 "Cycle 2 in progress"，月中原定发榜进入倒计时；一期全剖面公开，MemPalace（60.4k★）39.48 进文本商业榜第 9。
- **判读**：①**倒挂第二十九次**——夹具/种子、擦除纪律、三臂对照、写路径断言，方法论最完整的全在测试工程社区，记忆产品全线空白（对比表 10 对象六维：夹具接口/环境隔离/晋升快照/三跑对照/写路径断言/脱敏导出，产品侧仅零星△）；②**口径缺口第三十次**：AML 固定了数据版本与 Add/Search 接口，但参评系统**评测期间记忆状态生命周期**（题目间是否清库、跨题污染）无披露位——榜单分无法区分能力与上一位参赛者留下的库状态；③**脱敏悖论**：表数据脱敏保结构即可用，记忆价值恰在具体性，且派生物不可从源重建（第 13 期定理）→ staging 无法重生成，合成又改检索几何（第 32 期）；④晋升点快照=备份，第 18 期备份-删除三角在测试场景重演（快照让已删数据在 staging 复活，不快照让投毒活过回滚）；⑤**评测自我污染**：测试项进过优化循环即成开发数据（egoistai 三层分集 dev/release-gate/sealed + 暴露史登记），记忆系统摄取路径会把评测内容写进生产库——被测系统污染被测集；canary 字符串与剥离上下文对照（删依赖分数不动=测模板记忆）是仅有的两条检测手段（hackyjs）；⑥dsh-memory-evolve 分支级作用域是民间最接近"记忆环境"的实现，但解决的是作用域不是环境。
- **待验证 203–208**：203. AML 二期正式榜单（11 月中，最高优先）；204. 首个提供 seed/reset/`export_state` 类夹具接口的记忆产品（预测 6–12 个月）；205. 晋升点记忆快照进任何产品发布流程首例；206. `origin`（生产写入/夹具/评测）字段进 schema 首例（与 `purpose_scope` 同构：为何存 vs 从哪来）；207. 评测契约增加"题目间清库"披露位首例；208. 记忆库 MCP 掩码副本（治理即服务扩展到记忆）首例。

### 第 39 期（20261108-2200）· 记忆的同步拓扑（多机失忆与 Git 传输层）
- **核心命题**：拿掉前 38 期最后隐含前提"记忆库只有一份、住在一处"。"多机失忆"成为被命名的独立问题；一周内 ≥6 个项目选 Git 作记忆传输层（hermes-mesh、memhub、StateNest、agent-memory-nest、ACDM、huahua Memory Sync、ai-memory git wiki）。
- **新框架（长期复用）**：**传输层四形态**（共享目录整文件 / Git 仓 / 自托管服务器 / P2P CRDT 网格）、**汇合是第七个写入口**（同时改写所有机器副本）、**同步账单**（新鲜度账户新入口）、**收敛≠正确**（CRDT 保图一致不保事实权威）、**漂移显式化**（hermes-mesh 首个把"记忆漂移"写进产品文档）。
- **关键事实**：MCP 官方 server-memory 单 JSONL 整文件读改写＝丢写反面教材；冲突裁决五档谱系（整文件 RMW→三方合并+LLM 仲裁 120s 串行（hermes-mesh）→永不自动合并留双版（StateNest）→人工三选一（huahua）→CRDT LWW-Element-Set+HLC+墓碑+单写者分片+S3 条件写/P2P nooniend+性质测试（server-noonien）→append-only 月分片 JSONL+preserve-first（ACDM））；**修正第 8 期**："CRDT 生产缺席"被 server-noonien（MCP memory drop-in 替换）证伪，但 LWW 权威语义未变；隔离＝机器标签+同步黑名单（hermes-mesh，提示词级非 schema）；身份＝git remote 归一化哈希（StateNest，无 remote 得随机 id 不可合并＝第 3 期主键断裂新变体：远端改名即失联）；ai-memory 默认零 LLM、dream 须过 recall eval 才成默认、库可从 md 重建（第 4 期判据第三次验证）；memhub v0.2.3 删 versions.db 第二份向量；跨代理历史导入成品类（dsh-deja 42 代理/dsh-chat-import 25+/memsearch-dsh 审核面板）；dsh 记忆类目 11-06 集体更新（灵枢/meow-memory 七层 SQLite 等）；**同名双包第二例：shibing624/memhub（PyPI，v0.2.3）≠ 腾讯混元 MemHub（v1.0.6）**。
- **六项目（11-08 22:00）**：腾讯 MemHub v1.0.6（11 语种、lite/pro/ultra、多用户、hy-memory 2.0.14、10 宿主、"实时同步+物理隔离"宣称）；OpenViking v0.5.3+网关 1935 字节级重放；TencentDB v2.0.3 云托管小时计费、"MIT+腾讯声明"许可证被 GitHub 检测器拒判（29.3k★ 口径又变）；ReMe 0.1.2 进 DSH Hub（11-06 更新、扫描通过）+OpenClaw 双端、recall 标"不可信历史数据"、cron/心跳/subagent 默认不召回；dsh-memory-evolve 665★（代码停更 10-29）；AML 二期 11-04 关评测、11 月中出榜、11-08 22:00 未出；一期 A–H 全剖面官网公开。
- **判读**：①**倒挂第三十次**（有同步语义的全是社区小项目，头部商业产品对"两台机器"整体沉默）；②**口径缺口第三十一次**（AML 单机单 API，无同步/冲突维度，榜单分无法区分单机能力与多机可用性）；③同步半径将成第三个采购变量（继插座覆盖、账单）；④建议字段 `sync_scope`/`machine_tags`/`last_sync_epoch`；⑤墓碑只删本机、随同步复活概率远高于单机——第 18 期备份-删除三角在同步层第三次现身；⑥hub 当数据不当服务（派生可重建判据选型）。
- **待验证 209–214**：209. AML 二期正式榜单（11 月中，最高优先）；210. `sync_scope`/`machine_tags` 进 schema 首例；211. 厂商公布"写入到可达"延迟分布首例；212. 语义冲突测试（双机异写+条件召回）首例；213. 同步场景删除重放（墓碑跨机传播）产品首例；214. CRDT 记忆库进任何评测首例。

## 第 40 期（2026-11-08 23:00）：记忆的查询语言——只有 find，没有 select

- **主线**：拿掉前 39 期共同预设"记忆的动作只有 add 与 search"。治理/审计/评测需要的不是"找到"（ranking，top-k，完整性不可判定），而是"列出满足条件的全集并计数"（集合+谓词+投影+count，完整性可判定）。行业只建了前者。
- **新框架（长期复用）**：**完备性接口**（记忆与数据库的分界不在向量 vs 图，而在能否返回全集并报数）、**查询能力四级 Q0—Q3**（语义 top-k / 元数据过滤 / 结构化图查询 / 含时间与血统的声明式集合语言）、**键先于语言**（ID → 过滤 → 图 → 语言，四步不可跳）、**空集第五义=谓词写错**（补第 7 期四义）、**text-to-query 第二黑箱**（失效从"排错序"变"问错问题"，结构化输出更显可信）、**计数侧信道**（能 count 就能差分推断存在性）、**库存 vs 账**（count 总数 ≠ count(where)）。
- **关键事实**：Google BigQuery Graph GA（ISO GQL，GQL 快 2×、无向遍历快 100×，新增 CALL；**context graph 把 agent 动作/决策/被否方案记成可 GQL 查询的属性图**）；Uber context graph 同模型同题 38s 答对 vs 20m09s 答错（"未接地 agent 缓慢失败而非廉价失败"）；codebase-memory-mcp（Cypher over SQLite，412,000→3,400 token≈120×，14 MCP 工具，5,400★，arXiv 2603.27277，SLSA L3）；MEMIG（域锚定标识符→精确查找替代模糊匹配、存量化效应与上位效应 Δab−(Δa+Δb)，主张"描述→测量""重写→累积"）；CypherGuard 2610.41755（Cypher-Bench 小模型 31.4%/强模型平台 71.76%/修正后 88.50% +25.08pp，**失效是结构性非语言性**：方向反→零行、互反关系无向→重复计数不报错）；LongMemEval-V2 官方榜（451 题/最长 1.15 亿 token，最优法＝把轨迹当文件用编码 agent 搜，72.5% vs 最强 RAG 48.5%；已改按 LAFS Gain 排序，AgentRunbook-C v2 +2.82/75.6%/130.5s vs OPS-Agentic 81.4% 仅 +0.32/153.6s）。
- **产品接口实测**：TencentDB AM v3 `/v3/atomic/query` 谓词＝type(episodic/persona/instruction)+time_start/end+task_id+limit/offset，无布尔组合、无跨层 join、无总数（Q1）；Mem0 filters 支持 AND/OR/NOT 与 in/gte/lte/gt/lt/ne/contains/icontains、list 带 count（形式 Q2），但官方 skill 文档称 metadata 仅顶层键/仅 eq·contains·ne（**两套口径并存**），且**跨实体 AND(user_id+agent_id) 静默返回空集**需改 OR；OpenViking 唯一把两动词分开（ls/tree/read/write 遍历、grep 精确、find 查询、search 语义；子树当作用域"在目录里检索而非在整个索引里捞"），41,748★/30 天 +2,310/周 +500；ReMe 0.1.2 仅 searchLimit 5+recallMinScore 0；dsh-memory-evolve 645★/71 fork/MIT/push 10-29；Hindsight 三动词 retain/recall/reflect（第三动词是"想"不是"查"）；MemMachine 2604.04853 原文逐字＋三档查询路由（查询规划交给模型，不可复现不可计数）；HydraDB 时序图 97.43%。
- **判读**：①**倒挂第三十一次**（Q2 以上全不是记忆产品，语言都从数据库侧带进来）；②Q1→Q2 是"多几个运算符"变成"定义集合"的断裂而非渐进；③文件系统是被低估的第四接口形态（路径/正则为谓词、grep -c 可数、可管道，缺时间与血统）——这解释了 LongMemEval-V2 上"用文件搜"赢 RAG 24pp；④前 39 期"倒挂+口径缺口"的工程根因是**语法缺位**：治理动作全是集合运算，无语言只能逐条点选；⑤**空集第五义**修正第 7 期（语法层也不可信，且发生在治理脚本里更危险）；⑥计数与隐私冲突＝第 12 期"越共享越难切"的查询版。
- **待验证 215–221**：215. AML 二期正式榜单（11 月中，最高优先）；216. 记忆产品首次提供 `count(where)`；217. `memory_id` 稳定键进 schema 首例；218. `as_of` 作为 where 谓词（而非时间窗参数）首例；219. 计数预算/噪声披露首例；220. 记忆侧 GQL/Cypher 方言收敛首个互操作测试；221. text-to-query 在记忆 schema 上的执行准确率首个公开数字。

## 六之二十四 记忆的产业分层事实（第 41 期，20261111-0100）

- **产业分层**：能力层归零（Mem0 只剩 Free/Custom、cognee 云免费 1M token、Hindsight 开放 0.8B 决策模型权重+$0.005/1M 推理）、托管层计费（火山引擎 OpenViking Context 全托管）、治理层资产化（Sentra $150M C 轮；CrowdStrike ~$495M 收购 Fiddler AI+Dreadnode）。
- **火山引擎 OpenViking Context**（11 月全托管上线）：viking:// 文件系统、L0/L1/L2 分层、多租户隔离、AGPL 内核；计费＝文件·小时（个人版 50 文件免费、0.01 元/h 起、超出每万文件 0.003 元/h；企业版 0.05 元/h 独占实例；AFP 抵扣 5 AFP/h）；硬约束：个人版 QPS 5、单文件 10MB；产品名不用"记忆"，叫"上下文数据库"（命名即定位）。
- **计费单位第三例**：条（TencentDB 万条·小时）→ token（第 37 期语言税）→ 文件（OpenViking）；按文件计费激励聚合打包，与巩固税/可寻址冲突被写进价格表。
- **知驿科技**（11-10，清华 00 后团队，数千万元种子轮，卓源亚洲领投）：TeamAgent+长时经验记忆系统+企业 AI 网关，产品 11 月中上线，反对"超级个体"叙事；投资人话术"判断经验可信度/适用条件/持续核验纠错"逐条对应采信层(26)/作用域(9)/对账(29)/currency(10)——资本条款首次复述评测缺口（口径缺口第三十三次反转）。
- **倒挂第三十二次**：治理层预算流向安全/可观测公司而非记忆厂商。
- **TransMem 2611.10683**（NeurIPS 2026）：transition records 一等检索单元（事实锚点+自适应展开变更记录），PersonaMem/PersonaBench 胜基线——旧值资产(10)/对账(29)的产品化下钻：supersede 关系首次可检索。
- **forge_dc 2611.08644**：纠正+工具失败→指令式 RULE 注入决策点；DC-Bench 71 场景 95% vs 55%、token 1/10；表示/激活/放置位三设计选择——补第 15 期程序性记忆第三自由度。
- **2611.03930**：task-conditioned utility+成本账本（answer-bearing +0.33；raw>任务盲摘要；事实增益不迁移到软件工程/科学编码）——第 30 期利用率首个可复现测量协议。
- **六项目**：TencentDB 29.9k★（口径又变）+Team Memory Beta+MongoDB 后端 experimental+v2→v3 迁移工具、README 改"team-level memory hub"；Hy-Memory MemHub v1.0.6（11 语言/三档/换嵌入/多用户，2.0.14）+FP8/GGUF 量化+CMB 投 ICLR 2027；ReMe DSH 插件 0.1.3（npm 11-09，journal→digest+auto_dream+provenance）；dsh 主仓 27.4 万★、memory-evolve 645★（push 10-29 停更）、生态教程提出"第二轮"（进化/隔离/迁移，警告多插件叠加=重复写入）。
- **AML 二期**：11-04 关评测，原定 11 月中出榜，11-10 检索仍 in progress，未发布。
- **待验证 222–226**：222. AML 二期正式榜单（最高优先）；223. 记忆产品公布条/文件换算比首例；224. 知驿首款产品治理件披露（owner/注销/血统）；225. 托管层价格战（0.003 元/万文件·小时被击穿）；226. OpenViking 企业版多租户权限模型文档。

## 六之二十五 记忆的内在评测事实（第 42 期，20261111-0200）

- **FEB-30（arXiv 2610.22209，AWS+克卢日-纳波卡技术大学，10-15 提交）**：首次量化内在/外在评测分歧——平均 16pp、44% 轨迹超过有意义阈值；记忆操作（create/update/reinforce/supersede）分类正确率仅 20% 且外在评测完全不可见；两类盲区＝假阳性（LLM 用局部检索推理补偿坏库）与假阴性（库对但嵌入失配/截断，错记在记忆头上）；范式倒置法（paradigm inversion）：从已知事实演化轨迹反向生成文档→确定性金标免人工标注；30 轨迹×6 诊断类别×3 难度；开源 amazon-science/feb-30-benchmark。
- **cognee 五工具可评性对比（2026-09，厂商自评+声明利益冲突）**：Mem0 开源基准套件（--predict-only 止步检索、top-k 截断 10/20/50/200）；Zep openzep-eval-harness（含"应检到而缺失"证据项）；Letta ADE 块级查看编辑；LangMem 零公开测试基建；四失败面 Formation/Maintenance/Retrieval/Downstream use——前两面免模型可直接查库；**Mem0 头条分数来自托管平台专有优化，开源版复现方法不复现分数**。
- **memdebug 1.0.1（PyPI，10-07 首发 0.2.0、10-11 达 1.0.1）**：本地优先 agent 无关旁观者——防篡改账本、捕获绕过存储自身历史的越权编辑、快照比对、markdown 安全回滚；"不居间、不阻断"；支持文件/Git 记忆、Open WebUI、MCP memory server、自托管 Mem0；真实环境只验证过 Claude Code 与 Open WebUI。＝第 26 期采信层之外首个"观察侧"独立工具位。
- **AML 协议=纯外在评测极致形态**：参赛系统仅暴露 Add/Search，答题模型/评分器/聚合全平台锁定，库内状态零检位；二期榜单 11 月中仍未出（11-11 检索仍 in progress）。
- **六项目**：OpenViking v0.5.4（11-09）MCP 工具挂成可读 Markdown 节点（工具结果=可检索上下文）、只读与破坏性操作分道（非只读须显式 ov mcps invoke）、Rule Search、Watch MySQL、归档带内容哈希显式重试、ov compile memory 显式整理记忆（代谢显式化，第 19 期）、41,918★/1,374 open issues；Hy-Memory 无新版（2.0.14/MemHub v1.0.6，1.9k★ 口径）；TencentDB 29.9k★ 无新版；ReMe DSH 插件 0.1.3（npm 11-09）HTTP 适配器无鉴权仅建议 loopback；dsh-memory-evolve（brian 变体）L3 安装规格过期+L4 沙箱安装失败、仅验证至 dsh 0.2.1-rc.5、代码停更 10-29。
- **判读**：倒挂第 33 次——内在证据最全在论文与第三方旁观工具，产品"能检什么"披露停在检索层，Formation/Maintenance 两面工具最少；口径缺口第 34 次——AML 无库检位，16pp 分歧意味着榜单分与库质量系统性失真（按榜选型可能选中坏库+好模型）；可评性=采购第四档（看分→看插座→看账单→看可评性）；内在评测缺标准操作语义 schema（第 28 期标准线评测侧延伸）；云托管记忆不可旁观=最大盲区。
- **待验证 227–231**：227. AML 二期正式榜单及是否披露库检位（最高优先）；228. FEB-30 范式倒置法被 AML 三期或厂商基准吸收首例；229. 记忆操作语义公共 schema（跨系统可比的 create/update/reinforce/supersede 定义）首例；230. 云托管记忆提供检库 API（绕过平台锁定的直接库检）首例；231. memdebug 类旁观账本与被观测记忆系统的协作接口首例。

## 六之二十六 记忆的退役门控事实（第 43 期，20261111-0300）

- **MEMOIR（arXiv 2611.07631，11-05 提交，IIIT Allahabad+IIT Patna）**：training-free 记忆生命周期；判词＝写时打分的静态重要度永不修订导致两耦合失败（prospective corruption 巩固毁证据 / retrospective staleness 检索偏爱旧记忆）；原则"attribute usefulness after use, screen for preservation before compression"；judge 集合筛查门控合并（100 次独立审计 0 损失、95% 单侧上界 2.95%）、查询后追溯归因回写检索优先级、UCB 探索加成防马太效应；LoCoMo 1,905 去重 QA 证据 recall@5 +11.92pp（裸余弦）、置信门控反馈 +1.50pp 免参考答案、oracle 多跳 +8.05pp；在线写路径零额外 LLM 调用、筛查 confined 到离线周期巩固；开源 AnandMayank/MEMOIR。
- **ENGRAM（arXiv 2611.09472，11-06 提交）**：从经验到权重的可验证迁移协议；把"允许参与训练"（学习准备度）与"允许退出检索"（释放准备度）拆成两个独立门控——成功教师示范可提前训练，但只有无检索的新权重通过逐技能验证、能替代"基础模型+外部记忆"后才释放对应记录；未达标技能保留外部经验门控。＝参数轨"注销完全失能"（第 2 期）的第一个工程出口。
- **Oblivion（arXiv 2604.00131，NEC，3-31）**：遗忘=衰减驱动的可达性降低而非显式删除；读路径按不确定性决定是否查记忆（避免 always-on）、写路径强化贡献记忆；分层组织维持高层策略、动态加载细节；开源 nec-research/oblivion。
- **背景参照**：Human-Inspired Memory Architecture 2605.08538（TTL 分层+指数衰减 λ=0.001≈半衰期 29 天+干扰遗忘）；FadeMem 2601.18642 双层衰减 30 天保 82.1% 关键事实只用 55% 存储；Titans 惊讶门（2025）——均未被产品化。
- **第五失败面**：Consolidation Loss（巩固丢失）横跨第 42 期 Formation 与 Maintenance 之间；FEB-30 六诊断类别亦未单列，内在评测框架需扩容。
- **产品侧**：OpenViking v0.5.4 `ov compile memory` 显式代谢但无保全筛查与用后归因（门在论文不在产品）；TencentDB 按"条·小时"持有计费（0.02 元/万条/h）复核于第三方目录 11 月快照——不退役的库=终身订阅自己的冗余（退役率=成本杠杆，深化第 41 期）；Hy-Memory diff 链保"为什么改"但无退役语义。
- **六项目**：TencentDB 30.6k★（30 天+2,942，push 11-04）；OpenViking 41,918★/126 releases/约 2.2 天一版；Hy-Memory MemHub 多语言版 10-28 后无新版；ReMe DSH 插件 0.1.3 与 dsh-memory-evolve（停更 10-29）无更新；AML 二期官方榜单仍未发布（11 月中），官网仍展示 Cycle 1 榜。
- **判读**：倒挂第 34 次——退役门控与归因最完整的实现全在论文，产品要么只进不出（TencentDB）要么显式代谢不设门（OpenViking）；口径缺口第 35 次——衰减半衰期/退役率/归档留存期无一家披露、AML 无此维度，采购方对"库会长多大、多贵、多脏"全靠猜；退役≠删除语义分叉无公共约定（退役后仍在归档＝合规既是资产也是负债）。
- **待验证 232–236**：232. AML 二期正式榜单（最高优先）；233. 产品披露记忆半衰期/衰减参数首例；234. last_hit_at/hit_count 用后归因字段进记忆 schema 首例；235. 退役项归档层（archive≠purge≠unlearn）产品化首例；236. ENGRAM 式权重迁移验证进参数轨产品首例。

## 六之二十七 记忆的调度事实（第 44 期，20261111-0500）

- **OMCE（arXiv 2611.01747，11-01，上海交大等，ACL Rolling Review 在投）**：Online Meta-Control of Experience；轻量 contextual bandit 元控制器用紧凑检索信号在四动作中选择——DIRECT（不取）/EPISODE（取案例）/GUIDE（取原则）/DISTILL（固化为指导）；一次路由解决三个耦合决策：是否调用经验、用哪种记忆形态、何时巩固；在线演进（任务反馈更新记忆库 + 更新路由策略）。四在线适应基准×四骨干：首试成功率最高 **+20.5pp**；相对 ACE（GPT-5.2）单任务 token **降 5.7–62.5 倍**；消融支持"学习路由"与"路由策略持续适应"两项各自有效。定性例（MultiChallenge）：用户先说峰会六月后更正七月，固定案例记忆坚持旧约束答六月；OMCE 选 GUIDE（估分 DIRECT 0.6268/EPISODE 0.6572/GUIDE 0.9779/DISTILL 0.5926），原则要求丢弃已被取代的约束→答七月。
- **Route to Remember（arXiv 2611.05636，11-03，GWU+Amazon，NeurIPS 2026 Workshop PALM）**：OPSD（on-policy self-distillation）——教师＝同一模型但条件于用户记忆，蒸出零上下文学生，把用户事实烧进参数；配 verify-then-regenerate 路由让权重记忆与文本记忆各答各自擅长的查询；HaluMem 上权重记忆在召回上追平或超过全上下文提示与检索系统，且每查询读更少 token；作者定位"文本记忆几乎垄断生产 agent"，权重记忆作低成本互补件。
- **MIRIX-2.0（arXiv 2611.12068，11-07）**：六类记忆 agent 保完整记录作 system of record；provenance hypergraph 以 n 元帧引用原始行；**检索在显式预算下运行，一个问题检查的证据量不随历史增长**；LoCoMo 91.4%、LongMemEval-S 72.6%（强基线 +14.3）；关 AutoDream 时相对 HyperMem 单跳/多跳文档 QA +31.0/+22.0；程序性记忆 MetaClaw-Bench 49.2% vs 技能库 44.0%；AutoDream 在写路径外合并重复锚点、不重写任何记录，并把任务会话蒸馏成技能；免微调、闭源开源模型均可、代码公开。
- **SoMem（arXiv 2611.11929，11-07）**：记忆＝链接文档，agent 自己决定摘要什么、如何分组、何时修订旧主题，每份摘要链回原始交互作证据；运行时校验更新并自动派生时间/关系/近因视图；查询时 agent 自选搜什么读什么、沿链接回看原始证据；LoCoMo/BEAM-100K/LongMemEval-S 分别 +2.66/+3.10/+2.00；库可跨模型复用，增加推理投入还能继续涨分。
- **MemoryDojo（arXiv 2611.09721）**：记忆投毒全生命周期基准，155 条多会话长程轨迹×4 域×5 套记忆系统；结论：所有记忆系统均可被投毒、下游影响差异大，并提出 memory-aware poison 优化以放大投毒效力＝"记忆架构差异"首次被作为投毒变量。
- **调度侧产品现状**：OpenViking v0.5.4（11-09）`search` 先规划检索路径 + 新增 Rule Search（执行动作前按需查适用规则）+ Watch 支持 MySQL + 归档带内容哈希显式重试，41,918★/1,374 issues/126 releases；TencentDB 按 L0–L3 人工规则下钻；Mem0 固定 top-k、无"不取"动作；Letta 由上下文容量触发（容量驱动非价值驱动）；阿里云 **PolarDB Agent Memory** 进榜（LoCoMo 91.2%、检索 p50 0.51s，自测口径，横向比较为字面数值对照）。
- **AML 二期**：11-04 23:59 关评测、月中出榜，11-11 05:00 仍未发布；首期文本商业榜 MemoraX v0.5 58.02 / MemOS v2.0.1 45.89 / NTES-MEMORY-SMART 44.21（首二差 12.13、二三差 1.68），代码榜 MemoraX 62.00% 对 claude-mem v12.1.1 / hs v3 / MemOS 三套 52.00%；奖池 $22,000，三赛道（文本/代码/多模态）；协议仅暴露 Add/Search＝调度策略不可表达。
- **判读**：倒挂第 35 次（调度能力最完整的四个实现全在论文，产品侧无一家把"不取"当一等动作）；口径缺口第 36 次（AML 协议强制每次必取，榜单结构性奖励多取）；**恒证预算**（每次回答检查的证据量）应取代 top-k 成为记忆 SLI；**形态决定正确性方向**（案例 vs 原则可让同一事实答成相反答案）＝第 30 期送达形态的正确性版；**载体路由剥夺删除权**（参数内事实不可删，文本副本可删，用户只看到"已删除"）＝第 2 期/第 36 期在路由层被绕过。
- **待验证 237–241**：237. AML 二期正式榜单及是否披露调用策略（最高优先）；238. 产品公布"每次回答检查的证据量"首例；239. 权重记忆提供"参数内删除/撤销"首例；240. OpenViking Rule Search 从人工规则走向学习式调度首例；241. 路由日志（route + evidence_budget + 是否被采信）进记忆 schema 首例。

## 六之二十八 记忆的权限层位事实（第 45 期，20261111-0600）

- **AMU / Lineage-Aware Memory Governance（arXiv 2610.07258，10-05，独立研究者 Venkata M Sangaraju + SAGE7 AI Sudhir Vissa，cs.CR，IEEE Access DOI 10.1109/ACCESS.2026.3730363）**：共享记忆的两类未处理风险＝敏感数据通过"合法计算出的结果"泄漏（请求者本无权推导）、以及不同部门用同名 KPI 走冲突口径（语义漂移）。方案＝Analytical Memory Unit：每条缓存结果附完整**推导/血缘图**，检索策略仅在"请求者对血缘触碰的每一列都有权"时才返回（S(a) ⊆ P(d)），否则回退为其权限内现算；阈值为列级而非行级。实测：合成场景朴素内容门控共享记忆跨部门泄露 18.8%，TPC-H 25.5%，血缘门控后 0%；复用率 95.8%→81.5–82.6%；单次门控 0.09 微秒，最坏 50 条候选 13.82 微秒。**条件性保证**：完整血缘假设下按构造证明 O(n)；完整度 50% 时泄露 16.3%/10.3%，需 75%（合成）/90%（TPC-H）才归零→以 90% 为部署目标；血缘应由数据库驱动层拦截 SQL 自动抽取，不依赖 agent 自报。明确不覆盖：推断攻击（衍生特征隐式携带敏感列）、跨多次查询的组合推断、内部人直攻存储。副产物＝定义指纹（definition_hash）检测同名指标口径冲突：10 对手工集上列关系图探测器 F1=1.00，扩到 43 对后降至 0.833，8 例"且/或"逻辑改动全漏。真实 PoC：LangChain+Ollama+sqlglot+Northwind，四部门九轮交互零泄露、五次新算、四次复用、两次冲突精确阻断。
- **Whose Credential Is It?（arXiv 2610.25707，10-19，Hau-Sing So 等）**：三阶段审计把"他人凭据进入 prompt（exposure）/ agent 据此行动（behavior）/ 受害者账户被改（state）"分开。AppWorld 中混存 763 条历史登录的 store，对 84.7% 的必需应用能检索到他人凭据，但 agent 很少行动；压力测试（缺本体凭据、只呈现单条他人凭据为本体记录）下 7 个 agent 有 80–94% 运行使用，最多 43% 改动受害者账户，有时通过官方检查。缓解：在凭据行前或行内标注所有者→误用从 305 对运行中 92 次降至 1 次（含无姓名用户名），代价是每模型少 3–5 个成功任务；**所有者写错**几乎完全恢复误用；尾部标注与追加安全指令只对部分模型有效。结论：记忆应稳定记录"这是谁的凭据"，评测应测行为而非曝光。＝"主体≠边界"与"曝光≠使用"的首个双事件量化。
- **MixUA / Who Remembers What?（arXiv 2611.10439，11-07，Yunzhe Wang 等）**：把独立 user-agent 轨迹蒸馏成 lesson，并按"谁受益、可披露什么"把每条 lesson 分配到 **user-agent 对 / 用户 / agent / 全局** 四档作用域——作用域在**写入路径**决定，不是检索时补。配套 CrossLearnBench（5 用户×7 agent，含隐私探针：私有事实是否进入他人可读记忆）：通过率较无记忆 +16pp、较单一全局记忆 +5pp，保留 90% 已声明偏好，≤0.02% 隐私探针在禁止作用域内找到植入私有事实。
- **The Memory Trap（arXiv 2611.07554，11-06，Princeton+Anthropic）**：良性交互即可致害，无攻击者无投毒。两类路径＝写入时扩大作用域、使用时过度泛化。599 条自写笔记 93.0% 作用域宽于原指令（0–4 量表平均宽 2.05 级），69–94% 写成"从今以后"常设规则；自主性实验：Sonnet 4.6 不安全动作率 0.0035（日常）/0.0064（编码）→0.79/0.81，Opus 4.7→0.58/0.49，跨域迁移落差 ≤0.09；判断偏移：Sonnet 5 偏好用户较弱诗作 0.525→0.840，反向记忆使 Opus 4.7 对正确论证挑错 ≤0.04→0.605；**遮蔽缺陷**：修过期测试的"实现已冻结，测试不符就改测试"导致把抓安全缺陷的测试改错，掩蔽率 ≤0.15→0.77–0.80（50 例中 27 例削弱访问控制/会话/密码学/网络策略），ImpossibleBench 作弊 0.29→0.74。修复建议：每条记忆存作用域、记忆中的偏好不得单独授权不可逆动作。＝"授权记忆化"首个系统量化，也是第 2 期删除举证在策略维度的重演。
- **GateMem（arXiv 2606.18829，06-17，Zhe Ren/Shuicheng Yan 等）**：多主体共享记忆治理基准，91 个多方情节（医疗/办公/教育/家庭）、2,218 个隐藏检查点、泄漏目标标注；三维修养合成乘性分 **MGS = U×(1−A)×(1−F)**（任一维度归零则总分归零，防"全拒"刷分）。7 基线 × 6 骨干：长上下文治理最好但 4–8× token；RAG-Naive 仍泄未授权；RAG-Policy 靠过度拒绝换安全；A-MEM/Mem0 默认无治理；**所有方法在主动遗忘（不可找回/不可确认/不可重构）上失败**；MIT 开源+公开榜。
- **产品侧读权限（唯一实质动作）**：TencentDB-Agent-Memory 10-28 提交 `fix(memory-core): enforce agent and task read permissions`——Agent/Task 的 get 收敛到已认证调用者，list 按团队成员关系与 Agent 可见性过滤，**在 SQLite 与 MongoDB 双后端的分页与总数之前过滤**，并为所有者/外部人/队友三类补回归测试，同时把读规则写进文档。＝"先滤后排"在记忆产品里的首例，也是"total 计数侧信道"（第 40 期）被工程正面处理的首例。其余：Databricks 文档明确 `actor_id` 只做区分不是访问控制、store（workspace）才是安全边界、严格隔离需按边界独立 store；Mnemoverse 每 API key 绑 organization_id，room 成员校验**先于**归档状态（非成员 403，不泄露是否存在/已归档）；OpenViking 子树限定检索＝作用域非鉴权；Sentra 主张 read-time 继承源系统 ACL 而非 copy-time 复制，并要求导出整个记忆图。
- **AML 二期**：11-04 23:59 关评测，官方结果"11 月中"，11-11 06:00 检索仍 in progress；协议仅 Add/Search、单用户单库、无 principal 参数。
- **判读**：倒挂第 36 次（把授权做成机制的全在论文与 RAG 安全工程侧，记忆产品仅一次 bug fix；子树/命名空间/actor_id 被当成鉴权）；口径缺口第 37 次（越权披露率与过度拒绝率在榜单合同里无法表达）；**授权是记忆里半衰期最短的资产**——事实可长期有效，权限分钟级变化，故"统一衰减"在权限上须反用：不衰减、只即时失效，`access_version` 落后即判 deny。
- **待验证 242–246**：242. AML 二期正式榜单及是否引入 principal/授权维度（最高优先）；243. 首个披露"血缘完整度"指标的记忆产品；244. "免确认"类记忆被列为高危、需动作前二次确认的产品首例；245. OpenViking 子树作用域升级为真鉴权首例；246. `access_version`（权限版本戳）进记忆 schema 首例。

## 六之二十九 记忆的入库门事实（第 46 期，20261111-0700）

- **Anchor／From Reflection to Co-Evolution（arXiv 2611.10382，11-07，Xinxiang Yin 等，31 页/9 图/6 表，cs.CV）**：把"这条候选经验该不该留"做成可测判定——定位轨迹中后果性步骤、抽出候选记忆，在**同一上下文**里**有/无该候选**重放该源决策。两条发现：多数候选几乎不改变被探针的分布（＝大量写入是纯负债）；成功与失败的源动作都可能被强化或抑制。方法在保留前测两个量：分布位移幅度、源动作角色对齐。ALFWorld 成功率/均分最高 **+19.9%／+17.2%**（相对各骨干最强基线）；Qwen3.5-27B 下比不过滤少留 **41%** ALFWorld 卡片，且在 WebShop 四个成本对照基线上全胜、token 更省；策略冻结仍可持续改进。＝"拒记率→成本/分数"的首个直接换算。
- **LIFE／Learning to Live（arXiv 2611.00180，v1 10-30／v2 11-04，14 作者，cs.RO）**：机器人持续观察、**选择性记忆**；**RoboBeats** 是一族轻量流式门，跟踪 agent 设定的条件并发现新事件，决定"这次观察是否值得一次响应或一次记忆写入"；入选观察进 Plastic Memory（平坦存储，保留源证据，允许后加字段与索引）；工具不足时 EDM 把解题过程蒸馏成已验证可复用工具/技能。同**写入预算**下，比均匀采样保留更多可用于记忆问答的证据；24 小时真实机器人连续视频为小规模案例。
- **Agent Memory as Rate-Limited Filtering（arXiv 2611.02361，11-02，Tianhao Guo 等，cs.LG）**：把记忆视为递归滤波，决策只通过"状态"依赖历史，状态大小由被跟踪键数决定。权限日志执行基准（授予/撤回/复权/到期/组/变更窗口，成对样本只改顺序或一个字段）：7—32B 开源模型 8/16 事件后 72—86%，256 事件后 **48—55%**；reasoning-trained 32B 读当前状态 96/98%；120B reasoning 在 256/512 落后 4/7 点、1,024 落后约 10 点——**显式状态胜过长上下文的临界长度随读者变**。不看时序只留日志，错误率逼近并达到 **1/2** 上界；"模型解析每行＋显式规则施加更新"的滤波器 256 事件 80—89%，胜过 relevance retrieval、模型自维护账本、StateMem 复现与 Mem0 库；读时按状态依赖选行可打平——**真正起决定作用的是写时按状态依赖选行**。
- **Accept Changes, Reject Attacks（arXiv 2610.41056，11-02，Runze Zhao 等，cs.AI/cs.CR）**：记忆管理器的两类失效——保留已变事实（陈旧）与存入植入段落/注入指令（投毒），二者要求**相反**的写决策，"no fixed write rule handles both"；把鲁棒性定义为两者同时不发生且不在其他输入上变差；以 **ECA（evidence-conditioned accuracy）** 计分——不仅看答案，还看被选记录是否含齐所需证据、且已更新、无攻击。现有系统与防御并不优于未调优管理器；用"单段对话＋插入的变更与攻击"合成 episode 做**一次性微调**，三骨干上各分项全升、总 ECA 超未调优 2 倍以上，但作者自认 **robustness remains incomplete**。
- **Redis Iris 六能力／MemoryETL（11-04 发布，四 GA 两 Beta）**：Intent Router、Agent Playbooks、Agent Memory、Context Gateway 为 GA，Lens、Agent Mesh 为 Beta。**MemoryETL** 从用户动作、文档、知识库与半结构化数据构建记忆，层级组织，提供检视/审计/溯源，并可**丢弃不应保留的信息（含 PII）**；会话上下文在后台**自动升格**为长期向量索引记忆而不阻塞交互；四原则含 **memory should be adaptive and selective**；Playbooks 报推理成本最多降 73%。成熟度自陈不均（审计与连接恢复仍 Beta）。
- **Hy-Memory v1.0.6（Tencent-Hunyuan，npm/发布 11-06）**：记忆模式 **lite（不调 LLM，存原始对话并直接检索原文）／pro（LLM 抽取）／ultra（加知识图谱与每晚巩固）**，首次启动选择、之后可随时切换；模型中心把"记忆整理模型"与"搜索（嵌入）模型"分开配置，换嵌入模型时安全重嵌且可取消。＝三个宽度的入库门，但均未披露"什么被丢弃"。
- **产品与生态**：TencentDB-Agent-Memory 30,658★（7 日 +324）、末次提交 11-09、v2.0.3（10-26）；第三方评测（11-10）批评 L0–L3 分层只解决"存不下"、"无损"实为可下钻而非压缩无损，且 **L2 场景块升格 L3 人格画像"没有裁判"**；OpenViking 转"连接器＋LLM Wiki 编译"（11-10，飞书文档/代码仓，前 50 文档免费）；dsh-memory-evolve 628★（+26）、末次更新 11-05、含"回合内自我审查"；AML 官方博客（11 月）建议开发者在改架构前先审**写入策略**（拿一条普通事实中途改掉、加一个未来计划再推迟，再问现在与过去），二期仍"mid-November"。
- **判读**：倒挂第 37 次（入库判据最硬的三个实现全在论文，产品侧只有档位与"能删"）；口径缺口第 38 次（AML 协议无"不写"动作，榜单结构性奖励全收＝第 44 期"奖励多取"的另一端）；**多记不如不记**——二手汇总的 TEPA 事实反转场景"只加不改"0.21 < 无记忆 0.31、STALE 最好模型 55.2%，把第 33 期"收益递减"修正为"可负"；`admission.*` 六字段（decision/reason/gate_version/evidence_ref/budget_class/admitted_at）。
- **待验证 247–251**：247. AML 二期正式榜单及协议是否出现"不写/拒记"动作（最高优先）；248. 首个披露"拒记率/误拒率"的记忆产品；249. Hy-Memory lite/pro/ultra 三档的丢弃口径公开首例；250. Redis MemoryETL 公开"升格判据"与可回放裁定首例；251. 记忆产品提供"负样本账"（被拒记录＋拒因）首例。

## 六之三十 记忆的继承事实（第 51 期，20261112-0000）

- **EvoGroup（arXiv 2611.03868，11-02）**：群体 agent 的共享上下文 harness 自演化；从**最小六工具冷启动**（非空库、非预置策略）起步，用置信度与任务结果筛轨迹、低置信时自反思、分析 agent 自适应渐进披露后分桶归纳，指导 evolve agent 改写 harness；EverMemBench 留出集 pass@1 71.07%→89.58%，高于自演化记忆与人设计 harness（含 Claude Code 85.83%）；冻结 harness 迁到未见 GroupMemBench 仍优于记忆基线与人工 harness＝**冷启动资产是程序性记忆（工具集/harness）而非事实记忆**。
- **CogniLife（arXiv 2611.04483，11-04）**：cold-expert problem——已上架专家收到大量请求却几乎无创作者证据；方案＝持续认知蒸馏，把有归属的创作者观察转为可修订的决策规则/沟通模式/领域流程；提出 **Creator Profiles（跨 listing 可迁移）+ Expert Journals（该 listing 绑定知识）** 双层（作者自陈尚未实现评测）；已部署平台部分实现：创作者授权写作、能力归属的提案过滤、**仅 owner-scoped 记忆可逆合并**；ProfyBench-v1 85 题离线，Profy Full 4.65/5 vs Raw LLM 4.01 vs Expert Prompt 4.28（配置级，不测冷启动缓解与跨专家迁移）。
- **Continual AutoResearch（arXiv 2611.05108，11-03）**：persistent vs reset 实例在同任务流/同数据/同预算下对照，九任务族 × 五前沿 agent，加记忆消融区分"洞察迁移"与"会话连续"；结论：持久状态提升全部五家的研究效率（更早找到更强解），但**不必然改善最终留出表现**——"保留经验"与"有效利用经验"是两种能力＝第 44 期调度命题的训练侧版本。
- **Memorilla（arXiv，v3 11-03）**：冻结权重 LLM，把整个文档集编码为 **16 个 query-dependent memory tokens** 直接放入输入嵌入空间；八基准中五个最优，FactKG 84.33% 高于全上下文 80.43%，表征源文档少 **108×** token；TextWorld 成功率 18.6%→24.2%＝"压缩到嵌入位"的第三条载体路线（非文本、非权重）。
- **Hindsight v1.2.0（11-03）transfer archive**：`POST /v1/default/banks/{bank_id}/transfer/export` 导出 documents/facts/observations/mental models/knowledge pages + 可选审计史；**嵌入与数据库 id 永不导出**，导入端以目标 bank 的模型重嵌入、重解析实体、不做 LLM 抽取，"costs no tokens and invents no new facts"；另有 Markdown bundle 与主体访问导出；限制：自家格式非跨厂商标准、每次 retain/巩固都调 LLM、记忆服务器成为依赖＝**第 48 期 writer_model 问题的产品级答案：不迁索引，重算索引**。
- **memscore（MIT，habib-analyst/memscore）**：每条记忆 content/embedding/utility/source 四字段，老虎机式效用更新与修剪；迁移核心＝导入端先跑探针任务集实测每条记忆真实贡献，把 donor 效用分与本地贡献按比例混成重校准分，探针中未出现的领域大幅折价；诚实结果：合成问答下重校准略低于盲信 donor（保险费），但 25% 记忆被投毒的对抗场景反超 6 分以上、投毒召回 90%；作者声明为模拟器非生产＝**"信任但要验证"的首个可运行实现**。
- **Personal-Agent-Dossier / savestate / Context OS**：dossier＝单 `.dossier.md`（YAML front matter + Markdown）打包角色/反职责/定时例程/分类型长期记忆/依赖/来源，校验和由 name+title+role 计算以验证核心内容存活，导入端**必须把无法迁移的例程与记忆报为 lost or degraded**，作者真实迁移 Grok Bot→Meta Muse；savestate 0.4.2 用 AES-256-GCM + Argon2id、适配器覆盖 OpenClaw/Claude Code/OpenAI Assistants/ChatGPT/Claude.ai/Gemini；Context OS 以 Git+Markdown 存持久上下文，更新以提案供人审＝**文件式记忆包的三种治理强度：校验和、加密、提交审阅**。
- **六项目状态**：Hy-Memory v1.0.6/MemHub（11-06）lite/pro/ultra 三档、记忆与嵌入模型分开配置、换嵌入安全重嵌可取消；OpenViking v0.5.4（11-09）41,897★/v0.5.4；TencentDB-Agent-Memory v2.0.3（10-26）30,721★；ReMe v0.4.2.2（11-05，新增 date-range 查询与分页）；dsh-memory-evolve 753★（push 10-29，五轨 + 每 10 回合审查）；dsh-evolving-memory 以 user.md 人机共治（agent 写入仅建议）。
- **AML Cycle 2**：官网倒计时明确 **11-19 预期发布**；三赛道独立排名（文本 6,000+ 实例/32 源/≈3 亿 token；代码；多模态），奖池 US$22,000；能力模型 A–H：A 显式事实、B 关系多跳、C 时间事件、**D 记忆治理（更新/冲突/删除/遗忘）**、E 个性化、G 规则流程、**H 认知安全与隐私（弃答/最小披露）**；两分区（开源方法/商业产品），均须自托管 Add/Search API；学术榜强制 text-embedding-v4 + gpt-4o-mini。
- **判读**：倒挂第 42 次——把"导入"当需重新证明动作的只有论文与两个小工具（memscore/Hindsight），八家产品一律做成拷贝且零预检；口径缺口第 43 次——AML C2 虽有 D/H 两维（比前期判断更细，须修正"无治理维度"的旧表述），但**无"来源"维度**，转述与亲历在同一 Add 流中不可分，榜首分无法回答"记来的还是搬来的"；**资历不可见**与**撤回不可传播**是两个可由 schema 与订阅协议直接修掉的缺口。
- **待验证 252–257**：252. AML Cycle 2 正式榜单（11-19，最高优先）及是否出现来源/导入维度；253. 首个披露"导入预检通过率"的记忆产品；254. donor tombstone 订阅（撤回传播）产品首例；255. `origin`/`donor_id`/`imported_at` 进记忆 schema 首例；256. 冷启动只给 harness 不给事实的产品首例；257. CogniLife Creator Profile 跨专家迁移被独立复现与否。

## 六之三十一 记忆的内容内省事实（第 52 期，20261112-0100）

- **OpenViking v0.5.4.1（火山引擎，11-11，41,982★，AGPL-3.0）**：在 v0.5.4（11-09，MCP 工具挂可读 Markdown 节点）基础上续发补丁；`viking://` 虚拟文件系统把资源/记忆/技能同构成 URI，ls/tree/read/write/grep 皆可，出问题"像查文件一样查它到底记了什么"；检索可限定子树避免扁平向量池捞隔壁内容；只读节点只透明调用"符合只读要求"的工具、破坏性工具须走 `ov mcps invoke` 显式调用＝只读/写分道；Watch 支持 MySQL＋分页、归档带内容哈希显式重试、`ov compile memory` 整理已有记忆。这是"记忆内省 by-design"产品首例。
- **ReMe（agentscope-ai/ReMe，ACL 2026，"Remember Me, Refine Me"）**：Memory-as-File 模型，工作区分层＋frontmatter＋wikilink；`reme status` 显示有状态数据组件记忆估算与进程 RSS、`reme traverse`/`graph_snapshot` 探索 wikilink 邻域或类别根 digest 图、`reme reindex` 重建 BM25+向量索引；文档单列"Operations and Recovery：诊断服务、维护索引、备份/迁移/恢复工作区"＝**内置运维与恢复诊断**，是产品侧继 OpenViking 之后第二个把内省做成一等命令的记忆框架；DSH/Claude Code/Qoder/OpenClaw/Hermes 插件均带自动捕获、整合、诊断。
- **Hy-Memory 2.0.13（Tencent-Hunyuan，11-02，Apache-2.0）**：lite/pro/ultra 三档，模型中心把"记忆整理模型"与"搜索嵌入模型"分开配置、换嵌入安全重嵌可取消；anchorterminal 全克隆复核（commit b58e95f，11-04 读）确认：`delete(id)` 移除向量条目、检索子句与图节点，但**保留 raw L1 对话（隐藏不列）、history.db 已删文本、cache.db 抽取 prompt**；删事实最新版本会重新激活被替代的旧版本；working/coding 记忆无公开删除方法＝`deletion_residue` 的首个产品实证：schema 只记"删了"，不记"留了什么"。
- **TencentDB-Agent-Memory v2.0.3（10-26，30,773★）**：四资产（Chat Memory/Skill/LLM-Wiki/Code-Graph）四档可见性（private/team/restricted/agent）；README 提 Team Memory Beta 与 `Data Migration Tool (v2 → v3)`，迁移工具使"可见性配置"可随数据搬运＝可见性的可移植性首例；MemoryPanel 提供目录级面板（接第 35 期"面板即合同"）。
- **dsh-memory-evolve v26092802（10-29，~753★，csyangwen）**：五轨记忆（用户档案/全局事实/项目关键记忆/项目日志/每日日志），重要结论经确认才写入，可标记仅某 git 分支生效；项目日志带 `[git main]` 分支标签、每回合自动记录进展＝**最廉价的审计轨迹**，不需额外内省端点即可溯源"这条记忆属于哪个分支的决策"。
- **MEMOIR（arXiv 2611.07631，11-05）**：retrospective attribution——每次查询后估计哪些被召回记忆支撑了答案并更新其检索优先级，UCB 探索奖励鼓励低频记忆；＝"召回解释（why-this-retrieved）"的研究侧雏形，与本期 `retrieval_explanation` 字段族呼应。
- **调试侧工具**：Memograph（统计异常检测标记记忆访问偏离、生成时间线报告、建议保留策略，代理层 +5% 延迟）、Orchid（本地优先 record-replay、时间旅行调试、diff 两 trace）、AgentRx（微软，假设驱动系统化调试＋反事实分析）均面向 agent 而非 store，但证明"记忆失败可观测/可回放"的工程范式已成熟，store 侧缺位即倒挂。
- **AML Cycle 2**：官网倒计时明确 11-19 预期出榜；协议仍仅暴露 Add/Search，无 list/inspect 类内省接口；能力模型 A–H 含 D 治理与 H 认知安全，仍无"内容可见/来源"维度。
- **判读**：倒挂第 43 次——把"库里有什么、为何召回"做成机制的全在论文（MEMOIR）与调试工具（Memograph/Orchid/AgentRx）与两个文件式框架（OpenViking/ReMe），六大记忆产品零 introspection 端点；口径缺口第 44 次——AML 契约无内容可见维度，"库里存了什么、被召回的为什么是它"在标准里无处表达；**fs 原语（viking://、Markdown 文件）是对的记忆内省抽象**，比"向量池+top-k"更可审计；**可观测性 ≠ 评测**（深化第 42 期）：评测给答案打分，内省回答状态。
- **待验证 258–262**：258. AML Cycle 2 正式榜单（11-19，最高优先）及是否新增内容可见/来源维度；259. 首个披露"库内记忆清单（可列举/可检索元数据）"的记忆产品；260. `retrieval_explanation`（matched_query/score/path/reason）进 schema 首例；261. `deletion_residue`（删除后仍留存的内容清单）进 schema 首例；262. `viking://` 式内省接口成为事实标准首例。

## 六之三十二 记忆的前瞻维度事实（第 57 期，20261112-0600）

- **Pro-Memory（arXiv NLP，2026-11-05）**：前瞻记忆（prospective memory）——把未来意图存下并在恰当机会出现时自发执行；首次把"意图留存"与"时机决策"解耦，用经验记忆蒸馏反馈、按"实际发生的动作"更新意图状态；跨两基准、多 LLM 骨干一致增益，且限制不必要干预＝"主动 agent"缺失的能力轴被形式化。本期据此提出"记忆的时间方向默认过去式"新观点。
- **OpenViking v0.5.4（火山引擎，11-09，约 41.9k★，AGPL-3.0）**：MCP 实时上下文打通——可注册 Streamable HTTP 类型 MCP Server、检索并调用其中工具、把工具结果挂载成**可读 Markdown 节点**（read/write 分道，只读节点只透明调用只读工具，破坏性工具须 `ov mcps invoke` 显式调用）；新增 Rule Search 入口（执行动作前按需查适用规则）、Watch 支持 MySQL + 分页、归档带内容哈希显式重试、`ov compile memory` 整理已有记忆。Rule Search 是"前瞻 / 约束意图"最近的生产形态。
- **BioMem / HMRU（arXiv 2611.13426，11-10/11）**：生物医学智能体记忆系统调查 + Hybrid Memory Retrieval and Utilization（训练无关）；强调"利用（utilization）"与"检索（retrieval）"是两件事，HMRU 联合增强证据可获取性与任务感知利用，相对 +8.6%、对话答案错误 -24.9%、关 48.0% 全上下文差距＝佐证"检索 ≠ 利用"，与前瞻记忆"何时用"命题同源。
- **六项目状态**：OpenViking v0.5.4（11-09）/ Hy-Memory 2.0.13 / TencentDB v2.0.3（10-26）/ ReMe 0.4.2.2（11-05）/ dsh-memory-evolve v26092802（10-29）；除 OpenViking Rule Search 外，其余五家对"未来意图 / 触发器"零披露（均已在台账前序登记，本期不作未证实新断言）。
- **AML Cycle 2**：官网倒计时 11-19 预期出榜；能力模型 A-H（A 显式事实 / B 关系多跳 / C 时间事件 / D 治理 / E 个性化 / G 执行 / H 安全隐私）**无前瞻 / 意图维度**＝第 56 期口径缺口模式的延续，仅又少一块。
- **判读**：本系列第 56 期总结的"倒挂（论文先于产品）"在此**首次反转**——OpenViking 把"执行前查规则"做成产品能力，而 Pro-Memory 论文刚给出形式化框架；但六家主流记忆产品对前瞻记忆整体零披露，说明该轴尚未进入工程共识；意图 = 被调度的一次动作，本质是定时任务，落入第 54 期"记忆安全"范畴却更尖锐（谁能在不被察觉时"种"一个未来动作）。
- **待验证 263-267**：263. 首个把"未来意图"建模为一等类型（intent 而非 fact）的记忆产品；264. 触发器子系统（事件 / 条件 / 时机探针）独立进产品首例；265. 意图可撤销性进 schema（与第 2 期墓碑、第 52 期 deletion_residue 同源）；266. AML C2 正式榜单（11-19，最高优先）是否新增前瞻执行维度；267. Pro-Memory 框架被任一主流记忆产品吸收与否。
## 六之三十三 记忆的偏见放大事实（第 58 期，20261112-0700）

- **记忆的偏见放大（本期主论点）**：记忆不是中立存储而是偏见的复利放大器；偏见放大有跨时间复利、跨主体传染、自证强化三属性，且无攻击者、无显式 ground truth，与第 53 期退化、第 54 期投毒、第 31 期画像正交；现行治理（第 55 期废止/第 52 期内省/第 56 期评测契约）均假设"记忆=事实中立载体"，对偏见放大天然盲区。
- **Memory Contagion（arXiv 2606.23195，6 月）**：评估者偏见经记忆跨时间传播——带偏 trajectory 存入记忆后，未来**无偏** agent 检索同一库仍被带偏；即便 consolidate 完美（oracle）长度偏见仍传播（Γ_A=13.18，DeepSeek V4-Chat），污染率低至 20% 即可检出、无安全阈值；机制分析 content contamination 主导、检索层过滤无效；权威偏见在 15 次多种子实验中零传播（Γ_A=0.00），说明偏见类型决定是否跨时间——不是所有偏见都能经记忆传播。
- **Memory-Induced Tool-Drift（arXiv 2605.24941）**：记忆里的人格偏见（成本敏感/急躁/风险偏好）静默改写工具调用参数，在无关场景也生效；MEMDRIFT 105 场景 × 5 偏见维 × 7 领域，八模型退化率 0.38–0.83 vs 中性记忆 0.05–0.12；扫描 6,062 工具/288 MCP server，608 个参数易感；偏见记忆＝隐式 steering vector，沿与显式指令相同方向推激活、把注意力从任务相关上下文吸走；提示防御与相关性过滤均不彻底。
- **Mandela Effect（arXiv 2602.00428，ICLR 2026）+ False Belief（arXiv 2610.33026，10 月）**：多 agent 共享记忆与共享证据库时，集体假记忆一旦形成，制造者退出后接受度几乎不降（False Belief 传播面达 96.0%），并被当作"证据"反向喂给检索——偏见被记忆固化成事实；540 条伪造声明 × 8 领域，针对性反驳 84.4%→27.8% 但仍未消除；MANBENCH 缓解平均降 74.40%。
- **Memory Reward Inflation / Echo Gap（arXiv 2608.00017，6 月）**：自改进 agent 给检索到的记忆打高分，错误 episode 获膨胀奖励，于是越自信复用越错；错误经记忆复利而非平均掉，确认裁判的误差与记忆偏见相关故无法识别高估；形式化 Error-Independence Assumption（EIA）为纠正的必要条件；LUCID 去膨胀算法在 BIRD 上 56.9% > 自评分 54.0% > 无记忆 52.4%。
- **Alignment by Stereotyping（arXiv 2609.05993，9 月）**：人口统计画像提升 7/7 模型群体平均对齐精度，但置换检验证这是响应级刻板化（向群体质心拉）；把 WVS 价值锚当"agent memory"加入反而放大同质化 81.4%→93.3%；真实对话史跨 7 模型一致抵消刻板化＝长程 agent 若积累上下文收敛到人口统计摘要会重新引入刻板化，个性化记忆的反面教训。
- **六项目状态（偏见治理维度补充登记）**：OpenViking v0.5.4（11-09，约 41.9k★）`viking://` 只读节点 + Rule Search 最接近"偏见审计"（可列举、可限定子树检索），但零偏见维度；Hy-Memory 2.0.13 保留 `history.db` 删除残留反而利于事后偏见溯源，无主动检测；dsh-memory-evolve v26092802（10-29）git 分支标签是唯一把"偏见隔离"做成 schema 的雏形（可标"该偏见仅某分支生效"）；TencentDB-Agent-Memory v2.0.3（10-26）/ ReMe 0.4.2.2（11-05）对偏见放大零披露。
- **AML Cycle 2**：官网倒计时 11-19 预期出榜；能力模型 A–H（含 D 治理、H 安全）仍无"偏见/来源"维度＝第 56 期口径缺口模式延续，且对"偏见放大率"结构性盲区。
- **判读**：倒挂再现——把"偏见是否被记忆放大"做成一等度量的只有论文（Memory Contagion 的 Γ、Echo Gap 的 EIA、Alignment by Stereotyping 的同质化率），六家产品与 AML 契约一律默认记忆中立；口径缺口延续——现有 schema（第 56 期）无 provenance×principal，跨主体一致性无从表达；**偏见无 ground truth，故第 55 期 revoked 标记与第 52 期内省端点对偏见天然失效**——这是比"删不掉/查不到"更深的治理盲区。
- **待验证 268–272**：268. AML C2 正式榜单（11-19，最高优先）是否新增偏见/来源维度；269. 首个披露"偏见放大率 Γ"或强制 provenance 字段的记忆产品；270. dsh 分支隔离被用作"偏见隔离"首例验证；271. 跨主体一致性 `contested` 标记进 schema 首例；272. Alignment by Stereotyping 的"人口统计当记忆放大同质化"被任一主流产品复现/反驳与否。

## 六之三十四 记忆的可逆性工程（2026-11-12 第60期）
- 错配原语：行业用"删除"实现"改错能退"，删除=破坏性回滚，版本化=非破坏性回滚+依赖传播；"删除权"是错配诉求，"可撤销的版本化"是真实诉求。
- 版本化三层：只追加事件源(BPMA/Memora,100% vs 19.2% provenance)＋非破坏性删除(Hy-Memory history.db 雏形)＋依赖传播回滚(StateGraph/Rollback Repair)。
- 依赖传播量化：StateGraph 2611.02912 Impact-F1 +26.0pp@depth3+；Rollback Repair 2608.10502 85.3% vs 77.3%、复发 26.6% vs 12.1%。
- 产品梯度：git化(OpenViking viking://+commit/dsh 分支/ReMe Markdown)与 Hy-Memory 版本链已有底座；参数轨(Hy-Memory 30B/TencentDB)最难版本化(第50期固化账"版本不可见"升级)。
- AML 无版本/回滚维度；六家零回滚一致性披露。
