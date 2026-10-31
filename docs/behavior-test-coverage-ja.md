# copylink-dev — 機能一覧 & テストカバレッジ

> English version: [behavior-test-coverage.md](behavior-test-coverage.md)

拡張機能の動作と、それを検証する自動テストの範囲を対応付けています。1 つのケースが通っても、全ブラウザ・全入力・全権限経路の検証を意味しません。実サイトとフィクスチャの区別、診断データ、リリース前の手動確認は [tests/README.md](../tests/README.md) を参照してください。

---

## 1. 機能 (Behavior) 一覧

### 1.1 コアコマンド

| ID       | コマンド                     | キーボードショートカット      | 動作                                                                     |
| -------- | ---------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| B-CMD-01 | **Copy Link**                | Alt+L / MacCtrl+L             | ページURLをフォーマット付きタイトルでコピー                              |
| B-CMD-02 | **Copy Link for Slack**      | Alt+Shift+L / MacCtrl+Shift+L | 設定された Slack 絵文字付きの HTML をコピー。プレーンテキストは Markdown |
| B-CMD-03 | **Copy Title**               | Alt+T / MacCtrl+T             | 整形済みのページタイトルのみをプレーンテキストでコピー                   |
| B-CMD-04 | **Copy Google Sheets Range** | Alt+R / MacCtrl+R             | Google Sheetsの範囲リンク (gid & range付き) をコピー                     |

### 1.2 リンクフォーマット

選択可能な 4 形式は Google Sheets の範囲リンクに適用されます。`copy-link` は HTML、`copy-link-for-slack` は絵文字付き HTML（絵文字がない場合は省略）、`copy-title` はプレーンテキストを使用します。

| ID       | フォーマット                      | 出力例                                                               |
| -------- | --------------------------------- | -------------------------------------------------------------------- |
| B-FMT-01 | **Plain URL**                     | `https://docs.google.com/...`                                        |
| B-FMT-02 | **HTML**                          | `<a href="...">Title</a>&nbsp;`（テキストはタイトルのみ）            |
| B-FMT-03 | **Markdown**                      | `[Title](https://...)`                                               |
| B-FMT-04 | **HTML with Emoji**（デフォルト） | `:emoji:&nbsp;<a href="...">Title</a>&nbsp;` (plain text = Markdown) |

### 1.3 サイト別タイトル抽出 & 絵文字検出

| ID        | サイト               | 絵文字                | タイトル抽出方法                                                                     |
| --------- | -------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| B-SITE-01 | Google Docs          | `:google_docs:`       | `#docs-title-widget input` の value                                                  |
| B-SITE-02 | Google Sheets        | `:google_sheets:`     | `#docs-title-widget input` の value                                                  |
| B-SITE-03 | Google Slides        | `:google_slides:`     | `#docs-title-widget input` の value                                                  |
| B-SITE-04 | Google Drive         | `:google_drive_2:`    | `document.title` から " - Google Drive" を除去                                       |
| B-SITE-05 | GitHub Repos         | `:github:`            | `document.title`                                                                     |
| B-SITE-06 | GitHub Pull Requests | `:open_pull_request:` | URL の番号と `h1` の最初の子要素から `#number title` を生成                          |
| B-SITE-07 | GitHub Issues        | `:open_issue:`        | URL の番号と `h1` の最初の子要素から `#number title` を生成                          |
| B-SITE-08 | Jira Issues          | `:jira:`              | `#key-val` の Issue ID と `#summary-val h2` のテキストを取得し、`ID タイトル` に整形 |
| B-SITE-09 | Asana Tasks          | `:asana:`             | `TaskPrintView` の `aria-label` から取得                                             |
| B-SITE-10 | Backlog Issues       | `:backlog:`           | `#summary > span.title-group__title-text > div` のテキスト                           |
| B-SITE-11 | Redmine Issues       | `:redmine_ticket:`    | `トラッカー #番号: タイトル` 形式で h2/h3 から抽出                                   |
| B-SITE-14 | RedMica Issues       | `:redmine_ticket:`    | RedMica のフッタークレジットリンクで検出し、Redmine と同じタイトル形式を使用         |
| B-SITE-12 | ReDoc (Swagger)      | `:swagger:`           | 選択中メニューから取得（v2 / v3）                                                    |
| B-SITE-13 | 未登録サイト         | （なし）              | `document.title` をそのまま使用                                                      |
| B-SITE-16 | 共通のサイト判定     | (判定されたサイト)    | タイトルと絵文字で判定順を共有し、フッターはクレジットリンクで判定                   |

### 1.4 GitHub Pull Request 状態別絵文字

| ID         | 機能                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| B-GH-PR-01 | Pull Requestページで Draft, Open, Merged, Closed ごとに別の絵文字を使用できる                           |
| B-GH-PR-02 | Conversationページでは `data-status` (`draft`, `pullOpened`, `pullMerged` など) から状態を検出する      |
| B-GH-PR-03 | Files Changedページでは `span[reviewable_state]` のテキスト (`Draft`, `Open` など) へフォールバックする |
| B-GH-PR-04 | 未設定の状態別絵文字は、共通 PR 絵文字の設定値（未設定なら既定値）を継承                                |
| B-GH-PR-05 | 未設定の状態別欄は空欄のまま継承値をプレースホルダーに表示し、編集・再表示後も継承を維持                |

### 1.5 カスタムWebサイト設定

| ID          | 機能                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| B-CUSTOM-01 | 5つのカスタムWebサイトスロット（正規表現 + 絵文字）                                            |
| B-CUSTOM-02 | カスタム正規表現がビルトインサイト検出より優先される                                           |
| B-CUSTOM-03 | 空でない正規表現が一致し、絵文字も設定されている場合に適用                                     |
| B-CUSTOM-04 | 不正な正規表現はエラーを表示し、直前の有効値を保持。他の有効な欄は保存し、修正後はエラーを解除 |
| B-CUSTOM-05 | 保存済みの不正な正規表現を無視し、ビルトイン絵文字の判定を継続                                 |

### 1.6 ポップアップ設定

| ID         | 機能                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| B-POPUP-01 | GitHub PR 状態別 4 欄を含む、16 個のビルトイン絵文字欄を編集                                   |
| B-POPUP-02 | 5つのカスタムWebサイト（正規表現 + 絵文字）の設定                                              |
| B-POPUP-03 | Google Sheetsリンクフォーマットのラジオボタン選択（4種）                                       |
| B-POPUP-04 | 有効な設定変更を `chrome.storage.local` に即時保存                                             |
| B-POPUP-05 | 絵文字名とカスタム正規表現をJSONとしてクリップボードへエクスポート                             |
| B-POPUP-06 | JSON設定をインポートし、保存してフォームへ反映                                                 |
| B-POPUP-07 | emojiNames・customRegexes の空セクションで該当設定を初期化。トップレベルの空オブジェクトは不正 |
| B-POPUP-08 | 不正なインポートを拒否し、保存済み設定と既存の入力欄を維持                                     |
| B-POPUP-09 | 非同期のストレージ取得に失敗した場合にエクスポート失敗を表示                                   |
| B-POPUP-10 | 絵文字名の前後の空白を除き、省略されたコロンを補完                                             |

### 1.7 クリップボード動作

| ID        | 機能                                                                                   |
| --------- | -------------------------------------------------------------------------------------- |
| B-CLIP-01 | `navigator.clipboard.write()` による text/plain + text/html デュアルフォーマットコピー |
| B-CLIP-02 | HTTP サイトでの `document.execCommand('copy')` フォールバック                          |
| B-CLIP-03 | フォールバック時のユーザー選択範囲の保持                                               |
| B-CLIP-04 | Copy Link: テキスト=タイトル、HTML=`<a>` タグ                                          |
| B-CLIP-05 | Copy Link for Slack: テキスト=Markdown、HTML=絵文字+`<a>` タグ                         |
| B-CLIP-06 | 生成する HTML 内のタイトル・URL・絵文字名をエスケープ                                  |
| B-CLIP-07 | Markdown と Slack 用プレーンテキストでラベルをエスケープし、URL の特殊文字をエンコード |
| B-CLIP-08 | 絵文字がない場合は接頭辞と区切りを省略し、末尾の改行しないスペースは維持               |

### 1.8 Google Sheets 範囲リンク

| ID         | 機能                                                                |
| ---------- | ------------------------------------------------------------------- |
| B-RANGE-01 | URLハッシュからGID（シートID）を抽出                                |
| B-RANGE-02 | `#t-name-box` 入力からセル範囲を抽出                                |
| B-RANGE-03 | `{baseUrl}#gid={gid}&range={range}` 形式のリンク生成                |
| B-RANGE-04 | 非Sheetsページでは何もしない                                        |
| B-RANGE-05 | フォーマット設定に応じた4種類の出力                                 |
| B-RANGE-06 | URL ハッシュに空でない gid がない場合は gid=0 を使用                |
| B-RANGE-07 | Sheets の名前ボックスが取得できない、または空の場合に失敗通知を表示 |

### 1.9 トースト通知

| ID         | 機能                                                  |
| ---------- | ----------------------------------------------------- |
| B-TOAST-01 | コピー成功後にページ内トースト通知を表示              |
| B-TOAST-02 | 左下に表示（bottom: 24px, left: 24px）                |
| B-TOAST-03 | 約3秒後に自動消去（フェードアウトアニメーション付き） |
| B-TOAST-04 | Shadow DOMでページのスタイルから隔離                  |

### 1.10 国際化 (i18n)

| ID        | 機能                                        |
| --------- | ------------------------------------------- |
| B-I18N-01 | 英語 (en) サポート                          |
| B-I18N-02 | 日本語 (ja) サポート                        |
| B-I18N-03 | 中国語簡体字 (zh_CN) サポート               |
| B-I18N-04 | ポップアップの `[data-i18n]` による自動翻訳 |

### 1.11 エラーハンドリング

| ID       | 機能                                                                 |
| -------- | -------------------------------------------------------------------- |
| B-ERR-01 | アクティブタブが見つからない場合にエラーを記録して中断               |
| B-ERR-02 | Chrome: スクリプト注入前に http/https 以外のスキームを拒否           |
| B-ERR-03 | Chrome: コンテントスクリプト注入に失敗した場合にエラーを記録して中断 |
| B-ERR-04 | Clipboard API失敗時のフォールバック                                  |
| B-ERR-05 | コピー処理が失敗を返した場合に失敗通知を要求                         |
| B-ERR-06 | Chrome: タブの URL がない場合にエラーを記録して中断                  |
| B-ERR-07 | バックグラウンドからコンテントへのメッセージ送信失敗を記録           |

### 1.12 コンテントスクリプト

| ID      | 機能                                                          |
| ------- | ------------------------------------------------------------- |
| B-CS-01 | `__copylinkDevInjected` フラグによる重複注入防止              |
| B-CS-02 | Chrome: 動的スクリプト注入 (`chrome.scripting.executeScript`) |
| B-CS-03 | Firefox: 事前注入コンテントスクリプト                         |
| B-CS-04 | コマンド完了までポートを維持し、例外時も完了を通知            |
| B-CS-05 | URL パスが .xml で終わるページではコピーコマンドを実行しない  |
| B-CS-06 | 未対応の種別・コマンドのメッセージを無視                      |

---

## 2. テストカバレッジ

### テスト構成

| 種別                        | フレームワーク            | ディレクトリ        | 対象                                                                                  |
| --------------------------- | ------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| Chromium E2E                | Playwright                | `tests/e2e/`        | 実サイトと応答差し替えページで拡張コマンド・UI を確認。テスト用ホスト権限を追加       |
| Firefox content integration | Playwright / Gecko        | `tests/firefox/`    | ネイティブ・フォールバックのコピーとコンテント処理。拡張メッセージ・i18n API はモック |
| Unit tests                  | Vitest + happy-dom / Node | `tests/unit/`       | 共有ロジック、DOM 抽出、静的アセット、モックした拡張 API のエラー処理                 |
| Chrome browser UI           | Playwright + X11 ツール   | `tests/browser-ui/` | Linux の実ショートカットと本番 activeTab 付与。manifest は変更しない                  |
| Firefox add-on E2E          | Selenium + X11 ツール     | `tests/browser-ui/` | Linux での一時アドオンのインストール・manifest 注入・実ショートカット                 |

### 凡例

| 記号 | 意味                                     |
| ---- | ---------------------------------------- |
| ✅   | 記載した範囲について明示的な自動検証あり |
| ⚠️   | 部分的な検証。未検証の経路を記載         |
| ❌   | 直接検証する自動テストなし               |

### カバレッジマッピング

| 機能 ID                    | 機能                                                                         | 状況 | テスト根拠                                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **コアコマンド**           |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-CMD-01                   | Copy Link                                                                    | ✅   | [e2e/core-commands.spec.ts](../tests/e2e/core-commands.spec.ts): `copy-link copies title as text and HTML anchor`                                                                                                                                                                                                                            |
| B-CMD-02                   | Copy Link for Slack                                                          | ✅   | [e2e/core-commands.spec.ts](../tests/e2e/core-commands.spec.ts): `copy-link-for-slack copies markdown text and HTML with emoji`                                                                                                                                                                                                              |
| B-CMD-03                   | Copy Title                                                                   | ✅   | [e2e/core-commands.spec.ts](../tests/e2e/core-commands.spec.ts): `copy-title copies only the page title as plain text`                                                                                                                                                                                                                       |
| B-CMD-04                   | Copy Google Sheets Range                                                     | ✅   | [e2e/google-sheets.spec.ts](../tests/e2e/google-sheets.spec.ts): `copy-google-sheets-range copies URL with range parameter`                                                                                                                                                                                                                  |
| **リンクフォーマット**     |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-FMT-01                   | Plain URL                                                                    | ✅   | [e2e/link-formats.spec.ts](../tests/e2e/link-formats.spec.ts): `plainUrl format: text is URL only`                                                                                                                                                                                                                                           |
| B-FMT-02                   | HTML                                                                         | ✅   | [e2e/link-formats.spec.ts](../tests/e2e/link-formats.spec.ts): `html format: text is title, html is <a> without emoji`                                                                                                                                                                                                                       |
| B-FMT-03                   | Markdown                                                                     | ✅   | [e2e/link-formats.spec.ts](../tests/e2e/link-formats.spec.ts): `markdown format: text is [title](url), no html`                                                                                                                                                                                                                              |
| B-FMT-04                   | HTML with Emoji                                                              | ✅   | [e2e/link-formats.spec.ts](../tests/e2e/link-formats.spec.ts): `htmlWithEmoji format: text is markdown, html has emoji + <a>`                                                                                                                                                                                                                |
| **サイト別処理**           |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-SITE-01                  | Google Docs                                                                  | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Google Docs: title is テスト document`                                                                                                                                                                                                                                           |
| B-SITE-02                  | Google Sheets                                                                | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Google Sheets: title is テスト spreadsheet`                                                                                                                                                                                                                                      |
| B-SITE-03                  | Google Slides                                                                | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Google Slides: title is テスト presentation`                                                                                                                                                                                                                                     |
| B-SITE-04                  | Google Drive                                                                 | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Google Drive: title is public folder`                                                                                                                                                                                                                                            |
| B-SITE-05                  | GitHub Repos                                                                 | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `GitHub Repo: emoji is :github:`                                                                                                                                                                                                                                                  |
| B-SITE-06                  | GitHub Pull Requests                                                         | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `GitHub Pull Request: title is #<number> <text>`                                                                                                                                                                                                                                  |
| B-SITE-07                  | GitHub Issues                                                                | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `GitHub Issue: title is #<number> <text>`                                                                                                                                                                                                                                         |
| B-SITE-08                  | Jira Issues                                                                  | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Jira Issue: title is HIBERNATE-77 Support HQL in / not in`; [unit/missingIssueTitle.test.ts](../tests/unit/missingIssueTitle.test.ts)                                                                                                                                            |
| B-SITE-09                  | Asana Tasks (fixture)                                                        | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Asana Task (mocked): title from aria-label`                                                                                                                                                                                                                                      |
| B-SITE-10                  | Backlog Issues (fixture)                                                     | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Backlog Issue (mocked): title from DOM selector`                                                                                                                                                                                                                                 |
| B-SITE-11                  | Redmine Issues (fixture)                                                     | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `Redmine Issue: title is Feature #642: OpenXR On Linux.`; [unit/missingIssueTitle.test.ts](../tests/unit/missingIssueTitle.test.ts)                                                                                                                                               |
| B-SITE-14                  | RedMica Issues (fixture)                                                     | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `RedMica Issue (mocked): footer credit enables title formatting and emoji`                                                                                                                                                                                                        |
| B-SITE-12                  | ReDoc v2 / v3                                                                | ✅   | [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): `ReDoc v3: copies the active operation title and Swagger emoji after navigation`; [unit/redocTitle.test.ts](../tests/unit/redocTitle.test.ts)                                                                                                                                     |
| B-SITE-13                  | 未登録サイト                                                                 | ✅   | [unit/emojiResolver.test.ts](../tests/unit/emojiResolver.test.ts): `returns empty string for unknown sites`; [unit/siteDetection.test.ts](../tests/unit/siteDetection.test.ts): `does not detect Redmine from incidental footer text`                                                                                                        |
| B-SITE-16                  | 共通の判定順・フッタークレジット                                             | ✅   | [unit/siteDetection.test.ts](../tests/unit/siteDetection.test.ts): `gives Jira the same priority in titles and emoji when a Redmine footer also exists`; [unit/siteDetection.test.ts](../tests/unit/siteDetection.test.ts): `finds Redmine credit after other footer links`                                                                  |
| **GitHub PR 状態別絵文字** |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-GH-PR-01                 | PR 4 状態それぞれの専用絵文字出力                                            | ✅   | [unit/emojiResolver.test.ts](../tests/unit/emojiResolver.test.ts): `uses the configured emoji for a $status pull request`; [e2e/site-title.spec.ts](../tests/e2e/site-title.spec.ts): merged PR output                                                                                                                                       |
| B-GH-PR-02                 | Conversation の状態解析（4 状態）                                            | ✅   | [unit/getEmojiName.test.ts](../tests/unit/getEmojiName.test.ts): `maps data-status=%s to %s`                                                                                                                                                                                                                                                 |
| B-GH-PR-03                 | Files Changed の状態フォールバック                                           | ✅   | [unit/getEmojiName.test.ts](../tests/unit/getEmojiName.test.ts): `falls back to reviewable_state text for GitHub Files Changed`                                                                                                                                                                                                              |
| B-GH-PR-04                 | 共通 PR 絵文字へのフォールバック                                             | ✅   | [unit/emojiResolver.test.ts](../tests/unit/emojiResolver.test.ts): `falls back to the default GitHub PR emoji when status emoji is not configured`                                                                                                                                                                                           |
| B-GH-PR-05                 | 保存後も継承を維持                                                           | ✅   | [e2e/pr-emoji-inheritance.spec.ts](../tests/e2e/pr-emoji-inheritance.spec.ts): `unset PR status emoji inherits changes to the common emoji after saving`; [unit/emojiSettings.test.ts](../tests/unit/emojiSettings.test.ts)                                                                                                                  |
| **カスタム Web サイト**    |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-CUSTOM-01                | カスタムスロット設定                                                         | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `custom website regex + emoji is applied for matching URLs`                                                                                                                                                                                                                                 |
| B-CUSTOM-02                | カスタム絵文字の優先                                                         | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `custom website regex takes priority over built-in site detection`                                                                                                                                                                                                                          |
| B-CUSTOM-03                | 設定済み絵文字と正規表現の一致                                               | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `custom website regex + emoji is applied for matching URLs`; [unit/emojiResolver.test.ts](../tests/unit/emojiResolver.test.ts): `falls through to built-in when custom emoji slot is unset (undefined)`                                                                                     |
| B-CUSTOM-04                | 正規表現エラー表示と有効な欄の保存                                           | ✅   | [unit/customRegexInput.test.ts](../tests/unit/customRegexInput.test.ts): `preserves the last valid regex, saves valid sibling edits, and clears validation after correction`                                                                                                                                                                 |
| B-CUSTOM-05                | 保存済み不正正規表現のフォールバック                                         | ✅   | [unit/customRegexInput.test.ts](../tests/unit/customRegexInput.test.ts): `ignores invalid persisted regexes and continues built-in emoji resolution`                                                                                                                                                                                         |
| **ポップアップ設定**       |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-POPUP-01                 | ビルトイン絵文字の編集                                                       | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `changing an emoji name persists and is used in copy`                                                                                                                                                                                                                                       |
| B-POPUP-02                 | カスタムサイト設定                                                           | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `custom website regex + emoji is applied for matching URLs`                                                                                                                                                                                                                                 |
| B-POPUP-03                 | 範囲リンク形式の選択                                                         | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `selecting a link format radio persists to storage`                                                                                                                                                                                                                                         |
| B-POPUP-04                 | リアルタイム保存                                                             | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `changing an emoji name persists and is used in copy`; [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `selecting a link format radio persists to storage`                                                                                                                                 |
| B-POPUP-05                 | 設定のエクスポート                                                           | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `exports emoji names and custom regexes to the clipboard`                                                                                                                                                                                                                                   |
| B-POPUP-06                 | 設定のインポートと入力欄更新                                                 | ✅   | [e2e/popup.spec.ts](../tests/e2e/popup.spec.ts): `imports settings, saves them, and refreshes the form inputs`                                                                                                                                                                                                                               |
| B-POPUP-07                 | 空セクションを個別・同時に初期化し、再読み込み後の保存状態も確認             | ✅   | [unit/importSettings.test.ts](../tests/unit/importSettings.test.ts): `accepts empty sections to reset settings`; [e2e/popup-regressions.spec.ts](../tests/e2e/popup-regressions.spec.ts): `importing empty ${section} resets only the requested settings`                                                                                    |
| B-POPUP-08                 | 不正なインポート時に既存設定を維持                                           | ✅   | [e2e/import-validation.spec.ts](../tests/e2e/import-validation.spec.ts): `malformed settings do not overwrite storage or the popup`; [unit/importSettings.test.ts](../tests/unit/importSettings.test.ts): `rejects malformed settings before saving: %j`                                                                                     |
| B-POPUP-09                 | エクスポート時のストレージエラー                                             | ✅   | [unit/exportStorageError.test.ts](../tests/unit/exportStorageError.test.ts): `shows exportFailure when the asynchronous storage callback reports an error`                                                                                                                                                                                   |
| B-POPUP-10                 | 空白除去とコロン補完による絵文字名の正規化                                   | ✅   | [unit/emojiSettings.test.ts](../tests/unit/emojiSettings.test.ts): `trims emoji input before normalizing: $input`, `trims ordinary, PR status, and custom emoji names before saving`; [unit/importSettings.test.ts](../tests/unit/importSettings.test.ts): `normalizes valid emoji names and preserves regexes`                              |
| **クリップボード**         |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-CLIP-01                  | ネイティブのデュアル形式コピー                                               | ✅   | [e2e/core-commands.spec.ts](../tests/e2e/core-commands.spec.ts): `copy-link copies title as text and HTML anchor`; [firefox/content.spec.ts](../tests/firefox/content.spec.ts)                                                                                                                                                               |
| B-CLIP-02                  | 非セキュア HTTP のフォールバック                                             | ✅   | [e2e/http-site.spec.ts](../tests/e2e/http-site.spec.ts)                                                                                                                                                                                                                                                                                      |
| B-CLIP-03                  | 選択範囲の保持                                                               | ✅   | [unit/clipboardFallback.test.ts](../tests/unit/clipboardFallback.test.ts): `restores the previous selection range after execCommand fallback`                                                                                                                                                                                                |
| B-CLIP-04                  | Copy Link の出力                                                             | ✅   | [e2e/core-commands.spec.ts](../tests/e2e/core-commands.spec.ts): `copy-link copies title as text and HTML anchor`                                                                                                                                                                                                                            |
| B-CLIP-05                  | Slack 向け HTML と Markdown 出力                                             | ✅   | [e2e/core-commands.spec.ts](../tests/e2e/core-commands.spec.ts): `copy-link-for-slack copies markdown text and HTML with emoji`                                                                                                                                                                                                              |
| B-CLIP-06                  | HTML エスケープ                                                              | ✅   | [unit/buildLinkCopyContent.test.ts](../tests/unit/buildLinkCopyContent.test.ts): `escapes title, URL and emoji only in HTML, preserving raw fallback values`                                                                                                                                                                                 |
| B-CLIP-07                  | Markdown エスケープ                                                          | ✅   | [unit/buildLinkCopyContent.test.ts](../tests/unit/buildLinkCopyContent.test.ts): `escapes Markdown syntax in %s plain text`                                                                                                                                                                                                                  |
| B-CLIP-08                  | 絵文字未設定時の区切り省略                                                   | ✅   | [unit/buildLinkCopyContent.test.ts](../tests/unit/buildLinkCopyContent.test.ts): `omits the emoji prefix and separator when no emoji is supplied`                                                                                                                                                                                            |
| **Google Sheets 範囲**     |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-RANGE-01                 | GID 抽出                                                                     | ✅   | [e2e/google-sheets.spec.ts](../tests/e2e/google-sheets.spec.ts): `copy-google-sheets-range copies URL with range parameter`                                                                                                                                                                                                                  |
| B-RANGE-02                 | セル範囲抽出                                                                 | ✅   | [e2e/google-sheets.spec.ts](../tests/e2e/google-sheets.spec.ts): `copy-google-sheets-range copies URL with range parameter`                                                                                                                                                                                                                  |
| B-RANGE-03                 | 範囲 URL 生成                                                                | ✅   | [e2e/google-sheets.spec.ts](../tests/e2e/google-sheets.spec.ts): `copy-google-sheets-range copies URL with range parameter`                                                                                                                                                                                                                  |
| B-RANGE-04                 | Sheets 以外では no-op                                                        | ✅   | [e2e/google-sheets.spec.ts](../tests/e2e/google-sheets.spec.ts): `copy-google-sheets-range on non-Sheets page does nothing`                                                                                                                                                                                                                  |
| B-RANGE-05                 | 4 種の範囲リンク形式                                                         | ✅   | [e2e/link-formats.spec.ts](../tests/e2e/link-formats.spec.ts)                                                                                                                                                                                                                                                                                |
| B-RANGE-06                 | gid 欠落・空文字時の既定値 0 と、指定した gid の保持                         | ✅   | [unit/googleSheetsRangeInfo.test.ts](../tests/unit/googleSheetsRangeInfo.test.ts): missing/empty gid cases and `preserves the selected sheet ID and replaces the previous hash`                                                                                                                                                              |
| B-RANGE-07                 | 範囲名ボックスの欠落・空文字時の処理と失敗通知                               | ✅   | [unit/googleSheetsRangeInfo.test.ts](../tests/unit/googleSheetsRangeInfo.test.ts): `returns no range when the name box is %s`; [unit/copyTextLinkCore.test.ts](../tests/unit/copyTextLinkCore.test.ts): `notifies failure when range info is unavailable (name box missing)`; [e2e/toast.spec.ts](../tests/e2e/toast.spec.ts): failure toast |
| **トースト通知**           |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-TOAST-01                 | 成功トースト                                                                 | ✅   | [e2e/toast.spec.ts](../tests/e2e/toast.spec.ts): `toast appears after copy-link and disappears after ~3s`                                                                                                                                                                                                                                    |
| B-TOAST-02                 | 表示位置（静的 CSS の検証）                                                  | ✅   | [unit/toast-css.test.ts](../tests/unit/toast-css.test.ts): `positions the toast 24px from the bottom`; [unit/toast-css.test.ts](../tests/unit/toast-css.test.ts): `positions the toast 24px from the left`                                                                                                                                   |
| B-TOAST-03                 | トーストの自動消去                                                           | ✅   | [e2e/toast.spec.ts](../tests/e2e/toast.spec.ts): `toast appears after copy-link and disappears after ~3s`                                                                                                                                                                                                                                    |
| B-TOAST-04                 | Shadow DOM 隔離                                                              | ✅   | [unit/toastShadowDom.test.ts](../tests/unit/toastShadowDom.test.ts): `places .copylink-dev-toast inside the shadow root, not in the main document`                                                                                                                                                                                           |
| **国際化**                 |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-I18N-01                  | 英語                                                                         | ✅   | [unit/i18n.test.ts](../tests/unit/i18n.test.ts) (locale key completeness)                                                                                                                                                                                                                                                                    |
| B-I18N-02                  | 日本語                                                                       | ✅   | [unit/i18n.test.ts](../tests/unit/i18n.test.ts) (locale key completeness)                                                                                                                                                                                                                                                                    |
| B-I18N-03                  | 簡体字中国語                                                                 | ✅   | [unit/i18n.test.ts](../tests/unit/i18n.test.ts) (locale key completeness)                                                                                                                                                                                                                                                                    |
| B-I18N-04                  | ブラウザー言語のポップアップ翻訳表示と、各言語のキーの静的検証               | ✅   | [e2e/popup-regressions.spec.ts](../tests/e2e/popup-regressions.spec.ts): `localizes every popup data-i18n element with browser messages`; [unit/i18n.test.ts](../tests/unit/i18n.test.ts): locale key checks                                                                                                                                 |
| **エラーハンドリング**     |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-ERR-01                   | アクティブタブなし                                                           | ✅   | [unit/background.test.ts](../tests/unit/background.test.ts): `logs an error and does nothing when no active tab is found`                                                                                                                                                                                                                    |
| B-ERR-02                   | 非 Web スキーム（Chrome）                                                    | ✅   | [unit/background.test.ts](../tests/unit/background.test.ts): `rejects chrome:// URLs without injecting the content script`; [unit/background.test.ts](../tests/unit/background.test.ts): `rejects about:blank without injecting the content script`                                                                                          |
| B-ERR-03                   | 注入失敗（Chrome）                                                           | ✅   | [unit/background.test.ts](../tests/unit/background.test.ts): `logs error and does NOT send message when script injection fails`                                                                                                                                                                                                              |
| B-ERR-04                   | ネイティブ API 失敗時のフォールバック                                        | ✅   | [unit/clipboardFallback.test.ts](../tests/unit/clipboardFallback.test.ts): `attempts the execCommand fallback when Clipboard API fails and a fallbackElement is given`; [firefox/content.spec.ts](../tests/firefox/content.spec.ts)                                                                                                          |
| B-ERR-05                   | コピー失敗通知                                                               | ✅   | [unit/copyTextLinkCore.test.ts](../tests/unit/copyTextLinkCore.test.ts): `notifies failure when the copy operation fails (B-ERR-05)`                                                                                                                                                                                                         |
| B-ERR-06                   | URL 欠落（Chrome）                                                           | ✅   | [unit/background.test.ts](../tests/unit/background.test.ts): `logs an error and does nothing when tab has no URL`                                                                                                                                                                                                                            |
| B-ERR-07                   | Chrome・Firefox のバックグラウンドメッセージ送信エラー                       | ✅   | [unit/background.test.ts](../tests/unit/background.test.ts): `logs message delivery failures without rejecting the command listener`; [unit/backgroundFirefox.test.ts](../tests/unit/backgroundFirefox.test.ts): `logs runtime message errors without throwing`                                                                              |
| **コンテントスクリプト**   |                                                                              |      |                                                                                                                                                                                                                                                                                                                                              |
| B-CS-01                    | 重複注入防止                                                                 | ✅   | [unit/content.test.ts](../tests/unit/content.test.ts): `does NOT re-register the listener when the script is injected a second time`                                                                                                                                                                                                         |
| B-CS-02                    | Chrome の動的注入と、Linux で実ショートカットによる activeTab 付与・取り消し | ✅   | [unit/background.test.ts](../tests/unit/background.test.ts): valid-page injection; [browser-ui/chromium-shortcuts.spec.ts](../tests/browser-ui/chromium-shortcuts.spec.ts): `native shortcuts grant activeTab to the unmodified Chrome build`                                                                                                |
| B-CS-03                    | Firefox アドオンをインストールし、Linux で manifest 注入と実コピー操作を確認 | ✅   | [browser-ui/firefox-addon.spec.ts](../tests/browser-ui/firefox-addon.spec.ts): `installs the Firefox add-on and copies through manifest-driven scripts`; [firefox/content.spec.ts](../tests/firefox/content.spec.ts): content integration                                                                                                    |
| B-CS-04                    | 成功・例外時の完了通知                                                       | ✅   | [unit/commandCompletion.test.ts](../tests/unit/commandCompletion.test.ts): `keeps the message port open and responds only after the command completes`; [unit/commandCompletion.test.ts](../tests/unit/commandCompletion.test.ts): `logs command errors locally and still responds with completion only`                                     |
| B-CS-05                    | 両ブラウザーの XML パス除外（大文字・クエリ・ハッシュの境界を含む）          | ✅   | [unit/background.test.ts](../tests/unit/background.test.ts), [unit/backgroundFirefox.test.ts](../tests/unit/backgroundFirefox.test.ts): XML paths are ignored; non-XML paths with XML in the query still dispatch                                                                                                                            |
| B-CS-06                    | 未対応の種別・コマンド、コマンド欠落メッセージを無視                         | ✅   | [unit/content.test.ts](../tests/unit/content.test.ts): `ignores unsupported messages without copying or responding: %j`                                                                                                                                                                                                                      |

## 3. 残っている検証範囲

全 79 項目に、記載した範囲での明示的な自動検証があります。実ブラウザー操作の E2E は両ブラウザーの Linux Alt+L・Alt+Shift+L と Chrome の Alt+T、通常の Chrome ビルドでの activeTab 付与と別オリジンへの遷移後の取り消し、Firefox アドオンの一時インストールを確認します。Sheets のショートカットは既存のコマンドヘルパー経由で検証します。Firefox/Linux の Alt+T はブラウザーの Tools メニューと競合する既知の制約です。タイトルコピー処理は Firefox のコンテントテストで検証し、この実ショートカットは動作保証の対象に含めません。ポップアップの翻訳は実行中のブラウザー言語で表示を確認し、全言語ファイルのキーも静的に検証します。Windows/macOS のショートカット、他のブラウザーバージョン、別リポジトリの UserScript は引き続き手動または利用側での確認が必要です。

この一覧は実行時の動作を対象とし、ビルド・リリース処理すべての一覧ではありません。CI では型・lint・ユニットテスト・両ブラウザのビルド・Actions ロックファイルも確認し、リリース公開は CI とブラウザテストの成功を条件にしています。各ワークフローと [tests/README.md](../tests/README.md) を参照してください。
