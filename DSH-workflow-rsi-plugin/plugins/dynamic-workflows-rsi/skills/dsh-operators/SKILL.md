---
name: dsh-operators
description: DSH 算子模板库菜单——DyFlow 附录 C 的 11 个算子（GENERATE_PLAN、DECOMPOSE_PROBLEM、GENERATE_ANSWER、REVIEW_SOLUTION、REFINE_ANSWER、GENERATE_CODE、REFINE_CODE、ORGANIZE_SOLUTION、ENSEMBLE、DEFAULT、TERMINATE）加 TOOL_CALL 工具扩展算子，逐个给出角色契约、planner 逐任务填写的 φ 指令要素、ψ 黑板输入键与写出键约定。当 planner 子代理要为 DSH 编排生成阶段子图（任务专属 DAG）、要决定派哪些算子节点，或执行子代理需要确认所用算子的施工契约、黑板键命名、先检后并规则与 E0–E3 证据标签时使用本技能。
---

# DSH 算子模板库（Operator Menu）

DyFlow 把每个子代理任务抽象为算子实例三元组 **o = (O_k, φ, ψ)**：O_k 是本文件固定的功能契约（模板），φ 是 planner 逐任务填写的细粒度指令要素，ψ 是该实例声明要读的黑板键列表。planner 每轮从本菜单选算子、填 φ/ψ、连依赖边，产出一小批可并行的阶段子图；执行子代理按契约施工，产物以唯一键写回黑板 M（由 dsh-orchestrator 每轮落盘 artifactsDir/state.json）。运行期只需装载本菜单即可为任意任务组合专属 DAG——新任务零配置复用同一算子集（v1 的复用范围收窄在算子菜单层，技能池级迁移属后续版本）。

## 0. 通用契约（对全部算子生效）

1. **实例化规则**：派发一个算子节点 = 选定模板 O_k + 填好 φ（指令要素）+ 声明 ψ（输入键）；未在本菜单中的算子不得派发，需要新算子时走 dsh-rsi-loop 的演化流程改菜单本身。
2. **黑板键命名空间**：键中花括号段是派发时替换的变量段（如 `plan.r{round}` 实例化为 `plan.r3`）。黑板由 orchestrator 维护，本菜单只约定键名与语义：

   | 键模式 | 含义 | 产出者 |
   |---|---|---|
   | `task.brief` | 任务原文与全局验收标准 | orchestrator 初始化 |
   | `state.summary` | 本轮状态摘要 z_t（f_summary 压缩产物） | summarizer 子代理 |
   | `plan.r{round}` | 第 round 轮阶段子图（节点、依赖边、终止条件 C_t） | GENERATE_PLAN |
   | `sub.{unit}` | 子问题定义 | DECOMPOSE_PROBLEM |
   | `draft.{unit}`（多路时 `draft.{unit}.{lane}`） | 答案草稿 | GENERATE_ANSWER |
   | `code.{unit}` | 代码工件 | GENERATE_CODE |
   | `review.{unit}.{r}` | 第 r 号评审结论 | REVIEW_SOLUTION |
   | `refine.{unit}.{n}` | 第 n 轮修订稿（答案或代码） | REFINE_ANSWER / REFINE_CODE |
   | `ens.{pool}` | 多路合并产物 | ENSEMBLE |
   | `out.{unit}` | 兜底任务产物 | DEFAULT |
   | `final.report` | 最终交付物 | ORGANIZE_SOLUTION |
   | `tool.{unit}.{t}` | 工具调用结果 | TOOL_CALL |
   | `decision.control` | 终止决策（proceed/revise/terminate + 依据） | TERMINATE |
   | `errors.log` | 错误日志（orchestrator 追加） | orchestrator |

3. **产物信封**：每条写回黑板的产品统一为 `{ key, from, content, evidence, refs }`——from 为算子实例名，refs 为 ψ 实际读到的键清单，evidence 必填 E0–E3 之一：E0 确定性检查（编译/测试/规则命中）、E1 学习模型预测或评审、E2 专用模拟或更高保真计算、E3 外部测量或实验。
4. **先检后并（verify-before-fold）**：只有 review 结论为 fold 的产物才可被 ORGANIZE_SOLUTION 或下游算子引用；结论为 reject 的产物打回对应 REFINE 算子，禁止直接丢弃或绕过评审并入。
5. **全域高频标配**：REVIEW_SOLUTION、ORGANIZE_SOLUTION、TERMINATE 为全域高频算子（DyFlow 附录 C.2），任何任务的 DAG 至少配置这三个；DECOMPOSE_PROBLEM、REFINE_*、GENERATE_PLAN 集中于复杂域按需选用。
6. **写入边界**：执行子代理只写分派产物键与分派清单内的文件；黑板更新与 state.json 落盘由 orchestrator 统一执行，子代理不直接改黑板其他键。
7. **跨轮复用**：任意历史键可被后续轮次的 ψ 再次引用（如第 4 轮引用第 2 轮的 `code.core`），不靠自然语言转述。
8. **并行评审**：同一产物的独立评审并行数默认 `CONFIG.reviewersPerUnit = 2`，两名评审视角必须不同；对抗收敛判据为连续 `CONFIG.refuteRounds` 轮反驳失败。

## 1. 派发格式（planner 在 plan.r{round} 中给出）

```json
{
  "op": "REVIEW_SOLUTION",
  "task": "从安全视角反驳 draft.rate-limiter",
  "phi": {
    "targetKey": "draft.rate-limiter",
    "lens": "安全：注入、越权、限流绕过",
    "passCriteria": "无高危缺陷即 fold，任一高危即 reject"
  },
  "psi": ["draft.rate-limiter", "task.brief"],
  "dependsOn": ["draft.rate-limiter"]
}
```

## 2. 算子速查索引

| 算子 | 写出键 | 全域标配 |
|---|---|---|
| GENERATE_PLAN | `plan.r{round}` | 复杂域选用 |
| DECOMPOSE_PROBLEM | `sub.{unit}` | 复杂域选用 |
| GENERATE_ANSWER | `draft.{unit}` | 按需 |
| REVIEW_SOLUTION | `review.{unit}.{r}` | 是 |
| REFINE_ANSWER | `refine.{unit}.{n}` | 与 REVIEW 成对 |
| GENERATE_CODE | `code.{unit}` | 按需 |
| REFINE_CODE | `refine.{unit}.{n}` | 与 REVIEW/构建失败成对 |
| ORGANIZE_SOLUTION | `final.report` | 是 |
| ENSEMBLE | `ens.{pool}` | 按需 |
| DEFAULT | `out.{unit}` | 兜底 |
| TERMINATE | `decision.control` | 是 |
| TOOL_CALL（扩展） | `tool.{unit}.{t}` | 按需 |

## 3. 算子契约明细

### 3.1 GENERATE_PLAN — 阶段规划

- **角色契约**：读压缩状态摘要与错误日志，产出一小批带依赖边、可并行、附本轮终止条件 C_t 的子任务节点（即阶段子图），只做规划不产出任务内容本身。
- **φ（planner 逐任务填）**：本轮目标；可派算子限本菜单；每个节点的算子名、一句话任务、该节点的 φ 与 ψ；节点数上限（小批涌现，建议每轮不超过 6 个）；本轮终止条件 C_t；剩余预算（当前 round 与 CONFIG.maxRounds 之差）。
- **ψ（黑板输入键）**：`task.brief`、`state.summary`、`errors.log`、上一轮 `plan.r{round-1}`。
- **写出键**：`plan.r{round}`（内容含节点清单、依赖边、C_t、供 TERMINATE 引用的判定依据键）。
- **触发示例**：勘察产物已全部 fold——规划下一批并行的施工与双评审节点，C_t 定为「全部 draft 过审或被打回」。

### 3.2 DECOMPOSE_PROBLEM — 问题分解

- **角色契约**：把一个复杂问题切成相互正交、可独立验收、可并行分配给 GENERATE_* 的子问题，每个子问题附验收标准与输入依赖键。
- **φ**：问题范围与背景键；切分粒度与子问题数量上限；每个子问题的验收标准；禁止重叠条款（两个子问题不得写同一文件或同一黑板键）。
- **ψ**：`task.brief`、`plan.r{round}`。
- **写出键**：`sub.{unit}`（每个子问题一个键，含目标、验收标准、依赖键、建议算子）。
- **触发示例**：把「给网关加限流」拆成配置、核心算法、压测三个互不重叠的子问题，各自带验收标准。

### 3.3 GENERATE_ANSWER — 答案草稿生成

- **角色契约**：针对单个子问题产出一份结构化草稿答案，每个论断带证据引用与不确定度标注，不越权处理其他子问题。
- **φ**：子问题键引用；输出结构（固定小节或 schema）；证据要求（须引用的黑板键或工具结果）；篇幅上限；禁止编造未经评审的引用。
- **ψ**：`sub.{unit}` 及其声明的依赖键（如 `ens.{pool}`、`tool.{unit}.{t}`、上游 `draft.{unit}`）。
- **写出键**：`draft.{unit}`；同一子问题多路生成时每路写 `draft.{unit}.{lane}`。
- **触发示例**：就 sub.token-rotation 单独给出方案草稿，每个论断标注来源键与置信度。

### 3.4 REVIEW_SOLUTION — 独立评审（反驳者）

- **角色契约**：以反驳者立场对指定产物独立找错，逐条输出缺陷（内容、严重度、可复现依据），结论只取 fold（可并入）或 reject（打回）二值；全域高频标配。词表对照：运行期脚本实现用 pass/refute（pass≡fold、refute≡reject）；改进期 evolveDir reviewer 的评审技能（dsh-rsi-loop ⑪节）用 verified/unconfirmed——它不替换本算子运行期行为，仅作改进期组件。
- **φ**：被审产物键；评审视角（正确性/安全/性能/可维护性，双评审视角必须不同）；通过判据；只评不改（禁止直接修改被审产物或替上游修缺陷）。
- **ψ**：被审键（`draft.{unit}` 或 `refine.{unit}.{n}` 或 `code.{unit}` 或 `ens.{pool}` 或 `out.{unit}`）、`task.brief`、该产物信封 refs 里引用的上游键。
- **写出键**：`review.{unit}.{r}`（r 为评审序号，并行数 = CONFIG.reviewersPerUnit）。
- **触发示例**：两名评审分别从正确性与安全性反驳 draft.rate-limiter，各自给出 fold/reject 与缺陷清单。

### 3.5 REFINE_ANSWER — 答案修订

- **角色契约**：只针对 review 缺陷逐条修订草稿，每条修订显式对应一个被反驳点，不重写无关内容；与 REVIEW_SOLUTION 成对出现直到收敛（连续 CONFIG.refuteRounds 轮反驳失败）。
- **φ**：被修订草稿键；须逐条回应的 review 键集合；不可破坏的既有验收标准；修订轮次编号。
- **ψ**：`draft.{unit}` 或上一轮 `refine.{unit}.{n-1}`、`review.{unit}.*`（该单元全部评审结论）。
- **写出键**：`refine.{unit}.{n}`。
- **触发示例**：review.auth 的三条 reject 缺陷逐条修订 draft.auth，产出 refine.auth.1。

### 3.6 GENERATE_CODE — 代码生成

- **角色契约**：按子问题规格产出可运行的代码工件并附自测，只写分派清单内的文件路径，完成后回报文件清单与自测结果。
- **φ**：目标文件路径清单；语言/框架与依赖约束；规格引用（`sub.{unit}` 与相关草稿键）；自测要求（最小可运行验证）；代码风格基线。
- **ψ**：`sub.{unit}`、被引用的 `draft.{unit}` / `refine.{unit}.{n}`、接口依赖的 `code.{其他unit}`。
- **写出键**：`code.{unit}`（含文件清单、自测命令与结果、证据等级标注）。
- **触发示例**：按 sub.lexer-spec 实现 lexer 模块与单元测试，只动分派的三个文件。

### 3.7 REFINE_CODE — 代码修订

- **角色契约**：只修评审、构建或测试指出的缺陷，保持最小 diff，修完必须自跑验证命令并附原始输出。
- **φ**：目标代码键与文件路径；缺陷来源键（review、tool 结果或 errors.log）；验证命令（构建/测试）；最小改动约束。
- **ψ**：`code.{unit}` 或上一轮 `refine.{unit}.{n-1}`、`review.{unit}.*`、`tool.{unit}.{t}`、`errors.log`。
- **写出键**：`refine.{unit}.{n}`（修订后的代码工件，含 diff 摘要与验证输出）。
- **触发示例**：修掉 review.parser 的两处越界缺陷与 tool.parser.test 报告的编译错误，跑 cargo test 全绿后回报。

### 3.8 ORGANIZE_SOLUTION — 汇总交付

- **角色契约**：把已 fold 的产物组织成单一连贯的最终交付物（报告/答复/PR 描述），只引用过审键、不新增任何事实；全域高频标配。
- **φ**：交付物类型与目标读者；须收录的键清单；结构模板（章节骨架）；同题多方案的取舍规则；终检清单（引用键全部 fold、无未回应的 reject）。
- **ψ**：全部处于 fold 状态的 `draft.*` / `refine.*` / `code.*` / `ens.*` / `out.*` 键。
- **写出键**：`final.report`。
- **触发示例**：把五个过审单元组织成一份面向维护者的迁移报告，冲突结论按双评审多数裁。

### 3.9 ENSEMBLE — 多路集成

- **角色契约**：把同一子问题的多份产物合并为一份更优产物——择优缝合、去重补全，并显式记录每个分歧点与取舍理由。
- **φ**：参与合并的键集合；合并策略（择优/投票/分域缝合）；质量信号依据（评审结论、测试通过数）；分歧记录格式。
- **ψ**：同名多路键（`draft.{unit}.{lane}` 各路、`refine.{unit}.{n}` 各轮）或 `review.{unit}.*` 多评审结论。
- **写出键**：`ens.{pool}`。
- **触发示例**：三路独立生成的解析实现按测试通过数择优缝合，三处分歧全部记录取舍理由。

### 3.10 DEFAULT — 通用兜底

- **角色契约**：当子任务不属于任何专用算子时的通用执行者——按 φ 简报尽力完成，如实报告做了什么、依据是什么、没做什么，产物同样必须过 REVIEW_SOLUTION。
- **φ**：任务简报；输出形式与篇幅；资源边界（不得越过分派的读写范围）；如实报告义务（含失败与未完成项）。
- **ψ**：`task.brief`、`state.summary`、φ 指定的额外键。
- **写出键**：`out.{unit}`。
- **触发示例**：为本次交付写一段面向用户的 changelog 摘要——菜单无专用算子，派 DEFAULT 并要求产物过审。

### 3.11 TERMINATE — 终止决策

- **角色契约**：planner 每轮必配的控制算子——读状态摘要与 C_t，给出 proceed / revise / terminate 三判之一并附依据键，落键驱动主循环；全域高频标配。
- **终止决策语义**（主循环共三出口；①②合并走 TERMINATE 决策出口=出口二，③=出口一，④=出口三）：
  - **proceed（继续）**：C_t 未满足、round < CONFIG.maxRounds、无未消化的 reject 与错误信号、上轮产物按计划 fold——接受 GENERATE_PLAN 的新子图继续推进。
  - **revise（修订，含回溯）**：存在未消化的 reject、反驳连续成功、构建/测试失败、或当前计划本身受阻——派对应 REFINE_* 节点或重新规划；需要放弃当前分支时回退到黑板上一有效状态（已 fold 键不丢）再规划，即 DyFlow 的 backtrack。
  - **terminate（终止）**：满足①或②即经 planner 的 TERMINATE 决策终止——① C_t 达成：`final.report` 已产出且过审；② 收敛：连续 CONFIG.refuteRounds 轮 REVIEW_SOLUTION 反驳失败（评审无可驳点）。另有两条不经子代理判定的出口：③ 预算出口：round ≥ CONFIG.maxRounds（T_max，出口一）；④ 不可恢复错误：由 orchestrator 的 try/catch 安全阀直接触发并落账（出口三），子代理不自行判断此类终止。
- **φ**：当前 C_t 原文；预算余量（当前 round 与剩余轮数）；判定依据键清单。
- **ψ**：`state.summary`、`plan.r{round}`、`review.{unit}.*`、`errors.log`。
- **写出键**：`decision.control`（含判定值与依据键引用）。
- **触发示例**：final.report 已过审且连续两轮反驳失败——判 terminate，依据引用 review.final.1 与 review.final.2。

## 4. 扩展算子 TOOL_CALL — 受控工具调用（第 12 个）

DyFlow 附录 E 自认其 11 个模板缺少工具调用算子；TOOL_CALL 补该缺口，供任何需要真实命令反馈的节点复用（构建、测试、lint、检索）。

- **角色契约**：替上游算子受控执行一条外部命令，把 exit code、stdout/stderr、耗时结构化写回黑板，只报告原始结果、不替上游解释结论。
- **φ 四要素契约**：
  - **command（命令）**：完整命令行（可执行名 + 子命令），限白名单类别——构建、测试、lint、格式化、只读检索、分派清单内的项目脚本；禁止交互式命令、后台驻留进程与破坏性命令（删除、强制推送、批量修改分派外文件）。
  - **args（参数）**：参数逐项显式列出的数组；禁止 shell 字符串拼接，禁止把未过审产物文本内插进命令行。
  - **timeoutMs（超时）**：单次调用超时，默认 120000、上限 600000；超时即终止进程并按错误出口处理。
  - **onError（错误出口）**：非零退出、超时、命令不可用时——不抛异常中断主循环，把结构化错误对象（exitCode、timedOut、stderr 摘要）写入 tool 键的 error 字段；重试至多 φ.retries 次（默认 1），仍失败则交 planner 决策改道或打回上游算子。
  - 附注：cwd 固定为分派的工作目录；输出超出截断上限时保留头尾并注明截断长度。
- **ψ**：触发上游产物键（如 `code.{unit}`、`refine.{unit}.{n}`）、`task.brief`。
- **写出键**：`tool.{unit}.{t}`（含命令、参数数组、exitCode、stdout/stderr、耗时、error 字段；证据等级按 E0 标注——确定性命令输出）。
- **触发示例**：对 code.parser 执行 cargo test（args 数组 `["test", "--lib"]`，timeoutMs 120000）——失败时把 stderr 摘要写回 tool.parser.test 供 REFINE_CODE 消费。

## 5. 与其他 DSH 组件的分工

- **dsh-orchestrator（编排脚本）**：主循环（summarize → plan → 并行执行 → 写黑板 → 终止检查）、黑板每轮落盘 artifactsDir/state.json、CONFIG.maxRounds（即 T_max）、CONFIG.reviewersPerUnit、CONFIG.refuteRounds、try/catch 不可恢复错误出口。
- **dsh-method**：首次运行确认门（先展示计划再执行）、从 scoped task 起步与用量治理。
- **dsh-rsi-loop / dsh-rsi-replay**：消费产物信封中的 evidence 等级做经验准入与回放评估；本菜单自身的修改（增删算子、改契约）只经其演化流程进行，运行中不得热改。
