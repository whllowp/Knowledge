# SDD：规格驱动的交付流程

这是一个给编码代理用的**交付方法 + 可安装 skill**。它把两套工作流合并成一条流水线：

- **交付骨架**来自可组合的工程技能：spec（规格）、tracer-bullet 票据与阻塞边、任务图前沿、约定接缝上的 TDD、三轴评审、全新上下文的子代理。
- **诚实骨架**来自一套操作型知识系统：证据台账、先查后问、先测量后修复、破坏性操作闸门、有类型的失败处理、带来源的决策记录。

一句话概括：**每个闸门都必须同时交出一个产物和一份证明；"完成"永远意味着"跑过命令并记录了输出"。**

完整流程说明见 **[PROCESS.md](./PROCESS.md)**。给模型加载的契约是 **[SKILL.md](./SKILL.md)**，各闸门的操作手册在 `references/`，可复制的模板在 `assets/`，把流程自动化的脚本在 `scripts/`。v2 的 10 次迭代与前后度量在 **[ITERATIONS.md](../ITERATIONS.md)**（仓库根）。

## 目录

```
SKILL.md              模型加载的入口契约（99 行，路由表 + 不变量）
PROCESS.md            人类阅读的完整流程说明（中文，含 v2 脚本化章节）
README.md             本文件
references/           每个闸门 / 横切主题的操作手册
  charter.md          融合来源、规则冲突时的优先级、非谈判项
  frame.md            G0 立项
  specify.md          G1 规格
  decompose.md        G2 拆票与任务图
  build.md            G3 构建与证据
  verify.md           G4 三轴评审
  ship-learn.md       G5 发布与复盘
  evidence.md         证据台账、判别性测试、脱敏、豁免
  knowledge.md        决策记录、术语表、持久记忆
  operations.md       模式、断点续跑、停止规则、失败分类、反模式
  lite.md             lite 模式的六步手册（单票闭环）
assets/               可直接复制的模板
  brief.md spec.md ticket.md lite-ticket.md decision.md map.md
  evidence-ledger.md review.md pr.md retro.md
scripts/sdd.py        可选加速器：脚手架 / 证据运行 / 闸门检查 / 收尾 / 评审 / 提问 / 度量
```

## 安装

DSH 会扫描用户技能目录 `~/.dsh/skills/<name>/SKILL.md`（优先级高于 `~/.agents/skills`），写入后由文件监视器自动发现，无需重启。

```powershell
# 从构建源安装（排除缓存与基准产物）
robocopy E:\sdd\sdd-skill C:\Users\13423\.dsh\skills\sdd /MIR /XD __pycache__ /XF *.pyc /NFL /NDL /NJH /NJS
# 校验：源与安装副本哈希一致、frontmatter 与预算合规
python C:\Users\13423\.dsh\skills\sdd\scripts\sdd.py doctor
```

安装后在新会话里，技能目录会出现 `sdd`；也可以直接 `/sdd` 触发。

其他宿主（Claude Code / Codex）只需把 `sdd/` 目录放进它们各自的 skills 目录，格式兼容（`name` + `description` 的 YAML frontmatter）。

## 30 秒上手（v2，lite 闭环 6 次调用）

```powershell
# 1 生成骨架（lite：一张票 + 台账 + .gitignore）
python scripts/sdd.py init --slug initials --name "initials()" --mode lite
# 2 填票内 Spec（Problem / Solution / Decisions / Seam / Out of scope / 验收项）
# 3 写会失败的测试
python scripts/sdd.py run --slug initials --ticket 01 --criterion "red: 3 tests fail" --label red -- python -m unittest discover -s tests -q
# 4 写实现
# 5 一键收尾：最终证明 + 置 done + verdict/retro + 提交 + 逐闸门复检
python scripts/sdd.py finish --slug initials --ticket 01 --message "feat: initials" --verdict ship --retro "<一行>" -- python -m unittest discover -s tests -q
```

`standard` 模式同理：`init --mode standard --tickets "a;b"`，`check --slug <slug>` 逐闸门自检，`next` 打印前沿，`review --fixed-point <ref>` 生成三轴评审 prompt。

## 什么时候不该用

单行修改、纯提问、已有更专门技能覆盖的杂务。边界情况用 `lite` 模式（一张票 + 台账）。为低风险的事走六个闸门是纯成本。

## 维护

- 规则不是越多越好。每次复盘只提一条改动，写明它修复的具体摩擦；一个月内从未触发的规则应当删除。
- 改了 `SKILL.md` / `references/` / `assets/` 后跑 `sdd.py doctor`（frontmatter、预算、哈希漂移）和 `sdd.py bench`（上下文成本）。
- 版本号写在 `SKILL.md` 的 `metadata.version`；v2.0.0 起流程由 `scripts/sdd.py` 承载。
