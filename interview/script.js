document.addEventListener('DOMContentLoaded', () => {
    
    // 目次のリンクを取得
    const tocLinks = document.querySelectorAll('.toc-item');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // デフォルトのリンク動作を防ぐ
            
            // href属性から移動先のIDを取得
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // 対象セクションまでスムーズにスクロール
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    console.log('Smooth scroll for TOC initialized.');
});