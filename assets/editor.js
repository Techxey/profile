/**
 * ============================================================
 *  editor.js · 可视化编辑器（可选模块）
 * ------------------------------------------------------------
 *  页面点「编辑」或 URL 加 ?edit=1 打开。
 *  改动实时写进 localStorage 并重画页面，所以：
 *    · 刷新、关掉浏览器再打开，草稿还在
 *    · 想丢掉草稿回到 data.js 的内容 → 点「恢复文件内容」
 *    · 想真正发布 → 点「导出 data.js」替换 assets/data.js
 *
 *  加了新模块怎么让编辑器也支持？
 *    1) TEMPLATES 里加一份空白条目模板
 *    2) GROUPS 里加一组字段（声明式，不用写渲染代码）
 * ============================================================
 */
(function () {
  "use strict";

  var A = window.PROFILE_APP;
  if (!A) return;

  /* ── 常量 ─────────────────────────────────────────────── */
  var TINTS = [
    { value: "blue", label: "蓝" }, { value: "green", label: "绿" },
    { value: "indigo", label: "靛" }, { value: "orange", label: "橙" },
    { value: "pink", label: "粉" }, { value: "purple", label: "紫" },
    { value: "teal", label: "青" }, { value: "yellow", label: "黄" },
    { value: "gray", label: "灰" }, { value: "red", label: "红" }
  ];
  var ICONS = ["mail", "phone", "globe", "github", "message", "pin", "code", "sparkles",
    "wrench", "briefcase", "graduation", "grid", "layers", "palette", "building",
    "info", "send", "calendar", "copy", "dribbble", "zhihu"];

  var GRADIENTS = [
    { name: "蓝紫", v: "linear-gradient(140deg,#64d2ff 0%,#0a84ff 48%,#5e5ce6 100%)" },
    { name: "日落", v: "linear-gradient(140deg,#ff9f0a 0%,#ff375f 60%,#bf5af2 100%)" },
    { name: "森绿", v: "linear-gradient(140deg,#30d158 0%,#0a84ff 100%)" },
    { name: "夜色", v: "linear-gradient(140deg,#5e5ce6 0%,#ff375f 100%)" },
    { name: "灰调", v: "linear-gradient(140deg,#8e8e93 0%,#48484a 100%)" }
  ];

  var LOGO_PRESETS = [
    { name: "默认", v: ["#0a84ff", "#5e5ce6", "#bf5af2"] },
    { name: "青绿", v: ["#30d158", "#00c7be", "#0a84ff"] },
    { name: "日落", v: ["#ff9f0a", "#ff375f", "#bf5af2"] },
    { name: "石墨", v: ["#8e8e93", "#48484a", "#1c1c1e"] }
  ];

  /* ── 小工具 ───────────────────────────────────────────── */
  var esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function clone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } }
  function getIn(obj, path) {
    var cur = obj;
    for (var i = 0; i < path.length; i++) {
      if (cur == null) return undefined;
      cur = cur[path[i]];
    }
    return cur;
  }
  function setIn(obj, path, val) {
    var cur = obj;
    for (var i = 0; i < path.length - 1; i++) {
      var k = path[i];
      if (cur[k] == null || typeof cur[k] !== "object") cur[k] = /^\d+$/.test(path[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[path[path.length - 1]] = val;
  }
  function str(v) { return v == null ? "" : String(v); }

  /* ── 新增条目时用的空白模板 ───────────────────────────── */
  var TEMPLATES = {
    stat:    { label: "", value: 0, suffix: "" },
    social:  { platform: "", icon: "github", url: "" },
    edu:     { id: "", school: "", schoolEn: "", degree: "", major: "", period: { start: "", end: "" },
               location: "", glyph: "", tint: "blue", badge: "", description: "", highlights: [] },
    campus:  { id: "", org: "", orgEn: "", role: "", type: "", period: { start: "", end: "" },
               location: "", glyph: "", tint: "indigo", badge: "", description: "", achievements: [], stack: [] },
    skillItem: { name: "", level: 3 },
    skill:   { id: "", category: "", icon: "code", tint: "blue", items: [] },
    metric:  { label: "", value: "" },
    project: { id: "", title: "", subtitle: "", category: "", year: "", featured: false,
               cover: { gradient: GRADIENTS[0].v, glyph: "" }, description: "", metrics: [], tags: [],
               role: "", link: "" },
    contactItem: { id: "", label: "", value: "", icon: "mail", tint: "blue", copy: true, link: "" },
    section: { id: "", enabled: true, nav: "", title: "", desc: "", tint: "blue" }
  };
  var ID_PREFIX = { edu: "edu", campus: "campus", skill: "sk", project: "prj", contactItem: "c" };
  function newItem(tpl) {
    var o = clone(TEMPLATES[tpl]);
    // 新模块 id 要唯一，否则锚点会冲突
    if (ID_PREFIX[tpl]) o.id = ID_PREFIX[tpl] + "-" + Math.random().toString(36).slice(2, 7);
    return o;
  }

  /* ── 表单结构（声明式） ─────────────────────────────────
     type: text | area | num | switch | select | tags | lines | color | gradient | rows
     rows 里用 tpl 指定空白模板，fields 描述每条里的字段。   */
  var GROUPS = [
    {
      id: "overview", label: "页面信息", icon: "info", desc: "大标题、标语与页脚",
      fields: [
        { k: "meta.pageTitle", label: "浏览器标签标题", ph: "张三 · 个人档案", hint: "留空自动用姓名" },
        { k: "meta.eyebrow", label: "大标题上方小字", ph: "PROFILE · 个人档案" },
        { k: "meta.tagline", label: "一句话标语", type: "area", rows: 2, ph: "用一句话说清你是谁", wide: true },
        { k: "meta.updatedAt", label: "更新日期", ph: "2026-11-08" },
        { k: "meta.version", label: "版本号", ph: "2.0.0" }
      ]
    },
    {
      id: "basic", label: "基本信息", icon: "sparkles", desc: "左侧个人卡与页面大标题",
      fields: [
        { k: "basic.name", label: "姓名", ph: "张三" },
        { k: "basic.nameEn", label: "英文名", ph: "Zhang San" },
        { k: "basic.title", label: "身份 / 职位", ph: "前端开发工程师" },
        { k: "basic.location", label: "城市", ph: "北京 · 中国" },
        { k: "basic.initials", label: "头像文字", ph: "张", hint: "头像样式选「姓名首字」时用" },
        { k: "basic.bio", label: "自我介绍", type: "area", rows: 4, ph: "两三句话说清你在做什么、想做什么", wide: true },
        { k: "basic.tags", label: "关键词", type: "tags", ph: "React, TypeScript", hint: "用逗号分隔" },
        { k: "basic.status.label", label: "状态标签", ph: "正在找工作", hint: "留空则不显示" },
        {
          k: "basic.stats", label: "数字统计", type: "rows", tpl: "stat", add: "添加一项", titleKey: "label",
          fields: [
            { k: "label", label: "说明", ph: "项目" },
            { k: "value", label: "数字", type: "num" },
            { k: "suffix", label: "后缀", ph: "个" }
          ]
        },
        {
          k: "basic.social", label: "社交链接", type: "rows", tpl: "social", add: "添加一个链接", titleKey: "platform",
          fields: [
            { k: "platform", label: "平台", ph: "GitHub" },
            { k: "icon", label: "图标", type: "select", options: ICONS },
            { k: "url", label: "链接", ph: "https://github.com/you", wide: true }
          ]
        }
      ]
    },
    {
      id: "education", label: "教育背景", icon: "graduation", desc: "学校、专业与时间",
      fields: [
        {
          k: "education", type: "rows", tpl: "edu", add: "添加一段教育经历", titleKey: "school",
          fields: [
            { k: "school", label: "学校", ph: "某某大学" },
            { k: "schoolEn", label: "英文名", ph: "Some University" },
            { k: "degree", label: "学位 / 状态", ph: "本科在读 · 大一" },
            { k: "major", label: "专业", ph: "人工智能" },
            { k: "period.start", label: "开始", ph: "2026.09" },
            { k: "period.end", label: "结束", ph: "至今" },
            { k: "location", label: "城市", ph: "承德" },
            { k: "glyph", label: "小方格里一个字", ph: "河" },
            { k: "badge", label: "徽章文字", ph: "在读" },
            { k: "tint", label: "颜色", type: "select", options: TINTS },
            { k: "description", label: "说明", type: "area", rows: 2, wide: true },
            { k: "highlights", label: "底部标签", type: "lines", rows: 2, hint: "一行一个", wide: true }
          ]
        }
      ]
    },
    {
      id: "campus", label: "校园实践", icon: "briefcase", desc: "项目、竞赛、实习、社团",
      fields: [
        {
          k: "campus", type: "rows", tpl: "campus", add: "添加一段实践", titleKey: "org",
          fields: [
            { k: "org", label: "名称", ph: "校园二手交易平台" },
            { k: "orgEn", label: "英文名", ph: "Campus Marketplace" },
            { k: "role", label: "你的角色", ph: "项目负责人" },
            { k: "type", label: "类型", ph: "大创项目" },
            { k: "period.start", label: "开始", ph: "2026.03" },
            { k: "period.end", label: "结束", ph: "至今" },
            { k: "location", label: "地点", ph: "学校" },
            { k: "glyph", label: "小方格里一个字", ph: "创" },
            { k: "badge", label: "徽章文字", ph: "进行中" },
            { k: "tint", label: "颜色", type: "select", options: TINTS },
            { k: "description", label: "说明", type: "area", rows: 2, wide: true },
            { k: "achievements", label: "做了什么", type: "lines", rows: 3, hint: "一行一条", wide: true },
            { k: "stack", label: "用到的技能", type: "lines", rows: 2, hint: "一行一个", wide: true }
          ]
        }
      ]
    },
    {
      id: "skills", label: "技能标签", icon: "palette", desc: "分组 + 熟练度 1–5",
      fields: [
        {
          k: "skills", type: "rows", tpl: "skill", add: "添加一个分组", titleKey: "category",
          fields: [
            { k: "category", label: "分组名", ph: "编程语言" },
            { k: "icon", label: "图标", type: "select", options: ICONS },
            { k: "tint", label: "颜色", type: "select", options: TINTS },
            { k: "items", label: "技能（熟练度 1–5）", type: "rows", tpl: "skillItem", add: "添加技能", titleKey: "name", wide: true,
              fields: [
                { k: "name", label: "名称", ph: "Python" },
                { k: "level", label: "熟练度", type: "num" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "projects", label: "项目作品", icon: "grid", desc: "做过的东西",
      fields: [
        {
          k: "projects", type: "rows", tpl: "project", add: "添加一个作品", titleKey: "title",
          fields: [
            { k: "title", label: "名称", ph: "课程表助手" },
            { k: "subtitle", label: "一句话说明", ph: "给同学用的课表小程序" },
            { k: "category", label: "类别", ph: "微信小程序" },
            { k: "year", label: "年份", ph: "2026" },
            { k: "featured", label: "横跨整行（大卡）", type: "switch" },
            { k: "cover.glyph", label: "封面文字", ph: "C" },
            { k: "cover.gradient", label: "封面色", type: "gradient", wide: true },
            { k: "description", label: "详细说明", type: "area", rows: 3, wide: true },
            { k: "tags", label: "标签", type: "tags", wide: true },
            { k: "role", label: "你的角色", ph: "独立开发" },
            { k: "link", label: "链接", ph: "https://…" },
            {
              k: "metrics", label: "数字展示", type: "rows", tpl: "metric", add: "添加一项", titleKey: "label", wide: true,
              fields: [
                { k: "label", label: "说明", ph: "用户" },
                { k: "value", label: "数值", ph: "200+" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "contact", label: "联系方式", icon: "mail", desc: "列表与底部按钮",
      fields: [
        { k: "contact.availability.status", label: "提示条标题", ph: "正在寻找实习机会", wide: true },
        { k: "contact.availability.note", label: "提示条说明", type: "area", rows: 2, wide: true },
        {
          k: "contact.items", type: "rows", tpl: "contactItem", add: "添加一条联系方式", titleKey: "label",
          fields: [
            { k: "label", label: "名称", ph: "邮箱" },
            { k: "value", label: "内容", ph: "you@example.com" },
            { k: "icon", label: "图标", type: "select", options: ICONS },
            { k: "tint", label: "颜色", type: "select", options: TINTS },
            { k: "copy", label: "点击复制", type: "switch" },
            { k: "link", label: "跳转链接", ph: "https://… 或 mailto:…", wide: true }
          ]
        },
        { k: "contact.cta.label", label: "底部按钮文字", ph: "邮件联系我" },
        { k: "contact.cta.icon", label: "按钮图标", type: "select", options: ICONS },
        { k: "contact.cta.link", label: "按钮链接", ph: "mailto:you@example.com", wide: true }
      ]
    },
    {
      id: "layout", label: "模块与顺序", icon: "layers", desc: "显示隐藏、排序、改标题",
      fields: [
        {
          k: "settings.sections", type: "rows", tpl: "section", titleKey: "title", noAdd: true, noDel: true,
          fields: [
            { k: "enabled", label: "显示这个模块", type: "switch" },
            { k: "nav", label: "导航文字", ph: "教育", hint: "分段控件与底部 Tab" },
            { k: "title", label: "模块标题", ph: "教育背景" },
            { k: "desc", label: "模块副标题", ph: "在读院校与学习方向" },
            { k: "tint", label: "颜色", type: "select", options: TINTS }
          ]
        }
      ]
    },
    {
      id: "brand", label: "品牌与开屏", icon: "sparkles", desc: "头像、logo 配色、开屏文案",
      fields: [
        { k: "settings.brand.avatarMode", label: "头像样式", type: "select",
          options: [{ value: "logo", label: "专属标记" }, { value: "initials", label: "姓名首字" }] },
        { k: "settings.brand.avatarGradient", label: "头像底色", type: "gradient", wide: true },
        { k: "settings.brand.logoColors.0", label: "logo 主色", type: "color" },
        { k: "settings.brand.logoColors.1", label: "logo 中间色", type: "color" },
        { k: "settings.brand.logoColors.2", label: "logo 末端色", type: "color" },
        { k: "settings.showEdit", label: "显示「编辑」入口", type: "switch",
          hint: "发布给访客看时可以关掉" },
        { k: "splash.enabled", label: "显示开屏动画", type: "switch" },
        { k: "splash.eyebrow", label: "开屏小字", ph: "PROFILE" },
        { k: "splash.footer", label: "开屏底部文字", ph: "从 0 开始，一笔一笔写出来", wide: true },
        { k: "splash.title", label: "开屏标题", ph: "留空用姓名" },
        { k: "splash.subtitle", label: "开屏副标题", ph: "留空用标语" },
        { k: "splash.duration", label: "完整时长(ms)", type: "num" },
        { k: "splash.fastDuration", label: "快闪时长(ms)", type: "num" }
      ]
    }
  ];

  /* ── 表单渲染 ─────────────────────────────────────────── */
  function fieldHTML(f, base, val) {
    var path = base.concat(f.k ? f.k.split(".") : []);
    var p = path.join(".");
    var label = f.label ? '<span class="ed-label">' + esc(f.label) + '</span>' : "";
    var hint = f.hint ? '<span class="ed-hint">' + esc(f.hint) + '</span>' : "";
    var cls = "ed-field" + (f.type === "switch" ? " ed-field-inline" : "") + (f.wide ? " ed-wide" : "");
    var ctrl;

    switch (f.type) {
      case "area":
        ctrl = '<textarea class="ed-input" rows="' + (f.rows || 3) + '" data-path="' + p +
          '" placeholder="' + esc(f.ph || "") + '">' + esc(str(val)) + '</textarea>';
        break;
      case "num":
        ctrl = '<input class="ed-input" type="number" data-path="' + p + '" value="' +
          esc(val === "" || val == null ? "" : val) + '" placeholder="' + esc(f.ph || "") + '">';
        break;
      case "switch":
        return '<div class="' + cls + '"><span class="ed-label">' + esc(f.label || "") + '</span>' +
          '<button type="button" class="ed-switch' + (val ? " is-on" : "") + '" role="switch" aria-checked="' +
          (val ? "true" : "false") + '" data-act="switch" data-path="' + p + '"><i></i></button>' + hint + '</div>';
      case "select":
        ctrl = '<select class="ed-input ed-select" data-path="' + p + '">' + (f.options || []).map(function (o) {
          var v = typeof o === "string" ? o : o.value;
          var t = typeof o === "string" ? o : o.label;
          return '<option value="' + esc(v) + '"' + (str(val) === v ? " selected" : "") + '>' + esc(t) + '</option>';
        }).join("") + '</select>';
        break;
      case "tags":
        ctrl = '<input class="ed-input" type="text" data-kind="tags" data-path="' + p + '" value="' +
          esc((val || []).join(", ")) + '" placeholder="' + esc(f.ph || "用逗号分隔") + '">';
        break;
      case "lines":
        ctrl = '<textarea class="ed-input" rows="' + (f.rows || 2) + '" data-kind="lines" data-path="' + p +
          '" placeholder="' + esc(f.ph || "一行一条") + '">' + esc((val || []).join("\n")) + '</textarea>';
        break;
      case "color":
        ctrl = '<input class="ed-color" type="color" data-path="' + p + '" value="' + esc(val || "#0a84ff") + '">';
        break;
      case "gradient":
        ctrl = '<input class="ed-input ed-mono" type="text" data-path="' + p + '" value="' + esc(str(val)) +
          '" placeholder="linear-gradient(...)">' +
          '<span class="ed-presets">' + GRADIENTS.map(function (g) {
            return '<button type="button" class="ed-swatch" style="--sw:' + g.v + '" title="' + esc(g.name) +
              '" data-act="setval" data-path="' + p + '" data-val="' + esc(g.v) + '"></button>';
          }).join("") + '</span>';
        break;
      case "rows":
        return '<div class="' + cls + '"><div class="ed-field-head">' + label + hint + '</div>' +
          repeaterHTML(f, base, val) + '</div>';
      default:
        ctrl = '<input class="ed-input" type="text" data-path="' + p + '" value="' + esc(str(val)) +
          '" placeholder="' + esc(f.ph || "") + '">';
    }
    return '<label class="' + cls + '">' + label + ctrl + hint + '</label>';
  }

  function repeaterHTML(f, base, list) {
    var path = base.concat(f.k.split("."));
    var p = path.join(".");
    var items = Array.isArray(list) ? list : [];
    var body = items.map(function (item, i) {
      var itemBase = path.concat([String(i)]);
      var title = f.titleKey ? str(getIn(item, f.titleKey.split("."))) : "";
      if (!title) title = (f.itemName || "第 " + (i + 1) + " 条");
      return '<div class="ed-item">' +
        '<div class="ed-item-head"><span class="ed-item-title">' + esc(title) + '</span>' +
          '<span class="ed-item-tools">' +
            '<button type="button" data-act="up" data-path="' + p + '" data-i="' + i + '" aria-label="上移">↑</button>' +
            '<button type="button" data-act="down" data-path="' + p + '" data-i="' + i + '" aria-label="下移">↓</button>' +
            (f.noDel ? "" : '<button type="button" class="danger" data-act="del" data-path="' + p + '" data-i="' + i + '" aria-label="删除">×</button>') +
          '</span></div>' +
        '<div class="ed-item-fields">' + (f.fields || []).map(function (cf) {
          return fieldHTML(cf, itemBase, getIn(item, cf.k.split(".")));
        }).join("") + '</div></div>';
    }).join("");

    return '<div class="ed-rep">' +
      (body || '<p class="ed-empty">还没有内容，点下面的按钮添加</p>') +
      (f.noAdd ? "" : '<button type="button" class="ed-add" data-act="add" data-path="' + p + '" data-tpl="' + f.tpl + '">＋ ' +
        esc(f.add || "添加一条") + '</button>') + '</div>';
  }

  function groupHTML(g) {
    return '<section class="ed-group" id="edg-' + g.id + '" data-group="' + g.id + '">' +
      '<div class="ed-group-head"><h3>' + esc(g.label) + '</h3><p>' + esc(g.desc || "") + '</p></div>' +
      (g.fields || []).map(function (f) {
        return fieldHTML(f, [], getIn(data, (f.k || "").split(".")));
      }).join("") + '</section>';
  }

  /* ── 状态与 DOM ───────────────────────────────────────── */
  var data = null;
  var studio, navEl, formEl, modalEl, fileEl, sourceEl;
  var pending = null, lastScroll = 0;

  function renderNav() {
    navEl.innerHTML = GROUPS.map(function (g) {
      return '<button type="button" class="ed-nav-item" data-goto="' + g.id + '">' + esc(g.label) + '</button>';
    }).join("");
  }
  function renderForm() {
    formEl.innerHTML = GROUPS.map(groupHTML).join("");
  }
  function renderAll() {
    renderNav();
    renderForm();
    formEl.scrollTop = lastScroll;
  }

  function commit() {
    if (pending) { clearTimeout(pending); pending = null; }
    A.set(data);
  }
  function schedule() {
    if (pending) clearTimeout(pending);
    pending = setTimeout(function () { pending = null; A.set(data); }, 180);
  }

  /* ── 事件 ─────────────────────────────────────────────── */
  function readValue(el) {
    if (el.dataset.kind === "tags") {
      return el.value.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    if (el.dataset.kind === "lines") {
      return el.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    }
    if (el.type === "number") return el.value === "" ? "" : Number(el.value);
    return el.value;
  }

  function onInput(e) {
    var el = e.target;
    if (!el.dataset || !el.dataset.path) return;
    if (el.tagName === "SELECT") return;      // 交给 change
    setIn(data, el.dataset.path.split("."), readValue(el));
    schedule();
  }

  function onChange(e) {
    var el = e.target;
    if (!el.dataset || !el.dataset.path) return;
    if (el.tagName !== "SELECT" && el.type !== "color") return;
    setIn(data, el.dataset.path.split("."), el.value);
    schedule();
  }

  function onClick(e) {
    var b = e.target.closest("[data-act], [data-goto]");
    if (!b) return;

    if (b.dataset.goto) {
      var target = document.getElementById("edg-" + b.dataset.goto);
      if (target) formEl.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
      return;
    }

    var act = b.dataset.act;
    var path = b.dataset.path ? b.dataset.path.split(".") : null;

    if (act === "close") { close(); return; }
    if (act === "export") { openExport(); return; }
    if (act === "import") { fileEl.click(); return; }
    if (act === "restore") {
      if (!window.confirm("丢弃本机草稿，恢复成 assets/data.js 里的内容？")) return;
      A.restoreFile();
      data = clone(A.get());
      renderAll();
      A.toast("已恢复成文件里的内容");
      return;
    }
    if (act === "closeModal") { modalEl.hidden = true; return; }
    if (act === "download") { download("data.js", sourceEl.textContent); return; }
    if (act === "copy") {
      copyText(sourceEl.textContent).then(function (ok) {
        A.toast(ok ? "已复制，粘贴到 assets/data.js 即可" : "复制失败，请手动选择", ok);
      });
      return;
    }

    if (act === "setval") {
      setIn(data, path, b.dataset.val);
      var input = formEl.querySelector('[data-path="' + b.dataset.path + '"]');
      if (input) input.value = b.dataset.val;
      commit();
      return;
    }
    if (act === "switch") {
      var cur = !!getIn(data, path);
      setIn(data, path, !cur);
      b.classList.toggle("is-on", !cur);
      b.setAttribute("aria-checked", String(!cur));
      commit();
      return;
    }

    var arr = path ? getIn(data, path) : null;
    if (!Array.isArray(arr)) return;
    var i = Number(b.dataset.i);

    if (act === "add") {
      arr.push(newItem(b.dataset.tpl));
    } else if (act === "del") {
      if (!window.confirm("删掉这一条？")) return;
      arr.splice(i, 1);
    } else if (act === "up" && i > 0) {
      arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
    } else if (act === "down" && i < arr.length - 1) {
      arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
    }
    lastScroll = formEl.scrollTop;
    commit();
    renderForm();
    formEl.scrollTop = lastScroll;
  }

  /* ── 导出 / 导入 ──────────────────────────────────────── */
  function buildSource() {
    var today = new Date().toISOString().slice(0, 10);
    return "/**\n" +
      " * data.js · 由页面编辑器导出（" + today + "）\n" +
      " * 用法：覆盖 assets/data.js 即可。\n" +
      " */\n\n" +
      "window.PROFILE_DATA = " + JSON.stringify(data, null, 2) + ";\n";
  }
  function openExport() {
    sourceEl.textContent = buildSource();
    modalEl.hidden = false;
  }
  function download(name, text) {
    try {
      var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 900);
      A.toast("已开始下载 " + name);
    } catch (e) {
      A.toast("当前环境不支持直接下载，请用「复制」", false);
    }
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand("copy"); ta.remove();
      return Promise.resolve(ok);
    } catch (e) { return Promise.resolve(false); }
  }

  function onFile(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var text = String(reader.result);
        var start = text.indexOf("{"), end = text.lastIndexOf("}");
        if (start < 0 || end < 0) throw new Error("no object");
        var obj = JSON.parse(text.slice(start, end + 1));
        if (!obj || typeof obj !== "object") throw new Error("bad");
        data = obj;
        A.set(data);
        renderAll();
        A.toast("已导入，别忘了检查预览");
      } catch (err) {
        A.toast("这个文件看不懂，请选导出的 data.js 或 JSON", false);
      }
      e.target.value = "";
    };
    reader.readAsText(f);
  }

  /* ── 打开 / 关闭 ─────────────────────────────────────── */
  function buildDOM() {
    var wrap = document.createElement("div");
    wrap.className = "studio";
    wrap.id = "studio";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="studio-head">' +
        '<div class="studio-title"><p class="eyebrow">EDITOR</p><h2>编辑档案</h2>' +
          '<p class="studio-sub">改动自动保存到本机浏览器</p></div>' +
        '<div class="studio-actions">' +
          '<button type="button" class="ed-btn" data-act="import">导入</button>' +
          '<button type="button" class="ed-btn" data-act="restore">恢复文件内容</button>' +
          '<button type="button" class="ed-btn primary" data-act="export">导出 data.js</button>' +
          '<button type="button" class="ed-icon" data-act="close" aria-label="关闭编辑器">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="studio-body"><nav class="studio-nav" id="studioNav" aria-label="编辑分组"></nav>' +
        '<div class="studio-form" id="studioForm"></div></div>' +
      '<div class="ed-modal" id="edModal" hidden>' +
        '<div class="ed-modal-card">' +
          '<h3>导出 data.js</h3>' +
          '<p>下载后覆盖 <code>assets/data.js</code>，或复制全部内容粘贴进去。这一步做完，内容才算真正写进项目（否则只存在你本机）。</p>' +
          '<pre id="edSource"></pre>' +
          '<div class="ed-modal-actions">' +
            '<button type="button" class="ed-btn primary" data-act="download">下载 data.js</button>' +
            '<button type="button" class="ed-btn" data-act="copy">复制</button>' +
            '<button type="button" class="ed-btn" data-act="closeModal">关闭</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<input type="file" id="edFile" accept=".js,.json,application/json,text/javascript" hidden>';
    document.body.appendChild(wrap);

    studio = wrap;
    navEl = wrap.querySelector("#studioNav");
    formEl = wrap.querySelector("#studioForm");
    modalEl = wrap.querySelector("#edModal");
    fileEl = wrap.querySelector("#edFile");
    sourceEl = wrap.querySelector("#edSource");

    formEl.addEventListener("input", onInput);
    formEl.addEventListener("change", onChange);
    wrap.addEventListener("click", onClick);
    fileEl.addEventListener("change", onFile);
    document.addEventListener("keydown", function (e) {
      if (studio.hidden) return;
      if (e.key === "Escape") {
        if (!modalEl.hidden) modalEl.hidden = true;
        else close();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault(); openExport();
      }
    });
  }

  function open() {
    if (!studio) buildDOM();
    data = clone(A.get());
    renderAll();
    studio.hidden = false;
    document.body.classList.add("is-editing");
    document.body.style.overflow = "hidden";
    studio.scrollTop = 0;
    if (window.innerWidth > 820) {
      var first = studio.querySelector('[data-path="basic.name"]');
      if (first) setTimeout(function () { first.focus(); first.select(); }, 220);
    }
  }
  function close() {
    if (!studio) return;
    commit();
    studio.hidden = true;
    document.body.classList.remove("is-editing");
    document.body.style.overflow = "";
  }

  window.PROFILE_STUDIO = { open: open, close: close };
})();
