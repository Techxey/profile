# 个人档案页模板 · iOS 风格

**[在线预览](https://techxey.github.io/profile/)** · **[直接打开编辑器试试](https://techxey.github.io/profile/?edit=1)**

一个零依赖、单页的个人档案 / 简历页面模板。**不写代码，打开网页就能填**：姓名、教育、经历、技能、作品、联系方式，填完导出 `data.js` 就是一份属于你的主页。

- **开箱即空**：仓库里没有任何人的信息，clone 下来先看到一张引导卡，而不是别人的名字
- **页面内编辑器**：表单填写 + 实时预览，草稿存本机，一键导出 `data.js`
- **结构可变**：模块可关、可排序、可改标题 —— 「校园实践」改成「实习经历」只需改一个词
- **iOS 观感**：毛玻璃、分组卡片、系统色、弹簧缓动、深度 / 浅色主题、移动端 Tab Bar
- **模块留空即隐藏**：没有作品就不用写作品，导航和空卡片会一起消失
- **一个文件存内容**：所有内容都在 `assets/data.js`，改简历只改这一个文件
- **零依赖**：原生 HTML / CSS / JS，双击 `index.html` 就能跑，也能直接丢到 GitHub Pages

## 快速开始

```bash
git clone https://github.com/Techxey/profile.git
cd profile
```

然后直接双击 `index.html`（零依赖，不需要装任何东西）。

### 方式一：在网页里填（推荐）

1. 打开 `index.html`
2. 点「开始填写」，或右上角的铅笔图标
3. 按左侧分组填写；关掉编辑器就能看到效果
4. 点「导出 data.js」，用下载的文件覆盖 `assets/data.js`
5. 刷新页面 —— 内容就正式写进项目了

> 编辑器里的改动会自动存进浏览器本机（localStorage），刷新不丢；但那只是草稿，**导出并覆盖文件才算发布**。
> 想丢弃草稿回到文件里的内容：编辑器 →「恢复文件内容」。

### 方式二：直接改 data.js

打开 `assets/data.js`，字段含义都写在注释里；想照抄结构可以看 `assets/data.example.js`（一份完整的学生档案示例）。

三条规则：

- 文字用英文双引号 `"..."`，数字和 `true / false` 不加引号
- 数组里每条数据一对大括号 `{ }`，块之间用逗号，最后一块不加
- 任何模块留空（`[]` 或空字符串）→ 页面上整块隐藏

改完保存、刷新即可。页面全白多半是少了或多了逗号，按 `F12` 看 Console 第一行报错会指出行号。

## 文件结构

```
.
├── index.html              # 骨架层：只有语义容器，不含内容文案
├── README.md
├── LICENSE
└── assets
    ├── data.js             # 数据层：唯一数据源（默认全空）
    ├── data.example.js     # 示例数据，「先看看示例」按钮用
    ├── app.js              # 渲染层：模块注册表 + 组件函数 + 交互
    ├── editor.js           # 可视化编辑器（可以整块删掉，不影响展示）
    ├── styles.css          # 样式层：设计令牌、组件、动效、响应式、主题
    └── logo.svg            # 独立的品牌标记文件，可拿去做头像
```

只想展示、不要编辑器：删掉 `index.html` 里的 `<script src="assets/editor.js"></script>` 和 `assets/editor.js`，再把 `settings.showEdit` 设为 `false`。

## 数据结构

所有内容都在 `assets/data.js` 的 `window.PROFILE_DATA` 里，共 9 个部分：

| key | 说明 | 类型 | 核心字段 |
|---|---|---|---|
| `meta` | 页面信息 | Object | `pageTitle` `tagline` `eyebrow` `version` `updatedAt` |
| `splash` | 开屏动画 | Object | `enabled` `eyebrow` `title` `subtitle` `footer` `duration` `fastDuration` |
| `settings` | 外观与模块 | Object | `showEdit` `brand{avatarMode,logoColors,avatarGradient}` `sections[]` |
| `basic` | 基本信息 | Object | `name` `nameEn` `title` `initials` `location` `status` `bio` `tags[]` `stats[]` `social[]` |
| `education` | 教育背景 | Array | `school` `degree` `major` `period{start,end}` `location` `glyph` `badge` `description` `highlights[]` |
| `campus` | 校园实践 | Array | `org` `role` `type` `period` `location` `badge` `description` `achievements[]` `stack[]` |
| `skills` | 技能标签 | Array | `category` `icon` `tint` `items[{name, level:1–5}]` |
| `projects` | 项目作品 | Array | `title` `subtitle` `category` `year` `featured` `cover{gradient,glyph}` `metrics[]` `tags[]` `link` |
| `contact` | 联系方式 | Object | `availability{status,note}` `items[{label,value,icon,tint,copy,link}]` `cta{label,icon,link}` |

通用约定：

- `id`：模块内唯一，用于锚点与增删定位
- `tint`：语义色，可选 `blue` `green` `indigo` `orange` `pink` `purple` `teal` `yellow` `gray` `red`
- `gradient`：任意 CSS 渐变字符串，作头像 / 项目封面
- `glyph`：左侧小方块或封面里的一个字
- `link` / `copy` / `metrics` 等都可不填，对应 UI 自动隐藏

## 自定义

**改模块顺序 / 显隐 / 标题** —— 编辑 `settings.sections`，数组顺序就是页面顺序：

```js
sections: [
  { id: "education", enabled: true, nav: "教育", title: "教育背景", desc: "在读院校与学习方向", tint: "purple" },
  { id: "campus",    enabled: false, ... },   // 关掉整块
  ...
]
```

`nav` 是导航文字（手机底部 Tab），`title` 是模块标题，`desc` 是副标题 —— 都能按你的情况改。想加一个新模块：`data.js` 加一个 key → `app.js` 的 `REG` 加一条渲染函数 → `settings.sections` 加一条。

**改品牌** —— `settings.brand`：`avatarMode` 选 `logo`（专属标记）或 `initials`（姓名首字），`logoColors` 是标记的三段渐变色，`avatarGradient` 是头像底色。

**改配色 / 字体** —— `assets/styles.css` 顶部的 `:root` 与 `[data-theme="dark"]` 两组变量，改完整个页面跟着变。

## URL 参数

| 参数 | 作用 |
|---|---|
| `?edit=1` | 直接打开编辑器（适合把「填写」链接发给别人） |
| `?nosplash=1` | 跳过开屏 |
| `?splash=1` | 强制重播完整开屏 |
| `?splash=hold` | 停在开屏终态，方便看设计 |
| `?theme=dark` / `?theme=light` | 固定外观，不受系统影响 |
| `?sheet=1` | 直接打开「结构说明」面板 |

## 发布到 GitHub Pages

1. 把整个目录推到仓库（`index.html` 与 `assets/` 保持同级）
2. 仓库 Settings → Pages → Source 选默认分支、目录选 `/ (root)`
3. 等一两分钟，访问 **https://techxey.github.io/profile/**

发布前记得在编辑器「品牌与开屏」里关掉「显示编辑入口」，访客就看不到铅笔按钮了。

> 用这个仓库做自己的模板：fork 之后把 `README.md` 里的 `Techxey` 换成你自己的用户名即可。

## 常见问题

**页面一片空白？** 按 `F12` 看 Console：多半是 `data.js` 里引号或逗号写错；也可能是浏览器拦截了本地文件 —— 用 `python -m http.server` 起个本地服务再打开。

**编辑器里的内容不见了？** 草稿存在浏览器 localStorage，换浏览器 / 无痕模式 / 清缓存都会丢。重要的内容请导出 `data.js`。

**手机上为什么没有侧栏？** 820px 以下自动切成单列，导航变成顶部横滑分段控件 + 底部 Tab Bar，是同一套样式，不是另一个版本。

**开屏每次都播吗？** 同一会话只完整播一次，之后走 0.7 秒快闪；系统开了「减弱动效」时直接跳过。

## License

MIT，详见 [LICENSE](LICENSE)。里面的示例人物与经历均为虚构，请替换成你自己的内容。
