#!/usr/bin/env node
/**
 * pack-intranet.mjs — dsh-loopforge-ops 内网离线打包器（九步流水，仅依赖 Node 内置模块）
 *
 * 用法: node tools/pack-intranet.mjs --src <插件目录> --dest <输出目录>
 *
 * 九步（任一步失败 → stderr 报步骤与原因并 exit 1；全部通过 → stdout 概要，exit 0）:
 *  ①  校验 src：目录存在、package.json 存在且可解析、version 非空；src 根若有 PACK-ROOT.txt
 *     则读取其记录的上一代打包根（二次打包场景），文件不存在记为空。dest 与 src 不得相互
 *     嵌套——产物含指向打包机的绝对路径（.txt/.yml 不在上层改写范围内），dest 落在 src 之内
 *     会让产物自指绝对路径回流源包，被上层离线打包的残留扫描判失败。
 *  ②  复制 src → <dest>/<包目录名>/（固定子目录名保证包名=目录名）：排除任意层级的
 *     dist/、.git、node_modules、src 根的 PACK-ROOT.txt 本身（新副本的 PACK-ROOT 由步③'
 *     新建）、以及 --dest 子树（步① 已拒绝嵌套，此处仅防御将来放宽）；dest 须不存在或为空。
 *  ③  路径改写（副本内全部文本文件 .md/.yml/.py/.json/.mjs/.txt）：改写集合 = src 绝对路径
 *     正/反斜杠两形态 + 上一代打包根正/反斜杠两形态（为空则跳过），全部替换为本次 dest
 *     副本绝对路径（正斜杠）。run#1 遗留在副本里的上一代 dest 路径正是靠后者在二次打包
 *     时被接管——代际改写不死锁。
 *  ③' 向副本根写 PACK-ROOT.txt，内容 = 本次 dest 副本绝对路径一行（写入即终值，后续步骤
 *     不再改）。
 *  ④  残留检查：全副本扫描盘符绝对路径，锚点为「单个字母+冒号+斜杠」且冒号前一字符不是
 *     字母/数字（负向后行断言；由此排除 URL scheme 与文献编号里紧贴字母的冒号形态）；
 *     运行时不支持 lookbehind 时退化为无断言匹配后按命中前一字符是否字母数字过滤。
 *     命中路径不以本次 dest 副本路径开头 → 逐行列出并 exit 1（PACK-ROOT.txt 自身内容即
 *     dest 副本路径，通过）。
 *  ⑤  等价结构校验（内嵌包外 check-dsh-plugin.mjs 的四规则——包外脚本不随包走，规则复制
 *     到本脚本内，不放宽）：package.json name=目录名/version/description 非空/
 *     dsh.bundle.patch 指向存在；skills/ 子目录均有 SKILL.md 且 frontmatter 含
 *     name/description（≥20 码点）；prompts/ 至少一个 .md 且全部非空；副本内全部 .md 无
 *     占位标记（拉丁标记不区分大小写）。
 *  ⑥  spawn <解释器> -I <副本>/skills/loopforge-evidence-gates/check.py --selftest（依次
 *     探测 python / py -3 / python3，以 -I --version 能出版本号为准；-I 隔离防环境注入），
 *     退出码非 0 或无解释器 → exit 1。
 *  ⑦  生成 <dest>/SHA256SUMS.txt：在全部改写与 PACK-ROOT 写入之后计算，含 PACK-ROOT.txt
 *     本身；每行 <十六进制哈希><两空格><相对路径>，sha256sum -c 兼容；清单只列副本内文件，
 *     行数 = 副本常规文件数。
 *  ⑧  生成 <dest>/INTRANET-INSTALL.md：dest 副本安装命令、装载检查三点、冒烟命令、副本内
 *     check.py 绝对路径、共存 patch 参数化片段、两步自举法说明、待人工确认清单（全文
 *     规避占位标记词）。
 *  ⑨  打印九步概要，exit 0。
 *
 * 退出码：0=九步全过，1=任一步失败，2=用法错误。
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';

const PROG = 'pack-intranet';
const STEP1 = '步①(源校验)';
const STEP2 = '步②(复制)';
const STEP3 = '步③(路径改写)';
const STEP3B = "步③'(写 PACK-ROOT.txt)";
const STEP4 = '步④(残留检查)';
const STEP5 = '步⑤(结构校验)';
const STEP6 = '步⑥(check.py --selftest)';
const STEP7 = '步⑦(SHA256SUMS.txt)';
const STEP8 = '步⑧(INTRANET-INSTALL.md)';

const PLACEHOLDER_MARKERS = ['TODO', 'TBD', 'FIXME', 'Lorem', '待补充'];
const MIN_DESC_LEN = 20;
const TEXT_EXT_RE = /\.(md|yml|py|json|mjs|txt)$/i;
const COPY_SKIP_DIRS = new Set(['dist', '.git', 'node_modules']);
const CHECK_PY_REL = 'skills/loopforge-evidence-gates/check.py';

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

/** Windows 语义路径键：正斜杠 + 小写，用于相等/前缀判断 */
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

/** idx 所在行号（1 起） */
function lineOf(text, idx) {
  let n = 1;
  for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

/** 递归收集常规文件（目录递归；符号链接指向文件的计入，指向目录的跳过防环，断链忽略） */
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

// ---------- 步②：复制（带排除） ----------

/**
 * 复制 srcDir → destDir（字节级，不转码）。
 * 排除：任意层级名为 dist/.git/node_modules 的目录；srcDir 根的 PACK-ROOT.txt；
 * skipSubtree（--dest 绝对路径，其子树整体不复制——允许 dest 落在 src 的 dist/ 下）。
 * 返回 { count, skippedDirs }（skippedDirs 为被排除的目录相对路径清单，供概要展示）。
 */
function copyTree(srcDir, destDir, skipSubtree) {
  const skipKey = skipSubtree ? normKey(skipSubtree) : '';
  const skippedDirs = [];
  let count = 0;

  function rec(from, to, depth) {
    let entries;
    try {
      entries = readdirSync(from, { withFileTypes: true });
    } catch (err) {
      fail(STEP2, `目录不可读取: ${relOf(srcDir, from)}: ${err.message}`);
    }
    for (const e of entries) {
      const p = join(from, e.name);
      if (skipKey !== '' && (normKey(p) === skipKey || normKey(p).startsWith(skipKey + '/'))) {
        continue; // dest 子树：不复制（此时 dest 为空，防御将来放宽）
      }
      if (e.isDirectory()) {
        if (COPY_SKIP_DIRS.has(e.name)) {
          skippedDirs.push(relOf(srcDir, p));
          continue;
        }
        rec(p, join(to, e.name), depth + 1);
      } else if (e.isFile()) {
        if (depth === 0 && e.name === 'PACK-ROOT.txt') continue; // 源根上一代标记不进副本
        const target = join(to, e.name);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, readFileSync(p));
        count += 1;
      }
      // 符号链接不复制：纯内容包不应含链接，复制会引入悬空目标
    }
  }

  rec(srcDir, destDir, 0);
  return { count, skippedDirs };
}

// ---------- 步③：路径改写 ----------

/** 在副本内全部文本文件上执行 pairs 替换（大小写不敏感——Windows 路径大小写不敏感） */
function rewriteCopy(copyDir, pairs) {
  let hits = 0;
  const touched = [];
  for (const f of walkFiles(copyDir).sort()) {
    if (!TEXT_EXT_RE.test(f)) continue;
    const buf = readFileSync(f);
    if (buf.includes(0)) continue; // 含 NUL 视为二进制，不改写
    let out = buf.toString('utf8');
    let n = 0;
    for (const [from, to] of pairs) {
      const re = new RegExp(escapeRegExp(from), 'gi');
      const m = out.match(re);
      if (m) {
        n += m.length;
        out = out.replace(re, to);
      }
    }
    if (n > 0) {
      writeFileSync(f, out, 'utf8');
      hits += n;
      touched.push(`${relOf(copyDir, f)}(${n})`);
    }
  }
  return { hits, touched };
}

// ---------- 步④：残留检查 ----------

// 盘符绝对路径锚点：字母+冒号+斜杠，且前一字符不是字母/数字（排除 URL scheme 与文献编号）
const ANCHOR_WITH_LB = '(?<![A-Za-z0-9])[A-Za-z]:[\\\\/]';
const ANCHOR_PLAIN = '[A-Za-z]:[\\\\/]';
// 路径主体：锚点后连续的非分隔字符（空白/引号/括号等截断；冒号截断 SKILL.md:99 的行号尾巴）
const PATH_RE = /[A-Za-z]:[/\\][^\s'"`(){}[\]<>|*?,;:]*/;

/** lookbehind 可用则用负向后行断言；不可用退化为无断言匹配+前一字符过滤（语义等价） */
function buildAnchor() {
  try {
    return { re: new RegExp(ANCHOR_WITH_LB, 'g'), fallback: false };
  } catch {
    return { re: new RegExp(ANCHOR_PLAIN, 'g'), fallback: true };
  }
}

function startsWithKey(p, key) {
  return p === key || p.startsWith(key + '/');
}

/**
 * 全副本扫描盘符绝对路径。返回 { bad, scanned, skippedBinary, okHits }：
 * bad = 不以本次 dest 副本路径开头的命中（`文件:行: 路径` 形式）。
 */
function scanResidue(copyDir, copyKey) {
  const anchor = buildAnchor();
  const bad = [];
  let scanned = 0;
  let skippedBinary = 0;
  let okHits = 0;
  for (const f of walkFiles(copyDir).sort()) {
    const buf = readFileSync(f);
    if (buf.includes(0)) {
      skippedBinary += 1;
      continue;
    }
    scanned += 1;
    const text = buf.toString('utf8');
    for (const m of text.matchAll(anchor.re)) {
      if (anchor.fallback && m.index > 0 && /[A-Za-z0-9]/.test(text[m.index - 1])) {
        continue; // 退化路径：命中前一字符是字母/数字 → URL scheme/文献编号，跳过
      }
      const full = text.slice(m.index).match(PATH_RE)[0];
      if (startsWithKey(normKey(full), copyKey)) {
        okHits += 1;
        continue;
      }
      bad.push(`${relOf(copyDir, f)}:${lineOf(text, m.index)}: ${full}`);
    }
  }
  return { bad, scanned, skippedBinary, okHits };
}

// ---------- 步⑤：等价结构校验（内嵌 check-dsh-plugin.mjs 四规则） ----------

function isMarkdown(p) {
  return /\.md$/i.test(p);
}

function toLines(text) {
  return text.split(/\r?\n/);
}

function parseFrontmatter(text) {
  const lines = toLines(text);
  if (lines.length === 0 || lines[0].trim() !== '---') return null;
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) return null;
  return lines.slice(1, end);
}

function frontmatterValue(fmLines, key) {
  const re = new RegExp(`^\\s*${key}\\s*:`);
  for (const line of fmLines) {
    if (re.test(line)) {
      let v = line.slice(line.indexOf(':') + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
        (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
      ) {
        v = v.slice(1, -1);
      }
      return v;
    }
  }
  return undefined;
}

/**
 * 在副本上执行四规则。返回 { violations, skills, prompts, mdCount }：
 * violations 非空即步⑤失败（调用方逐行输出后 exit 1）。
 */
function structuralCheck(copyDir) {
  const violations = [];
  const bad = (file, reason) => violations.push(`${file}: ${reason}`);

  // 规则一：package.json
  const pkgPath = join(copyDir, 'package.json');
  let pkg = null;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    bad('package.json', `JSON 解析失败: ${err.message}`);
  }
  if (pkg !== null && (typeof pkg !== 'object' || Array.isArray(pkg))) {
    bad('package.json', '顶层不是 JSON 对象');
    pkg = null;
  }
  if (pkg !== null) {
    const dirName = basename(resolve(copyDir));
    if (pkg.name !== dirName) bad('package.json', `name "${pkg.name}" 与目录名 "${dirName}" 不一致`);
    if (typeof pkg.version !== 'string' || pkg.version.trim() === '')
      bad('package.json', `version 非法或为空（实际: ${JSON.stringify(pkg.version)}）`);
    if (typeof pkg.description !== 'string' || pkg.description.trim() === '')
      bad('package.json', `description 非法或为空（实际: ${JSON.stringify(pkg.description)}）`);
    const patchRef = pkg?.dsh?.bundle?.patch;
    if (typeof patchRef !== 'string' || patchRef.trim() === '')
      bad('package.json', `缺少 dsh.bundle.patch 字段（实际: ${JSON.stringify(patchRef)}）`);
    else if (!existsSync(resolve(copyDir, patchRef)))
      bad('package.json', `dsh.bundle.patch 指向的文件不存在: ${patchRef}`);
  }

  // 规则二：skills/
  const skillsDir = join(copyDir, 'skills');
  const skillNames = [];
  if (existsSync(skillsDir) && statSync(skillsDir).isDirectory()) {
    for (const e of readdirSync(skillsDir, { withFileTypes: true })) {
      if (e.isDirectory()) skillNames.push(e.name);
    }
  }
  if (skillNames.length === 0) bad('skills/', 'skills/ 下没有任何子目录');
  for (const name of [...skillNames].sort()) {
    const skillFile = join(skillsDir, name, 'SKILL.md');
    if (!existsSync(skillFile) || !statSync(skillFile).isFile()) {
      bad(`skills/${name}/`, '子目录缺少 SKILL.md');
      continue;
    }
    const text = readFileSync(skillFile, 'utf8');
    if (text.trim().length === 0) {
      bad(`skills/${name}/SKILL.md`, '内容为空');
      continue;
    }
    const fm = parseFrontmatter(text);
    if (fm === null) {
      bad(`skills/${name}/SKILL.md`, '文件头不是 --- 包围的 frontmatter（或未闭合）');
      continue;
    }
    const nm = frontmatterValue(fm, 'name');
    if (nm === undefined) bad(`skills/${name}/SKILL.md`, 'frontmatter 缺少 name: 行');
    else if (nm.trim() === '') bad(`skills/${name}/SKILL.md`, 'frontmatter 的 name 为空值');
    const desc = frontmatterValue(fm, 'description');
    if (desc === undefined) bad(`skills/${name}/SKILL.md`, 'frontmatter 缺少 description: 行');
    else if (Array.from(desc).length < MIN_DESC_LEN)
      bad(`skills/${name}/SKILL.md`, `description 长度 ${Array.from(desc).length} < ${MIN_DESC_LEN} 字符`);
  }

  // 规则三：prompts/
  const promptsDir = join(copyDir, 'prompts');
  let promptMd = [];
  if (existsSync(promptsDir) && statSync(promptsDir).isDirectory()) {
    promptMd = walkFiles(promptsDir).filter(isMarkdown);
  }
  if (promptMd.length === 0) bad('prompts/', 'prompts/ 下没有任何 .md 文件');
  for (const f of promptMd) {
    if (readFileSync(f, 'utf8').trim().length === 0) bad(relOf(copyDir, f), 'prompt 文件内容为空');
  }

  // 规则四：占位标记（副本内全部 .md 递归）
  const allMd = walkFiles(copyDir).filter(isMarkdown);
  for (const f of allMd) {
    const text = readFileSync(f, 'utf8');
    const found = PLACEHOLDER_MARKERS.filter((mk) =>
      new RegExp(mk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)
    );
    if (found.length > 0) bad(relOf(copyDir, f), `含占位标记: ${found.join(', ')}`);
  }

  return {
    violations,
    skillNames: [...skillNames].sort(),
    promptCount: promptMd.length,
    mdCount: allMd.length,
  };
}

// ---------- 步⑥：check.py --selftest ----------

function detectPython() {
  const candidates = [
    ['python', []],
    ['py', ['-3']],
    ['python3', []],
  ];
  for (const [cmd, pre] of candidates) {
    const v = spawnSync(cmd, [...pre, '-I', '--version'], { encoding: 'utf8' });
    if (v.error) continue;
    if (v.status === 0 && /Python \d/.test((v.stdout || '') + (v.stderr || ''))) {
      return { cmd, pre, label: [cmd, ...pre].join(' ') };
    }
  }
  return null;
}

function runSelftest(copyDir) {
  const script = join(copyDir, ...CHECK_PY_REL.split('/'));
  if (!existsSync(script) || !statSync(script).isFile()) {
    fail(STEP6, `副本内未找到 ${CHECK_PY_REL}`);
  }
  const py = detectPython();
  if (py === null) {
    fail(STEP6, '未找到可用 Python 解释器（依次尝试 python / py -3 / python3 的 `-I --version`）');
  }
  const r = spawnSync(py.cmd, [...py.pre, '-I', script, '--selftest'], { encoding: 'utf8' });
  if (r.error) fail(STEP6, `spawn ${py.label} 失败: ${r.error.message}`);
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) {
    process.stderr.write(r.stderr || '');
    fail(STEP6, `${py.label} -I <副本>/${CHECK_PY_REL} --selftest 退出码 ${r.status}（要求 0），输出见上`);
  }
  return py.label;
}

// ---------- 步⑦：SHA256SUMS.txt ----------

/** 清单只列副本内文件（含 PACK-ROOT.txt），行数=副本常规文件数；相对路径以 dest 为基准 */
function writeManifest(destAbs, copyDir, pkgName) {
  const files = walkFiles(copyDir).sort();
  const lines = [];
  for (const f of files) {
    const hex = createHash('sha256').update(readFileSync(f)).digest('hex');
    lines.push(`${hex}  ${pkgName}/${relOf(copyDir, f)}`);
  }
  if (lines.length === 0) fail(STEP7, '副本内没有任何文件可入清单');
  writeFileSync(join(destAbs, 'SHA256SUMS.txt'), lines.join('\n') + '\n', 'utf8');
  return lines.length;
}

// ---------- 步⑧：INTRANET-INSTALL.md ----------

function buildInstallDoc({ name, version, destF, copyF, interpreter, skillNames }) {
  const smokeSkillCount = skillNames.length;
  return `# ${name} 内网离线安装说明（v${version}）

本目录由 \`${name}/tools/pack-intranet.mjs\` 打包生成（九步流水全部通过后才会出现本文件），含三项：

- \`${name}/\` — 插件副本，根下 \`PACK-ROOT.txt\` 记录本副本的绝对路径（上一代打包根标记，见文末两步自举法）；
- \`SHA256SUMS.txt\` — 完整性清单（sha256sum -c 兼容，行数=副本常规文件数，含 PACK-ROOT.txt）；
- \`INTRANET-INSTALL.md\` — 本文件。

## 完整性校验（先校验后安装）

\`\`\`
cd ${destF} && sha256sum -c SHA256SUMS.txt
\`\`\`

Windows 原生无 sha256sum 时用 Git Bash 的 sha256sum，或 \`certutil -hashfile <文件> SHA256\` 逐项对照清单。

## 安装（link:，不复制文件；路径一律正斜杠）

\`\`\`
dsh plugin --profile <PROFILE> add link:${copyF}
\`\`\`

## 装载检查三点

\`\`\`
dsh --profile <PROFILE> --dump-config
\`\`\`

1. 组合树 skill-filesystem 条目的 \`customSkillDirs\` 出现 \`${copyF}/skills\`；
2. stderr 无 \`skipping profile bundle "${name}"\`（出现即束没挂上，回安装命令查 link 路径）；
3. 冒烟（下条命令）能列出全部 ${smokeSkillCount} 个 loopforge-* 技能名（${skillNames.join('、')}），少任何一个即装载未生效。

## 冒烟（--patch 形式：不安装、不动任何 profile 文件，内存叠加）

\`\`\`
DEEPSEEK_API_KEY="$DEEPSEEK_AUTH_TOKEN" dsh --profile headless --patch ${copyF}/cordis.patch.yml "先列出本会话可发现的全部 loopforge-* 技能名"
\`\`\`

报认证错误（invalid API key / 401 一类）是 \`DEEPSEEK_API_KEY\` 没拿到值，技能发现本身仍正常——认证失败与装载失败是两种病，别混；装载失败的样子是技能名不出现、dump-config 无路径。

## 机检器自检（副本内绝对路径）

\`\`\`
python ${copyF}/${CHECK_PY_REL} --selftest
\`\`\`

预期输出 \`selftest ok\`、退出码 0（打包机实测解释器：${interpreter}；内网机用任意 Python 3 均可）。

## 与他束共存（customSkillDirs 整体替换不深合并）

后装束的 \`customSkillDirs\` 会整体替换先装束的。两束同装必须在用户层 override 写全两条路径（\`<COEXIST-SKILLS-DIR>\` = 另一束 skills 目录绝对路径）：

\`\`\`yaml
- id: skill-filesystem
  config:
    customSkillDirs:
      - <COEXIST-SKILLS-DIR>
      - ${copyF}/skills
\`\`\`

共存验收：两束都装后跑冒烟，两套技能名同场；缺一套就是先装束被抹，按上面片段手工合并后再验。

## 两步自举法（内网最终落位必经二次打包，不许裸拷贝后直接用）

1. 把本目录整体（副本 + 两份清单说明）拷至内网机任意临时位置 T；
2. 用 T 内脚本向最终落位目录二次打包：

\`\`\`
node T/${name}/tools/pack-intranet.mjs --src T/${name} --dest <最终落位输出目录>
\`\`\`

\`PACK-ROOT.txt\` 已记录上一代打包根（本次打包机路径），二次打包的步③改写集合自动把它纳入——run#1 写进副本的打包机路径全部改写为最终落位路径，代际改写不死锁。二次打包同时重跑全套验收（结构校验 / check.py --selftest / 残留检查 / SHA256 清单），退出码 0 即落位与离线验收一次完成；
3. 安装命令同上，路径指向最终落位副本。

为何明令不许裸拷贝后直接用：副本内 \`cordis.patch.yml\`、SKILL.md、prompts 写的是打包机绝对路径，裸拷贝到内网后这些路径指向不存在的位置，技能发现静默失效且无告警；只有经 pack 改写（或两步自举）落位的副本才自洽可用。

## 待人工确认清单

- 完整性：\`sha256sum -c SHA256SUMS.txt\` 全行 OK（或 certutil 逐项对照）；
- 装载：dump-config 三点逐条确认；
- 机检：\`check.py --selftest\` 输出 \`selftest ok\`；
- 冒烟：${smokeSkillCount} 个技能名全部出现（${skillNames.join('、')}）；
- 认证报错时先查 \`DEEPSEEK_AUTH_TOKEN\` 再查 patch 路径，别当装载失败排查。

## 内网限制三项（离线环境的边界，提前知会）

1. dsh 本体与其依赖需内网可达的 npm registry，或先行离线搬运；
2. 冒烟需 \`DEEPSEEK_API_KEY\` 与模型端点可达——认证失败与装载失败是两种病；
3. 技能内引用的文献（含 arXiv 编号）离线不可在线复核，依据行已保留文献名与编号，供有外网时人工核对。
`;
}

// ---------- 主流程 ----------

function main() {
  const args = parseArgs(process.argv.slice(2));
  const srcAbs = resolve(args.src);
  const destAbs = resolve(args.dest);

  // 步①：源校验 + 读上一代打包根
  if (!existsSync(srcAbs) || !statSync(srcAbs).isDirectory()) {
    fail(STEP1, `插件目录不存在或不是目录: ${args.src}`);
  }
  const pkgSrcPath = join(srcAbs, 'package.json');
  if (!existsSync(pkgSrcPath) || !statSync(pkgSrcPath).isFile()) {
    fail(STEP1, `package.json 不存在: ${pkgSrcPath}`);
  }
  let pkgSrc = null;
  try {
    pkgSrc = JSON.parse(readFileSync(pkgSrcPath, 'utf8'));
  } catch (err) {
    fail(STEP1, `package.json 解析失败: ${err.message}`);
  }
  if (pkgSrc === null || typeof pkgSrc !== 'object' || Array.isArray(pkgSrc)) {
    fail(STEP1, 'package.json 顶层不是 JSON 对象');
  }
  if (typeof pkgSrc.version !== 'string' || pkgSrc.version.trim() === '') {
    fail(STEP1, `version 非法或为空（实际: ${JSON.stringify(pkgSrc.version)}）`);
  }
  const version = pkgSrc.version;
  const pkgName = basename(resolve(srcAbs));
  let prevRoot = '';
  const prevPath = join(srcAbs, 'PACK-ROOT.txt');
  if (existsSync(prevPath) && statSync(prevPath).isFile()) {
    prevRoot = readFileSync(prevPath, 'utf8').trim();
  }
  const srcKey = normKey(srcAbs);
  const destKey = normKey(destAbs);
  if (srcKey === destKey) fail(STEP1, `--dest 与 --src 指向同一目录: ${destAbs}`);
  if (destKey.startsWith(srcKey + '/')) {
    fail(
      STEP1,
      `--dest (${destAbs}) 位于 --src (${srcAbs}) 之内：产物含指向打包机的绝对路径（PACK-ROOT.txt 与改写后路径），` +
        `嵌在源包内会被上层离线打包的残留扫描判失败，须用包外输出目录`
    );
  }
  if (srcKey.startsWith(destKey + '/')) {
    fail(STEP1, `--src (${srcAbs}) 位于 --dest (${destAbs}) 之内，复制会波及源目录`);
  }

  // 步②：dest 须不存在或为空 → 复制
  if (existsSync(destAbs)) {
    if (!statSync(destAbs).isDirectory()) fail(STEP2, `dest 已存在且不是目录: ${args.dest}`);
    let entries;
    try {
      entries = readdirSync(destAbs);
    } catch (err) {
      fail(STEP2, `dest 目录不可读取: ${err.message}`);
    }
    if (entries.length > 0) {
      fail(STEP2, `dest 已存在且非空（${toFwd(destAbs)}），须换空目录或先清空后重跑`);
    }
  }
  const copyDir = join(destAbs, pkgName);
  const copyF = toFwd(copyDir);
  const copyKey = normKey(copyDir);
  mkdirSync(destAbs, { recursive: true });
  const { count, skippedDirs } = copyTree(srcAbs, copyDir, destAbs);
  if (count === 0) fail(STEP2, `源插件目录没有可复制的文件: ${toFwd(srcAbs)}`);

  // 步③：路径改写（源两形态 + 上一代根两形态 → 本次 dest 副本路径，正斜杠）
  const pairs = [
    [toFwd(srcAbs), copyF],
    [toBack(srcAbs), copyF],
  ];
  let prevFwd = '';
  if (prevRoot !== '') {
    prevFwd = toFwd(resolve(prevRoot));
    pairs.push([prevFwd, copyF]);
    pairs.push([toBack(resolve(prevRoot)), copyF]);
  }
  const rw = rewriteCopy(copyDir, pairs);

  // 步③'：写新 PACK-ROOT.txt（终值）
  writeFileSync(join(copyDir, 'PACK-ROOT.txt'), copyF + '\n', 'utf8');

  // 步④：残留检查（零容忍：命中且不以本次 dest 副本路径开头即失败）
  const scan = scanResidue(copyDir, copyKey);
  if (scan.bad.length > 0) {
    for (const b of scan.bad) process.stderr.write(`  ${b}\n`);
    fail(
      STEP4,
      `副本内 ${scan.bad.length} 处盘符绝对路径不以本次 dest 副本路径（${copyF}）开头，逐处见上` +
        `（URL scheme 与文献编号形态已排除；源包内指向包外的绝对路径属打包先决条件违规，去绝对化后重跑）`
    );
  }

  // 步⑤：等价结构校验（内嵌四规则）
  const st = structuralCheck(copyDir);
  if (st.violations.length > 0) {
    for (const v of st.violations) process.stderr.write(`  ${v}\n`);
    fail(STEP5, `四规则校验 ${st.violations.length} 项违规，逐项见上`);
  }

  // 步⑥：spawn 副本 check.py --selftest
  const interpreter = runSelftest(copyDir);

  // 步⑦：SHA256SUMS.txt（全部改写与 PACK-ROOT 写入之后计算）
  const manifestCount = writeManifest(destAbs, copyDir, pkgName);

  // 步⑧：INTRANET-INSTALL.md
  writeFileSync(
    join(destAbs, 'INTRANET-INSTALL.md'),
    buildInstallDoc({
      name: pkgName,
      version,
      destF: toFwd(destAbs),
      copyF,
      interpreter,
      skillNames: st.skillNames,
    }),
    'utf8'
  );

  // 步⑨：概要，exit 0
  const out = [
    `PACK OK ${pkgName}@${version} -> ${copyF}`,
    `  ${STEP1}: package.json 解析 OK（version ${version}），上一代打包根: ${prevFwd === '' ? '(无，首次打包)' : prevFwd}`,
    `  ${STEP2}: 复制 ${count} 个文件${skippedDirs.length > 0 ? `（排除目录: ${skippedDirs.join(' ')}）` : ''}`,
    `  ${STEP3}: 改写 ${rw.hits} 处 → ${copyF}，涉及 ${rw.touched.length} 个文件: ${rw.touched.join(' ') || '(无)'}`,
    `  ${STEP3B}: 写入 ${copyF}`,
    `  ${STEP4}: 扫描 ${scan.scanned} 个文本文件${scan.skippedBinary > 0 ? `（跳过二进制 ${scan.skippedBinary} 个）` : ''}，以 dest 副本开头的路径 ${scan.okHits} 处，违规 0 处`,
    `  ${STEP5}: 四规则 PASS（skills ${st.skillNames.length} 个子目录，prompts ${st.promptCount} 个 .md，占位扫描覆盖 ${st.mdCount} 个 .md）`,
    `  ${STEP6}: ${interpreter} -I <副本>/${CHECK_PY_REL} --selftest 退出码 0`,
    `  ${STEP7}: SHA256SUMS.txt ${manifestCount} 行（含 PACK-ROOT.txt，行数=副本常规文件数）`,
    `  ${STEP8}: INTRANET-INSTALL.md 生成`,
  ];
  process.stdout.write(out.join('\n') + '\n');
  process.exit(0);
}

main();
