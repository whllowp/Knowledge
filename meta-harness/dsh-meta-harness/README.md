# dsh-meta-harness

meta-harness 架构规则的纯内容 dsh 束：无 JS 运行时、零依赖、零构建。内容取材 `E:/meta-harness/ARCHITECTURE.md`，以技能（SKILL.md）形式供 agent 按需加载。2026-11-17 起按该文档附D（D1–D10，Harness²：arXiv:2610.14224v1）同步了任务内 Propose–Probe–Compose 在线改进环、8 组件挂载点、递归预算 k、防呆第 5/6 条与探测执行安全条目。

## 构成

- `skills/meta-harness-architecture/` — 架构总览（四平面+一数据面、五原则、三速进化、生命周期）。
- `skills/meta-harness-rsi-ledger/` — RSI Tax 分类账协议（Verify/Explore/Write、在线无真值模式记账口径、后续使用追踪、前置防呆七条）。
- `skills/meta-harness-srn-notes/` — SRN 有界笔记协议与重型管线晋级/降级规则。
- `skills/meta-harness-permission-budget/` — 五层纵深防御与五级预算模型。
- `prompts/` — 对应系统提示片段。注意：dsh 框架没有发现包内 prompts/ 的机制，这里仅作内容存放，供宿主代码或人工引用。
- `cordis.patch.yml` — 本束唯一 patch：把 `skills/` 注册进 skill-filesystem 的 `customSkillDirs`。

## 安装（link:，路径用正斜杠）

```
dsh plugin --profile <PROFILE> add link:E:/meta-harness/dsh-meta-harness
```

## 装载检查

```
dsh --profile <PROFILE> --dump-config
```

同时确认两点：组合树 skill-filesystem 条目出现 `E:/meta-harness/dsh-meta-harness/skills`；stderr 无 `skipping profile bundle "dsh-meta-harness"`。

## 冒烟（--patch 形式：不安装、不动任何 profile 文件，内存叠加）

```
DEEPSEEK_API_KEY="$DEEPSEEK_AUTH_TOKEN" dsh --profile headless --patch E:/meta-harness/dsh-meta-harness/cordis.patch.yml "<提示词>"
```

## 注意

- `customSkillDirs` 的路径按进程 cwd resolve，本 patch 写的是绝对路径——包挪位置必须同步改 `cordis.patch.yml`（YAML 内路径一律正斜杠）。
- 本包无 insert 条目（纯内容包，insert 会要求加载 JS 模块），因此不出现在插件管理器 UI；以 `--dump-config` 与技能冒烟验证装载。
- patch 的 `config` 是整体替换不深合并：本 patch 只写 `customSkillDirs` 是安全的（其余键由 schema 回默认，`includeDefaultRoots` 默认 true 不受影响）；若将来要同时改 skill-filesystem 其他键，须在同一条 config 里写全。
