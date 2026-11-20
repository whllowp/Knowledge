# dsh-loopforge-ops 内网离线安装说明

本目录是 `dsh-loopforge-ops@0.2.0` 的内网离线分发包，由 `tools/pack-intranet.mjs` 生成：
源插件目录已复制到 `dsh-loopforge-ops/`，包内 cordis.patch.yml 与各 .md/.py 中指向源位置的绝对路径
已改写为打包机副本路径 `E:/loop/LoopForge-ops/dist/dsh-loopforge-ops`。

## 目录构成

- `dsh-loopforge-ops/` — 插件副本（结构校验与 check.py --selftest 已在打包机通过）
- `SHA256SUMS.txt` — 完整性清单（含副本全部文件与本说明）
- `INSTALL-INTRANET.md` — 本文件

## 离线安装步骤

以下 `<DEST>` 一律替换为本目录在内网机上的绝对路径（正斜杠，如 `D:/dsh-pkgs/dist`）。

1. 整目录拷贝：把本目录（含上述三项）原样拷到内网机任意位置。
2. 完整性校验：`cd <DEST> && sha256sum -c SHA256SUMS.txt`（Windows 原生无 sha256sum 时，
   用 `certutil -hashfile <文件> SHA256` 逐项对照清单）。
3. 路径对齐：内网机落位路径若与打包机路径（E:/loop/LoopForge-ops/dist）不同，把 `dsh-loopforge-ops/cordis.patch.yml`
   中 customSkillDirs 的路径前缀，以及各 .md/.py 中出现的同一前缀（E:/loop/LoopForge-ops/dist/dsh-loopforge-ops），整体替换为
   `<DEST>/dsh-loopforge-ops`（一律正斜杠——YAML 内反斜杠双引号路径是转义序列）。
4. 安装（link:，不复制文件）：`dsh plugin --profile <PROFILE> add link:<DEST>/dsh-loopforge-ops`
5. 装载检查：`dsh --profile <PROFILE> --dump-config`，确认三点：
   ① skill-filesystem 条目的 customSkillDirs 出现 `<DEST>/dsh-loopforge-ops/skills`；
   ② stderr 无 `skipping profile bundle "dsh-loopforge-ops"`（出现即束没挂上，回第 4 步查 link 路径）；
   ③ 下方验收命令的技能冒烟能列出全部 loopforge-ops-* 技能名。

## 验收命令（任一条不过即安装失败，按输出排查）

```
# 1) 结构校验（需内网机有本仓库 tools/ 目录；没有则以 2)~4) 为准）
node tools/check-dsh-plugin.mjs <DEST>/dsh-loopforge-ops

# 2) 机检器自检（打包机实测解释器: python；内网机用任意 Python 3 均可）
python <DEST>/dsh-loopforge-ops/skills/loopforge-evidence-gates/check.py --selftest

# 3) 完整性
cd <DEST> && sha256sum -c SHA256SUMS.txt

# 4) 技能冒烟（--patch 形式：不安装、不动 profile 文件，内存叠加）
DEEPSEEK_API_KEY="$DEEPSEEK_AUTH_TOKEN" dsh --profile headless --patch <DEST>/dsh-loopforge-ops/cordis.patch.yml "先列出本会话可发现的全部 loopforge-ops-* 技能名"
```

预期：1) 输出 PASS（退出码 0）；2) 输出 `selftest ok`（退出码 0）；3) 每行 OK；
4) 回答列出五个 loopforge-* 技能名。认证错误（invalid API key / 401）是
`DEEPSEEK_AUTH_TOKEN` 没拿到值，不是装载失败，两种病别混。

## 注意

- 与其他改 skill-filesystem 的束同装时，customSkillDirs 是整体替换不深合并，须在用户层
  patch 写全两条路径（详见包内 README「与 dsh-meta-harness 共存」节）。
- 包挪位置后，cordis.patch.yml 与 .md/.py 中的绝对路径必须同步改（即第 3 步），否则技能
  发现静默失效。
