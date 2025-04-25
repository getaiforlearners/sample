
class Game2048 {
  constructor(container) {
    this.container = container;
    this.grid = Array(4).fill().map(() => Array(4).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.init();
  }

  init() {
    this.createGrid();
    this.addNumber();
    this.addNumber();
    this.setupControls();
    this.updateDisplay();
  }

  createGrid() {
    this.container.innerHTML = `
      <div class="text-center">
        <h3>2048</h3>
        <div class="score mb-3">Score: <span id="score">0</span></div>
        <div class="game-grid"></div>
        <button class="btn btn-primary mt-3" id="new-game">New Game</button>
      </div>
    `;

    const gameGrid = this.container.querySelector('.game-grid');
    gameGrid.style.display = 'grid';
    gameGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    gameGrid.style.gap = '10px';
    gameGrid.style.maxWidth = '400px';
    gameGrid.style.margin = '0 auto';

    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.backgroundColor = '#cdc1b4';
      cell.style.height = '80px';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '24px';
      cell.style.fontWeight = 'bold';
      cell.style.borderRadius = '5px';
      gameGrid.appendChild(cell);
    }

    document.getElementById('new-game').addEventListener('click', () => this.reset());
  }

  addNumber() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === 0) {
          emptyCells.push({x: i, y: j});
        }
      }
    }
    if (emptyCells.length > 0) {
      const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  updateDisplay() {
    const cells = this.container.querySelectorAll('.grid-cell');
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const value = this.grid[i][j];
        const cell = cells[i * 4 + j];
        cell.textContent = value || '';
        cell.style.backgroundColor = this.getTileColor(value);
        cell.style.color = value <= 4 ? '#776e65' : '#f9f6f2';
      }
    }
    document.getElementById('score').textContent = this.score;
  }

  getTileColor(value) {
    const colors = {
      0: '#cdc1b4',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      
      let moved = false;
      switch(e.key) {
        case 'ArrowUp':
          moved = this.moveUp();
          break;
        case 'ArrowDown':
          moved = this.moveDown();
          break;
        case 'ArrowLeft':
          moved = this.moveLeft();
          break;
        case 'ArrowRight':
          moved = this.moveRight();
          break;
      }

      if (moved) {
        this.addNumber();
        this.updateDisplay();
        if (this.checkGameOver()) {
          this.gameOver = true;
          alert('Game Over! Score: ' + this.score);
        }
      }
    });
  }

  moveLeft() {
    return this.move(row => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          this.score += newRow[i];
          newRow.splice(i + 1, 1);
        }
      }
      while (newRow.length < 4) newRow.push(0);
      return newRow;
    });
  }

  moveRight() {
    return this.move(row => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = newRow.length - 1; i > 0; i--) {
        if (newRow[i] === newRow[i - 1]) {
          newRow[i] *= 2;
          this.score += newRow[i];
          newRow.splice(i - 1, 1);
          i--;
        }
      }
      while (newRow.length < 4) newRow.unshift(0);
      return newRow;
    });
  }

  moveUp() {
    return this.move(row => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          this.score += newRow[i];
          newRow.splice(i + 1, 1);
        }
      }
      while (newRow.length < 4) newRow.push(0);
      return newRow;
    }, true);
  }

  moveDown() {
    return this.move(row => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = newRow.length - 1; i > 0; i--) {
        if (newRow[i] === newRow[i - 1]) {
          newRow[i] *= 2;
          this.score += newRow[i];
          newRow.splice(i - 1, 1);
          i--;
        }
      }
      while (newRow.length < 4) newRow.unshift(0);
      return newRow;
    }, true);
  }

  move(callback, transpose = false) {
    const oldGrid = JSON.stringify(this.grid);
    
    if (transpose) {
      this.grid = this.transpose(this.grid);
    }
    
    for (let i = 0; i < 4; i++) {
      this.grid[i] = callback(this.grid[i]);
    }
    
    if (transpose) {
      this.grid = this.transpose(this.grid);
    }
    
    return oldGrid !== JSON.stringify(this.grid);
  }

  transpose(grid) {
    return grid[0].map((_, i) => grid.map(row => row[i]));
  }

  checkGameOver() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === 0) return false;
        if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return false;
        if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return false;
      }
    }
    return true;
  }

  reset() {
    this.grid = Array(4).fill().map(() => Array(4).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.addNumber();
    this.addNumber();
    this.updateDisplay();
  }
}
