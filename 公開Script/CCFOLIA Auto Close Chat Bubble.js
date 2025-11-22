// ==UserScript==
// @name         CCFOLIA Auto Close Chat Bubble
// @namespace    https://github.com/
// @version      1.0
// @description  ココフォリアのメッセージ吹き出しを、表示完了から5秒後に自動的に閉じます（編集画面回避・低負荷版）
// @author       User
// @match        https://ccfolia.com/rooms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ccfolia.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // =================================================================
    // 設定エリア (数値を変更して調整できます)
    // =================================================================
    const CONFIG = {
        // メッセージの表示完了後、閉じるまでに待機する時間 (ミリ秒)
        // 5000 = 5秒
        WAIT_TIME: 5000,

        // 文字送りが止まったとみなすバッファ時間 (ミリ秒)
        // 通常は変更不要です
        STABILITY_TIME: 500
    };

    // =================================================================
    // 内部処理 (ここから下は変更不要)
    // =================================================================
    const TOTAL_DELAY = CONFIG.WAIT_TIME + CONFIG.STABILITY_TIME;
    const managedButtons = new WeakSet(); // 二重登録防止用

    /**
     * そのボタンが「無視すべきボタン（編集画面や設定画面）」か判定する
     * @param {HTMLElement} btn - 判定対象のボタン
     */
    function isIgnoredButton(btn) {
        // 1. ダイアログ (モーダルウィンドウ) 内のボタンは無視
        // (キャラクター編集、ルーム設定などは role="dialog" や .MuiDialog-root 内にある)
        if (btn.closest('[role="dialog"]') || btn.closest('.MuiDialog-root')) {
            return true;
        }

        // 2. ドロワー (サイドバー) 内のボタンは無視
        // (チャットログ一覧や設定サイドバーなどが該当)
        if (btn.closest('.MuiDrawer-root')) {
            return true;
        }

        // 3. 入力フォームを含むコンテナ内のボタンは念のため無視
        // (吹き出しに入力欄はないため、これがあれば編集画面の可能性が高い)
        const container = btn.closest('div[class*="MuiPaper"]') || btn.parentElement?.parentElement;
        if (container && container.querySelector('input, textarea, select')) {
            return true;
        }

        return false;
    }

    /**
     * 閉じるボタンに対して監視イベントとタイマーを設定する
     * @param {HTMLElement} closeBtn - 閉じるボタン要素
     */
    function setupAutoClose(closeBtn) {
        // 既に管理済みのボタンなら何もしない
        if (managedButtons.has(closeBtn)) return;

        // 除外対象のボタン（編集画面など）なら管理済みマークだけ付けて終了
        if (isIgnoredButton(closeBtn)) {
            managedButtons.add(closeBtn);
            return;
        }

        managedButtons.add(closeBtn);

        // 吹き出しのコンテナ（テキストが含まれる親要素）を特定
        const container = closeBtn.closest('div[class*="MuiPaper"]') ||
                          closeBtn.parentElement?.parentElement ||
                          document.body;

        let closeTimer = null;

        // 実際に閉じる処理
        const executeClose = () => {
            // 実行時にまだボタンが画面上に存在していればクリック
            if (closeBtn.isConnected) {
                closeBtn.click();
            }
        };

        // タイマーをリセットする関数（デバウンス処理）
        // テキストが変化（タイプライター演出など）するたびに呼ばれ、閉じる予約を先延ばしにする
        const resetTimer = () => {
            if (closeTimer) clearTimeout(closeTimer);
            closeTimer = setTimeout(executeClose, TOTAL_DELAY);
        };

        // テキスト変更監視用のオブザーバー
        const textObserver = new MutationObserver(() => {
            resetTimer();
        });

        // コンテナ内の変更監視を開始（文字データの変更や子要素の追加を検知）
        textObserver.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // 初回実行
        resetTimer();
    }

    /**
     * ノードリスト内から対象の閉じるボタンを探し出す
     */
    function scanNodesForButtons(nodes) {
        const selectors = 'button svg[data-testid="CloseIcon"], button[aria-label="close"]';

        nodes.forEach(node => {
            // 要素ノード以外は無視
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            // 追加されたノード自体がボタンである可能性と、子孫に含まれる可能性の両方を確認
            if (node.matches && (node.matches(selectors) || node.querySelector(selectors))) {
                const icons = node.querySelectorAll(selectors);
                icons.forEach(icon => {
                    const btn = icon.closest('button');
                    if (btn) setupAutoClose(btn);
                });
                return;
            }

            // 子孫要素のみ検索
            const foundIcons = node.querySelectorAll(selectors);
            foundIcons.forEach(icon => {
                const btn = icon.closest('button');
                if (btn) setupAutoClose(btn);
            });
        });
    }

    // ---------------------------------------------------------
    // 画面全体の監視を開始
    // ---------------------------------------------------------
    const mainObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                scanNodesForButtons(mutation.addedNodes);
            }
        });
    });

    mainObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // スクリプト読み込み時に既に表示されている吹き出しにも適用
    scanNodesForButtons([document.body]);

})();
