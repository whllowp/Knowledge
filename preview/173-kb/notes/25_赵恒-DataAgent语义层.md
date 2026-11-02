# 25 · 如何构建 AI Native 的数据语义层：从 Data Agent 实践到可执行的 Semantic Runtime

- **来源文件**：赵恒-如何构建 AI Native 的数据语义层：从 Data Agent 实践到可执行的 Semantic Runtime.pdf
- **厂商/讲者**：赵恒（Datus AI，QCon 2026）
- **主题领域**：**数据语义层（Semantic Layer）/ Data Agent / Ontology Tools / 口径治理**
- **页数/文本量**：37 页 / 18600 字（最丰富文本之一）

## 核心观点
- 主线：从「查出指标」到「解释变化」再到「指导行动」——任务从一次查询变成一条分析链路，需在语义层之上构建本体、绑定业务对象与可执行操作。
- 痛点是**口径漂移**：同一问题、三个消费者（BI 看板/分析师/AI Agent）各写各的 SQL，得到三个「收入」（1.24M / 1.19M / 1.31M）。**Agent 不会消除口径漂移，只会放大它**——人写 1 条 SQL，Agent 一次会话发起 6–11 次工具调用、写出多条，每条都重新决定 join/过滤/粒度。
- 解法：语义层的价值**不是 Agent 的另一个 prompt，而是「每一条都用同一份定义」**，让 Agent 的 SQL 更稳定。传统 Semantic Layer 在 Agent 场景有四个断点，需升级为**可执行的 Semantic Runtime**（轻量 SQL 编译器）+ **Semantic Tools / Ontology Tools**，让语义层进入 Reasoning Loop。

## 关键事实/数据
- 实践：开源 Data Engineering Agent **Day 1 即接入语义层**；指标口径统一后，**NL2Metrics 准确率明显高于 NL2SQL**。
- 重构：MetricFlow → Ossie + Dosi（开放规范 + 自研可执行 Semantic Runtime）。
- 案例：统一 `revenue = SUM(orders.amount) WHERE status != 'cancelled'` 后，看板/分析师/Agent 拿到同一个数（1.19M），换工具/换 Agent 数不变。

## 主要踩坑/风险
- 现有 Semantic Layer 实现与表达能力撑不住「解释变化」的分析链路（仅能查指标，不能解释为什么变）。
- 若语义层只是 prompt 上下文，Agent 仍会各自重新定义，漂移放大。

## 可引用结论
> Agent 不会消除口径漂移，只会放大它；语义层的价值不是 Agent 的另一个 prompt，而是「每一条都用同一份定义」。

## 跨文档关联（高价值）
- 与 **03 余锦泽（本体辅助 Agent 记忆）**、**05 蚂蚁 AntOntology（统一跨系统业务语义）** 是**同一思想在数据与运维两个领域的孪生**：都用「统一语义/本体 + 程序化校验」对抗 LLM 的记忆污染与口径漂移。共同支撑 SRE 洞察报告「领域知识落地是瓶颈」的论断。
- 与 **25 本身 + 03 + 05 + 23（观测云统一语义目录）** 构成「语义层/运维本体」最强主题簇，建议作为知识库核心主线重点串讲。

## 关键词
数据语义层、Semantic Layer、Data Agent、Ontology Tools、口径漂移、NL2Metrics、Semantic Runtime
