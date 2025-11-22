// ==UserScript==
// @name         Ccfolia Tab Customizer
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  ココフォリアのチャットタブを3段まで折り返し表示し、選択中のタブに赤いラインを表示します。レイアウト崩れを徹底的に防止した安定版です。
// @author       むらひと
// @license      MIT
// @match        https://ccfolia.com/rooms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ccfolia.com
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    /**
     * -------------------------------------------------------------------------
     * Configuration
     * -------------------------------------------------------------------------
     */
    const CONFIG = {
        // タブ1行あたりの高さ(px)
        // ※ ここを変更すると全ての段の高さが追従します
        TAB_HEIGHT: 36,

        // 表示する最大行数
        MAX_ROWS: 3,

        // 赤いラインの太さ(px)
        LINE_WIDTH: 3
    };

    // スクロールコンテナの最大高さ計算 (行数 * 高さ + 微調整用の余裕)
    const SCROLL_MAX_HEIGHT = (CONFIG.TAB_HEIGHT * CONFIG.MAX_ROWS) + 2;

    /**
     * -------------------------------------------------------------------------
     * Styles
     * -------------------------------------------------------------------------
     */
    const styles = `
        /* ==========================================================================
           1. Container Reset (コンテナの初期化)
           MUIデフォルトの min-height や padding を無効化し、
           1段目が不自然に広がる現象を防ぎます。
           ========================================================================== */
        [class*="MuiDrawer-root"] [class*="MuiTabs-root"],
        [class*="MuiPaper-root"] [class*="MuiTabs-root"],
        [class*="MuiDrawer-root"] [class*="MuiTabs-scroller"],
        [class*="MuiPaper-root"] [class*="MuiTabs-scroller"],
        [class*="MuiDrawer-root"] [class*="MuiTabs-flexContainer"],
        [class*="MuiPaper-root"] [class*="MuiTabs-flexContainer"] {
            min-height: 0 !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
        }

        /* ==========================================================================
           2. Flex Layout (折り返し設定)
           タブを左上詰めで折り返し配置します。
           ========================================================================== */
        [class*="MuiDrawer-root"] [class*="MuiTabs-flexContainer"],
        [class*="MuiPaper-root"] [class*="MuiTabs-flexContainer"] {
            display: flex !important;
            flex-wrap: wrap !important;
            align-content: flex-start !important;
            justify-content: flex-start !important;
            flex-direction: row !important;
            width: 100% !important;
        }

        /* ==========================================================================
           3. Scroll Control (スクロール設定)
           設定した行数を超えた場合のみ縦スクロールバーを表示します。
           ========================================================================== */
        [class*="MuiDrawer-root"] [class*="MuiTabs-scroller"],
        [class*="MuiPaper-root"] [class*="MuiTabs-scroller"] {
            display: block !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            max-height: ${SCROLL_MAX_HEIGHT}px !important;
        }

        /* ==========================================================================
           4. Tab Item Styling (タブのスタイル)
           border等は使用せず、サイズを厳密に固定します。
           ========================================================================== */
        [class*="MuiDrawer-root"] [class*="MuiTab-root"],
        [class*="MuiPaper-root"] [class*="MuiTab-root"] {
            /* 高さ固定 */
            height: ${CONFIG.TAB_HEIGHT}px !important;
            min-height: ${CONFIG.TAB_HEIGHT}px !important;
            max-height: ${CONFIG.TAB_HEIGHT}px !important;

            /* 横幅と配置 */
            flex-grow: 1 !important;
            max-width: none !important;
            min-width: auto !important;
            box-sizing: border-box !important;

            /* 余白設定 (上下0, 左右8px) */
            padding: 0 8px !important;
            margin: 0 !important;

            /* ボーダーリセット (高さズレ防止のためborderは使わない) */
            border: none !important;

            /* テキスト配置 */
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;

            /* アニメーション無効化 */
            transition: none !important;
            opacity: 0.7 !important;
        }

        /* タブ内テキストラッパーのズレ防止 */
        [class*="MuiTab-root"] > [class*="MuiTab-wrapper"],
        [class*="MuiTab-root"] > span {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
        }

        /* ==========================================================================
           5. Cleanup (不要要素の非表示)
           ========================================================================== */
        /* デフォルトの青い下線 */
        [class*="MuiTabs-indicator"],
        /* 横スクロールボタン */
        [class*="MuiTabScrollButton-root"] {
            display: none !important;
        }

        /* ==========================================================================
           6. Selected State (選択状態の強調)
           box-shadow(内側の影)を使用して赤いラインを描画します。
           borderを使わないため、レイアウトや高さに一切影響を与えません。
           ========================================================================== */
        [class*="MuiDrawer-root"] [class*="MuiTab-root"].Mui-selected,
        [class*="MuiPaper-root"] [class*="MuiTab-root"].Mui-selected {
            /* 下方向に赤い内影をつける */
            box-shadow: inset 0 -${CONFIG.LINE_WIDTH}px 0 0 #ff0000 !important;

            font-weight: bold !important;
            opacity: 1 !important;
            z-index: 10 !important;
        }
    `;

    // スタイルを適用
    GM_addStyle(styles);

    console.log("Ccfolia Tab Customizer v1.0.0: Loaded successfully.");
})();
