// グローバル状態管理
const state = {
    isDrawing: false,
    currentColor: '#8B4513',
    canvas: null,
    ctx: null,
    answers: {
        worksheetName: '',
        closest: '',
        furthest: '',
        redBall: '',
        curtain: '',
        sunlight: '',
        owner: '',
        hidingSpot: '',
        surprised: '',
        likedPlace: '',
        wish: ''
    },
    gallery: []
};

// カラーパレット定義
const colors = [
    { name: 'ちゃいろ (ネコ視点の赤)', value: '#8B4513' },
    { name: 'きいろ (ネコが得意)', value: '#FFD700' },
    { name: 'あお (ネコが得意)', value: '#4169E1' },
    { name: 'みどり', value: '#3CB371' },
    { name: 'ピンク', value: '#FF69B4' },
    { name: 'あか (自由に表現)', value: '#FF4500' },
    { name: 'グレー', value: '#808080' },
    { name: 'くろ', value: '#000000' }
];

// DOMContentLoaded イベント
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    initializeColorPalette();
    initializeEventListeners();
    loadGalleryFromLocalStorage();
});

// キャンバス初期化
function initializeCanvas() {
    state.canvas = document.getElementById('drawingCanvas');
    state.ctx = state.canvas.getContext('2d');
    
    // 内部解像度設定
    state.canvas.width = 700;
    state.canvas.height = 500;
    
    // コンテキスト設定
    state.ctx.lineCap = 'round';
    state.ctx.lineJoin = 'round';
    state.ctx.lineWidth = 6;
    
    // 初期背景(白)
    state.ctx.fillStyle = '#FFFFFF';
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
}

// カラーパレット初期化
function initializeColorPalette() {
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';
    
    colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color.value;
        btn.title = color.name;
        
        if (color.value === state.currentColor) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
            state.currentColor = color.value;
            updateColorPalette();
        });
        
        palette.appendChild(btn);
    });
}

// カラーパレット更新
function updateColorPalette() {
    const btns = document.querySelectorAll('.color-btn');
    btns.forEach(btn => {
        if (btn.style.backgroundColor === rgbToHex(state.currentColor) || btn.style.backgroundColor === state.currentColor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// RGB to HEX変換ヘルパー
function rgbToHex(color) {
    if (color.startsWith('#')) return color;
    
    const rgb = color.match(/\d+/g);
    if (!rgb) return color;
    
    const hex = '#' + rgb.map(x => {
        const h = parseInt(x).toString(16);
        return h.length === 1 ? '0' + h : h;
    }).join('');
    
    return hex;
}

// イベントリスナー初期化
function initializeEventListeners() {
    // タブ切り替え
    document.getElementById('worksheetTab').addEventListener('click', () => switchTab('worksheet'));
    document.getElementById('galleryTab').addEventListener('click', () => switchTab('gallery'));
    
    // キャンバス描画
    state.canvas.addEventListener('mousedown', startDrawing);
    state.canvas.addEventListener('mousemove', draw);
    state.canvas.addEventListener('mouseup', stopDrawing);
    state.canvas.addEventListener('mouseleave', stopDrawing);
    
    // タッチイベント
    state.canvas.addEventListener('touchstart', handleTouchStart);
    state.canvas.addEventListener('touchmove', handleTouchMove);
    state.canvas.addEventListener('touchend', stopDrawing);
    
    // ボタン
    document.getElementById('saveBtn').addEventListener('click', saveToGallery);
    document.getElementById('resetCanvasBtn').addEventListener('click', () => showConfirmation(
        '⚠️ キャンバスをリセットしますか?',
        'キャンバスに描いた絵がすべて消えてしまいます。この操作はもとには戻せません。本当によろしいですか?',
        resetCanvas
    ));
    document.getElementById('downloadBtn').addEventListener('click', downloadWorksheet);
    document.getElementById('resetAllBtn').addEventListener('click', () => showConfirmation(
        '⚠️ ワークシートをぜんぶリセットしますか?',
        '名前、すべての質問への回答、およびキャンバスの絵が消えます。この操作はもとには戻せません。',
        resetAll
    ));
    
    // モーダル
    document.getElementById('modalOk').addEventListener('click', closeModal);
    document.getElementById('confirmOk').addEventListener('click', executeConfirmAction);
    document.getElementById('confirmCancel').addEventListener('click', closeConfirmModal);
    document.getElementById('confirmClose').addEventListener('click', closeConfirmModal);
    
    // 入力フィールド - 文字数カウント
    setupCharCounter('surprised', 'surprisedCount');
    setupCharCounter('likedPlace', 'likedPlaceCount');
    setupCharCounter('wish', 'wishCount');
    
    // 入力フィールド - state同期
    syncInputFields();
}

// 文字数カウンター設定
function setupCharCounter(inputId, counterId) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    
    input.addEventListener('input', (e) => {
        counter.textContent = e.target.value.length;
    });
}

// 入力フィールドとstate同期
function syncInputFields() {
    const fields = [
        'worksheetName', 'closest', 'furthest', 'redBall', 'curtain',
        'sunlight', 'owner', 'hidingSpot', 'surprised', 'likedPlace', 'wish'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', (e) => {
                state.answers[field] = e.target.value;
            });
        }
    });
}

// タブ切り替え
function switchTab(tab) {
    const worksheetView = document.getElementById('worksheetView');
    const galleryView = document.getElementById('galleryView');
    const worksheetTab = document.getElementById('worksheetTab');
    const galleryTab = document.getElementById('galleryTab');
    
    if (tab === 'worksheet') {
        worksheetView.classList.add('active');
        galleryView.classList.remove('active');
        worksheetTab.classList.add('active');
        galleryTab.classList.remove('active');
    } else {
        worksheetView.classList.remove('active');
        galleryView.classList.add('active');
        worksheetTab.classList.remove('active');
        galleryTab.classList.add('active');
    }
}

// 座標取得ヘルパー
function getCoordinates(e) {
    const rect = state.canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    const xClient = clientX - rect.left;
    const yClient = clientY - rect.top;
    
    const scaleX = state.canvas.width / rect.width;
    const scaleY = state.canvas.height / rect.height;
    
    return {
        x: xClient * scaleX,
        y: yClient * scaleY
    };
}

// 描画開始
function startDrawing(e) {
    state.isDrawing = true;
    const { x, y } = getCoordinates(e);
    state.ctx.beginPath();
    state.ctx.moveTo(x, y);
}

// 描画
function draw(e) {
    if (!state.isDrawing) return;
    
    const { x, y } = getCoordinates(e);
    state.ctx.strokeStyle = state.currentColor;
    state.ctx.lineTo(x, y);
    state.ctx.stroke();
}

// 描画停止
function stopDrawing() {
    state.isDrawing = false;
}

// タッチイベント処理
function handleTouchStart(e) {
    e.preventDefault();
    startDrawing(e);
}

function handleTouchMove(e) {
    e.preventDefault();
    draw(e);
}

// キャンバスリセット
function resetCanvas() {
    state.ctx.fillStyle = '#FFFFFF';
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
    showModal('キャンバスをリセット', 'お絵かきをすべて消しました!');
    closeConfirmModal();
}

// 全リセット
function resetAll() {
    // 入力フィールドクリア
    const fields = [
        'worksheetName', 'closest', 'furthest', 'redBall', 'curtain',
        'sunlight', 'owner', 'hidingSpot', 'surprised', 'likedPlace', 'wish'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = '';
            state.answers[field] = '';
        }
    });
    
    // 文字数カウンターリセット
    document.getElementById('surprisedCount').textContent = '0';
    document.getElementById('likedPlaceCount').textContent = '0';
    document.getElementById('wishCount').textContent = '0';
    
    // キャンバスリセット
    state.ctx.fillStyle = '#FFFFFF';
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
    
    showModal('リセット完了', 'ワークシートの回答とお絵かきをすべて消去し、初期状態に戻しました。');
    closeConfirmModal();
}

// ワークシートPNG生成
function generateWorksheet() {
    const worksheet = document.createElement('canvas');
    worksheet.width = 1200;
    worksheet.height = 1600;
    const ctx = worksheet.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, worksheet.width, worksheet.height);
    
    // タイトル
    ctx.fillStyle = '#FD7E00';
    ctx.font = 'bold 52px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐱 ネコの環世界デジタルワークシート', worksheet.width / 2, 70);
    
    ctx.fillStyle = '#000';
    ctx.font = '32px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    let yPos = 140;
    
    // 名前
    const displayName = state.answers.worksheetName || 'なまえなし';
    ctx.fillText(`なまえ: ${displayName}`, 60, yPos);
    yPos += 50;
    
    // セクション1
    ctx.fillStyle = 'rgba(253, 126, 0, 0.1)';
    ctx.fillRect(40, yPos, 1120, 180);
    ctx.strokeStyle = '#FD7E00';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, yPos, 1120, 180);
    
    ctx.fillStyle = '#FD7E00';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('🐾 ① ネコになってみよう!', 60, yPos + 40);
    ctx.font = '22px Inter, sans-serif';
    ctx.fillText('ネコは、私たちよりずっと低い場所から世界を見ています。', 60, yPos + 75);
    
    ctx.fillStyle = '#000';
    ctx.font = '20px Inter, sans-serif';
    const q1y = yPos + 115;
    ctx.fillText('いちばん近くに見えるものは?', 80, q1y);
    ctx.fillText(`→ ${state.answers.closest || '(未回答)'}`, 80, q1y + 25);
    ctx.fillText('いちばん遠くに見えるものは?', 580, q1y);
    ctx.fillText(`→ ${state.answers.furthest || '(未回答)'}`, 580, q1y + 25);
    
    yPos += 200;
    
    // セクション2
    ctx.fillStyle = 'rgba(0, 177, 176, 0.1)';
    ctx.fillRect(40, yPos, 1120, 360);
    ctx.strokeStyle = '#00B1B0';
    ctx.strokeRect(40, yPos, 1120, 360);
    
    ctx.fillStyle = '#00B1B0';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('🎨 ② ネコの世界はどう見える?', 60, yPos + 40);
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText('(ネコにはどう見える?:色・大きさ・動き など)', 60, yPos + 75);
    
    ctx.fillStyle = '#000';
    const items = [
        { label: '赤いボール', key: 'redBall' },
        { label: 'カーテン', key: 'curtain' },
        { label: '太陽の光', key: 'sunlight' },
        { label: '飼い主(人)', key: 'owner' },
        { label: 'かくれる場所', key: 'hidingSpot' }
    ];
    
    let itemY = yPos + 110;
    items.forEach(item => {
        ctx.fillText(`${item.label}: ${state.answers[item.key] || '(未回答)'}`, 80, itemY);
        itemY += 45;
    });
    
    yPos += 380;
    
    // セクション3: キャンバス
    ctx.fillStyle = 'rgba(253, 126, 0, 0.1)';
    ctx.fillRect(40, yPos, 1120, 50);
    ctx.strokeStyle = '#FD7E00';
    ctx.strokeRect(40, yPos, 1120, 50);
    
    ctx.fillStyle = '#FD7E00';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('✏️ ③ ネコの世界を描いてみよう!', 60, yPos + 35);
    yPos += 60;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(40, yPos, 1120, 500);
    ctx.strokeStyle = '#FD7E00';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, yPos, 1120, 500);
    ctx.drawImage(state.canvas, 40, yPos, 1120, 500);
    
    yPos += 520;
    
    // セクション4
    ctx.fillStyle = 'rgba(0, 177, 176, 0.1)';
    ctx.fillRect(40, yPos, 1120, 240);
    ctx.strokeStyle = '#00B1B0';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, yPos, 1120, 240);
    
    ctx.fillStyle = '#00B1B0';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('💡 ④ ネコの目になって気づいたこと', 60, yPos + 40);
    ctx.font = '20px Inter, sans-serif';
    
    ctx.fillStyle = '#000';
    let q4y = yPos + 70;
    ctx.fillText(`おどろいたこと: ${state.answers.surprised || '(未回答)'}`, 80, q4y);
    q4y += 50;
    ctx.fillText(`すきだなと思った場所: ${state.answers.likedPlace || '(未回答)'}`, 80, q4y);
    q4y += 50;
    ctx.fillText(`もしほんとうにネコだったら何をしてみたい? ${state.answers.wish || '(未回答)'}`, 80, q4y);
    
    yPos += 260;
    
    worksheet.height = yPos;
    return worksheet;
}

// ギャラリーに保存
function saveToGallery() {
    const worksheet = generateWorksheet();
    const imageData = worksheet.toDataURL('image/png');
    
    const newArtwork = {
        id: Date.now(),
        name: state.answers.worksheetName || `さくひん ${state.gallery.length + 1}`,
        image: imageData,
        date: new Date().toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    state.gallery.push(newArtwork);
    saveGalleryToLocalStorage();
    updateGalleryDisplay();
    updateGalleryCount();
    
    showModal('ほぞんしました!', 'ギャラリーに新しいさくひんが追加されました。');
}

// ワークシートダウンロード
function downloadWorksheet() {
    const worksheet = generateWorksheet();
    const link = document.createElement('a');
    const filename = `neko-worksheet-${state.answers.worksheetName || 'my-room'}.png`;
    link.download = filename;
    link.href = worksheet.toDataURL('image/png');
    link.click();
    
    showModal('ダウンロード完了', 'ワークシートPNGをダウンロードしました。');
}

// ギャラリー表示更新
function updateGalleryDisplay() {
    const grid = document.getElementById('galleryGrid');
    
    if (state.gallery.length === 0) {
        grid.innerHTML = `
            <div class="empty-gallery">
                <p class="empty-icon">📭</p>
                <p class="empty-text">まださくひんがありません</p>
                <p class="empty-hint">ワークシートを完成させて、ギャラリーにほぞんしてね!</p>
            </div>
        `;
    } else {
        grid.innerHTML = state.gallery.map(artwork => `
            <div class="gallery-item">
                <img src="${artwork.image}" alt="${artwork.name}" class="gallery-image">
                <div class="gallery-info">
                    <div>
                        <p class="gallery-name">${artwork.name}</p>
                        <p class="gallery-date">${artwork.date}</p>
                    </div>
                    <button class="delete-btn" onclick="deleteFromGallery(${artwork.id})">けす</button>
                </div>
            </div>
        `).join('');
    }
}

// ギャラリーカウント更新
function updateGalleryCount() {
    document.getElementById('galleryCount').textContent = state.gallery.length;
}

// ギャラリーから削除
function deleteFromGallery(id) {
    state.gallery = state.gallery.filter(item => item.id !== id);
    saveGalleryToLocalStorage();
    updateGalleryDisplay();
    updateGalleryCount();
    showModal('さくひんを削除', 'ギャラリーから削除しました。');
}

// LocalStorage保存
function saveGalleryToLocalStorage() {
    try {
        localStorage.setItem('catWorksheetGallery', JSON.stringify(state.gallery));
    } catch (e) {
        console.error('LocalStorage保存エラー:', e);
    }
}

// LocalStorage読み込み
function loadGalleryFromLocalStorage() {
    try {
        const saved = localStorage.getItem('catWorksheetGallery');
        if (saved) {
            state.gallery = JSON.parse(saved);
            updateGalleryDisplay();
            updateGalleryCount();
        }
    } catch (e) {
        console.error('LocalStorage読み込みエラー:', e);
    }
}

// モーダル表示
function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modal').classList.add('active');
}

// モーダル閉じる
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// 確認モーダル表示
let confirmCallback = null;

function showConfirmation(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('active');
    confirmCallback = callback;
}

// 確認モーダル実行
function executeConfirmAction() {
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
}

// 確認モーダル閉じる
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    confirmCallback = null;
}


// 追加
