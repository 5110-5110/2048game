const gridDisplay = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

let board = [];
let score = 0;
const width = 4;

let touchStartX = 0;
let touchStartY = 0;

// ゲーム初期化
function createBoard() {
    board = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];
    score = 0;
    scoreDisplay.textContent = score;
    generateNumber();
    generateNumber();
    renderBoard();
}

// ランダムな空きマスに2（または稀に4）を生成
function generateNumber() {
    let emptySquares = [];
    board.forEach((val, i) => {
        if (val === 0) emptySquares.push(i);
    });

    if (emptySquares.length > 0) {
        let randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        board[randomIndex] = Math.random() < 0.9 ? 2 : 4;
    }
}

// 画面にタイルを描画
function renderBoard() {
    gridDisplay.innerHTML = '';
    board.forEach(val => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        if (val > 0) {
            tile.textContent = val;
            tile.classList.add(`tile-${val}`);
        }
        gridDisplay.appendChild(tile);
    });
}

// 行ごとのスライド＆合体処理
function slideRow(row) {
    let filteredRow = row.filter(num => num !== 0);
    let newRow = [];
    
    for (let i = 0; i < filteredRow.length; i++) {
        if (filteredRow[i] === filteredRow[i + 1]) {
            let combined = filteredRow[i] * 2;
            newRow.push(combined);
            score += combined;
            scoreDisplay.textContent = score;
            i++; 
        } else {
            newRow.push(filteredRow[i]);
        }
    }
    
    while (newRow.length < width) {
        newRow.push(0);
    }
    return newRow;
}

// 左右上下の操作
function moveLeft() {
    let oldBoard = [...board];
    for (let i = 0; i < width * width; i += width) {
        let row = [board[i], board[i+1], board[i+2], board[i+3]];
        let newRow = slideRow(row);
        for (let j = 0; j < width; j++) {
            board[i+j] = newRow[j];
        }
    }
    checkMove(oldBoard);
}

function moveRight() {
    let oldBoard = [...board];
    for (let i = 0; i < width * width; i += width) {
        let row = [board[i+3], board[i+2], board[i+1], board[i]];
        let newRow = slideRow(row);
        for (let j = 0; j < width; j++) {
            board[i+3-j] = newRow[j];
        }
    }
    checkMove(oldBoard);
}

function moveUp() {
    let oldBoard = [...board];
    for (let i = 0; i < width; i++) {
        let column = [board[i], board[i+width], board[i+width*2], board[i+width*3]];
        let newColumn = slideRow(column);
        for (let j = 0; j < width; j++) {
            board[i + j * width] = newColumn[j];
        }
    }
    checkMove(oldBoard);
}

function moveDown() {
    let oldBoard = [...board];
    for (let i = 0; i < width; i++) {
        let column = [board[i+width*3], board[i+width*2], board[i+width], board[i]];
        let newColumn = slideRow(column);
        for (let j = 0; j < width; j++) {
            board[i + (width - 1 - j) * width] = newColumn[j];
        }
    }
    checkMove(oldBoard);
}

function checkMove(oldBoard) {
    let hasChanged = board.some((val, i) => val !== oldBoard[i]);
    if (hasChanged) {
        generateNumber();
        renderBoard();
        checkGameOver();
    }
}

// ゲームオーバー判定
function checkGameOver() {
    let hasEmpty = board.some(val => val === 0);
    if (hasEmpty) return;

    for (let r = 0; r < width; r++) {
        for (let c = 0; c < width; c++) {
            let current = board[r * width + c];
            if (c < width - 1 && current === board[r * width + c + 1]) return;
            if (r < width - 1 && current === board[(r + 1) * width + c]) return;
        }
    }

    setTimeout(() => {
        alert(`ゲームオーバー！ スコア: ${score}`);
    }, 200);
}

// スマホのスワイプ操作の検知
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    // スワイプの距離が一定以上の場合のみ反応
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) {
            if (diffX > 0) moveRight();
            else moveLeft();
        }
    } else {
        if (Math.abs(diffY) > 30) {
            if (diffY > 0) moveDown();
            else moveUp();
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, { passive: true });

// PC用のキーボード操作
window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
        case 'ArrowUp': moveUp(); break;
        case 'ArrowDown': moveDown(); break;
    }
});

restartBtn.addEventListener('click', createBoard);

createBoard();
