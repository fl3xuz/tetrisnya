const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

let board = [];
for (let r = 0; r < ROWS; r++){
    board.push(new Array(COLS).fill(0));
}

const COLORS = [
    null,
    '#00f0f0', // 1 - Голубой (I)
    '#0000f0', // 2 - Синий (J)
    '#f0a000', // 3 - Оранжевый (L)
    '#f0f000', // 4 - Желтый (O)
    '#00f000', // 5 - Зеленый (S)
    '#a000f0', // 6 - Фиолетовый (T)
    '#f00000'  // 7 - Красный (Z)
];
const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 1], [1, 1, 0]], 
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]]
];

let isPaused = false;
let currentPieceColor = 1;
let nextPieceColor = 1;
let currentPiece = null;
let nextPiece = null;
let gameInterval;
let pieceX = 0;
let pieceY = 0;
let totalLines = 0;
let currentLevel = 1;
let dropSpeed = 700;


window.onload = function() {
    const savedName = localStorage.getItem("tetris.username");
    const nameSpan = document.getElementById('playerName');
    nameSpan.textContent = savedName || "Гость";

    newPiece(); 
    drawNextPiece(); 
    drawBoard();
    drawPiece();

    gameInterval = setInterval(drop, 700);
    renderLeaderboard();
};

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 0) {
                ctx.fillStyle = COLORS[board[r][c]]
                ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    ctx.strokeStyle = '#333';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.strokeRect(c*BLOCK_SIZE, r*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
}

function newPiece() {
    if (nextPiece) {
        currentPiece = nextPiece;
        currentPieceColor = nextPieceColor;
        pieceX = 3;
        pieceY = 0;
    } else {
        const randomIndex = Math.floor(Math.random() * 7);
        currentPiece = SHAPES[randomIndex];
        currentPieceColor = Math.floor(Math.random() * 7) + 1;
        pieceX = 3;
        pieceY = 0;
    }
    
    const nextRandomIndex = Math.floor(Math.random() * 7);
    nextPiece = SHAPES[nextRandomIndex];
    nextPieceColor = Math.floor(Math.random() * 7) + 1;
    
    if (collide(pieceX, pieceY, currentPiece)) {
        gameOver();
    }
}

function drawPiece() {
    if (!currentPiece) return;

    ctx.fillStyle = COLORS[currentPieceColor];

    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++){
            if (currentPiece[r][c] === 1) {
                ctx.fillRect(
                    (pieceX + c) * BLOCK_SIZE,
                    (pieceY + r) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        }
    }
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextCtx.fillStyle = COLORS[nextPieceColor];
    const samllBlock = 25;
    const offsetX = 10;
    const offsetY = 10;
    for (let r = 0; r < nextPiece.length; r++) {
        for (let c = 0; c < nextPiece[r].length; c++) {
            if (nextPiece[r][c] === 1) {
                nextCtx.fillRect(offsetX + c * samllBlock, offsetY + r * samllBlock, samllBlock, samllBlock);
            }
        }
    }
}

function mergePiece() {
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c] === 1) {
                board[pieceY + r][pieceX + c] = currentPieceColor;
            }
        }
    }
}

function collide(pieceX, pieceY, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c] === 1){
                let boardX = pieceX + c;
                let boardY = pieceY + r;

                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return true;
                }
                
                if (boardY >= 0 && board[boardY][boardX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function move(dir) {
    pieceX += dir;
    const isColliding = collide(pieceX, pieceY, currentPiece);
    if (isColliding) {
        pieceX -= dir;
    }
    drawBoard();
    drawPiece();

}

function rotate() {
    const originalShape = currentPiece;
    
    const rows = currentPiece.length;
    const cols = currentPiece[0].length;
    
    const newPiece = [];
    for (let r = 0; r < cols; r++) {
        const newRow = [];
        for (let c = rows - 1; c >= 0; c--) {
            newRow.push(currentPiece[c][r]);
        }
        newPiece.push(newRow);
    }
    
    currentPiece = newPiece;
    
    if (collide(pieceX, pieceY, currentPiece)) {
        currentPiece = originalShape;
    }
    
    drawBoard();
    drawPiece();
}

function hardDrop() {
    let dropDistance = 0;
    
    while(!collide(pieceX, pieceY + 1, currentPiece)) {
        pieceY++;
        dropDistance++;
    }
    
    updateScore(dropDistance * 2); // +2 очка за каждую клетку
    mergePiece();
    clearLines();
    newPiece();
    drawNextPiece();
    drawBoard();
    drawPiece();
}

function updateScore(points) {
    const scoreSpan = document.getElementById('current-scr');
    let currentScore = parseInt(scoreSpan.textContent) || 0;
    scoreSpan.textContent = currentScore + points;
}

function clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        let isFull = true;
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === 0) {
                isFull = false;
                break;
            }
        }

        if (isFull) {
            board.splice(r, 1);
            board.unshift(new Array(COLS).fill(0)); 
            linesCleared++;
            r++;
        }
    }
    
    if (linesCleared > 0) {
        const scoreSpan = document.getElementById('current-scr');
        let currentScore = parseInt(scoreSpan.textContent) || 0; 
        scoreSpan.textContent = currentScore + (linesCleared * 100);
        
        totalLines += linesCleared; 
        
        const newLevel = Math.floor(totalLines / 5) + 1;
        if (newLevel > currentLevel) {
            currentLevel = newLevel;
            document.getElementById('current-lvl').textContent = currentLevel;
            
            dropSpeed = Math.max(100, 700 - (currentLevel - 1) * 50);
            
            clearInterval(gameInterval);
            gameInterval = setInterval(drop, dropSpeed);
        }
    }
}

function togglePause() {
    isPaused = !isPaused; 

    if (isPaused) {
        clearInterval(gameInterval);
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Полупрозрачный черный
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#00d2ff"; // Неоново-голубой текст
        ctx.font = "bold 40px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ПАУЗА", canvas.width / 2, canvas.height / 2);
        
    } else {
        gameInterval = setInterval(drop, dropSpeed);
        drawBoard();
        drawPiece();
    }
}

   function gameOver() {
       clearInterval(gameInterval);
       
       const scoreSpan = document.getElementById('current-scr');
       const finalScore = parseInt(scoreSpan.textContent);
       const nameSpan = document.getElementById('playerName');
       const playerName = nameSpan.textContent;

       saveScore(playerName, finalScore);
       
       alert("Игра окончена! Твой счет: " + finalScore);
       location.reload();
   }

function drop(isManual = false) {
    if (!collide(pieceX, pieceY + 1, currentPiece)) {
        pieceY++;
        if (isManual) {
            updateScore(1);
        }
    } else {
        mergePiece();
        clearLines();
        newPiece();
        drawNextPiece();
    }
    drawBoard();
    drawPiece();
}

function saveScore(name, score) {
    let scores = JSON.parse(localStorage.getItem("tetris.scores")) || [];
    
    scores.push({ name: name, score: score });
    
    scores.sort((a, b) => b.score - a.score);
    
    scores = scores.slice(0, 3);
    
    localStorage.setItem("tetris.scores", JSON.stringify(scores));
}

function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const scores = JSON.parse(localStorage.getItem("tetris.scores")) || [];
    
    if (scores.length === 0) {
        list.innerHTML = '<li style="color: #888;">Пока нет рекордов</li>';
        return;
    }

    scores.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name} — ${entry.score} очк.`;
        list.appendChild(li);
    });
}

// СЛУШАТЕЛЬ КЛАВИАТУРЫ
document.addEventListener('keydown', (event) => {
    if (event.key === "p" || event.key === "P" || event.key === "з" || event.key === "З" || event.key === "Escape") {
        event.preventDefault();
        togglePause();
        return;
    }

    if (isPaused) return;

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
    } 
    if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
    }
    if (event.key === "ArrowUp") {
        event.preventDefault();
        rotate();
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        drop(true);
    }
    if (event.key === " ") {
        event.preventDefault();
        hardDrop();
    }
}); // <-- ЗДЕСЬ ЗАКРЫВАЕТСЯ клавиатура

// МОБИЛЬНЫЕ КНОПКИ (СНАРУЖИ!)
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnRotate = document.getElementById('btn-rotate');
const btnDown = document.getElementById('btn-down');
const btnDrop = document.getElementById('btn-drop');

function preventZoom(e) {
    if (e) e.preventDefault();
}

if (btnLeft) btnLeft.addEventListener('click', (e) => { preventZoom(e); move(-1); });
if (btnRight) btnRight.addEventListener('click', (e) => { preventZoom(e); move(1); });
if (btnRotate) btnRotate.addEventListener('click', (e) => { preventZoom(e); rotate(); });
if (btnDown) btnDown.addEventListener('click', (e) => { preventZoom(e); drop(true); });
if (btnDrop) btnDrop.addEventListener('click', (e) => { preventZoom(e); hardDrop(); });