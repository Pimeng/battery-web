Using Node.js 20, Tailwind CSS v3.4.19, and Vite v7.2.4

Tailwind CSS has been set up with the shadcn theme

Setup complete: /mnt/okcomputer/output/app

## 版本与更新日志

版本号和 Git 信息通过 Vite 插件在构建时自动注入：

- **版本号**: 从 `package.json` 读取 (`__APP_VERSION__`)
- **Git SHA**: 构建时的最新提交短 SHA (`__APP_GIT_SHA__`)
- **更新日志**: 从 `git log` 自动提取最近 30 条非自动提交记录 (`__APP_CHANGELOG__`)

自动提交标记 `[auto-changelog]` 会被过滤，不显示在更新日志中。

相关文件：
- `scripts/vite-plugin-changelog.js` - Vite 插件，构建时注入信息
- `src/types/global.d.ts` - TypeScript 类型声明
- `src/components/Footer.tsx` - 显示版本和更新日志的组件

Components (40+):
  accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
  button-group, button, calendar, card, carousel, chart, checkbox, collapsible,
  command, context-menu, dialog, drawer, dropdown-menu, empty, field, form,
  hover-card, input-group, input-otp, input, item, kbd, label, menubar,
  navigation-menu, pagination, popover, progress, radio-group, resizable,
  scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip

Usage:
  import { Button } from '@/components/ui/button'
  import { Card, CardHeader, CardTitle } from '@/components/ui/card'

Structure:
  src/sections/        Page sections
  src/hooks/           Custom hooks
  src/types/           Type definitions
  src/App.css          Styles specific to the Webapp
  src/App.tsx          Root React component
  src/index.css        Global styles
  src/main.tsx         Entry point for rendering the Webapp
  index.html           Entry point for the Webapp
  tailwind.config.js   Configures Tailwind's theme, plugins, etc.
  vite.config.ts       Main build and dev server settings for Vite
  postcss.config.js    Config file for CSS post-processing tools