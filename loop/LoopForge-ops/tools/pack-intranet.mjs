#!/usr/bin/env node
/**
 * pack-intranet.mjs — dsh 插件内网离线打包脚本（确定性，仅依赖 Node 内置模块）
 *
 * 用法: node tools/pack-intranet.mjs --src <插件目录> --dest <输出目录>
 *
 * 步骤（任一步失败 → stderr 报「步骤与原因」并 exit 1；全部通过 → stdout 概要，exit 0）:
 *  一、复制插件目录到 dest/<插件目录名> 下。重跑允许覆盖 dest 下的同名旧副本，但仅当其
 *      package.json 的 name 与目录名一致（防止误删无关目录）；否则拒绝。
 *  二、在副本上把 cordis.patch.yml 与所有 .md/.py（递归）里指向源包的绝对路径
 *      （正斜杠与反斜杠两种书写，大小写不敏感——Windows 路径大小写不敏感）改写为
 *      dest 副本的绝对路径。另把 package.json dsh.bundle.patch 指向的文件一并纳入
 *      （与 cordis.patch.yml 去重；现状两者是同一文件）。
 *  三、对副本 spawn 运行本仓库 tools/check-dsh-plugin.mjs 做结构校验，要求退出码 0。
 *      直接复用原脚本本身（规则一处定义），本脚本不复制、不放宽任何校验规则。
 *  四、在副本上 spawn 运行 skills 下各子目录的 check.py --selftest，要求退出码 0。解释器依次
 *      探测 python / py -3 / python3（以 `-I --version` 能出版本号为准），运行用 -I
 *      隔离模式（不读 PYTHONPATH、不把脚本目录注入 sys.path，防环境注入）。
 *  五、生成 dest/SHA256SUMS.txt（副本全部文件 + 安装说明，按相对路径排序，sha256sum -c
 *      兼容格式；清单不含自身）与 dest/INSTALL-INTRANET.md（离线安装步骤 + 验收命令）。
 *  六、扫描副本全部文本文件中的盘符绝对路径（E:/... 或 E:\... 形式）：
 *      凡指向源包位置的路径（即步骤二的改写漏网）→ 失败；指向 dest 副本的路径 → 合法；
 *      指向 dest 之外的其他绝对引用（外部项目出处标注、selftest 夹具样例等）不判失败，
 *      但在概要中逐处列出备查。口径依据：步骤六与步骤二配对——「残留」指本应被改写而
 *      未改干净的路径；外部先例引用（如 E:/sdd/dark-factory/SKILL.md:99）不是改写对象，
 *      也无法自动改写（目标值机器不可知），且对安装与运行无功能影响。
 *
 * 退出码：0=全部通过，1=任一步骤失败，2=用法错误（与 check-dsh-plugin.mjs 约定一致）。
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const PROG = 'pack-intranet';
const STEP1 = '步骤一(复制插件目录)';
const STEP2 = '步骤二(绝对路径改写)';
const STEP3 = '步骤三(结构校验 check-dsh-plugin.mjs)';
const STEP4 = '步骤四(check.py --selftest)';
const STEP5 = '步骤五(SHA256 清单与内网安装说明)';
const STEP6 = '步骤六(绝对路径残留扫描)';

function fail(step, reason) {
  process.stderr.write(`${PROG}: ${step} 失败: ${reason}\n`);
  process.exit(1);
}

function usage(msg) {
  if (msg) process.stderr.write(`${PROG}: ${msg}\n`);
  process.stderr.write(
    `用法: node tools/pack-intranet.mjs --src <插件目录> --dest <输出目录>\n`
  );
  process.exit(2);
}

// ---------- 小工具 ----------

function toFwd(p) {
  return p.split(sep).join('/');
}

function toBack(p) {
  return toFwd(p).split('/').join('\\');
}

/** Windows 语义的路径键：正斜杠 + 小写，用于相等/前缀判断 */
function normKey(p) {
  return toFwd(p).toLowerCase();
}

/** 相对 base 的路径，统一 / 分隔（报错定位用） */
function relOf(base, p) {
  return relative(base, p).split(sep).join('/');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 递归收集常规文件（与 check-dsh-plugin.mjs 的 walkFiles 同语义：
 * 目录递归；符号链接指向文件的计入，指向目录的跳过防环，断链忽略）。
 */
function walkFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...walkFiles(p));
    } else if (e.isFile()) {
      out.push(p);
    } else if (e.isSymbolicLink()) {
      try {
        if (statSync(p).isFile()) out.push(p);
      } catch {
        /* 断链：忽略 */
      }
    }
  }
  return out;
}

/** idx 所在行号（1 起） */
function lineOf(text, idx) {
  let n = 1;
  for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

// ---------- 参数解析 ----------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) usage(`无法识别的参数: ${a}`);
    const eq = a.indexOf('=');
    if (eq !== -1) {
      out[a.slice(2, eq)] = a.slice(eq + 1);
    } else {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (val === undefined || val.startsWith('--')) {
        usage(`参数 --${key} 缺少取值`);
      }
      out[key] = val;
      i++;
    }
  }
  if (!out.src) usage('缺少 --src <插件目录>');
  if (!out.dest) usage('缺少 --dest <输出目录>');
  return out;
}

// ---------- 步骤一：复制 ----------

function copyTree(srcDir, destDir) {
  const files = walkFiles(srcDir).sort();
  for (const f of files) {
    const target = join(destDir, f.slice(srcDir.length + 1));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(f)); // 字节级复制，不转码
  }
  return files;
}

// ---------- 步骤二：绝对路径改写 ----------

function rewriteFile(p, pairs) {
  const text = readFileSync(p, 'utf8');
  let hits = 0;
  let out = text;
  for (const [from, to] of pairs) {
    const re = new RegExp(escapeRegExp(from), 'gi');
    hits += (out.match(re) || []).length;
    out = out.replace(re, to);
  }
  if (hits > 0) writeFileSync(p, out, 'utf8');
  return hits;
}

// ---------- 步骤三：结构校验（spawn 原脚本，规则零复制零放宽） ----------

function runStructuralCheck(copyDir) {
  const checker = join(dirname(fileURLToPath(import.meta.url)), 'check-dsh-plugin.mjs');
  if (!existsSync(checker) || !statSync(checker).isFile()) {
    fail(STEP3, `未找到 ${checker}（须与本脚本同在 tools/ 下）`);
  }
  const r = spawnSync(process.execPath, [checker, copyDir], { encoding: 'utf8' });
  if (r.error) fail(STEP3, `spawn node 失败: ${r.error.message}`);
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) {
    process.stderr.write(r.stderr || '');
    fail(STEP3, `check-dsh-plugin.mjs 对副本的退出码为 ${r.status}（要求 0），输出见上`);
  }
}

// ---------- 步骤四：check.py --selftest ----------

function detectPython(step) {
  const candidates = [
    ['python', []],
    ['py', ['-3']],
    ['python3', []],
  ];
  for (const [cmd, pre] of candidates) {
    const v = spawnSync(cmd, [...pre, '-I', '--version'], { encoding: 'utf8' });
    if (v.error) continue; // 找不到该命令 → 试下一个
    if (v.status === 0 && /Python \d/.test((v.stdout || '') + (v.stderr || ''))) {
      return { cmd, pre };
    }
  }
  fail(step, '未找到可用 Python 解释器（依次尝试 python / py -3 / python3 的 `-I --version`）');
}

function runSelftest(copyDir) {
  const checkPys = walkFiles(copyDir).filter((p) => basename(p) === 'check.py').sort();
  if (checkPys.length === 0) {
    fail(STEP4, '副本内未找到任何 check.py（skills/**/check.py）');
  }
  const py = detectPython(STEP4);
  const label = [py.cmd, ...py.pre].join(' ');
  const results = [];
  for (const script of checkPys) {
    const r = spawnSync(py.cmd, [...py.pre, '-I', script, '--selftest'], {
      encoding: 'utf8',
    });
    if (r.error) fail(STEP4, `spawn ${label} 失败: ${r.error.message}`);
    process.stdout.write(r.stdout || '');
    if (r.status !== 0) {
      process.stderr.write(r.stderr || '');
      fail(
        STEP4,
        `${label} -I ${relOf(copyDir, script)} --selftest 退出码 ${r.status}（要求 0），输出见上`
      );
    }
    results.push({ script: relOf(copyDir, script), status: r.status });
  }
  return { interpreter: label, results };
}

// ---------- 步骤五：清单与安装说明 ----------

function buildInstallDoc({ name, version, destF, interpreter, skillCheckPyRel }) {
  const copyF = `${destF}/${name}`;
  return `# ${name} 内网离线安装说明

本目录是 \`${name}@${version}\` 的内网离线分发包，由 \`tools/pack-intranet.mjs\` 生成：
源插件目录已复制到 \`${name}/\`，包内 cordis.patch.yml 与各 .md/.py 中指向源位置的绝对路径
已改写为打包机副本路径 \`${copyF}\`。

## 目录构成

- \`${name}/\` — 插件副本（结构校验与 check.py --selftest 已在打包机通过）
- \`SHA256SUMS.txt\` — 完整性清单（含副本全部文件与本说明）
- \`INSTALL-INTRANET.md\` — 本文件

## 离线安装步骤

以下 \`<DEST>\` 一律替换为本目录在内网机上的绝对路径（正斜杠，如 \`D:/dsh-pkgs/dist\`）。

1. 整目录拷贝：把本目录（含上述三项）原样拷到内网机任意位置。
2. 完整性校验：\`cd <DEST> && sha256sum -c SHA256SUMS.txt\`（Windows 原生无 sha256sum 时，
   用 \`certutil -hashfile <文件> SHA256\` 逐项对照清单）。
3. 路径对齐：内网机落位路径若与打包机路径（${destF}）不同，把 \`${name}/cordis.patch.yml\`
   中 customSkillDirs 的路径前缀，以及各 .md/.py 中出现的同一前缀（${copyF}），整体替换为
   \`<DEST>/${name}\`（一律正斜杠——YAML 内反斜杠双引号路径是转义序列）。
4. 安装（link:，不复制文件）：\`dsh plugin --profile <PROFILE> add link:<DEST>/${name}\`
5. 装载检查：\`dsh --profile <PROFILE> --dump-config\`，确认三点：
   ① skill-filesystem 条目的 customSkillDirs 出现 \`<DEST>/${name}/skills\`；
   ② stderr 无 \`skipping profile bundle "${name}"\`（出现即束没挂上，回第 4 步查 link 路径）；
   ③ 下方验收命令的技能冒烟能列出全部 ${name.replace(/^dsh-/, '')}-* 技能名。

## 验收命令（任一条不过即安装失败，按输出排查）

\`\`\`
# 1) 结构校验（需内网机有本仓库 tools/ 目录；没有则以 2)~4) 为准）
node tools/check-dsh-plugin.mjs <DEST>/${name}

# 2) 机检器自检（打包机实测解释器: ${interpreter}；内网机用任意 Python 3 均可）
python <DEST>/${name}/${skillCheckPyRel} --selftest

# 3) 完整性
cd <DEST> && sha256sum -c SHA256SUMS.txt

# 4) 技能冒烟（--patch 形式：不安装、不动 profile 文件，内存叠加）
DEEPSEEK_API_KEY="$DEEPSEEK_AUTH_TOKEN" dsh --profile headless --patch <DEST>/${name}/cordis.patch.yml "先列出本会话可发现的全部 ${name.replace(/^dsh-/, '')}-* 技能名"
\`\`\`

预期：1) 输出 PASS（退出码 0）；2) 输出 \`selftest ok\`（退出码 0）；3) 每行 OK；
4) 回答列出五个 loopforge-* 技能名。认证错误（invalid API key / 401）是
\`DEEPSEEK_AUTH_TOKEN\` 没拿到值，不是装载失败，两种病别混。

## 注意

- 与其他改 skill-filesystem 的束同装时，customSkillDirs 是整体替换不深合并，须在用户层
  patch 写全两条路径（详见包内 README「与 dsh-meta-harness 共存」节）。
- 包挪位置后，cordis.patch.yml 与 .md/.py 中的绝对路径必须同步改（即第 3 步），否则技能
  发现静默失效。
`;
}

function writeManifest(destAbs) {
  const manifestName = 'SHA256SUMS.txt';
  const files = walkFiles(destAbs).sort();
  const lines = [];
  for (const f of files) {
    if (basename(f) === manifestName) continue; // 清单不含自身
    const hex = createHash('sha256').update(readFileSync(f)).digest('hex');
    lines.push(`${hex}  ${relOf(destAbs, f)}`);
  }
  if (lines.length === 0) fail(STEP5, 'dest 下没有任何文件可入清单');
  writeFileSync(join(destAbs, manifestName), lines.join('\n') + '\n');
  return lines.length;
}

// ---------- 步骤六：绝对路径残留扫描 ----------

// 盘符绝对路径：前面不能是字母（排除 https:// 里的 s:），首段后不能是冒号（截断 SKILL.md:99 的行号尾巴）
const ABS_PATH_RE = /(?<![A-Za-z])[A-Za-z]:[/\\][^\s'"`(){}[\]<>|*?,;:]*/g;

/** Windows 语义的「p 是否以 prefix 开头且边界完整（等于 prefix 或后随分隔符）」 */
function startsAtPath(p, prefix) {
  return p === prefix || p.startsWith(prefix + '/') || p.startsWith(prefix + '\\');
}

function scanAbsPaths(copyDir, srcKey, destKey) {
  const leaks = []; // 指向源包位置的残留 → 失败
  const external = []; // 指向 dest 之外的其他引用 → 仅记录备查
  let scanned = 0;
  let skippedBinary = 0;
  for (const f of walkFiles(copyDir).sort()) {
    const buf = readFileSync(f);
    if (buf.includes(0)) {
      skippedBinary += 1; // 含 NUL 视为二进制，不扫描
      continue;
    }
    scanned += 1;
    const text = buf.toString('utf8');
    for (const m of text.matchAll(ABS_PATH_RE)) {
      const p = m[0];
      const k = normKey(p);
      const at = `${relOf(copyDir, f)}:${lineOf(text, m.index)}`;
      if (startsAtPath(k, srcKey)) leaks.push({ at, path: p });
      else if (!startsAtPath(k, destKey)) external.push({ at, path: p });
    }
  }
  return { leaks, external, scanned, skippedBinary };
}

// ---------- 主流程 ----------

function main() {
  const args = parseArgs(process.argv.slice(2));
  const srcAbs = resolve(args.src);
  const destAbs = resolve(args.dest);

  if (!existsSync(srcAbs) || !statSync(srcAbs).isDirectory()) {
    fail(STEP1, `插件目录不存在或不是目录: ${args.src}`);
  }
  const srcKey = normKey(srcAbs);
  const destKey = normKey(destAbs);
  if (srcKey === destKey) fail(STEP1, `--dest 与 --src 指向同一目录: ${destAbs}`);
  if (destKey.startsWith(srcKey + '/')) {
    fail(STEP1, `--dest (${destAbs}) 位于 --src (${srcAbs}) 之内，拒绝自嵌套复制`);
  }
  if (srcKey.startsWith(destKey + '/')) {
    fail(STEP1, `--src (${srcAbs}) 位于 --dest (${destAbs}) 之内，复制会波及源目录`);
  }

  const pkgName = basename(resolve(srcAbs));
  const copyDir = join(destAbs, pkgName);
  const copyF = toFwd(copyDir);

  // 步骤一：复制
  mkdirSync(destAbs, { recursive: true });
  if (existsSync(copyDir)) {
    let isOldCopy = false;
    try {
      isOldCopy =
        JSON.parse(readFileSync(join(copyDir, 'package.json'), 'utf8')).name === pkgName;
    } catch {
      isOldCopy = false;
    }
    if (!isOldCopy) {
      fail(
        STEP1,
        `dest 下已存在同名目录且不是本包旧副本（package.json.name !== "${pkgName}"），拒绝覆盖: ${copyDir}`
      );
    }
    rmSync(copyDir, { recursive: true, force: true });
  }
  const copied = copyTree(srcAbs, copyDir);
  if (copied.length === 0) fail(STEP1, `源插件目录为空，未复制任何文件: ${srcAbs}`);

  // 步骤二：绝对路径改写（在副本上）
  const pairs = [
    [toFwd(srcAbs), copyF],
    [toBack(srcAbs), toBack(copyDir)],
  ];
  const targets = new Set();
  const patchAtRoot = join(copyDir, 'cordis.patch.yml');
  if (existsSync(patchAtRoot) && statSync(patchAtRoot).isFile()) targets.add(patchAtRoot);
  let pkg = null;
  try {
    pkg = JSON.parse(readFileSync(join(copyDir, 'package.json'), 'utf8'));
    const ref = pkg?.dsh?.bundle?.patch;
    if (typeof ref === 'string' && ref.trim() !== '') {
      const p = resolve(copyDir, ref);
      if (existsSync(p) && statSync(p).isFile()) targets.add(p);
    }
  } catch {
    /* package.json 问题由步骤三的结构校验报告 */
  }
  for (const f of walkFiles(copyDir)) {
    if (/\.(md|py)$/i.test(f)) targets.add(f);
  }
  let rewriteHits = 0;
  const touched = [];
  for (const t of [...targets].sort()) {
    const hits = rewriteFile(t, pairs);
    if (hits > 0) {
      rewriteHits += hits;
      touched.push(`${relOf(copyDir, t)}(${hits})`);
    }
  }

  // 步骤三：结构校验（spawn 原脚本）
  runStructuralCheck(copyDir);

  // 步骤四：check.py --selftest（副本上的）
  const self = runSelftest(copyDir);

  // 步骤五：安装说明 + SHA256 清单
  if (pkg === null) fail(STEP5, '无法读取副本 package.json（不应发生：步骤三已应拦截）');
  if (self.results.length === 0) fail(STEP5, '不应发生：步骤四未发现 check.py');
  writeFileSync(
    join(destAbs, 'INSTALL-INTRANET.md'),
    buildInstallDoc({
      name: pkg.name,
      version: pkg.version,
      destF: toFwd(destAbs),
      interpreter: self.interpreter,
      skillCheckPyRel: self.results[0].script, // 副本内相对路径，如 skills/loopforge-evidence-gates/check.py
    })
  );
  const manifestCount = writeManifest(destAbs);

  // 步骤六：残留扫描
  const scan = scanAbsPaths(copyDir, srcKey, destKey);
  if (scan.leaks.length > 0) {
    for (const l of scan.leaks) process.stderr.write(`  ${l.at}: ${l.path}\n`);
    fail(STEP6, `副本内仍有 ${scan.leaks.length} 处指向源包位置（${toFwd(srcAbs)}）的绝对路径，逐处见上`);
  }

  // 概要
  const out = [
    `PACK OK ${pkg.name}@${pkg.version} -> ${copyF}`,
    `  ${STEP1}: 复制 ${copied.length} 个文件`,
    `  ${STEP2}: 改写 ${rewriteHits} 处（源前缀 ${toFwd(srcAbs)} -> ${copyF}），涉及 ${touched.length} 个文件: ${touched.join(' ') || '(无)'}`,
    `  ${STEP3}: 退出码 0`,
    `  ${STEP4}: ${self.interpreter} -I ${self.results.map((r) => `${r.script} --selftest`).join(', ')} 退出码全部为 0`,
    `  ${STEP5}: SHA256SUMS.txt(${manifestCount} 项) + INSTALL-INTRANET.md`,
    `  ${STEP6}: 扫描 ${scan.scanned} 个文本文件${scan.skippedBinary > 0 ? `（跳过二进制 ${scan.skippedBinary} 个）` : ''}，指向源包的残留 0 处`,
  ];
  if (scan.external.length > 0) {
    out.push(`    另有 ${scan.external.length} 处指向 dest 之外的外部绝对引用（非本包路径，仅记录备查）:`);
    for (const e of scan.external) out.push(`    ${e.at}: ${e.path}`);
  }
  process.stdout.write(out.join('\n') + '\n');
  process.exit(0);
}

main();
