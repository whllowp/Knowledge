# 23 · 千亿数据秒查到真正的 AgentOps：AI 时代中国自研可观测平台的演进

- **来源文件**：蒋烁淼-千亿数据秒查到真正的AgentOps：AI时代中国自研可观测平台的演进.pdf
- **厂商/讲者**：蒋烁淼（观测云 CEO）
- **主题领域**：**可观测平台 / AIOps / AgentOps / AI SRE Agent / 数据底座**
- **页数/文本量**：38 页 / 2965 字

## 核心观点
- 定位：观测云是覆盖「软件交付→系统运行→数字化业务」的全生命周期可观测平台，演进主线是**从「千亿数据秒查」到「真正的 AgentOps」**。
- 产品矩阵：GuanceDB 3.1（统一可观测数据湖，存算分离/双引擎/流式聚合）、DataKit（统一全域采集，兼容 OpenTelemetry）、观测 AI Agent Teams（SRE/DevOps/Security/Test 专业智能体）、Obsy AI Copilot（辅助）。
- 关键理念：**统一目录补上服务语义和知识**；AI 发现异常，人与 AI Agent 协作处理问题。

## 关键事实/数据（已核验）
- AI 智能监控器：自然语言生成检测规则，示例「监控订单服务最近 10 分钟的错误率与 P95 延迟，**错误率超过 5% 或 P95 超过 1 秒时告警**」，生成规则含时间窗口与触发条件，保存后持续执行。
- 数据底座：2025 GuanceDB 3.0 存算分离 → 3.1 查询加速；Metric Engine（时序）+ Event Engine（日志/链路/事件）；倒排索引、流式聚合复用、Pipeline 写入阶段准备数据、DQL 统一入口。
- 智能体：AI SRE Agent、AI Security Agent、AI Dev Agent；Copilot 支持看板生成、日志解析、指标洞察、链路与告警分析。

## 主要踩坑/风险
- 海量数据下查询成本与扫描控制（Partition By / Cluster By / 倒排索引）是「秒查」的底座工程前提。
- 「AgentOps」若只堆智能体而无统一语义目录，仍难落地——故强调「统一目录补上服务语义和知识」。

## 可引用结论
> AI 发现异常，人与 AI Agent 协作处理问题——AgentOps 不是多一个机器人，而是补上服务语义与知识的统一目录。

## 跨文档关联
- 与 **08 刘杨（Agent 可观测 / OTel GenAI 语义）**、**10 周昕毅（AISRE 闭环）**、**05 蚂蚁（AntOntology）** 同属可观测/运维智能体主题；「统一目录补语义」呼应 03/05/25 的语义层/本体主线。

## 关键词
观测云、AgentOps、AIOps、AI SRE Agent、GuanceDB、DataKit、OpenTelemetry、语义目录
