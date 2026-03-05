# Git Hook 自动更新 Changelog

## 功能

在每次提交前自动更新 `Footer.tsx` 中的 `changelogData`，保持更新日志与 git 历史同步。

## 特性

1. **自动更新**：提交前自动从 git log 提取提交记录
2. **自动过滤**：过滤掉带有 `[auto-changelog]` 标记的自动提交
3. **自动添加**：将更新后的文件自动添加到当前提交中
4. **防循环**：自动提交不会触发新的 changelog 更新

## 文件说明

- `scripts/update-changelog.js` - 核心更新脚本
- `.git/hooks/pre-commit` - Git pre-commit hook

## 安装

hook 已经自动安装在 `.git/hooks/` 目录下，无需额外操作。

如果 hook 未生效，可以手动安装：

```bash
# 复制 hook（如果需要）
cp scripts/pre-commit .git/hooks/

# 设置执行权限（Linux/Mac）
chmod +x .git/hooks/pre-commit
```

## 工作原理

1. 当你执行 `git commit` 时，pre-commit hook 会自动运行
2. hook 调用 `update-changelog.js` 脚本
3. 脚本获取最新的 git log（最多 30 条）
4. 过滤掉包含 `[auto-changelog]` 标记的提交
5. 更新 `src/components/Footer.tsx` 中的 `changelogData`
6. 如果有更新，自动将文件添加到暂存区
7. 继续正常提交流程

## 手动运行

如果你想在不提交的情况下更新日志：

```bash
node scripts/update-changelog.js
```

## 注意事项

- 首次使用时会更新所有历史提交记录
- 如果最近的提交是自动提交，脚本会自动跳过防止循环
- 提交消息中包含特殊字符（如单引号）会自动转义
