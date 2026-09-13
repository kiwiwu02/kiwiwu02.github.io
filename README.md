# Kiwi Wu — 个人作品集网站

暗色系个人作品集，React + Vite 实现，PC 端优先，版心 `min(1700px, 92vw)`。

## 快速开始

```bash
npm ci                # 按 package-lock.json 安装依赖
npm run dev          # 开发服务器 http://127.0.0.1:5178（改代码热更新）
npm run build        # 生产构建（绝对路径，适合部署到域名根目录）
npm run build:static # 相对路径构建（GitHub Pages / 子路径 / 离线预览）
npm test             # 运行测试
```

### 三种查看方式

| 方式 | 命令 | 适用 |
|---|---|---|
| 开发预览 | `npm run dev` | 改代码时用；**需要进程保持运行**，进程停掉后页面资源会全部取不到 |
| 离线预览 | `npm run build:static` 后打开 `dist/index.html` | 不依赖任何服务器，用来快速给别人看或截图 |
| 线上部署 | GitHub Pages | 推送到 `main` 后由 Actions 自动构建并发布 |

## GitHub Pages 部署

仓库已内置 `.github/workflows/deploy-pages.yml`。它会在 `main` 分支有更新时执行测试、构建相对路径静态文件，并把 `dist/` 发布到 GitHub Pages，也支持在 Actions 页面手动运行。

首次使用时，在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。如果你的默认分支不是 `main`，请同步修改工作流里的分支名。

### Umami 访问统计

网站使用 Umami Cloud 记录匿名访问数据，后台登录 Umami Dashboard 查看，不在本网站公开访客列表，也不需要把 API key 放进前端。

1. 在 [Umami Cloud](https://cloud.umami.is/) 创建 Website，复制 Website ID。
2. 在 GitHub repository 的 **Settings → Secrets and variables → Actions → Variables** 中创建 `UMAMI_WEBSITE_ID`，填入 Website ID；如需自托管或自定义 tracker，再创建可选变量 `UMAMI_SCRIPT_URL`。
3. 推送到 `main` 后等待 Pages workflow 完成，在 Umami Dashboard 查看 Sessions、访问时间、粗略位置、设备、来源和 Events。
4. 能看到的访问内容包括页面路径/标题、访问主机名、来源页、UTM 来源参数、页面区块浏览，以及简历、项目和联系方式按钮的分类点击事件。
5. Umami 只保留匿名访客会话和国家/地区/城市级粗略位置，不记录原始 IP、姓名、邮箱、手机号、GPS 或精确地址；事件也不会上传实际联系方式、复制内容或用户输入。
6. 本地或线上没有配置 `VITE_UMAMI_WEBSITE_ID` 时，页面照常运行，只是不发送统计。tracker 地址必须使用 HTTPS。

### 页面里的图全变成破图 / 只剩 alt 文字？

资源请求失败，基本就是**开发服务器没在跑**（端口上没有监听）。重新 `npm run dev` 后刷新页面即可。
想彻底摆脱这个依赖，用 `npm run build:static` 打开 `dist/index.html`。

> 写静态资源路径时注意：图片请用**相对路径**（`media/xxx.jpg`），不要写前导斜杠 `/media/...` —— 后者在子路径部署（如 GitHub Pages 的 `/repo/`）下会 404。

## 页面结构（五大模块）

| 模块 | 文件 | 说明 |
|---|---|---|
| 全屏首屏 Hero | `src/components/Hero.jsx` | 动态背景 + 左侧简洁介绍 + 右侧圆框可互动数字分身 |
| 实习经历 | `src/components/Experience.jsx` | 三段实习时间线，展示真实业务中的 AI 系统工程实践 |
| 个人项目 | `src/components/Projects.jsx` | 连续项目行，展示时间、描述、技术标签和唯一 CTA |
| 关于 | `src/components/About.jsx` | 人物图（宠物 waving 动画）、个人介绍、联系方式、4 组数据 |
| 收尾联系页 | `src/components/Contact.jsx` | 整屏（100vh）居中收尾，底部横向信息条 |

文案与数据全部集中在 **`src/data.js`**，改内容不需要碰组件。

简历按钮约定：将 PDF 放入 `public/resume.pdf` 后，顶部导航的「下载简历」按钮即可直接下载。

## 章节式滚动

顶层五个 Part 使用 `data-snap-page` 标记：桌面端滚轮一次只切换一个章节锚点，触摸设备使用原生滑动并吸附到章节起点。每个章节至少占满一个视口，章节之间不会露出相邻内容；后续调整各 Part 内容时，保持每个主题围绕一个视口状态即可。

## Hero 背景视频

首屏背景优先读取 `public/media/hero-bg.mp4`。

- 有该文件 → 自动播放（静音 / 循环 / 自动）
- 没有该文件 → 自动降级为 `HeroBackground.jsx` 里代码生成的粒子 + 光带动态背景

所以想换成视频，只要把 mp4 丢进 `public/media/` 并命名为 `hero-bg.mp4` 即可，无需改代码。建议 1080P、10–20 秒无缝循环、≤8MB。

## 宠物：Codex 风格状态机宠物

宠物不是"固定循环动画"，而是一个**带状态机、会感知鼠标和行为的角色**（`src/components/Pet.jsx`）。

### 行为一览

| 行为 | 触发条件 | 状态 |
|---|---|---|
| 待机呼吸 | 默认（含极轻微呼吸缩放） | `idle` |
| 跟着鼠标看 | 指针移动，8 方向 + 抬头/低头，注视向量做阻尼过渡 | `look`（16 方向帧） |
| **随鼠标倾斜** | 指针移动，身体倾斜 + 位移 + 呼吸缩放，越靠视口边缘倾得越多（最大 3.8° / 10px） | 叠加在当前状态上 |
| **下滑降落** | 页面下滑（重力物理：被甩起 → 自由落体 → 落地弹跳 → 压扁回弹 + 扬尘，尘影随高度收缩） | `jumping` |
| 上滑小跳 | 页面向上滚动 | `jumping` |
| 自己走动 | 每 9–20 秒随机游荡到别处 | `running-left` / `running-right` |
| 回角落 | 在屏幕中间发呆 6–10 秒后自己走回最近边缘 | 防止压住正文 |
| 挥手 | 单击它 / 卡片内加载 | `waving` |
| 跳一下 | 双击 / 睡醒被叫 / 拖拽松手后掉回地面 | `jumping` |
| 打盹 | 45 秒无操作 → 等待，再 45 秒 → 睡着 | `waiting` → `review` |
| 报错 | 1.2 秒内连点三次 | `failed` |
| 拖拽 | 按住拖动（位移 >6px 才算拖，普通点击仍是挥手） | 拖动时低头 |
| 退场 | 滚到收尾联系页时自动淡出（那里有专属的宠物） | — |

物理参数（`Pet.jsx` 顶部）：`GRAVITY = 2600 px/s²`、`BOUNCE = 0.26`、单次下滑抬升上限 `MAX_LIFT = 132px`、抬升冷却 260ms（避免连续滚动时一直飞）。

`prefers-reduced-motion` 下自动退化为静态待机（不做重力与倾斜）。

### 帧资源

```bash
python3 tools/slice_pet_frames.py ./path/to/spritesheet.webp \
  --look-sheet ./look-sheet.png
```

- 源图不随仓库提交；如需重切，请准备符合网格规格的 spritesheet，网格 **8 列 × 11 行**，单元格 **192×208**
- 运行时使用 10 组状态：`idle(6) running-right(8) running-left(8) waving(4) jumping(5) failed(8) waiting(6) running(6) review(6) look(16)`
- **所有动画共用同一个全局裁切框**（155×204），状态切换时角色脚底完全对齐、不会跳
- 传入 `--look-sheet` 时额外输出 16 方向联络表，用于人工核对注视朝向
- 注视方向映射表在 `src/lib/petFrames.js` 的 `GAZE_VECTORS`，与 Codex v2 一致：从正上方开始按顺时针每 22.5° 一帧；指针死区回到 `idle`

如需重切帧，先安装脚本依赖：`python3 -m pip install pillow`。

> ⚠️ 不要把未经核对的失败导出帧提交到 `public/pet/`，否则会导致角色残片或状态错位。

### 调试 API

开发模式运行时提供 `window.__kiwiPet`，方便联调与截图；生产构建不会注册这个调试入口：

```js
__kiwiPet.state()    // 当前状态 / 位置 / 离地高度 / 倾斜量
__kiwiPet.wave()     // 挥手
__kiwiPet.jump()     // 起跳（带重力）
__kiwiPet.drop()     // 从高处落下（看降落与扬尘）
__kiwiPet.fail()     // 报错
__kiwiPet.sleep()    // 打盹
__kiwiPet.wait()     // 等待
__kiwiPet.wander()   // 立刻游荡一次
```

### 组件用法

```jsx
<Pet mode="roam" height={124} />           // 可选：固定视口漫游
<Pet mode="embed" height={250} autoWave /> // 页面内嵌：idle + 注视 + 点击挥手
```

## 设计系统

设计 token 在 `src/index.css` 顶部：

- 背景 `#08090a` / 面板 `#101114` / 描边 `rgba(255,255,255,.085)`
- 正文 `#f4f4f2` / 次级 `#a2a5ab` / 提示 `#6a6d75`
- 唯一强调色：`#e2492f`（只用于标签、链接 hover、数据、CTA）
- 字体：Inter（正文）+ JetBrains Mono（标签 / 数据 / 编号）
- 动效：`cubic-bezier(.22,1,.36,1)`，滚动渐显由 `Reveal` 组件统一提供，`prefers-reduced-motion` 下全部关闭

## 目录

```
portfolio/
├── public/
│   ├── media/     project-*.png（项目封面）+ hero-bg.mp4（可选）
│   └── pet/       10 组状态帧（从 spritesheet 切出）
├── src/
│   ├── components/ Nav / Hero / HeroBackground / Pet / About / Projects / Contact / Reveal
│   ├── lib/       petFrames.js（帧表 + 注视方向映射 + 预加载）
│   ├── data.js    全部文案与数据
│   └── index.css  设计 token + 全站样式
├── docs/          各屏验收截图
└── tools/         slice_pet_frames.py（spritesheet 切帧）
```

## 待补充（可选）

- 项目 Case Study 独立页（当前项目卡片 CTA 指向 GitHub / 线上站点）
- `public/resume.pdf` + 导航栏 Resume 下载按钮
- 深色 / 浅色双主题（token 结构已预留）
