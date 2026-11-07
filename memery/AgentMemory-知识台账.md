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
