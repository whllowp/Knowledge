# AgentMemory 知识台账（跨期累积）

> 用途：记忆技术洞察各期的事实基线，避免重复检索、避免口径漂移。每条注明来源期次与核实日期。
> 维护规则：只记"会变化的结构性事实"（版本、指标口径、计量单位、架构分层），不记新闻评述。

## 一、方案档案（截至 2026-11-06）

| 方案 | 归属 | 形态/许可 | 版本/时间 | 记忆载体 | 分层 |
|---|---|---|---|---|---|
| Hy-Memory 2.0 | 腾讯混元 | SDK `hy-memory` / Apache-2.0 / ~1.9k★ | 2.0 发布 2026-10-15；2.0.13→**2.0.14**（2026-11） | chat / working / coding 三类 | 三型记忆 + 双系统（快回忆/慢图式） |
| Hy-Memory-30B-A3B | 腾讯混元 | MoE 30B 总参/3B 激活 / Apache-2.0 | 随 2.0 发布，FP8/GGUF 已上 HF | 权重（写入判定） | 单步：memory-write |
| MemHub | 腾讯混元 | 本地应用（CLI + macOS） | v1.0.6（2026-11） | 汇聚多工具历史会话 | 本地记忆库 |
| TencentDB Agent Memory | 腾讯云数据库 | 开源 + 托管 / 3 万+★ → **30.3k★（2026-11-01）** / **GitHub 标注 NOASSERTION（许可证不可识别）** / 90 天 5 个 release | v2.0.0 2026-08-03；v2.0.2 10-09；v2.0.3-beta.1 10-13 | 服务端 MemoryCore + 向量库 | L0/L1/L2/L3 + 四类资产（Chat/Skill/Wiki/CodeGraph）；**Memory Proxy 支持 9-10 客户端（Claude Code/CodeBuddy/WorkBuddy/Codex/DSH 桌面端/OpenCode/Hermes/OpenClaw/Pi），协议保留改 base URL，Pi 需专用 PiProfile 解析器（标签行格式）；MongoDB 后端为试验特性** |
| 阿里云 Memory | 阿里云 | 托管服务 | 2026-11-02 升级 | 记忆条目 + 用户画像 | 未强调分层，强调规则可配；**MCP+CLI 接入 Codex/DSH/Claude Code/OpenClaw；图表署名 Mementis；HaluMem-medium QA 85.15% vs Zep 81.71%（自报未复现，对照分取自 OmniMemEval）** |
| OpenViking | 火山引擎 | 开源 AGPLv3（CLI/examples Apache-2.0） | v0.5.2.1；最后提交 2026-11-03；41.4k★（近 20 天 +1.5k）；DSH 插件 0.5.32 | `viking://` 虚拟文件系统（AGFS：localfs/s3fs/memory） | L0 摘要 / L1 概览 / L2 原文；Resource/Memory/Skill 三类；**peer = git identity（origin URL 归一化）→ 路径 → user 三级回落；`forget` 为永久删除** |
| ReMe | agentscope-ai | 开源 Apache-2.0 / ~3.7k★（3,748） | 持续迭代（QwenPaw 2.0 内为 v0.4） | `.reme/` Markdown，文件即真相 | session+resource / daily / digest / metadata |
| dsh-memory-evolve | csyangwen（社区） | DSH 插件 / MIT / **★数存疑：205（社区盘点）vs 606（早期查询）**；另有 azure5100/huahua-dsh-memory-os 自称同名 | v26092802；最后推送 2026-10-29 | 本地文件，五轨 | 档案/全局事实/项目关键记忆/项目日志/每日日志 |
| Mem0 | Mem0(Embedchain) | 开源+托管 / ~67k★ | — | 向量+图+KV 混合 | 用户/会话/Agent 三级作用域 |
| Zep / Graphiti | Zep | Graphiti Apache-2.0 | — | 时序知识图谱 | 事件子图（双时序） |
| **Zep Agent Skills** | Zep | 托管服务 + arXiv 2611.01386 / SKILL.md 开放格式 | 2026-11-01 发布 | Trace（有序事件+结果+验证强度）→ 不可变版本 Skill | Reflector 起草 / Curator 逐条对证据 / 准入门禁；**删源 run 级联删除引用它的 Skill**；verified use 调排序 |
| **openJiuwen OmniMem-Lens** | 华为 openJiuwen | 开源 Apache-2.0 / AgentMemory v0.2.0 | 2026-11-03~04 | 视频：L0 原始帧 / L1 事件级 / L2 片段级（L1/L2 全文本化+向量化） | **按内容边界切（视觉切变 × ASR 话题转向双流交叉）**；离线建、在线查 |
| **Hindsight** | Hindsight | 论文/产品，未见开源 | 2026-11-03 发布 | 事件（对话/工具调用/失败重试/用户反馈四类） | 判断外置为专用小模型（是否新/是否矛盾/哪条相关），167ms/次；约束优化器裁留/并/汰 |
| **Redis Iris Agent Memory** | Redis | 托管（Iris 平台） | 2026-11-04 扩展，Agent Memory 已 GA | MemoryETL 摄入的层级记录（文档+用户行为双源） | 提供 inspection/audit/provenance；Lens(beta) 回溯 outcome→skill/route/FAQ/记忆/源 session |
| **MongoDB + Google ADK** | MongoDB / Google | 托管服务 | 2026-11-04 | SessionService（会话/事件/作用域状态）+ MemoryService（关键词召回） | **摄入幂等**（重加同一 session 不产生重复）；会话层乐观并发控制 |
| **PhoenixAI Contextbase** | PhoenixAI | 私有预览 | 2026-11-04 | 语义/知识/记忆/轨迹/评测同库 | 与业务数据同集群的单一治理存储；配 ObserveStack 追踪打分 |
| **Databricks MemCurrent** | Databricks | 托管 beta（Agent Bricks / Lakebase） | 2026-10-20 | 插件自动日志 + 按需工具 + 离线巩固管道 | 三访问模式并存；官方称通过率 3×、token −31% |
| **Autopoetic** | Autopoetic | 独立服务 | 2026-10-20 | **哈希链图（实体/关系/事件追加日志）** | 无外部依赖、检索零推理成本；唯一把"源不可变"写进数据结构 |
| MemOS | MemTensor | Apache-2.0 | — | 图服务（Neo4j+Qdrant）/本地 SQLite | 记忆立方 + 文本/激活/参数/偏好四类 |
| EverOS | EverMind | Apache-2.0 | 原名 EverMemOS | Markdown 源 + 内嵌 SQLite/LanceDB | 案例/技能双轨 |
| Letta | Letta | 开源 | 原 MemGPT | 运行时（core/recall/archival）+ MemFS | OS 式三层 |

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

## 五、安全基线

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

## 五之三、接入层（插槽）事实（第 6 期新增）

- **插座三形态**：①base-URL 代理型（TencentDB Proxy，捕获全量 L0+每轮注入，需按客户端系统提示词格式写解析器）；②MCP 工具总线型（OpenStinger/Mem0 OpenMemory/阿里云，捕获依赖 Agent 主动调用——捕获盲区在接口层）；③文件系统挂载型（OpenViking viking:// AGFS、Hy-MemHub，颗粒度取决于客户端写什么）。
- **可携性梯度**（braindrip）：声明层记忆（CLAUDE.md/AGENTS.md）可携性最好；hooks/轨迹库/微调 adapter 最差；向量库仅底座可换时可携；轨迹重放跨 harness 基本不可行。代理插座位于梯度最优处（记忆沉淀在 Proxy 侧）。
- **状态层标准缺位**（Forkast）：Agent 栈四层中 MCP/A2A/PAP 各有标准，状态层 14+ 厂商、约 7 个架构阵营、零记忆序列化格式、零可携协议。AWS AgentCore 无文档化导出工具——锁入是结构性的。
- **ABC 环测**（OpenStinger v0.7）：OpenClaw→Qwen/Llama→DeerFlow/Grok 往返传播，身份保持；两 Docker 卷整体搬移；LongMemEval-S 公平路径自报 81.0%。
- **LoCoMo 互不可比**：MemoryLake 94% / Mem0 92.5% / Zep 94.7%，各自调参换嵌入模型，数字不可比。
- **市场口径**（爱分析，经腾讯云文章转引）：中国智能体记忆市场 2025 年 14.4 亿元 → 2030 年 642.5 亿元，CAGR 超 110%。


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
