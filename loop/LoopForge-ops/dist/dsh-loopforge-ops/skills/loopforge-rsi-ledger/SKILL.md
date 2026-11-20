---
name: loopforge-rsi-ledger
description: LoopForge RSI 台账——预测-行动-观测-改进四步循环：预测三件套（预测+不确定度+效用分 R_d）、行动绑定版本号 θ_k/φ_k、观测打 E0-E3 证据层级、append≠revision；改进仅在三态可靠性判定为 unreliable 且数据充分且预算够时触发，策略/预测器类候选变更过三重保留门（G_π/G_W/G_pair）才沉淀，runbook/切片等文档类改动走复盘人审通道；数据角色三分与 Verify/Explore/Write 分账。记录值守观测、申请沉淀分流参数/判据权重/路由规则/预测器配置类改动或评审任何值守自我改进时使用。
---

# LoopForge RSI 循环台账（RSI-Anything arXiv:2610.13912v1；保留门与守护 arXiv:2607.07663v2）

机制来源两篇：**RSI-Anything（arXiv:2610.13912v1）**给字段机制——预测-行动-观测-改进外环（式5–18）与十二机制字段（摘要 pluginImplications 全量落字段，见「RSI-Anything 机制字段」节）；**RSI 综述（arXiv:2607.07663v2）**给门禁原则——验证层级保留门（§5.2）、失败模式三守护（§5.3）、两轴登记（§2.2）。Verify/Explore/Write 分账与税率口径出自 meta-harness ARCHITECTURE.md §2.6（先例工程，包外；仅引用口径，本包与该工程无安装依赖）。

**台账落盘路径=简报声明制**：开班简报「账目根」行声明的值优先；未声明时用默认公式 `<包根>/../../ledger/rsi-ledger.jsonl`（包根=本包 package.json 所在目录）。JSONL 追加写，每行一条，只追加不删改，字段名与取值域按「字段三档总表」固定（可被机检）。自检命令（绝对路径）：

```
python E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py ledger <台账文件>
```

## 四步循环（式5/7）

每个更新决策周期 k 走四步，逐步落条目：

| 步 | 字段（JSONL 键名） | 口径 |
|---|---|---|
| 预测 | `prediction` | 行动执行**前**落盘的预期结果，事后补写无效——**开放档**：标量/字符串/嵌套对象均合法（覆盖六键嵌套形态）；分布轨须附 `pred_kind:"distribution"` 与 `calibration` 分数（推荐档，见机制字段节） |
| 预测 | `uncertainty` | 该预测的不确定度 u_τ |
| 预测 | `utility` | 效用分 R_d = Σ_j w_{d,j}·r_{τ,j} − λ_d·U(u_τ)（式7：加权效用减不确定度罚项）；λ_d 按**版本声明**（`lambda_d` 数值，0 合法，不再恒定制——推荐档） |
| 行动 | `version` | 生成预测的系统版本——**机检必需字段**（append 条目缺它即 invalid），与 θ_k/φ_k 同为版本归因锚点 |
| 行动 | `theta_k` / `phi_k` | 行动绑定的版本号：θ=策略侧（分流参数/判据权重/路由规则），φ=预测器侧（预测器配置）；语义附加字段，机检不校验 |
| 观测 | `observed` / `e_level` | 观测结果+证据层级——`e_level` 为**机检必需字段**（append），取值域 E0–E3（定义与 loopforge-evidence-gates 共用：E0 确定性规则检查 / E1 模型预测与 rollout / E2 仿真或高保真计算 / E3 外部实测），机检只认这个键名；`evidence_level` 是它的合法别名（两键认一，同在须同值，见条件档表） |
| 改进 | `kind` | **机检必需字段（每条必带）**，取值 `append` / `revision` / `override`（第三种 kind 采集人否决 AI 提议事件，见治理三率节）；机检只认顶层 `kind`，`decision` 只是语义别名 |
| 改进 | `reliability` / `coverage` | 三态判定+候选覆盖率（开放档：`{observed,required}` 数值对象或标量均合法），见三态节；判据多选登记见机制字段第 2 条 |
| 复盘 | `interventions` | 本班白名单外向人求助的次数计数——求助白名单外求助一次即流程 bug，此计数就是复盘抓它的抓手；语义附加字段 |

**版本归因**：每条预测必须链接生成它的系统版本（θ_k/φ_k）。可靠性统计只用「当前版本生成的预测」（存档的、或对记录输入用当前版本重放得到的）；旧版本预测留作分析，**不并入当前误差估计**。只有执行过的候选才产生配对的预测-观测反馈；想象轨迹须过准入过滤（有效性+最低效用+不确定度上界+证据源白名单，即式8 四乘子，见机制字段第 5 条）才能进训练集。

## 字段三档总表（与 check.py ledger 实现逐条对应）

机检分三档：**必需档**（缺即 invalid，exit 3）、**条件档**（存在才查取值域/形状/自洽，缺不报错）、**推荐档**（语义义务，机检不查存在）。字段名差一个字母即判 invalid。全部新字段要么仅作用于 revision/override 条目、要么是条件校验——**对旧 append 条目零影响**。

### 必需档（按 kind）

| 条目 | 字段 | 取值域 / 联动机检 |
|---|---|---|
| 每条 | `kind` | append / revision / override |
| append | `e_level` | E0–E3；别名 `evidence_level` 两键认一，任一存在即过 |
| append | `version` | 非空 |
| revision | `g_policy` / `g_world` / `g_pair` | 三门结果，**取值收紧 pass \| fail**（v0.2.0 起，堵「门结果可手填且机检无法分辨」的取值面） |
| revision | `baseline` | 对照版本，非空 |
| revision | `v_level` | V2 / V1 / V0（签发验证层级；**Vi 非法**，见保留门节） |
| revision | `coupling` | independent / shared_judge / self_rewrite（见守护一） |
| revision | `axes` | `{target: deploy\|training\|evaluator\|process, closure: in_loop\|on_loop\|closed}`（见两轴节） |
| revision 联动 | `staged` | v_level=V0 时强制 `staged:true`（降级暂存） |
| revision 联动 | `external_check` | coupling 同源（shared_judge/self_rewrite）时强制非空，且 v_level 不得为 V0 |
| revision 联动 | `human_gate` | axes=evaluator×closed 时强制非空（人工闸门） |
| override | `object` | severity / route / disposition / close |
| override | `ai_proposal` / `human_decision` | 均非空（AI 提议内容+人否决决定） |
| 含决策的任何条目 | `prediction` / `uncertainty` / `utility` | 三件套必须齐（含 `decision` 字段或三件套任一字段即触发） |

### 条件档（存在才查）

| 字段 | 校验 |
|---|---|
| `grounding_rate` | 0–1 数值（外源信号占比）；且 axes.closure=closed 时**必须存在且 >0**——纯闭环默认拒绝沉淀、只可暂存（守护二） |
| `reliability_criteria` | 非空列表，元素∈{error, calibration, drift, coverage} |
| `pathways` | 对象，三键 uncertainty_aware_selection / multi_step_rollout / imagined_learning 齐、均为布尔 |
| `admission` | 对象，四乘子 valid / min_utility / unc_cap / source_ok 齐、均为布尔（式8） |
| `imagined` | `imagined:true` → admission 必须存在且四乘子**全真**才可进训练数据 |
| `rollout` | 对象且 `horizon` 为正整数（可选 states_provenance）→ 本条 e_level 强制 **E1**（rollout 谓词，见机制字段第 9 条） |
| `cost_class` | 对象，verify/explore/write 数值；三项与 `tokens` 同在时和=tokens（缺任一侧跳过不报错，写齐即须对账） |
| `blast_radius` | ^R[0-3] 前缀：R0 只读 / R1 单文件 / R2 单实例 / R3 全局 |
| `gate_data` | 非空字符串，指向文件须存在（相对台账文件所在目录解析）——堵「孤立组件各自过门即宣称配对成立」 |
| `evidence_level` | 与 e_level 同在须同值（别名一致性） |
| `axes`（非 revision 条目） | 存在即查 target/closure 取值域 |

### 推荐档（语义义务，机检不查存在）

- **表外键 8 个**：`entry_id` / `ts` / `shift` / `incident_id` / `phase` / `tokens_estimated` / `notes`（ts 不做 ISO 格式机检）；`blast_radius` 推荐登记（登记后走条件档前缀校验）。
- **语义附加**：`theta_k` / `phi_k` / `observed` / `reliability` / `coverage` / `interventions`。
- **RSI-Anything 机制字段**（见专节）：`policy_trigger`、`reliability_scope`、`train_eval_overlap`、`pred_kind`、`calibration`、`lambda_d`、`selection`、`feedback_route`、`budget`、`feedback_usage`、`matched_eval`、`run_id`、`paired_diff`、`decoupling_event`。
- **散文纪律字段**：`caveat`（V1 保留义务，见保留门节）、`frame_watch`（守护三）、多样性指标（守护二）；联动字段在联动条件之外也推荐登记（如非同源条目的 external_check 留空即可、非 evaluator×closed 的 human_gate）。

## 验证层级保留门（v_level，综述 §5.2）

「已证明的自改进强度沿层级追踪」——revision 条目的保留档位由**签发者的验证层级**决定，落成字面排序规则，可对外审计：

| v_level | 签发者 | E 级映射 | 保留档位 | 机检联动 |
|---|---|---|---|---|
| **V2** | 形式验证 / 机检签发（check.py 类确定性判定，映射 E0） | E0 | **可自动永久保留** | — |
| **V1** | 执行反馈签发（测试/重放/生产实测，映射 E2/E3） | E2/E3 | 保留，**必须附 caveat 非空**（语义义务：写明可靠而不完备、固定基准终被博弈——机检不抓，复盘证据轴抓） | — |
| **V0** | 学习型裁判签发（映射 E1） | E1 | **降级暂存**——机检强制 staged:true；晋升须外部位阶更高复核：新 revision 条目附 V2/V1 签发，或人审 human_gate | staged==true |
| **Vi** | 内在信号（置信/自一致/似然/uncertainty 自评） | 无映射 | **非法取值，机检直接 invalid** | 拒绝 |

排序纪律三条：① V0 不得因「裁判很确定」自升档——位阶更高的复核才能改档；② 机检只认 v_level 字面值、不评估签发质量，签发层级靠落字段时诚实申报，申报造假属审计问题由复盘证据轴抓；③ E0 映射保真度说明：check.py 等确定性判定在本包语境最接近形式验证器，此映射的近似性记入 openQuestions（如实声明，不冒充形式验证）。

## 失败模式三守护（综述 §5.3）

### 守护一：自证循环（coupling / external_check）

生成器与评估器同源时，自评改善不可信。revision 必需 `coupling`：independent（不同源）/ shared_judge（共享裁判）/ self_rewrite（自我重写）。**同源（shared_judge 或 self_rewrite）时机检强制**：`external_check` 非空——一次外部位阶更高的验证，签发层级须≥V1——且本条 `v_level` 不得为 V0。依据 Mirror Loop 证据：十轮无 grounding 的自评信息性降 55%，第三轮插入一次最小验证即恢复前进——守护按「周期性单次外部验证」执行，**不要求持续人工**。

### 守护二：坍缩与多样性（grounding_rate / 多样性 / 轨迹复查）

- **机检**：axes.closure=closed 的条目强制 `grounding_rate`>0（外源信号占比 0–1；纯闭环按 Zenil 熵库原理默认拒绝沉淀，只可暂存）。
- **持久积累义务**（推荐档）：grounding_rate 与多样性指标（任务分布计数）随条目登记，跨班累计。
- **散文纪律（机检不覆盖，如实记）**：rise-and-collapse 证据（可验证二值奖励也崩塌、KL/EWC 防不住）落为复盘规则——门数据配对差轨迹**连续两窗口下降即自动降级复查**；机检无历史分析能力，此规则由复盘执行。

### 守护三：框架锁定（frame_watch）

台账是环外视点，内置对「局部指标仍在改善的路线」的强制抽样挑战：**每次复盘至少挑战一条**。四候选观测量落为复盘推荐字段组 `frame_watch`（推荐档）：productive_abandonment（可弃而不弃）/ invariant_transfer（不变量迁移）/ absence_sensitivity（缺席敏感性）/ reframing_latency（重构延迟）。

## 两轴登记与最高审查级（综述 §2.2）

revision 必需 `axes`（两轴登记）：

| 轴 | 取值 | 含义 |
|---|---|---|
| target | deploy / training / evaluator / process | 改进打在什么上 |
| closure | in_loop / on_loop / closed | 改进在环内、环上还是闭环 |

**evaluator×closed（自评估×闭环——系统改写自己对「更好」的定义）为最高审查级**：机检强制 `human_gate` 非空（人工闸门），禁止默认保留。target=evaluator（评估器共进化，任意 closure）语义上同落最高审查级、复盘必查 human_gate——机检只抓 evaluator×closed 字面组合，其余组合的人审义务由复盘证据轴抓（如实分工，不虚报机检覆盖面）。

## 治理三率（全部从台账可算）

| 率 | 算法 | 口径 |
|---|---|---|
| 保留率 | 三门全 pass 的 revision ÷ 全部 revision | **v0.2.0 起门败候选无论成败都落 revision 条目**（三门取值收紧 pass\|fail），被拒者同时记 Explore 税 |
| 回滚率 | g_pair=fail 的 revision ÷ revision 总数 | 整对回滚事件直接从台账数出 |
| override 率 | override 条目数 ÷ AI 提议总数 | 采集义务见下 |

**override 采集义务**（修复审计 openGaps「override 无采集机制」）：人否决 AI 提议事件落 `kind:override` 条目，机检必需 object∈{severity, route, disposition, close}+ai_proposal+human_decision。采集点三处：① SEV1/2 人审定级（object=severity）；② 受限自动化逐项审批（object=route/disposition）；③ 复盘方案轴推翻判级（object=close）。

**每条 revision 的可审计证据链**（四要素）：哪个信号签发（v_level）+ 外源占比（grounding_rate）+ 评估器是否被共进化（coupling 含 self_rewrite）+ 代理指标脱钩事件（推荐字段 `decoupling_event`——场外证据的守护原语）。

## RSI-Anything 机制字段（arXiv:2610.13912v1 十二机制，摘要 pluginImplications 全量）

除三档总表已列者，十二机制按以下字段登记（除注明条件档外均为推荐档——语义义务，机检不查存在）：

1. **policy_trigger**（θ 侧触发，式9）：调度/反馈触发+学习证据+预算三判，与 φ 侧三乘子（式10 触发条件）对称——策略侧动手前同样三判全过。
2. **reliability_criteria**（条件档）：{error, calibration, drift, coverage} 非空多选——可靠性判据从单一 coverage 扩为多选；附结论作用域 `reliability_scope`（𝒦_k 申报义务：结论只对申报过的候选范围负责）与 `train_eval_overlap` 声明（训练/评测数据重叠须明示）。
3. **prediction 点/分布双轨**：分布轨须附 `pred_kind:"distribution"`+`calibration` 分数（推荐档）；`lambda_d` 不确定度罚项按版本声明（数值，0 合法，不再恒定制）。
4. **selection**：{proposed, valid, rule: utility\|info_seeking, batch, budget_fit}——行动步候选选择链，探索性评测（info_seeking）与效用排序（utility）分开记账。
5. **admission**（条件档，式8 四乘子硬化）：{valid, min_utility, unc_cap, source_ok}——**imagined:true 条目必须四乘子全真才可进训练数据**；且**两门分离**：训练准入不阻止同一候选送外部评测，别把训练门当评测门。
6. **feedback_route**：demonstration / preference / workflow_search——反馈走哪条通道进 D_policy。
7. **pathways**（条件档）：{uncertainty_aware_selection, multi_step_rollout, imagined_learning} 三布尔——开班通道开关，禁用通道触发算子记 0。
8. **budget**：{adapt, reeval, gate_check} 预算三项+外部反馈用量 `feedback_usage`——与 Verify/Explore/Write 分账并列申报。
9. **rollout 谓词**（条件档，写死同一谓词名供字段表与 check.py 共用）：条目含顶层键 `rollout`（对象，至少含 `horizon` 正整数，可选 `states_provenance`）即判定为 rollout 条目，**机检强制其 e_level==E1**——预测性规划状态未经外部检查，进台账不得高于 E1。
10. **matched_eval + gate_data/run_id 指针**：matched_eval={metrics, constraints, feedback_quota, threshold}；`gate_data` 指向门数据文件、`run_id` 指向执行记录，**机检校验 gate_data 文件存在**（相对台账文件目录解析）——堵「孤立组件各自过门即宣称配对成立」。
11. **paired_diff**：{delta, ci95_low, ci95_high, cluster_unit}——改进申报统计口径，**微小增益不得脱离区间证据报成改进**。
12. **imagined 轨迹与执行反馈分界**：想象数据须过 admission（第 5 条）才进训练集；只有执行过的候选才产生配对的预测-观测反馈（见版本归因段）。

## append ≠ revision 与 cycle 计数（表1）

**扩展反馈历史（append）不是策略或模型修订（revision）**。append=往反馈历史 H_k 追加观测条目；revision=过三重保留门采纳后的版本替换（θ_k→θ_{k+1}）。周期计数 k 数**更新决策周期**（以门判定收尾），不是成功改版数——即使两侧都留旧版，k 照样 +1。报表把 append 记成改进，是把记账动作虚报成改版，属系统性虚增。

## 三态触发与候选覆盖率（式10–11）

可靠性判定 `ρ_k^W = Reliability(W_{φ_k}; H_k, K_k) ∈ {reliable, unreliable, insufficient}`（H_k=反馈历史，K_k=本周期候选范围）。触发条件式：

```
u_k = 1{ρ_k^W = unreliable} · 1{D_adapt 数据充分} · 1{B_update ≥ ĉ_adapt}
```

三个乘子全为 1 才动手。reliable→不动；unreliable 且数据够、预算足→进改进流程；**insufficient→不触发适应**，先补观测。台账每条观测带 `coverage`（候选范围内累计观测量/需求量）。**「没测过所以不知道准不准」是最危险的态**：insufficient 不是 safe——不得当 reliable 报，也不得绕过它直接改 φ。

## 三重保留门与失败规则（式13–18）

| 门 | 判什么 | 处置 |
|---|---|---|
| G_π / G_W 组件门 | 候选 θ′/φ′ 对在位 θ_k/φ_{d,k} 在**门数据**上是否达标 | **败→留旧版**，候选只记 Explore 税 |
| G_pair 配对门 | 新对 (θ̄,φ̄) 对旧对 (θ_k,φ_{d,k}) 的配对表现 | **败→整对回滚**（单组件各自过门不算数——策略会生成让「单独变好的预测器」失准的候选） |
| 双未动 | θ̄=θ_k 且 φ̄=φ_{d,k} | **免比较**：G_pair=1，不新开评估 |

三门结果落 `g_policy`/`g_world`/`g_pair`，取值只认 pass\|fail。**门败候选 v0.2.0 起也落 revision 条目**（取值如实 fail）——保留率/回滚率从台账可算的前提是败例在账，被拒者同时记 Explore 税。门只在 θ 与 φ 上定义：**分流参数、判据权重、路由规则、预测器配置**。事件稀疏下门常闭是设计使然（门数据不够就不放行），不是故障——不要为了开门而稀释门数据。

**作用域限定**：runbook/切片等**文档类改动不过这三重门**，走 loopforge-shift-protocol 的复盘三轴+人审定稿，或契约②书面豁免（豁免必须留痕，复盘证据轴专抓未留痕者）。

## 数据角色三分与两条记录线

同一批评测观测按用途分三个角色：**更新数据**建候选、**门数据**选保留、**审计集**只用于最终报告——audit 数据**绝不参与留去判断**。再按改进对象分两条独立记录线：D_policy（喂 θ：示范学习/偏好学习/工作流搜索，登记 feedback_route）与 D_adapt（喂 φ 的适应数据）——两线目标不同、无需含相同记录，台账里分开累计。

## 运行内锁定区 vs 可演化区

- **锁定区**（一个值守班次/一次运行内不改）：任务目标、状态/动作定义、接口、评分判据、约束、验收与停止规则、总预算上限。
- **演化区**（按门沉淀）：任务状态与观测积累、候选池、反馈历史 H_k、已采纳的 θ/φ 版本。

## 分账与税率 ρ≤10%

每笔条目按 Verify（验证在位者/候选）/Explore（额外 rollout、提案生成、行为对比）/Write（写持久状态）分类计 token；归不进三类的进残差，残差占比 >10% 视为记账缺陷。**被拒改动照常计税**——候选生成+验证的成本不因未采纳而消失。税率 ρ = N_RSI/N_task ≤10%（口径出自 meta-harness ARCHITECTURE.md §2.6（先例工程，包外）；仅引用口径，本包与该工程无安装依赖）。申报改进缺分账不视为改进。

## 复盘候选改进双轨入口

复盘产出的候选改进先分类再进通道：**策略/预测器类**（分流参数/判据权重/路由规则/预测器配置）→ 本技能三态判定+三重保留门；**文档类**（runbook、切片文档）→ 人审定稿或契约②书面豁免，不硬等门开。豁免必须留痕（批准人、理由、范围）——复盘证据轴专抓「未留痕豁免」与「文档类改动冒充策略类绕门」。

## 配套技能

- **loopforge-evidence-gates**：E0–E3 证据层级共用定义；`check.py ledger` 机检（绝对路径用法见篇首命令）。
- **loopforge-orchestration**：保留式更新调度——门败留旧版/整对回滚在值守排程中的执行序与回滚点。
- **loopforge-shift-protocol**：文档类改动的复盘三轴+人审定稿/书面豁免通道。
- **loopforge-shift-memory**：记忆库写入门槛与本技能保留门同一套 v_level 层级排序（班内草稿→staged 试用期→晋升保留须 V1/V2 签发）。
