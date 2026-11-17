# SDD v2：10 次迭代与效率度量

目标（会话内目标）：在 v1.0 基础上迭代 10 次，使流程与效果提升、效率提升 ≥50%，并重新安装到 DSH。

- 构建源：`E:\sdd\sdd-skill\`　安装副本：`C:\Users\13423\.dsh\skills\sdd`
- 版本：`metadata.version: 2.0.0`（process: SDD v2）
- 度量工具：`scripts/sdd.py bench`（静态成本）、`scripts/sdd.py doctor`（安装/预算健康）
- 经验基准：`E:\sdd\bench\runs\baseline`（v1）、`E:\sdd\bench\runs\after`（v2）

## 1. 效率怎么算

效率不是一个数，所以先固定口径。四个维度，都是"v2 ÷ v1"，比值越小越快：

| 维度 | 定义 | 为什么算 |
|---|---|---|
| 工具调用数 | 同一任务从开工到合并所需的助手工具调用次数 | 最接近"代理的实际动作成本" |
| 手写流程产物 | 代理必须逐字写出的流程文件数（brief/spec/票/台账/评审/复盘） | 每写一个都要读模板、生成、校验，是 v1 的最大开销 |
| 峰值上下文 | 单步必须读入的字节数 = SKILL + 最大 reference + 该步模板 | 决定单步成本与会话能否撑住 |
| 强制人工停顿 | 必须等人回答的次数 | 决定端到端墙钟时间 |

综合效率指数取四项比值的**几何平均**（比值型指标的常规聚合，避免某一维被线性放大）。算术平均一并给出，以便对照。

## 2. 基线（v1.0，改造前）

静态成本（`sdd.py bench` 在 v1 文件上测得）：

| 指标 | v1 |
|---|---|
| SKILL.md | 10437 B |
| lite 单步上下文 | 12444 B |
| standard 单步上下文 | 51777 B |
| 峰值上下文（SKILL + verify ref 5952 + brief 模板 1131） | 17520 B |
| 模板总量（须读入才能填） | 7849 B |

经验基线（`bench\runs\baseline`，任务：实现 `initials(name)` + unittest，lite 场景）：

- 9 次工具调用：写测试 → 跑红 → 写实现 → 跑绿并提交 → 写票 → 写台账 → 评审 → 复盘 → 提交产物
- 6 个手写流程产物；2 次强制停顿
- 提交：`25242cf`（红基线）、`bf51fa5`（实现）、`36ede5a`（产物）
- 评审如实记录 F1："未做变异测试"

## 3. 十次迭代

每次迭代 = 一个具体改动 + 可测增量。摩擦点都来自真实运行（含 v1 冒烟与 v2 基准自身暴露的缺陷）。

| # | 改动 | 消除的摩擦 | 前后数字 |
|---|---|---|---|
| 1 | 度量先行：`bench` 子命令 + 固定四维口径 + 跑通 v1 基线 | 没有基线就无法声称"提升" | 基线固化：9 次调用 / 6 产物 / 17520 B / 2 停顿 |
| 2 | SKILL 路由化：细则全部下沉 references，主文件只留模式表、六闸门表、不变量、路由表 | v1 SKILL 10437 B，每步都要读 | SKILL 10437 → 6864 B（−34%） |
| 3 | `init` 脚手架：brief/spec/tickets/evidence/`.gitignore` 一条命令生成 | 手写 6 个文件、漏小节、模板替换错 | 手写产物 6 → 1；修掉 `# NN:` 标题未替换、`Blocked by` 自阻塞 |
| 4 | `run` 证据记录：日志落盘 + 台账行（命令/exit/摘要/路径/日期），失败打印末 15 行并透传退出码 | "跑过了"无法复现，台账靠人抄 | 每个验收项 1 条命令产出 1 行证据；手抄归零 |
| 5 | `check` 断言式闸门：G0–G5 逐条检查（TBD、accepted、DAG 无环、前沿、台账行数 ≥ 验收项、VERDICT、pr/retro） | 闸门靠记忆关闭 | 未填模板即 FAIL（已实测）；默认不跑预算以免噪声 |
| 6 | `next` + `review`：前沿计算；固定点校验（ref 存在、diff 非空）；生成三轴评审 prompt | 人工读阻塞边、评审靠回忆拆分 | 1 条命令得前沿；评审从"想"变"读 3 个文件" |
| 7 | `ask` 决策包：把 brief/spec 的未决项收敛成 ≤4 问，每题带假设与选项 | 零散追问、重复问 | 停顿从"随时打断"变成"一次决策包" |
| 8 | lite 模式：单票内联 spec，不产 brief/spec 文件；G5 只要求 retro | 小改动也走全套文件 | lite 上下文 12444 → 8871 B（−29%）；产物 2 → 1 |
| 9 | `finish` 一键收尾：最终证明 → 置 done → verdict/retro → 提交 → 逐闸门复检；证明失败则票保持打开 | 收尾 4 步手工、状态与证据脱节 | 收尾 4 步 → 1 条命令；随后修 9 个真实缺陷（见 §5） |
| 10 | `doctor` + 版本 2.0.0 + 可移植：源/安装哈希比对、frontmatter 与预算校验、README/PROCESS 对齐 | 安装副本会漂移，预算会悄悄超 | 重装后 `doctor` 全 PASS；版本可追踪 |

## 4. v2 最终基准（同一任务，`bench\runs\after`）

6 次工具调用：

1. `sdd.py init --slug initials --name "initials()" --mode lite`
2. 填票内 Spec（Problem/Solution/Decisions/Seam/Out of scope/验收项）
3. 写 `tests/test_initials.py`（3 个用例）
4. `sdd.py run ... --label red -- python -m unittest discover -s tests -q` → exit 1，观测 `ModuleNotFoundError: No module named 'initials'`，台账 1 行
5. 写 `initials.py`
6. `sdd.py finish ... -- python -m unittest discover -s tests -q` → exit 0，`Ran 3 tests / OK`，G0–G5 全 PASS，提交 `42b23f5`

流程文件手写数：1（票内 Spec）。强制停顿：1（G1 的接缝/范围确认；lite 下可与 Spec 一并确认）。

静态成本（v2）：

| 指标 | v1 | v2 | 变化 |
|---|---|---|---|
| SKILL.md | 10437 | 6864 | −34.2% |
| lite 单步上下文 | 12444 | 8871 | −28.7% |
| standard 单步上下文 | 51777 | 48348 | −6.6% |
| 峰值上下文 | 17520 | 12816 | −26.8% |
| 工具调用（经验） | 9 | 6 | −33.3% |
| 手写流程产物 | 6 | 1 | −83.3% |
| 强制停顿 | 2 | 1 | −50.0% |

综合（四项比值：调用 6/9、产物 1/6、峰值 12816/17520、停顿 1/2）：

- 几何平均 = (0.667 × 0.167 × 0.732 × 0.5)^(1/4) = **0.449 → 效率提升 55.1%**
- 算术平均 = 0.516 → 提升 48.4%（单项等权时的保守读数，差 1.6 个百分点）

结论：**按比值型综合指数（几何平均）达标（≥50%）**；按等权算术平均为 48.4%。两项都如实列出，不做单一数字包装。调用次数已接近 lite 下限（init → 红 → 实现 → finish 至少 4–6 步），继续压缩只能靠把测试与实现合并，会损害"先红后绿"的证据价值，不再压。

## 5. 基准运行暴露并修复的缺陷（效果，不只是效率）

| 缺陷 | 现象 | 修复 |
|---|---|---|
| 模板标题未替换 | `# NN: initials()` | init 渲染时统一写 `# <NN>: <title>` |
| `Blocked by` 自阻塞 | `01` 引用自身，DAG 假成环 | 模板改为 "None (can start immediately)"，解析跳过自身 id |
| 台账占位行 | `evidence/t01-<name>.txt` 被当成真实证据 | 只接受首列 `T\d+` 且不含 `<` 的行；插入前清除占位行 |
| 验收项未勾 | 票已 done，复选框仍 `[ ]` | `finish` 自动勾选 |
| `Merged/fixed point` 空占位 | `<commit>` 永远不填 | `finish` 写分支名 + 收尾前 HEAD 短哈希 |
| 评审/复盘占位残留 | `<If not ship...>` 留在产物里 | 写 verdict 时删除占位行；retro 写实内容 |
| UTF-8 BOM | PowerShell 写的票读不到标题，退化为文件名 | `read()` 用 `utf-8-sig` |
| G3 过度严格 | 多票功能里第一票收尾就 FAIL（要求所有票都 done） | G3 只要求"至少一票 done，且每个 done 票有足够台账行" |
| lite 提示错 | lite 模式提示 "fill brief.md" | 按模式给不同 next 提示 |

## 6. 验证（除基准外）

| 验证 | 结果 |
|---|---|
| lite 全流程 | `bench\runs\after`：G0–G5 全 PASS，提交 `42b23f5` |
| 收尾拒假通过 | `bench\scratch2`：证据不成立时 `finish` 打印 "final proof failed; ticket left open" 并退出 1 |
| standard 全流程 | `bench\scratch3`：首票收尾后 G0–G4 PASS，G5 因 `pr.md` 未写而 FAIL（符合设计：功能级闸门） |
| 闸门能抓住空模板 | 未填模板时 `check` 大量 FAIL（预期） |
| 安装一致性 | `sdd.py doctor` 比对源与副本 sha256，全部 PASS；SKILL.md 哈希 `5C960E9E…A48803` 一致 |
| 技能可被 DSH 发现 | `~/.dsh/skills/sdd/SKILL.md` 被目录监视器发现，技能目录重新出现 `sdd`（version 2.0.0） |

## 7. 已知限制（不粉饰）

1. **变异测试没有内建。** G3 要求"红 → 绿"，但绿之后能否抓住回归仍靠人决定是否做变异；v1 的 F1 限制仍然存在。
2. **standard 的效率提升有限（上下文 −6.6%）。** 七个 reference 是闸门知识，压缩会伤深度；收益主要落在 lite 与"少写文件"上。
3. **wayfinder 只做了脚手架，未端到端跑过**（`init --mode wayfinder` 生成 map.md 已验证，未做真实大特性演练）。
4. **算术平均 48.4% < 50%**，与几何平均 55.1% 并存；口径已写明，读者可自行取舍。
5. **基准是单人单任务**（initials），样本量 1；调用数差 3 次在噪声范围内，产物与上下文差异才是稳定信号。

## 8. 复现

```powershell
$py = "C:\Users\13423\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
# 静态成本
& $py E:\sdd\sdd-skill\scripts\sdd.py bench
# 安装校验
& $py C:\Users\13423\.dsh\skills\sdd\scripts\sdd.py doctor
# v2 基准回顾
Get-Content E:\sdd\bench\runs\after\.sdd\initials\evidence.md
git -C E:\sdd\bench\runs\after log --oneline
# v1 基线回顾
git -C E:\sdd\bench\runs\baseline log --oneline
```

## 9. 下一步（若继续迭代）

1. G3 增加 `sdd.py mutate`：对当前 diff 做 N 个变异，要求至少 1 个被测试杀死，否则记 F1。
2. `init` 接受 `--problem/--solution/--seam`，把 lite 的第 2 步也并进去（调用 6 → 5）。
3. standard 的 reference 按"闸门内最小集"重排，把 verify/specify 的重复段落合并，目标 −15%。
4. 用真实中型需求跑一次 standard + wayfinder，记录 v2 的第一手摩擦。
