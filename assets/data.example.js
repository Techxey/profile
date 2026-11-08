/**
 * ============================================================
 *  data.example.js · 完整示例数据（只用于「先看看示例」按钮）
 * ------------------------------------------------------------
 *  它不会覆盖你的 data.js，只是给页面提供一个可预览的样例。
 *  想直接用这份当起点：把 window.PROFILE_EXAMPLE 改成
 *  window.PROFILE_DATA，然后把内容替换掉即可。
 * ============================================================
 */

window.PROFILE_EXAMPLE = {
  schemaVersion: 2,

  meta: {
    pageTitle: "陈一诺 · 学生档案",
    tagline: "计算机专业在读，正在把课堂知识写成能跑起来的东西",
    eyebrow: "STUDENT PROFILE · 学生档案",
    lang: "zh-CN",
    version: "2.0.0",
    updatedAt: "2026-11-08"
  },

  splash: {
    enabled: true,
    eyebrow: "STUDENT PROFILE",
    title: "",
    subtitle: "",
    footer: "从 0 开始，一笔一笔写出来",
    duration: 2400,
    fastDuration: 700
  },

  settings: {
    showEdit: true,               // 关掉后访客看不到「编辑」入口
    brand: {
      avatarMode: "logo",
      logoColors: ["#0a84ff", "#5e5ce6", "#bf5af2"],
      avatarGradient: "linear-gradient(140deg,#64d2ff 0%,#0a84ff 48%,#5e5ce6 100%)"
    },
    sections: [
      { id: "education", enabled: true, nav: "教育", title: "教育背景", desc: "在读院校与学习方向",           tint: "purple" },
      { id: "campus",    enabled: true, nav: "实践", title: "校园实践", desc: "课程项目、竞赛与社团经历",     tint: "indigo" },
      { id: "skills",    enabled: true, nav: "技能", title: "技能标签", desc: "按能力域分组，圆点标记熟练度", tint: "pink" },
      { id: "projects",  enabled: true, nav: "作品", title: "项目作品", desc: "课程作业和自己写的小东西",     tint: "orange" },
      { id: "contact",   enabled: true, nav: "联系", title: "联系方式", desc: "点一下就能复制",               tint: "green" }
    ]
  },

  basic: {
    name: "陈一诺",
    nameEn: "Chen Yinuo",
    title: "计算机科学与技术 · 本科在读",
    initials: "陈",
    avatarGradient: "linear-gradient(140deg,#64d2ff 0%,#0a84ff 48%,#5e5ce6 100%)",
    location: "杭州 · 中国",
    status: { available: true, label: "寻找 2027 暑期实习" },
    bio: "大三在读。喜欢把课上学到的算法和数据结构，做成自己每天都会用的小工具。正在找一份能写真实代码的实习。",
    tags: ["数据结构", "Web 开发", "算法竞赛", "开源"],
    stats: [
      { label: "GPA",     value: 3.8, suffix: "/4.0" },
      { label: "课程项目", value: 9,   suffix: "个" },
      { label: "竞赛获奖", value: 3,   suffix: "项" }
    ],
    social: [
      { platform: "GitHub", icon: "github", url: "https://github.com/" },
      { platform: "博客",   icon: "globe",  url: "https://example.com" },
      { platform: "邮箱",   icon: "mail",   url: "mailto:hello@example.com" }
    ]
  },

  education: [
    {
      id: "edu-bachelor",
      school: "云麓大学",
      schoolEn: "Yunlu University",
      degree: "本科在读 · 工学学士",
      major: "计算机科学与技术",
      period: { start: "2023.09", end: "至今" },
      location: "杭州",
      glyph: "云",
      tint: "blue",
      badge: "在读",
      description: "主修数据结构、操作系统、计算机网络与数据库；连续两年获校级一等奖学金，预计 2027 年 6 月毕业。",
      highlights: ["GPA 3.8/4.0", "专业前 5%", "校一等奖学金"]
    },
    {
      id: "edu-high",
      school: "临江中学",
      schoolEn: "Linjiang High School",
      degree: "高中 · 理科实验班",
      major: "信息学竞赛方向",
      period: { start: "2020.09", end: "2023.06" },
      location: "杭州",
      glyph: "临",
      tint: "purple",
      description: "校信息学竞赛队成员，系统学习 C++ 与基础算法，从此开始写程序。",
      highlights: ["C++", "NOIP", "算法基础"]
    }
  ],

  campus: [
    {
      id: "campus-market",
      org: "校园二手交易平台",
      orgEn: "Campus Marketplace",
      role: "项目负责人 · 4 人小组",
      type: "大创项目",
      period: { start: "2026.03", end: "至今" },
      location: "云麓大学",
      glyph: "创",
      tint: "indigo",
      badge: "进行中",
      description: "校级大学生创新创业训练计划项目，做一个只对本校学号开放的二手交易与教材流转平台。",
      achievements: [
        "负责需求拆解与任务分工，用 6 周做出可演示的第一版，目前已有 200+ 名同学注册试用",
        "设计商品检索与私信模块的数据表，把首页加载耗时从 1.2s 优化到 380ms"
      ],
      stack: ["Vue", "Node.js", "MySQL", "Figma"]
    },
    {
      id: "campus-contest",
      org: "蓝桥杯 / ACM 校赛",
      orgEn: "Programming Contests",
      role: "参赛队员",
      type: "学科竞赛",
      period: { start: "2024.10", end: "2025.05" },
      location: "杭州",
      glyph: "赛",
      tint: "teal",
      description: "两年内参加 5 场算法竞赛，主要负责图论与动态规划方向的题目。",
      achievements: [
        "获蓝桥杯软件类省二等奖 1 次、校 ACM 选拔赛一等奖 1 次",
        "整理 120 道刷题笔记与模板，作为社团新人培训材料沿用至今"
      ],
      stack: ["C++", "动态规划", "图论"]
    },
    {
      id: "campus-club",
      org: "计算机协会 · 技术部",
      orgEn: "CS Association",
      role: "技术部干事",
      type: "学生社团",
      period: { start: "2024.09", end: "2025.09" },
      location: "云麓大学",
      glyph: "协",
      tint: "orange",
      description: "和社团同学一起组织面向低年级的技术分享，负责场地、讲义和示例代码。",
      achievements: [
        "组织 8 场「从零写一个小项目」分享会，累计参与 300+ 人次",
        "维护社团的入门教程仓库，收获 60+ star"
      ],
      stack: ["Git", "Markdown", "技术写作"]
    }
  ],

  skills: [
    {
      id: "sk-lang",
      category: "编程语言",
      icon: "code",
      tint: "blue",
      items: [
        { name: "C / C++", level: 4 },
        { name: "Python", level: 4 },
        { name: "TypeScript", level: 3 },
        { name: "SQL", level: 3 },
        { name: "Java", level: 2 }
      ]
    },
    {
      id: "sk-web",
      category: "Web 开发",
      icon: "globe",
      tint: "indigo",
      items: [
        { name: "HTML / CSS", level: 4 },
        { name: "Vue", level: 4 },
        { name: "React", level: 3 },
        { name: "Node.js", level: 3 },
        { name: "REST API", level: 3 }
      ]
    },
    {
      id: "sk-cs",
      category: "专业基础",
      icon: "layers",
      tint: "purple",
      items: [
        { name: "数据结构", level: 4 },
        { name: "算法设计", level: 3 },
        { name: "操作系统", level: 3 },
        { name: "计算机网络", level: 3 },
        { name: "数据库原理", level: 3 }
      ]
    },
    {
      id: "sk-tools",
      category: "工具与协作",
      icon: "wrench",
      tint: "orange",
      items: [
        { name: "Git", level: 4 },
        { name: "Linux", level: 3 },
        { name: "VS Code", level: 4 },
        { name: "Figma", level: 2 },
        { name: "Markdown", level: 4 }
      ]
    }
  ],

  projects: [
    {
      id: "prj-courseflow",
      title: "CourseFlow 课程表助手",
      subtitle: "给本校同学用的课表与空教室查询小程序",
      category: "微信小程序",
      year: "2026",
      featured: true,
      cover: {
        gradient: "linear-gradient(135deg,#0a84ff 0%,#5e5ce6 48%,#bf5af2 100%)",
        glyph: "C"
      },
      description: "从教务系统导入课表，支持周视图、空教室查询和考试倒计时。独立完成的第一个有真实用户的小程序，上线三个月累计 200+ 名同学使用。",
      metrics: [
        { label: "用户", value: "200+" },
        { label: "页面", value: "12" },
        { label: "评分", value: "4.8" }
      ],
      tags: ["小程序", "JavaScript", "云开发"],
      role: "独立设计 + 开发",
      link: "https://example.com/courseflow"
    },
    {
      id: "prj-dsvis",
      title: "DS Visualizer",
      subtitle: "把排序和树结构画出来",
      category: "课程大作业",
      year: "2025",
      featured: false,
      cover: {
        gradient: "linear-gradient(135deg,#30d158 0%,#0a84ff 100%)",
        glyph: "D"
      },
      description: "可视化 8 种排序与二叉树的执行过程，可单步回放，被助教用于课堂演示。",
      metrics: [
        { label: "算法", value: "8" },
        { label: "代码量", value: "1.2k" }
      ],
      tags: ["算法", "Canvas", "数据结构"],
      role: "课程设计",
      link: "https://example.com/dsvis"
    },
    {
      id: "prj-blog",
      title: "技术笔记博客",
      subtitle: "边学边写的博客",
      category: "个人站点",
      year: "2025",
      featured: false,
      cover: {
        gradient: "linear-gradient(135deg,#ff9f0a 0%,#ff375f 100%)",
        glyph: "N"
      },
      description: "记录课程笔记与踩坑过程，累计 40 余篇文章，也顺便练习写作。",
      tags: ["Markdown", "静态站点", "写作"],
      role: "独立维护",
      link: "https://example.com/blog"
    },
    {
      id: "prj-weather",
      title: "Weather CLI",
      subtitle: "一个命令查天气",
      category: "小工具",
      year: "2024",
      featured: false,
      cover: {
        gradient: "linear-gradient(135deg,#64d2ff 0%,#5e5ce6 100%)",
        glyph: "W"
      },
      description: "大一时写的命令行工具，调用公开 API 查询天气并支持多城市收藏。",
      tags: ["Python", "CLI", "API"],
      role: "个人练习",
      link: "https://example.com/weather"
    }
  ],

  contact: {
    availability: {
      status: "正在寻找 2027 年暑期实习",
      note: "对后端开发、前端工程和数据分析都感兴趣。欢迎聊聊课程项目、开源协作，或者任何实习机会，通常当天回复。"
    },
    items: [
      { id: "c-email",    label: "邮箱",     value: "yinuo@example.com",   icon: "mail",    tint: "blue",   copy: true, link: "mailto:yinuo@example.com" },
      { id: "c-wechat",   label: "微信",     value: "yinuo_dev",           icon: "message", tint: "green",  copy: true },
      { id: "c-github",   label: "GitHub",   value: "github.com/yinuo",    icon: "github",  tint: "gray",   link: "https://github.com/" },
      { id: "c-blog",     label: "技术博客", value: "yinuo.example.com",   icon: "globe",   tint: "indigo", link: "https://example.com" },
      { id: "c-location", label: "所在地",   value: "杭州 · 云麓大学",     icon: "pin",     tint: "orange" }
    ],
    cta: { label: "邮件联系我", icon: "mail", link: "mailto:yinuo@example.com" }
  }
};
