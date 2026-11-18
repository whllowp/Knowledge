# dsh-loopforge-ops

LoopForge 值守规则的纯内容 dsh 束：无 JS 运行时、零依赖、零构建。把开发段（`E:/sdd/dark-factory`）的七阶段流程与五条契约（零提问、证据或没发生、fail-closed、单包单工、报告即交付）贴接成 7×24 值守流程，内容另取材动态工作流方法论、RSI-Anything（arXiv:2610.13912v1）与公开值守实践，以技能（SKILL.md）形式供 agent 按需加载。

## 构成（五个技能）

- `skills/loopforge-ops-architecture/` — 值守总图：七阶段、五契约、三道门禁到值守场景的完整映射表，渐进信任三阶段与技能路由；任何值守工作先读它建立全局。
- `skills/loopforge-shift-protocol/` — 班次协议：开班简报（范围/预算/升级路径、未知→假设、Non-goals）、巡检切片、处置派发（SEV 分层路由、指针派发、单事件单包单尝试）、交接报告三要素、班次复盘。
- `skills/loopforge-evidence-gates/` — 证据门禁与最小机检器：query–reason–cite、证据分级 E0–E3、SEV1–4 机检判据、假通过拒绝、豁免书面化；本包唯一机检器 `check.py` 的宿主技能。
- `skills/loopforge-rsi-ledger/` — RSI 台账：预测-行动-观测-改进四步循环、三重保留门（G_π/G_W/G_pair）、Verify/Explore/Write 分账；只有过保留门的改进才沉淀进台账。
- `skills/loopforge-orchestration/` — 7×24 编排：确定性门控优先、并行子代理扇出与 runbook 互斥、对抗收敛三角色、断点恢复、计划外置、成本护栏、人工闸门位置。
- `prompts/` — 对应系统提示片段。注意：dsh 框架没有发现包内 prompts/ 的机制，这里仅作内容存放，供宿主代码或人工引用。
- `cordis.patch.yml` — 本束唯一 patch：把 `skills/` 注册进 skill-filesystem 的 `customSkillDirs`。

## 安装（link:，路径用正斜杠）

```
dsh plugin --profile <PROFILE> add link:E:/loop/LoopForge-ops/dsh-loopforge-ops
```

## 装载检查

```
dsh --profile <PROFILE> --dump-config
```

同时确认三点：

1. 组合树 skill-filesystem 条目的 `customSkillDirs` 出现 `E:/loop/LoopForge-ops/dsh-loopforge-ops/skills`；
2. stderr 无 `skipping profile bundle "dsh-loopforge-ops"`（出现即束没挂上，先回安装命令查 link 路径）；
3. 技能发现冒烟（下节命令）：提示词点名 `loopforge`，五个 `loopforge-*` 技能名全部可被发现，且 stderr 无因技能目录内 `check.py` 产生的扫描告警。

## 冒烟（--patch 形式：不安装、不动任何 profile 文件，内存叠加）

```
DEEPSEEK_API_KEY="$DEEPSEEK_AUTH_TOKEN" dsh --profile headless --patch E:/loop/LoopForge-ops/dsh-loopforge-ops/cordis.patch.yml "<提示词>"
```

故障长相：环境变量缺失时报的是认证错误（invalid API key / 401 一类），技能发现本身仍正常——这是 `DEEPSEEK_API_KEY` 没拿到值，不是装载失败。排查顺序：先查 `DEEPSEEK_AUTH_TOKEN` 在不在环境里，再查 patch 路径。装载失败的样子是技能名不出现、dump-config 无路径，与认证错误是两种病，别混。

## 试用（trialPrompt）

提示词全文：

> 先列出本会话可发现的全部 loopforge-* 技能名，再按 loopforge-ops-architecture 为当前班次写一份开班简报：看护对象自定三项，范围/预算/升级路径三要素与未知→假设清单齐全。

**预期行为**：回答先列出五个技能名——loopforge-ops-architecture、loopforge-shift-protocol、loopforge-evidence-gates、loopforge-rsi-ledger、loopforge-orchestration；随后给出开班简报，范围逐项指名并带 Non-goals、预算写并行处置上限/单事件尝试上限（默认 3）/SEV1 升级路径与联系人、未知逐条写「未知 -> 假设: 最小可逆默认」。

**未生效判据**：五个技能名只出现部分或全不出现——`customSkillDirs` 未生效，回装载检查三点排查（patch 没叠加、路径写错、包挪位没改 patch）；列出了技能名但简报没有三要素——技能文件在但没被读，检查提示词是否点名技能名；报认证错误——按上节「故障长相」先查 `DEEPSEEK_AUTH_TOKEN`。

## 与 dsh-meta-harness 共存

patch 的 `config` 是整体替换不深合并：后装束的 `customSkillDirs` 会整体替换先装束的。实测（headless profile，已装 dsh-meta-harness）：基线组合树含 4 个 meta-harness 技能路径；叠加本包单路径 patch 后 meta-harness 路径归零、无任何告警。两束要同装，必须在用户层 override 写全两条路径——编辑该 profile 的 `cordis.patch.yml`（用户 patch 层，作用于所有束层之后）：

```yaml
- id: skill-filesystem
  config:
    customSkillDirs:
      - E:/meta-harness/dsh-meta-harness/skills
      - E:/loop/LoopForge-ops/dsh-loopforge-ops/skills
```

共存验收：两束都装后跑冒烟，断言 `meta-harness-*` 四技能与 `loopforge-*` 五技能两套技能名同场；缺一套就是先装束被抹，按上面片段手工合并后再验。

## check.py 的强制力边界与调用

- 本包是纪律束加两项机检（`check.py` 的 evidence/ledger 子命令），其余门禁是约定不强制：靠 SKILL.md 的动作与出口条件约束，没有代码拦你。
- 证明力点名：`check.py evidence` 只证证据文件内部一致性（三段式可解析、检查项标记可数、零检查项判假通过），不证命令实际执行过——手写一份格式正确的三段式文件同样能过机检。执行保证 = 纪律 + 复盘证据轴抽查重跑；要硬保证必须外挂编排者角色重跑——先例是 dark-factory：编排者以独立 subprocess 执行命令并自己写 evidence，`E:/sdd/dark-factory/SKILL.md:99` 明令 `Never mark done from a worker's self-report alone`。
- 调用必须用绝对路径（相对路径按进程 cwd resolve，值守 agent 的 cwd 不可靠）：

```
python E:/loop/LoopForge-ops/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py evidence <证据文件>
python E:/loop/LoopForge-ops/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py ledger <台账文件>
```

包挪位置时，这里的绝对路径与 `cordis.patch.yml` 同款同步改；或者以 `dsh --profile <PROFILE> --dump-config` 查得的 skills 路径为前缀拼接 `loopforge-evidence-gates/check.py`。机检器自带 `--selftest`（18 项夹具断言，全过输出 `selftest ok`）与 `--dump-config`（打印自身绝对路径与默认配置，供拼接）。`check.py` 的 fallback 位置为包根 `scripts/`。

## 注意

- `customSkillDirs` 的路径按进程 cwd resolve，本 patch 写的是绝对路径——包挪位置必须同步改 `cordis.patch.yml`（YAML 内路径一律正斜杠）。
- 本包无 insert 条目（纯内容包，insert 会要求加载 JS 模块），因此不出现在插件管理器 UI；以 `--dump-config` 与技能冒烟验证装载。
- patch 的 `config` 是整体替换不深合并：本 patch 只写 `customSkillDirs` 是安全的（其余键由 schema 回默认，`includeDefaultRoots` 默认 true 不受影响）；若将来要同时改 skill-filesystem 其他键，须在同一条 config 里写全。
- `prompts/` 不被 dsh 自动发现，仅作内容存放，供宿主代码或人工引用。
