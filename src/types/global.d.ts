// 由 Vite 插件注入的全局变量
declare const __APP_VERSION__: string;
declare const __APP_GIT_SHA__: string;

declare interface ChangelogEntry {
  sha: string;
  type: string;
  message: string;
  date: string;
}

declare const __APP_CHANGELOG__: ChangelogEntry[];

// 扩展 import.meta.env
interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_GIT_SHA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
