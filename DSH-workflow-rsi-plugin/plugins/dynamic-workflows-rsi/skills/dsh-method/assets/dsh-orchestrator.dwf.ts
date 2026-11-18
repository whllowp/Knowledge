// ============================================================================
// dsh-orchestrator.dwf.ts —— DSH 运行期编排模板：designer–executor 主循环
// ----------------------------------------------------------------------------
// 用法：把本文件复制到目标项目的 .zcode/workflows/ 目录（例如存为 dsh.dwf.ts），
//       只改下方 CONFIG 即可跑一个 scoped 任务。推荐骨架形状（全局勘察→并行施工
//       （双评审）→修复循环）写在 CONFIG.task 里，但相位不硬编码：每轮由 planner
//       子代理看着状态摘要产出一小批阶段子图（Stage Subgraph），分支与重试由下一轮
//       再规划涌现（DyFlow designer-centric 控制流）。
// 产出（全部在 CONFIG.artifactsDir 下，是改进期 dsh-rsi-replay 的输入，生产/消费
//       两侧与默认路径三层对齐）：
//   state.json           每轮落盘的黑板 M + 轮次元数据（断点恢复与人工排障锚点）
//   trees/<run-id>.json  发现树：每个子代理尝试一个节点 {id,parent,observation,score,
//                        snapshotRef}，根节点 parent:null 置于 nodes 首位（另在顶层附
//                        root 副本）；整树结束写元数据 outcome（轨迹级成败标签，含
//                        status/finalScore/summary 三必填字段）；节点行增量落盘于同目录
//                        <run-id>.nodes.jsonl 后由外部进程装配
//   ledger.jsonl         版本化反馈账本：每轮追加（预测, 观测, scriptVersion,
//                        评审器版本, route: policy|adapt）五元组
//   rounds/r<t>/*.json   每次尝试/评审的原始产物（树节点 snapshotRef 指向该目录）
// 硬约束（宿主运行时对三者直接抛错，见 dwfrun 运行时 __WorkflowDate/Math.random 桩）：
//   脚本主体禁用 Date.now()、无参 new Date()、Math.random()——时间戳与 run-id 一律经
//   world.run("node",["-e",…]) 在外部进程取得后回填；所有落盘同走该通道（宿主未提供
//   已证实的写文件 facade，本脚本不用）。模板字符串里要写字面量美元花括号时按
//   ${"$"} 转义法（草稿 :176 同款；本脚本未用到）。
// 编写表面与 DSH-插件研发草稿一致：agent/phase/log/report/artifact/world facade。
// ============================================================================

// ——— CONFIG：复制本模板后只需要改这一块 ———
const CONFIG = {
  /** scoped 示例任务：按推荐骨架形状撰写（勘察→并行施工（双评审）→修复循环），相位由 planner 涌现。 */
  task:
    "为 src/ 的公共 API 补齐文档：先全局勘察导出符号与文档缺口并列出清单，" +
    "再按模块并行补写（每个施工单元的产物由两名独立评审反驳式复核），" +
    "修复循环消化评审意见后生成 docs/public-api.md 索引（符号 → 文件:行），" +
    "验收 = 索引覆盖全部公共导出，且抽查条目与源码一致。",
  /** 任务作用域：子代理的读写都圈在此范围（交付物也写在这里）。 */
  scopeGlobs: ["src/**/*.ts", "src/**/*.tsx", "docs/**/*.md"],
  /** T_max：主循环轮数上限（终止出口一：轮数用尽）。 */
  maxRounds: 3,
  /** W：同波最大并行子代理数（按依赖分波，波内 Promise.all）。 */
  maxParallel: 4,
  /** 双评审：每个施工单元的每次尝试由几名独立反驳者评审。 */
  reviewersPerUnit: 2,
  /** 收敛判据：连续 refuteRounds 轮（每轮全部反驳者）反驳失败才算验证通过，之后才 fold。 */
  refuteRounds: 2,
  /** 运行产物根目录（state.json / trees/ / ledger.jsonl / rounds/ 都在这里）。 */
  artifactsDir: ".zcode/workflow-runs/dsh",
  /** 本编排模板自身的版本（改编本文件时递增）。 */
  scriptVersion: "0.1.0",
  /**
   * 插件契约版本 = dsh-rsi-loop 技能的当前版本（改该技能时同步改此值）。
   * 落账规则：若项目存在 .zcode/workflows/dsh-evolve/general/skills/reviewer/SKILL.md，
   * 则读其 frontmatter 的 version 字段（local 谱系）作为 ledger 行的评审器版本，否则记
   * 本值。两个版本的区分见 dsh-rsi-loop 技能 ② 节（插件契约谱系 vs evolveDir local 谱系）。
   */
  reviewerVersion: "0.1.0",
};

// ——— dsh-operators 的 11 算子菜单（子代理角色名 = <算子>·<节点键>，与此对齐） ———
const OPERATORS: string[] = [
  "GENERATE_PLAN",
  "DECOMPOSE_PROBLEM",
  "GENERATE_ANSWER",
  "REVIEW_SOLUTION",
  "REFINE_ANSWER",
  "GENERATE_CODE",
  "REFINE_CODE",
  "ORGANIZE_SOLUTION",
  "ENSEMBLE",
  "DEFAULT",
  "TERMINATE",
];
const OPERATOR_MENU: { op: string; use: string }[] = [
  { op: "GENERATE_PLAN", use: "为某个子问题制定或修订执行计划文本" },
  { op: "DECOMPOSE_PROBLEM", use: "把模糊问题拆成可并行派发的子问题清单" },
  { op: "GENERATE_ANSWER", use: "生成分析、结论、文档等非代码产物" },
  { op: "REVIEW_SOLUTION", use: "对 psi 声明的既有产物做独立评审并产出评审报告" },
  { op: "REFINE_ANSWER", use: "按反驳意见修订非代码产物（脚本修复循环自动派发）" },
  { op: "GENERATE_CODE", use: "编写或修改代码/配置产物" },
  { op: "REFINE_CODE", use: "按反驳意见修订代码产物（脚本修复循环自动派发）" },
  { op: "ORGANIZE_SOLUTION", use: "把多份已 fold 产物汇总组织成最终交付物" },
  { op: "ENSEMBLE", use: "对多视角/多候选产物聚合择优" },
  { op: "DEFAULT", use: "以上都不匹配的通用施工（勘察、摘要、清单等）" },
  { op: "TERMINATE", use: "不作为节点派发：终止只经 decision=terminate 表达" },
];
const OPERATOR_PERSONAS: { [op: string]: string } = {
  GENERATE_PLAN:
    "你是规划施工子代理（GENERATE_PLAN）：为指派子问题产出或修订可执行的计划/方案文本，计划落到具体文件与步骤，不写空话。输出严格 JSON。用中文。",
  DECOMPOSE_PROBLEM:
    "你是拆解施工子代理（DECOMPOSE_PROBLEM）：把指派问题拆成互不重叠、可并行派发的子问题清单，逐个给出边界与验收要点。输出严格 JSON。用中文。",
  GENERATE_ANSWER:
    "你是答案施工子代理（GENERATE_ANSWER）：生成分析、结论、文档等非代码产物；凡可文件化的交付物必须写入工作区文件，content 里给出路径与摘要。输出严格 JSON。用中文。",
  REVIEW_SOLUTION:
    "你是评审施工子代理（REVIEW_SOLUTION）：对 psi 指定的既有产物做独立评审，产出评审报告产物（可文件化则写入工作区）。输出严格 JSON。用中文。",
  REFINE_ANSWER:
    "你是修复施工子代理（REFINE_ANSWER）：按反驳意见逐条修订非代码产物。输出严格 JSON。用中文。",
  GENERATE_CODE:
    "你是代码施工子代理（GENERATE_CODE）：直接在工作区编写/修改代码与配置，自述里写明改动与验证方式。输出严格 JSON。用中文。",
  REFINE_CODE:
    "你是代码修复子代理（REFINE_CODE）：按反驳意见修订代码，逐条消化并自验证。输出严格 JSON。用中文。",
  ORGANIZE_SOLUTION:
    "你是汇总施工子代理（ORGANIZE_SOLUTION）：把多份已 fold 产物组织成最终交付物（写入工作区文件），与来源产物保持一致，不新增未经验证的内容。输出严格 JSON。用中文。",
  ENSEMBLE:
    "你是聚合施工子代理（ENSEMBLE）：对多视角/多候选产物做聚合择优，说明取舍依据。输出严格 JSON。用中文。",
  DEFAULT:
    "你是通用施工子代理（DEFAULT）：完成指派的杂项任务（勘察、摘要、清单等），如实报告做了什么。输出严格 JSON。用中文。",
  TERMINATE: "TERMINATE 不是可执行算子（终止只经 planner 决策表达，脚本会滤除该类节点）。",
};
const EVOLVE_REVIEWER_PATH = ".zcode/workflows/dsh-evolve/general/skills/reviewer/SKILL.md";

// ——— 外部进程一侧的一次性小程序（草稿 :8-9 JSON_CHECK_JS 同款模式，只进 world.run 参数） ———
// 开局引导：建产物目录树，取 run-id 与时间戳（主体禁 Date/random，故在外部进程取）。
const BOOTSTRAP_JS =
  'const fs=require("fs"),path=require("path"),c=require("crypto");const root=process.argv[1];' +
  'fs.mkdirSync(path.join(root,"trees"),{recursive:true});fs.mkdirSync(path.join(root,"rounds"),{recursive:true});' +
  'console.log(JSON.stringify({runId:"dsh-"+c.randomUUID(),ts:new Date().toISOString()}))';
// 整文件写入（先建父目录）；argv：目标路径、全文内容。
const WRITE_JS =
  'const fs=require("fs"),path=require("path");fs.mkdirSync(path.dirname(process.argv[1]),{recursive:true});' +
  'fs.writeFileSync(process.argv[1],process.argv[2],"utf8");console.log("wrote "+process.argv[1])';
// 追加一行（先建父目录）；argv：目标路径、一行内容。
const APPEND_JS =
  'const fs=require("fs"),path=require("path");fs.mkdirSync(path.dirname(process.argv[1]),{recursive:true});' +
  'fs.appendFileSync(process.argv[1],process.argv[2],"utf8");console.log("appended "+process.argv[1])';
// 取当前时间戳（外部进程的时钟）。
const NOW_JS = 'console.log(new Date().toISOString())';
// 读 evolveDir reviewer 技能 frontmatter 的 version 字段（local 谱系）；文件不存在输出空串。
// 正则允许并剥除可选引号——dsh-rsi-replay 的版本递增程序写入的是带引号形式（version: "0.1.1-local"），
// 两处词法保持同款，读回值才不会带引号脏数据。
const FRONTMATTER_VERSION_JS =
  'const fs=require("fs");let v="";try{const t=fs.readFileSync(process.argv[1],"utf8");' +
  'const m=t.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/);if(m){const vm=m[1].match(/^version:\\s*\"?([^\\s\"]+)\"?/m);if(vm)v=vm[1]}}catch(e){}console.log(v)';
// 装配发现树：节点行已增量落盘到 spill 文件（数据走文件不走命令行，避开命令行长度
// 限），本程序只收代码：读 spill 的 JSONL 节点 + argv 传入的头部/结局元数据 → 整树 JSON。
// 根节点按 dsh-rsi-loop ⑴节 schema 写进 nodes 数组首位（parent:null，创建顺序在前），
// 另在顶层附 root 对象副本（旧读取方的便利字段）；消费侧两种根形态都接受。
const TREE_BUILD_JS =
  'const fs=require("fs");const meta=JSON.parse(process.argv[1]);let nodes=[];' +
  'try{const t=fs.readFileSync(process.argv[2],"utf8");for(const ln of t.split("\\n")){const s=ln.trim();if(s)nodes.push(JSON.parse(s))}}catch(e){}' +
  'const root={id:"root",parent:null,observation:meta.task,score:0,snapshotRef:meta.snapshotRef,kind:"root"};' +
  'delete meta.snapshotRef;meta.root=root;meta.nodes=[root].concat(nodes);fs.writeFileSync(process.argv[3],JSON.stringify(meta,null,1),"utf8");' +
  'console.log("tree "+process.argv[3]+" nodes="+meta.nodes.length)';

// ——— 文本预算（world.run 参数走命令行，单次写入必须留在命令行长度限内） ———
const DIGEST_CHARS = 300; // 黑板/树/账本/报告里的观察摘要上限
const ATTEMPT_CHARS = 9000; // 单次尝试落盘的产物正文上限（全文以工作区产物为准）
const SPILL_CHUNK_CHARS = 8000; // 树节点增量落盘的单次分块上限（命令行长度约束）
const NODES_CAP = 12; // 单轮子图节点数上限（防 planner 一次派发过载）

// ——— 结果类型 ———
type EvidenceLevel = "E0" | "E1" | "E2" | "E3";
interface UnitResult {
  /** 产物键（必须等于节点键）。 */
  key: string;
  /** 产物自述：做了什么、改了/新建哪些文件、如何验证。 */
  content: string;
  /** 证据等级：E0 确定性规则/命令输出；E1 模型判断；E2 真实代码上的测试/构建；E3 外部实测。 */
  evidence: EvidenceLevel;
  /** 可选补充。 */
  note?: string;
}
interface Folded {
  key: string;
  operator: string;
  round: number;
  content: string;
  evidence: EvidenceLevel;
  note: string;
  attemptPath: string;
  reviewRoundsPassed: number;
  reviewers: number;
  foldedAt: string;
}
interface ReviewVerdict {
  verdict: "pass" | "refute";
  checked: string[];
  issues: string[];
}
interface UnconfirmedUnit {
  key: string;
  operator: string;
  round: number;
  reason: string;
  lastContentDigest: string;
  lastEvidence: EvidenceLevel;
  attemptPath: string;
}
interface StageNode {
  /** 本轮唯一的产物键（同时是节点 id 与黑板 M 的写入键），形如 r2-auth-module。 */
  id: string;
  /** 算子名，取自 OPERATORS 菜单。 */
  operator: string;
  /** φ：本节点细粒度简报（目标/边界/验收要点/产物写入哪个工作区文件）。 */
  phi: string;
  /** ψ：要从黑板 M 检索的输入键列表。 */
  psi: string[];
  /** 依赖的节点键：全部键 fold 后本节点才可执行。 */
  dependsOn: string[];
}
interface RoundPrediction {
  expectedFolds: number;
  expectedFirstPassRate: number;
  note: string;
}
interface RoundPlan {
  nodes: StageNode[];
  /** C_t：任务级终止条件的可验证判据。 */
  c_t: string;
  /** proceed=执行本子图；revise=状态有误立即重规划；terminate=C_t 已满足，终止。 */
  decision: "proceed" | "revise" | "terminate";
  rationale: string;
  prediction: RoundPrediction;
}
interface Term {
  kind: "max-rounds" | "planner" | "error";
  note: string;
}
interface TreeNode {
  id: string;
  parent: string | null;
  observation: string;
  score: number;
  snapshotRef: string;
  kind: string;
  attemptPath?: string;
}
interface TreeOutcome {
  /** 轨迹级成败标签（dsh-rsi-loop ⑴节 schema 的三态：success / failure / interrupted）。 */
  status: "success" | "failure" | "interrupted";
  /** ⑴节必填字段：轨迹终分（本实现 = 验证通过占比 folded/(folded+unconfirmed)，无产物记 0）。 */
  finalScore: number;
  /** ⑴节必填字段：一句话总结。 */
  summary: string;
  ts: string;
  roundsUsed: number;
  folded: number;
  unconfirmed: number;
  terminationKind: string;
  note: string;
  rule: string;
}
interface TreeFile {
  schema: string;
  runId: string;
  task: string;
  scriptVersion: string;
  startedAt: string;
  updatedAt: string;
  root: TreeNode;
  nodes: TreeNode[];
  outcome?: TreeOutcome;
}
interface RoundMeta {
  round: number;
  ts: string;
  decision: string;
  c_t: string;
  planned: string[];
  prediction: RoundPrediction;
  observation: { [k: string]: number | string | string[] };
}
interface Finding {
  where: string;
  what: string;
  status: "verified" | "unconfirmed";
  evidence: EvidenceLevel;
  note: string;
}

// ——— 运行态 ———
const M = new Map<string, Folded>(); // Global Memory Buffer：键值黑板，先检后并
const unconfirmed: UnconfirmedUnit[] = [];
const treePending: TreeNode[] = []; // 待增量落盘的树节点（每轮 flush 时写入 spill 文件）
const roundMeta: RoundMeta[] = [];
const stats = {
  attempts: 0, reviewPasses: 0, reviewRefutes: 0,
  firstReviewTotal: 0, firstReviewRefutes: 0, refineCycles: 0, foldsTotal: 0,
};
const roundStats = { attempts: 0, passes: 0, refutes: 0, folds: 0, unconfirmed: 0 };
let runId = "dsh-未引导";
let runTs = "unknown";
let treePath = ".zcode/workflow-runs/dsh/trees/unbootstrapped.json";
let treeSpillPath = ".zcode/workflow-runs/dsh/trees/unbootstrapped.nodes.jsonl";
let statePath = CONFIG.artifactsDir + "/state.json";
let ledgerPath = CONFIG.artifactsDir + "/ledger.jsonl";
let reportPath = CONFIG.artifactsDir + "/report-unbootstrapped.md";
let reviewerVersionUsed = CONFIG.reviewerVersion;
let reviewerSource = "contract（CONFIG.reviewerVersion）";
let termination: Term | null = null;
let ledgerPolicyLines = 0;
let ledgerAdaptLines = 0;

// ——— 进度看板（同步事件通道声明，用户全程可见；卡片随 report 移动） ———
artifact.board("units", {
  title: "DSH 编排：" + String(CONFIG.task).slice(0, 60),
  key: "nodeId",
  status: "status",
  columns: ["排队", "施工中", "评审中", "已fold", "未证实"],
  cardTitle: "nodeId",
  detail: [
    { field: "operator", label: "算子" },
    { field: "summary", label: "说明" },
  ],
});
log("DSH 编排启动：scriptVersion=" + CONFIG.scriptVersion + "，评审器契约版本=" + CONFIG.reviewerVersion);

// ——— 纯工具 ———
function clip(s: unknown, n: number): string {
  const t = s === null || s === undefined ? "" : String(s);
  return t.length <= n ? t : t.slice(0, n) + "…[截断至 " + n + " 字]";
}
function safeId(s: string): string {
  const t = String(s === null || s === undefined ? "" : s).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return t ? t.slice(0, 80) : "";
}
function roundDir(round: number): string {
  return CONFIG.artifactsDir + "/rounds/r" + round;
}
function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) if (typeof x === "string" && x) out.push(x);
  return out;
}
function treeAdd(
  id: string,
  parent: string | null,
  kind: string,
  observation: string,
  score: number,
  round: number,
  attemptPath?: string,
): void {
  const node: TreeNode = {
    id,
    parent,
    observation: clip(observation, DIGEST_CHARS),
    score,
    snapshotRef: roundDir(round),
    kind,
  };
  if (attemptPath) node.attemptPath = attemptPath;
  treePending.push(node);
}
function collectPsi(psi: string[]): string {
  const obj: { [k: string]: string } = {};
  for (const k of psi) {
    const f = M.get(k);
    if (f) obj[k] = "[" + f.operator + "/" + f.evidence + "] " + f.content + "（attempt：" + f.attemptPath + "）";
  }
  return JSON.stringify(obj);
}
function normalizeUnitResult(raw: unknown, fallbackKey: string): UnitResult {
  const r0: any = raw || {};
  const ev: EvidenceLevel =
    r0.evidence === "E0" || r0.evidence === "E1" || r0.evidence === "E2" || r0.evidence === "E3"
      ? r0.evidence
      : "E1";
  return {
    key: typeof r0.key === "string" && r0.key ? r0.key : fallbackKey,
    content: typeof r0.content === "string" ? r0.content : JSON.stringify(r0).slice(0, DIGEST_CHARS),
    evidence: ev,
    note: typeof r0.note === "string" ? r0.note : "",
  };
}
function normalizeVerdict(raw: unknown): ReviewVerdict {
  const r0: any = raw || {};
  return {
    verdict: r0.verdict === "pass" ? "pass" : "refute",
    checked: toStringArray(r0.checked).map((s) => clip(s, 200)),
    issues: toStringArray(r0.issues).map((s) => clip(s, 400)),
  };
}
function normalizePlan(raw: unknown, round: number): RoundPlan {
  const r0: any = raw || {};
  const nodes: StageNode[] = [];
  const seen = new Set<string>();
  const rawNodes: any[] = Array.isArray(r0.nodes) ? r0.nodes.slice(0, NODES_CAP) : [];
  for (let i = 0; i < rawNodes.length; i++) {
    const rn: any = rawNodes[i] || {};
    let id = safeId(typeof rn.id === "string" ? rn.id : "");
    if (!id) id = "r" + round + "-n" + (nodes.length + 1);
    if (id.indexOf("r" + round + "-") !== 0) id = "r" + round + "-" + id;
    if (seen.has(id)) id = id + "-" + (i + 1);
    seen.add(id);
    const op =
      typeof rn.operator === "string" && OPERATORS.indexOf(rn.operator) >= 0 ? rn.operator : "DEFAULT";
    if (op === "TERMINATE") continue; // 终止不是可执行算子，只经 decision 表达
    nodes.push({
      id,
      operator: op,
      phi: typeof rn.phi === "string" ? clip(rn.phi, 2000) : "",
      psi: toStringArray(rn.psi),
      dependsOn: toStringArray(rn.dependsOn),
    });
  }
  const pred: any = r0.prediction || {};
  return {
    nodes,
    c_t: typeof r0.c_t === "string" && r0.c_t ? clip(r0.c_t, 400) : "（planner 未给出 C_t）",
    decision:
      r0.decision === "revise" ? "revise" : r0.decision === "terminate" ? "terminate" : "proceed",
    rationale: typeof r0.rationale === "string" ? clip(r0.rationale, 600) : "",
    prediction: {
      expectedFolds: typeof pred.expectedFolds === "number" ? pred.expectedFolds : nodes.length,
      expectedFirstPassRate:
        typeof pred.expectedFirstPassRate === "number" ? pred.expectedFirstPassRate : 0.5,
      note: typeof pred.note === "string" ? clip(pred.note, 300) : "planner 未给出预测依据，记默认值",
    },
  };
}

// ——— 落盘（全部经 world.run("node",["-e",…])，无其他写通道） ———
async function writeTextFile(path: string, text: string): Promise<boolean> {
  try {
    const r = await world.run("node", ["-e", WRITE_JS, path, text]);
    if (r.exitCode !== 0) {
      log("写入失败 " + path + "：" + clip(r.stderr || r.stdout, 200));
      return false;
    }
    return true;
  } catch (e) {
    log("写入异常 " + path + "：" + clip(String(e), 200));
    return false;
  }
}
async function appendTextLine(path: string, line: string): Promise<boolean> {
  try {
    const r = await world.run("node", ["-e", APPEND_JS, path, line]);
    if (r.exitCode !== 0) {
      log("追加失败 " + path + "：" + clip(r.stderr || r.stdout, 200));
      return false;
    }
    return true;
  } catch (e) {
    log("追加异常 " + path + "：" + clip(String(e), 200));
    return false;
  }
}
async function nowIso(): Promise<string> {
  try {
    const r = await world.run("node", ["-e", NOW_JS]);
    if (r.exitCode === 0) return r.stdout.trim();
  } catch {
    // 外部时钟不可用时记 unknown，不阻塞主流程
  }
  return "unknown";
}
function treeRootMeta(ts: string): { [k: string]: unknown } {
  return {
    schema: "dsh-discovery-tree/1",
    runId,
    task: clip(CONFIG.task, DIGEST_CHARS),
    scriptVersion: CONFIG.scriptVersion,
    startedAt: runTs,
    updatedAt: ts,
    snapshotRef: CONFIG.artifactsDir,
  };
}
async function flushTree(ts: string, outcome?: TreeOutcome): Promise<boolean> {
  // 第一步：把本轮新节点按块增量追加进 spill 文件（数据走文件，不走命令行）
  let spillOk = true;
  while (treePending.length > 0) {
    const chunk: TreeNode[] = [];
    let size = 0;
    while (treePending.length > 0) {
      const lineLen = JSON.stringify(treePending[0]).length + 1;
      if (size > 0 && size + lineLen > SPILL_CHUNK_CHARS) break;
      const n = treePending.shift();
      if (n === undefined) break;
      chunk.push(n);
      size += lineLen;
    }
    if (chunk.length > 0) {
      const lines = chunk.map((n) => JSON.stringify(n)).join("\n") + "\n";
      if (!(await appendTextLine(treeSpillPath, lines))) spillOk = false;
    }
  }
  // 第二步：外部进程装配整树 JSON（含根节点与可选 outcome 元数据）
  const meta = treeRootMeta(ts);
  if (outcome) meta.outcome = outcome;
  try {
    const r = await world.run("node", ["-e", TREE_BUILD_JS, JSON.stringify(meta), treeSpillPath, treePath]);
    if (r.exitCode !== 0) {
      log("发现树装配失败：" + clip(r.stderr || r.stdout, 200));
      return false;
    }
    return spillOk;
  } catch (e) {
    log("发现树装配异常：" + clip(String(e), 200));
    return false;
  }
}
function buildState(round: number, ts: string, outcome?: TreeOutcome): string {
  const m: { [k: string]: Folded } = {};
  M.forEach((v, k) => {
    m[k] = v;
  });
  const state = {
    schema: "dsh-state/1",
    runId,
    scriptVersion: CONFIG.scriptVersion,
    reviewerVersion: { contract: CONFIG.reviewerVersion, used: reviewerVersionUsed, source: reviewerSource },
    task: CONFIG.task,
    config: {
      scopeGlobs: CONFIG.scopeGlobs,
      maxRounds: CONFIG.maxRounds,
      maxParallel: CONFIG.maxParallel,
      reviewersPerUnit: CONFIG.reviewersPerUnit,
      refuteRounds: CONFIG.refuteRounds,
    },
    round,
    updatedAt: ts,
    termination,
    outcome: outcome === undefined ? null : outcome,
    M: m,
    unconfirmed,
    rounds: roundMeta,
    artifacts: { state: statePath, tree: treePath, ledger: ledgerPath, report: reportPath },
    resumeHint:
      "断点恢复锚点：以 M/unconfirmed 为现场。可把 CONFIG.task 改写为续跑指令重跑本工作流，或按 rounds 元数据人工排障。",
  };
  return JSON.stringify(state, null, 1);
}
async function flushRound(round: number, plan: RoundPlan): Promise<void> {
  const ts = await nowIso();
  const observation: { [k: string]: number | string | string[] } = {
    plannedUnits: plan.nodes.length,
    folds: roundStats.folds,
    unconfirmed: roundStats.unconfirmed,
    attempts: roundStats.attempts,
    reviewPasses: roundStats.passes,
    reviewRefutes: roundStats.refutes,
    foldedTotal: M.size,
  };
  roundMeta.push({
    round,
    ts,
    decision: plan.decision,
    c_t: clip(plan.c_t, 300),
    planned: plan.nodes.map((n) => n.id),
    prediction: plan.prediction,
    observation,
  });
  await writeTextFile(statePath, buildState(round, ts));
  await flushTree(ts);
  const ok = await appendTextLine(
    ledgerPath,
    JSON.stringify({
      ts,
      runId,
      round,
      route: "policy",
      scriptVersion: CONFIG.scriptVersion,
      reviewerVersion: reviewerVersionUsed,
      prediction: plan.prediction,
      observation,
    }) + "\n",
  );
  if (ok) ledgerPolicyLines += 1;
  log(
    "第 " + round + " 轮落盘：state.json、trees/" + runId + ".json、ledger(policy)。" +
      "fold " + roundStats.folds + "、未证实 " + roundStats.unconfirmed,
  );
}
async function resolveReviewerVersion(): Promise<void> {
  try {
    const r = await world.run("node", ["-e", FRONTMATTER_VERSION_JS, EVOLVE_REVIEWER_PATH]);
    if (r.exitCode === 0) {
      const v = r.stdout.trim();
      if (v) {
        reviewerVersionUsed = v;
        reviewerSource = "evolveDir-local：" + EVOLVE_REVIEWER_PATH;
        return;
      }
    }
    log("evolveDir reviewer 不存在或无 version 字段，评审器版本记插件契约版本 " + CONFIG.reviewerVersion);
  } catch (e) {
    log("评审器版本解析失败，记插件契约版本：" + clip(String(e), 200));
  }
  reviewerVersionUsed = CONFIG.reviewerVersion;
  reviewerSource = "contract（CONFIG.reviewerVersion）";
}
async function bootstrap(): Promise<void> {
  const boot = await world.run("node", ["-e", BOOTSTRAP_JS, CONFIG.artifactsDir]);
  if (boot.exitCode !== 0) {
    throw new Error("产物目录引导失败：" + clip(boot.stderr || boot.stdout, 300));
  }
  const info = JSON.parse(boot.stdout.trim());
  runId = String(info.runId);
  runTs = String(info.ts);
  treePath = CONFIG.artifactsDir + "/trees/" + runId + ".json";
  treeSpillPath = CONFIG.artifactsDir + "/trees/" + runId + ".nodes.jsonl";
  statePath = CONFIG.artifactsDir + "/state.json";
  ledgerPath = CONFIG.artifactsDir + "/ledger.jsonl";
  reportPath = CONFIG.artifactsDir + "/report-" + runId + ".md";
  await resolveReviewerVersion();
  log("run " + runId + " @ " + runTs + "；落账评审器版本：" + reviewerVersionUsed + "（" + reviewerSource + "）");
}

// ——— 固定角色：summarizer（f_summary）与 planner（designer） ———
const summarizer = agent("DEFAULT·summarizer", {
  system:
    "你是 DSH 编排的状态压缩器 f_summary：把黑板与错误日志压缩成 planner 可用的状态摘要 z_t。只陈述事实，保留未决问题，不超过 300 字。用中文。",
});
const planner = agent("GENERATE_PLAN·planner", {
  system:
    "你是 DSH 编排的 designer（GENERATE_PLAN）：每轮只产出一小批带依赖、可并行的阶段子图节点（Stage Subgraph，节点形如 {id,operator,phi,psi,dependsOn}），附任务级终止条件 C_t 与 proceed/revise/terminate 决策。分支与重试不由你一次写死——它们由下一轮再规划涌现。节点要小、可用、可验证。输出严格 JSON。用中文。",
});

async function summarize(round: number): Promise<string> {
  const board: string[] = [];
  M.forEach((v, k) => board.push(k + " [" + v.operator + "/" + v.evidence + "] " + clip(v.content, 120)));
  const prompt =
    "第 " + round + " 轮状态压缩。任务：" + CONFIG.task +
    "\n黑板 M 已 fold 键：\n" + (board.length ? "- " + board.join("\n- ") : "-（空）") +
    "\n未证实单元：" + (unconfirmed.length ? unconfirmed.map((u) => u.key + "（" + u.reason + "）").join("；") : "无") +
    "\n历史轮决策：" + (roundMeta.map((r) => "r" + r.round + ":" + r.decision).join(" → ") || "无") +
    "\n输出 z_t：当前进展（3 条以内）+ 未决问题（3 条以内）+ 下一步最值得派发的一件事。";
  try {
    const z = await summarizer.ask<string>(prompt);
    return clip(z, 1500);
  } catch {
    return (
      "摘要子代理失败，退化为机械摘要：已 fold " + M.size + " 键（" + Array.from(M.keys()).join(",") +
      "）；未证实 " + unconfirmed.length + " 条。"
    );
  }
}

async function planRound(round: number, z: string, extra?: string): Promise<RoundPlan> {
  const menu = OPERATOR_MENU.map((m) => m.op + "=" + m.use).join("；");
  const keys = Array.from(M.keys());
  const prompt =
    "第 " + round + "/" + CONFIG.maxRounds + " 轮规划。任务：" + CONFIG.task +
    "\n作用域 globs：" + CONFIG.scopeGlobs.join(", ") +
    "\n状态摘要 z_t：" + z +
    "\n黑板 M 可用键：" + (keys.length ? keys.join(", ") : "（空）") +
    "\n未证实单元：" + (unconfirmed.length ? unconfirmed.map((u) => u.key).join(", ") : "无") +
    "\n算子菜单（operator 只能取这 11 个）：" + menu +
    "\n并行度 W=" + CONFIG.maxParallel + "；每个施工单元将由 " + CONFIG.reviewersPerUnit +
    " 名独立反驳者评审，连续 " + CONFIG.refuteRounds + " 轮零反驳才并入黑板（评审由脚本内置，你不用派评审节点）。" +
    (extra ? "\n补充：" + extra : "") +
    "\n输出 JSON（RoundPlan）：\n" +
    '{"nodes":[{"id":"r' + round + '-<短横线小写slug>","operator":"<菜单算子>","phi":"本节点简报：目标/边界/验收要点/产物写入哪个工作区文件","psi":["要读的 M 键"],"dependsOn":["依赖的节点键，全部 fold 后才执行"]}],' +
    '"c_t":"任务级终止条件的可验证判据","decision":"proceed 或 revise 或 terminate","rationale":"决策理由（terminate 必须说明 C_t 为何已满足）",' +
    '"prediction":{"expectedFolds":<本轮预计 fold 数>,"expectedFirstPassRate":<0 到 1 之间，首轮评审通过率预测>,"note":"预测依据"}}\n' +
    "约束：id 唯一且以 r" + round + "- 开头；dependsOn 只能引用 M 已有键或本轮更早节点；节点数不超过 " + NODES_CAP +
    "；TERMINATE 不作为节点派发；revise 只在状态摘要有误时使用。";
  const raw = await planner.ask<RoundPlan>(prompt);
  return normalizePlan(raw, round);
}

// ——— 施工单元生命周期：produce → refute until convergence → fold / unconfirmed ———
async function produceAttempt(
  n: StageNode,
  round: number,
  attemptNo: number,
  inputs: string,
  issues: string[],
): Promise<{ result: UnitResult; path: string }> {
  const isRefine = attemptNo > 1;
  const op = isRefine ? (n.operator === "GENERATE_CODE" ? "REFINE_CODE" : "REFINE_ANSWER") : n.operator;
  stats.attempts += 1;
  roundStats.attempts += 1;
  report(
    { nodeId: n.id, operator: op, status: "施工中", summary: "第 " + attemptNo + " 次尝试施工" },
    "units",
  );
  const persona = OPERATOR_PERSONAS[n.operator] || OPERATOR_PERSONAS.DEFAULT;
  const actor = agent(op + "·" + n.id + (isRefine ? "-a" + attemptNo : ""), { system: persona });
  const prompt =
    "节点 " + n.id + "（算子 " + op + "）施工" + (isRefine ? "（第 " + attemptNo + " 次尝试：逐条消化反驳意见）" : "") + "。\n" +
    "任务总目标：" + CONFIG.task +
    "\n作用域：" + CONFIG.scopeGlobs.join(", ") + "（读写不得越出作用域；交付物写入 phi 指定的工作区文件）" +
    "\nφ（本节点简报）：" + n.phi +
    "\nψ（黑板输入，键到摘要）：\n" + inputs +
    (issues.length ? "\n反驳意见（逐条消化并在自述中说明如何解决）：\n- " + issues.join("\n- ") : "") +
    "\n输出 JSON（UnitResult）：{\"key\":\"" + n.id + "\",\"content\":\"产物自述：做了什么、改了/新建了哪些文件、如何验证\"," +
    "\"evidence\":\"E0 或 E1 或 E2 或 E3\",\"note\":\"可选补充\"}" +
    "\nevidence 分级：E0=确定性规则/命令输出直接支撑；E1=模型自身判断；E2=在真实代码上跑过测试/构建等高保真验证；E3=外部系统实测反馈。";
  const raw = await actor.ask<UnitResult>(prompt);
  const result = normalizeUnitResult(raw, n.id);
  const payload = {
    runId,
    round,
    nodeId: n.id,
    operator: op,
    attempt: attemptNo,
    kind: isRefine ? "refine" : "produce",
    phi: clip(n.phi, 1000),
    issues: issues.map((s) => clip(s, 400)),
    result: {
      key: result.key,
      evidence: result.evidence,
      note: clip(result.note === undefined ? "" : result.note, 500),
      content: clip(result.content, ATTEMPT_CHARS),
    },
  };
  const path = roundDir(round) + "/" + (safeId(n.id) || "node") + "-a" + attemptNo + ".json";
  await writeTextFile(path, JSON.stringify(payload, null, 1));
  return { result, path };
}

async function reviewOnce(
  n: StageNode,
  round: number,
  attemptNo: number,
  idx: number,
  current: UnitResult,
): Promise<ReviewVerdict> {
  const reviewer = agent("REVIEW_SOLUTION·" + n.id + "-a" + attemptNo + "-rev" + idx, {
    system:
      "你是 DSH 编排的独立反驳式评审员（REVIEW_SOLUTION）：任务是证明产物有问题。可以读仓库与运行只读命令核实，绝不编辑任何文件。反驳必须可执行（指明错在哪、怎么改）；核对过的事项要列出；宁可漏过也不捏造问题。输出严格 JSON。用中文。",
  });
  try {
    const v = await reviewer.ask<ReviewVerdict>(
      "评审节点 " + n.id + "（算子 " + n.operator + "）第 " + attemptNo + " 次尝试的产物。\n" +
      "节点验收要点 φ：" + clip(n.phi, 1200) + "\n" +
      "产物自述（施工者声明证据等级 " + current.evidence + "，请对其提到的文件与命令实际抽查）：\n" +
      clip(current.content, 4000) + "\n" +
      "输出 JSON（ReviewVerdict）：{\"verdict\":\"pass 或 refute\",\"checked\":[\"核对过的事项\"],\"issues\":[\"refute 时的可执行修改意见\"]}。" +
      "pass 的条件：抽查核实后找不到会造成错误结果的问题。",
    );
    return normalizeVerdict(v);
  } catch (e) {
    // 评审子代理不可用 = 该产物未获验证：保守按 refute 处理（先检后并的保守面）
    return { verdict: "refute", checked: [], issues: ["评审子代理失败，保守视为未通过：" + clip(String(e), 200)] };
  }
}

async function reviewRound(
  n: StageNode,
  round: number,
  attemptNo: number,
  current: UnitResult,
): Promise<ReviewVerdict[]> {
  const verdicts = await Promise.all(
    Array.from({ length: CONFIG.reviewersPerUnit }, (_, i) => reviewOnce(n, round, attemptNo, i + 1, current)),
  );
  for (const v of verdicts) {
    if (v.verdict === "refute") {
      stats.reviewRefutes += 1;
      roundStats.refutes += 1;
    } else {
      stats.reviewPasses += 1;
      roundStats.passes += 1;
    }
  }
  const path = roundDir(round) + "/" + (safeId(n.id) || "node") + "-a" + attemptNo + "-review.json";
  await writeTextFile(
    path,
    JSON.stringify(
      { runId, round, nodeId: n.id, attempt: attemptNo, verdicts },
      null,
      1,
    ),
  );
  return verdicts;
}

function fold(n: StageNode, round: number, bundle: { result: UnitResult; path: string }, streak: number): void {
  stats.foldsTotal += 1;
  roundStats.folds += 1;
  const key = bundle.result.key || n.id;
  M.set(key, {
    key,
    operator: n.operator,
    round,
    content: clip(bundle.result.content, DIGEST_CHARS),
    evidence: bundle.result.evidence,
    note: clip(bundle.result.note === undefined ? "" : bundle.result.note, DIGEST_CHARS),
    attemptPath: bundle.path,
    reviewRoundsPassed: streak,
    reviewers: CONFIG.reviewersPerUnit,
    foldedAt: "r" + round,
  });
  report(
    {
      nodeId: n.id,
      operator: n.operator,
      status: "已fold",
      summary: "连续 " + streak + " 轮零反驳，键 " + key + " 并入黑板",
    },
    "units",
  );
}

function registerUnconfirmed(
  n: StageNode,
  round: number,
  reason: string,
  last: { result: UnitResult; path: string } | null,
): void {
  roundStats.unconfirmed += 1;
  unconfirmed.push({
    key: n.id,
    operator: n.operator,
    round,
    reason: clip(reason, 300),
    lastContentDigest: last ? clip(last.result.content, DIGEST_CHARS) : "",
    lastEvidence: last ? last.result.evidence : "E1",
    attemptPath: last ? last.path : "",
  });
  report({ nodeId: n.id, operator: n.operator, status: "未证实", summary: clip(reason, 120) }, "units");
}

async function execNode(n: StageNode, round: number): Promise<void> {
  const inputs = collectPsi(n.psi);
  const refineCap = CONFIG.refuteRounds + 2; // 生成 1 次 + 修复上限，防无界循环
  let attemptNo = 1;
  let bundle: { result: UnitResult; path: string } | null = null;
  try {
    bundle = await produceAttempt(n, round, attemptNo, inputs, []);
  } catch (e) {
    registerUnconfirmed(n, round, "施工子代理失败：" + clip(String(e), 200), null);
    return;
  }
  let refuteStreak = 0;
  while (bundle !== null) {
    report(
      {
        nodeId: n.id,
        operator: n.operator,
        status: "评审中",
        summary: "第 " + attemptNo + " 次尝试进入 " + CONFIG.reviewersPerUnit + " 人反驳评审",
      },
      "units",
    );
    const verdicts = await reviewRound(n, round, attemptNo, bundle.result);
    const refutes = verdicts.filter((v) => v.verdict === "refute").length;
    if (attemptNo === 1) {
      stats.firstReviewTotal += 1;
      if (refutes > 0) stats.firstReviewRefutes += 1;
    }
    if (refutes === 0) refuteStreak += 1;
    else {
      refuteStreak = 0;
      stats.refineCycles += 1;
    }
    const attemptId = n.id + "-a" + attemptNo;
    treeAdd(
      attemptId,
      "r" + round + "-planner",
      "attempt",
      n.operator + " 第 " + attemptNo + " 次尝试（自报证据 " + bundle.result.evidence + "）：" + bundle.result.content,
      verdicts.length > 0 ? 1 - refutes / verdicts.length : 0,
      round,
      bundle.path,
    );
    for (let i = 0; i < verdicts.length; i++) {
      const v = verdicts[i];
      treeAdd(
        attemptId + "-rev" + (i + 1),
        attemptId,
        "review",
        (v.verdict === "pass" ? "反驳失败（pass）；核对：" : "反驳成立（refute）；意见：") +
          (v.issues.join("；") || v.checked.join("；")),
        v.verdict === "pass" ? 1 : 0,
        round,
      );
    }
    if (refutes === 0 && refuteStreak >= CONFIG.refuteRounds) {
      fold(n, round, bundle, refuteStreak); // 先检后并：收敛后才 fold
      return;
    }
    if (attemptNo >= refineCap) {
      registerUnconfirmed(n, round, "修复预算用尽（共 " + refineCap + " 次尝试）仍未通过反驳评审", bundle);
      return;
    }
    const issues: string[] = [];
    for (const v of verdicts) for (const s of v.issues) issues.push(s);
    attemptNo += 1;
    try {
      bundle = await produceAttempt(n, round, attemptNo, inputs, issues); // 打回 REFINE
    } catch (e) {
      registerUnconfirmed(n, round, "修复子代理失败：" + clip(String(e), 200), bundle);
      return;
    }
  }
}

async function executeSubgraph(nodes: StageNode[], round: number): Promise<void> {
  const pending = nodes.slice();
  while (pending.length > 0) {
    const ready = pending.filter((n) => n.dependsOn.every((d) => M.has(d)));
    if (ready.length === 0) {
      for (const n of pending) {
        const missing = n.dependsOn.filter((d) => !M.has(d));
        registerUnconfirmed(n, round, "依赖未满足（未 fold）：" + missing.join(", "), null);
      }
      break;
    }
    const batch = ready.slice(0, CONFIG.maxParallel);
    await Promise.all(batch.map((n) => execNode(n, round))); // 同波并行执行，波间屏障
    for (const n of batch) {
      const i = pending.indexOf(n);
      if (i >= 0) pending.splice(i, 1);
    }
  }
}

// ——— 主循环：f_summary → designer 子图 → 并行执行 → 落盘（每轮） ———
async function runLoop(): Promise<void> {
  for (let round = 1; round <= CONFIG.maxRounds; round++) {
    phase("第 " + round + "/" + CONFIG.maxRounds + " 轮：f_summary 压缩状态 → designer 规划阶段子图");
    roundStats.attempts = 0;
    roundStats.passes = 0;
    roundStats.refutes = 0;
    roundStats.folds = 0;
    roundStats.unconfirmed = 0;
    const z = await summarize(round);
    treeAdd(
      "r" + round + "-summarizer",
      round === 1 ? "root" : "r" + (round - 1) + "-planner",
      "summary",
      z,
      0,
      round,
    );
    let plan = await planRound(round, z);
    treeAdd(
      "r" + round + "-planner",
      "r" + round + "-summarizer",
      "plan",
      "决策 " + plan.decision + "；C_t：" + plan.c_t + "；节点：" + plan.nodes.map((n) => n.id).join(", "),
      plan.nodes.length > 0 ? 1 : 0,
      round,
    );
    report({
      round,
      decision: plan.decision,
      nodes: plan.nodes.map((n) => n.id + ":" + n.operator),
      c_t: plan.c_t,
      prediction: plan.prediction,
    });
    if (plan.decision === "terminate") {
      termination = { kind: "planner", note: "planner 判定 C_t 已满足：" + clip(plan.rationale || plan.c_t, 300) };
      await flushRound(round, plan);
      break;
    }
    if (plan.decision === "revise") {
      plan = await planRound(round, z, "你上一份计划被判 revise。请这次直接给出 proceed（附修正后的子图）或 terminate。");
      if (plan.decision === "revise") plan.decision = "proceed"; // 有界：二连 revise 按推进处理，评审门兜底
      treeAdd(
        "r" + round + "-planner-2",
        "r" + round + "-planner",
        "plan",
        "revise 后重规划：决策 " + plan.decision + "；节点：" + plan.nodes.map((n) => n.id).join(", "),
        plan.nodes.length > 0 ? 1 : 0,
        round,
      );
      report({ round, decision: plan.decision + "（revise 后重规划）", nodes: plan.nodes.map((n) => n.id) });
      if (plan.decision === "terminate") {
        termination = { kind: "planner", note: "revise 后判定 C_t 已满足：" + clip(plan.rationale || plan.c_t, 300) };
        await flushRound(round, plan);
        break;
      }
    }
    if (plan.nodes.length === 0) {
      termination = { kind: "planner", note: "planner 派发空批（选空批即停）：" + clip(plan.rationale, 200) };
      await flushRound(round, plan);
      break;
    }
    phase(
      "第 " + round + "/" + CONFIG.maxRounds + " 轮：按依赖并行执行（W=" + CONFIG.maxParallel + "，先检后并）",
    );
    for (const n of plan.nodes) {
      report({ nodeId: n.id, operator: n.operator, status: "排队", summary: clip(n.phi, 120) }, "units");
    }
    await executeSubgraph(plan.nodes, round);
    await flushRound(round, plan);
  }
  if (termination === null) {
    termination = {
      kind: "max-rounds",
      note: "T_max（" + CONFIG.maxRounds + " 轮）用尽，planner 未判定 C_t 满足",
    };
  }
}

// ——— 驱动：终止三出口之一在此汇合（max-rounds / planner terminate / 不可恢复错误） ———
try {
  await bootstrap();
  await runLoop();
} catch (e) {
  termination = {
    kind: "error",
    note: "不可恢复错误（终止出口三）：" + clip(String(e && e.message ? e.message : e), 400),
  };
}

// ——— 收尾：轨迹级成败标签 + 终局落盘 + 结果发布 ———
const roundsUsed = roundMeta.length;
const outcomeStatus: "success" | "failure" | "interrupted" =
  termination.kind === "error"
    ? "interrupted"
    : termination.kind === "planner" && M.size > 0 && unconfirmed.length === 0
      ? "success"
      : "failure";
const finalScore =
  M.size + unconfirmed.length > 0 ? M.size / (M.size + unconfirmed.length) : 0;
const finTs = await nowIso();
const outcomeMeta: TreeOutcome = {
  status: outcomeStatus,
  finalScore: Math.round(finalScore * 1000) / 1000,
  summary: "以 " + termination.kind + " 终止：" + clip(termination.note, 160),
  ts: finTs,
  roundsUsed,
  folded: M.size,
  unconfirmed: unconfirmed.length,
  terminationKind: termination.kind,
  note: clip(termination.note, 300),
  rule: "success=planner 终止且 fold>=1 且无未证实；failure=其余；interrupted=不可恢复异常中断；finalScore=fold/(fold+未证实) 验证通过占比",
};
const treeWriteOk = await flushTree(finTs, outcomeMeta);
const stateWriteOk = await writeTextFile(statePath, buildState(roundsUsed, finTs, outcomeMeta));
if (stats.firstReviewTotal > 0) {
  let expectedSum = 0;
  for (const r of roundMeta) expectedSum += r.prediction.expectedFirstPassRate;
  const expectedAvg =
    roundMeta.length > 0 ? Math.round((expectedSum / roundMeta.length) * 100) / 100 : 0;
  const firstRefuteRate =
    Math.round((stats.firstReviewRefutes / stats.firstReviewTotal) * 100) / 100;
  const ok = await appendTextLine(
    ledgerPath,
    JSON.stringify({
      ts: finTs,
      runId,
      round: roundsUsed,
      route: "adapt",
      scriptVersion: CONFIG.scriptVersion,
      reviewerVersion: reviewerVersionUsed,
      prediction: {
        contract:
          "连续 " + CONFIG.refuteRounds + " 轮 x " + CONFIG.reviewersPerUnit + " 名独立反驳者零反驳即视为已验证",
        expectedFirstPassRateAvg: expectedAvg,
      },
      observation: {
        folded: M.size,
        unconfirmed: unconfirmed.length,
        firstReviewRefuteRate: firstRefuteRate,
        refineCycles: stats.refineCycles,
        reviewPasses: stats.reviewPasses,
        reviewRefutes: stats.reviewRefutes,
        outcome: outcomeStatus,
      },
    }) + "\n",
  );
  if (ok) ledgerAdaptLines += 1;
}

const reportLines: string[] = [
  "# DSH 运行报告 " + runId,
  "",
  "- 任务：" + CONFIG.task,
  "- 结果：" + outcomeStatus + "（终止：" + termination.kind + "；" + termination.note + "）",
  "- 脚本版本：" + CONFIG.scriptVersion + "；落账评审器版本：" + reviewerVersionUsed + "（" + reviewerSource + "）",
  "- 轮次：" + roundsUsed + "/" + CONFIG.maxRounds + "；fold " + M.size + " 条；未证实 " + unconfirmed.length + " 条",
  "",
  "## 已 fold 产物（先检后并：连续 " + CONFIG.refuteRounds + " 轮 x " + CONFIG.reviewersPerUnit + " 名反驳者零反驳）",
  "",
  "| 键 | 算子 | 证据 | 轮次 | attempt |",
  "| --- | --- | --- | --- | --- |",
];
M.forEach((f) => {
  reportLines.push(
    "| " + f.key + " | " + f.operator + " | " + f.evidence + " | r" + f.round + " | " + f.attemptPath + " |",
  );
});
reportLines.push("");
reportLines.push("## 未证实单元（未 fold，不入黑板）");
reportLines.push("");
if (unconfirmed.length === 0) {
  reportLines.push("- 无");
} else {
  for (const u of unconfirmed) {
    reportLines.push("- " + u.key + "（" + u.operator + "，r" + u.round + "）：" + u.reason);
  }
}
reportLines.push("");
reportLines.push("## 轮次轨迹");
reportLines.push("");
for (const r of roundMeta) {
  reportLines.push(
    "- r" + r.round + " [" + r.decision + "] 计划 " + r.planned.join(", ") + "；fold " +
      r.observation.folds + "、未证实 " + r.observation.unconfirmed + "；C_t：" + r.c_t,
  );
}
reportLines.push("");
reportLines.push("## 改进期工件（dsh-rsi-replay 的输入）");
reportLines.push("");
reportLines.push("- state：" + statePath);
reportLines.push("- 发现树：" + treePath + "（outcome=" + outcomeStatus + "）");
reportLines.push("- 账本：" + ledgerPath + "（policy " + ledgerPolicyLines + " 行 + adapt " + ledgerAdaptLines + " 行）");
reportLines.push("");
reportLines.push(
  "证据分级：E0=确定性规则/命令输出；E1=模型判断；E2=真实代码上的测试/构建；E3=外部实测。",
);
const reportWriteOk = await writeTextFile(reportPath, reportLines.join("\n") + "\n");
try {
  await artifact.file("dsh-report", reportPath, {
    title: "DSH 运行报告 " + runId,
    description: "fold 产物清单、未证实单元、轮次轨迹与改进期工件索引。",
    primary: true,
  });
} catch {
  log("artifact.file 发布失败，报告已写入 " + reportPath);
}

// ——— 顶层结果：发现清单（每条带 status 与证据等级） ———
const findings: Finding[] = [];
M.forEach((f) => {
  findings.push({
    where: f.key,
    what: f.content,
    status: "verified",
    evidence: f.evidence,
    note:
      "连续 " + f.reviewRoundsPassed + " 轮 x " + f.reviewers + " 名反驳者零反驳后 fold；attempt：" + f.attemptPath,
  });
});
for (const u of unconfirmed) {
  findings.push({
    where: u.key,
    what: u.lastContentDigest || "（无产物自述）",
    status: "unconfirmed",
    evidence: u.lastEvidence,
    note: u.reason + (u.attemptPath ? "；最后尝试：" + u.attemptPath : ""),
  });
}
findings.push({
  where: statePath,
  what: "运行状态与黑板断点锚点（每轮更新的 state.json）",
  status: stateWriteOk ? "verified" : "unconfirmed",
  evidence: "E0",
  note: stateWriteOk ? "经 world.run node 写入成功" : "写入失败，见运行日志",
});
findings.push({
  where: treePath,
  what: "发现树（每子代理尝试一节点，整树 outcome=" + outcomeStatus + "）",
  status: treeWriteOk ? "verified" : "unconfirmed",
  evidence: "E0",
  note: treeWriteOk ? "经 world.run node 写入成功" : "写入失败，见运行日志",
});
findings.push({
  where: ledgerPath,
  what: "版本化反馈账本（policy " + ledgerPolicyLines + " 行 + adapt " + ledgerAdaptLines + " 行）",
  status: ledgerPolicyLines + ledgerAdaptLines > 0 ? "verified" : "unconfirmed",
  evidence: "E0",
  note: "评审器版本取 " + reviewerVersionUsed + "（" + reviewerSource + "）",
});

const result = {
  conclusion:
    "DSH 运行 " + runId + " 以【" + outcomeStatus + "】结束（终止出口：" + termination.kind + "；" + termination.note +
    "）。fold 产物 " + M.size + " 条、未证实 " + unconfirmed.length + " 条；state/发现树/账本在 " + CONFIG.artifactsDir + " 下，供 dsh-rsi-replay 消费。",
  runId,
  outcome: outcomeStatus,
  termination: { kind: termination.kind, note: termination.note },
  scriptVersion: CONFIG.scriptVersion,
  reviewerVersion: { contract: CONFIG.reviewerVersion, used: reviewerVersionUsed, source: reviewerSource },
  roundsUsed,
  artifacts: { state: statePath, tree: treePath, ledger: ledgerPath, report: reportPath },
  findings,
  verified: [
    "全部落盘经 world.run node 子进程完成（BOOTSTRAP/WRITE/APPEND/NOW/FRONTMATTER 五个一次性程序）",
    "每轮 state.json + trees/<run-id>.json + ledger policy 行落盘；收尾写树 outcome 轨迹级成败标签",
    "每条 fold 产物带 E0-E3 证据等级，且经连续 " + CONFIG.refuteRounds + " 轮 x " + CONFIG.reviewersPerUnit + " 名独立反驳者零反驳（先检后并）",
    "run-id 与时间戳均在外部 node 进程取得（主体未用 Date.now/无参 new Date/Math.random）",
  ],
  notCovered: [
    "回放评估、两级保留门与过拟合门属改进期（dsh-rsi-replay/dsh-rsi-loop），本模板只生产其输入（发现树、state、ledger）。",
    "反驳评审是模型判断（E1 级），未经外部独立复核；评审子代理失败时保守按 refute 处理。",
    "attempt 落盘正文截断至 " + ATTEMPT_CHARS + " 字（命令行长度约束），全文以工作区产物为准。",
  ],
};
return result;
