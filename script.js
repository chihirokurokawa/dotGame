// ゲーム設定
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const WINNING_SCORE = 100;

// ゲームボードの描画コンテキスト
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// スコア表示
const scoreElement = document.getElementById('score');
const levelUpMessage = document.getElementById('level-up-message');

let board = [];
let score = 0;

// テトリミノの形状
const TETROMINOES = {
    'I': [[1, 1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'Z': [[1, 1, 0], [0, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]],
    'L': [[0, 0, 1], [1, 1, 1]]
};

// テトリミノの色
const COLORS = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

let currentPiece;
let currentX;
let currentY;

// ゲームの初期化
function init() {
    // ボードを空にする
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    // 初期ブロックを配置
    generateInitialBlocks();

    // 最初のテトリミノを生成
    spawnNewPiece();

    // ゲームループを開始
    setInterval(gameLoop, 500); 
}

// 初期ブロックを生成
function generateInitialBlocks() {
    for (let y = Math.floor(ROWS / 2); y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            // 50%の確率でブロックを配置
            if (Math.random() < 0.5) {
                // ランダムな色を選択
                const colors = Object.values(COLORS);
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                board[y][x] = randomColor;
            }
        }
    }
}

// 新しいテトリミノを生成
function spawnNewPiece() {
    const pieces = 'IOTJLSZ';
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = {
        shape: TETROMINOES[randomPiece],
        color: COLORS[randomPiece]
    };
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
}

// ゲームループ
function gameLoop() {
    update();
    draw();
}

// ゲーム状態の更新
function update() {
    // テトリミノを下に移動
    if (!checkCollision(currentX, currentY + 1)) {
        currentY++;
    } else {
        // テトリミノをボードに固定
        lockPiece();
        // ラインが揃っているかチェック
        clearLines();
        // 新しいテトリミノを生成
        spawnNewPiece();
        // ゲームオーバーチェック
        if (checkCollision(currentX, currentY)) {
            alert("ゲームオーバー");
            // ゲームをリセット
            init();
        }
    }
}

// 描画処理
function draw() {
    // ボードをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 固定されたブロックを描画
    drawBoard();
    
    // 現在のテトリミノを描画
    drawPiece(currentPiece, currentX, currentY);
}

// 固定されたブロックを描画
function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

// テトリミノを描画
function drawPiece(piece, x, y) {
    ctx.fillStyle = piece.color;
    piece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                drawBlock(x + dx, y + dy, piece.color);
            }
        });
    });
}

// 1つのブロックを描画
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 衝突判定
function checkCollision(x, y, piece = currentPiece.shape) {
    for (let dy = 0; dy < piece.length; dy++) {
        for (let dx = 0; dx < piece[dy].length; dx++) {
            if (piece[dy][dx]) {
                let newX = x + dx;
                let newY = y + dy;

                // ボードの範囲外か、または他のブロックと衝突しているか
                if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

// テトリミノをボードに固定
function lockPiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[currentY + dy][currentX + dx] = currentPiece.color;
            }
        });
    });
}

// ライン消去
function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            linesCleared++;
            // そのラインを削除
            board.splice(y, 1);
            // 新しい空のラインを一番上に追加
            board.unshift(Array(COLS).fill(0));
            // yをインクリメントして、同じラインを再度チェック
            y++; 
        }
    }
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

// スコア更新
function updateScore(linesCleared) {
    score += linesCleared * 10;
    scoreElement.textContent = score;
    if (score >= WINNING_SCORE) {
        levelUpMessage.classList.remove('hidden');
        alert("クリア！おめでとうございます！");
    }
}

// キーボード操作
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            if (!checkCollision(currentX - 1, currentY)) {
                currentX--;
            }
            break;
        case 'ArrowRight':
            if (!checkCollision(currentX + 1, currentY)) {
                currentX++;
            }
            break;
        case 'ArrowDown':
            if (!checkCollision(currentX, currentY + 1)) {
                currentY++;
            }
            break;
        case 'ArrowUp':
        case ' ': // スペースキーでも回転
            e.preventDefault(); // スペースキーでのスクロールを防止
            rotatePiece();
            break;
    }
    draw(); // キー操作後すぐに再描画
});

// テトリミノの回転
function rotatePiece() {
    const shape = currentPiece.shape;
    const newShape = shape[0].map((_, colIndex) => shape.map(row => row[colIndex]).reverse());
    
    if (!checkCollision(currentX, currentY, newShape)) {
        currentPiece.shape = newShape;
    } else {
        // 壁キック（簡易版）
        // 右に1つずらして試す
        if (!checkCollision(currentX + 1, currentY, newShape)) {
            currentX++;
            currentPiece.shape = newShape;
        } 
        // 左に1つずらして試す
        else if (!checkCollision(currentX - 1, currentY, newShape)) {
            currentX--;
            currentPiece.shape = newShape;
        }
    }
}


// ゲーム開始
init();
