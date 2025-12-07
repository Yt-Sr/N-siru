document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('canvas');
    // HTMLからすべてのタイル要素を取得
    const tiles = document.querySelectorAll('.tile',);
    
    // HTMLのdata属性から情報を取得するための関数
    const getTileInfo = (element) => {

        const descElement = element.querySelector('.tile-desc');

        return {
            title: element.querySelector('.tile-title').innerText,
            desc: descElement ? descElement.innerText : '', // 
            type: element.classList.contains('type-entertainment') ? 'entertainment' :
                  element.classList.contains('type-food') ? 'food' :
                  element.classList.contains('type-shopping') ? 'shopping' :
                  element.classList.contains('type-service') ? 'service' :
                  element.classList.contains('type-info') ? 'info' :
                  element.classList.contains('type-special') ? 'special' :
                  'external',
            linkType: element.getAttribute('data-link-type'),
            url: element.getAttribute('data-url'),
            icon: element.getAttribute('data-icon') || ''
        };
    };

    // --- ★ 修正箇所 1: モーダル表示ロジックの切り替え ★ ---
    
    // 各タイルにクリックイベントを設定
    tiles.forEach(tile => {
        tile.addEventListener('click', (e) => {
            e.stopPropagation();
            const info = getTileInfo(tile);
            
            if (info.linkType === 'external' && info.url) {
                window.open(info.url, '_blank');
                
            } else if (info.linkType === 'modal') {
                // 1. タイル内に埋め込まれたカスタムモーダルを探す
                const customModal = tile.querySelector('.modal');
                
                if (customModal) {
                    // カスタムモーダルが見つかった場合、それを表示
                    // ★ 画面全体を覆うために、モーダルを body の直下に移動 ★
                    document.body.appendChild(customModal);
                    
                    customModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // スクロール停止

                    // 閉じる際に元の位置に戻すために、元の親（wrapper）のIDを保持
                    const modalWrapper = tile.querySelector('.modal-content-hidden');
                    if(modalWrapper) {
                        customModal.dataset.originalParentId = modalWrapper.id || 'temp-wrapper-' + Math.random().toString(36).substring(2, 9);
                        if (!modalWrapper.id) modalWrapper.id = customModal.dataset.originalParentId;
                    }

                } else {
                    // カスタムモーダルがない場合、汎用モーダルを使う (タイル18など)
                    showModal(info);
                }
            } else {
                // その他のリンクタイプがない場合も汎用モーダルを使う
                showModal(info);
            }
        });
    });

    // モーダル表示 (汎用モーダル #modal のコンテンツを構築する関数)
    function showModal(content) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="tile-icon" style="background-color: ${content.iconColor || 'transparent'};">${content.icon}</div>
            <h2>${content.title}</h2>
            <p>${content.desc}</p>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // スクロール停止
    }

    // --- ★ 修正箇所 2: モーダルを閉じる関数を汎用的に修正 ★ ---
    window.closeModal = function() {
        // 現在 'active' クラスが付与されている全てのモーダル要素を閉じる
        const activeModals = document.querySelectorAll('.modal.active'); 
        
        activeModals.forEach(modal => {
            modal.classList.remove('active');
            
            // 画面全体を覆うために移動したカスタムモーダルを元の位置に戻す
            if (modal.dataset.originalParentId) {
                const originalWrapper = document.getElementById(modal.dataset.originalParentId);
                if (originalWrapper) {
                    originalWrapper.appendChild(modal);
                }
                delete modal.dataset.originalParentId; // データの削除
            }
        });
        
        // 背景のスクロールを再開
        document.body.style.overflow = ''; 
    };
    


    // スクロールでミニマップを更新
    window.addEventListener('scroll', updateMinimap);
   
    // ミニマップ更新 - document.body.scrollWidth/Heightを使用
    function updateMinimap() {
        const minimapContent = document.getElementById('minimapContent');
        minimapContent.innerHTML = '<div class="minimap-viewport" id="minimapViewport"></div>';

        const minimap = document.querySelector('.minimap');
        const viewport = document.getElementById('minimapViewport');

        // 実際のスクロール可能領域のサイズを取得
        const canvasWidth = document.body.scrollWidth;
        const canvasHeight = document.body.scrollHeight;
        const minimapWidth = minimap.offsetWidth;
        const minimapHeight = minimap.offsetHeight;

        // 縮尺を計算
        const scaleX = minimapWidth / canvasWidth;
        const scaleY = minimapHeight / canvasHeight;

        // タイルをミニマップに描画
        tiles.forEach(tile => {
        if (tile.classList.contains('type-hidden')) {
            return; 
        }
        
            const dot = document.createElement('div');
            dot.className = 'minimap-dot';
            
            // タイルの実際の位置を取得（親要素からの相対位置）
            const tileX = tile.offsetLeft;
            const tileY = tile.offsetTop;
            const tileWidth = tile.offsetWidth;
            const tileHeight = tile.offsetHeight;

            // タイルの中心位置を計算
            const centerX = tileX + (tileWidth / 2);
            const centerY = tileY + (tileHeight / 2);

            // ミニマップ上の位置に変換
            dot.style.left = (centerX * scaleX) + 'px';
            dot.style.top = (centerY * scaleY) + 'px';
            minimapContent.appendChild(dot);
        });

        // ビューポート（現在の表示領域）のサイズを計算
        const viewportWidth = window.innerWidth * scaleX;
        const viewportHeight = window.innerHeight * scaleY;

        viewport.style.width = viewportWidth + 'px';
        viewport.style.height = viewportHeight + 'px';

        // 現在のスクロール位置を取得
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;

        // ミニマップ上でのビューポート位置を計算
        const viewportLeft = scrollX * scaleX;
        const viewportTop = scrollY * scaleY;

        // ビューポートがミニマップからはみ出さないようにクランプ
        const clampedLeft = Math.max(0, Math.min(minimapWidth - viewportWidth, viewportLeft));
        const clampedTop = Math.max(0, Math.min(minimapHeight - viewportHeight, viewportTop));

        viewport.style.left = clampedLeft + 'px';
        viewport.style.top = clampedTop + 'px';
    }

    // 検索機能
    document.querySelector('.search-box')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        tiles.forEach(tile => {
            const title = tile.querySelector('.tile-title').innerText.toLowerCase();
            // desc が存在しない可能性を考慮して安全に取得
            const descElement = tile.querySelector('.tile-desc');
            const desc = descElement ? descElement.innerText.toLowerCase() : '';

            const matches = title.includes(searchTerm) || desc.includes(searchTerm);
            tile.style.opacity = matches || searchTerm === '' ? '1' : '0.3';
        });
    });

    // 初期位置を中央
window.addEventListener('load', function() {
    window.scrollTo(1500, 1500); 

    // ミニマップの更新処理
    updateMinimap(); 
});


    // キーボードショートカット（矢印キー＋WASD）
    document.addEventListener('keydown', (e) => {
        const scrollSpeed = 200;
        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                window.scrollBy(0, -scrollSpeed);
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                window.scrollBy(0, scrollSpeed);
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                window.scrollBy(-scrollSpeed, 0);
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                window.scrollBy(scrollSpeed, 0);
                e.preventDefault();
                break;
            case 'escape': 
                closeModal();
                break;
        }
    });

    // モーダルを背景クリックで閉じる (すべてのモーダルに対応)
    document.addEventListener('click', (e) => {
        // クリックされた要素が '.modal' クラスを持っていて、かつ 'active' の場合
        if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
            closeModal();
        }
        if (e.target.classList.contains('close-btn')) {
            closeModal();
        }
        
        

    });
    
});

