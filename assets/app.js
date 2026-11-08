/**
 * ============================================================
 *  app.js · 渲染层（模块注册表 + 组件函数 + 交互）
 * ------------------------------------------------------------
 *  页面不含任何写死的内容：
 *    D = window.PROFILE_DATA            ← 唯一数据源
 *    SECTIONS                          ← 模块注册表（顺序 / 元信息 / 渲染函数）
 *    render*()                          ← 各模块的纯函数，输入数据输出 HTML
 *
 *  新增模块 = data.js 加 key + 写一个 render 函数 + SECTIONS 加一条。
 *  导航、锚点、Tab Bar、滚动高亮、入场动画会全部自动派生。
 * ============================================================
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var FILE_DATA = window.PROFILE_DATA;
  if (!FILE_DATA) { console.error("[profile] 缺少 assets/data.js"); return; }

  /* 本地草稿优先：编辑器里改完会存进 localStorage，刷新后还在。
     想丢弃草稿回到 data.js 的内容，用编辑器里的「恢复文件内容」。 */
  var STORE_KEY = "profile-draft-v2";
  function readDraft() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && typeof o === "object") ? o : null;
    } catch (e) { return null; }
  }
  function deepClone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } }

  var D = readDraft() || FILE_DATA;
  var storageWarned = false;

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var TINTS = ["blue", "green", "indigo", "orange", "pink", "purple", "teal", "yellow", "gray", "red"];
  var accent = function (k) { return "var(--" + (TINTS.indexOf(k) > -1 ? k : "blue") + ")"; };

  /* ── 图标库（SF Symbols 风格线性图标，全部内联，无外部依赖） ── */
  var ICONS = {
    graduation: '<path d="M2.5 8.4 12 4l9.5 4.4L12 12.8 2.5 8.4Z"/><path d="M6.5 10.5V15c0 1.5 2.4 2.8 5.5 2.8s5.5-1.3 5.5-2.8v-4.5"/><path d="M21.5 8.4v5.4"/>',
    briefcase: '<rect x="2.5" y="6.5" width="19" height="13" rx="2.5"/><path d="M8.5 6.5V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/><path d="M2.5 12.5h19"/><path d="M12 11v3"/>',
    sparkles: '<path d="m12 2.5 1.9 5.1L19 9.5l-5.1 1.9L12 16.5l-1.9-5.1L5 9.5l5.1-1.9L12 2.5Z"/><path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/><path d="m5 15 .6 1.6 1.6.6-1.6.6L5 19.4l-.6-1.6-1.6-.6 1.6-.6L5 15Z"/>',
    grid: '<rect x="2.5" y="2.5" width="8" height="8" rx="2"/><rect x="13.5" y="2.5" width="8" height="8" rx="2"/><rect x="2.5" y="13.5" width="8" height="8" rx="2"/><rect x="13.5" y="13.5" width="8" height="8" rx="2"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    moon: '<path d="M20 14.4A8.5 8.5 0 0 1 9.6 4a8.5 8.5 0 1 0 10.4 10.4Z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.8v2.4M12 19.8v2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7"/>',
    layers: '<path d="m12 2.5 9.5 5-9.5 5-9.5-5 9.5-5Z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 16.5 9.5 5 9.5-5"/>',
    pencil: '<path d="m4 20 4.6-1.1L19 8.5a2.4 2.4 0 0 0-3.4-3.4L5.1 15.4 4 20Z"/><path d="m14.5 6.5 3.4 3.4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    copy: '<rect x="8" y="8" width="12.5" height="12.5" rx="2.5"/><path d="M15.5 8V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUp: '<path d="M7 17 17 7M8 7h9v9"/>',
    pin: '<path d="M12 21.5s7-6.1 7-11.2a7 7 0 1 0-14 0c0 5.1 7 11.2 7 11.2Z"/><circle cx="12" cy="10" r="2.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    message: '<path d="M20.5 12.2c0 4.3-3.8 7.8-8.5 7.8-1.1 0-2.2-.2-3.2-.5L3.5 21l1.4-4.3A7.4 7.4 0 0 1 3.5 12.2C3.5 7.9 7.3 4.4 12 4.4s8.5 3.5 8.5 7.8Z"/>',
    globe: '<circle cx="12" cy="12" r="9.2"/><path d="M2.8 12h18.4M12 2.8c2.5 2.6 3.8 5.8 3.8 9.2s-1.3 6.6-3.8 9.2c-2.5-2.6-3.8-5.8-3.8-9.2S9.5 5.4 12 2.8Z"/>',
    github: '<path d="M9 20.5c-4.5 1.3-4.5-2.3-6.3-2.8M15.5 22v-3.5a3.3 3.3 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.2-.4-3.8 1.4a13 13 0 0 0-6.8 0C6 1.6 4.8 2 4.8 2a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.1 6.4 6.1 6.7a3.3 3.3 0 0 0-.9 2.6V22"/>',
    dribbble: '<circle cx="12" cy="12" r="9.2"/><path d="M5 6.5c3.6 4.1 8.2 6.4 14 6.9M3 13.5c4.8-1.6 9.6-.4 13.2 4.6M8.5 3.4c4 4 6.8 9 7.6 17"/>',
    zhihu: '<circle cx="12" cy="12" r="9.2"/><path d="M8 8h5.5M11.5 8v7.5l-2.8 1M9 11h4M15 9.5h1.5v7"/>',
    palette: '<path d="M12 2.8a9.2 9.2 0 1 0 0 18.4c1.3 0 2-.9 2-1.9 0-1.4-1.1-1.9-1.1-3 0-.9.7-1.6 1.7-1.6h1.9A4.7 4.7 0 0 0 21.2 10 7.8 7.8 0 0 0 12 2.8Z"/><circle cx="7.3" cy="11" r="1"/><circle cx="9.6" cy="7.3" r="1"/><circle cx="14.2" cy="7" r="1"/><circle cx="17.4" cy="9.6" r="1"/>',
    code: '<path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.8 4.5l-3.6 15"/>',
    wrench: '<path d="M20.4 6.6a5 5 0 0 1-6.6 6.4l-7.5 7.5a2.1 2.1 0 0 1-3-3l7.5-7.5a5 5 0 0 1 6.4-6.6l-3 3 2.6 2.6 3.6-3.4Z"/>',
    phone: '<path d="M7.2 3.5h2l1.3 4-2 1.3a13 13 0 0 0 6.7 6.7l1.3-2 4 1.3v2a2.5 2.5 0 0 1-2.7 2.5A16.6 16.6 0 0 1 4.7 6.2a2.5 2.5 0 0 1 2.5-2.7Z"/>',
    info: '<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.5M12 7.6h.01"/>',
    send: '<path d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1.5M13.5 7H15M9 11h1.5M13.5 11H15M9 15h1.5M13.5 15H15M10 21v-3h4v3"/>'
  };
  var icon = function (name, size) {
    var s = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || ICONS.sparkles) + '</svg>';
  };
  var period = function (p) { return esc((p && p.start) || "") + " — " + esc((p && p.end) || ""); };

  /* ══ 专属 Logo ══════════════════════════════════════════
     两段路径：开口圆环（0） + 从缺口甩出的一笔（一） + 末端节点。
     含义：从 0 开始，一笔一笔写出来；也暗合计算机里最基本的 0 与 1。
     改形状只需改下面三个常量：路径长度在运行时由 getTotalLength()
     量出并写进 --len，所以描绘动画的参数不用跟着改。            */
  var LOGO_ARC    = "M 74 44 A 34 34 0 0 0 16 68 A 34 34 0 0 0 74 92";
  var LOGO_STROKE = "M 74 44 L 110 8";
  var LOGO_DOT    = { x: 110, y: 8, r: 6 };
  function logoMarkup(variant, animated) {
    var cls = "logo" + (variant ? " " + variant : "") + (animated ? " logo--animated" : "");
    return '<svg class="' + cls + '" viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
      '<path class="logo-arc" d="' + LOGO_ARC + '"/>' +
      '<path class="logo-stroke" d="' + LOGO_STROKE + '"/>' +
      (animated ? '<path class="logo-spark" d="' + LOGO_ARC + '"/>' : "") +
      '<circle class="logo-dot" cx="' + LOGO_DOT.x + '" cy="' + LOGO_DOT.y +
        '" r="' + LOGO_DOT.r + '"/>' +
    '</svg>';
  }
  function initLogoLength(root) {
    $$(".logo--animated path", root).forEach(function (p) {
      var len = 400;
      try { if (p.getTotalLength) len = Math.ceil(p.getTotalLength()) + 1; } catch (e) {}
      p.style.setProperty("--len", len);
      p.style.setProperty("--sparkTo", -len);
    });
  }

  /* ══ 模块 01 · 基本信息 ══════════════════════════════ */
  function renderBasic(b) {
    b = b || {};
    var tags = (b.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("");
    var stats = (b.stats || []).map(function (s) {
      return '<div class="stat"><span class="stat-value"><span class="num" data-count="' +
        (Number(s.value) || 0) + '">0</span><span class="suffix">' + esc(s.suffix || "") +
        '</span></span><span class="stat-label">' + esc(s.label) + '</span></div>';
    }).join("");
    var socials = (b.social || []).map(function (s) {
      return '<a class="social-btn" href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' +
        esc(s.platform) + '" aria-label="' + esc(s.platform) + '">' + icon(s.icon, 17) + '</a>';
    }).join("");

    return '<div class="card profile-card" data-reveal style="--d:0ms">' +
      '<div class="avatar-wrap"><span class="avatar-ring"></span>' +
        '<div class="avatar" style="background:' + esc(avatarBg(b)) + '">' + avatarInner() + '</div></div>' +
      (b.name ? '<h2 class="profile-name">' + esc(b.name) + '</h2>' : "") +
      (b.nameEn ? '<p class="profile-name-en">' + esc(b.nameEn) + '</p>' : "") +
      (b.title ? '<p class="profile-title">' + esc(b.title) + '</p>' : "") +
      (b.status && b.status.label ? '<span class="status-pill"><span class="pulse"></span>' + esc(b.status.label) + '</span>' : "") +
      (b.bio ? '<p class="profile-bio">' + esc(b.bio) + '</p>' : "") +
      (tags ? '<div class="profile-tags">' + tags + '</div>' : "") +
      (stats ? '<div class="stats">' + stats + '</div>' : "") +
      (socials ? '<div class="social-row">' + socials + '</div>' : "") +
    '</div>';
  }

  /* ══ 通用时间轴（教育 / 校园实践 / 工作经历共用） ══════
     字段按优先级自动识别，所以换模块只需要换数据，不用改渲染：
       org | company | school     组织名
       orgEn | companyEn | ...    英文名
       role | degree + major      副标题
       badge | current            右上角小徽章
       achievements               成果要点
       stack | highlights         底部标签                       */
  function renderTimeline(items) {
    return '<div class="timeline">' + (items || []).map(function (x, i) {
      var org = x.org || x.company || x.school || "";
      var orgEn = x.orgEn || x.companyEn || x.schoolEn || "";
      var role = x.role || [x.degree, x.major].filter(Boolean).join(" · ");
      var badge = x.badge || (x.current ? "在职" : "");
      var bullets = x.achievements || [];
      var chipList = x.stack || x.highlights || [];
      return '<article class="tl-item" style="--i:' + i + ';--accent:' + accent(x.tint) + '">' +
        '<span class="tl-dot"></span>' +
        '<div class="tl-head"><span class="tl-glyph">' + esc(x.glyph || "·") + '</span>' +
          '<div class="tl-main"><h3 class="tl-org">' + esc(org) +
            (orgEn ? ' <span class="tl-org-en">' + esc(orgEn) + '</span>' : "") +
            (badge ? '<span class="current-badge">' + esc(badge) + '</span>' : "") + '</h3>' +
            '<p class="tl-role">' + esc(role) + (x.type ? ' · ' + esc(x.type) : "") + '</p>' +
            '<div class="tl-meta"><span>' + icon("calendar", 12) + period(x.period) + '</span>' +
              (x.location ? '<span>' + icon("pin", 12) + esc(x.location) + '</span>' : "") + '</div>' +
          '</div></div>' +
        (x.description ? '<p class="tl-desc">' + esc(x.description) + '</p>' : "") +
        (bullets.length ? '<ul class="tl-list">' + bullets.map(function (a) {
          return '<li>' + esc(a) + '</li>'; }).join("") + '</ul>' : "") +
        (chipList.length ? '<div class="chip-row">' + chipList.map(function (c) {
          return '<span class="chip">' + esc(c) + '</span>'; }).join("") + '</div>' : "") +
      '</article>';
    }).join("") + '</div>';
  }
  function renderEducation(d) { return renderTimeline(d); }
  function renderCampus(d)    { return renderTimeline(d); }

  /* ══ 模块 04 · 技能标签 ══════════════════════════════ */
  function renderSkills(groups) {
    var body = (groups || []).map(function (g, gi) {
      var items = (g.items || []).map(function (it) {
        var lv = Math.max(1, Math.min(5, Number(it.level) || 3));
        var dots = "";
        for (var k = 1; k <= 5; k++) dots += '<i class="level-dot' + (k <= lv ? " on" : "") + '"></i>';
        return '<span class="skill-tag" title="' + esc(it.name) + ' · 熟练度 ' + lv + '/5">' +
          esc(it.name) + '<i class="level-dots">' + dots + '</i></span>';
      }).join("");
      return '<div class="skill-group" style="--i:' + gi + ';--accent:' + accent(g.tint) + '">' +
        '<div class="skill-head"><span class="skill-icon">' + icon(g.icon, 15) + '</span>' +
          '<span class="skill-cat">' + esc(g.category) + '</span>' +
          '<span class="skill-count">' + (g.items || []).length + ' 项</span></div>' +
        '<div class="skill-items">' + items + '</div></div>';
    }).join("");
    return '<div class="skill-groups">' + body + '</div>' +
      '<p class="skill-legend">' + icon("info", 13) + ' 标签后的圆点表示熟练度（1–5 级），可直接修改数据中的 level 字段</p>';
  }

  /* ══ 模块 05 · 项目作品 ══════════════════════════════ */
  function renderProjects(list) {
    return '<div class="projects-grid">' + (list || []).map(function (p, i) {
      var cover = p.cover || {};
      var metrics = (p.metrics || []).map(function (m) {
        return '<div class="metric"><span class="metric-value">' + esc(m.value) +
          '</span><span class="metric-label">' + esc(m.label) + '</span></div>';
      }).join("");
      var tags = (p.tags || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join("");
      var inner =
        '<div class="project-cover" style="--cover:' + esc(cover.gradient) + '">' +
          '<span class="cover-pattern"></span><span class="cover-glyph">' + esc(cover.glyph || "P") + '</span>' +
          (p.category ? '<span class="cover-badge">' + esc(p.category) + '</span>' : "") +
          (p.year ? '<span class="cover-year">' + esc(p.year) + '</span>' : "") + '</div>' +
        '<div class="project-body"><h3 class="project-title">' + esc(p.title) + '</h3>' +
          (p.subtitle ? '<p class="project-sub">' + esc(p.subtitle) + '</p>' : "") +
          (p.description ? '<p class="project-desc">' + esc(p.description) + '</p>' : "") +
          (metrics ? '<div class="project-metrics">' + metrics + '</div>' : "") +
          (tags ? '<div class="project-tags">' + tags + '</div>' : "") +
          '<div class="project-foot"><span class="project-role">' + esc(p.role || "") + '</span>' +
            '<span class="project-cta">查看项目 ' + icon("arrowUp", 14) + '</span></div></div>';
      var cls = 'project' + (p.featured ? ' is-featured' : '');
      var attrs = 'class="' + cls + '" style="--i:' + i + '"';
      return p.link
        ? '<a ' + attrs + ' href="' + esc(p.link) + '" target="_blank" rel="noopener" aria-label="' + esc(p.title) + '">' + inner + '</a>'
        : '<div ' + attrs + '>' + inner + '</div>';
    }).join("") + '</div>';
  }

  /* ══ 模块 06 · 联系方式 ══════════════════════════════ */
  function renderContact(c) {
    c = c || {};
    var a = c.availability || {};
    var note = a.status || a.note
      ? '<div class="contact-note">' + icon("info", 18) + '<div><strong>' + esc(a.status || "") +
        '</strong><p>' + esc(a.note || "") + '</p></div></div>' : "";
    var rows = (c.items || []).map(function (it, i) {
      var action = it.copy
        ? '<span class="copy-hint">点击复制</span>' + icon("copy", 15)
        : (it.link ? icon("chevron", 15) : "");
      return '<button type="button" class="list-row" style="--i:' + i + ';--accent:' + accent(it.tint) + '"' +
        (it.copy ? ' data-copy="' + esc(it.value) + '"' : "") +
        (it.link && !it.copy ? ' data-link="' + esc(it.link) + '"' : "") + '>' +
        '<span class="list-icon">' + icon(it.icon, 16) + '</span>' +
        '<span class="list-text"><span class="list-label">' + esc(it.label) + '</span>' +
          '<span class="list-value">' + esc(it.value) + '</span></span>' +
        '<span class="list-action">' + action + '</span></button>';
    }).join("");
    var cta = c.cta
      ? '<a class="cta-btn" href="' + esc(c.cta.link) + '">' + icon(c.cta.icon || "send", 17) +
        esc(c.cta.label) + '</a>' : "";
    return note + '<div class="list-group">' + rows + '</div>' + cta;
  }

  /* ══ 模块注册表 · 只描述「怎么画」 ═════════════════════
     顺序 / 显示隐藏 / 标题文案 由 data.settings.sections 决定，
     两者解耦：改顺序、改文案、关模块都不用碰渲染代码。   */
  var REG = {
    education: { nav: "教育", title: "教育背景", desc: "在读院校与学习方向",       icon: "graduation", tint: "purple", render: renderEducation, count: function (d) { return (d || []).length + " 段"; } },
    campus:    { nav: "实践", title: "校园实践", desc: "课程项目、竞赛与社团经历", icon: "briefcase",  tint: "indigo", render: renderCampus,    count: function (d) { return (d || []).length + " 项"; } },
    skills:    { nav: "技能", title: "技能标签", desc: "按能力域分组，圆点标记熟练度", icon: "sparkles", tint: "pink", render: renderSkills,    count: function (d) { return (d || []).reduce(function (n, g) { return n + ((g.items || []).length); }, 0) + " 项"; } },
    projects:  { nav: "作品", title: "项目作品", desc: "做过的东西",               icon: "grid",       tint: "orange", render: renderProjects,  count: function (d) { return (d || []).length + " 个"; } },
    contact:   { nav: "联系", title: "联系方式", desc: "点一下就能复制",           icon: "mail",       tint: "green",  render: renderContact }
  };
  var ORDER = ["education", "campus", "skills", "projects", "contact"];

  function hasData(v) {
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return true;
    return !!String(v).trim();
  }
  function contactFilled(c) {
    if (!c) return false;
    var a = c.availability || {};
    return !!(String(a.status || "").trim() || String(a.note || "").trim() ||
      (c.items || []).length || String((c.cta || {}).label || "").trim());
  }
  function sectionFilled(id, v) { return id === "contact" ? contactFilled(v) : hasData(v); }

  /* 用 settings.sections 的顺序与显隐，合并默认元信息，过滤掉空模块 */
  function resolveSections() {
    var conf = (D.settings && Array.isArray(D.settings.sections)) ? D.settings.sections : [];
    var map = {};
    conf.forEach(function (c) { if (c && c.id) map[c.id] = c; });
    var order = conf.map(function (c) { return c && c.id; }).filter(Boolean);
    ORDER.forEach(function (id) { if (order.indexOf(id) === -1) order.push(id); });

    var out = [];
    order.forEach(function (id) {
      var r = REG[id];
      if (!r) return;
      var c = map[id] || {};
      if (c.enabled === false) return;
      var data = D[id];
      if (!sectionFilled(id, data)) return;
      out.push({
        id: id,
        nav: c.nav || r.nav,
        title: c.title || r.title,
        desc: c.desc || r.desc,
        icon: r.icon,
        tint: c.tint || r.tint,
        render: r.render,
        count: r.count,
        data: data
      });
    });
    return out;
  }

  /* 什么都没填 → 展示引导卡，而不是一堆空卡片 */
  function isBlank() {
    var b = D.basic || {};
    if (String(b.name || "").trim()) return false;
    if (String(b.title || "").trim()) return false;
    if (String(b.bio || "").trim()) return false;
    for (var i = 0; i < ORDER.length; i++) {
      if (sectionFilled(ORDER[i], D[ORDER[i]])) return false;
    }
    return true;
  }

  /* ══ 品牌：头像样式与 logo 渐变都来自 data.settings.brand ══ */
  var DEFAULT_AVATAR = "linear-gradient(140deg,#64d2ff 0%,#0a84ff 48%,#5e5ce6 100%)";
  function brand() { return (D.settings && D.settings.brand) || {}; }
  function avatarBg(b) {
    return (b && b.avatarGradient) || brand().avatarGradient || DEFAULT_AVATAR;
  }
  function avatarInner() {
    if (brand().avatarMode === "initials") {
      var b = D.basic || {};
      var t = String(b.initials || b.name || "").trim().slice(0, 2);
      return '<span class="avatar-text">' + esc(t || "·") + '</span>';
    }
    return logoMarkup("logo--light");
  }
  function applyBrand() {
    var cols = brand().logoColors || ["#0a84ff", "#5e5ce6", "#bf5af2"];
    $$("#logoGradient stop").forEach(function (s, i) {
      if (cols[i]) s.setAttribute("stop-color", cols[i]);
    });
  }

  /* ══ 主渲染（可重复调用：编辑器每次改动都会重画整页） ══ */
  var ACTIVE = [];
  function renderAll() {
    ACTIVE = resolveSections();
    var blank = isBlank();
    document.body.classList.toggle("is-empty", blank);

    var b = D.basic || {}, m = D.meta || {};
    var name = String(b.name || "").trim();

    document.title = m.pageTitle || (name ? name + " · 个人档案" : "个人档案 · Profile");
    $("#pageEyebrow").textContent = m.eyebrow || "PROFILE · 个人档案";
    $("#pageTitle").textContent = name || "个人档案";
    $("#pageTagline").textContent = m.tagline ||
      (blank ? "还没有内容 —— 点「开始填写」，两分钟就能变成你自己的档案。" : "");
    $("#navBrandText").textContent = name || "个人档案";
    $("#navAvatar").style.background = avatarBg(b);
    $("#navAvatar").innerHTML = avatarInner();

    var chips = [];
    if (b.location) chips.push('<span class="meta-chip">' + icon("pin", 13) + esc(b.location) + '</span>');
    if (b.status && b.status.label) chips.push('<span class="meta-chip"><span class="dot"></span>' + esc(b.status.label) + '</span>');
    if (b.title) chips.push('<span class="meta-chip">' + icon("briefcase", 13) + esc(b.title) + '</span>');
    $("#pageMeta").innerHTML = chips.join("");

    $("#sidebar").innerHTML = blank ? "" : renderBasic(b);

    $("#content").innerHTML = ACTIVE.map(function (s, i) {
      return '<section class="section card" id="' + s.id + '" data-reveal style="--d:' + (i * 85) + 'ms;--accent:' + accent(s.tint) + '">' +
        '<div class="section-head"><span class="section-icon">' + icon(s.icon, 19) + '</span>' +
          '<div class="section-titles"><h2 class="section-title">' + esc(s.title) +
            (s.count ? '<span class="section-count">' + esc(s.count(s.data)) + '</span>' : "") + '</h2>' +
            '<p class="section-desc">' + esc(s.desc) + '</p></div></div>' +
        s.render(s.data) + '</section>';
    }).join("");

    var seg = $("#segmented"), tab = $("#tabbar");
    var showNav = !blank && ACTIVE.length > 0;
    seg.hidden = !showNav;
    tab.hidden = !showNav;
    seg.innerHTML = '<span class="segment-thumb" id="segmentThumb"></span>' + (showNav ? ACTIVE.map(function (s) {
      return '<a class="segment" href="#' + s.id + '" data-target="' + s.id + '">' + esc(s.nav) + '</a>';
    }).join("") : "");
    tab.innerHTML = showNav ? ACTIVE.map(function (s) {
      return '<a class="tab" href="#' + s.id + '" data-target="' + s.id + '">' + icon(s.icon, 19) +
        '<span>' + esc(s.nav) + '</span></a>';
    }).join("") : "";

    $("#onboarding").hidden = !blank;
    // 发布给访客看时可以关掉编辑入口（编辑器 → 品牌与开屏 → 显示编辑入口）
    var showEdit = !(D.settings && D.settings.showEdit === false);
    ["#editBtn", "#footerEdit"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.hidden = !showEdit;
    });
    $("#footerMeta").textContent = ["v" + (m.version || "2.0.0"),
      m.updatedAt ? "更新于 " + m.updatedAt : ""].filter(Boolean).join(" · ");
    $("#jsonPreview").textContent = JSON.stringify(D, null, 2);

    thumb = $("#segmentThumb");
    currentId = "";
    bindNav();
    if (ACTIVE.length) setActive(ACTIVE[0].id);
    initReveal();
    scheduleSafety();
  }

  /* ══ 交互：入场揭示 + 数字滚动 ═══════════════════════ */
  var revealIO = null;
  function initReveal() {
    var nodes = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      $$(".num").forEach(function (n) { n.textContent = n.dataset.count; });
      return;
    }
    if (revealIO) revealIO.disconnect();
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        $$(".num", e.target).forEach(countUp);
        revealIO.unobserve(e.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -28px 0px" });
    nodes.forEach(function (n) { revealIO.observe(n); });
  }
  function countUp(el) {
    var raw = el.dataset.count || "0";
    var target = Number(raw) || 0;
    // GPA 这类小数不能被 Math.round 抹掉，按原始数据的小数位数格式化
    var decimals = (raw.split(".")[1] || "").length;
    var fmt = function (n) { return decimals ? n.toFixed(decimals) : String(Math.round(n)); };
    var dur = 1000, done = false;
    // 兜底：rAF 被后台节流 / 截图工具中断时，仍保证最终值正确
    var guard = setTimeout(function () { done = true; el.textContent = fmt(target); }, dur + 150);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearTimeout(guard); el.textContent = fmt(target); return;
    }
    var t0 = null;
    function step(t) {
      if (done) return;
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
      else { done = true; clearTimeout(guard); el.textContent = fmt(target); }
    }
    requestAnimationFrame(step);
  }

  /* ══ 安全兜底：确保任何环境下内容都不会留白 ═══════════
     入场动画是增强项，不该成为内容可见性的前置条件。
     每次重画都会重新计时，所以编辑器改完马上能看到终态。   */
  var safetyTimer = null;
  function scheduleSafety() {
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(function () {
      $$("[data-reveal]:not(.is-visible)").forEach(function (n) {
        n.classList.add("is-visible", "force-show");
        $$(".num", n).forEach(countUp);
      });
      $$(".tl-item, .skill-group, .project, .list-row, .contact-note")
        .forEach(function (n) { n.classList.add("anim-settled"); });
    }, 1500);
  }
  function initSafetyNet() {
    document.addEventListener("animationend", function (e) {
      if (e.animationName === "childIn") e.target.classList.add("anim-settled");
    });
    scheduleSafety();
  }

  /* ══ 交互：导航 / 滚动 ═══════════════════════════════ */
  var nav, largeTitle, segmented, thumb, ticking = false, currentId = "";
  function moveThumb() {
    if (!segmented || !thumb) return;
    var active = $(".segment.is-active", segmented);
    if (!active || !active.offsetWidth) return;
    thumb.style.width = active.offsetWidth + "px";
    thumb.style.transform = "translateX(" + active.offsetLeft + "px)";
  }
  function setActive(id) {
    if (id === currentId) return;
    currentId = id;
    $$(".segment").forEach(function (e) { e.classList.toggle("is-active", e.dataset.target === id); });
    $$(".tab").forEach(function (e) { e.classList.toggle("is-active", e.dataset.target === id); });
    moveThumb();
  }
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("is-scrolled", y > 18);
    var t = Math.min(1, y / 130);
    largeTitle.style.opacity = String(1 - t);
    largeTitle.style.transform = "translateY(" + (-t * 16) + "px) scale(" + (1 - t * 0.03) + ")";
    largeTitle.style.pointerEvents = t > 0.92 ? "none" : "auto";

    var line = y + (window.innerWidth <= 820 ? 170 : 150);
    if (!ACTIVE.length) { ticking = false; return; }
    var active = ACTIVE[0].id;
    ACTIVE.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top + y <= line) active = s.id;
    });
    setActive(active);
    ticking = false;
  }
  /* 分段控件与 Tab 每次重画都是新节点，所以重新绑定 */
  function bindNav() {
    segmented = $("#segmented");
    $$(".segment").forEach(function (a) {
      a.addEventListener("click", function () {
        setActive(a.dataset.target);
        // 只滚动分段控件自身，不带动整页（移动端它是 fixed 容器）
        var target = Math.max(0, a.offsetLeft - (segmented.clientWidth - a.offsetWidth) / 2);
        if (segmented.scrollTo) segmented.scrollTo({ left: target, behavior: "smooth" });
        else segmented.scrollLeft = target;
      });
    });
    $$(".tab").forEach(function (a) { a.addEventListener("click", function () { setActive(a.dataset.target); }); });
    requestAnimationFrame(moveThumb);
  }
  /* 只绑定一次：滚动与尺寸变化 */
  function initScroll() {
    nav = $("#nav"); largeTitle = $("#largeTitle"); segmented = $("#segmented"); thumb = $("#segmentThumb");
    if (ACTIVE.length) setActive(ACTIVE[0].id);
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener("resize", moveThumb, { passive: true });
    window.addEventListener("load", moveThumb);   // 字体加载完再校准一次分段控件滑块
    onScroll();
  }

  /* ══ 交互：主题 ══════════════════════════════════════ */
  function readStore(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function writeStore(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    $("#themeIcon").innerHTML = icon(t === "dark" ? "sun" : "moon", 17);
  }
  function initTheme() {
    var saved = readStore("profile-theme");
    var sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    // 支持 ?theme=dark / ?theme=light，便于分享固定外观的链接与预览
    var query = new URLSearchParams(window.location.search).get("theme");
    var forced = (query === "dark" || query === "light") ? query : null;
    applyTheme(forced || saved || sys);
    $("#themeToggle").addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next); writeStore("profile-theme", next);
    });
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (e) { if (!readStore("profile-theme")) applyTheme(e.matches ? "dark" : "light"); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
    // 首帧禁用过渡：主题在加载时确定，不该看到浅色→深色的半程混色
    setTimeout(function () { document.documentElement.classList.add("theme-ready"); }, 60);
  }

  /* ══ 交互：复制 / Toast ══════════════════════════════ */
  var toastTimer;
  function toast(msg, ok) {
    var el = $("#toast");
    el.innerHTML = icon(ok === false ? "info" : "check", 15) + "<span>" + esc(msg) + "</span>";
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 2100);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand("copy"); ta.remove(); return ok;
    } catch (e) { return false; }
  }
  function initCopy() {
    document.addEventListener("click", function (e) {
      var row = e.target.closest && e.target.closest(".list-row");
      if (row && row.dataset.copy) {
        copyText(row.dataset.copy).then(function (ok) {
          toast(ok ? "已复制：" + row.dataset.copy : "复制失败，请手动选择", ok);
        });
        return;
      }
      if (row && row.dataset.link) { window.open(row.dataset.link, "_blank", "noopener"); }
    });
    $("#copyJson").addEventListener("click", function () {
      copyText($("#jsonPreview").textContent).then(function (ok) {
        toast(ok ? "数据源 JSON 已复制" : "复制失败", ok);
      });
    });
  }

  /* ══ 交互：结构说明 Sheet ════════════════════════════ */
  function initSheet() {
    var sheet = $("#structureSheet"), backdrop = $("#sheetBackdrop");
    var closeTimer;
    function open() {
      clearTimeout(closeTimer);
      sheet.hidden = false; backdrop.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () { sheet.classList.add("is-open"); backdrop.classList.add("is-open"); });
      $("#sheetClose").focus();
    }
    function close() {
      sheet.classList.remove("is-open"); backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
      closeTimer = setTimeout(function () { sheet.hidden = true; backdrop.hidden = true; }, 500);
      $("#structureBtn").focus();
    }
    $("#structureIcon").innerHTML = icon("layers", 17);
    $("#sheetClose").innerHTML = icon("x", 17);
    $("#structureBtn").addEventListener("click", open);
    $("#sheetClose").addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !sheet.hidden) close();
    });
    // ?sheet=1 可直接分享「框架结构说明」视图
    if (new URLSearchParams(window.location.search).get("sheet") === "1") open();
  }

  /* ══ 交互：开屏动画 ═══════════════════════════════════
     开屏期间内容保持待入场状态；退场与内容入场同时启动，
     两段动画交叠，避免出现一帧空白。 */
  function initSplash(done) {
    var cfg = D.splash || {};
    var el = $("#splash");
    var q = new URLSearchParams(window.location.search);
    var mode = q.get("splash");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 可跳过的场景：配置关闭 / 空档案 / ?nosplash=1 / 结构说明直达 / 系统要求减弱动效
    if (!el || cfg.enabled === false || isBlank() || q.get("nosplash") === "1" ||
        q.get("sheet") === "1" || reduce) {
      if (el) el.hidden = true;
      done();
      return;
    }

    var b = D.basic || {};
    var m = D.meta || {};
    $("#splashLogo").innerHTML = logoMarkup("", true);
    initLogoLength(el);                 // 先量路径长度，描绘动画才不会算错
    $("#splashEyebrow").textContent = cfg.eyebrow || "PROFILE";
    $("#splashName").textContent = cfg.title || b.name || "";
    $("#splashSub").textContent = cfg.subtitle || m.tagline || "";
    $("#splashFooter").textContent = cfg.footer || "";

    var hold = mode === "hold";
    var seen = false;
    try { seen = sessionStorage.getItem("profile-splash-seen") === "1"; } catch (e) {}
    var fast = !hold && mode !== "1" && seen;   // 同会话第二次起走快闪版
    if (fast) el.classList.add("is-fast");
    if (hold) el.classList.add("is-hold");
    try { sessionStorage.setItem("profile-splash-seen", "1"); } catch (e) {}

    document.body.style.overflow = "hidden";
    var finished = false, timer = null, leaveMs = fast ? 280 : 620;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      el.classList.add("is-leaving");
      done();
      setTimeout(function () { el.hidden = true; document.body.style.overflow = ""; }, leaveMs);
    }
    el.addEventListener("click", finish);                 // 轻点跳过
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") finish(); });
    if (!hold) {
      timer = setTimeout(finish, fast ? (cfg.fastDuration || 700) : (cfg.duration || 2300));
    }
  }

  /* ══ 启动 ═══════════════════════════════════════════ */
  var contentStarted = false;
  function startContent() {
    if (contentStarted) return;
    contentStarted = true;
    initReveal();
    initSafetyNet();
  }

  function initChrome() {
    var ic = $("#editIcon"); if (ic) ic.innerHTML = icon("pencil", 17);
    var ob = $("#obLogo"); if (ob) ob.innerHTML = logoMarkup("");
    var open = function () { if (window.PROFILE_STUDIO) window.PROFILE_STUDIO.open(); };
    [$("#editBtn"), $("#btnStartEdit"), $("#footerEdit")].forEach(function (b) {
      if (b) b.addEventListener("click", open);
    });
    var demo = $("#btnTryExample");
    if (demo) demo.addEventListener("click", function () {
      if (!window.PROFILE_EXAMPLE) { toast("示例数据没加载到", false); return; }
      setData(deepClone(window.PROFILE_EXAMPLE));
      toast("已载入示例数据，进编辑器就能改成你自己的");
    });
  }

  /* ══ 对外 API：给编辑器（editor.js）用 ═══════════════
     只暴露「读数据 / 写数据 / 重画」，编辑器不需要知道渲染细节。 */
  function setData(next) {
    D = next || {};
    try { localStorage.setItem(STORE_KEY, JSON.stringify(D)); }
    catch (e) {
      if (!storageWarned) {
        storageWarned = true;
        toast("这台浏览器不允许本地保存，改完记得导出 data.js", false);
      }
    }
    applyBrand();
    renderAll();
  }
  window.PROFILE_APP = {
    get: function () { return D; },
    fileData: function () { return deepClone(FILE_DATA); },
    set: setData,
    restoreFile: function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      D = deepClone(FILE_DATA);
      applyBrand();
      renderAll();
    },
    isBlank: isBlank,
    toast: toast,
    clone: deepClone
  };

  applyBrand();
  renderAll();
  initTheme();
  initScroll();
  initCopy();
  initSheet();
  initChrome();
  initSplash(startContent);

  // ?edit=1 直接打开编辑器（适合把「立即填写」的链接发给别人）
  if (new URLSearchParams(window.location.search).get("edit") === "1") {
    setTimeout(function () { if (window.PROFILE_STUDIO) window.PROFILE_STUDIO.open(); }, 120);
  }
})();
