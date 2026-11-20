# dsh-loopforge-ops

LoopForge 值守规则的纯内容 dsh 束：无 JS 运行时、零构建（工具链仅一个内网打包脚本）。把开发段（dark-factory 先例工程）的七阶段流程与五条契约（零提问、证据或没发生、fail-closed、单包单工、报告即交付）贴接成 7×24 值守流程，内容另取材动态工作流方法论、RSI-Anything（arXiv:2610.13912v1）、值守记忆工程（arXiv:2608.31082v2）与公开值守实践，以技能（SKILL.md）形式供 agent 按需加载。

## 构成（六个技能）

- `skills/loopforge-ops-architecture/` — 值守总图：七阶段、五契约、三道门禁到值守场景的完整映射表，渐进信任三阶段与技能路由；任何值守工作先读它建立全局。
- `skills/loopforge-shift-protocol/` — 班次协议：开班简报（账目根、范围/预算/升级路径、未知→假设、Non-goals）、巡检切片、处置派发（SEV 分层路由、指针派发、单事件单包单尝试）、交接报告三要素、班次复盘。
- `skills/loopforge-evidence-gates/` — 证据门禁与最小机检器：query–reason–cite、证据分级 E0–E3、SEV1–4 机检判据、假通过拒绝、豁免书面化；本包唯一机检器 `check.py` 的宿主技能。
- `skills/loopforge-rsi-ledger/` — RSI 台账：预测-行动-观测-改进四步循环、三重保留门（g_policy/g_world/g_pair）与按签发位阶排序的保留档位（V2 机检可自动保留、V1 执行反馈须附 caveat、V0 学习型裁判降级暂存）、coupling/axes 两轴登记、Verify/Explore/Write 分账；只有过保留门的改进才沉淀进台账。
- `skills/loopforge-orchestration/` — 7×24 编排：确定性门控优先、并行子代理扇出与 runbook 互斥、对抗收敛三角色、断点恢复、计划外置、成本护栏、人工闸门位置。
- `skills/loopforge-shift-memory/` — 值守记忆：六元组事实库（主体–关系–客体+evidence 指针），目录（catalogue）由 store 事件流重投影生成、检索前先校验目录与库一致，班内草稿→staged 试用期→跨班次保留的晋升门槛（V0 不得晋升）；`check.py memory` 子命令机检。
- `prompts/` — 对应系统提示片段。注意：dsh 框架没有发现包内 prompts/ 的机制，这里仅作内容存放，供宿主代码或人工引用。
- `cordis.patch.yml` — 本束唯一 patch：把 `skills/` 注册进 skill-filesystem 的 `customSkillDirs`。
- `tools/pack-intranet.mjs` — 内网离线打包器（仅 Node 内置模块）：九步流水产出可离线验收的完整包——副本结构校验、源路径改写、PACK-ROOT.txt 打包根记录、dest 外盘符绝对路径零残留检查、`check.py --selftest`、SHA256SUMS.txt、INTRANET-INSTALL.md；内网落位用副本内脚本二次打包（PACK-ROOT 自动接管上一代路径改写）。
- 内网打包产物不进本包：产物含指向打包机的绝对路径（`PACK-ROOT.txt`、改写后的 `cordis.patch.yml` 等 `.txt`/`.yml` 文件），嵌在源包内会被上层离线打包的残留扫描判失败，因此输出目录必须在本包之外（施工实跑用仓库级 `../dist/intranet/`，即 `LoopForge-ops/dist/intranet/`：含 PACK-ROOT.txt 的插件副本、SHA256SUMS.txt、INTRANET-INSTALL.md 三件），由 `tools/pack-intranet.mjs` 开发机实跑产出，用法与验收判据见内网打包章节；打包器步① 机检拒绝 dest 落在 src 之内。

## 安装（link:，路径用正斜杠）

```
dsh plugin --profile <PROFILE> add link:E:/loop/LoopForge-ops/dist/dsh-loopforge-ops
```

## 装载检查

```
dsh --profile <PROFILE> --dump-config
```

同时确认三点：

1. 组合树 skill-filesystem 条目的 `customSkillDirs` 出现 `E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills`；
2. stderr 无 `skipping profile bundle "dsh-loopforge-ops"`（出现即束没挂上，先回安装命令查 link 路径）；
3. 技能发现冒烟（下节命令）：提示词点名 `loopforge`，六个 `loopforge-*` 技能名全部可被发现，且 stderr 无因技能目录内 `check.py` 产生的扫描告警。

## 冒烟（--patch 形式：不安装、不动任何 profile 文件，内存叠加）

```
DEEPSEEK_API_KEY="$DEEPSEEK_AUTH_TOKEN" dsh --profile headless --patch E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/cordis.patch.yml "<提示词>"
```

故障长相：环境变量缺失时报的是认证错误（invalid API key / 401 一类），技能发现本身仍正常——这是 `DEEPSEEK_API_KEY` 没拿到值，不是装载失败。排查顺序：先查 `DEEPSEEK_AUTH_TOKEN` 在不在环境里，再查 patch 路径。装载失败的样子是技能名不出现、dump-config 无路径，与认证错误是两种病，别混。

## 试用（trialPrompt）

提示词全文：

> 先列出本会话可发现的全部 loopforge-* 技能名；再答三问：一、按 loopforge-rsi-ledger，一条由学习型裁判（E1 证据）签发、三门全 pass 的候选改进，台账条目怎么落、保留档位是什么、缺什么才能晋升为正式保留；二、按 loopforge-shift-memory，接班分诊一条数据库连接告警时你先查什么、命中与未命中各做什么、一条事实从班内草稿到跨班次保留的门槛是什么；三、给出用 tools/pack-intranet.mjs 产出内网包的命令行与全部验收判据。

**预期结果**：①先列出六个技能名——loopforge-ops-architecture、loopforge-shift-protocol、loopforge-evidence-gates、loopforge-rsi-ledger、loopforge-orchestration、loopforge-shift-memory（少任何一个即装载未生效，回装载检查三点排查：patch 叠加、路径、包挪位）；②第一问答 kind=revision、三门 g_policy/g_world/g_pair=pass、baseline 在位、v_level=V0、coupling 与 axes 两轴齐全，且因 V0 必须带 staged:true 降级暂存——学习型裁判单独签发不得默认保留，晋升缺一次外部位阶更高的复核（V2 机检或 V1 执行反馈签发的新条目，或人审 human_gate），并答出 Vi 内在信号（置信/自一致）签发的门结果机检直接拒绝；③第二问答先用 check.py memory --catalogue 校验目录与库一致（不一致先 --write-catalogue 重投影并记流程 bug，不直接读旧目录），再查记忆目录 catalogue（主体–关系结构化读，带 evidence 指针核验后使用），命中即免重读原始日志、未命中回退原始材料并在已加载分支上顺手触发一次有界预算的新提取（不为写记忆专门翻旧档），并答出写入门槛=班内草稿随班失效、staged 试用期记命中、晋升保留须 v_level≥V1（被下一班实际使用=执行反馈）或复盘人审、被证伪标 refute 防再提案；③第三问答 node tools/pack-intranet.mjs --src <插件目录> --dest <输出目录>，验收判据=退出码 0 且九步全过：副本结构校验 PASS（包名/技能 frontmatter/prompts 非空/无占位标记）、spawn check.py --selftest 输出 selftest ok、改写后副本内无指向 dest 之外的盘符绝对路径残留（URL scheme 除外）、PACK-ROOT.txt 记录本次 dest 副本路径、SHA256SUMS.txt 生成且行数与副本文件数一致、INTRANET-INSTALL.md 生成，任一步失败 exit 1；内网落位用副本内脚本二次打包（PACK-ROOT 自动接管上一代路径改写）完成离线验收。

**未生效判据**：技能名不全——customSkillDirs 未生效（patch 没叠加/路径写错/包挪位没改 patch）；六名齐但三问答缺字段细节（含目录先校验后读）——技能文件在但没被读，检查提示词是否点名技能名；报认证错误——DEEPSEEK_API_KEY 没拿到值，与装载失败是两种病。

## 与 dsh-meta-harness 共存

patch 的 `config` 是整体替换不深合并：后装束的 `customSkillDirs` 会整体替换先装束的。实测（headless profile，已装 dsh-meta-harness）：基线组合树含 4 个 meta-harness 技能路径；叠加本包单路径 patch 后 meta-harness 路径归零、无任何告警。两束要同装，必须在用户层 override 写全两条路径——编辑该 profile 的 `cordis.patch.yml`（用户 patch 层，作用于所有束层之后），`<COEXIST-SKILLS-DIR>` 换成共存束的 skills 目录绝对路径（本机即 dsh-meta-harness 安装根下的 `skills`）：

```yaml
- id: skill-filesystem
  config:
    customSkillDirs:
      - <COEXIST-SKILLS-DIR>
      - E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills
```

共存验收：两束都装后跑冒烟，断言 `meta-harness-*` 四技能与 `loopforge-*` 六技能两套技能名同场；`loopforge-*` 六个里少一个（尤其 `loopforge-shift-memory`）就是先装束被抹或共存片段抄漏，按上面片段手工合并后再验。

## 相关项目

dynamic-workflows-rsi——ZCode 动态工作流插件（.zcode-plugin/plugin.json 格式）的兄弟插件，宿主仓库目录 DSH-workflow-rsi-plugin（其 plugins/ 下），保留门重放基底的先例工程；本包与其各自独立、不合并。

## 内网部署（离线打包与两步自举）

内网机没有外网时，用 `tools/pack-intranet.mjs`（仅 Node 内置模块，无 npm 依赖）在开发机产出可离线验收的完整包。

### 打包命令（开发机）

```
node tools/pack-intranet.mjs --src <插件目录绝对路径> --dest <输出目录绝对路径>
```

`--src` 指向本包根（含 package.json 的目录），`--dest` 指向一个不存在或为空的输出目录，且必须位于本包之外（施工实跑用仓库级 `../dist/intranet`；步① 机检拒绝 dest 落在 src 之内——产物含指向打包机的绝对路径，嵌回源包会让上层离线打包的残留扫描失败）。产出三件：`<dest>/dsh-loopforge-ops/`（插件副本，根含 `PACK-ROOT.txt`）、`<dest>/SHA256SUMS.txt`、`<dest>/INTRANET-INSTALL.md`。

### 九步流水与验收判据（退出码 0 = 全链通过）

任一步失败即 stderr 报步骤与原因并 exit 1：

1. 源校验：package.json 可解析、version 非空；src 根有 `PACK-ROOT.txt` 时读取上一代打包根；dest 与 src 不得相互嵌套（dest 落在源包内会让产物自指绝对路径回流源包）；
2. 复制：排除任意层级 `dist/`、`.git`、`node_modules` 与源根 `PACK-ROOT.txt`；
3. 路径改写：改写集合 = src 绝对路径正/反斜杠两形态 + 上一代打包根两形态，全部替换为本次 dest 副本绝对路径（正斜杠）；
4. 残留检查（零容忍）：副本内全部文本文件扫盘符绝对路径，URL scheme 与文献编号形态由负向后行断言排除；命中路径不以本次 dest 副本路径开头即 exit 1；
5. 结构校验：内嵌包外验收脚本四规则（name=目录名、version/description/dsh.bundle.patch 指向存在、SKILL.md frontmatter 与 description 长度、prompts 非空、无占位标记）；
6. spawn 副本 `skills/loopforge-evidence-gates/check.py --selftest`，要求输出 `selftest ok`；
7. 生成 `SHA256SUMS.txt`（含 PACK-ROOT.txt，行数=副本常规文件数，sha256sum -c 兼容）；
8. 生成 `INTRANET-INSTALL.md`（安装命令/装载检查三点/冒烟/机检器路径/共存片段/两步自举/待人工确认清单）；
9. 打印九步概要，exit 0。

验收判据清单（两轮打包同口径）：退出码 0；副本根 `PACK-ROOT.txt` 内容=本次 dest 副本绝对路径；`wc -l <dest>/SHA256SUMS.txt` 等于副本文件数；`cd <dest> && sha256sum -c SHA256SUMS.txt` 全行 OK；副本内 `grep -rP '(?<![A-Za-z0-9])[A-Za-z]:[\\/]'` 的命中路径全部以本次 dest 副本路径开头（含 PACK-ROOT.txt 自身）；`python <副本>/skills/loopforge-evidence-gates/check.py --selftest` 手工复跑输出 `selftest ok`。

### PACK-ROOT 机理与两步自举法

- 机理：每次打包在副本根写 `PACK-ROOT.txt`，内容=本次 dest 副本绝对路径，即「上一代打包根」。下次以该副本为 src 二次打包时，步③改写集合自动纳入上一代根两形态——run#1 写进副本的开发机路径全部被改写为内网最终路径，代际改写不死锁。源包开发机安装走 `link:` 需真实路径，因此不用占位令牌：记录上一代根使每一代副本始终自洽可用。
- 两步法：①把打包输出目录（仓库级 `../dist/intranet/`）三件整体拷至内网机临时位置 T；②跑 `node T/dsh-loopforge-ops/tools/pack-intranet.mjs --src T/dsh-loopforge-ops --dest <最终落位输出目录>`——上一代根被步③接管，二次打包即最终落位兼离线验收（结构校验/selftest/残留检查/SHA256 全套重跑）；③安装命令指向最终落位副本（见 INTRANET-INSTALL.md）。
- **落位必须经 pack，不许裸拷贝后直接用**：副本内 cordis.patch.yml、SKILL.md、prompts 写的是打包机绝对路径，裸拷贝后这些路径指向不存在的位置，技能发现静默失效且无告警；只有经 pack 改写（或两步自举）落位的副本才自洽可用。

### 内网限制三项

1. dsh 本体与其依赖需内网可达的 npm registry，或先行离线搬运；
2. 冒烟需 `DEEPSEEK_API_KEY` 与模型端点可达——认证失败（invalid API key / 401）与装载失败是两种病，先查 `DEEPSEEK_AUTH_TOKEN` 再查 patch 路径；
3. 技能内引用的文献（含 arXiv 编号）离线不可在线复核，依据行已保留文献名与编号，供有外网时人工核对。

## check.py 的强制力边界与调用

- 本包是纪律束加三项机检（`check.py` 的 evidence/ledger/memory 子命令），其余门禁是约定不强制：靠 SKILL.md 的动作与出口条件约束，没有代码拦你。`memory` 子命令校验值守记忆事件流（entry_id 唯一、六元组与 evidence 两键齐全、hit/stale/archive/refute/promote 的 target 引用完整、promote 须 v_level∈{V1,V2} 附 used_by 或 review_by）与目录视图一致性（`--catalogue` 校验现存目录与事件流重投影逐行一致，不一致 exit 3；`--write-catalogue` 重投影生成）。
- 证明力点名：`check.py evidence` 只证证据文件内部一致性（三段式可解析、检查项标记可数、零检查项判假通过），不证命令实际执行过——手写一份格式正确的三段式文件同样能过机检。执行保证 = 纪律 + 复盘证据轴抽查重跑；要硬保证必须外挂编排者角色重跑——先例是 dark-factory：编排者以独立 subprocess 执行命令并自己写 evidence，dark-factory 先例工程 SKILL.md:99（包外，不随包分发）明令 `Never mark done from a worker's self-report alone`。
- 调用必须用绝对路径（相对路径按进程 cwd resolve，值守 agent 的 cwd 不可靠）：

```
python E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py evidence <证据文件>
python E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py ledger <台账文件>
python E:/loop/LoopForge-ops/dist/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py memory <记忆库.jsonl> --catalogue <目录.md>
```

包挪位置时，这里的绝对路径与 `cordis.patch.yml` 同款同步改；或者以 `dsh --profile <PROFILE> --dump-config` 查得的 skills 路径为前缀拼接 `loopforge-evidence-gates/check.py`。机检器自带 `--selftest`（夹具含台账 revision 收紧与 memory 事件流；判据以实跑输出为准——末行 `selftest: N/N 项断言通过` 且 `selftest ok`、退出码 0，项数随夹具增减不写死在本 README）与 `--dump-config`（打印自身绝对路径与默认配置，供拼接）。

## 注意

- `customSkillDirs` 的路径按进程 cwd resolve，本 patch 写的是绝对路径——包挪位置必须同步改 `cordis.patch.yml`（YAML 内路径一律正斜杠）。
- 本包无 insert 条目（纯内容包，insert 会要求加载 JS 模块），因此不出现在插件管理器 UI；以 `--dump-config` 与技能冒烟验证装载。
- patch 的 `config` 是整体替换不深合并：本 patch 只写 `customSkillDirs` 是安全的（其余键由 schema 回默认，`includeDefaultRoots` 默认 true 不受影响）；若将来要同时改 skill-filesystem 其他键，须在同一条 config 里写全。
- `prompts/` 不被 dsh 自动发现，仅作内容存放，供宿主代码或人工引用。
