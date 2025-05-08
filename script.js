const board = ['', '', '', '', '', '', '', '', ''];
const player = 'X';
const computer = 'O';
let currentPlayer = player;
const messageEl = document.getElementById('message');
const refreshButton = document.getElementById('refresh-button');
let buvanScore = 0;
let youScore = 0;
let tieScore = 0;

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(b, p) {
  return winPatterns.some(pattern => pattern.every(index => b[index] === p));
}

function checkTie(b) {
  return b.every(cell => cell !== '');
}

function minimax(b, depth, isMaximizing) {
  if (checkWinner(b, computer)) return 10 - depth;
  if (checkWinner(b, player)) return depth - 10;
  if (checkTie(b)) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (let i = 0; i < b.length; i++) {
    if (b[i] === '') {
      b[i] = isMaximizing ? computer : player;
      let score = minimax(b, depth + 1, !isMaximizing);
      b[i] = '';
      bestScore = isMaximizing
        ? Math.max(score, bestScore)
        : Math.min(score, bestScore);
    }
  }
  return bestScore;
}

function aiMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = computer;
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  setTimeout(() => {
    board[move] = computer;
    updateCell(move, computer);

    if (checkWinner(board, computer)) {
      buvanScore++;
      updateScores();
      showMessage("Buvan Wins 🏆");
      highlightWinningLine(winPatterns.find(p => p.every(i => board[i] === computer)), 'o');
    } else if (checkTie(board)) {
      tieScore++;
      updateScores();
      showMessage("It's a Holy Tie 🎉");
    } else {
      currentPlayer = player;
    }
  }, 600);
}

function updateCell(index, symbol) {
  const cell = document.querySelector(`.cell[data-index="${index}"]`);
  cell.textContent = symbol;
  cell.classList.remove('x', 'o');
  cell.classList.add(symbol === 'X' ? 'x' : 'o');
  cell.classList.add('animated');
  playBeep();
  setTimeout(() => {
    cell.style.opacity = 1;
  }, 10);
}

function playBeep() {
  const beep = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
  beep.play();
}

function handleClick(event) {
  const index = event.target.dataset.index;

  if (board[index] === '' && currentPlayer === player) {
    board[index] = player;
    updateCell(index, player);

    if (checkWinner(board, player)) {
      youScore++;
      updateScores();
      showMessage("You Win 🏅");
      highlightWinningLine(winPatterns.find(p => p.every(i => board[i] === player)), 'x');
    } else if (checkTie(board)) {
      tieScore++;
      updateScores();
      showMessage("It's a Holy Tie 🎉");
    } else {
      currentPlayer = computer;
      setTimeout(aiMove, 500);
    }
  }
}

function showMessage(msg) {
  messageEl.textContent = msg;
  disableBoard();
}

function disableBoard() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.removeEventListener('click', handleClick);
  });
}

function enableBoard() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleClick);
  });
}

function highlightWinningLine(pattern, symbol) {
  const line = document.createElement('div');
  line.classList.add('winning-line');
  line.classList.add(symbol === 'X' ? 'winning-x' : 'winning-o');

  const grid = document.querySelector('.grid-overlay');
  const cellSize = grid.offsetWidth / 3;

  if (pattern[0] % 3 === 0 && pattern[1] - pattern[0] === 3) {
    // Vertical line
    line.style.width = '3px';
    line.style.height = '100%';
    line.style.left = `${(pattern[0] % 3) * 33.33 + 16.67}%`;
    line.style.top = '0';
  } else if (pattern[0] < 3 && pattern[1] - pattern[0] === 1) {
    // Horizontal line
    line.style.height = '3px';
    line.style.width = '100%';
    line.style.top = `${Math.floor(pattern[0] / 3) * 33.33 + 16.67}%`;
    line.style.left = '0';
  } else if (pattern.toString() === [0, 4, 8].toString()) {
    // Diagonal TL to BR
    line.style.width = '140%';
    line.style.height = '3px';
    line.style.top = '50%';
    line.style.left = '-20%';
    line.style.transform = 'rotate(45deg)';
    line.style.transformOrigin = 'center';
  } else if (pattern.toString() === [2, 4, 6].toString()) {
    // Diagonal TR to BL
    line.style.width = '140%';
    line.style.height = '3px';
    line.style.top = '50%';
    line.style.left = '-20%';
    line.style.transform = 'rotate(-45deg)';
    line.style.transformOrigin = 'center';
  }

  document.querySelector('.grid-overlay').appendChild(line);
}

function updateScores() {
  document.getElementById('buvan-score').textContent = `Buvan: ${buvanScore}`;
  document.getElementById('you-score').textContent = `You: ${youScore}`;
  document.getElementById('tie-score').textContent = `Tie: ${tieScore}`;
}

function init() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'animated');
    cell.style.opacity = 0;
  });

  document.querySelectorAll('.winning-line').forEach(line => line.remove());

  for (let i = 0; i < board.length; i++) board[i] = '';
  messageEl.textContent = '';
  currentPlayer = player;
  enableBoard();
}

refreshButton.addEventListener('click', init);
init();
