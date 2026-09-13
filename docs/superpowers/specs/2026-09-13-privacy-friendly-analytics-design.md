# 个人主页访问统计设计

**日期：** 2026-09-13  
**状态：** 待确认

## 目标

在现有 React + Vite + GitHub Pages 静态个人主页中接入 Umami Cloud，记录访问者的访问时间、城市级大概位置、设备环境、访问内容和来源，并在 Umami 的私有账号后台查看这些统计。站点本身不新增公开的访客列表或管理接口。

这里的“谁”定义为匿名访客会话：系统可以在合理范围内判断同一匿名访客的访问活动，但不会知道其真实姓名、联系方式或其他直接身份。

## 非目标

- 不保存原始 IP 地址。
- 不采集 GPS、精确坐标、街道或门牌位置。
- 不通过登录、指纹或隐蔽表单识别真实身份。
- 不在个人主页内实现自建数据库、后台登录页或公开管理路由。
- 不把邮箱地址、手机号、留言内容或其他个人信息作为统计事件参数发送。

## 当前项目背景

- 前端是 React 18 + Vite 5，入口为 `src/main.jsx`。
- 页面是单页静态站，当前通过 `.github/workflows/deploy-pages.yml` 构建并发布到 GitHub Pages。
- 项目已有 Node 原生测试，命令为 `npm test`；没有后端服务或数据库。
- 页面各模块是单页区块，不依赖 React Router，因此“访问内容”需要用区块浏览事件补充，而不能只依赖 URL 路径。

## 推荐架构

### 1. 使用 Umami Cloud 作为托管统计后台

浏览器通过 Umami tracker 将匿名统计发送到 Umami Cloud，管理员登录 Umami 账号查看 Dashboard、Sessions、Events 和位置报表。仓库不保存 Umami API key；前端只需要公开的 Website ID 和 tracker 地址。

Umami 的默认采集会记录页面浏览、URL、页面标题、来源、浏览器语言、屏幕尺寸等；服务端使用请求 IP 做位置和匿名会话计算，但不保存原始 IP。位置字段使用国家、地区和城市级信息。

### 2. 独立的 analytics 模块

新增 `src/lib/analytics.js`，负责：

- 从 Vite 环境变量读取 `VITE_UMAMI_WEBSITE_ID` 和 `VITE_UMAMI_SCRIPT_URL`。
- 在配置完整时动态加载一次 tracker script。
- 配置缺失、脚本加载失败或浏览器拦截时静默降级，不影响页面渲染和交互。
- 暴露区块浏览和自定义行为的轻量事件函数，统一限制事件名称和参数，避免误发送个人信息。

初始化放在 `src/main.jsx` 的 React 渲染前后均可工作，但必须保证只在浏览器环境执行，并且 React StrictMode 不会重复插入脚本。

### 3. 使用 GitHub Actions 变量注入配置

Vite 会在构建时把 `VITE_*` 变量写入前端产物。工作流从 GitHub Actions Variables 读取：

- `UMAMI_WEBSITE_ID`：Umami 中创建的网站 ID。
- `UMAMI_SCRIPT_URL`：Umami tracker 地址，默认使用 Umami 官方收集地址。

这两个值不是秘密，可以作为 Repository Variables 配置；任何 API key、管理员凭据或导出凭据都不得进入前端环境变量或 Git 仓库。没有配置变量时，生产构建仍然成功，只是暂不发送统计。

## 数据范围

### 默认页面与会话数据

接入后由 Umami 负责保存和展示：

- 访问事件时间、首次访问时间、最近访问时间。
- 页面 URL 路径、页面标题、站点 hostname。
- 访问来源 referrer，以及 URL 中的 UTM source、medium、campaign、content、term。
- 国家、地区、省/州、城市等 IP 推断的粗略位置。
- 浏览器、操作系统、设备类型、屏幕尺寸、浏览器语言。
- 匿名会话 ID、会话内访问次数、页面浏览数、事件数和停留时长。
- Umami 可提供的页面性能指标，包括 LCP、INP、CLS 等。

### 本站额外事件

为补足单页站的“访问内容”，在不携带个人信息的前提下记录：

| 事件名 | 触发点 | 参数范围 |
|---|---|---|
| `section_view` | Hero、About、Experience、Projects、Contact 首次进入视口 | 固定区块名 |
| `resume_download` | 下载简历按钮 | 无个人参数 |
| `project_click` | 项目或 GitHub 项目链接 | 固定项目标识、链接类型 |
| `contact_click` | 邮箱、电话、GitHub 联系入口 | 固定渠道名：`email`、`phone`、`github` |

不发送链接中的邮箱/电话内容，也不发送表单输入、查询字符串中的用户输入或其他自由文本。

## 数据流

```text
访客浏览器
    │
    ├─ 页面浏览 / 会话 / 设备 / 来源 / 粗略位置
    ├─ section_view / resume_download / project_click / contact_click
    │
    ▼
Umami Cloud 收集端
    │
    ▼
仅管理员 Umami 账号后台
```

页面不直接访问 Umami API，也不保存管理员 token，因此不会因为前端源码公开而暴露后台查询权限。

## 失败与降级

- 未设置 Umami 配置：不插入 tracker，页面完全按当前行为运行。
- tracker 被广告拦截器、网络策略或 CSP 拦截：只丢失统计，不显示错误弹窗，不阻塞页面。
- `IntersectionObserver` 不可用：不记录区块浏览事件，但页面仍可正常滚动。
- 统计请求失败：不重试、不在本地缓存待发送事件，避免产生额外隐私数据和页面负担。

## 验证方案

- 为配置解析、缺失配置降级、事件名称/参数白名单和脚本去重编写 Node 原生单元测试。
- 先运行单测确认新测试在实现前因缺少模块或行为而失败，再实现最小代码使其通过。
- 运行完整 `npm test` 和 `npm run build:static`。
- 使用本地预览检查无 Umami 配置时页面仍能加载；配置测试使用假 tracker 地址，不把真实账号凭据写入测试。
- 构建产物检查只包含 Website ID 或公开 tracker 地址，不包含 API key、密码、邮箱/手机号事件参数。

## 预计改动文件

- 新建 `src/lib/analytics.js`：统计配置、脚本初始化、事件与区块观察。
- 新建 `src/lib/analytics.test.js`：统计模块单元测试。
- 修改 `src/main.jsx`：初始化统计模块。
- 修改 `src/components/Nav.jsx`、`src/components/Projects.jsx`、`src/components/Contact.jsx`：添加固定名称的行为事件。
- 修改 `src/App.jsx` 或相应页面区块：标记并观察五个主要区块。
- 修改 `.github/workflows/deploy-pages.yml`：把公开 Umami 构建变量注入生产构建。
- 修改 `README.md`：记录 Umami 网站创建、GitHub Variables 配置和验证步骤。

## 验收标准

1. 主页在没有 Umami 配置、统计脚本失败或被拦截时仍可正常使用。
2. 配置 Umami 后，后台能看到页面访问时间、匿名会话、国家/地区/城市、设备、浏览器、系统、屏幕和来源数据。
3. 后台能区分五个主要区块的浏览，并能看到简历下载、项目点击和联系方式点击事件。
4. 前端和仓库中不存在 Umami API key、管理员密码、原始 IP 保存逻辑或个人身份数据采集逻辑。
5. `npm test` 与 `npm run build:static` 均通过。

