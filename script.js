document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('canvas');
    // HTMLからすべてのタイル取得
    const tiles = document.querySelectorAll('.tile',);
    
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


    

    tiles.forEach(tile => {
        tile.addEventListener('click', (e) => {
            e.stopPropagation();
            const info = getTileInfo(tile);
            
            if (info.linkType === 'external' && info.url) {
                window.open(info.url, '_blank');
    //         if (info.linkType === 'external' && info.url) {
    // window.location.href = info.url;//}
                
            } else if (info.linkType === 'modal') {
                const customModal = tile.querySelector('.modal');
                
                if (customModal) {

                    document.body.appendChild(customModal);
                    
                    customModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // スクロール停止


                    const modalWrapper = tile.querySelector('.modal-content-hidden');
                    if(modalWrapper) {
                        customModal.dataset.originalParentId = modalWrapper.id || 'temp-wrapper-' + Math.random().toString(36).substring(2, 9);
                        if (!modalWrapper.id) modalWrapper.id = customModal.dataset.originalParentId;
                    }

                } else {

                    showModal(info);
                }
            } else {

                showModal(info);
            }
        });
    });


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


    window.closeModal = function() {

        const activeModals = document.querySelectorAll('.modal.active'); 
        
        activeModals.forEach(modal => {
            modal.classList.remove('active');
            

            if (modal.dataset.originalParentId) {
                const originalWrapper = document.getElementById(modal.dataset.originalParentId);
                if (originalWrapper) {
                    originalWrapper.appendChild(modal);
                }
                delete modal.dataset.originalParentId; 
            }
        });
        

        document.body.style.overflow = ''; 
    };
    



    window.addEventListener('scroll', updateMinimap);
   

    function updateMinimap() {
        const minimapContent = document.getElementById('minimapContent');
        minimapContent.innerHTML = '<div class="minimap-viewport" id="minimapViewport"></div>';

        const minimap = document.querySelector('.minimap');
        const viewport = document.getElementById('minimapViewport');


        const canvasWidth = document.body.scrollWidth;
        const canvasHeight = document.body.scrollHeight;
        const minimapWidth = minimap.offsetWidth;
        const minimapHeight = minimap.offsetHeight;

        // 縮尺
        const scaleX = minimapWidth / canvasWidth;
        const scaleY = minimapHeight / canvasHeight;

        // タイルをミニマップに反映
        tiles.forEach(tile => {
        if (tile.classList.contains('type-hidden')) {
            return; 
        }
        
            const dot = document.createElement('div');
            dot.className = 'minimap-dot';
            
            // タイル位置取得
            const tileX = tile.offsetLeft;
            const tileY = tile.offsetTop;
            const tileWidth = tile.offsetWidth;
            const tileHeight = tile.offsetHeight;

            // タイルの中心位置計算
            const centerX = tileX + (tileWidth / 2);
            const centerY = tileY + (tileHeight / 2);


            dot.style.left = (centerX * scaleX) + 'px';
            dot.style.top = (centerY * scaleY) + 'px';
            minimapContent.appendChild(dot);
        });


        const viewportWidth = window.innerWidth * scaleX;
        const viewportHeight = window.innerHeight * scaleY;

        viewport.style.width = viewportWidth + 'px';
        viewport.style.height = viewportHeight + 'px';

        // 現在のスクロール位置を取得
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;


        const viewportLeft = scrollX * scaleX;
        const viewportTop = scrollY * scaleY;


        const clampedLeft = Math.max(0, Math.min(minimapWidth - viewportWidth, viewportLeft));
        const clampedTop = Math.max(0, Math.min(minimapHeight - viewportHeight, viewportTop));

        viewport.style.left = clampedLeft + 'px';
        viewport.style.top = clampedTop + 'px';
    }

    // 検索機能（廃止）
    document.querySelector('.search-box')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        tiles.forEach(tile => {
            const title = tile.querySelector('.tile-title').innerText.toLowerCase();
            const descElement = tile.querySelector('.tile-desc');
            const desc = descElement ? descElement.innerText.toLowerCase() : '';

            const matches = title.includes(searchTerm) || desc.includes(searchTerm);
            tile.style.opacity = matches || searchTerm === '' ? '1' : '0.3';
        });
    });


window.addEventListener('load', function() {
    window.scrollTo(900, 1200); 


    updateMinimap(); 
});



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


    document.addEventListener('click', (e) => {

        if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
            closeModal();
        }
        if (e.target.classList.contains('close-btn')) {
            closeModal();
        }
        
        

    });
    
});

