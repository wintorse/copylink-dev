# copylink-dev — 機能一覧 & テストカバレッジ

> English version: [behavior-test-coverage.md](behavior-test-coverage.md)

---

## 1. 機能 (Behavior) 一覧

### 1.1 コアコマンド

| ID       | コマンド                     | キーボードショートカット      | 動作                                                 |
| -------- | ---------------------------- | ----------------------------- | ---------------------------------------------------- |
| B-CMD-01 | **Copy Link**                | Alt+L / MacCtrl+L             | ページURLをフォーマット付きタイトルでコピー          |
| B-CMD-02 | **Copy Link for Slack**      | Alt+Shift+L / MacCtrl+Shift+L | Slack絵文字プレフィックス付きでリンクをコピー        |
| B-CMD-03 | **Copy Title**               | Alt+T / MacCtrl+T             | ページタイトルのみをプレーンテキストでコピー         |
| B-CMD-04 | **Copy Google Sheets Range** | Alt+R / MacCtrl+R             | Google Sheetsの範囲リンク (gid & range付き) をコピー |

### 1.2 リンクフォーマット

| ID       | フォーマット                      | 出力例                                                        |
| -------- | --------------------------------- | ------------------------------------------------------------- |
| B-FMT-01 | **Plain URL**                     | `https://docs.google.com/...`                                 |
| B-FMT-02 | **HTML**                          | `<a href="...">Title</a>&nbsp;`（テキストはタイトルのみ）     |
| B-FMT-03 | **Markdown**                      | `[Title](https://...)`                                        |
| B-FMT-04 | **HTML with Emoji**（デフォルト） | `:emoji: <a href="...">Title</a>&nbsp;`（テキストはMarkdown） |

### 1.3 サイト別タイトル抽出 & 絵文字検出

| ID        | サイト               | 絵文字                | タイトル抽出方法                                   |
| --------- | -------------------- | --------------------- | -------------------------------------------------- |
| B-SITE-01 | Google Docs          | `:google_docs:`       | `input#docs-title-widget` から取得                 |
| B-SITE-02 | Google Sheets        | `:google_sheets:`     | `document.title` から取得                          |
| B-SITE-03 | Google Slides        | `:google_slides:`     | `document.title` から取得                          |
| B-SITE-04 | Google Drive         | `:google_drive_2:`    | `document.title` から " - Google Drive" を除去     |
| B-SITE-05 | GitHub Repos         | `:github:`            | h1 から repo/owner を抽出                          |
| B-SITE-06 | GitHub Pull Requests | `:open_pull_request:` | PR ID + タイトルを `#番号 タイトル` 形式で抽出     |
| B-SITE-07 | GitHub Issues        | `:open_issue:`        | Issue ID + タイトルを `#番号 タイトル` 形式で抽出  |
| B-SITE-08 | Jira Issues          | `:jira:`              | Issue ID + タイトルを `ID タイトル` 形式で抽出     |
| B-SITE-09 | Asana Tasks          | `:asana:`             | `TaskPrintView` の `aria-label` から取得           |
| B-SITE-10 | Backlog Issues       | `:backlog:`           | `#summary .title-group__title-text` から取得       |
| B-SITE-11 | Redmine Issues       | `:redmine_ticket:`    | `トラッカー #番号: タイトル` 形式で h2/h3 から抽出 |
| B-SITE-12 | ReDoc (Swagger)      | `:swagger:`           | アクティブラベルの2番目の span から取得            |
| B-SITE-13 | 未登録サイト         | （なし）              | `document.title` をそのまま使用                    |

### 1.4 カスタムWebサイト設定

| ID          | 機能                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| B-CUSTOM-01 | 5つのカスタムWebサイトスロット（正規表現 + 絵文字）                     |
| B-CUSTOM-02 | カスタム正規表現がビルトインサイト検出より優先される                    |
| B-CUSTOM-03 | URLに対してカスタム正規表現がマッチした場合、対応する絵文字が適用される |

### 1.5 ポップアップ設定

| ID         | 機能                                                     |
| ---------- | -------------------------------------------------------- |
| B-POPUP-01 | 13個のビルトイン絵文字名の入力・変更                     |
| B-POPUP-02 | 5つのカスタムWebサイト（正規表現 + 絵文字）の設定        |
| B-POPUP-03 | Google Sheetsリンクフォーマットのラジオボタン選択（4種） |
| B-POPUP-04 | 設定変更が `chrome.storage.local` にリアルタイム保存     |

### 1.6 クリップボード動作

| ID        | 機能                                                                                   |
| --------- | -------------------------------------------------------------------------------------- |
| B-CLIP-01 | `navigator.clipboard.write()` による text/plain + text/html デュアルフォーマットコピー |
| B-CLIP-02 | HTTP サイトでの `document.execCommand('copy')` フォールバック                          |
| B-CLIP-03 | フォールバック時のユーザー選択範囲の保持                                               |
| B-CLIP-04 | Copy Link: テキスト=タイトル、HTML=`<a>` タグ                                          |
| B-CLIP-05 | Copy Link for Slack: テキスト=Markdown、HTML=絵文字+`<a>` タグ                         |

### 1.7 Google Sheets 範囲リンク

| ID         | 機能                                                 |
| ---------- | ---------------------------------------------------- |
| B-RANGE-01 | URLハッシュからGID（シートID）を抽出                 |
| B-RANGE-02 | `#t-name-box` 入力からセル範囲を抽出                 |
| B-RANGE-03 | `{baseUrl}#gid={gid}&range={range}` 形式のリンク生成 |
| B-RANGE-04 | 非Sheetsページでは何もしない                         |
| B-RANGE-05 | フォーマット設定に応じた4種類の出力                  |

### 1.8 トースト通知

| ID         | 機能                                                  |
| ---------- | ----------------------------------------------------- |
| B-TOAST-01 | コピー成功後にページ内トースト通知を表示              |
| B-TOAST-02 | 左下に表示（bottom: 24px, left: 24px）                |
| B-TOAST-03 | 約3秒後に自動消去（フェードアウトアニメーション付き） |
| B-TOAST-04 | Shadow DOMでページのスタイルから隔離                  |

### 1.9 国際化 (i18n)

| ID        | 機能                                        |
| --------- | ------------------------------------------- |
| B-I18N-01 | 英語 (en) サポート                          |
| B-I18N-02 | 日本語 (ja) サポート                        |
| B-I18N-03 | 中国語簡体字 (zh_CN) サポート               |
| B-I18N-04 | ポップアップの `[data-i18n]` による自動翻訳 |

### 1.10 エラーハンドリング

| ID       | 機能                                         |
| -------- | -------------------------------------------- |
| B-ERR-01 | タブが見つからない場合のサイレントエラー処理 |
| B-ERR-02 | 非 http/https URLスキームの拒否              |
| B-ERR-03 | コンテントスクリプト注入失敗時のログ出力     |
| B-ERR-04 | Clipboard API失敗時のフォールバック          |
| B-ERR-05 | 全コピー方法失敗時の失敗ステータス表示       |

### 1.11 コンテントスクリプト

| ID      | 機能                                                          |
| ------- | ------------------------------------------------------------- |
| B-CS-01 | `__copylinkDevInjected` フラグによる重複注入防止              |
| B-CS-02 | Chrome: 動的スクリプト注入 (`chrome.scripting.executeScript`) |
| B-CS-03 | Firefox: 事前注入コンテントスクリプト                         |

---

## 2. テストカバレッジ

### テスト構成

| 種別           | フレームワーク        | ディレクトリ  | 対象                                           |
| -------------- | --------------------- | ------------- | ---------------------------------------------- |
| E2E テスト     | Playwright (Chromium) | `tests/e2e/`  | ブラウザ上でのコマンド実行・UI動作・設定       |
| ユニットテスト | Vitest + happy-dom    | `tests/unit/` | 純粋ロジック・静的アセット・エラーハンドリング |

### 凡例

| 記号 | 意味                 |
| ---- | -------------------- |
| ✅   | テスト済み           |
| ⚠️   | 暗黙的にのみ検証済み |
| ❌   | 未テスト             |

### カバレッジマッピング

| 機能ID                   | 機能                                 | 状況 | テストファイル / テスト名                                                                                    |
| ------------------------ | ------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------ |
| **コアコマンド**         |                                      |      |                                                                                                              |
| B-CMD-01                 | Copy Link                            | ✅   | `e2e/core-commands.spec.ts`: `copy-link copies title as text and HTML anchor`                                |
| B-CMD-02                 | Copy Link for Slack                  | ✅   | `e2e/core-commands.spec.ts`: `copy-link-for-slack copies markdown text and HTML with emoji`                  |
| B-CMD-03                 | Copy Title                           | ✅   | `e2e/core-commands.spec.ts`: `copy-title copies only the page title as plain text`                           |
| B-CMD-04                 | Copy Google Sheets Range             | ✅   | `e2e/google-sheets.spec.ts`: `copy-google-sheets-range copies URL with range parameter`                      |
| **リンクフォーマット**   |                                      |      |                                                                                                              |
| B-FMT-01                 | Plain URL                            | ✅   | `e2e/link-formats.spec.ts`: `plainUrl format: text is URL only`                                              |
| B-FMT-02                 | HTML                                 | ✅   | `e2e/link-formats.spec.ts`: `html format: text is title, html is <a> without emoji`                          |
| B-FMT-03                 | Markdown                             | ✅   | `e2e/link-formats.spec.ts`: `markdown format: text is [title](url), no html`                                 |
| B-FMT-04                 | HTML with Emoji                      | ✅   | `e2e/link-formats.spec.ts`: `htmlWithEmoji format: text is markdown, html has emoji + <a>`                   |
| **サイト別処理**         |                                      |      |                                                                                                              |
| B-SITE-01                | Google Docs                          | ✅   | `e2e/site-title.spec.ts`: `Google Docs: title is テスト document`                                            |
| B-SITE-02                | Google Sheets                        | ✅   | `e2e/site-title.spec.ts`: `Google Sheets: title is テスト spreadsheet`                                       |
| B-SITE-03                | Google Slides                        | ✅   | `e2e/site-title.spec.ts`: `Google Slides: title is テスト presentation`                                      |
| B-SITE-04                | Google Drive                         | ✅   | `e2e/site-title.spec.ts`: `Google Drive: title is public folder`                                             |
| B-SITE-05                | GitHub Repos                         | ✅   | `e2e/site-title.spec.ts`: `GitHub Repo: emoji is :github:`                                                   |
| B-SITE-06                | GitHub Pull Requests                 | ✅   | `e2e/site-title.spec.ts`: `GitHub Pull Request: title is #<number> <text>`                                   |
| B-SITE-07                | GitHub Issues                        | ✅   | `e2e/site-title.spec.ts`: `GitHub Issue: title is #<number> <text>`                                          |
| B-SITE-08                | Jira Issues                          | ✅   | `e2e/site-title.spec.ts`: `Jira Issue: title is HIBERNATE-77 Support HQL in / not in`                        |
| B-SITE-09                | Asana Tasks                          | ✅   | `e2e/site-title.spec.ts`: `Asana Task (mocked): title from aria-label`                                       |
| B-SITE-10                | Backlog Issues                       | ✅   | `e2e/site-title.spec.ts`: `Backlog Issue (mocked): title from DOM selector`                                  |
| B-SITE-11                | Redmine Issues                       | ✅   | `e2e/site-title.spec.ts`: `Redmine Issue: title is Feature #642: OpenXR On Linux.`                           |
| B-SITE-12                | ReDoc (Swagger)                      | ✅   | `e2e/site-title.spec.ts`: `ReDoc: title is 法令本文取得API`                                                  |
| B-SITE-13                | 未登録サイト                         | ✅   | `e2e/core-commands.spec.ts`: example.com で検証                                                              |
| **カスタムWebサイト**    |                                      |      |                                                                                                              |
| B-CUSTOM-01              | カスタムスロット設定                 | ✅   | `e2e/popup.spec.ts`: `custom website regex + emoji is applied for matching URLs`                             |
| B-CUSTOM-02              | カスタムがビルトインより優先         | ✅   | `e2e/popup.spec.ts`: `custom website regex takes priority over built-in site detection`                      |
| B-CUSTOM-03              | カスタム正規表現マッチ時の絵文字適用 | ✅   | `e2e/popup.spec.ts`: `custom website regex + emoji is applied for matching URLs`                             |
| **ポップアップ設定**     |                                      |      |                                                                                                              |
| B-POPUP-01               | 絵文字名の変更                       | ✅   | `e2e/popup.spec.ts`: `changing an emoji name persists and is used in copy`                                   |
| B-POPUP-02               | カスタムWebサイト設定                | ✅   | `e2e/popup.spec.ts`: `custom website regex + emoji is applied for matching URLs`                             |
| B-POPUP-03               | リンクフォーマット選択               | ✅   | `e2e/popup.spec.ts`: `selecting a link format radio persists to storage`                                     |
| B-POPUP-04               | リアルタイムストレージ保存           | ✅   | `e2e/popup.spec.ts`: 各テストでストレージ確認                                                                |
| **クリップボード**       |                                      |      |                                                                                                              |
| B-CLIP-01                | Clipboard API デュアルフォーマット   | ✅   | `e2e/core-commands.spec.ts`: text + HTML の両方を検証                                                        |
| B-CLIP-02                | HTTP フォールバック                  | ✅   | `e2e/http-site.spec.ts`: HTTP サイトでの3コマンドテスト                                                      |
| B-CLIP-03                | 選択範囲の保持                       | ✅   | `unit/clipboardFallback.test.ts`: `restores the previous selection range after execCommand fallback`         |
| B-CLIP-04                | Copy Link 出力フォーマット           | ✅   | `e2e/core-commands.spec.ts`                                                                                  |
| B-CLIP-05                | Copy Link for Slack 出力フォーマット | ✅   | `e2e/core-commands.spec.ts`                                                                                  |
| **Google Sheets 範囲**   |                                      |      |                                                                                                              |
| B-RANGE-01               | GID 抽出                             | ✅   | `e2e/google-sheets.spec.ts`: `gid=0` の検証                                                                  |
| B-RANGE-02               | セル範囲抽出                         | ✅   | `e2e/google-sheets.spec.ts`: `range=C2:E4` の検証                                                            |
| B-RANGE-03               | リンク形式                           | ✅   | `e2e/google-sheets.spec.ts`                                                                                  |
| B-RANGE-04               | 非Sheetsページでno-op                | ✅   | `e2e/google-sheets.spec.ts`: `on non-Sheets page does nothing`                                               |
| B-RANGE-05               | フォーマット別出力                   | ✅   | `e2e/link-formats.spec.ts`: 4フォーマット全テスト                                                            |
| **トースト通知**         |                                      |      |                                                                                                              |
| B-TOAST-01               | コピー成功後に表示                   | ✅   | `e2e/toast.spec.ts`: `toast appears after copy-link`                                                         |
| B-TOAST-02               | 表示位置                             | ✅   | `unit/toast-css.test.ts`: `positions the toast 24px from the bottom/left`                                    |
| B-TOAST-03               | 約3秒後の自動消去                    | ✅   | `e2e/toast.spec.ts`: `disappears after ~3s`                                                                  |
| B-TOAST-04               | Shadow DOM 隔離                      | ✅   | `unit/toastShadowDom.test.ts`: `places .copylink-dev-toast inside the shadow root, not in the main document` |
| **国際化**               |                                      |      |                                                                                                              |
| B-I18N-01                | 英語サポート                         | ✅   | `unit/i18n.test.ts`: `en/messages.json contains all required keys`                                           |
| B-I18N-02                | 日本語サポート                       | ✅   | `unit/i18n.test.ts`: `ja/messages.json contains all required keys`                                           |
| B-I18N-03                | 中国語サポート                       | ✅   | `unit/i18n.test.ts`: `zh_CN/messages.json contains all required keys`                                        |
| B-I18N-04                | ポップアップ自動翻訳                 | ✅   | `unit/i18n.test.ts`: `every data-i18n attribute in popup.html references a key present in messages.json`     |
| **エラーハンドリング**   |                                      |      |                                                                                                              |
| B-ERR-01                 | タブ未発見時                         | ✅   | `unit/background.test.ts`: `logs an error and does nothing when no active tab is found`                      |
| B-ERR-02                 | 非 http/https スキーム拒否           | ✅   | `unit/background.test.ts`: `rejects chrome:// URLs without injecting the content script`                     |
| B-ERR-03                 | スクリプト注入失敗                   | ✅   | `unit/background.test.ts`: `logs error and does NOT send message when script injection fails`                |
| B-ERR-04                 | Clipboard API 失敗フォールバック     | ✅   | `unit/clipboardFallback.test.ts`: `attempts the execCommand fallback when Clipboard API fails`               |
| B-ERR-05                 | 全方法失敗時の失敗表示               | ✅   | `e2e/toast.spec.ts` + `unit/copyTextLinkCore.test.ts`: failure notification                                  |
| **コンテントスクリプト** |                                      |      |                                                                                                              |
| B-CS-01                  | 重複注入防止                         | ✅   | `unit/content.test.ts`: `does NOT re-register the listener when the script is injected a second time`        |
| B-CS-02                  | Chrome 動的注入                      | ⚠️   | 全 E2E テストで暗黙的に動作を確認                                                                            |
| B-CS-03                  | Firefox 事前注入                     | ❌   | Playwright は Firefox 拡張のテストをサポートしていないため未対応                                             |
