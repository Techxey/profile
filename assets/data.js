/**
 * ============================================================
 *  data.js · 数据层（唯一数据源）
 * ------------------------------------------------------------
 *  页面所有内容都来自 window.PROFILE_DATA，这里一个字都没有，
 *  所以刚 clone 下来打开是「空档案」+ 一张引导卡。
 *
 *  填写方式（二选一）：
 *    A. 打开页面 → 点「开始填写」→ 用内置编辑器填写 → 导出 data.js
 *       → 覆盖本文件。全程不碰代码。
 *    B. 直接改本文件，参照下面的注释与 assets/data.example.js
 *
 *  三条规则：
 *    · 文字用英文双引号 "..."；数字和 true / false 不加引号
 *    · 数组里每条数据一对大括号 { }，块与块之间用逗号，最后一块不加
 *    · 任何模块留空（[] 或空字符串），页面上整块自动隐藏，不会留空卡片
 * ============================================================
 */

window.PROFILE_DATA = {
  schemaVersion: 2,

  /* ── 1. 页面信息 ───────────────────────────────────────── */
  meta: {
    pageTitle: "",                  // 浏览器标签标题，如 "张三 · 个人档案"；留空自动用姓名
    tagline: "",                    // 大标题下面那句话
    eyebrow: "PROFILE · 个人档案",  // 大标题上方的小字
    lang: "zh-CN",
    version: "2.0.0",
    updatedAt: ""                   // 页脚日期，如 "2026-11-08"
  },

  /* ── 2. 开屏动画 ───────────────────────────────────────── */
  splash: {
    enabled: true,
    eyebrow: "PROFILE",             // 开屏 logo 下方的小字
    title: "",                      // 留空 → basic.name
    subtitle: "",                   // 留空 → meta.tagline
    footer: "从 0 开始，一笔一笔写出来",  // 进度条下方文字，留空则不显示
    duration: 2400,                 // 完整版时长（毫秒）
    fastDuration: 700               // 同一会话第二次打开时的快闪时长
  },

  /* ── 3. 外观与模块 ─────────────────────────────────────
     sections 的顺序 = 页面上模块的顺序，也是导航的顺序。
     enabled:false 或该模块数据为空 → 整块隐藏（导航一起消失）。 */
  settings: {
    showEdit: true,               // 关掉后访客看不到「编辑」入口
    brand: {
      avatarMode: "logo",           // "logo" 用专属标记；"initials" 用姓名首字
      logoColors: ["#0a84ff", "#5e5ce6", "#bf5af2"],   // logo 渐变的三个色标
      avatarGradient: "linear-gradient(140deg,#64d2ff 0%,#0a84ff 48%,#5e5ce6 100%)"
    },
    sections: [
      { id: "education", enabled: true, nav: "教育", title: "教育背景", desc: "在读院校与学习方向",           tint: "purple" },
      { id: "campus",    enabled: true, nav: "实践", title: "校园实践", desc: "课程项目、竞赛与社团经历",     tint: "indigo" },
      { id: "skills",    enabled: true, nav: "技能", title: "技能标签", desc: "按能力域分组，圆点标记熟练度", tint: "pink" },
      { id: "projects",  enabled: true, nav: "作品", title: "项目作品", desc: "做过的东西",                   tint: "orange" },
      { id: "contact",   enabled: true, nav: "联系", title: "联系方式", desc: "点一下就能复制",               tint: "green" }
    ]
  },

  /* ── 4. 基本信息（左侧个人卡 + 页面大标题） ─────────────── */
  basic: {
    name: "",                       // 姓名
    nameEn: "",                     // 英文名，可留空
    title: "",                      // 职位 / 身份，如 "人工智能 · 本科在读"
    initials: "",                   // 头像文字（avatarMode 为 initials 时用），留空取姓名首字
    avatarGradient: "",             // 留空 → 用 settings.brand.avatarGradient
    location: "",                   // 城市，如 "北京 · 中国"
    status: { available: false, label: "" },   // 状态胶囊，label 留空则不显示
    bio: "",                        // 一段自我介绍
    tags: [],                       // 关键词，如 ["React", "TypeScript"]
    stats: [],                      // 统计，如 [{ label: "年限", value: 3, suffix: "年" }]
    social: []                      // 社交链接，如 [{ platform: "GitHub", icon: "github", url: "https://github.com/you" }]
  },

  /* ── 5. 教育背景 ───────────────────────────────────────
     每所学校一个块：
       school 学校 / schoolEn 英文名 / degree 学位 / major 专业
       period { start, end } / location 城市
       glyph 左侧小方块里的字 / tint 颜色 / badge 右上角徽章
       description 一句话说明 / highlights 底部小标签  */
  education: [],

  /* ── 6. 校园实践（实习 / 项目 / 竞赛 / 社团都能放） ──────
     org 组织或项目名 / orgEn 英文名 / role 你的角色 / type 类型
     period { start, end } / badge 徽章如 "进行中"
     description 说明 / achievements 成果（一条一行）/ stack 技术标签  */
  campus: [],

  /* ── 7. 技能标签 ───────────────────────────────────────
     category 组名 / icon 图标 / tint 颜色
     items: [{ name: "Python", level: 4 }]   level 1–5 决定亮几个圆点 */
  skills: [],

  /* ── 8. 项目作品 ───────────────────────────────────────
     title 名称 / subtitle 一句话 / category 类别 / year 年份
     featured: true 会横跨整行（大卡）
     cover { gradient, glyph } 封面：CSS 渐变 + 一个字
     metrics [{ label, value }] 可选 / tags[] / role 可选 / link 可选 */
  projects: [],

  /* ── 9. 联系方式 ───────────────────────────────────────
     items 每条一个：label 名称 / value 内容 / icon 图标 / tint 颜色
     copy: true 点击复制；link 点击跳转（两者可只留一个） */
  contact: {
    availability: { status: "", note: "" },   // 顶部提示条，留空则整条不显示
    items: [],
    cta: { label: "", icon: "mail", link: "" }   // 底部大按钮，label 留空则不显示
  }
};
