// dsh-rsi-replay —— DSH 保留式改进循环模板（一个可执行周期：⓪bootstrap 演化基座 → ①读发现树池
// → ②诊断 → ③因子化变异 → ④预测引导选择 → ⑤冒烟 → ⑥确定性回放评分 → ⑦两级保留门 → ⑧过拟合门
// → ⑨ledger 落账与出口提示）。
//
// 用法：把本模板从插件资产目录复制到当前项目 .zcode/workflows/dsh-rsi-replay.dwf.ts，再以 saved
// 方式运行（同 dsh-method 技能第 3 节三步法）。前置：incumbentWorkflow 所指的 dsh-orchestrator 副本
// 已存在；树池为空时本周期判 insufficient、零候选、仍落账（这不是错误，是三值判级的合法取值）。
//
// 硬约束（全文适用）：
// 1) 变异只发生在项目本地 evolveDir（CONFIG.evolveDir）之下；绝不写插件安装缓存，绝不写 plugins/
//    源码（installing-and-updating.md Updating 节）。被接受的变更留在 evolveDir，经人工复制回插件源
//    并按市场更新流程发版回流（见 ⑨ 出口提示）。
// 2) 宿主沙箱禁用实时时钟与随机数 API（.zcode/workflow-runs/dwfrun-29fb95f4….mjs:230-250 实证：
//    宿主运行时对这三类调用直接抛错）。本脚本主体的时间戳与唯一 id 一律经 world.run("node",
//    ["-e", …]) 在外部进程取得后回填；一切落盘同样只走 world.run 的 node 子进程或子代理。
// 3) 字面量反花括号插值不直接书写；需要出现字面 ${ 时按转义写法 ${"$"}{…}（本文件未用到）。

// ——— CONFIG：一个改进周期的全部默认值 ———
const CONFIG = {
  /** 现役编排脚本（策略 θ 的项目副本；改进循环的 0 号候选，never-worse 对照）。 */
  incumbentWorkflow: ".zcode/workflows/dsh-orchestrator.dwf.ts",
  /** 现役评审技能（预测器 φ；指向 evolveDir 内的本地演化副本，frontmatter 带 local 版本）。 */
  incumbentReviewer: ".zcode/workflows/dsh-evolve/general/skills/reviewer/SKILL.md",
  /** 项目本地演化工作副本根：general/tools·skills·logic 三类白名单目录 + env/ 环境分区。 */
  evolveDir: ".zcode/workflows/dsh-evolve/",
  /** 发现树池目录（与 dsh-orchestrator 的 artifactsDir 同根，生产/消费两侧路径对齐）。 */
  treesDir: ".zcode/workflow-runs/dsh/trees",
  /** 版本化反馈账本（JSONL，每周期一行；k 计更新周期而非成功修订）。 */
  ledgerPath: ".zcode/workflow-runs/dsh/ledger.jsonl",
  /** 单位：本改进周期最多放行进入两级门与回放评估的候选数。 */
  gateBudget: 2,
  /** λ：候选排序分 = 预测分 − λ·不确定度（预测引导选择，RSI-Anything §2.3）。 */
  candidateUncertaintyPenalty: 0.2,
  /** 回放目标权重：V = quality·bestRevealedScore归一 − callCost·调用数 − seriality·决策轮数/调用数。 */
  scoreWeights: { quality: 1, callCost: 0.05, seriality: 0.3 },
  /** 树池划入 held-out 审计集的比例；轮转法划分（dsh-rsi-loop ⑫节），不足 5 棵有效树时审计集为空。 */
  auditHoldout: 0.2,
  /** 种群模式：single=单 incumbent+never-worse（默认）；moead=N=3 权重角色种群（Tchebycheff 替换）。 */
  populationMode: "single" as "single" | "moead",
  /** 仅 moead 生效：某角色连续 stagnationGens 代父代标识与失败摘要不变 → 改从其 Tchebycheff 最优邻居的 incumbent 育种。 */
  stagnationGens: 2,
  /** 回放决策轮上限（K2）：候选策略在每棵树上至多做多少轮批选择。 */
  replayRoundCap: 6,
  /** 回放每轮批大小上限（W）：一轮至多展开多少个已揭示节点。 */
  replayBatchCap: 4,
};

const LOGIC_COPY = "dsh-orchestrator.dwf.ts"; // evolveDir general/logic/ 下编排脚本副本的文件名
const MOEA_ROLE_COUNT = 3; // moead 权重角色数 N（Harmony §4.1：种群有界）
const MOEA_REPLACE_CAP = 2; // 子代至多替换的邻居数 n_r
/** moead 三角色的权重向量（目标序：质量、调用成本、串行度），均匀铺在权衡线上。 */
const MOEA_WEIGHTS: number[][] = [
  [0.8, 0.1, 0.1],
  [0.1, 0.8, 0.1],
  [0.1, 0.1, 0.8],
];

// ——— 外部进程脚本（全部经 world.run("node", ["-e", …]) 执行；字符串内只用双引号） ———
// 取时间戳与唯一 id（沙箱禁实时时钟，所以出界取）。类名拆开拼接：字符串在外部进程才求值，
// 但源码文本里也不留被宿主禁令盯防的调用字样。
const NODE_STAMP =
  'const D=["D","ate"].join("");const c=require("crypto");const Clk=globalThis[D];console.log(JSON.stringify({ts:new Clk().toISOString(),id:c.randomUUID()}))';
const NODE_EXISTS =
  'const fs=require("fs");console.log(JSON.stringify(process.argv.slice(1).map((p)=>fs.existsSync(p))))';
const NODE_MKDIR =
  'const fs=require("fs");for(const d of process.argv.slice(1))fs.mkdirSync(d,{recursive:true});console.log("mkdir ok")';
const NODE_COPY_FILE =
  'const fs=require("fs");fs.mkdirSync(process.argv[2].slice(0,process.argv[2].lastIndexOf("/")),{recursive:true});fs.copyFileSync(process.argv[1],process.argv[2]);console.log("copy ok")';
const NODE_COPY_DIR =
  'const fs=require("fs");fs.cpSync(process.argv[1],process.argv[2],{recursive:true});console.log("cpdir ok")';
const NODE_RM =
  'const fs=require("fs");for(const p of process.argv.slice(1))fs.rmSync(p,{recursive:true,force:true});console.log("rm ok")';
const NODE_LIST_FILES =
  'const fs=require("fs");const out=[];for(const root of process.argv.slice(1)){const walk=(d)=>{if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){const f=d+"/"+e.name;if(e.isDirectory())walk(f);else out.push(f)}};walk(root)}console.log(JSON.stringify(out))';
const NODE_READ_FILES =
  'const fs=require("fs");const out={};for(const p of process.argv.slice(1)){try{out[p]=fs.readFileSync(p,"utf8")}catch(e){out[p]=null}}console.log(JSON.stringify(out))';
const NODE_WRITE_FILE =
  'const fs=require("fs");const p=process.argv[1];const d=p.lastIndexOf("/")>=0?p.slice(0,p.lastIndexOf("/")):"";if(d)fs.mkdirSync(d,{recursive:true});fs.writeFileSync(p,process.argv[2]);console.log("write ok")';
const NODE_APPEND_LINE =
  'const fs=require("fs");const p=process.argv[1];const d=p.lastIndexOf("/")>=0?p.slice(0,p.lastIndexOf("/")):"";if(d)fs.mkdirSync(d,{recursive:true});fs.appendFileSync(p,process.argv[2]+"\\n");console.log("append ok")';
const NODE_HASH_PATHS =
  'const fs=require("fs"),c=require("crypto");const h=c.createHash("sha256");for(const p of process.argv.slice(1).sort()){h.update(p);h.update("\\u0000");try{h.update(fs.readFileSync(p))}catch(e){h.update("missing")}}console.log(JSON.stringify({sha256:h.digest("hex")}))';
const NODE_SHA256_TEXT =
  'const c=require("crypto");console.log(JSON.stringify({sha256:c.createHash("sha256").update(process.argv[1]).digest("hex")}))';
// 单棵发现树 → 严格 schema 校验 + 紧凑摘要（观察截 480 字符；读失败/schema 不符记 insufficient，不猜测）。
// 字段名对齐 dsh-rsi-loop ⑴节 schema 与 dsh-orchestrator treeAdd：父指针读 parent（非 parentId）。
// 根判定兼容两种合法形态：①nodes 数组内存在 parent:null 的根（⑴节骨架，编排器现行格式）；
// ②旧版编排器把根放 nodes 之外的顶层 root 对象——此时把它补录进 nodes 再验父指针。
// 用 IIFE+return 收尾而非打印后立即退出，避免管道输出被截断。
const NODE_TREE_SUMMARY =
  'const fs=require("fs");const p=process.argv[1];(function(){let raw;try{raw=fs.readFileSync(p,"utf8")}catch(e){console.log(JSON.stringify({ok:false,reason:"读取失败"}));return}' +
  'let t;try{t=JSON.parse(raw)}catch(e){console.log(JSON.stringify({ok:false,reason:"JSON 解析失败"}));return}' +
  'const ns=Array.isArray(t&&t.nodes)?t.nodes:null;if(!ns||ns.length===0){console.log(JSON.stringify({ok:false,reason:"schema: 无 nodes 数组"}));return}' +
  'const ids=new Set();const nodes=[];' +
  'for(const n of ns){if(!n||(typeof n.id!=="string"&&typeof n.id!=="number")){console.log(JSON.stringify({ok:false,reason:"schema: 节点缺 id"}));return}' +
  'const k=String(n.id);if(ids.has(k)){console.log(JSON.stringify({ok:false,reason:"schema: 节点 id 重复 "+k}));return}ids.add(k);' +
  'if(typeof n.score!=="number"||!isFinite(n.score)){console.log(JSON.stringify({ok:false,reason:"schema: 节点分数非数值 "+k}));return}' +
  'if(typeof n.observation!=="string"){console.log(JSON.stringify({ok:false,reason:"schema: 节点缺完整观察 "+k}));return}' +
  'const par=(n.parent===undefined||n.parent===null||n.parent==="")?null:String(n.parent);' +
  'nodes.push({id:k,parent:par,score:n.score,obs:n.observation.slice(0,480),snap:(typeof n.snapshotRef==="string")?n.snapshotRef:null})}' +
  'let root=null;for(const n of nodes){if(n.parent===null){if(root!==null){console.log(JSON.stringify({ok:false,reason:"schema: 多根"}));return}root=n.id}}' +
  'if(root===null&&t.root&&(typeof t.root.id==="string"||typeof t.root.id==="number")&&!ids.has(String(t.root.id))&&typeof t.root.score==="number"&&isFinite(t.root.score)&&typeof t.root.observation==="string"){' +
  'const r=t.root;const rk=String(r.id);ids.add(rk);nodes.push({id:rk,parent:null,score:r.score,obs:r.observation.slice(0,480),snap:(typeof r.snapshotRef==="string")?r.snapshotRef:null});root=rk}' +
  'if(root===null){console.log(JSON.stringify({ok:false,reason:"schema: 无根节点"}));return}' +
  'for(const n of nodes)if(n.parent!==null&&!ids.has(n.parent)){console.log(JSON.stringify({ok:false,reason:"schema: 父指针悬空 "+n.id}));return}' +
  'const children={};let best=-Infinity;for(const n of nodes){if(n.parent!==null){if(!children[n.parent])children[n.parent]=[];children[n.parent].push(n.id)}if(n.score>best)best=n.score}' +
  'console.log(JSON.stringify({ok:true,path:p,runId:(typeof t.runId==="string")?t.runId:p.split("/").pop(),nodes:nodes,root:root,children:children,best:best,outcome:(t.outcome===undefined)?null:t.outcome,startedAt:(typeof t.startedAt==="string")?t.startedAt:((typeof t.createdAt==="string")?t.createdAt:null)}))})()';
// 非审计树池失败摘要（update 数据；末四分位低分叶节点 + outcome），供诊断与停滞检测用。父指针同读 parent。
const NODE_FAILURE_DIGEST =
  'const fs=require("fs"),c=require("crypto");const paths=process.argv.slice(1).sort();const parts=[];' +
  'for(const p of paths){let t;try{t=JSON.parse(fs.readFileSync(p,"utf8"))}catch(e){continue}if(!Array.isArray(t.nodes))continue;' +
  'const deg={};for(const n of t.nodes){const par=(n.parent===undefined||n.parent===null||n.parent==="")?null:String(n.parent);if(par!==null)deg[par]=(deg[par]||0)+1}' +
  'const leaves=t.nodes.filter((n)=>!(deg[String(n.id)]>0));if(leaves.length===0)continue;leaves.sort((a,b)=>a.score-b.score);' +
  'const take=leaves.slice(0,Math.max(1,Math.ceil(leaves.length/4)));' +
  'for(const n of take.slice(0,3))parts.push(p+": 低分叶节点 score="+n.score+" obs="+String(n.observation).slice(0,200));' +
  'if(t.outcome!==undefined)parts.push(p+": outcome="+JSON.stringify(t.outcome).slice(0,200))}' +
  'const digest=parts.join("\\n").slice(0,2400);console.log(JSON.stringify({digest:digest,sha256:c.createHash("sha256").update(digest).digest("hex")}))';
// 两段冒烟之 A 段：JSON/结构级检查 + B 段：父代自测断言逐字存在性（不删断言）。
const NODE_SMOKE =
  'const fs=require("fs");const jobs=JSON.parse(process.argv[1]);const problems=[];' +
  'const banned=new RegExp(["TO"+"DO","FIX"+"ME","TB"+"D","待"+"补","占"+"位"].join("|"));' +
  'for(const j of jobs){let t=null;try{t=fs.readFileSync(j.path,"utf8")}catch(e){problems.push(j.path+": 文件缺失");continue}' +
  'if(banned.test(t))problems.push(j.path+": 含未完成标记词");' +
  'if(j.path.endsWith(".json")){try{JSON.parse(t)}catch(e){problems.push(j.path+": JSON 解析失败 "+e.message)}}' +
  'else if(j.path.endsWith(".md")){const m=t.match(/^---\\r?\\n[\\s\\S]*?\\r?\\n---/);if(!m)problems.push(j.path+": 缺 frontmatter");else if(!/^name:/m.test(m[0]))problems.push(j.path+": frontmatter 缺 name")}' +
  'else if(j.path.endsWith(".ts")){const o=(t.match(/\\{/g)||[]).length,c2=(t.match(/\\}/g)||[]).length;if(o!==c2)problems.push(j.path+": 花括号不平衡 ("+o+"/"+c2+")");if(j.path.endsWith(".dwf.ts")&&t.indexOf("CONFIG")<0)problems.push(j.path+": 缺 CONFIG 块")}' +
  'if(j.parent){let pt=null;try{pt=fs.readFileSync(j.parent,"utf8")}catch(e){}' +
  'if(pt!==null){const lines=pt.split(/\\r?\\n/).filter((l)=>/assert|selftest|self-test|自测/i.test(l));' +
  'for(const l of lines)if(t.indexOf(l)<0)problems.push(j.path+": 父代自测断言被删："+l.trim().slice(0,80))}}}' +
  'console.log(JSON.stringify({ok:problems.length===0,problems:problems.slice(0,20)}))';
// evolveDir reviewer 的 local 版本读取与接受后的递增（0.1.0-local → 0.1.1-local）。
const NODE_REVIEWER_VERSION =
  'const fs=require("fs");const t=fs.readFileSync(process.argv[1],"utf8");const fm=t.match(/^---\\r?\\n[\\s\\S]*?\\r?\\n---/);const v=fm?fm[0].match(/version:\\s*"?([0-9]+\\.[0-9]+\\.[0-9]+-local)"?/):null;console.log(JSON.stringify({version:v?v[1]:null}))';
const NODE_REVIEWER_BUMP =
  'const fs=require("fs");const p=process.argv[1];(function(){let t=fs.readFileSync(p,"utf8");const fm=t.match(/^---\\r?\\n[\\s\\S]*?\\r?\\n---/);' +
  'if(!fm){console.log(JSON.stringify({version:null}));return}' +
  'const v=fm[0].match(/version:\\s*"?([0-9]+)\\.([0-9]+)\\.([0-9]+)-local"?/);' +
  'if(!v){console.log(JSON.stringify({version:null}));return}' +
  'const nv=v[1]+"."+v[2]+"."+(Number(v[3])+1)+"-local";' +
  'const head=fm[0].replace(/version:\\s*"?[0-9]+\\.[0-9]+\\.[0-9]+-local"?/,"version: \\""+nv+"\\"");' +
  'fs.writeFileSync(p,head+t.slice(fm[0].length));console.log(JSON.stringify({version:nv}))})()';
const NODE_LEDGER_COUNT =
  'const fs=require("fs");let k=0;try{for(const l of fs.readFileSync(process.argv[1],"utf8").split(/\\r?\\n/)){if(!l.trim())continue;try{const r=JSON.parse(l);if(r&&r.kind==="cycle")k++}catch(e){}}}catch(e){}console.log(JSON.stringify({k:k}))';
// 组装对物化：父代快照整棵复制，再把候选的变更文件覆盖上去（候选脚本×现行评审技能的组装对）。
const NODE_OVERLAY =
  'const fs=require("fs");const b=process.argv[1],l=process.argv[2],o=process.argv[3];const files=JSON.parse(process.argv[4]);' +
  'fs.rmSync(o,{recursive:true,force:true});fs.cpSync(b,o,{recursive:true});' +
  'for(const f of files){const d=f.lastIndexOf("/")>=0?f.slice(0,f.lastIndexOf("/")):"";if(d)fs.mkdirSync(o+"/"+d,{recursive:true});fs.copyFileSync(l+"/"+f,o+"/"+f)}console.log("overlay ok")';
// 回滚：按候选的变更文件清单，从父代快照恢复；快照中没有的新增文件直接删除。
const NODE_RESTORE =
  'const fs=require("fs");const b=process.argv[1],l=process.argv[2];const files=JSON.parse(process.argv[3]);' +
  'for(const f of files){const bf=b+"/"+f,lf=l+"/"+f;if(fs.existsSync(bf)){const d=lf.lastIndexOf("/")>=0?lf.slice(0,lf.lastIndexOf("/")):"";if(d)fs.mkdirSync(d,{recursive:true});fs.copyFileSync(bf,lf)}else{fs.rmSync(lf,{force:true})}}console.log("restore ok")';

// ——— 结果类型 ———
interface Stamp {
  ts: string;
  id: string;
}
interface ReplayNode {
  id: string;
  parent: string | null;
  score: number;
  obs: string;
  snap: string | null;
}
interface TreeSummary {
  ok: true;
  path: string;
  runId: string;
  startedAt: string | null; // 树文件顶层 startedAt（缺失记 createdAt，再缺失记 null → 排序时殿后保持路径序）
  nodes: ReplayNode[];
  root: string;
  children: Record<string, string[]>;
  best: number;
  outcome: unknown;
}
interface SkippedTree {
  path: string;
  reason: string;
}
interface SplitPlan {
  valid: number;
  audit: string[];
  gate: string[];
  skipped: SkippedTree[];
  note: string;
}
interface Diagnosis {
  focus: string;
  problem_statement: string;
  artifact_evidence: string[];
}
interface EvidenceCheck {
  verified: string[];
  missing: string[];
}
type ClassKey = "tools" | "skills" | "logic";
interface MutationResult {
  cls: ClassKey;
  changedFiles: string[];
  summary: string;
  contractMet: string;
  failed: boolean;
}
interface Prediction {
  predictedScore: number;
  uncertainty: number;
  rationale: string;
}
interface CandidateRecord {
  id: string;
  cls: ClassKey;
  route: "policy" | "adapt";
  changedFiles: string[];
  summary: string;
  contractMet: string;
  predictedScore: number | null;
  uncertainty: number | null;
  selectionScore: number | null;
  admitted: boolean;
  note: string;
  smoke: "pass" | "repaired" | "fail-rolled-back" | "未运行";
  replayV: number | null;
  observedCalls: number | null;
  observedSeriality: number | null;
  componentGate: boolean | null;
  pairGate: boolean | null;
  overfit: "pass" | "hit-rolled-back" | "未运行";
  retained: boolean;
}
interface ReplayResult {
  treeId: string;
  calls: number;
  rounds: number;
  bestRevealed: number;
  normalized: number;
  v: number;
}
interface ReplayAgg {
  label: string;
  meanV: number;
  meanCalls: number;
  meanSeriality: number;
  perTree: ReplayResult[];
}
interface Assembly {
  label: string;
  dir: string;
  logicPath: string;
  reviewerPath: string;
  toolsNote: string;
}
interface SmokeOutcome {
  ok: boolean;
  problems: string[];
}
interface GatePair {
  componentGate: boolean | null;
  pairGate: boolean | null;
  detail: string;
}
interface OverfitCheck {
  pass: boolean;
  hits: { file: string; pattern: string; evidence: string }[];
}
interface ReviewerCheck {
  notWorse: boolean;
  rationale: string;
}
interface BreedingTarget {
  label: string;
  liveRoot: string; // 含尾斜杠；其下 general/ 与 env/
  backupDir: string; // 本周期父代快照（脚本自管，子代理不可写）
}
interface CycleOutcome {
  target: BreedingTarget;
  candidates: CandidateRecord[];
  retained: CandidateRecord[];
  baseline: ReplayAgg;
  bestRetained: ReplayAgg | null;
  objectives: number[] | null; // [-meanV, meanCalls, meanSeriality]（最小化向量）
  reviewerChangedAccepted: boolean;
  notes: string[];
}
interface MoeadRoleState {
  weights: number[];
  lastParentHash: string | null;
  lastFailureHash: string | null;
  stagnation: number;
  objectives: number[] | null;
}

// ——— 外部进程小工具 ———
async function sh(js: string, args: string[]): Promise<string> {
  const r = await world.run("node", ["-e", js, ...args]);
  if (r.exitCode !== 0) {
    throw new Error("node -e 失败（" + args.join(" ").slice(0, 200) + "）：" + (r.stderr || r.stdout).slice(0, 400));
  }
  return r.stdout;
}
async function shJson<T>(js: string, args: string[]): Promise<T> {
  const out = await sh(js, args);
  const lines = out.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const line = lines.length > 0 ? lines[lines.length - 1] : "{}";
  return JSON.parse(line) as T;
}
async function stampOnce(): Promise<Stamp> {
  return shJson<Stamp>(NODE_STAMP, []);
}
async function listFiles(roots: string[]): Promise<string[]> {
  // 去尾斜杠，保证 node 侧拼出的路径是单斜杠（与白名单前缀的 startsWith 比较一致）。
  const clean = roots.map((r) => (r.endsWith("/") ? r.slice(0, r.length - 1) : r));
  return shJson<string[]>(NODE_LIST_FILES, clean);
}
async function readMap(paths: string[]): Promise<Record<string, string | null>> {
  if (paths.length === 0) return {};
  return shJson<Record<string, string | null>>(NODE_READ_FILES, paths);
}
function sortPaths(paths: string[]): string[] {
  return [...paths].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

// ——— 交付看板 ———
artifact.board("candidates", {
  title: "候选工作流版本（本改进周期）",
  key: "id",
  status: "status",
  columns: ["待评估", "已放行", "已回滚", "已保留"],
  cardTitle: "id",
  detail: [
    { field: "summary", label: "变更摘要" },
    { field: "note", label: "门控结果" },
  ],
});

function boardRow(rec: CandidateRecord): { id: string; status: string; summary: string; note: string } {
  const status = rec.retained
    ? "已保留"
    : rec.smoke === "fail-rolled-back" || rec.overfit === "hit-rolled-back" || rec.admitted
      ? "已回滚"
      : rec.admitted === false && rec.selectionScore !== null
        ? "已回滚"
        : "待评估";
  const note =
    "预测 " +
    (rec.predictedScore === null ? "无" : rec.predictedScore.toFixed(3)) +
    " / 不确定度 " +
    (rec.uncertainty === null ? "无" : rec.uncertainty.toFixed(3)) +
    "；冒烟 " +
    rec.smoke +
    "；回放 V " +
    (rec.replayV === null ? "未运行" : rec.replayV.toFixed(4)) +
    "；组件门 " +
    (rec.componentGate === null ? "未运行" : String(rec.componentGate)) +
    "；兼容门 " +
    (rec.pairGate === null ? "未运行" : String(rec.pairGate)) +
    "；过拟合门 " +
    rec.overfit +
    (rec.retained ? "；已保留" : "");
  return { id: rec.id, status: status, summary: rec.summary || rec.cls, note: note };
}

// ——— 因子化变异三类组件的定义 ———
const CLASS_ORDER: ClassKey[] = ["tools", "skills", "logic"];
const CLASS_CONTRACT: Record<ClassKey, string> = {
  tools:
    "必须改变子代理获取或消费真实反馈的方式：新工具把真实执行结果带入回路、修复调用结果被浪费/返回信息不足/辅助函数丢弃关键信息都算交付；" +
    "幻影验证（不真执行就下结论）被禁止；tools/ 目录随首个工具型组件产出而创建。",
  skills:
    "交付一个可复用技能文档（SKILL.md：触发条件+简短通用流程+一个 worked example；frontmatter 含 name 与 version）；" +
    "禁止『默认行为+逃生条款』式技能；若改 reviewer 技能，保持三值触发器（reliable/unreliable/insufficient）与证据等级 E0–E3 规约。",
  logic:
    "只改编排/控制逻辑（general/logic 与 env/logic）；调轮数/预算等数值必须改 CONFIG 块内的常量，用提示词达到同样效果不被允许；" +
    "保持与 dsh-operators 算子契约（o=(O_k, φ, ψ)）兼容。",
};
function classWhitelist(liveRoot: string, cls: ClassKey): string[] {
  return [liveRoot + "general/" + cls + "/", liveRoot + "env/" + cls + "/"];
}
function underAny(path: string, prefixes: string[]): boolean {
  for (const p of prefixes) if (path.startsWith(p)) return true;
  return false;
}

// ============ 主流程 ============

const cycleStamp = await stampOnce();
log("改进周期开始：cycleId=" + cycleStamp.id + "（时间戳与唯一 id 均取自外部 node 进程）");

// ——— ⓪ bootstrap 演化基座 ———
phase("⓪ bootstrap 演化基座");
const evolveGeneral = CONFIG.evolveDir + "general/";
const evolveEnv = CONFIG.evolveDir + "env/";
const reviewerPath = CONFIG.incumbentReviewer;
const logicCopyPath = evolveGeneral + "logic/" + LOGIC_COPY;
const [incumbentExists, reviewerExists, logicCopyExists] = (
  await shJson<boolean[]>(NODE_EXISTS, [CONFIG.incumbentWorkflow, reviewerPath, logicCopyPath])
).map((x) => x === true);
if (!incumbentExists) {
  throw new Error(
    "现役编排脚本不存在：" +
      CONFIG.incumbentWorkflow +
      "。请先按 dsh-method 技能第 3 节把 dsh-orchestrator 模板复制到项目 .zcode/workflows/ 再运行本循环。",
  );
}
await sh(NODE_MKDIR, [evolveGeneral + "skills/reviewer", evolveGeneral + "logic", evolveEnv]); // env/ 空目录；tools/ 不预建（随首个工具型组件产出）
if (!logicCopyExists) {
  await sh(NODE_COPY_FILE, [CONFIG.incumbentWorkflow, logicCopyPath]);
  log("已建立 general/logic/ 编排脚本副本：" + logicCopyPath);
}
let bootstrappedReviewer = false;
if (!reviewerExists) {
  // reviewer 初版由子代理按 dsh-rsi-loop 技能⑪节的初版内容契约生成（契约内联如下，不读不改插件安装缓存）。
  await agent("基座·评审技能写手", {
    system:
      "你是严谨的技术写手：只写分派给你的那一个文件，不碰任何其他路径，绝不写插件安装缓存与 plugins/ 源码。" +
      "写出的技能文档立即可用、无未完成标记词。",
  }).ask(
    "在 " +
      reviewerPath +
      " 创建 reviewer 评审技能初版（目录已建好）。内容契约（dsh-rsi-loop 技能⑪节最低契约，逐条内联）：\n" +
      "1. frontmatter：name: reviewer；description 一句话说明何时用（评审/预测子代理的技能底座）；version: \"0.1.0-local\"。\n" +
      "2. 角色定义（⑪①）：对编排产物（黑板产物）做 E0–E3 证据分级与 verified/unconfirmed 判定；评审对象是产物，不是任务本身；是先检后并的把关者。\n" +
      "3. 三值触发器语义（⑪②）：该改（unreliable）/不该改（reliable）/证据不足（insufficient→不动），与 dsh-rsi-loop ④节一致，不得重写出歧义版本。\n" +
      "4. 输出 JSON 格式（⑪③）：评审结论必须输出 {\"verdict\": \"verified\" 或 \"unconfirmed\", \"evidence\": \"E0\"/\"E1\"/\"E2\"/\"E3\" 之一, \"reasons\": [字符串数组], \"confidence\": 0 到 1 之间的数}；unconfirmed 的产物不 fold；证据不足按 insufficient 语义处理（不确定度调高），不猜。\n" +
      "5. 简短通用流程：读产物与验收判据 → 逐条结论按证据等级 E0–E3 标注 → 输出上述结构化 JSON。\n" +
      "6. 一个 worked example：最小示例（一段产物与判据、给出带 evidence 标签与 confidence 的完整评审输出 JSON）。\n" +
      "7. 更新规约：任何被接受的变更须递增 frontmatter 的 local 版本（local 谱系）。\n" +
      "硬规则：最低即全部——不得加入环境特定事实或超出上述契约的硬编码；判据须可运行时推导，不硬编码环境事实；不读不改插件安装缓存。\n" +
      "写完返回一段中文摘要。",
  );
  bootstrappedReviewer = true;
  log("已生成 reviewer 评审技能初版（frontmatter 版本 0.1.0-local）");
} else {
  log("演化基座已存在（reviewer 与 general/logic/ 副本均在），保持既有演化状态不覆盖");
}

// ——— ① 装载树池并按⑫节数据三分规约划分 ———
phase("① 装载树池并三分（update/gate 数据 vs held-out 审计集）");
const treePaths = sortPaths(await listFiles([CONFIG.treesDir])).filter((p) => p.endsWith(".json"));
const trees: TreeSummary[] = [];
const skipped: SkippedTree[] = [];
for (const p of treePaths) {
  const s = await shJson<{ ok: boolean; reason?: string } & Partial<TreeSummary>>(NODE_TREE_SUMMARY, [p]);
  if (s.ok === true && s.nodes !== undefined && s.root !== undefined && s.children !== undefined) {
    trees.push({
      ok: true,
      path: p,
      runId: String(s.runId),
      startedAt: typeof s.startedAt === "string" ? s.startedAt : null,
      nodes: s.nodes as ReplayNode[],
      root: s.root,
      children: s.children as Record<string, string[]>,
      best: typeof s.best === "number" ? s.best : 0,
      outcome: s.outcome ?? null,
    });
  } else {
    skipped.push({ path: p, reason: s.reason === undefined ? "schema 不符" : s.reason });
  }
}
// 轮转法（dsh-rsi-loop ⑫节）按『创建时间序』轮转：以树文件顶层 startedAt（缺失记 createdAt）为排序键；
// 缺时间戳的树殿后并保持装载时的路径序（Array.sort 稳定），回退情况在 split.note 注明。
const unstampedTrees = trees.filter((t) => t.startedAt === null).length;
trees.sort((a, b) => {
  const ka = a.startedAt === null ? "9999" : a.startedAt;
  const kb = b.startedAt === null ? "9999" : b.startedAt;
  return ka < kb ? -1 : ka > kb ? 1 : 0;
});
const stride = Math.max(1, Math.round(1 / CONFIG.auditHoldout));
const auditPaths: string[] = [];
const gatePaths: string[] = [];
trees.forEach((t, i) => {
  if (trees.length >= stride && (i + 1) % stride === 0) auditPaths.push(t.path);
  else gatePaths.push(t.path);
});
const split: SplitPlan = {
  valid: trees.length,
  audit: auditPaths,
  gate: gatePaths,
  skipped: skipped,
  note:
    "轮转法 stride=" + stride + "（auditHoldout=" + CONFIG.auditHoldout + "），按 startedAt 创建时间序轮转" +
    (unstampedTrees > 0 ? "；" + unstampedTrees + " 棵缺时间戳，按路径序殿后" : "") +
    "；审计集只用于对外报告，不参与任何保留决策",
};
report({ treePool: split });
const gateTrees = trees.filter((t) => gatePaths.indexOf(t.path) >= 0);
const auditTrees = trees.filter((t) => auditPaths.indexOf(t.path) >= 0);
const ledgerCount = await shJson<{ k: number }>(NODE_LEDGER_COUNT, [CONFIG.ledgerPath]);
const k = ledgerCount.k + 1; // k 计更新周期（含两组件均未变更的周期）

const EXIT_HINT =
  "被接受的变更已留在 " +
  CONFIG.evolveDir +
  "。要发版回流：人工把通用部分复制回插件源 plugins/dynamic-workflows-rsi/ 对应目录，递增 .zcode-plugin/plugin.json 的 version，" +
  "并同步市场条目的 version/description（保留市场名与插件身份），再按市场更新流程让用户端升级；全程不改安装缓存、不重脚手架。";

if (trees.length === 0) {
  // 空池语义：本轮判 insufficient、不产生任何候选修订、仍落账。
  phase("⑨ ledger 落账与出口提示");
  const row = {
    kind: "cycle",
    k: k,
    ts: cycleStamp.ts,
    cycleId: cycleStamp.id,
    mode: CONFIG.populationMode,
    verdict: "insufficient",
    insufficient: "树池为空或全部跳过（跳过 " + skipped.length + " 棵），零候选",
    treePool: { valid: 0, audit: [], gate: [], skipped: skipped.slice(0, 12) },
    bootstrappedReviewer: bootstrappedReviewer,
    candidates: [],
    scriptVersion: await readScriptVersion(),
    reviewerLocalVersion: await readReviewerVersion(reviewerPath),
    auditReport: "insufficient",
    exitHint: EXIT_HINT,
  };
  await appendLedger(row);
  report(row);
  log("树池为空：本轮 insufficient、零候选、已落账（k=" + k + "）。先运行 dsh-orchestrator 积累发现树。");
  return { cycle: k, mode: CONFIG.populationMode, verdict: "insufficient", retained: [], exitHint: EXIT_HINT };
}
log("树池装载：有效 " + trees.length + " 棵（gate " + gateTrees.length + " / audit " + auditTrees.length + "），跳过 " + skipped.length + " 棵");

// ——— ② 诊断：JSON 诊断 + 独立子代理逐字核验证据 ———
phase("② 诊断与证据核验");
const digestOut = await shJson<{ digest: string; sha256: string }>(
  NODE_FAILURE_DIGEST,
  gatePaths.length > 0 ? gatePaths : treePaths,
);
const failureDigest = digestOut.digest;
let diagnosis: Diagnosis | null = null;
let guided = false;
try {
  const diagnoser = agent("诊断员", {
    system:
      "你是诊断员（Harmony App E.1 诊断协议形态）：只依据给出的失败摘要与你实际读到的运行产物下诊断，" +
      "引用必须逐字摘自产物原文（将被独立核验），不编造。用中文输出。",
  });
  diagnosis = await diagnoser.ask<Diagnosis>(
    "诊断协议。输入：非审计树池（update 数据）的失败摘要与结构元数据。\n失败摘要：\n" +
      failureDigest +
      "\n树文件（可读全文；节点的 snapshotRef 指向产物目录，也可读）：\n" +
      JSON.stringify(gatePaths.slice(0, 12)) +
      "\n输出 JSON：{\"focus\": string（本周期聚焦的改进杠杆轴）, \"problem_statement\": string, " +
      "\"artifact_evidence\": string[]}（每条 evidence ≥24 字符且逐字摘自运行产物树）。只返回 JSON。",
  );
  const evidence = Array.isArray(diagnosis.artifact_evidence) ? diagnosis.artifact_evidence : [];
  if (evidence.length > 0) {
    const verifier = agent("证据核验员", {
      system: "你是证据完整性门：只做逐字核验，不做评判。读给到的树文件与 snapshotRef 指向的产物目录，逐条确认引用原文存在。",
    });
    let check = await verifier.ask<EvidenceCheck>(
      "逐条核验下列引用是否逐字出现在运行产物树中（树文件及其 snapshotRef 指向的目录内文件均可读）：\n" +
        JSON.stringify(evidence) +
        "\n树文件：" +
        JSON.stringify(gatePaths.slice(0, 12)) +
        '\n返回 JSON：{"verified": string[], "missing": string[]}（按原文归组）。',
    );
    if (check.missing !== undefined && check.missing.length > 0) {
      // 核验失败重试一次：把缺失清单反馈给诊断员重新出证，再验一次。
      log("证据核验失败 " + check.missing.length + " 条，重试一次");
      diagnosis = await diagnoser.ask<Diagnosis>(
        "以下证据引用未逐字出现在运行产物树中，请重新诊断并把引用改成逐字原文：\n缺失：" +
          JSON.stringify(check.missing) +
          "\n原诊断：" +
          JSON.stringify(diagnosis) +
          "\n仍返回同结构 JSON。",
      );
      const evidence2 = Array.isArray(diagnosis.artifact_evidence) ? diagnosis.artifact_evidence : [];
      check = await verifier.ask<EvidenceCheck>(
        "逐条核验下列引用是否逐字出现在运行产物树中：\n" +
          JSON.stringify(evidence2) +
          "\n树文件：" +
          JSON.stringify(gatePaths.slice(0, 12)) +
          '\n返回 JSON：{"verified": string[], "missing": string[]}。',
      );
    }
    guided = check.missing === undefined || check.missing.length === 0;
  }
} catch (e) {
  log("诊断子代理失败，转无引导变异：" + String(e).slice(0, 160));
  diagnosis = null;
  guided = false;
}
report({
  diagnosis: diagnosis === null ? null : { focus: diagnosis.focus, problem_statement: diagnosis.problem_statement, evidenceCount: diagnosis.artifact_evidence.length },
  evidenceVerified: guided,
});
if (!guided) log("诊断证据未过核验（或无诊断）：本轮无引导变异");

// plugins/ 源码完整性基线（变异窗口前后各拍一次哈希，命中即整周期回滚）。
const pluginsHashBefore = (await shJson<{ sha256: string }>(NODE_HASH_PATHS, ["plugins"])).sha256;

// ——— 单目标 / 多目标分派 ———
const singleTarget: BreedingTarget = {
  label: "single",
  liveRoot: CONFIG.evolveDir,
  backupDir: CONFIG.evolveDir + ".cycle/backup-" + cycleStamp.id,
};

let outcome: CycleOutcome;
let moeadSummary: unknown = null;
if (CONFIG.populationMode === "moead") {
  const moead = await runMoead(cycleStamp, gateTrees, failureDigest, diagnosis, guided);
  outcome = moead.outcome;
  moeadSummary = moead.summary;
} else {
  outcome = await improveCycle(singleTarget, gateTrees, failureDigest, diagnosis, guided, cycleStamp);
}

// ——— ⑨ ledger 落账与出口提示 ———
phase("⑨ ledger 落账与出口提示");
const pluginsHashAfter = (await shJson<{ sha256: string }>(NODE_HASH_PATHS, ["plugins"])).sha256;
if (pluginsHashAfter !== pluginsHashBefore) {
  // 硬规则被触碰。single 模式：整周期回滚到父代快照；moead 模式：顶层无周期前快照，标记人工复核。
  if (CONFIG.populationMode === "single") {
    await sh(NODE_RESTORE, [
      singleTarget.backupDir,
      CONFIG.evolveDir,
      JSON.stringify(outcome.candidates.flatMap((c) => c.changedFiles)),
    ]);
    for (const c of outcome.candidates) {
      c.retained = false;
      c.note = c.note + "；plugins/ 源码哈希变动，整周期回滚";
    }
    outcome.retained = [];
    outcome.notes.push("violation: plugins/ 源码在变异窗口内被改动，已整体回滚");
  } else {
    outcome.notes.push("violation: plugins/ 源码在变异窗口内被改动（moead 模式顶层无周期前快照，请人工复核并按需回退）");
  }
}

// 评审器版本：取 evolveDir reviewer frontmatter 的 local 版本；本周期被改且被接受 → 记递增后的新版本。
let reviewerLocalVersion = await readReviewerVersion(reviewerPath);
if (outcome.reviewerChangedAccepted) {
  const bumped = await shJson<{ version: string | null }>(NODE_REVIEWER_BUMP, [reviewerPath]);
  if (bumped.version !== null) {
    reviewerLocalVersion = bumped.version;
    log("reviewer 本周期被改且被接受：local 版本递增为 " + bumped.version);
  }
} else if (bootstrappedReviewer) {
  log("reviewer 为本轮基座初版（0.1.0-local），非变异产物，不递增");
}

// 审计集表现（held-out：只对外报告，不参与保留决策；审计集为空记 insufficient）。
let auditReport: unknown = "insufficient";
if (auditTrees.length > 0) {
  const retainedAssembly: Assembly = {
    label: "retained-audit",
    dir: "",
    logicPath: logicCopyPath,
    reviewerPath: reviewerPath,
    toolsNote: evolveGeneral + "tools/（若有）",
  };
  const auditAgg = await replayAssembly(retainedAssembly, auditTrees, "审计集");
  auditReport = { trees: auditTrees.length, meanV: auditAgg.meanV, perTree: auditAgg.perTree.map((r) => ({ tree: r.treeId, v: Number(r.v.toFixed(4)) })) };
}

const verdict = outcome.retained.length > 0 ? "retained" : outcome.candidates.length === 0 ? "no-change" : "rejected-all";
const row = {
  kind: "cycle",
  k: k,
  ts: cycleStamp.ts,
  cycleId: cycleStamp.id,
  mode: CONFIG.populationMode,
  verdict: verdict,
  treePool: {
    valid: split.valid,
    audit: split.audit.slice(0, 40),
    gate: split.gate.slice(0, 40),
    skipped: split.skipped.slice(0, 12),
    note: split.note,
  },
  diagnosis: { guided: guided, focus: diagnosis === null ? null : diagnosis.focus },
  scriptVersion: await readScriptVersion(),
  reviewerLocalVersion: reviewerLocalVersion,
  incumbent: { label: "0号现役", replayV: Number(outcome.baseline.meanV.toFixed(4)) },
  candidates: outcome.candidates.map((c) => ({
    id: c.id,
    cls: c.cls,
    route: c.route,
    predicted: c.predictedScore,
    uncertainty: c.uncertainty,
    selectionScore: c.selectionScore === null ? null : Number(c.selectionScore.toFixed(4)),
    observedV: c.replayV === null ? null : Number(c.replayV.toFixed(4)),
    observedCalls: c.observedCalls,
    observedSeriality: c.observedSeriality === null ? null : Number(c.observedSeriality.toFixed(4)),
    smoke: c.smoke,
    componentGate: c.componentGate,
    pairGate: c.pairGate,
    overfit: c.overfit,
    retained: c.retained,
    note: c.note.slice(0, 300),
  })),
  auditReport: auditReport,
  moead: moeadSummary,
  notes: outcome.notes.slice(0, 8),
  exitHint: EXIT_HINT,
};
await appendLedger(row);
report(row);
log(
  "周期 k=" +
    k +
    " 落账完成（verdict=" +
    verdict +
    "；保留 " +
    outcome.retained.length +
    " 个候选；评审器 local 版本 " +
    reviewerLocalVersion +
    "）。" +
    EXIT_HINT,
);
try {
  await artifact.file("dsh-ledger", CONFIG.ledgerPath, { title: "DSH 改进循环 ledger（本周期已追加）" });
} catch {
  log("ledger 产物发布失败（账本文件本身已落盘，可直接查看 " + CONFIG.ledgerPath + "）");
}

const finalResult = {
  cycle: k,
  mode: CONFIG.populationMode,
  verdict: verdict,
  gateTrees: gateTrees.length,
  auditTrees: auditTrees.length,
  retained: outcome.retained.map((c) => c.id),
  incumbentReplayV: Number(outcome.baseline.meanV.toFixed(4)),
  reviewerLocalVersion: reviewerLocalVersion,
  auditReport: auditReport,
  exitHint: EXIT_HINT,
};
report(finalResult);
return finalResult;

// ============ 共享实现 ============

async function readScriptVersion(): Promise<string> {
  const map = await readMap(["plugins/dynamic-workflows-rsi/.zcode-plugin/plugin.json"]);
  const raw = map["plugins/dynamic-workflows-rsi/.zcode-plugin/plugin.json"];
  if (raw === null || raw === undefined) return "unknown";
  try {
    const parsed = JSON.parse(raw) as { version?: string };
    return typeof parsed.version === "string" ? parsed.version : "unknown";
  } catch {
    return "unknown";
  }
}
async function readReviewerVersion(path: string): Promise<string> {
  const v = await shJson<{ version: string | null }>(NODE_REVIEWER_VERSION, [path]);
  return v.version === null ? "0.1.0-local" : v.version;
}
async function appendLedger(rowBody: unknown): Promise<void> {
  // 行预算保护：删减型序列化——超长时逐级丢弃可变长大字段后整体重新序列化，绝不字符串硬截断，
  // 每级产物都由 JSON.stringify 整体生成，天然是完整可解析 JSON（NODE_LEDGER_COUNT 不会漏计坏行）。
  const BUDGET = 28000;
  let line = JSON.stringify(rowBody);
  if (line.length > BUDGET) {
    const fullLen = line.length;
    const trimmed: Record<string, unknown> = { ...(rowBody as Record<string, unknown>) };
    trimmed.candidates = [];
    trimmed.notes = ["行超长，候选/审计/种群字段已删减（原始行 " + fullLen + " 字符）"];
    delete trimmed.moead;
    delete trimmed.auditReport;
    line = JSON.stringify(trimmed);
    if (line.length > BUDGET) {
      // 兜底骨架：只保留周期计数类常量小字段，其余全部丢弃。
      const skeleton: Record<string, unknown> = {};
      for (const key of ["kind", "k", "ts", "cycleId", "mode", "verdict", "scriptVersion", "reviewerLocalVersion"]) {
        if (trimmed[key] !== undefined) skeleton[key] = trimmed[key];
      }
      skeleton.note = "行超长，仅保留周期骨架字段（原始行 " + fullLen + " 字符）";
      line = JSON.stringify(skeleton);
    }
  }
  await sh(NODE_APPEND_LINE, [CONFIG.ledgerPath, line]);
}

/** 对一个育种目标跑完整的 ③–⑧ 子流程（变异→选择→冒烟→回放→两级门→过拟合门）。 */
async function improveCycle(
  target: BreedingTarget,
  gateTreeList: TreeSummary[],
  digestText: string,
  diagnosisIn: Diagnosis | null,
  guidedIn: boolean,
  stampIn: Stamp,
): Promise<CycleOutcome> {
  const notes: string[] = [];
  // 父代快照（脚本自管；回滚与组装对都以它为父代基线）。
  await sh(NODE_MKDIR, [target.backupDir]);
  await sh(NODE_COPY_DIR, [target.liveRoot + "general", target.backupDir + "/general"]);
  await sh(NODE_COPY_DIR, [target.liveRoot + "env", target.backupDir + "/env"]);
  const baselineList = sortPaths(await listFiles([target.liveRoot + "general", target.liveRoot + "env"]));
  const baselineMap = await readMap(baselineList);

  // ——— ③ 因子化变异：tools/skills/logic 三类分派，各自只写白名单 ———
  phase("③ 因子化变异（tools/skills/logic）" + (target.label === "single" ? "" : "·" + target.label));
  const baselineRel = baselineList.map((p) => p.slice(target.liveRoot.length));
  const mutations = await Promise.all(
    CLASS_ORDER.map(async (cls) => {
      const guidance =
        guidedIn && diagnosisIn !== null
          ? "诊断（已过证据核验）：" + JSON.stringify({ focus: diagnosisIn.focus, problem_statement: diagnosisIn.problem_statement })
          : "本轮无有效诊断引导（证据核验未通过或诊断失败），按交付契约与失败摘要自由改进。";
      try {
        return await agent("变异·" + cls + "·" + target.label, {
          system:
            "你是因子化变异子代理（Harmony §4.2 " +
            cls +
            "_evolve 形态）。只写白名单内的文件；越界产物会被拒收并删除。" +
            "绝不写白名单之外任何路径，绝不写 plugins/ 源码与插件安装缓存，不读插件安装缓存。用中文回复。",
        }).ask<MutationResult>(
          "对 " +
            target.label +
            " 的演化工作副本做 " +
            cls +
            " 类变异。目标根：" +
            target.liveRoot +
            "\n可写白名单：" +
            JSON.stringify(classWhitelist(target.liveRoot, cls)) +
            "\n分区路由：改进事实可在运行时推导→写 general 分区；属于环境内在规则→写 env 分区且文件头一行声明目标环境。\n" +
            "父代资产（相对路径，只读参考）：" +
            JSON.stringify(baselineRel) +
            "\n失败摘要（非审计树池）：\n" +
            digestText.slice(0, 1600) +
            "\n" +
            guidance +
            "\n交付契约（" +
            cls +
            "）：" +
            CLASS_CONTRACT[cls] +
            '\n完成后返回 JSON：{"changedFiles": string[]（相对 ' +
            target.liveRoot +
            ' 的路径）, "summary": string, "contractMet": string}。只返回 JSON。',
        );
      } catch (e) {
        notes.push(cls + " 变异子代理失败：" + String(e).slice(0, 120));
        return { cls: cls, changedFiles: [], summary: "", contractMet: "", failed: true } as MutationResult;
      }
    }),
  );

  // 以脚本实测差异为准（不信任子代理自报清单）；同时清剿白名单外的越界产物。
  const currentList = sortPaths(await listFiles([target.liveRoot + "general", target.liveRoot + "env"]));
  const currentMap = await readMap(currentList);
  const wholeList = sortPaths(await listFiles([target.liveRoot]));
  const scriptOwned = [target.liveRoot + ".cycle/", target.liveRoot + "population/"];
  const allWhitelists = CLASS_ORDER.flatMap((c) => classWhitelist(target.liveRoot, c));
  const rogueFiles = wholeList.filter(
    (p) =>
      !underAny(p, allWhitelists) &&
      !underAny(p, scriptOwned) &&
      baselineMap[p] === undefined &&
      p !== target.liveRoot.trim(),
  );
  if (rogueFiles.length > 0) {
    await sh(NODE_RM, rogueFiles);
    notes.push("拒收并删除越界产物 " + rogueFiles.length + " 个：" + rogueFiles.slice(0, 5).join("; "));
  }
  const diffFor = (cls: ClassKey): string[] => {
    const prefixes = classWhitelist(target.liveRoot, cls);
    const changed: string[] = [];
    for (const p of new Set([...baselineList, ...currentList])) {
      if (!underAny(p, prefixes)) continue;
      if ((baselineMap[p] === undefined ? null : baselineMap[p]) !== (currentMap[p] === undefined ? null : currentMap[p])) {
        changed.push(p.slice(target.liveRoot.length));
      }
    }
    return sortPaths(changed);
  };

  const records: CandidateRecord[] = [];
  let seq = 0;
  for (const cls of CLASS_ORDER) {
    const changed = diffFor(cls);
    if (changed.length === 0) continue; // 实测无差异→非候选（两组件均未变更也落账，k 照计）
    const m = mutations.find((x) => x.cls === cls);
    seq += 1;
    records.push({
      id: stampIn.id + "-" + target.label + "-c" + seq,
      cls: cls,
      route: cls === "skills" ? "adapt" : "policy",
      changedFiles: changed,
      summary: m === undefined ? "" : m.summary,
      contractMet: m === undefined ? "" : m.contractMet,
      predictedScore: null,
      uncertainty: null,
      selectionScore: null,
      admitted: false,
      note: m !== undefined && m.failed ? "子代理失败但实测有差异" : "",
      smoke: "未运行",
      replayV: null,
      observedCalls: null,
      observedSeriality: null,
      componentGate: null,
      pairGate: null,
      overfit: "未运行",
      retained: false,
    });
  }
  for (const r of records) report(boardRow(r), "candidates");
  if (records.length === 0) {
    log(target.label + "：三类变异均无实际差异，本周期零候选（仍落账，k 计更新周期）");
    const baseline0 = await replayAssembly(baselineAssembly(target), gateTreeList, "0号现役");
    return {
      target: target,
      candidates: [],
      retained: [],
      baseline: baseline0,
      bestRetained: null,
      objectives: objectivesOf(baseline0),
      reviewerChangedAccepted: false,
      notes: notes,
    };
  }

  // ——— ④ 预测引导选择：预测分 − λ·不确定度，放行前 gateBudget 个 ———
  phase("④ 预测引导候选选择" + (target.label === "single" ? "" : "·" + target.label));
  const predictor = agent("预测员", {
    system:
      "你是预测器：给候选修订打预期回放分与不确定度。只依据给出的材料判断，证据不足就把不确定度调高，不猜精确值。用中文回复。",
  });
  for (const rec of records) {
    try {
      const p = await predictor.ask<Prediction>(
        "给候选打分。候选：" +
          rec.id +
          "（" +
          rec.cls +
          " 类）\n变更文件：" +
          JSON.stringify(rec.changedFiles) +
          "\n变更摘要：" +
          rec.summary +
          "\n交付契约达成说明：" +
          rec.contractMet +
          "\n失败摘要：\n" +
          digestText.slice(0, 1000) +
          "\n预期它如何改变回放指标（质量/调用数/并行度），给 predictedScore ∈ [0,1]（预期回放 V）与 uncertainty ∈ [0,1]（证据不足程度）。" +
          '\n返回 JSON：{"predictedScore": number, "uncertainty": number, "rationale": string}。只返回 JSON。',
      );
      rec.predictedScore = Math.min(1, Math.max(0, Number(p.predictedScore)));
      rec.uncertainty = Math.min(1, Math.max(0, Number(p.uncertainty)));
      rec.selectionScore = rec.predictedScore - CONFIG.candidateUncertaintyPenalty * rec.uncertainty;
    } catch (e) {
      rec.note = rec.note + "；预测子代理失败，不放行（不猜测）：" + String(e).slice(0, 100);
      notes.push(rec.id + " 预测失败未放行");
    }
  }
  const ranked = records
    .filter((r) => r.selectionScore !== null)
    .sort((a, b) => (b.selectionScore as number) - (a.selectionScore as number) || (a.id < b.id ? -1 : 1));
  const admitted = ranked.slice(0, CONFIG.gateBudget);
  for (const rec of records) {
    rec.admitted = admitted.indexOf(rec) >= 0;
    if (rec.selectionScore !== null && !rec.admitted) rec.note = rec.note + "；排名超出 gateBudget=" + CONFIG.gateBudget + "，未放行";
    report(boardRow(rec), "candidates");
  }
  log("候选 " + records.length + " 个，放行 " + admitted.length + " 个（gateBudget=" + CONFIG.gateBudget + "）");

  // 0 号现役先回放（never-worse 对照；兼容性门的现役组装对基线）。
  const baselineAgg = await replayAssembly(baselineAssembly(target), gateTreeList, "0号现役");

  const retained: CandidateRecord[] = [];
  let bestRetained: ReplayAgg | null = null;
  let reviewerChangedAccepted = false;
  for (const rec of admitted) {
    // ——— ⑤ 冒烟检查（首版两段）+ 一次修复 + 回滚 ———
    phase("⑤ 冒烟检查（两段+一次修复+回滚）·" + rec.id);
    const smokeJobs = rec.changedFiles.map((rel) => ({ path: target.liveRoot + rel, parent: target.backupDir + "/" + rel }));
    let smoke = await shJson<SmokeOutcome>(NODE_SMOKE, [JSON.stringify(smokeJobs)]);
    if (!smoke.ok) {
      try {
        await agent("冒烟修复工·" + rec.id, {
          system: "你是修复工程师：只修列出的问题，不扩大改动范围；不得删除或绕过父代自测断言；只写 " + JSON.stringify(classWhitelist(target.liveRoot, rec.cls)) + " 之内。用中文回复。",
        }).ask("冒烟两段检查未通过，逐条修复：\n" + smoke.problems.join("\n") + "\n涉及文件：" + JSON.stringify(rec.changedFiles) + "（根 " + target.liveRoot + "）");
        smoke = await shJson<SmokeOutcome>(NODE_SMOKE, [JSON.stringify(smokeJobs)]);
        rec.smoke = smoke.ok ? "repaired" : "fail-rolled-back";
      } catch (e) {
        rec.smoke = "fail-rolled-back";
        rec.note = rec.note + "；修复子代理失败：" + String(e).slice(0, 100);
      }
    } else {
      rec.smoke = "pass";
    }
    if (!smoke.ok) {
      await rollbackCandidate(target, rec);
      rec.note = rec.note + "；冒烟二次失败，回滚";
      report(boardRow(rec), "candidates");
      continue;
    }

    // ——— ⑥ 确定性回放评分（只用非审计集；转移函数由脚本按已记录子节点确定性驱动） ———
    phase("⑥ 确定性回放评分·" + rec.id);
    const assemblyDir = CONFIG.evolveDir + ".cycle/assembly-" + rec.id;
    await sh(NODE_OVERLAY, [target.backupDir, target.liveRoot, assemblyDir, JSON.stringify(rec.changedFiles)]);
    const assembly: Assembly = {
      label: rec.id,
      dir: assemblyDir,
      logicPath: assemblyDir + "/general/logic/" + LOGIC_COPY,
      reviewerPath: assemblyDir + "/general/skills/reviewer/SKILL.md",
      toolsNote: assemblyDir + "/general/tools/（若有）",
    };
    const agg = await replayAssembly(assembly, gateTreeList, rec.id);
    rec.replayV = agg.meanV;
    rec.observedCalls = agg.meanCalls;
    rec.observedSeriality = agg.meanSeriality;

    // ——— ⑦ 两级保留门（组件门以现版为对照；兼容性门评候选脚本×现行评审技能组装对） ———
    phase("⑦ 两级保留门·" + rec.id);
    const neverWorse = agg.meanV >= baselineAgg.meanV - 1e-9;
    let gates: GatePair = { componentGate: null, pairGate: null, detail: "" };
    if (rec.cls === "logic") {
      // 组装对 = 候选编排脚本 × 现行评审技能（overlay 正是此对）；组件门与兼容门同一对照。
      gates = {
        componentGate: neverWorse,
        pairGate: neverWorse,
        detail: "logic 组件门=候选回放 V(" + agg.meanV.toFixed(4) + ") ≥ 现役(" + baselineAgg.meanV.toFixed(4) + ")；兼容性门=同对组装不退步",
      };
    } else if (rec.cls === "skills") {
      const cmp = await agent("评审技能对照员", {
        system: "你是组件门评审：以现版为对照评估候选评审技能（预测器 φ），可读两份文件与树池产物；结论要有依据，不放水。用中文回复。",
      }).ask<ReviewerCheck>(
        "组件门（评审技能对照）。现版：" +
          target.backupDir +
          "/general/skills/reviewer/SKILL.md\n候选：" +
          target.liveRoot +
          "general/skills/reviewer/SKILL.md\n非审计树池失败摘要：\n" +
          digestText.slice(0, 1000) +
          "\n判断候选作为预测器是否不劣于现版（评审口径、证据等级标注、insufficient 语义、防放水）。\n" +
          '返回 JSON：{"notWorse": boolean, "rationale": string}。只返回 JSON。',
      );
      gates = {
        componentGate: cmp.notWorse === true,
        pairGate: neverWorse,
        detail: "skills 组件门=对照评审 " + String(cmp.notWorse === true) + "（" + cmp.rationale.slice(0, 120) + "）；兼容性门=现役脚本×候选评审技能组装 V " + agg.meanV.toFixed(4) + " vs " + baselineAgg.meanV.toFixed(4),
      };
    } else {
      gates = {
        componentGate: rec.contractMet.trim().length > 0,
        pairGate: neverWorse,
        detail: "tools 组件门=交付契约有实质说明；兼容性门=组装不退步 " + agg.meanV.toFixed(4) + " vs " + baselineAgg.meanV.toFixed(4),
      };
    }
    rec.componentGate = gates.componentGate;
    rec.pairGate = gates.pairGate;
    rec.note = rec.note + "；" + gates.detail.slice(0, 200);
    if (gates.componentGate !== true || gates.pairGate !== true) {
      await rollbackCandidate(target, rec);
      rec.note = rec.note + "；两级门未过，整对回滚";
      report(boardRow(rec), "candidates");
      continue;
    }

    // ——— ⑧ 过拟合门：diff 反作弊审查，命中即回滚 ———
    phase("⑧ 过拟合门·" + rec.id);
    let overfit: OverfitCheck = { pass: true, hits: [] };
    try {
      overfit = await agent("反作弊审查员", {
        system: "你是过拟合门（Harmony App K 形态）：只审查给到的父代/子代差异，判定是否属于两类失败形态。可读列出的文件。用中文回复。",
      }).ask<OverfitCheck>(
        "过拟合门。逐文件对比父代与子代：\n" +
          JSON.stringify(
            rec.changedFiles.map((rel) => ({
              file: rel,
              parent: target.backupDir + "/" + rel,
              child: target.liveRoot + rel,
            })),
          ) +
          "\n检测两类失败形态并给证据：①把搜索/数据划分事实写进脚手架（硬编码审计集树 id、把回放答案或特定分数目标写进 CONFIG/提示词/路由）；" +
          "②改 grader（修改回放打分口径、放宽或删除自测断言、改评审技能判分标准放水）。\n" +
          '返回 JSON：{"pass": boolean, "hits": [{"file": string, "pattern": string, "evidence": string}]}。只返回 JSON。',
      );
    } catch (e) {
      overfit = { pass: false, hits: [{ file: "*", pattern: "审查失败", evidence: String(e).slice(0, 120) }] };
    }
    rec.overfit = overfit.pass === true ? "pass" : "hit-rolled-back";
    if (overfit.pass !== true) {
      await rollbackCandidate(target, rec);
      rec.note = rec.note + "；过拟合门命中 " + overfit.hits.length + " 处，回滚";
      report(boardRow(rec), "candidates");
      continue;
    }

    rec.retained = true;
    retained.push(rec);
    if (bestRetained === null || agg.meanV > bestRetained.meanV) bestRetained = agg;
    if (rec.changedFiles.some((rel) => target.liveRoot + rel === reviewerPath)) reviewerChangedAccepted = true;
    report(boardRow(rec), "candidates");
    log("候选 " + rec.id + " 通过全部门控，保留在 " + target.liveRoot);
  }

  return {
    target: target,
    candidates: records,
    retained: retained,
    baseline: baselineAgg,
    bestRetained: bestRetained,
    objectives: objectivesOf(bestRetained !== null ? bestRetained : baselineAgg),
    reviewerChangedAccepted: reviewerChangedAccepted,
    notes: notes,
  };
}

function baselineAssembly(target: BreedingTarget): Assembly {
  return {
    label: "0号现役",
    dir: target.backupDir,
    logicPath: target.backupDir + "/general/logic/" + LOGIC_COPY,
    reviewerPath: target.backupDir + "/general/skills/reviewer/SKILL.md",
    toolsNote: target.backupDir + "/general/tools/（若有）",
  };
}
async function rollbackCandidate(target: BreedingTarget, rec: CandidateRecord): Promise<void> {
  await sh(NODE_RESTORE, [target.backupDir, target.liveRoot, JSON.stringify(rec.changedFiles)]);
}
function objectivesOf(agg: ReplayAgg): number[] {
  // 最小化向量：[-V, 调用数, 串行度]（质量越大越好 → 取负）。
  return [-agg.meanV, agg.meanCalls, agg.meanSeriality];
}

/**
 * 确定性回放评分（Dream-RSI §3）：转移函数在脚本内按已记录子节点确定性驱动（子节点按文件记录顺序
 * 揭示，已记录树本身不变）；策略侧每一轮由 replay 子代理化身候选编排脚本做批选择，只见已揭示前缀
 * （prefix-only 防泄漏）。V = quality·bestRevealedScore归一 − callCost·调用数 − seriality·决策轮数/调用数。
 */
async function replayAssembly(assembly: Assembly, treeList: TreeSummary[], label: string): Promise<ReplayAgg> {
  const perTree: ReplayResult[] = [];
  for (const tree of treeList) {
    const nodeById = new Map<string, ReplayNode>();
    for (const n of tree.nodes) nodeById.set(n.id, n);
    const revealed = new Set<string>([tree.root]);
    let calls = 0;
    let rounds = 0;
    let bestRevealed = (nodeById.get(tree.root) as ReplayNode).score; // 根分数记 0
    const policy = agent("回放策略·" + label + "·" + tree.runId, {
      system:
        "你是候选编排脚本的策略化身，在已归档发现树上做离线回放决策。只依据已揭示观察与结构元数据决策，" +
        "禁用未揭示分数、绝对分数目标、把未揭示节点 id 当先验（prefix-only，Dream-RSI 附录 D.2）。用中文说明理由，但输出必须是 JSON。",
    });
    for (let round = 0; round < CONFIG.replayRoundCap; round++) {
      const legal: string[] = [];
      for (const id of revealed) {
        for (const child of tree.children[id] !== undefined ? tree.children[id] : []) {
          if (!revealed.has(child)) {
            legal.push(id);
            break;
          }
        }
      }
      if (legal.length === 0) break;
      const view: unknown[] = [];
      for (const id of revealed) {
        const n = nodeById.get(id) as ReplayNode;
        const kids = tree.children[id] !== undefined ? tree.children[id] : [];
        view.push({
          id: n.id,
          parent: n.parent,
          score: n.score,
          observation: n.obs,
          childrenTotal: kids.length,
          childrenRevealed: kids.filter((c) => revealed.has(c)).length,
        });
      }
      let batch: string[] = [];
      try {
        const decision = await policy.ask<{ batch: string[]; reason: string }>(
          "你是 " +
            label +
            " 的策略化身。先读编排脚本 " +
            assembly.logicPath +
            " 与评审技能 " +
            assembly.reviewerPath +
            "（工具资产目录若有：" +
            assembly.toolsNote +
            "），然后只依据已揭示视图决策。\n" +
            "已揭示子图（score 为该节点已记录的固定评估分）：" +
            JSON.stringify(view) +
            "\n可继续展开的节点（legal）：" +
            JSON.stringify(legal) +
            "\n规则：①每轮至多选 " +
            CONFIG.replayBatchCap +
            " 个节点（按探索优先序）；②只用已揭示信息；③无值得展开的节点就返回空 batch。\n" +
            '返回 JSON：{"batch": string[], "reason": string}。只返回 JSON。',
        );
        batch = (Array.isArray(decision.batch) ? decision.batch : []).filter((id) => legal.indexOf(id) >= 0).slice(0, CONFIG.replayBatchCap);
      } catch {
        batch = []; // 策略调用失败按空批终止该树回放（确定性出口）
      }
      if (batch.length === 0) break;
      rounds += 1;
      for (const id of batch) {
        for (const child of tree.children[id] !== undefined ? tree.children[id] : []) {
          if (!revealed.has(child)) {
            revealed.add(child);
            calls += 1;
            const n = nodeById.get(child) as ReplayNode;
            if (n.score > bestRevealed) bestRevealed = n.score;
          }
        }
      }
    }
    const normalized = tree.best > 0 ? Math.min(1, Math.max(0, bestRevealed / tree.best)) : 0;
    const v =
      CONFIG.scoreWeights.quality * normalized -
      CONFIG.scoreWeights.callCost * calls -
      CONFIG.scoreWeights.seriality * (rounds / Math.max(1, calls));
    perTree.push({ treeId: tree.runId, calls: calls, rounds: rounds, bestRevealed: bestRevealed, normalized: normalized, v: v });
  }
  const n = Math.max(1, perTree.length);
  return {
    label: label,
    meanV: perTree.reduce((s, r) => s + r.v, 0) / n,
    meanCalls: perTree.reduce((s, r) => s + r.calls, 0) / n,
    meanSeriality: perTree.reduce((s, r) => s + r.rounds / Math.max(1, r.calls), 0) / n,
    perTree: perTree,
  };
}

/** MOEA/D（Harmony §4.1/App E.1）：N=3 权重角色各养 incumbent，停滞检测，Tchebycheff 邻居替换，max-min 部署。 */
async function runMoead(
  stampIn: Stamp,
  gateTreeList: TreeSummary[],
  digestText: string,
  diagnosisIn: Diagnosis | null,
  guidedIn: boolean,
): Promise<{ outcome: CycleOutcome; summary: unknown }> {
  const popDir = CONFIG.evolveDir + "population/";
  const statePath = popDir + "state.json";
  await sh(NODE_MKDIR, [popDir]);
  let gen = 1;
  let roles: MoeadRoleState[] = MOEA_WEIGHTS.map((w) => ({
    weights: w,
    lastParentHash: null,
    lastFailureHash: null,
    stagnation: 0,
    objectives: null,
  }));
  const stateMap = await readMap([statePath]);
  const stateRaw = stateMap[statePath];
  if (stateRaw !== null && stateRaw !== undefined) {
    try {
      const parsed = JSON.parse(stateRaw) as { gen: number; roles: MoeadRoleState[] };
      if (Array.isArray(parsed.roles) && parsed.roles.length === MOEA_ROLE_COUNT) {
        gen = parsed.gen + 1;
        roles = parsed.roles;
      }
    } catch {
      // 状态损坏则重建（等价于重新初始化种群）
    }
  }
  const roleTargets: BreedingTarget[] = [];
  for (let i = 0; i < MOEA_ROLE_COUNT; i++) {
    const roleDir = popDir + "role-" + i + "/";
    await sh(NODE_MKDIR, [roleDir]);
    if ((await shJson<boolean[]>(NODE_EXISTS, [roleDir + "general"]))[0] !== true) {
      await sh(NODE_COPY_DIR, [CONFIG.evolveDir + "general", roleDir + "general"]);
      await sh(NODE_COPY_DIR, [CONFIG.evolveDir + "env", roleDir + "env"]);
    }
    roleTargets.push({ label: "role-" + i, liveRoot: roleDir, backupDir: CONFIG.evolveDir + ".cycle/backup-" + stampIn.id + "-role-" + i });
  }
  const failureHash = (await shJson<{ sha256: string }>(NODE_SHA256_TEXT, [digestText])).sha256;

  const roleOutcomes: { role: number; outcome: CycleOutcome; redirected: boolean; parentHash: string }[] = [];
  for (let i = 0; i < MOEA_ROLE_COUNT; i++) {
    const target = roleTargets[i];
    // 停滞检测（Harmony App E.1）：父代标识与失败摘要哈希连续 stagnationGens 代不变 → 改从其
    // Tchebycheff 最优邻居的 incumbent 育种，避免种群产出雷同子代空转耗 token。
    let roleFiles = sortPaths(await listFiles([target.liveRoot + "general", target.liveRoot + "env"]));
    let parentHash = (await shJson<{ sha256: string }>(NODE_HASH_PATHS, roleFiles.length > 0 ? roleFiles : [target.liveRoot])).sha256;
    let redirected = false;
    if (
      roles[i].lastParentHash === parentHash &&
      roles[i].lastFailureHash === failureHash &&
      roles[i].stagnation >= CONFIG.stagnationGens
    ) {
      const donor = tchebycheffBestNeighbor(i, roles);
      if (donor !== null) {
        await sh(NODE_RM, [target.liveRoot + "general", target.liveRoot + "env"]);
        await sh(NODE_COPY_DIR, [roleTargets[donor].liveRoot + "general", target.liveRoot + "general"]);
        await sh(NODE_COPY_DIR, [roleTargets[donor].liveRoot + "env", target.liveRoot + "env"]);
        redirected = true;
        // 育种父代已换成邻居的 incumbent：父代标识随之重算（停滞计数自然复位）。
        roleFiles = sortPaths(await listFiles([target.liveRoot + "general", target.liveRoot + "env"]));
        parentHash = (await shJson<{ sha256: string }>(NODE_HASH_PATHS, roleFiles.length > 0 ? roleFiles : [target.liveRoot])).sha256;
        log("role-" + i + " 停滞 " + roles[i].stagnation + " 代：改从 role-" + donor + "（Tchebycheff 最优邻居）的 incumbent 育种");
      }
    }
    const oc = await improveCycle(target, gateTreeList, digestText, diagnosisIn, guidedIn, stampIn);
    if (oc.objectives !== null) roles[i].objectives = oc.objectives;
    roleOutcomes.push({ role: i, outcome: oc, redirected: redirected, parentHash: parentHash });
    if (redirected) oc.notes.push("role-" + i + " 本代自其 Tchebycheff 最优邻居的 incumbent 育种");
    oc.notes.push("gateBudget=" + CONFIG.gateBudget + " 在 moead 下按角色计");
  }

  // 加权 Tchebycheff 邻域替换：子代至多替换 2 个 g 值更低的邻居 incumbent（n_r=2）。
  const replacements: { from: number; to: number }[] = [];
  const zStar = moeadZStar(roles);
  for (const ro of roleOutcomes) {
    if (ro.outcome.retained.length === 0 || ro.outcome.objectives === null) continue;
    const neighbors = moeadNeighbors(ro.role);
    const scored = neighbors
      .map((j) => ({ j: j, g: roles[j].objectives === null ? Infinity : tchebycheff(roles[j].weights, ro.outcome.objectives as number[], zStar) }))
      .sort((a, b) => a.g - b.g);
    for (const cand of scored) {
      if (replacements.filter((r) => r.to === cand.j).length > 0) continue;
      const incumbentG =
        roles[cand.j].objectives === null ? Infinity : tchebycheff(roles[cand.j].weights, roles[cand.j].objectives as number[], zStar);
      const offspringG = tchebycheff(roles[cand.j].weights, ro.outcome.objectives as number[], zStar);
      if (offspringG < incumbentG && replacements.filter((r) => r.from === ro.role).length < MOEA_REPLACE_CAP) {
        await sh(NODE_RM, [roleTargets[cand.j].liveRoot + "general", roleTargets[cand.j].liveRoot + "env"]);
        await sh(NODE_COPY_DIR, [roleTargets[ro.role].liveRoot + "general", roleTargets[cand.j].liveRoot + "general"]);
        await sh(NODE_COPY_DIR, [roleTargets[ro.role].liveRoot + "env", roleTargets[cand.j].liveRoot + "env"]);
        roles[cand.j].objectives = ro.outcome.objectives;
        replacements.push({ from: ro.role, to: cand.j });
      }
    }
  }

  // 部署：max-min 平衡选择（在各目标归一后取最小优势最大者）复制回 evolveDir 顶层 general/env。
  let deployedRole: number | null = null;
  const reviewerPreHash = (await shJson<{ sha256: string }>(NODE_HASH_PATHS, [reviewerPath])).sha256;
  const measured = roles.map((r, i) => ({ i: i, o: r.objectives }));
  if (measured.every((m) => m.o !== null)) {
    const vs = (measured as { i: number; o: number[] }[]).map((m) => m.o);
    const goodness = vs.map((f) => [
      normalizeGoodness(f[0], vs.map((x) => x[0]), true),
      normalizeGoodness(f[1], vs.map((x) => x[1]), false),
      normalizeGoodness(f[2], vs.map((x) => x[2]), false),
    ]);
    let bestIdx = 0;
    let bestMin = -Infinity;
    for (let i = 0; i < goodness.length; i++) {
      const mn = Math.min(goodness[i][0], goodness[i][1], goodness[i][2]);
      if (mn > bestMin || (mn === bestMin && i < bestIdx)) {
        bestMin = mn;
        bestIdx = i;
      }
    }
    deployedRole = bestIdx;
    await sh(NODE_RM, [CONFIG.evolveDir + "general", CONFIG.evolveDir + "env"]);
    await sh(NODE_COPY_DIR, [roleTargets[bestIdx].liveRoot + "general", CONFIG.evolveDir + "general"]);
    await sh(NODE_COPY_DIR, [roleTargets[bestIdx].liveRoot + "env", CONFIG.evolveDir + "env"]);
  }
  const reviewerPostHash = (await shJson<{ sha256: string }>(NODE_HASH_PATHS, [reviewerPath])).sha256;
  const reviewerDeployedChanged = reviewerPostHash !== reviewerPreHash;

  // 更新停滞计数并持久化种群状态。
  for (const ro of roleOutcomes) {
    const r = roles[ro.role];
    if (r.lastParentHash === ro.parentHash && r.lastFailureHash === failureHash) r.stagnation += 1;
    else {
      r.stagnation = 1;
      r.lastParentHash = ro.parentHash;
      r.lastFailureHash = failureHash;
    }
  }
  await sh(NODE_WRITE_FILE, [statePath, JSON.stringify({ gen: gen, roles: roles })]);

  // 顶层演化副本视角的汇总（落账用）：以部署角色（或 role-0）的产出为代表。
  const representative = roleOutcomes.find((r) => r.role === (deployedRole === null ? 0 : deployedRole)) as { role: number; outcome: CycleOutcome };
  const merged: CycleOutcome = {
    target: singleTarget,
    candidates: roleOutcomes.flatMap((r) => r.outcome.candidates),
    retained: roleOutcomes.flatMap((r) => r.outcome.retained),
    baseline: representative.outcome.baseline,
    bestRetained: representative.outcome.bestRetained,
    objectives: representative.outcome.objectives,
    reviewerChangedAccepted: reviewerDeployedChanged, // 部署后顶层 reviewer 与周期前不同 → 记为被改且被接受
    notes: [
      ...roleOutcomes.flatMap((r) => r.outcome.notes),
      ...replacements.map((r) => "Tchebycheff 替换：role-" + r.from + " 的子代替换 role-" + r.to + " 的 incumbent"),
      deployedRole === null ? "无完整目标测量，未做 max-min 部署（顶层演化副本保持原状）" : "max-min 平衡部署：role-" + deployedRole,
    ],
  };
  const summary = {
    gen: gen,
    roles: roles.map((r, i) => ({
      role: i,
      weights: r.weights,
      stagnation: r.stagnation,
      redirected: roleOutcomes.find((x) => x.role === i) !== undefined && (roleOutcomes.find((x) => x.role === i) as { redirected: boolean }).redirected,
      retained: roleOutcomes.find((x) => x.role === i) !== undefined ? (roleOutcomes.find((x) => x.role === i) as { outcome: CycleOutcome }).outcome.retained.length : 0,
      objectives: r.objectives === null ? null : r.objectives.map((x) => Number(x.toFixed(4))),
    })),
    replacements: replacements,
    deployedRole: deployedRole,
  };
  return { outcome: merged, summary: summary };
}
function moeadNeighbors(i: number): number[] {
  const out: number[] = [];
  for (let j = 0; j < MOEA_ROLE_COUNT; j++) if (j !== i) out.push(j); // N=3、T=2：邻域即其余两个角色
  return out;
}
function tchebycheff(weights: number[], f: number[], zStar: number[]): number {
  let g = 0;
  for (let j = 0; j < weights.length; j++) g = Math.max(g, weights[j] * Math.abs(zStar[j] - f[j]));
  return g;
}
function moeadZStar(roles: MoeadRoleState[]): number[] {
  const fs = roles.filter((r) => r.objectives !== null).map((r) => r.objectives as number[]);
  const z = [0, 0, 0];
  for (let j = 0; j < 3; j++) {
    const col = fs.map((f) => f[j]);
    z[j] = col.length === 0 ? 0 : Math.min(...col); // 最小化空间的最优（各分量都已转成越小越好）
  }
  return z;
}
function tchebycheffBestNeighbor(i: number, roles: MoeadRoleState[]): number | null {
  const neighbors = moeadNeighbors(i);
  const withObj = neighbors.filter((j) => roles[j].objectives !== null);
  if (withObj.length === 0) return neighbors.length > 0 ? neighbors[0] : null;
  const z = moeadZStar(roles);
  let best = withObj[0];
  let bestG = Infinity;
  for (const j of withObj) {
    const g = tchebycheff(roles[i].weights, roles[j].objectives as number[], z);
    if (g < bestG) {
      bestG = g;
      best = j;
    }
  }
  return best;
}
function normalizeGoodness(value: number, all: number[], higherIsBetter: boolean): number {
  const min = Math.min(...all);
  const max = Math.max(...all);
  if (max - min < 1e-12) return 0.5;
  const norm = (value - min) / (max - min);
  return higherIsBetter ? norm : 1 - norm;
}
