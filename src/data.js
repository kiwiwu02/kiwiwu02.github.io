export const profile = {
  name: '吴奇伟',
  latin: 'Kiwi Wu',
  heroLatin: 'Kiwi',
  role: 'AI Agent Engineer',
  intro:
    '澳门大学数据科学（应用人工智能）硕士，3 段 AI Agent 研发实习。从工业设备维保 Agent 平台（WAIC 世界人工智能大会展示）到多智能体企业背调、NL2SQL 智能问数，覆盖 Agent Loop、MCP 工具、Agentic RAG、记忆管理与评测体系的完整工程链路。',
  heroHeadline: 'Hi，我是 Kiwi，一名 AI Agent 工程师',
  heroIntro:
    '喜欢把复杂问题拆成可运行、可观察、可评估的工程系统',
  heroFocus: '专注 LLM、Agent、RAG 与 Evaluation 的工程产品落地',
  stack: ['Runtime', 'Loop', 'MCP', 'Skills', 'Memory', 'Context', 'Graph', 'Python'],
  contacts: [
    { k: 'Email', v: '18975036729@163.com', href: 'mailto:18975036729@163.com' },
    { k: 'Phone', v: '189 7503 6729', href: 'tel:18975036729' },
    { k: 'GitHub', v: 'github.com/kiwiwu02', href: 'https://github.com/kiwiwu02' },
    { k: 'Based in', v: '澳门 · 氹仔 / 上海', href: null },
  ],
  stats: [
    { num: '3', unit: '段', label: 'AI Agent 研发实习', src: '工业 / 背调 / NL2SQL' },
    { num: '97', unit: '%', label: 'RAG Chunk 命中率', src: '自优化闭环最优策略', accent: true },
    { num: '41', unit: '个', label: '原子化 MCP 工具', src: '10+ Skills 渐进披露', accent: true },
    { num: '3.83', unit: '/4.0', label: '硕士 GPA', src: '全英文授课', accent: true },
  ],
}

// 宠物文案按事件分组（不再按状态分组）。只有事件矩阵中显式调用 speak() 的事件才出气泡；
// 动作状态（idle/look/waving/jumping/failed 等）本身不再说话。
// 文案规范：≤12 字、指向页面真实元素或本人确认的事实、无标点/语气词/emoji。
export const petProfiles = {
  hero: {
    pools: {
      idle: ['Hi', '点我两下', '简历在顶部', '往下看有项目', '我是一名 AI Agent 工程师'],
      click: ['Hi', '点我两下', '简历在顶部'],
      annoyed: ['……'],
    },
  },
  contact: {
    pools: {
      idle: ['联系方式在上方', '记得给我发邮件', '点我两下', '通常当天回复'],
      enter: ['联系方式在上方'],
      click: ['点我两下', '记得给我发邮件', '通常当天回复'],
      annoyed: ['……'],
    },
  },
}

export const education = [
  {
    period: '2025.08 — 2027.05',
    institution: '澳门大学',
    institutionHref: 'https://www.um.edu.mo/zh-hant/',
    faculty: '人工智能与脑科学研究院',
    facultyHref: 'https://iaibs.um.edu.mo/',
    degree: '数据科学（应用人工智能）',
    degreeHref: 'https://iaibs.um.edu.mo/artificial-intelligence-applications-in-academic-year-2025-2026-onwards/',
    level: '硕士',
    gpa: '3.83 / 4.0',
  },
  {
    period: '2021.09 — 2025.06',
    institution: '上海师范大学',
    institutionHref: 'https://www.shnu.edu.cn/',
    faculty: '商学院',
    facultyHref: 'https://sfb.shnu.edu.cn/',
    degree: '计算机科学与技术',
    level: '本科',
    gpa: '3.22 / 4.0',
  },
]

export const awards = [
  { institution: '上海师范大学', title: '校一等奖学金', kind: '奖学金', level: '校级', rank: '一等奖', date: '2022-09-01', note: '前2%' },
  { institution: '上海师范大学', title: '校二等奖学金', kind: '奖学金', level: '校级', rank: '二等奖', date: '2024-09-01', note: '前5%' },
  { institution: '上海师范大学', title: '升学奖学金', kind: '奖学金', level: '校级', rank: '等级', date: '2025-06-01', note: '' },
  { institution: '上海师范大学', title: '优秀学生', kind: '其他', level: '校级', rank: '等级', date: '2022-10-31', note: '' },
  { institution: '上海师范大学', title: '优秀学生', kind: '其他', level: '校级', rank: '等级', date: '2023-10-31', note: '' },
  { institution: '上海师范大学', title: '优秀团员', kind: '其他', level: '校级', rank: '等级', date: '2022-05-04', note: '' },
  { institution: '上海师范大学', title: '优秀团员', kind: '其他', level: '校级', rank: '等级', date: '2023-05-04', note: '' },
  { institution: '上海师范大学', title: '优秀实习生', kind: '其他', level: '校级', rank: '等级', date: '2025-05-04', note: '' },
  { institution: '上海师范大学', title: '上海师范大学2023年暑期社会实践', kind: '竞赛获奖', level: '校级', rank: '二等奖', date: '2023-03-01', note: '' },
  { institution: '上海师范大学', title: '2023年上海市级“大学生创新创业训练计划”项目', kind: '竞赛获奖', level: '省级', rank: '等级', date: '2023-11-01', note: '' },
]

export const experience = [
  {
    when: '2026.06 — 2026.09',
    company: '上海翰声信息技术有限公司',
    companyHref: 'https://www.hiyees.com/',
    role: 'AI Agent 研发工程师（实习）',
    desc: '面向港口设备工业维修场景构建的 Agent 平台，并在 WAIC（世界人工智能大会）上进行展示。系统打通多种异构数据源，支持多轮工具调用、上下文管理、长短期记忆管理、智能体动态装配与回答来源追溯，辅助工程师完成故障排查和维保决策。',
    details: {
      summary: '面向港口设备工业维修场景构建的 Agent 平台，并在 WAIC（世界人工智能大会）上进行展示。系统打通多种异构数据源，支持多轮工具调用、上下文管理、长短期记忆管理、智能体动态装配与回答来源追溯，辅助工程师完成故障排查和维保决策。',
      stack: ['FastAPI', 'Ant Design X', 'OpenAI SDK', 'LangChain', 'Redis', 'MySQL', 'SeekDB', 'MinIO', 'MinerU'],
      points: [
        '基于 Harness 架构自研可控 Agent Loop，支持 ReAct / Plan-Execute / Reflection 等推理模式；构建智能体平台，通过 Profile + Skill + Prompt + MCP 动态装配，将同一 Runtime 装配为多个领域智能体角色，支持跨角色的联动排查。',
        '设计插件化 MCP 工具服务，构建 41 个原子化工具（图纸 / 工单 / 设备 / PLC / 图谱 / 财务 / VLM 等）与 10 余种 Skills；工具层采用原子化拆分 + 参数校验 + 错误回灌，并设计降级策略和停止条件，杜绝死循环；Skill 侧采用渐进式披露，支撑基于 Skill 的文档检索、GraphRAG-like 图谱增强检索以及多路工具 Workflow 编排，实现推理、Tool Trace 和 Citations 实时可视化。',
        '构建 Loop Agentic RAG 知识库：多格式解析 + 4 类分块 + SeekDB 向量 / 全文双索引、多路混合召回、Hierarchical WRRF + 结构化证据排序 + Rerank + MMR + 上下文预算 + 自研断崖检测动态 Top-K，并以 Recall@K / MRR / RAGAS / LLM Judge 构建 AutoResearch 自优化闭环；最优策略 Chunk 命中率 97%、MRR 0.91、端到端 P50 1.5s / P95 2.3s。',
        '实现上下文与记忆管理：构建短期会话记忆 + 长期用户记忆的分层记忆体系，支持持久化与变更追踪；落地 Context Engineering 与 Token Budget，实现上下文压缩、低相关内容优先裁剪、Tool Result 摘要抽取与 Prompt Cache 复用。',
        '建立 Agent 分层评测体系：任务完成率 88%、工具选择正确率 94%、参数正确率 97%、引用覆盖率 100%、平均 3.6 轮对话完成，单任务 Token 成本下降 32%；线上低分会话与异常 trace 抽样复核并回流为回归题集。',
      ],
    },
  },
  {
    when: '2026.03 — 2026.05',
    company: '深圳拓几科技有限公司',
    companyHref: 'https://robotuo.com/',
    role: '全栈开发工程师（实习）',
    desc: '面向海外展会场景的智能 CRM 系统——销售在飞书发送客户名片后，系统自动完成多模态识别、重复检测、多维度企业背调（工商法律/财务信用/组织架构/动态新闻/供应链口碑）及结构化报告生成，实现从名片到背调报告的全流程自动化。',
    details: {
      summary: '面向海外展会场景的智能 CRM 系统：销售在飞书发送客户名片后，系统自动完成多模态识别、重复检测、多维度企业背调（工商法律 / 财务信用 / 组织架构 / 动态新闻 / 供应链口碑）及结构化报告生成，实现从名片到背调报告的全流程自动化。',
      stack: ['FastAPI', 'LangGraph', 'LangChain', '飞书 Lark OpenAPI SDK', 'DuckDuckGo', 'Tavily'],
      points: [
        '搭建多智能体企业背调架构，设计「主调度 + 三级流水线」模式：基础信息串行调研 → 五大专家 Agent 并行调研 → 任务并行调度与结果汇总；前置多语言智能名片识别模块，基于多模态模型提取 13 类结构化字段并输出置信度。',
        '实现评估驱动的自主搜索闭环与交叉验证机制，内置「信息充足性评估 → 信息缺口发现 → 补充搜索 → 生成带引用总结」闭环，以充足性达成率与引用覆盖率驱动迭代；CrossValidationAgent 为多源数据分配可信度权重，最终生成飞书报告文档。',
      ],
    },
  },
  {
    when: '2025.04 — 2025.07',
    company: '丰贺信息科技（上海）有限公司',
    companyHref: 'https://www.deepfinance.com/about/',
    role: '大模型技术实施实习生',
    desc: '基于RAG思想搭建业财场景的NL2SQL智能问数系统，通过自然语言对话降低数据查询分析门槛，提升决策效率。',
    details: {
      summary: '基于 RAG 思想搭建业财场景的 NL2SQL 智能问数系统，通过自然语言对话降低数据查询分析门槛，提升决策效率。',
      stack: ['FastAPI', 'LangGraph', 'LangChain', 'DeepSeek', 'Milvus', 'Elasticsearch', 'MySQL', 'Docker'],
      points: [
        '构建 LangGraph 问数智能体，编排「关键词抽取 → 多路召回 → 信息整合 → 大模型精筛 → SQL 生成 → 语法校验 → SQL 执行 → 错误回灌」全流程自动化，打通自然语言查数与智能分析能力，显著降低业财人员数据分析门槛。',
        '负责 NL2SQL 智能助手与内部业财系统的接口开发、功能整合及系统测试；设计并实现元数据知识库，覆盖数仓近百张核心表、1000+ 字段、300+ 类业财指标；设计并执行 80+ 测试用例，SQL 生成正确率 95%+，缺陷修复率 100%。',
      ],
    },
  },
]

export const projects = [
  {
    index: '01',
    title: 'HiAgent',
    githubCreated: '2026.08',
    cn: '工业设备维保 Agent',
    desc: '面向工业设备维修场景的 Agent 工作台，串联技能、工具调用、证据链与故障诊断结果。',
    tags: ['工业设备维保 Agent'],
    metric: 'Workflow preview',
    cover: 'media/project-hiagent.png',
    cta: '项目展示',
    href: null,
  },
  {
    index: '02',
    title: 'OmniAgent',
    githubCreated: '2026.05',
    cn: '多智能体对话系统',
    desc: '基于大语言模型的智能对话系统，支持多 Agent 协作、知识库检索、工具调用与 MCP Server 集成。',
    tags: ['Multi-Agent'],
    metric: 'Open source on GitHub',
    cover: 'media/project-omni.png',
    cta: '前往 GitHub',
    href: 'https://github.com/kiwiwu02/OmniAgent',
  },
  {
    index: '03',
    title: 'Shenzhen Robot Valley',
    githubCreated: '2026.05',
    cn: '深圳机器人谷官网',
    desc: '面向 2000㎡ 机器人展厅的生产环境官网，包含展厅导览、机器人体验、参观预约与中英文内容。',
    tags: ['深圳机器人谷官网'],
    metric: 'Live in production',
    cover: 'media/project-robotuo.png',
    cta: '访问线上网站',
    href: 'https://www.szrobotvalley.com/en',
  },
  {
    index: '04',
    title: 'Cairn',
    githubCreated: '2026.09',
    cn: 'AI 学习与工作区',
    desc: '记录通往精通的每一步，把课程、笔记、计划和学习记录组织进一个可持续使用的个人工作区。',
    tags: ['AI 学习与工作区'],
    metric: 'Open source on GitHub',
    cover: 'media/project-cairn.png',
    cta: '前往 GitHub',
    href: 'https://github.com/kiwiwu02/Cairn',
    links: [
      { type: 'github', href: 'https://github.com/kiwiwu02/Cairn' },
      { type: 'web', href: 'https://kiwiwu02.github.io/Cairn/' },
    ],
  },
]

export const githubProjects = [
  {
    title: 'creating-skills',
    githubCreated: '2026.07',
    description: '从真实任务出发，创建、审查和迭代可测试 Agent Skill 的跨平台工作流。',
    tags: ['Agent Skill'],
    href: 'https://github.com/kiwiwu02/creating-skills',
  },
  {
    title: 'exhibition-agent',
    githubCreated: '2026.04',
    description: '面向海外展会场景的智能 CRM 系统，自动完成名片 OCR 识别、重复检测、多维度背调与报告生成。',
    tags: ['客户背调 Agent'],
    href: 'https://github.com/kiwiwu02/exhibition-agent',
  },
  {
    title: 'Dify_Project',
    githubCreated: '2026.03',
    description: '沉淀 5 个可直接导入 Dify 的实战 Agent 与 Workflow，覆盖 RAG、SQL 查询、外部搜索、Excel 可视化和离线翻译。',
    tags: ['Dify Workflow'],
    href: 'https://github.com/kiwiwu02/Dify_Project',
  },
  {
    title: 'Academic_Question_Answering_Agent',
    githubCreated: '2026.02',
    description: '面向学术问题的全栈问答智能体，使用 FastAPI、SQLite 与 arXiv 工具完成论文检索和总结。',
    tags: ['学术问答 Agent'],
    href: 'https://github.com/kiwiwu02/Academic_Question_Answering_Agent',
  },
  {
    title: 'AI_Smart_Naming',
    githubCreated: '2026.02',
    description: '基于 FastAPI、Vue3、LangChain 与 Qwen3-Max 的全栈智能取名服务。',
    tags: ['AI 取名 Agent'],
    href: 'https://github.com/kiwiwu02/AI_Smart_Naming',
  },
  {
    title: 'Qwen-LangChain-Gradio-Chatbot',
    githubCreated: '2026.01',
    description: '基于 LangChain 1.0 和 Gradio 构建的轻量级 Qwen 聊天机器人，支持流式输出与多轮对话。',
    tags: ['Qwen Chatbot'],
    href: 'https://github.com/kiwiwu02/Qwen-LangChain-Gradio-Chatbot',
  },
  {
    title: 'Quickstart-LangChain-V1.1.0',
    githubCreated: '2025.12',
    description: '围绕 LangChain v1.1.0 整理的 LLM 应用练习与笔记，覆盖 Agent、工具调用、中间件与人类介入。',
    tags: ['LangChain 学习'],
    href: 'https://github.com/kiwiwu02/Quickstart-LangChain-V1.1.0',
  },
  {
    title: 'GroupBT_UM_Programming_Project',
    githubCreated: '2025.12',
    description: '端到端中文新闻数据分析项目，使用可解释指标比较不同媒体的词汇与写作风格。',
    tags: ['新闻数据分析'],
    href: 'https://github.com/kiwiwu02/GroupBT_UM_Programming_Project',
  },
  {
    title: 'GenLab_GAN-WGAN-WGANGP',
    githubCreated: '2025.10',
    description: '对比 GAN、WGAN 与 WGAN-GP 在 MNIST 和 Fashion-MNIST 上的训练稳定性与生成质量。',
    tags: ['GAN-WGAN-WGANGP'],
    href: 'https://github.com/kiwiwu02/GenLab_GAN-WGAN-WGANGP',
  },
  {
    title: 'RelationExtraction_Bert_Project',
    githubCreated: '2025.11',
    description: '基于中文 RoBERTa 的医疗关系抽取项目，通过文本编码与难分类类别增强提升关系分类效果。',
    tags: ['医疗关系抽取'],
    href: 'https://github.com/kiwiwu02/RelationExtraction_Bert_Project',
  },
  {
    title: 'LLM-RAG-Agent-LangChain-learing',
    githubCreated: '2026.01',
    description: '全栈大模型 Agent 开发学习路线，持续记录 LLM、RAG 与 LangChain 实践。',
    tags: ['RAG'],
    href: 'https://github.com/kiwiwu02/LLM-RAG-Agent-LangChain-learing',
  },
]

export const allProjects = [...projects, ...githubProjects].sort((a, b) => (
  (b.githubCreated ?? '').localeCompare(a.githubCreated ?? '')
))
