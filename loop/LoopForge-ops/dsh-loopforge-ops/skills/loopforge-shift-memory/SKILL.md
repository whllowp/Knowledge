---
name: loopforge-shift-memory
description: LoopForge 值守记忆——跨班次事实级结构化记忆库：六元组 ⟨s,r,o,κ,unit,evidence⟩+entry_id 引用系、catalogue 目录单一实现源（check.py 生成/校验，禁手写，事件落盘后原子重投影）、检索三处（分诊/开班/复盘）先校验后读、写入门槛绑定当班读过、每班默认 40 条有界预算、stale/archive/refute 只标记不物理删、draft→staged→retained 晋升须 v_level≥V1、κ=list 强制 incomplete、与交接报告/台账三层分工。接班分诊、开班承接、复盘查重或沉淀可复用事实时使用。
---

# LoopForge 值守记忆（arXiv:2608.31082v2 原论文机制）

值守班次反复读同样的日志、配置与交接材料。本技能把其中「已核实过的主体–关系事实」留成跨班次可查询的结构化记忆，让下一班命中即免重读原始材料。机制全部出自 arXiv:2608.31082v2 原论文（本技能依据即该原文，非替代综述）。它回答三个问题：**记什么**（第一节六元组数据模型）、**怎么查**（第二、三、九节目录先校验后读）、**何时算数**（第十节晋升门槛）。

**落盘（路径公式，不写死盘符）**：账目根 = `<包根>/../../`（包根 = package.json 所在目录，与台账 `ledger/rsi-ledger.jsonl` 同根；开班简报「账目根」行声明值即权威，可覆盖默认）。memory store 默认 `<账目根>/memory/shift-memory.jsonl`，事件式追加写；catalogue 默认同目录 `catalogue.md`。

机检命令（绝对路径调用，值守 agent 的 cwd 不保证在包根）：

```bash
python E:/loop/LoopForge-ops/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py memory <store.jsonl> [--catalogue <catalogue.md>] [--write-catalogue <catalogue.md>]
```

包挪位时与 cordis.patch.yml 同款同步改此路径，或以 check.py --dump-config 查得的本包 skills 路径为前缀拼接。

## 一、数据模型：六元组 + entry_id 引用系（机制①）

每条记忆是论文六元组加台账侧标识符，字段与取值域固定（可被机检）：

| 字段 | JSONL 键名 | 口径 |
|---|---|---|
| 主体 | `s` | 事实主语：服务名/节点名/配置项名（非空字符串） |
| 关系 | `r` | 谓语：uses_tls / pool_max / restart_causes …（非空字符串） |
| 客体 | `o` | κ=singular 时为非空字符串；κ=list 时为非空字符串列表 |
| 基数 | `κ` | `singular` 或 `list`（机检枚举，见第六节） |
| 单位 | `unit` | 可选（如「连接」「ms」），语义字段机检不校验 |
| 证据 | `evidence` | 对象，`来源` 与 `锚点` 两键必需（文件路径 + 时间戳/行号/台账条目号）——下一班可核验，不盲信 |
| 标识符 | `entry_id` | 格式 `mem-####`（四位数字）；add 事件必需，store 内全局唯一（机检查重，重复 exit 3） |

add 事件样例（一行一条，JSONL 追加写）：

```jsonl
{"event": "add", "entry_id": "mem-0007", "s": "db-connector", "r": "restart_causes", "o": ["连接池耗尽", "TLS 握手超时"], "κ": "list", "incomplete": false, "evidence": {"来源": "logs/db.log", "锚点": "2026-11-17 L88-L92"}}
```

**引用系（一个 id 走三个消费点）**：hit / stale / archive / refute / promote 事件的 `target` 填 store 内先前已存在的 entry_id（解析不到即 exit 3）；交接报告「决策」要素引用同款 id（外加台账条目号）；分诊/开班/复盘三个消费点（第九节）读到的都是同一套 id。引用完整性是机检可验证的，不是散文承诺。

## 二、目录 catalogue：单一实现源、生成义务与投影规则（机制②）

catalogue.md 是给人与 agent 查的目录视图，**不是第二数据源**。

- **禁手写**：唯一合法来源是 `check.py memory <store> --write-catalogue <路径>`（单一实现源）。本节投影规则与 check.py 的投影代码同源——改规则必须两处同步改，杜绝双口径。
- **生成义务触发点**：任何 store 事件落盘后**立即**重投影 catalogue——add/hit/stale/archive/refute/promote 写完 store 行，下一个动作就是 --write-catalogue，同一动作序列内完成，不攒到班末。
- **投影规则（定版，与 check.py 同一实现源）**：
  1. 首行为固定来源声明行：`<!-- 本文件由 check.py memory --write-catalogue 从 store 事件流原子重投影生成，禁手写；消费前先跑同命令 --catalogue 校验视图一致 -->`
  2. 其后每个 add 事件一行，按 entry_id 升序排列；
  3. 行格式：`<entry_id> | <s> –<r>→ <o> | <κ> | <incomplete 段> | <状态段>`——κ=singular 时 o 为原字符串、incomplete 段固定 `-`；κ=list 时 o 各项以「、」连接、incomplete 段为 `incomplete:false` 或 `incomplete:true`；状态段无失效事件为 `active`，有则按事件先后以 `/` 连接（stale/archive/refute）；
  4. hit 与 promote 不改目录行——命中计数、晋升档位、used_by/review_by 查事件流，不在视图重复，防双口径。
- **视图一致性校验**：`check.py memory <store> --catalogue <路径>` 从 store 重投影期望内容与现存文件逐行比对，不一致 exit 3——视图与库漂移是机检可抓的失败，不是静默错误。
- **原子性**：--write-catalogue 走同目录临时文件+替换（os.replace），读的一方不会看到半写状态。

## 三、消费侧先校验后读（机制③）

纪律钉死：第九节检索时机三处读目录前的**第一个动作**都是跑 `check.py memory <store> --catalogue <路径>` 校验。校验不一致时：

1. **禁止直接读旧目录**——过期视图比没有视图更危险，它带着自信的过期事实；
2. 先 `check.py memory <store> --write-catalogue <路径>` 重投影；
3. 班末复盘证据轴记一次流程 bug：点**上一班**漏跑生成义务（哪班的事件流落盘后没重投影）——bug 记在漏跑的班，不记在发现的班；
4. 再以新目录续检。

生成侧义务（第二节）+ 消费侧强制校验（本节）闭环：上一班忘重投影时，下一班拿到的是机检拦下的显式失败（exit 3），而非静默过期视图。跳过校验直接读目录，复盘证据轴按「绕过消费侧校验」记流程 bug。

## 四、写入门槛：绑定「当班确实读过」（机制④）

论文纪律：**绝不为提取结构专门打开文档**。落到动作：

- 记忆提取只在处置/巡检**已加载**的材料分支上 fork——为写一条记忆去翻旧日志，是用新开销伪造旧知识；
- 提取放处置路径之外**并行**执行，失败不阻塞当班处置；
- 当班结论只依赖原始材料——记忆命中是省力，不构成证据；证据仍走 loopforge-evidence-gates 的 query–reason–cite，命中条目带 evidence 指针核验后使用。
- 判定法（可独立核对）：写 add 前 trace 本班材料加载清单，该事实的 `evidence.来源` 不在清单内即不合法——要么先有处置需要读它，要么不写。

## 五、有界投机预算：每班默认 40 条（机制⑤）

- 每班提取上限默认 **40 条**（论文 4K token ≈150 对象 ≈12% 开销的值守保守档）；
- 先广后窄：班初提取宽（低门槛多条），班中随事实被复用收窄；超预算的事实更窄、更少复用，不值得为它挤占下一条；
- 超限本身不违规，但必须进班末复盘报告（第八节命中率报告带本班提取数）。

## 六、κ 完整性强口径（机制⑥）

- κ=list 的 add 事件必须显式 `incomplete`∈{true,false}——**缺键即 exit 3**：缺键与显式 false 语义不同，强口径不接受默认值；
- `false` = 声称完整，可当穷举用（「restart_causes 全集就这两条」可据此排除第三因）；
- `true` = 不完整，不得当穷举用（只是已知子集）；
- κ=singular 不适用此键（单值无 partial 状态）；
- 消费侧动作：读到 incomplete:true 的 list 做根因排除前，先补一次原始材料核验——排除推理只能建立在 incomplete:false 或新鲜证据上。

## 七、遗忘与压缩：stale / archive / refute，永不物理删（机制⑦）

| 触发 | 动作 | 目录效果 |
|---|---|---|
| 源指纹失效：条目登记的源指纹（`来源` 路径+内容哈希前 12 位，推荐键 `src_fp`，语义字段）对不上——文件改了或挪了 | 追加 stale 事件（不物理删） | 状态段加 stale 标记 |
| 同 subject-relation（s+r 同键）重复观测 | 取最新为当前值，历史计数查事件流 | 目录行只剩最新 entry |
| 连续 5 班零命中 | 追加 archive 事件 | 退出目录首屏（状态段标 archive；恢复命中即解除） |
| 条目被证伪 | 追加 refute 事件（推荐带 evidence 指明证伪依据） | 状态段标 refute，**永不删除**——防再提案 |

判定法（可独立核对）：班末扫一遍本班未触碰的 active 条目，命中计数+1；连续 5 班计数为 0 即 archive。stale 不等于 refute——源文件变了只说明需要重核（stale），证实说错了才 refute。

## 八、命中率分布评估 p10/p50/p90（机制⑧）

- 每班记三个数：**目录查询数**（分诊/开班/复盘三处结构化读取次数）、**结构化命中数**（目录行+evidence 指针核验后直接使用，免读原始材料）、**回退数**（未命中回退原始材料）；
- 复盘按 p10/p50/p90 口径报告（按班次序列取三档分位），并对不命中班次承认额外开销——论文实测中位省 3.4× 但 p90 反贵 1.24×：记忆不是稳赚，贵尾班的提取预算下一班收紧；
- 回退数/查询数连续两班高于 0.8 时，该班提取门槛上调（先广后窄的「窄」提前）。

## 九、检索时机三处：分诊 / 开班 / 复盘（机制⑨）

三处均与 loopforge-shift-protocol 的动作显式挂钩，且读目录前的第一个动作一律是：**先跑 `check.py memory <store> --catalogue <路径>` 校验；校验不一致先 `--write-catalogue` 重投影并记流程 bug（班末复盘证据轴，点上一班漏跑生成义务）再读**——即第三节的先校验后读纪律，对三处无一例外。

| 时机 | 挂钩 shift-protocol 动作 | 校验通过后查什么 | 查完接什么动作 |
|---|---|---|---|
| 分诊 | 「处置派发 → 派发前合并：去重键、语义分组、每班上限」之前 | 去重键（服务,指标,语义标签）是否已知、根因假设是否命中已知 restart_causes/known_symptoms、受影响面 | 再进 shift-protocol 的合并与 SEV 定级；命中即免重读原始日志（evidence 指针核验后使用），未命中回退原始材料 |
| 开班 | 「开班简报 → 承接」段 | 上一班未决相关的记忆条目 + 交接报告三要素 | 目录式读上一班记忆与交接报告，承接未决逐条标「接手」或「挂起+理由」 |
| 复盘 | 「班次复盘」三轴开始前、交接报告班末复盘四问第四问（改进轨） | refute 条目与历史尝试——本班想提的改进/根因是否已被证伪或试过 | 防重复提案；改进分流仍走 rsi-ledger 保留门/文档类人审双轨 |

三处的目录消费一律走第三节的先校验后读——这是纪律不是建议。

## 十、晋升门槛：draft→staged→retained，衔接 rsi-ledger 保留门（机制⑩）

三档生命周期（硬性要求三：入库门槛高于班内随手记）：

| 档 | 形态 | 进目录 | 失效 |
|---|---|---|---|
| draft 班内草稿 | 处置分支上的随手记，不落 store | 否 | 随班失效 |
| staged 试用期 | add 事件落 store | 是 | 被 hit 计数；连续 5 班零命中 archive（第七节） |
| retained 保留 | promote 事件晋升 | 是（状态段不变，档位查事件流） | 只能被 refute/stale 打回，不因时间自动失效 |

**promote 机检门槛（与 loopforge-rsi-ledger 保留门同一套 v_level 层级排序：V2 机检/形式验证 > V1 执行反馈 > V0 学习型裁判 > Vi 内在信号，字面排序不改）**：

- `v_level`∈{V1,V2} 才能晋升；**V0（裁判签发）与 Vi（置信/自一致等内在自评）取值机检直接拒绝（exit 3）**；
- V1 = 执行反馈签发：被下一班实际使用——`used_by` 指向使用班次（使用=该班检索命中且影响了动作）；
- V2 = 机检签发：check.py 类确定性判定背书；
- 复盘人审通道：`review_by` 非空亦为合法依据；
- 依据必需：used_by 或 review_by 至少其一非空，缺即 exit 3。

记忆条目按过程级改进记资本支出账（可摊销）——随手记永远只是 draft，晋升要外部位阶更高的签发，不靠自评。

## 十一、与交接报告 / 台账的分工边界（机制⑪）

三个载体各管一层，**先按内容形状分流再落盘**：

| 载体 | 管 | 形态 | 生命周期 |
|---|---|---|---|
| 交接报告 shifts/&lt;日期&gt;-&lt;班次&gt;-handover.md | 班次级行政快照：未决/风险/决策三要素 | 人读散文，每班全量重写 | 随班归档 |
| 记忆库 memory/shift-memory.jsonl | 事实级结构化存储：主体–关系边+entry_id | agent 查询，事件流追加 | 跨班累积，可失效可归档，永不物理删 |
| 台账 ledger/rsi-ledger.jsonl | 决策与改进审计流：预测-行动-观测-改进+override | 只追加不删改 | 永久审计 |

**三层判断规则（按序问，第一个命中的就是落点）**：

1. 是不是「本班在途的行政状态」——未决事件、临时关闭项、风险趋势、当班假设？→ **交接报告**；
2. 是不是「跨班次仍真的可复用事实」——系统/环境的主体–关系知识？→ **记忆库**；
3. 是不是「决策与改进本身」——预测、观测、门判定、人否决 AI 提议？→ **台账**。

**引用系不复制正文**：交接报告「决策」要素引用台账条目号与记忆 entry_id（mem-####）；台账条目引用记忆时同款 entry_id——三个载体经同一套机检可验证的 id 互联，读者顺着 id 永远能拿到正文与 evidence 指针。

## 配套技能

- **loopforge-shift-protocol**：检索时机三处的宿主动作（派发前合并/开班承接/复盘三轴）与交接报告三要素。
- **loopforge-evidence-gates**：check.py memory 机检宿主；命中条目的 evidence 指针核验走 query–reason–cite。
- **loopforge-rsi-ledger**：v_level 层级排序共用（V2>V1>V0>Vi），晋升门槛与保留门同一套规则；台账侧 entry_id 引用对端。
