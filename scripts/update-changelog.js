#!/usr/bin/env node
/**
 * 更新 Changelog 数据到 Footer.tsx
 * 在 pre-commit hook 中自动调用
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FOOTER_PATH = join(__dirname, '..', 'src', 'components', 'Footer.tsx');
const MAX_ENTRIES = 30;

// 自动提交的标记（用于过滤）
const AUTO_COMMIT_MARKER = '[auto-changelog]';

// 解析提交类型
function parseType(message) {
  const match = message.match(/^(\w+)(?:\([^)]+\))?:/);
  return match ? match[1] : 'other';
}

// 清理提交消息（移除类型前缀和自动提交标记）
function cleanMessage(message) {
  return message
    .replace(/^\w+(?:\([^)]+\))?:\s*/, '')
    .replace(AUTO_COMMIT_MARKER, '')
    .trim();
}

// 获取 git log
function getGitLog() {
  try {
    const output = execSync(
      `git log --format="%h|%ad|%s" --date=format:"%Y-%m-%d %H:%M" -${MAX_ENTRIES}`,
      { encoding: 'utf-8', cwd: join(__dirname, '..') }
    );
    
    return output
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [sha, date, ...msgParts] = line.split('|');
        const message = msgParts.join('|'); // 防止消息中有 |
        return {
          sha: sha.slice(0, 7),
          type: parseType(message),
          message: cleanMessage(message),
          date,
          isAuto: message.includes(AUTO_COMMIT_MARKER),
        };
      })
      .filter(entry => !entry.isAuto); // 过滤自动提交
  } catch (error) {
    console.error('获取 git log 失败:', error.message);
    return [];
  }
}

// 生成 changelog 数据字符串
function generateChangelogData(entries) {
  const lines = entries.map(entry => 
    `  { sha: '${entry.sha}', type: '${entry.type}', message: '${entry.message.replace(/'/g, "\\'")}', date: '${entry.date}' }`
  );
  return `const changelogData: ChangelogEntry[] = [\n${lines.join(',\n')}\n];`;
}

// 更新 Footer.tsx
function updateFooter() {
  const entries = getGitLog();
  if (entries.length === 0) {
    console.log('没有获取到提交记录');
    return false;
  }

  const content = readFileSync(FOOTER_PATH, 'utf-8');
  const newData = generateChangelogData(entries);
  
  // 替换 changelogData
  const updated = content.replace(
    /const changelogData: ChangelogEntry\[\] = \[\s*[\s\S]*?\];/,
    newData
  );

  if (content === updated) {
    console.log('Changelog 无需更新');
    return false;
  }

  writeFileSync(FOOTER_PATH, updated, 'utf-8');
  console.log('✓ Changelog 已更新');
  return true;
}

// 主函数
function main() {
  // 检查是否在自动提交中（防止循环）
  try {
    const lastCommitMsg = execSync('git log -1 --pretty=%B', { 
      encoding: 'utf-8',
      cwd: join(__dirname, '..')
    }).trim();
    
    if (lastCommitMsg.includes(AUTO_COMMIT_MARKER)) {
      console.log('跳过：当前是自动提交');
      process.exit(0);
    }
  } catch (e) {
    // 忽略错误
  }

  const updated = updateFooter();
  process.exit(updated ? 0 : 0);
}

main();
