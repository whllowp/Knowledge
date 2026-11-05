# AgentMemory 知识台账（跨期累积）

> 用途：记忆技术洞察各期的事实基线，避免重复检索、避免口径漂移。每条注明来源期次与核实日期。
> 维护规则：只记"会变化的结构性事实"（版本、指标口径、计量单位、架构分层），不记新闻评述。

## 一、方案档案（截至 2026-11-06）

| 方案 | 归属 | 形态/许可 | 版本/时间 | 记忆载体 | 分层 |
|---|---|---|---|---|---|
| Hy-Memory 2.0 | 腾讯混元 | SDK `hy-memory` / Apache-2.0 / ~1.9k★ | 2.0 发布 2026-10-15；2.0.13→**2.0.14**（2026-11） | chat / working / coding 三类 | 三型记忆 + 双系统（快回忆/慢图式） |
| Hy-Memory-30B-A3B | 腾讯混元 | MoE 30B 总参/3B 激活 / Apache-2.0 | 随 2.0 发布，FP8/GGUF 已上 HF | 权重（写入判定） | 单步：memory-write |
| MemHub | 腾讯混元 | 本地应用（CLI + macOS） | v1.0.6（2026-11） | 汇聚多工具历史会话 | 本地记忆库 |
| TencentDB Agent Memory | 腾讯云数据库 | 开源 + 托管 / 3 万+★ → **30.3k★（2026-11-01）** / **GitHub 标注 NOASSERTION（许可证不可识别）** / 90 天 5 个 release | v2.0.0 2026-08-03；v2.0.2 10-09；v2.0.3-beta.1 10-13 | 服务端 MemoryCore + 向量库 | L0/L1/L2/L3 + 四类资产（Chat/Skill/Wiki/CodeGraph） |
| 阿里云 Memory | 阿里云 | 托管服务 | 2026-11-02 升级 | 记忆条目 + 用户画像 | 未强调分层，强调规则可配 |
| OpenViking | 火山引擎 | 开源 AGPLv3（CLI/examples Apache-2.0） | v0.5.2.1；最后提交 2026-11-01；41.6k★ | `viking://` 虚拟文件系统（AGFS：localfs/s3fs/memory） | L0 摘要 / L1 概览 / L2 原文；Resource/Memory/Skill 三类；**peer = git identity（origin URL 归一化）→ 路径 → user 三级回落；`forget` 为永久删除** |
| ReMe | agentscope-ai | 开源 Apache-2.0 / ~3.7k★（3,748） | 持续迭代（QwenPaw 2.0 内为 v0.4） | `.reme/` Markdown，文件即真相 | session+resource / daily / digest / metadata |
| dsh-memory-evolve | csyangwen（社区） | DSH 插件 / MIT / **★数存疑：205（社区盘点）vs 606（早期查询）**；另有 azure5100/huahua-dsh-memory-os 自称同名 | v26092802；最后推送 2026-10-29 | 本地文件，五轨 | 档案/全局事实/项目关键记忆/项目日志/每日日志 |
| Mem0 | Mem0(Embedchain) | 开源+托管 / ~67k★ | — | 向量+图+KV 混合 | 用户/会话/Agent 三级作用域 |
| Zep / Graphiti | Zep | Graphiti Apache-2.0 | — | 时序知识图谱 | 事件子图（双时序） |
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


## 六、待验证 / 下期问题

1. AML 二期结果（11 月中）——噪声条件对总分的具体拉低幅度；是否新增安全/权限维度。
2. 墓碑回收策略：一条 `superseded` 记忆的法定硬删时点（目前无人回答）。
3. 删除举证 API 的实际返回字段形态（审计统计量？统计检验 p 值？）。
4. 参数轨 unlearn 的工程化路径（PINT 能否落进 Hy-Memory 这类 writers）。
5. git identity 漂移（改 remote / fork / 改名）后的记忆继承方案。
6. TencentDB 许可证 NOASSERTION 的实际条款；v2.0.3 可插拔决策服务是否开放第三方写入模型。
7. 阿里云 Memory 是否披露分层架构。
8. `sessionQuery` unicode61 中分缺陷是否有官方修复或社区绕过方案。
