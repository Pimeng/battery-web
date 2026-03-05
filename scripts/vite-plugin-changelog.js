/**
 * Vite 插件：在构建时自动注入版本信息和 Git 日志
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const AUTO_COMMIT_MARKER = '[auto-changelog]';

// 解析提交类型
function parseType(message) {
  const match = message.match(/^(\w+)(?:\([^)]+\))?:/);
  return match ? match[1] : 'other';
}

// 清理提交消息
function cleanMessage(message) {
  return message
    .replace(/^\w+(?:\([^)]+\))?:\s*/, '')
    .replace(AUTO_COMMIT_MARKER, '')
    .trim();
}

// 获取 Git 信息
function getGitInfo(rootDir) {
  try {
    // 获取当前短 SHA
    const shortSha = execSync('git rev-parse --short HEAD', { 
      encoding: 'utf-8',
      cwd: rootDir 
    }).trim();

    // 获取完整 SHA
    const fullSha = execSync('git rev-parse HEAD', { 
      encoding: 'utf-8',
      cwd: rootDir 
    }).trim();

    // 获取提交日志（最多 50 条）
    const logOutput = execSync(
      'git log --format="%H|%ad|%s" --date=format:"%Y-%m-%d %H:%M" -50',
      { encoding: 'utf-8', cwd: rootDir }
    );

    const changelog = logOutput
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [sha, date, ...msgParts] = line.split('|');
        const message = msgParts.join('|');
        return {
          sha: sha.slice(0, 7),
          type: parseType(message),
          message: cleanMessage(message),
          date,
          isAuto: message.includes(AUTO_COMMIT_MARKER),
        };
      })
      .filter(entry => !entry.isAuto)
      .slice(0, 30);

    return { shortSha, fullSha, changelog };
  } catch (error) {
    console.error('获取 Git 信息失败:', error.message);
    return { 
      shortSha: 'unknown', 
      fullSha: 'unknown', 
      changelog: [] 
    };
  }
}

// 获取版本号
function getVersion(rootDir) {
  try {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
    return pkg.version || '0.0.0';
  } catch (error) {
    console.error('读取 package.json 失败:', error.message);
    return '0.0.0';
  }
}

export function changelogPlugin() {
  return {
    name: 'vite-plugin-changelog',
    config(config, { mode }) {
      const rootDir = config.root || process.cwd();
      const { shortSha, changelog } = getGitInfo(rootDir);
      const version = getVersion(rootDir);

      // 注入环境变量
      return {
        define: {
          __APP_VERSION__: JSON.stringify(version),
          __APP_GIT_SHA__: JSON.stringify(shortSha),
          __APP_CHANGELOG__: JSON.stringify(changelog),
          'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
          'import.meta.env.VITE_APP_GIT_SHA': JSON.stringify(shortSha),
        },
      };
    },
  };
}
