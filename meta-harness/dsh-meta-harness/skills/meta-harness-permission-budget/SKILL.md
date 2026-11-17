---
name: meta-harness-permission-budget
description: meta-harness 权限与预算规则——五层纵深防御（admission 合同、task_token、策略引擎卡点、进程隔离、人工评审门）、五级预算模型（L1 turn 到 L5 RSI 进化预算）、配额预约三段式与「绝不静默降级」总原则。设计或审查权限/资源控制时使用。
---

# 权限管控与资源预算规则（ARCHITECTURE.md §4–§5）

## 五层纵深防御（§4.1）

| 层 | 机制 |
|---|---|
| L1 入口层 | admission 合同：显式四态 `queued/coalesced/deferred/blocked` + 稳定 ReasonCode，**绝不静默 no-op**；blocked 原因不泄露私有 agent 存在性；配额/限流 |
| L2 会话层 | task_token 绑定 (agent, task)，仅哈希落库，注入为专用环境变量，任务结束撤销；agent 间委托时 AuthScope **单调收缩**（每跳只能减权限不能加）；daemon 执行环境绝不回落用户全局 token |
| L3 工具层 | 策略引擎卡点：每次工具调用先 authorize 再执行；权限预设三档 strict/standard/permissive，**deny 永远优先**；PreToolUse 同步拦截危险命令；BudgetLimit 与审批流内置；MCP 工具面 **defaultDeny** 按需放行；共享注入短语目录（运行时扫描 + 静态扫描） |
| L4 进程层 | 每任务独立 workdir；spawn 一律 execFile 无 shell + 命令白名单 + 参数黑名单正则 + 超时/缓冲上限 + 默认禁 sudo；分层看门狗（总超时/语义不活动/首轮无进展/空闲，且「终态已读则不是 hang」）；任务结束进程树收割 |
| L5 产出层 | 人工评审门：PR 门（只有 PR 真正 merge，带 close-intent 的 issue 才自动推进 done，merge 由人完成）+ worktree 分支门 + 不可变审计链（permission-audit.jsonl 追加写 + 授权清单 + 签名回执） |

诚实边界：权限预设是**元数据+审计层，不是运行时沙箱**——真正的子进程隔离在 L4；每一层都要诚实标注自己的真实边界。

## 五级预算模型（§5.2）

| 层级 | 预算内容 |
|---|---|
| L1 turn 级 | 工具调用数（≤200/turn）、输出缓冲上限 |
| L2 任务级 | 总 token 上限、总超时、重试次数 ceiling |
| L3 agent/工作区级 | 并发上限（max_concurrent_tasks）、模型档位、配额周期 |
| L4 全局级 | 限流、租约池、云端额度 |
| L5 进化级（RSI 预算） | 税率 ρ 上限（初始 ≤10%）、单轮更新 token 上限、浪费率上限 25%、**递归深度 k 上限（默认 k=1 地板档）** |

- **配额预约制三段式**：入队预留（reservation 状态机 + 幂等键，防并发重复扣减）→ 完成结算 → 拒绝/失败释放；超额返回结构化错误 `{Used, Reserved, Limit, ResetAt}`，**刻意不含商业文案**（资源错误的消费者是程序和看板）。
- **预算即策略**：BudgetLimit 做进 AgenticPolicyEngine，一次 authorize 同时回答「允不允许」和「还有没有额度」——预算检查与权限检查共用同一个卡点。
- **预算耗尽回退**：任务级预算耗尽不立即报错，可从保留的尝试历史经回退序列选可交付候选，但回退产物必须打 **degraded 标记**并留审计记录——可观测的降级交付优于不可观测的失败。
- **递归预算 k 旋钮（§5.2，Harness² arXiv:2610.14224v1 §2.2.2/§4 图5）**：k = 在线无真值模式的**每任务候选数 / 组合会话数 / 链式步数**，纳入 L5 进化预算；**k=1 为默认地板档**（与 SRN 地板哲学一致——先证明 k>1 值得付税），上调须对照 k=1 判决。并行递归控宽度（"k controls its width rather than its depth"——降延迟但不减少总计算量）、顺序递归链式携带累积执行证据（后步可保留/修订/纠正前步），按预算与任务形态选择。附**「无新证据即停」自适应停止**（Harness² 附录 G）：Probe 连续无新证据即停止本轮递归，判定零新增调用。
- **L3 并发联动**：k 个并行 Probe/Compose 会话占用并发席位——启用在线改进环时必须把 k 计入 `max_concurrent_tasks` 并在配额预留（reservation 段）中同步多预留 k 席，不得挤占正常任务席位。
- **看门狗参考参数（Harness² 附录 D.1）**：在线改进环单次 rollout 资源上限 **200 模型轮 / 3600 秒**；rollout 间无跨任务记忆（探测与任务隔离）。
- **最终选择池（§2.4 ⑤/§6 ⑥）**：best-of-k 匿名选择时候选池**必含参考执行交付物**——改进环最坏退化为正常执行，**改进实验永不牺牲任务交付**；只从已有输出中匿名比较选出、绝不合成新内容（选择阶段不改 harness）；预算耗尽回退产物打 **degraded** 标记、在线模式被选输出打 **adopted 标记（ℋₜ⋆，adoption 而非 verified optimality）**，均留审计记录。
- 重试同样消耗配额（防重试风暴绕过预算）；任务预算耗尽不是重试场景，走回退通道。

## 关键安全条目：候选 harness 的探测执行（§2.4 在线无真值模式）

候选 harness 的编辑可能是**损坏或越权代码**，绝不在生产 workdir 裸跑。8 组件挂载点中 **`scripts/⟨name⟩.py` 与 `plugin/⟨name⟩.ts` 是代码执行组件**——scripts 经 bash 执行；plugin 在工具循环内挂钩、可强制行为（enforces a behavior），横截工具循环与轮次边界。因此 Probe 的候选执行必须同时满足：

1. 过 **L3 策略引擎卡点**——每次工具调用先 authorize 再执行（权限预设 + BudgetLimit 同点检查，deny 永远优先，MCP 工具面 defaultDeny）；
2. 跑在 **L4 隔离 workdir**——独立 workdir、execFile 无 shell、命令白名单、分层看门狗、任务结束进程树收割。

候选执行全部计 Explore 税（§2.6），审计留痕。

## 总原则（§5.6）

**资源受限时显式拒绝，绝不静默降级**——配额超额返回结构化错误（含 ResetAt），并发跳过留痕（recordSkippedRun），admission 绝不静默 no-op。可观测的「不」，优于不可观测的「慢」。**先计量后控制：没有度量的控制是盲切**——每类资源先有计量管道、控制策略挂在计量之上。

## 上下文经济学（§5.4）

- cache_read 是最便宜的 token：简报稳定前缀的全部意义在此，易变值移出简报保缓存命中率；
- 注入有预算：route 钩子只注入 top-5 模式（不是 top-50），简报用 slim 版；
- 3-tier 模型分层路由：路由/例行判定走便宜模型，规划/评审走强模型；harness 增益与模型强度负相关（弱模型增益最大）——**廉价档位优先获得 harness 强化投资**；
- 记忆库防膨胀：滑动窗口（routing-outcomes ≤500 条）、图算法上限（PageRank ≤5000 节点/≤10 万次比较/30 轮迭代）、巩固触发式 GC（置信度每小时衰减 −0.005、访问 +0.03）、supersedes 失效链（冲突记忆失效+归档而非覆盖）；
- **注入即计税**：每次检索+重排+注入的 token 计入 RSI 账 Explore 类，注入产物按后续使用规则跟踪——检索链路每一级都要能回答「这级花掉的 token 换来了什么」。
