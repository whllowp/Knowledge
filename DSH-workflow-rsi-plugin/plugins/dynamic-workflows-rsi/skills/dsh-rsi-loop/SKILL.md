---
name: dsh-rsi-loop
description: 保留式自改进规范：教『改进 DSH 编排自身』而非执行任务。当任务是建立演化基座（evolveDir）、变异编排脚本或评审技能、回放评估、决定去留时使用。定义发现树与版本化 ledger 记录格式、评审器双版本区分、两级保留门与回滚守则、三值触发器、prefix-only 防泄漏、E0–E3 证据分级、准入过滤器与反作弊审查、decide_scope 与 generalize 时机、reviewer 初版契约、update/gate/held-out 数据三分与回放评分公式。
version: 0.1.0
---

# DSH 保留式自改进循环（dsh-rsi-loop）

本技能教**改进工作流自身**，不执行任务。执行任务从 dsh-method 起步、由 dsh-orchestrator 编排；本文件是改进闭环的**规范（contract）**，执行者是 dsh-rsi-replay 编排脚本模板，其相位⓪至⑨按本规范运转。

改进闭环一句话：生产侧（dsh-orchestrator）跑真实任务产出发现树与 ledger → 消费侧（dsh-rsi-replay）装载全历史树池 → 在项目本地 evolveDir 上变异编排脚本（θ）与评审技能（φ）→ 离线确定性回放打分 → 组件门+兼容性门两级保留检查 → 过拟合门 → 落账或快照回滚 → 下一周期唯一起点=上轮被接受的（脚本版本、评审器 local 版本、ledger）。**k 计更新周期而非成功修订**：周期结束即使两组件均未变更也落账。

本文件 frontmatter 的 `version` 即第 2 节『插件契约版本』的唯一来源，发版时与插件 manifest 版本同步递增。

## 1. 发现树记录规范

生产侧 dsh-orchestrator 每轮为每个子代理尝试追加一个节点到 `trees/<run-id>.json`（treesDir 见第 8 节）。每个非根节点有唯一主父节点；一次尝试（含其完整观察与产物快照引用）即一个节点。

节点必填字段与类型：

| 字段 | 类型 | 约定 |
|---|---|---|
| `id` | string | 树内唯一；建议 `n-` 前缀加四位创建序号（如 `n-0007`） |
| `parent` | string 或 null | 唯一主父节点 id；根节点固定 `null` |
| `observation` | string | 该次尝试的完整观察：子代理产出摘要、写入的黑板键、错误信号 |
| `score` | number | 固定评估协议给出的分数；根节点固定 `0`；一经写入不可改写 |
| `snapshotRef` | string | 指向 artifactsDir 内该节点产物目录的相对路径，供回放与审计复原 |

可选字段：`agentKind`（算子模板名，如 `REVIEW_SOLUTION`）、`createdAt`、`round`。

整树文件骨架（`nodes` 数组顺序即创建顺序，回放引擎按它开新分支）：

```json
{
  "runId": "dsh-20260118-a3f",
  "createdAt": "2026-01-18T09:12:00Z",
  "nodes": [
    {
      "id": "n-0000",
      "parent": null,
      "observation": "初始工作区：任务为 scoped 示例任务；黑板 M 为空；无错误信号",
      "score": 0,
      "snapshotRef": "runs/dsh-20260118-a3f/step-000"
    },
    {
      "id": "n-0001",
      "parent": "n-0000",
      "observation": "全局勘察完成：读得规范约束 3 处，写入黑板键 survey.spec",
      "score": 0.35,
      "snapshotRef": "runs/dsh-20260118-a3f/step-001",
      "agentKind": "GENERATE_PLAN",
      "round": 1
    }
  ],
  "outcome": {
    "status": "success",
    "finalScore": 0.92,
    "summary": "两轮并行施工加一次修复循环后全部产物 verified"
  }
}
```

`outcome` 元数据约定：整树结束（成功、失败或中断）必须写 `outcome`，必填字段为 `status`（`success` / `failure` / `interrupted`）、`finalScore`（number）、`summary`（string，一句话）；它是第 7(d) 节轨迹级成败标签的唯一来源。生产侧 dsh-orchestrator 在三个必填字段之外附运行统计字段（`ts`、`roundsUsed`、`folded`、`unconfirmed`、`terminationKind`、`note`、`rule`），其中 `finalScore` 取验证通过占比 fold/(fold+未证实)（无产物记 0）。

根节点位置：根节点（`parent: null`）写在 `nodes` 数组内（如上骨架；编排器现行格式置于首位）。dsh-orchestrator 同时在文件顶层附一份 `root` 对象副本，属可选便利字段；装载侧（dsh-rsi-replay 相位①）两种根形态都接受（旧版编排器仅写顶层 `root` 的历史树文件也可装载）。

`score` 的固定评估协议（v1 落地定义）：分数由 dsh-orchestrator 脚本内置的确定性规则给出，任何子代理不得自报——attempt 节点 = 该次尝试的评审通过率（1 − 反驳数 / 评审数）、review 节点 = 反驳失败（pass）记 1 / 反驳成立（refute）记 0、summary/plan 节点按信息性记 0 或 1、根节点固定 0。树级整树评分不由该协议承担，由第 12 节回放 V 公式在改进期计算。

树文件只增不改；snapshotRef 指向的产物随 artifactsDir 一并保留，树池跨轮累积永不丢弃（第 12 节）。

## 2. 版本化 ledger 与评审器双版本

ledgerPath（默认 `.zcode/workflow-runs/dsh/ledger.jsonl`，见第 8 节）为 JSONL，每行一条记录：

| 字段 | 类型 | 约定 |
|---|---|---|
| `prediction` | object 或 string | 记录生成时系统对该次结果的预测 |
| `observation` | object 或 string | 随后观测到的实际结果；必须与 prediction 成对可比 |
| `scriptVersion` | string | 生成该记录的编排脚本版本（插件 manifest 版本谱系） |
| `reviewerVersion` | string | 评审器版本，取值规则见下方双版本规约 |
| `route` | string | `"policy"`（供策略改进，改 θ=编排脚本）或 `"adapt"`（供预测器适配，改 φ=评审技能） |

推荐附加字段：`cycle`（更新周期 k）、`ts`。双路分流：policy 与 adapt 两个记录集合服务不同目标、不必含相同记录（RSI-Anything §2.4）。

示例（两行各自独立成 JSON）：

```json
{"cycle": 7, "prediction": {"verdictProb": 0.8}, "observation": {"verdict": "unconfirmed", "evidence": "E1"}, "scriptVersion": "0.1.0", "reviewerVersion": "0.1.0-local", "route": "adapt"}
```

```json
{"cycle": 7, "prediction": {"replayV": 0.61}, "observation": {"replayV": 0.66}, "scriptVersion": "0.1.0", "reviewerVersion": "0.1.0-local", "route": "policy"}
```

**周期行（`kind: "cycle"`，dsh-rsi-replay 每周期追加一行）**：与上表生产侧行共用同一 ledger.jsonl，但形状不同——字段为 `kind: "cycle"`、`k`（更新周期序号）、`ts`、`cycleId`、`mode`（single/moead）、`verdict`（retained / rejected-all / no-change / insufficient）、`treePool{valid,audit,gate,skipped,note}`、`diagnosis{guided,focus}`、`scriptVersion`（记插件 manifest 版本，即发版谱系锚点）、`reviewerLocalVersion`（即上表 `reviewerVersion` 字段的 local 谱系取值）、`incumbent{replayV}`、`candidates[]`（每候选含 `id`、`cls`、`route`、`predicted`、`uncertainty`、`selectionScore`、`observedV`、`observedCalls`、`observedSeriality`、`smoke`、`componentGate`、`pairGate`、`overfit`、`retained`、`note`；候选级 `route` 语义同上表——skills 类=adapt、tools/logic 类=policy）、`auditReport`、`moead`、`notes`、`exitHint`。周期行不设顶层 `route` 字段（整周期视角，路由在 candidates 内逐候选记录）。evolveDir 内的变异副本不单独编 scriptVersion 号——候选代际由 `cycleId` + 候选 id 标识；待人工复制回插件源并发版后才获得新的 manifest 版本号。

**评审词表对照与谁主导**：运行期（dsh-orchestrator）的 REVIEW_SOLUTION 子代理由编排脚本内置 persona 固定，结论词表为 pass/refute（对应 dsh-operators 契约的 fold/reject：pass=fold 可并入、refute=reject 打回），**不受 evolveDir local reviewer 影响**。evolveDir reviewer（第 11 节，输出 verified/unconfirmed）是改进期组件——作为回放组装对的一半与 skills 类变异的对象，其版本号仅用于落账归因（下方落账规则），不替换运行期评审子代理的行为。三套词的映射：pass ≡ fold ≈ verified（可并入）；refute ≡ reject ≈ unconfirmed（打回/不 fold）。

评审器版本双谱系：

- **插件契约版本**：dsh-orchestrator `CONFIG.reviewerVersion`，取本技能（dsh-rsi-loop）frontmatter 的 `version`，声明『编排脚本按哪一代评审契约产 ledger』。
- **local 版本**：`evolveDir/general/skills/reviewer/SKILL.md` frontmatter 的 `version`（初版 `0.1.0-local`），ledger 归因用。

落账规则：编排模板落账时，若 evolveDir 的 reviewer 存在，读其 frontmatter local 版本记入 `reviewerVersion`；不存在则记插件契约版本。

归因规则：修订评审器（针对 reviewer 的 skill_evolve 变异、其 adapt 触发器评估）**只使用可归因到当前 local 版本的记录**（该 local 版本名下存下的预测—观测对）；旧 local 版本的记录不并入当前误差估计。

发版联动：发新版时 `manifest.version`、dsh-orchestrator `CONFIG.scriptVersion`、`CONFIG.reviewerVersion` 三者同步递增；local 版本谱系独立于插件版本谱系——被接受的变异递增 local 版本，不强制动插件版本；只有人工把 evolveDir 变更复制回插件源并发版时才动插件谱系（第 10 节硬规则三）。

## 3. 两级保留门与回滚守则

顺序固定：**先组件门、后兼容性门**；两门都以**现版为显式对照**；评估数据一律用 gate 数据（非审计树池，第 12 节）。

1. **组件门**：候选组件在 gate 数据回放上不差于现版同名组件。
   - 编排脚本：候选（evolveDir 下 general/logic 的变异副本）对照现行编排脚本副本；现役脚本恒为 0 号候选参与 argmax 平均回放分（never-worse，升级永不倒退）。
   - 评审技能：候选（evolveDir 下 general/skills/reviewer 的变异副本）对照现行 reviewer——仅当本周期变异了评审器才评此门。
2. **兼容性门（组装对门）**：组装对两实体明确——**候选编排脚本=evolveDir 下的变异副本**（general/logic 内）、**现行评审技能=evolveDir/general/skills/reviewer/**。评『候选脚本 × incumbent reviewer』组装对整体在 gate 数据上不退步，对照=现行组装对。本周期两组件均未变更则免评估。

回滚守则（v1 实现=周期起点全量快照＋按候选变更清单恢复，非 git）：

- 任一门失败 → **回滚整对**：dsh-rsi-replay 在周期起点对 evolveDir 的 `general/` 与 `env/` 拍全量快照存入脚本自管的 backupDir（`.cycle/backup-<cycleId>`，子代理不可写），回滚即按该候选的变更文件清单从快照恢复、快照中没有的新增文件删除；不接受保留半对。
- 回滚不是无声失败：照常落账（`observation` 记门失败与回滚，`route` 记实际路由），周期照计。
- 子代与父代字节相同 → 直接拒绝，不进组件门。
- 冒烟/结构检查失败 → 修复一次；二次失败回滚（首版两段冒烟=JSON/结构级检查加父代自测断言仍在的文本检查，由 dsh-rsi-replay 相位⑤执行）。
- 门后、落账之前还有一道过拟合门（第 7(c) 节），命中同样回滚整对。
- plugins/ 源码哈希在变异窗口内变动 → single 模式整周期回滚；moead 模式顶层无周期前快照，标记人工复核。

## 4. 三值触发器语义

对每个可更新组件（θ=编排脚本、φ=评审技能），每周期反馈评估后三值判级（RSI-Anything Eq.10–12 的 reliable / unreliable / insufficient）：

| 判级 | 含义 | 动作 |
|---|---|---|
| 该改（unreliable） | 反馈显示现版有明确缺陷，或候选可证不退步 | 走变异 → 回放 → 两级门 |
| 不该改（reliable） | 现版达标，或变更在 gate 数据上退步 | θ/φ 保持不变，照常落账 |
| 证据不足（insufficient） | 覆盖不足、预算不够或树池空 | **不动**——不提出候选、不改组件，仍落账 |

『证据不足』明确映射为『不动』：防止稀疏反馈下高频改坏组件。空树池语义（dsh-rsi-replay 相位①）：树池为空或全部跳过 → 判 insufficient、零候选、周期仍落账。周期结束即使两组件均未变更也落账（k 计更新周期而非成功修订）。

## 5. prefix-only 防泄漏守则

变异/改写子代理（含改写编排脚本的 policy-development 角色）在回放与改写中只允许使用：

- 已揭示的观察（节点 `observation` 与已访问子树）；
- 基线分（根分数 0 与已揭示节点的 `score`）；
- 合法动作集合与结构元数据（节点数、深度、批大小、并行度）。

禁止（原文约束，Dream-RSI 附录 D.2）：

- **未揭示分数**——子树中未访问节点的 score 不得读取或推断利用；
- **绝对分数目标**——不得以『把回放分提到某绝对数值』为改写目标；
- **历史 trace 节点 id**——不得把特定节点 id 硬编码进策略或脚本。

回放执行轨迹 JSONL 只能作轮间反馈诊断（串行批、过早停止、过度剪枝），不得在改写产出的脚本内读取，不得把 trace 特定分数或节点 id 抄进脚本。违反即第 7(c) 节过拟合门的软失败形态。

## 6. E0–E3 证据等级与修订白名单

| 等级 | 定义 | 工程示例 |
|---|---|---|
| E0 | 确定性规则检查 | 用 `JSON.parse` 校验黑板产物可解析且必填键齐全（dsh-orchestrator fold 前的结构检查） |
| E1 | 学习模型预测或 rollout | reviewer 技能对产物给出 `{verdict: verified, evidence: E1, confidence: 0.7}`——模型判断，未经独立复核 |
| E2 | 专用模拟器或更高保真计算 | 在非审计树池上对候选编排脚本做离线确定性回放打分（第 12 节 V 公式） |
| E3 | 外部测量或实验 | 真实任务端到端跑一次 dsh-orchestrator 并按固定评估协议打分（生成一棵新发现树） |

每条黑板产物带 `evidence` 字段（E0–E3）。**技能修订白名单默认 E0–E2**：写入任何技能文档（含 evolveDir 内）的经验，其证据等级必须属于 E0–E2；E3 成本高、频度低，用于发版级验证与 held-out 审计报告，不直接驱动 evolveDir 内的技能文本变异。该白名单即第 7(a) 节准入四条件之一。

## 7. 准入过滤器与反作弊审查

**(a) 四条件准入（RSI-Anything Eq.8）**——自生成经验写入任何技能文档前必须**同时**满足（与门）：

1. **有效性**：样本来自完整可复现的运行记录（树文件、ledger、snapshotRef 可追溯，字段可解析）；
2. **分数阈值**：预测分 ≥ r_min；
3. **不确定度上限**：U(τ) ≤ 声明上限；
4. **证据来源白名单**：属于 E0–E2（第 6 节）。

任一不满足即拒绝写入；该过滤**不阻止**把不确定候选送去真实评估（外部评估成本另行计量）。

**(b) 预测引导选择（RSI-Anything §2.3）**——多候选取舍时按『预测分 − λ·不确定度』降序排序，仅在候选预算内放行走入真实评估（回放加两级门）；无效候选先剔除。gateBudget（本周期最多放行的候选数，默认 2）与 λ（candidateUncertaintyPenalty，默认 0.2）由 dsh-rsi-replay CONFIG 声明（全部键与默认值见第 13 节汇总表）；r_min 与不确定度上限属本节 (a) 的技能写入门槛参数，v1 未设数值默认——由 λ 惩罚与两级门对照兜底（第 13 节注）。落点=相位④候选选择步。

**(c) 过拟合门（Harmony App K）**——两级门通过后、落账之前，对 diff 做反作弊审查，检查两类失败形态：

- 软失败『**把搜索 split 写进脚手架**』：把 gate 数据特征（树池里具体某棵树的结构、特定任务模式、评估集划分的巧合）硬编码进编排脚本或技能文本，回放分虚高而真实能力未变；
- 硬失败『**改 grader**』：修改评估协议本身——改 V 公式参数或归一化基准、改审计集划分规则、改评分脚本——让分数讨好自己。

命中任一形态即回滚整对。如实标注：Harmony App K 材料仅部分可读，校准数字与消融数据未获得，本节按已确认的两类失败形态制定。

**(d) 轨迹级成败标签（DyFlow §3.3）**——经验样本记录格式：**（状态摘要, 所派子图, 整条轨迹成败）**，即 (z_t, G_t, outcome.status)。成败标签取整树 `outcome`（第 1 节），样本由树文件直接导出：节点 observation 压缩即状态摘要、当轮派发的子代理集合即所派子图。明确**不用逐步 LLM-judge**（论文指出其评估不一致、方差高），也不构造逐步细粒度奖励。

## 8. 使用步骤与路径约定

三步（与 dsh-method 三步一致）：

1. **计划与确认**：首次运行先展示计划预览与 token 成本警告，从 scoped task 起步（首次运行确认门）。
2. **生产**：跑 dsh-orchestrator 编排模板执行真实任务——产物键值黑板落盘 artifactsDir/state.json、发现树写 trees/、每轮记 ledger 行。
3. **改进**：把 `skills/dsh-rsi-loop/assets/dsh-rsi-replay.dwf.ts` 复制到 `.zcode/workflows/dsh-rsi-replay.dwf.ts`，以 saved 方式运行（示意：`{"saved": {"name": "dsh-rsi-replay"}}`）。相位按实际执行序：⓪ bootstrap 演化基座（首次运行自动建 evolveDir 目录、生成 reviewer 初版并复制编排脚本副本——无需手动 git init，回滚由脚本自管快照承担）→ ①装载树池 → ②诊断 → ③因子化变异 → ④预测引导选择 → ⑤冒烟检查 → ⑥回放打分 → ⑦两级门 → ⑧过拟合门 → ⑨落账或回滚与结转。前置：`incumbentWorkflow` 所指的 dsh-orchestrator 项目副本已存在；树池为空时首周期判 insufficient（三值合法取值，仍落账）。被接受的变更按第 10 节硬规则三经人工复制回插件源发版。

默认路径约定（生产/消费两侧与默认路径三层对齐，资产链不断裂）：

| 项 | 默认值 |
|---|---|
| dsh-orchestrator `artifactsDir` | `.zcode/workflow-runs/dsh` |
| treesDir | `.zcode/workflow-runs/dsh/trees`（与 artifactsDir 同根） |
| ledgerPath | `.zcode/workflow-runs/dsh/ledger.jsonl`（与 artifactsDir 同根） |

- 自定义 artifactsDir 时：**dsh-rsi-replay 的 treesDir/ledgerPath 两项必须同步改到新根之下**，否则消费侧装载不到生产侧资产。
- 编排模板副本改名或移位时：改 dsh-rsi-replay 的 `incumbentWorkflow`（指向现行编排脚本副本的配置项，默认指项目副本 `.zcode/workflows/dsh-orchestrator.dwf.ts`；evolveDir/general/logic 内的副本由相位⓪从它复制而来）即可——它与 artifactsDir 无路径依赖；树的 snapshotRef 相对 artifactsDir 解析，也不受影响。

## 9. decide_scope 与 generalize 的时机

**decide_scope**（技能写入前置子步骤；编辑开始前一次只读裁决）：

- 判据：**该事实能否在运行时由 agent 自行推导**。能推导 → 写 general 分区（evolveDir/general 内对应白名单目录）；属环境或交付通道的内在规则（宿主特定路径、任务集特定约定）→ 写 env 分区（evolveDir/env/），文件头声明目标环境。
- 裁决失败 → 回退按 general 分区处理，但 general 分区禁止硬编码环境特定事实（端口号、宿主路径、具体任务名）；env 分区文件遮蔽同名 general 文件时必须在文件头声明。
- 时机：skill_evolve 每次产出新技能文档或新事实落笔前执行一次；诊断产物（dsh-rsi-replay 相位②）同样过此裁决。

**generalize**（定期重组子代理；Harmony App E.3）——不新增能力，只纠正现有组件的归档作用域，每次调用审计 general/env 两个分区、只纠正一个错置单元：

- **Promote（env→general）**：通用流程被错放特定分区 → 搬移，并把其中每个环境事实替换为运行时获取该事实的步骤；
- **Demote（general→env）**：general 单元硬编码了运行时不可推导的环境事实 → 事实抽为该单元读取的 per-env 配置覆盖；
- **Derive（留在 general，优先）**：事实可运行时推导 → 改写单元自行推导，env 分区不残留任何东西。

两道回归门（缺一不可）：

1. **行为等价**：当前环境 gate 数据回放分不降（搜索分不变）；
2. **general 分区独立可运行**：只装载 general 分区仍得到可用的技能与评审能力。

时机：按声明周期触发（如每 N 个更新周期）或分区反复出现裁决冲突时；由 dsh-rsi-replay 按本节判据与门执行。

## 10. 演化基座：evolveDir 布局与硬规则

evolveDir=项目本地演化工作副本，默认 `.zcode/workflows/dsh-evolve/`（普通目录即可，无需 git 仓库——第 3 节回滚由 dsh-rsi-replay 的周期起点全量快照 backupDir 与按变更清单恢复承担）：

```text
.zcode/workflows/dsh-evolve/
├── general/                      # 通用分区：运行时可推导、跨环境成立
│   ├── tools/                    # 工具型组件（首个工具型组件产出时创建）
│   ├── skills/                   # 技能型组件
│   │   └── reviewer/
│   │       └── SKILL.md          # bootstrap 建立并生成初版评审技能（契约见第 11 节）
│   └── logic/                    # 逻辑型组件：现行编排脚本副本（incumbent）
└── env/                          # 环境分区：环境内在规则，文件头声明目标环境（bootstrap 建空目录）
```

- 三类白名单目录=general/tools、general/skills、general/logic。变异子代理按组件类分派、各自只写 evolveDir 对应目录：tool_evolve → general/tools、skill_evolve → general/skills、logic_evolve → general/logic；调轮数/预算等数值进配置文件而非用 prompt 达成同效；env 分区只收 decide_scope 判为环境内在规则的事实文件。写白名单由工具层强制：越界文件回滚。
- bootstrap 动作：建 general/skills/reviewer/ 并生成初版评审技能（第 11 节契约）、general/logic/ 放编排脚本副本、建 env/ 空目录；tools/ 不预建，在首个工具型组件产出时创建。

硬规则三条：

1. **变异只写 evolveDir 下的项目本地副本**；
2. **绝不写插件安装缓存与 plugins/ 源码**——installing-and-updating.md Updating 节明令 do not edit installed caches，插件源码同样只在发版时由人工编辑；
3. **被接受的变更经人工复制回插件源、按市场更新流程发版**（installing-and-updating.md Updating 节四步）：改源码并递增 manifest 版本 → 同步版本与元数据进同一条市场条目 → 市场页刷新该市场 → 个人页更新插件。

## 11. reviewer 初版内容契约

bootstrap 生成 `evolveDir/general/skills/reviewer/SKILL.md` 时必须满足以下最低契约：

- frontmatter：`name: reviewer`；自身版本字段 `version: 0.1.0-local`（被接受的变异递增该值——local 谱系，见第 2 节）。
- 正文三件：
  1. **角色定义**：对编排产物（黑板产物）做 E0–E3 证据分级与 verified/unconfirmed 判定；评审对象是产物，不是任务本身。
  2. **三值触发器语义**：与第 4 节一致（该改/不该改/证据不足→不动），不得重写出歧义版本。
  3. **输出 JSON 格式**：

```json
{ "verdict": "verified", "evidence": "E1", "reasons": ["结构检查通过，逻辑一致性由模型判断"], "confidence": 0.7 }
```

  约束：`verdict` 属于 verified 或 unconfirmed；`evidence` 属于 E0/E1/E2/E3；`reasons` 为字符串数组；`confidence` 属于 [0,1]。unconfirmed 的产物不 fold（先检后并）。

- 最低即全部：初版不得加入环境特定事实或超出本契约的硬编码；后续扩展一律走变异加两级门，不接受『默认行为+逃生条款』式补丁。

## 12. 数据三分规约

RSI-Anything §2.5 的 update / gate / held-out 三分落点：

| 角色 | 数据 | 用途 |
|---|---|---|
| update | 非审计树池 | 构造候选：诊断与变异参考（相位②/③） |
| gate | 同一非审计树池 | 决定保留：回放评分与两级门（相位⑥/⑦） |
| held-out | 审计集 | 只用于对外报告每次升级的真实表现 |

v1 中 update 与 gate 共用非审计树池（角色区分、集合不强制互斥）；held-out 严格隔离。

- **划分方法**：树池按创建时间序轮转划分，auditHoldout 比例默认 0.2——时间序每第 5 棵树划入审计集。装载时以树文件顶层 `startedAt` 为排序键（缺失记 `createdAt`，再缺失者按路径序殿后并在周期行 `treePool.note` 注明），排序后每 stride 棵划 1 棵（dsh-rsi-replay 相位①）。
- **审计集不参与任何保留决策**：不做诊断参考、不进回放、不进两级门。
- **树池不足 5 棵时审计集为空**，对外报告记 `insufficient`（沿用三值哲学：证据不足不虚报）。
- **Dream-RSI 全历史回归哲学保留在门控侧**：非审计集跨轮累积、永不丢弃；审计集随新树滚动扩充、同样永不丢弃。

回放评分（gate 侧唯一打分公式，完整定义在 dsh-rsi-replay 相位⑥）——单树简化式：

```text
V = bestRevealedScore归一 − α·代理调用数 − β·(决策轮数 / 代理调用数)
```

参数默认值（dsh-rsi-replay CONFIG.scoreWeights）：α=callCost=0.05、β=seriality=0.3、质量项权重 quality=1；`bestRevealedScore归一` = 本树已揭示最高分 ÷ 全树最高分，截到 [0,1]（全树最高分 ≤ 0 时记 0）。W=同波最大批量：回放侧即每轮批大小上限 `replayBatchCap`（默认 4，对应运行期 `maxParallel`），满批并行把第三项推向 1/W；两级门以现版在同一 gate 数据上的 V 均值为对照（never-worse——该保证以 gate 回放分衡量，真实表现另由审计集只作对外报告、不足 5 棵树记 insufficient）。

## 13. dsh-rsi-replay CONFIG 汇总（默认值）

与 dsh-method 第 2 节的编排侧 CONFIG 表对称，改进侧全部关键项集中如下（改编进副本时只动 CONFIG 块；键名以 `assets/dsh-rsi-replay.dwf.ts` 的 CONFIG 块为准）：

| 键 | 默认值 | 作用 |
|---|---|---|
| incumbentWorkflow | `.zcode/workflows/dsh-orchestrator.dwf.ts` | 现役编排脚本（策略 θ 的项目副本；0 号候选，never-worse 对照） |
| incumbentReviewer | `.zcode/workflows/dsh-evolve/general/skills/reviewer/SKILL.md` | 现役评审技能（预测器 φ 的本地演化副本） |
| evolveDir | `.zcode/workflows/dsh-evolve/` | 项目本地演化工作副本根（general/tools·skills·logic + env/） |
| treesDir | `.zcode/workflow-runs/dsh/trees` | 发现树池目录（须与 artifactsDir 同根，见第 8 节） |
| ledgerPath | `.zcode/workflow-runs/dsh/ledger.jsonl` | 版本化反馈账本 |
| gateBudget | 2 | 本周期最多放行进入回放评估与两级门的候选数 |
| candidateUncertaintyPenalty（λ） | 0.2 | 候选排序分 = 预测分 − λ·不确定度（第 7(b) 节） |
| scoreWeights | quality=1, callCost=0.05, seriality=0.3 | V 公式权重 α/β/质量项（第 12 节） |
| auditHoldout | 0.2 | 树池划入 held-out 审计集的比例（轮转法，第 12 节） |
| populationMode | `single`（可选 `moead`） | 单 incumbent 或 N=3 权重角色种群（Tchebycheff 替换） |
| stagnationGents | 2 | 仅 moead：某角色连续停滞代数阈值 |
| replayRoundCap | 6 | 回放决策轮上限（每棵树至多多少轮批选择） |
| replayBatchCap | 4 | 回放每轮批大小上限（即 W，第 12 节） |

注：第 7(a) 节准入过滤器中的 r_min 与不确定度上限是**技能写入门槛参数**，v1 未设数值默认——候选排序由 λ 惩罚兜底、技能写入仍须逐条满足四条件；后续版本若引入显式数值，在本表补行并递增技能版本。

## 附：本规范与执行落点对照

| 本文章节 | 执行落点 |
|---|---|
| 1 发现树 | dsh-orchestrator 生产；dsh-rsi-replay 相位①装载 |
| 2 ledger 与双版本 | dsh-orchestrator 每轮落账；相位⑨结转 |
| 3 两级门与回滚 | 相位⑤（冒烟+修复+回滚）、相位⑥（打分与 never-worse）、相位⑦（两门）；回滚=周期起点快照恢复（backupDir） |
| 4 三值触发器 | 相位①空树池语义、相位④候选选择、周期收尾 |
| 5 prefix-only | 相位③变异提示词约束与回放引擎 |
| 6 E0–E3 | dsh-orchestrator 产物 evidence 字段；相位②诊断 |
| 7 准入与反作弊 | 相位④（b）、相位⑧（c）、技能写入步（a、d） |
| 9 scope 与重组 | 技能写入前置裁决；声明周期重组 |
| 10 基座与硬规则 | 相位⓪ bootstrap 与变异分派 |
| 11 reviewer 契约 | bootstrap 生成物验收（契约已内联进相位⓪生成提示词） |
| 12 数据三分 | 相位①装载分流（startedAt 时间序轮转）；相位⑥打分；对外审计报告 |
| 13 CONFIG 汇总 | dsh-rsi-replay CONFIG 块（键名与默认值的唯一对照表） |
