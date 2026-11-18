---
name: dsh-method
description: DSH (Dynamic Self-improving Harness) overview and the main entry skill of this plugin. Explains when to use dynamic multi-subagent orchestration (three task-shape tests), how to configure the designer-executor loop from the bundled dsh-orchestrator template, governance rules for cost and safe operation, and the RSI-loop-to-artifact mapping table. Use when facing a large task that passes all three tests, when asked how the DSH plugin or its self-improvement loop works, or when preparing to run or customize dsh-orchestrator; not for small questions a single reply can settle.
---

# DSH 总论（插件主入口）

DSH = Dynamic Self-improving Harness（动态自改进执行架）。一句话定义：一个以 ZCode 动态工作流为执行底座、让『跑任务的编排』与『改进编排自身』都成为可审计、可回滚、**在 gate 回放分口径下**永不劣于当前版本的插件（口径限定：保留门只保证 gate 数据回放分不退步；真实表现由 held-out 审计集只作对外报告，证据不足时如实记 insufficient）。

- 运行期（DyFlow 的 designer–executor 范式）：规划子代理逐轮生成阶段子图（Stage Subgraph）而非静态流水线，执行子代理按算子模板 o=(O_k, φ, ψ) 并行施工，产物经键值黑板 M 共享且先检后并。
- 改进期（RSI 的保留式递归自改进）：把『编排脚本（策略 θ）』与『评审技能（预测器 φ）』当作分别版本化的组件，用发现树做离线确定性回放评估，经组件门+兼容性门两级保留检查决定去留，版本化 ledger 驱动递归前进（k 计更新周期而非成功修订）。
- 资产组织（Harmony Harness 的因子化框架）：演化在项目本地 evolveDir 工作副本（.zcode/workflows/dsh-evolve/）上进行，绝不触碰插件安装缓存与 plugins/ 源码；被接受的变更经人工复制回插件源并按市场更新流程发版回流。
- 推理时：planner 从算子菜单动态组合任务专属 DAG。

本技能回答三件事：该不该用（第 1 节）、怎么配（第 2–3 节）、怎么治（第 4–5 节）；第 6 节内嵌 RSI 循环→脚本构件的映射参考表。姊妹技能：`dsh-operators`（算子菜单）、`dsh-rsi-loop`（自改进循环、ledger 与回放评估）。

## 0. 论文书目

全组文档引用的四篇论文（正文以简称+节号引用，出处统一在此）：

| 简称 | 书目 |
|---|---|
| DyFlow | Yanbo Wang et al. *DyFlow: Dynamic Workflow Framework for Agentic Reasoning*. NeurIPS 2025 (Poster). arXiv:2509.26062. https://arxiv.org/abs/2509.26062 |
| RSI-Anything | Taoyong Cui et al. *RSI-Anything: Unlocking Recursive Self-Improvement with World Models*. arXiv:2610.13912. https://arxiv.org/abs/2610.13912 |
| Harmony | Weichen Yu et al. *Harmony Harness: Multi-Objective Self-Evolution of Agent Harnesses*. arXiv:2610.15150. https://arxiv.org/abs/2610.15150 |
| Dream-RSI | Tong Zheng et al. *Dream-RSI: Recursive Self-Improvement through Evolving Worlds*. arXiv:2609.14858. https://arxiv.org/abs/2609.14858 |

引用只到节号/公式号级；本文转述的成本数字与消融数据均为论文自称，未独立复核。

## 1. 何时用：任务形状三判据

三条判据全部满足才动用编排；任何一条不满足，退回普通对话或单技能完成，编排开销不划算。

| 判据 | 要问的问题 | 不满足时的后果 |
| --- | --- | --- |
| 单次通解决不了 | 任务塞不进一次对话上下文，或单代理一次做不稳（勘察面广、文件多、易漏） | 直接在对话里完成更省 token，编排是纯开销 |
| 可并行拆分 | 能切成彼此依赖少的子任务，扇出有真实收益 | 并行退化为串行排队，还多付每轮协调成本 |
| 可独立验证 | 每份子产物有客观判据（编译、测试、规则检查），评审子代理能明确打回 | 错误产物直接折叠进汇总，verify-before-fold 失效 |

正例（三判据齐备）：把一个模块的十几处调用点迁移到新 API 并保持测试全绿——勘察面广超出单次上下文、各调用点可并行修改、编译加测试可独立判分。

反例（各缺一条，均不该用）：

- 能单次通解决：『解释这段三十行函数的逻辑』——一次回答即可，复制模板反而引入多轮子代理开销。
- 不可并行拆分：『重构核心解析器，每一步都依赖上一步的输出』——子任务强依赖，扇出无收益，串行对话更可控。
- 不可独立验证：『头脑风暴十个产品命名方向』——没有客观判据供评审子代理打回，先检后并无从落地。

## 2. Designer–Executor 两层架构怎么配

模板 `assets/dsh-orchestrator.dwf.ts`（完整路径 skills/dsh-method/assets/dsh-orchestrator.dwf.ts）已实现该架构；本节说明两层职责与 CONFIG 关键项，配置动作见第 3 节。

Designer 层（决定做什么）：

- summarizer 子代理：每轮先把黑板与错误日志压缩成状态摘要 z_t（State Summary）再喂 planner，控制规划侧上下文成本。
- planner 子代理：只读摘要，每轮产出一小批带依赖关系、可并行的子任务节点（阶段子图，附终止条件 C_t）；继续、修订、回溯、终止由下一轮再规划涌现，脚本不硬编码边逻辑。

Executor 层（把事做完并自证）：

- 执行子代理：按 `dsh-operators` 的算子模板 o=(O_k, φ, ψ) 施工——O_k 是固定功能契约，φ 由 planner 逐任务填充细粒度指令，ψ 声明黑板输入键。
- 评审子代理：REVIEW/REFINE 相位成对出现（对抗式验证），收敛判据为连续 refuteRounds 轮反驳失败；未过评审的产物不并入黑板。

共享设施：

- 键值黑板 M：脚本内全局字典，产物以唯一键注册、下游按 ψ 检索，任意历史输出可复用；每轮落盘 `artifactsDir/state.json`。
- 发现树：每个子代理尝试追加为 `trees/<run-id>.json` 节点（父指针、完整观察、固定评估分、snapshotRef 指向产物目录），整树结束写 outcome 元数据。

CONFIG 关键项（完整清单与默认值以模板 CONFIG 块内注释为准）：

| 键 | 作用 |
| --- | --- |
| task | 任务描述与验收判据；任务参数写在这里（见第 3 节第二步） |
| artifactsDir | 产物根目录（`trees/`、`ledger.jsonl`、`state.json`、`rounds/` 固定在其下；改进侧另有独立的 CONFIG，见 dsh-rsi-loop ⑬节） |
| maxRounds | 步数预算 T_max，防失控三出口之一 |
| maxParallel | 同波最大并行子代理数 W（按依赖分波，波内 Promise.all 并行）。与规划侧两个量互补：planner 单轮规划节点数建议 ≤6（dsh-operators 3.1 的 φ 要素）、脚本硬上限 NODES_CAP=12；maxParallel 只限制**同波实际执行**的扇出 |
| reviewersPerUnit | 每个施工单元的并行评审数（设计示例值 2，双评审） |
| refuteRounds | 对抗式验证收敛判据：连续 N 轮反驳失败即收敛 |
| reviewerVersion | 插件契约版评审器版本，随 dsh-rsi-loop 技能版本走 |

终止三出口（实现落点）：T_max（maxRounds 用尽）／TERMINATE（planner 的 decision=terminate，判据是 C_t；空批同此出口）／不可恢复错误（顶层 try/catch 安全阀）。C_t 不是独立出口，是 TERMINATE 的判定条件。

## 3. 模板三步用法

第一步，复制模板。把插件安装目录下的 `skills/dsh-method/assets/dsh-orchestrator.dwf.ts`（安装缓存内即 `…/plugins/cache/<市场>/<插件>/<版本>/skills/dsh-method/assets/dsh-orchestrator.dwf.ts`；README 试用提示词说的『插件内 skills/...』同指此文件）复制到当前项目的 `.zcode/workflows/` 目录下（即 `.zcode/workflows/dsh-orchestrator.dwf.ts`）。不要在插件安装缓存里直接运行或修改模板：缓存随插件升级被覆盖，且不应手动修改。

第二步，改 CONFIG。打开副本顶部的 CONFIG 块，至少改 task（任务目标与验收判据）、artifactsDir（产物根；trees/ 等固定在其下）、maxRounds（预算）。任务参数统一走编辑 CONFIG 块——宿主的 args 注入通道在运行时可见，但其源码层写法未文档化，本版本不依赖 args 传参。

第三步，以 saved 方式运行。副本存入 `.zcode/workflows/` 后即成为已保存工作流，调用 CreateWorkflow 以 saved 方式运行（示意：`{"saved": {"name": "dsh-orchestrator"}}`）。运行需用户确认；运行产物、黑板状态与发现树落在 artifactsDir。

## 4. 治理

- Token 成本警告：编排一次运行会扇出几十到上百个子代理，各占独立上下文，花费可达单次对话的十倍量级。先用小任务试用量，确认产出质量后再放大任务面。
- 首次运行先展示计划再执行：对每个新任务，第一次先只让 planner 产出一轮计划并展示（扇出多少子代理、预计轮数），确认后再放行全程。
- 从 scoped task 起步：首个任务选范围收窄的（单模块、验收判据客观明确），验证模板行为符合预期后再上大任务。
- 终止方式：DSH 编排不常驻、不自动安装。不复制模板（或删掉项目 `.zcode/workflows/` 下的副本）就不会有任何 DSH 编排运行；彻底移除则卸载本插件。
- 模型档位建议：若宿主后续支持子代理级模型指定，建议 summarizer 与 planner 配低档模型、执行子代理用默认档（DyFlow 成本论证：14B 规划器+状态摘要路线五域总成本 $0.42 vs GPT-4.1 $21.26，论文自称数字、未独立复核，书目见第 0 节；当前宿主工作流 facade 未暴露子代理级模型指定通道——本插件 7 个文件内无对应配置项）。

## 5. 运行期禁令（写或改编排脚本必读）

工作流脚本主体不得使用 `Date.now()`、无参 `new Date()`、`Math.random()`——宿主运行时对这些调用直接抛错（实证：本仓库 `.zcode/workflow-runs/dwfrun-29fb95f4-bd37-4697-85f3-43853503dd6b.mjs` 的运行时桩）。需要时间戳或唯一 id 时，一律经 `world.run("node", ["-e", "…"])` 在外部 node 进程生成后回填脚本状态（`new Date().toISOString()`、`crypto.randomUUID()` 写在那段 node 程序里执行，不受本禁令约束）。改编排模板、写新工作流脚本时同样受此约束。

## 6. RSI 循环→脚本构件映射参考表

机制名保留论文原词（括注出处），只收本设计 files 有承载条款的机制。构件列所用的简称：dsh-orchestrator 指 `skills/dsh-method/assets/dsh-orchestrator.dwf.ts`；dsh-operators、dsh-rsi-loop 指 `skills/dsh-operators/SKILL.md`、`skills/dsh-rsi-loop/SKILL.md`；dsh-rsi-replay 指离线回放评估与保留式更新工作流，相关规约见 dsh-rsi-loop 技能文档。改行为前先查此表，不在表内的机制不要凭空写进脚本。

### 相位·编排主循环

| 机制（论文原词） | 构件承载 | 承载内容 |
| --- | --- | --- |
| Stage Subgraph 阶段子图 + Designer-centric 控制流（DyFlow §3.1–3.2） | dsh-orchestrator 主循环 | 每轮 planner 只产出一小批带依赖、可并行的子任务节点（附终止条件 C_t）；分支/重试由下一轮再规划涌现，不硬编码边逻辑 |
| State Summary f_summary(s_t)（DyFlow §3.2） | dsh-orchestrator 每轮 summarizer | 黑板与错误日志先压缩成 z_t 再喂 planner，控制上下文成本（其依赖的模型档位配置在当前宿主未证实，建议句见第 4 节） |
| 预算与终止三出口 T_max / TERMINATE / 不可恢复错误（DyFlow Algorithm 1） | CONFIG.maxRounds + planner 终止决策 + 顶层 try/catch | maxRounds 常量（T_max）+ planner 的 TERMINATE 决策（判据=C_t，空批同此出口）+ try/catch 不可恢复错误安全阀；C_t 是 TERMINATE 的判定条件而非独立出口 |
| 两阶段+双评审+fix loop（DyFlow Bun 案例骨架） | dsh-orchestrator 推荐任务骨架 | 全局勘察→并行施工（CONFIG.reviewersPerUnit=2）→修复循环；由 planner 按任务涌现而非硬编码相位，CONFIG.task 示例按此形状撰写 |
| 首次运行确认门与用量治理 preview-confirm（DyFlow 官方文章） | 本 SKILL.md 第 4 节 | 首跑先展示计划、从 scoped task 起步、写明 token 成本警告 |

### 子代理

| 机制（论文原词） | 构件承载 | 承载内容 |
| --- | --- | --- |
| 算子模板 o=(O_k, φ, ψ)，11 模板（DyFlow 附录 C） | dsh-operators 算子菜单 | 固定功能契约；φ 由 planner 逐任务填充、ψ 声明黑板输入键；REVIEW_SOLUTION/ORGANIZE_SOLUTION/TERMINATE 全域高频标配，另加 TOOL_CALL 工具算子补附录 E 自认的工具缺口 |
| generator/refuter 对抗式验证直到收敛（DyFlow 官方文章） | dsh-orchestrator REVIEW/REFINE 相位 | 两相位成对出现，收敛判据=连续 refuteRounds 轮反驳失败 |
| 因子化变异算子+写白名单 tool_evolve / skill_evolve / logic_evolve（Harmony §4.2） | dsh-rsi-replay 相位⓪③ | 演化基座=项目本地 evolveDir（默认 .zcode/workflows/dsh-evolve/，general 下 tools·skills·logic 三类白名单目录 + env 环境分区，布局在 dsh-rsi-loop ⑩节定义）；变异子代理按类分派、各自只写对应目录；硬规则=绝不写插件安装缓存与 plugins/ 源码，被接受变更经人工复制回插件源并按市场更新流程发版 |
| 诊断协议+证据完整性门（Harmony App E.1） | dsh-rsi-replay 相位② | diagnose 子代理产出 JSON 诊断（focus/problem_statement/artifact_evidence），证据须逐字出现在运行产物树中；过不了重试一次、再不过无引导进行 |
| decide_scope 作用域裁决（Harmony App E.2） | dsh-rsi-loop ⑨节 | 技能写入前置子步骤：运行时可推导→evolveDir general 分区，环境内在规则→env 分区并在文件头声明 |
| generalize 重组 Promote / Demote / Derive（Harmony App E.3） | dsh-rsi-loop ⑨节 | 定期重组子代理，受『当前环境行为等价 + general 分区独立可运行』两道回归门约束 |

### 门控

| 机制（论文原词） | 构件承载 | 承载内容 |
| --- | --- | --- |
| verify-before-fold 先检后并（DyFlow 官方文章） | dsh-orchestrator 黑板写入门 | 未经 REVIEW_SOLUTION 验证的产物不 fold、打回 REFINE；每条产物带 E0–E3 证据等级标签（Evidence hierarchy 的落点） |
| Prediction-guided selection 预测引导选择+不确定度惩罚（RSI-Anything §2.3） | dsh-rsi-loop ⑦(b) 准入专节 + dsh-rsi-replay 相位④候选选择步 | 多候选按『预测分 − λ·不确定度』排序，放行排名前 gateBudget 个候选进入门控（gateBudget 单位=本周期最多放行的候选数，默认 2，定义在 replay CONFIG 行内注释） |
| Imagined-trajectory admission filter（RSI-Anything Eq.8） | dsh-rsi-loop ⑦(a) | 自生成经验写入技能文档前须同时满足有效性∧分数阈值∧不确定度上限∧证据来源白名单 |
| Evidence hierarchy E0–E3（RSI-Anything §2.3） | dsh-rsi-loop ⑥节定义 + dsh-orchestrator 每条产物的 evidence 字段 | 四级证据等级的定义处与运行期标签落点 |
| Conditional world-model adaptation 三值判级（RSI-Anything Eq.10–12） | dsh-rsi-loop ④节评审技能更新触发器 | reliable/unreliable/insufficient，insufficient 明确不动（含 rsi-replay 空树池语义：空/全跳过→insufficient、零候选、仍落账） |
| 组件门+组装对兼容性门（RSI-Anything §2.5 Eq.13–18） | dsh-rsi-replay 相位⑦保留式两级门 | 组件门以现版为对照在 gate 数据上不退步；兼容性门评『evolveDir 候选编排脚本 × incumbentReviewer 现行评审技能』组装对整体不退步；任一失败回滚整对。同节 update/gate/held-out 数据角色三分（dsh-rsi-loop ⑫节）：update=非审计树池供诊断与变异参考、gate=非审计树池上的回放与两级门、held-out 审计集按 auditHoldout 轮转划出（默认 0.2）不参与任何保留决策仅用于对外报告（树池不足 5 棵时审计集为空、对外报告记 insufficient） |
| Never-worse selection（Dream-RSI §3） | dsh-rsi-replay 相位⑥ | 现役脚本恒为 0 号候选参与 argmax 平均回放分，升级永不倒退 |
| 三段冒烟验证+单次修复+回滚（Harmony App E.5） | dsh-rsi-replay 相位⑤提交门禁 | 首版两段冒烟（JSON/结构级检查 + 父代自测断言不得删除的文本检查），失败修复一次、二次失败回滚（周期起点快照恢复，非 git）；完整三段的桩环境自测属后续版本（v1 未实现） |
| 过拟合门（Harmony App K） | dsh-rsi-loop ⑦(c) + dsh-rsi-replay 相位⑧ | 两级门通过后、落账之前对 diff 反作弊审查，检测『把搜索 split 写进脚手架』『改 grader』两类失败形态 |
| Prefix-only 防泄漏约束（Dream-RSI 附录 D.2） | dsh-rsi-loop ⑤节 | 变异子代理只见已揭示观察与结构元数据，禁未揭示分数、绝对分数目标、历史 trace 节点 id |

### 工件

| 机制（论文原词） | 构件承载 | 承载内容 |
| --- | --- | --- |
| Global Memory Buffer M 键值黑板（DyFlow Algorithm 1 第 7–10 行） | dsh-orchestrator 全局字典 M + 每轮落盘 artifactsDir/state.json | 产物以唯一键注册、下游按 ψ 检索，任意历史输出可复用 |
| Discovery tree 发现树（Dream-RSI §3） | 生产侧 dsh-orchestrator / 消费侧 dsh-rsi-replay 相位① | 每轮每个子代理尝试追加为 trees/<run-id>.json 节点{父指针, 完整观察, 固定评估分, snapshotRef 指向 artifactsDir 产物目录}，整树结束写 outcome 元数据；回放装载全历史树池（treesDir 默认与 artifactsDir 同根），生产/消费两侧与默认路径三层对齐 |
| Version-stamped feedback ledger 与双路分流（RSI-Anything §2.4） | ledger.jsonl（规约在 dsh-rsi-loop ②节） | 每轮记（预测, 观测, scriptVersion, 评审器版本, route: policy 或 adapt）五元组；评审器版本双谱系=插件契约版本（CONFIG.reviewerVersion，指 dsh-rsi-loop 技能版本）与 evolveDir reviewer 的 local 版本（frontmatter 版本字段，初版 0.1.0-local，被接受的变异递增）；落账规则=evolveDir reviewer 存在则记 local 版本、否则记插件契约版本；发版时 manifest.version 与 scriptVersion、插件契约 reviewerVersion 同步递增，local 谱系独立演进 |
| Replay world pool accumulation（Dream-RSI §5 表 2：全历史 1.90 vs 仅当前 1.59） | dsh-rsi-replay 树池 | 树池跨轮累积永不丢弃；与数据三分的调和=非审计子集（门控侧的全历史回归）跨轮累积，审计集按轮转法随新树滚动扩充、同样永不丢弃 |
| Replay objective 超体积−并行惩罚（Dream-RSI 式(1)） | dsh-rsi-replay 相位⑥打分公式 | 单树简化式 V = bestRevealedScore 归一 − α·调用数 − β·(决策轮数/调用数)，同奖质量、省调用、高并行 |
| 轨迹级成败标签（DyFlow §3.3） | dsh-rsi-loop ⑦(d) 经验样本格式 + dsh-orchestrator 树文件 outcome 元数据 | 样本=（状态摘要, 所派子图, 整条轨迹成败），明确不用逐步 LLM-judge（论文指出高方差） |

### 保留式更新·核心闭环

| 机制（论文原词） | 构件承载 | 承载内容 |
| --- | --- | --- |
| Recursive carry-forward（RSI-Anything §2.5） | dsh-rsi-replay 相位⑨ | 每轮唯一起点=上轮被接受的（脚本版本, 评审器 local 版本, ledger）；周期结束即使两组件均未变更也落账（k 计更新周期而非成功修订） |
| Policy update routes + 更新触发器 u_k^π（RSI-Anything §2.4） | dsh-rsi-replay 修订路由 | 修订是显式路由：候选脚本经回放评估按反馈排名保留，触发器三值、证据不足则 θ 不变 |
| 推理时 DAG 动态组合（Harmony §4.3 composition agent） | dsh-orchestrator planner + dsh-operators 算子菜单 | planner 从算子菜单生成任务专属 DAG，未见任务复用同一算子菜单即零配置迁移（运行时只装载该菜单）；Harmony 的技能池级零样本迁移在 v1 收窄为算子菜单层面的零配置复用，技能池级迁移属后续版本 |
| MOEA/D 加权 Tchebycheff 邻域替换 + max-min 部署选择 + 停滞检测（Harmony §4.1/App E.1 停滞判据） | dsh-rsi-replay 可选 populationMode 取值 moead（默认 single） | N 个权重角色各养一个 incumbent、子代至多替换 2 个邻居、部署取 max-min 平衡点；每角色记录上代父代标识与失败摘要哈希，连续 stagnationGens（默认 2）代不变→改从其 Tchebycheff 最优邻居的 incumbent 育种，防雷同子代空转耗 token；默认 single 模式只保留 Never-worse selection 的现役对照 |

## 7. 姊妹技能

- `dsh-operators`：算子菜单。11 个 DyFlow 算子模板加 TOOL_CALL 的功能契约（O_k）与 φ/ψ 填写规约，是 planner 组合任务 DAG 的原料。
- `dsh-rsi-loop`：自改进循环。evolveDir 布局与写白名单、ledger 规约、准入与门控规则（其 ⑦节）、评审技能三值判级（④节）、回放评估与保留式更新（dsh-rsi-replay 相位）的完整规约都在该技能文档。
