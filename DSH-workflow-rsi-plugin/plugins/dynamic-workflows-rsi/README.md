# dynamic-workflows-rsi（DSH 动态自改进执行架）

DSH = **Dynamic Self-improving Harness**。一句话定义：一个以 ZCode 动态工作流为执行底座、让「跑任务的编排」与「改进编排自身」都成为可审计、可回滚、**在 gate 回放分口径下**永不劣于当前版本的插件（口径限定见下「成本与治理」末条）。

它由三层机制组成（论文书目与逐条映射见 `dsh-method` 技能文档第 0/6 节）：

| 层 | 做什么 | 关键机制 |
| --- | --- | --- |
| 运行期（跑任务） | planner 子代理逐轮生成一小批可并行的子任务（阶段子图），执行子代理按算子模板施工，产物经键值黑板共享且「先检后并」 | DyFlow 的 designer–executor 范式；预算上限 T_max、planner TERMINATE 决策与不可恢复错误安全阀三出口兜底 |
| 改进期（改进编排自身） | 把「编排脚本」与「评审技能」当作分别版本化的组件，用发现树做离线确定性回放评估，经组件门 + 兼容性门两级保留检查决定去留 | RSI 的保留式递归自改进；版本化 ledger 驱动递归前进 |
| 资产组织 | 演化只发生在项目本地 evolveDir 工作副本（`.zcode/workflows/dsh-evolve/`），绝不触碰插件安装缓存与 `plugins/` 源码；被接受的变更经人工复制回插件源并按市场更新流程发版回流 | Harmony Harness 的因子化框架；推理时 planner 从算子菜单动态组合任务专属 DAG |

## 三个技能

| 技能 | 是什么 | 什么时候读 |
| --- | --- | --- |
| `dsh-method` | DSH 方法入口：何时用 DSH、首次运行确认门、成本治理，以及可复制的编排脚本模板（`assets/dsh-orchestrator.dwf.ts`） | 第一次使用 DSH，或要为一个新任务配置编排脚本时 |
| `dsh-operators` | 算子菜单：12 个算子（DyFlow 附录 C 的 11 类模板 + TOOL_CALL 工具扩展）`o=(O_k, φ, ψ)` 的固定功能契约；planner 由此为每个任务组合出专属 DAG（运行期编排脚本实际派发的菜单是 11 类，TOOL_CALL 为扩展契约） | 编写或修改 `CONFIG.task`，想细调子代理分工与评审强度时 |
| `dsh-rsi-loop` | RSI 闭环规约：ledger 记账、证据等级 E0–E3、经验准入过滤、evolveDir 布局与版本号同步规则，配套回放评估脚本（`assets/dsh-rsi-replay.dwf.ts`） | 要审视/改进已积累的运行记录，或准备发新版插件时 |

## 安装（本地插件市场）

市场根目录 = **本工作区的 `plugins/` 目录**（即本插件目录的上一级，内含市场清单 `plugins/marketplace.json`——其 `version`/`description` 与本插件 `.zcode-plugin/plugin.json` 同步维护，发版时两处一起改）。安装步骤：

1. 打开 **插件市场 / Plugin Marketplace**；
2. 点击 **添加 → 添加插件市场**，选择（或粘贴）上述 `plugins/` 目录；
3. 添加成功后打开 **个人 / Personal** 页，找到本插件；
4. 点击 **安装 / Install**。安装后也可在 **设置 → 插件** 中管理（停用/卸载）。

> **源文件存在 ≠ 已安装。** 本仓库只是插件源码与市场清单：市场的添加与插件的安装都必须由你在 UI 中手动完成，复制源文件到任何位置都不会自动注册或安装本插件。

## 立即可用的试用

安装完成后，新建一个任务，对 ZCode 说（整段可直接复制）：

```text
我已安装 dynamic-workflows-rsi 插件。请用 DSH 方法做一次最小试用：加载 dsh-method 技能，把插件内 skills/dsh-method/assets/dsh-orchestrator.dwf.ts 复制到本项目 .zcode/workflows/dsh-orchestrator.dwf.ts，把 CONFIG.task 改为「审计本仓库 plugins/dynamic-workflows-rsi/ 下三个 SKILL.md 的内部一致性与引用完整性（术语统一、步骤编号、模板路径引用、frontmatter 完整性），只报告可复现的问题」、maxRounds=3、maxParallel=4；先把你即将运行的计划展示给我（首次运行确认门），我确认后再用 CreateWorkflow 以保存的工作流运行。
```

预期产出：

1. **计划先展示、经确认才执行**：运行开始前你会先看到完整的执行计划，回复确认后工作流才真正运行。
2. **进度看板与最终发现列表**：运行中产出进度看板——以看板组件呈现在会话界面（非文件），卡片随运行推进在「排队/施工中/评审中/已fold/未证实」列间移动；结束时给出最终发现列表，每条发现带 `status`（verified / unconfirmed）与证据等级（E0–E3）；未通过验证的候选会被可见地拒收或打回，不会混入最终报告。
3. **可审计的运行工件**：`.zcode/workflow-runs/dsh/` 下生成 `state.json`（键值黑板落盘）、`trees/<run-id>.json`（发现树，含 outcome 元数据）与 `ledger.jsonl`（每轮记录预测 / 观察 / 脚本版本 / 评审器版本 / route 五元组）。
4. **对抗式收敛**：refuter 子代理对最终发现至少反驳一轮，收敛后才经三出口（TERMINATE 决策 / T_max 预算用尽 / 不可恢复错误）之一结束运行。

## 再跑一步：改进循环（可选，dsh-rsi-replay 首跑）

积累至少一棵发现树后（没有也行，首周期会判 insufficient 并如实落账），可跑改进循环：

1. 把 `skills/dsh-rsi-loop/assets/dsh-rsi-replay.dwf.ts` 复制到 `.zcode/workflows/dsh-rsi-replay.dwf.ts`（同 dsh-method 三步法）；
2. 前置检查：`.zcode/workflows/dsh-orchestrator.dwf.ts`（现役编排脚本副本）已存在；其余基座（evolveDir、reviewer 初版、logic 副本）由首次运行的相位⓪自动建立，**无需手动 git init**；
3. 以 saved 方式运行（示意：`{"saved": {"name": "dsh-rsi-replay"}}`）。全部 CONFIG 键与默认值见 `dsh-rsi-loop` 技能第 13 节汇总表；默认路径与生产侧三层对齐，无需改动即可跑。

每个周期产出 ledger 周期行（kind=cycle）与候选看板；被接受的变更留在项目本地 evolveDir，经人工复制回插件源发版回流（见 `dsh-rsi-loop` 第 10 节硬规则）。

## 成本与治理

- **Token 成本警告**：DSH 每一轮都会扇出并行子代理（planner、执行、评审、反驳），总消耗约随「轮数 × 并行度」增长——上面的试用配置（`maxRounds=3`、`maxParallel=4`）已是最小规模，确认产出质量前不要放大这两个值（`maxParallel` 的作用与规划侧节点数上限的关系见 `dsh-method` 第 2 节 CONFIG 表）；RSI 回放评估一侧另有离线评估成本。
- **首次运行先展示计划**：任何 DSH 编排脚本首次运行前，先让 ZCode 把即将运行的计划完整展示给你、确认后再执行（首次运行确认门，`dsh-method` 技能明文规定）。
- **从 scoped task 起步**：先给范围明确的小任务——像试用提示词那样限定输入目录、验收标准与「只报告可复现的问题」，跑通后再逐步放宽任务范围。
- **运行中如何中止**：动态工作流运行不常驻、无后台进程——需要中止时用 ZCode 对运行中工作流的常规停止操作（任务/运行面板）终止该次运行即可。中止不损坏已落盘工件：生产侧每轮增量落盘（state.json/发现树/ledger 保留现场）；改进侧 evolveDir 停在当前状态，下一周期以它为父代重新拍快照。
- **如何停止（不再运行）**：不把 `assets/dsh-orchestrator.dwf.ts` 模板复制进项目 `.zcode/workflows/`（或删除已复制的副本），DSH 即不会运行；彻底移除可在 **设置 → 插件** 卸载本插件。DSH 不注册任何常驻组件。
- **如何更新**：插件更新经「市场刷新 + 更新动作」完成——先修改插件源码并同步递增三处版本号（manifest `version`、编排脚本 `scriptVersion`、插件契约 `reviewerVersion`，详见 `dsh-rsi-loop` 技能），再由你在插件市场的市场源里刷新该市场、在个人页插件详情中点击更新；源码改动不会热更新到已安装副本。
- **「永不劣于」的口径**：该保证指改进循环的保留门在 **gate 数据回放分** 上不退步（现役脚本恒为 0 号候选对照）；held-out 审计集只作对外报告、不足 5 棵树时如实记 insufficient，不构成保证的一部分。

## 文件结构

本插件共 7 个文件（当前版本 0.1.0）：

```text
plugins/dynamic-workflows-rsi/
├── .zcode-plugin/plugin.json                  插件清单（name=dynamic-workflows-rsi，version=0.1.0）
├── README.md                                  本文档
├── skills/dsh-method/
│   ├── SKILL.md                               DSH 方法入口：论文书目、何时用、首次运行门、试用与治理
│   └── assets/dsh-orchestrator.dwf.ts         编排脚本模板（复制进项目 .zcode/workflows/ 后运行）
├── skills/dsh-operators/
│   └── SKILL.md                               算子菜单：12 个算子（11 类 DyFlow 模板 + TOOL_CALL）o=(O_k, φ, ψ)
└── skills/dsh-rsi-loop/
    ├── SKILL.md                               RSI 闭环规约：ledger、证据等级、准入、evolveDir、版本同步、CONFIG 汇总
    └── assets/dsh-rsi-replay.dwf.ts           回放评估脚本（离线确定性回放 + 两级保留门）
```

同级的 `plugins/marketplace.json` 是市场清单，不属于插件本体；其 `version`/`description` 随插件发版与本插件 `plugin.json` 同步更新。

**v1 范围边界**（以下承诺属后续版本，当前 0.1.0 未实现）：完整三段冒烟的桩环境自测（现为两段）、Harmony 式技能池级零样本迁移（现为算子菜单层复用）、准入过滤器 r_min 与不确定度上限的显式数值参数（现为 λ 惩罚兜底，见 `dsh-rsi-loop` 第 13 节注）。
