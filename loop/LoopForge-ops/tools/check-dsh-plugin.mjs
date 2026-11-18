#!/usr/bin/env node
/**
 * check-dsh-plugin.mjs — dsh 插件目录确定性验收脚本
 *
 * 用法: node tools/check-dsh-plugin.mjs <插件目录>
 *
 * 规则（任一违规 → stderr 每项一行「文件: 原因」，exit 1；全部通过 → stdout 概要，exit 0）:
 *  一、目录存在且含 package.json；JSON 可解析；name === 目录名；version、description 非空；
 *      含 dsh.bundle.patch 字段（嵌套路径 pkg.dsh.bundle.patch）且其指向的 patch 文件存在。
 *  二、skills/ 下至少一个子目录；每个子目录都有 SKILL.md；每个 SKILL.md 非空、
 *      文件头是 --- 包围的 frontmatter、含 name: 行与 description: 行、description ≥ 20 字符。
 *  三、prompts/ 下至少一个 .md 且每个非空。
 *  四、插件目录内所有 .md（递归）不得含占位标记 TODO、TBD、FIXME、Lorem、待补充（拉丁标记不区分大小写）。
 *
 * 仅依赖 Node 内置模块。退出码：0=通过，1=存在违规，2=用法错误。
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { basename, join, resolve, relative, sep } from 'node:path';
import process from 'node:process';

const PLACEHOLDER_MARKERS = ['TODO', 'TBD', 'FIXME', 'Lorem', '待补充'];
const MIN_DESC_LEN = 20;

/** 收集到的违规项：{ file, reason } */
const violations = [];

function fail(file, reason) {
  violations.push({ file, reason });
}

/** 相对插件目录的路径（统一为 / 分隔），便于报错定位 */
function rel(pluginDir, p) {
  const r = relative(pluginDir, p);
  return r === '' ? basename(pluginDir) : r.split(sep).join('/');
}

/**
 * 递归遍历目录，返回所有常规文件的绝对路径（跳过符号链接目录以防环；符号链接文件仍计入）。
 */
function walkFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // 不可读目录：由调用方按具体规则报错
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...walkFiles(p));
    } else if (e.isFile()) {
      out.push(p);
    } else if (e.isSymbolicLink()) {
      try {
        if (statSync(p).isFile()) out.push(p); // 链接到文件的仍检查；链接到目录的跳过（防环）
      } catch {
        /* 断链：忽略，不参与 .md 检查 */
      }
    }
  }
  return out;
}

function isMarkdown(p) {
  return /\.md$/i.test(p);
}

/** 去掉行尾 \r（兼容 CRLF），按行拆分 */
function toLines(text) {
  return text.split(/\r?\n/);
}

/**
 * 解析 SKILL.md 头部 frontmatter。
 * 返回 { ok, lines, error }：ok=true 时 lines 为 frontmatter 内的行（不含两侧 ---）。
 */
function parseFrontmatter(text, file) {
  const lines = toLines(text);
  if (lines.length === 0 || lines[0].trim() !== '---') {
    fail(file, '文件头不是 --- 开头的 frontmatter');
    return { ok: false };
  }
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) {
    fail(file, 'frontmatter 未闭合（缺少第二个 --- 行）');
    return { ok: false };
  }
  return { ok: true, lines: lines.slice(1, end) };
}

/** 从 frontmatter 行中取 `key:` 行的值（首个匹配；去首尾空白，剥掉一对包裹引号） */
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

// ---------- 规则一：package.json ----------
function checkPackageJson(pluginDir) {
  const pkgPath = join(pluginDir, 'package.json');
  const relPkg = rel(pluginDir, pkgPath);

  if (!existsSync(pkgPath)) {
    fail(relPkg, 'package.json 不存在');
    return null;
  }
  if (!statSync(pkgPath).isFile()) {
    fail(relPkg, 'package.json 不是常规文件');
    return null;
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    fail(relPkg, `JSON 解析失败: ${err.message}`);
    return null;
  }
  if (pkg === null || typeof pkg !== 'object' || Array.isArray(pkg)) {
    fail(relPkg, 'package.json 顶层不是 JSON 对象');
    return null;
  }

  const dirName = basename(resolve(pluginDir));
  if (pkg.name !== dirName) {
    fail(relPkg, `name "${pkg.name}" 与目录名 "${dirName}" 不一致`);
  }
  if (typeof pkg.version !== 'string' || pkg.version.trim() === '') {
    fail(relPkg, `version 非法或为空（实际: ${JSON.stringify(pkg.version)}）`);
  }
  if (typeof pkg.description !== 'string' || pkg.description.trim() === '') {
    fail(relPkg, `description 非法或为空（实际: ${JSON.stringify(pkg.description)}）`);
  }

  const dsh = pkg.dsh;
  const patchRef =
    dsh !== null && typeof dsh === 'object' && !Array.isArray(dsh) &&
    dsh.bundle !== null && typeof dsh.bundle === 'object' && !Array.isArray(dsh.bundle)
      ? dsh.bundle.patch
      : undefined;

  if (typeof patchRef !== 'string' || patchRef.trim() === '') {
    fail(relPkg, `缺少 dsh.bundle.patch 字段（实际: ${JSON.stringify(patchRef)}）`);
    return pkg;
  }
  const patchPath = resolve(pluginDir, patchRef);
  if (!existsSync(patchPath) || !statSync(patchPath).isFile()) {
    fail(relPkg, `dsh.bundle.patch 指向的文件不存在: ${patchRef}`);
  }
  return pkg;
}

// ---------- 规则二：skills/ ----------
function checkSkills(pluginDir) {
  const skillsDir = join(pluginDir, 'skills');
  const subdirs = [];
  if (existsSync(skillsDir) && statSync(skillsDir).isDirectory()) {
    let entries;
    try {
      entries = readdirSync(skillsDir, { withFileTypes: true });
    } catch (err) {
      fail(rel(pluginDir, skillsDir), `skills/ 目录不可读取: ${err.message}`);
      return [];
    }
    for (const e of entries) {
      if (e.isDirectory()) subdirs.push(join(skillsDir, e.name));
    }
  }
  if (subdirs.length === 0) {
    fail(rel(pluginDir, skillsDir), 'skills/ 下没有任何子目录');
    return [];
  }

  const skillFiles = [];
  for (const dir of subdirs) {
    const skillFile = join(dir, 'SKILL.md');
    if (!existsSync(skillFile) || !statSync(skillFile).isFile()) {
      fail(rel(pluginDir, dir), '子目录缺少 SKILL.md');
      continue;
    }
    skillFiles.push(skillFile);
  }

  for (const skillFile of skillFiles) {
    const file = rel(pluginDir, skillFile);
    const text = readFileSync(skillFile, 'utf8');

    if (text.trim().length === 0) {
      fail(file, 'SKILL.md 内容为空');
      continue;
    }

    const fm = parseFrontmatter(text, file);
    if (!fm.ok) continue;

    const name = frontmatterValue(fm.lines, 'name');
    if (name === undefined) fail(file, 'frontmatter 缺少 name: 行');
    else if (name.trim() === '') fail(file, 'frontmatter 的 name 为空值');

    const desc = frontmatterValue(fm.lines, 'description');
    if (desc === undefined) {
      fail(file, 'frontmatter 缺少 description: 行');
    } else {
      const len = Array.from(desc).length; // 按码点计数，中文每字计 1
      if (len < MIN_DESC_LEN) {
        fail(file, `description 长度 ${len} < ${MIN_DESC_LEN} 字符: "${desc}"`);
      }
    }
  }
  return skillFiles;
}

// ---------- 规则三：prompts/ ----------
function checkPrompts(pluginDir) {
  const promptsDir = join(pluginDir, 'prompts');
  let mdFiles = [];
  if (existsSync(promptsDir) && statSync(promptsDir).isDirectory()) {
    mdFiles = walkFiles(promptsDir).filter(isMarkdown);
  }
  if (mdFiles.length === 0) {
    fail(rel(pluginDir, promptsDir), 'prompts/ 下没有任何 .md 文件');
    return [];
  }
  for (const f of mdFiles) {
    const file = rel(pluginDir, f);
    const text = readFileSync(f, 'utf8');
    if (text.trim().length === 0) fail(file, 'prompt 文件内容为空');
  }
  return mdFiles;
}

// ---------- 规则四：占位标记 ----------
function checkPlaceholders(pluginDir) {
  const allMd = walkFiles(pluginDir).filter(isMarkdown);
  for (const f of allMd) {
    const text = readFileSync(f, 'utf8');
    const found = PLACEHOLDER_MARKERS.filter((m) =>
      new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)
    );
    if (found.length > 0) {
      fail(rel(pluginDir, f), `含占位标记: ${found.join(', ')}`);
    }
  }
  return allMd;
}

// ---------- 主流程 ----------
function main() {
  const arg = process.argv[2];
  if (!arg) {
    process.stderr.write('用法: node tools/check-dsh-plugin.mjs <插件目录>\n');
    process.exit(2);
  }

  const pluginDir = resolve(arg);
  if (!existsSync(pluginDir)) {
    process.stderr.write(`${arg}: 插件目录不存在\n`);
    process.exit(1);
  }
  if (!statSync(pluginDir).isDirectory()) {
    process.stderr.write(`${arg}: 不是目录\n`);
    process.exit(1);
  }

  const pkg = checkPackageJson(pluginDir);
  const skillFiles = checkSkills(pluginDir);
  const promptFiles = checkPrompts(pluginDir);
  const allMd = checkPlaceholders(pluginDir);

  if (violations.length > 0) {
    for (const v of violations) {
      process.stderr.write(`${v.file}: ${v.reason}\n`);
    }
    process.stderr.write(
      `共 ${violations.length} 项违规（插件: ${arg}）\n`
    );
    process.exit(1);
  }

  const patchRef =
    pkg && pkg.dsh && pkg.dsh.bundle && typeof pkg.dsh.bundle.patch === 'string'
      ? pkg.dsh.bundle.patch
      : '(无)';
  const stdout = [
    `PASS ${pkg ? `${pkg.name}@${pkg.version}` : basename(pluginDir)}（${arg}）`,
    `  规则一 package.json: name=目录名, version/description 非空, dsh.bundle.patch -> ${patchRef}（文件存在）`,
    `  规则二 skills/: ${skillFiles.length} 个子目录, SKILL.md 全部非空且 frontmatter(name/description>=${MIN_DESC_LEN}字符)合规`,
    `  规则三 prompts/: ${promptFiles.length} 个 .md, 全部非空`,
    `  规则四 占位标记: ${allMd.length} 个 .md 已扫描, 未发现 ${PLACEHOLDER_MARKERS.join('/')}`,
  ].join('\n');
  process.stdout.write(stdout + '\n');
  process.exit(0);
}

main();
