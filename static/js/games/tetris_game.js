class TetrisGame {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 300;
    this.canvas.height = 600;
    container.appendChild(this.canvas);

    this.blockSize = 30;
    this.cols = this.canvas.width / this.blockSize;
    this.rows = this.canvas.height / this.blockSize;
    this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    
    this.pieces = [
      [[1,1,1,1]], // I
      [[1,1],[1,1]], // O
      [[1,1,1],[0,1,0]], // T
      [[1,1,1],[1,0,0]], // L
      [[1,1,1],[0,0,1]], // J
      [[1,1,0],[0,1,1]], // S
      [[0,1,1],[1,1,0]]  // Z
    ];
    
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.score = 0;
    this.gameOver = false;
    
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    this.initGame();
  }

  initGame() {
    this.spawnPiece();
    this.gameLoop();
  }

  spawnPiece() {
    const randomIndex = Math.floor(Math.random() * this.pieces.length);
    this.currentPiece = this.pieces[randomIndex];
    this.currentX = Math.floor((this.cols - this.currentPiece[0].length) / 2);
    this.currentY = 0;
    
    if (this.checkCollision()) {
      this.gameOver = true;
    }
  }

  checkCollision() {
    for (let y = 0; y < this.currentPiece.length; y++) {
      for (let x = 0; x < this.currentPiece[y].length; x++) {
        if (this.currentPiece[y][x]) {
          const boardX = this.currentX + x;
          const boardY = this.currentY + y;
          
          if (boardX < 0 || boardX >= this.cols || 
              boardY >= this.rows ||
              this.board[boardY] && this.board[boardY][boardX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  mergePiece() {
    for (let y = 0; y < this.currentPiece.length; y++) {
      for (let x = 0; x < this.currentPiece[y].length; x++) {
        if (this.currentPiece[y][x]) {
          this.board[this.currentY + y][this.currentX + x] = 1;
        }
      }
    }
    this.checkLines();
    this.spawnPiece();
  }

  checkLines() {
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell === 1)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.cols).fill(0));
        this.score += 100;
      }
    }
  }

  handleKeyPress(event) {
    if (this.gameOver) return;
    
    switch(event.key) {
      case 'ArrowLeft':
        this.currentX--;
        if (this.checkCollision()) this.currentX++;
        break;
      case 'ArrowRight':
        this.currentX++;
        if (this.checkCollision()) this.currentX--;
        break;
      case 'ArrowDown':
        this.currentY++;
        if (this.checkCollision()) {
          this.currentY--;
          this.mergePiece();
        }
        break;
      case 'ArrowUp':
        this.rotatePiece();
        break;
    }
  }

  rotatePiece() {
    const newPiece = this.currentPiece[0].map((_, i) => 
      this.currentPiece.map(row => row[i]).reverse()
    );
    const oldPiece = this.currentPiece;
    this.currentPiece = newPiece;
    if (this.checkCollision()) {
      this.currentPiece = oldPiece;
    }
  }

  update() {
    if (this.gameOver) return;
    
    this.currentY++;
    if (this.checkCollision()) {
      this.currentY--;
      this.mergePiece();
    }
  }

  draw() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw board
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          this.ctx.fillStyle = '#fff';
          this.ctx.fillRect(x * this.blockSize + 1, y * this.blockSize + 1, 
                           this.blockSize - 2, this.blockSize - 2);
        }
      }
    }
    
    // Draw current piece
    if (this.currentPiece) {
      this.ctx.fillStyle = '#f00';
      for (let y = 0; y < this.currentPiece.length; y++) {
        for (let x = 0; x < this.currentPiece[y].length; x++) {
          if (this.currentPiece[y][x]) {
            this.ctx.fillRect((this.currentX + x) * this.blockSize + 1,
                            (this.currentY + y) * this.blockSize + 1,
                            this.blockSize - 2, this.blockSize - 2);
          }
        }
      }
    }
    
    // Draw score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    
    if (this.gameOver) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '40px Arial';
      this.ctx.fillText('Game Over!', 50, this.canvas.height/2);
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    setTimeout(() => requestAnimationFrame(() => this.gameLoop()), 500);
  }
}