const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset');

let currentPlayer = 'X';
let gameActive = true;
let gameState = Array(9).fill('');

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const clickSound = new Audio('click.mp3');
const winSound = new Audio('win.mp3');

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;

    clickSound.play();
    checkResult();

    if (gameActive) {
        currentPlayer = 'O';
        setTimeout(computerMove, 1000);
    }
}

function computerMove() {
    const bestMove = findBestMove();
    gameState[bestMove] = currentPlayer;
    cells[bestMove].innerHTML = currentPlayer;
    checkResult();
    currentPlayer = 'X';
}

function findBestMove() {
    // Introduce randomness: 60% chance to play optimally, 40% chance to play randomly
    if (Math.random() < 0.6) {
        // Optimal move
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = currentPlayer;
                if (checkWinner(gameState) === currentPlayer) {
                    return i; // Winning move
                }
                gameState[i] = '';
            }
        }

        // Block player's winning move
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'X'; // Assume player is 'X'
                if (checkWinner(gameState) === 'X') {
                    gameState[i] = '';
                    return i; // Block move
                }
                gameState[i] = '';
            }
        }

        // Use Minimax for optimal move
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = currentPlayer;
                let score = minimax(gameState, 0, false);
                gameState[i] = '';

                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    } else {
        // Random move
        let availableCells = gameState.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }
}

function minimax(state, depth, isMaximizing) {
    const scores = {
        X: -1,
        O: 1,
        draw: 0
    }

    let result = checkWinner(state);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === '') {
                state[i] = currentPlayer;
                let score = minimax(state, depth + 1, false);
                state[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === '') {
                state[i] = 'X';
                let score = minimax(state, depth + 1, true);
                state[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(state) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a];
        }
    }
    if (!state.includes('')) {
        return 'draw';
    }
    return null;
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        if (gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            winSound.play();
            break;
        }
    }

    const celebration = document.getElementById('celebration'); // Get celebration element

    if (roundWon) {
        if (currentPlayer === 'O') {
            statusDisplay.innerHTML = 'Computer has won the match!';
        } else {
            statusDisplay.innerHTML = 'You have won the match!';
            celebration.classList.remove('hidden'); // Show celebration
            celebration.classList.add('show'); // Add show class
            celebration.style.opacity = 1; // Ensure opacity is set to 1
        }
        gameActive = false;
        return;
    }

    if (!gameState.includes('')) {
        statusDisplay.innerHTML = 'Game ended in a draw!';
        gameActive = false;
        return;
    }
}

function resetGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState.fill('');
    statusDisplay.innerHTML = '';
    const celebration = document.getElementById('celebration');
    celebration.classList.add('hidden'); // Hide celebration on reset
    celebration.classList.remove('show'); // Remove show class
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('winner');
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
