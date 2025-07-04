// ゲーム設定 (Game Settings)
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// キャンバスとコンテキストの取得 (Get Canvas and Context)
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-tetromino');
const nextCtx = nextCanvas.getContext('2d');

// スコアとボタンの要素 (Score and Button Elements)
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');

// ゲームボードの初期化 (Initialize Game Board)
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let gameOver = false;
let gameInterval;
let gameSpeed; // ゲーム速度を管理する変数 (Variable to manage game speed)

// テトリミノの形と色 (Tetromino Shapes and Colors)
const TETROMINOES = {
    'I': [[1, 1, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]],
    'L': [[0, 0, 1], [1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'Z': [[1, 1, 0], [0, 1, 1]]
};

const COLORS = {
    'I': '#3498db',
    'J': '#2980b9',
    'L': '#e67e22',
    'O': '#f1c40f',
    'S': '#2ecc71',
    'T': '#9b59b6',
    'Z': '#e74c3c'
};

let currentTetromino;
let nextTetromino;

// 新しいテトリミノを生成 (Generate New Tetromino)
function newTetromino() {
    const types = 'IJLOSTZ';
    const type = types[Math.floor(Math.random() * types.length)];
    return {
        shape: TETROMINOES[type],
        color: COLORS[type],
        row: 0,
        col: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type][0].length / 2)
    };
}

// 描画関数 (Draw Function)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 固定されたブロックの描画 (Draw locked blocks)
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#2c3e50';
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    // 現在のテトリミノの描画 (Draw current tetromino)
    if (currentTetromino) {
        ctx.fillStyle = currentTetromino.color;
        currentTetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect((currentTetromino.col + x) * BLOCK_SIZE, (currentTetromino.row + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#2c3e50';
                    ctx.strokeRect((currentTetromino.col + x) * BLOCK_SIZE, (currentTetromino.row + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }
}

// 次のテトリミノを描画 (Draw Next Tetromino)
function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextTetromino) {
        nextCtx.fillStyle = nextTetromino.color;
        const xOffset = (nextCanvas.width - nextTetromino.shape[0].length * 20) / 2;
        const yOffset = (nextCanvas.height - nextTetromino.shape.length * 20) / 2;
        nextTetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextCtx.fillRect(xOffset + x * 20, yOffset + y * 20, 20, 20);
                }
            });
        });
    }
}

// 衝突判定 (Collision Detection)
function isCollision(tetromino, newRow, newCol) {
    for (let y = 0; y < tetromino.shape.length; y++) {
        for (let x = 0; x < tetromino.shape[y].length; x++) {
            if (tetromino.shape[y][x]) {
                const checkCol = newCol + x;
                const checkRow = newRow + y;
                if (checkCol < 0 || checkCol >= COLS || checkRow >= ROWS || (checkRow >= 0 && board[checkRow][checkCol])) {
                    return true;
                }
            }
        }
    }
    return false;
}

// テトリミノをボードに固定 (Lock Tetromino to Board)
function lockTetromino() {
    currentTetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentTetromino.row + y][currentTetromino.col + x] = currentTetromino.color;
            }
        });
    });
}

// 速度を更新する関数 (Function to Update Speed)
function updateSpeed() {
    clearInterval(gameInterval);
    gameSpeed -= 25; // Speed up by 25ms per line clear
    if (gameSpeed < 100) { // Set a max speed
        gameSpeed = 100;
    }
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// ライン消去 (Clear Lines)
function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            linesCleared++;
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            row++; // Re-check the current row index
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100 * linesCleared;
        scoreElement.textContent = score;
        updateSpeed(); // Update speed when lines are cleared
    }
}

// ゲームオーバー処理 (Game Over Process)
function checkGameOver() {
    if (isCollision(currentTetromino, currentTetromino.row, currentTetromino.col)) {
        gameOver = true;
        clearInterval(gameInterval);
        alert('Game Over! スコア (Score): ' + score);
    }
}

// ゲームループ (Game Loop)
function gameLoop() {
    if (!gameOver) {
        // Move down
        if (!isCollision(currentTetromino, currentTetromino.row + 1, currentTetromino.col)) {
            currentTetromino.row++;
        } else {
            lockTetromino();
            clearLines();
            currentTetromino = nextTetromino;
            nextTetromino = newTetromino();
            drawNext();
            checkGameOver();
        }
        draw();
    }
}

// キー操作 (Key Controls)
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowLeft':
            if (!isCollision(currentTetromino, currentTetromino.row, currentTetromino.col - 1)) {
                currentTetromino.col--;
            }
            break;
        case 'ArrowRight':
            if (!isCollision(currentTetromino, currentTetromino.row, currentTetromino.col + 1)) {
                currentTetromino.col++;
            }
            break;
        case 'ArrowDown':
            if (!isCollision(currentTetromino, currentTetromino.row + 1, currentTetromino.col)) {
                currentTetromino.row++;
            }
            break;
        case 'ArrowUp': // Rotate
            const shape = currentTetromino.shape;
            const newShape = shape[0].map((_, colIndex) => shape.map(row => row[colIndex]).reverse());
            const originalCol = currentTetromino.col;
            let offset = 1;
            
            if (!isCollision({ ...currentTetromino, shape: newShape }, currentTetromino.row, currentTetromino.col)) {
                currentTetromino.shape = newShape;
            } else {
                currentTetromino.col += offset;
                if(isCollision({ ...currentTetromino, shape: newShape }, currentTetromino.row, currentTetromino.col)) {
                    currentTetromino.col -= offset * 2;
                    if(isCollision({ ...currentTetromino, shape: newShape }, currentTetromino.row, currentTetromino.col)) {
                        currentTetromino.col = originalCol;
                    } else {
                        currentTetromino.shape = newShape;
                    }
                } else {
                    currentTetromino.shape = newShape;
                }
            }
            break;
    }
    draw();
});

// ゲーム開始 (Start Game)
function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameSpeed = 1000; // Set initial speed
    currentTetromino = newTetromino();
    nextTetromino = newTetromino();
    drawNext();
    clearInterval(gameInterval); // Clear any existing interval before starting
    gameInterval = setInterval(gameLoop, gameSpeed);
    startButton.textContent = "RESET";
}

startButton.addEventListener('click', () => {
    startGame();
});

draw(); // Initial draw






