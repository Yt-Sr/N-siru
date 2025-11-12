// スクロールでコマを表示
        function checkPanels() {
            const panels = document.querySelectorAll('.panel');
            const windowHeight = window.innerHeight;

            panels.forEach((panel, index) => {
                const rect = panel.getBoundingClientRect();
                const panelTop = rect.top;


            });
        }

        // 初回チェック
        checkPanels();

        // スクロール時にチェック
        window.addEventListener('scroll', checkPanels);

        // リサイズ時にもチェック
        window.addEventListener('resize', checkPanels);

        // スクロールでコマを表示するメイン関数
function checkPanels() {
    const panels = document.querySelectorAll('.panel');
    const windowHeight = window.innerHeight;

    panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        const panelTop = rect.top;
        
        // 既に表示済みのコマは処理をスキップ
        if (panel.classList.contains('visible')) {
            return;
        }

        // 💡 表示位置の条件: 画面の下端から少し上（例: 画面の80%位置）に来たら表示
        if (panelTop < windowHeight * 0.8) { 
            
            // このsetTimeoutブロックは、スクロールイベントでのみ実行される
            // 最初の画面内のコマは、このブロックに入る前に下の initialPanelsCheck() で処理済みのはず
            setTimeout(() => {
                panel.classList.add('visible');
            }, index * 10); // 時間差で表示
        }
    });
}

// 💡 リロード時に画面内にあるコマを即座に表示する関数
function initialPanelsCheck() {
    const panels = document.querySelectorAll('.panel');
    const windowHeight = window.innerHeight;

    panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const panelTop = rect.top;

        // 💡 画面内にあれば、時間差なしで即時表示
        if (panelTop < windowHeight * 1) {
            panel.classList.add('visible');
        }
    });
    
    // 初回チェック後、念のためスクロール時のチェックも一度実行して、
    // まだ visible になっていないが画面内にある次のコマがないか確認する
    // (ただし、この関数内で全て処理されるはずなので、必須ではない)
    // checkPanels();
}

// ----------------------------------------------------
// イベントリスナーの実行
// ----------------------------------------------------

// 💡 1. ページロードが完了したタイミングで initialPanelsCheck を実行
// 最初の画面内のコマは時間差なしで表示される
document.addEventListener('DOMContentLoaded', initialPanelsCheck);

// 2. スクロール時のチェックは、それ以降のコマを時間差で表示
window.addEventListener('scroll', checkPanels);

// リサイズ時にもチェック
window.addEventListener('resize', initialPanelsCheck);