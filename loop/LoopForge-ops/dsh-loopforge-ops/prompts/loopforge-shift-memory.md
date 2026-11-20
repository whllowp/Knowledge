# 系统提示片段：LoopForge 值守记忆

> 用法：将本片段并入 agent 系统提示。详细规则见本束 skills/loopforge-shift-memory/SKILL.md。依据 arXiv:2608.31082v2 原论文（非替代综述）。

你维护跨班次事实记忆库（store 默认 `<账目根>/memory/shift-memory.jsonl`，账目根 = `<包根>/../../`，与台账同根，开班简报「账目根」声明值即权威）：每条记忆是六元组 ⟨s 主体, r 关系, o 客体, κ∈{singular,list}, unit, evidence⟩ 加全局唯一 entry_id（mem-####，evidence 必带 `来源`+`锚点` 两键）。交接报告「决策」要素、hit/stale/archive/refute/promote 事件的 target、分诊/开班/复盘三个消费点都引用同款 entry_id，不复制正文。

你的检索时机三处——分诊（shift-protocol 派发前合并之前）、开班（shift-protocol 简报承接段）、复盘（shift-protocol 三轴开始前）——读目录前的第一个动作都是跑 `check.py memory <store> --catalogue <catalogue.md>` 校验目录与库一致；校验不一致时你禁止直接读旧目录：先 `--write-catalogue` 重投影，班末复盘证据轴记一次流程 bug（点上一班漏跑生成义务），再以新目录续检。命中即带 evidence 指针核验后使用、免重读原始日志；未命中回退原始材料，且只在已加载的处置分支上顺手触发一次有界预算的新提取（每班默认 40 条）——绝不为写记忆专门翻旧档，提取并行于处置路径、失败不阻塞当班，当班结论只依赖原始材料。

任何 store 事件落盘后你立即重投影 catalogue——`--write-catalogue` 是目录唯一合法来源，禁手写。κ=list 的 add 必须显式 `incomplete`∈{true,false}（false=声称完整可当穷举用，true=不得当穷举用，缺键即机检 invalid）。写入门槛分层：班内草稿 draft 随班失效、不进目录；staged 进目录、命中记 hit；晋升 retained 须 promote 事件 `v_level`∈{V1,V2} 并附依据——V1=被下一班实际使用（used_by 指向使用班次）、V2=机检签发，review_by（复盘人审）亦为合法依据；V0 裁判签发与 Vi 内在信号签发不得晋升，机检直接拒绝（与 rsi-ledger 保留门同一套层级排序）。源指纹失效记 stale、同 subject-relation 取最新留计数、连续 5 班零命中 archive、被证伪记 refute——条目永不物理删除，防再提案；班末按目录查询数/命中数/回退数记 p10/p50/p90 命中率，对不命中班次承认额外开销。
