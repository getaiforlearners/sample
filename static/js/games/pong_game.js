class PongGame {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 400;
    container.appendChild(this.canvas);

    this.paddleHeight = 80;
    this.paddleWidth = 10;
    this.ballSize = 8;
    
    this.leftPaddle = {
      y: this.canvas.height/2 - this.paddleHeight/2,
      score: 0,
      speed: 0
    };
    
    this.rightPaddle = {
      y: this.canvas.height/2 - this.paddleHeight/2,
      score: 0,
      speed: 0
    };
    
    this.ball = {
      x: this.canvas.width/2,
      y: this.canvas.height/2,
      speedX: 5,
      speedY: 5
    };

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    this.gameLoop();
  }

  handleKeyDown(event) {
    switch(event.key) {
      case 'w': this.leftPaddle.speed = -5; break;
      case 's': this.leftPaddle.speed = 5; break;
      case 'ArrowUp': this.rightPaddle.speed = -5; break;
      case 'ArrowDown': this.rightPaddle.speed = 5; break;
    }
  }

  handleKeyUp(event) {
    switch(event.key) {
      case 'w':
      case 's':
        this.leftPaddle.speed = 0;
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        this.rightPaddle.speed = 0;
        break;
    }
  }

  update() {
    // Update paddle positions
    this.leftPaddle.y += this.leftPaddle.speed;
    this.rightPaddle.y += this.rightPaddle.speed;
    
    // Keep paddles in bounds
    this.leftPaddle.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.leftPaddle.y));
    this.rightPaddle.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.rightPaddle.y));
    
    // Update ball position
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;
    
    // Ball collision with top and bottom
    if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
      this.ball.speedY *= -1;
    }
    
    // Ball collision with paddles
    if (this.ball.x <= this.paddleWidth && 
        this.ball.y >= this.leftPaddle.y && 
        this.ball.y <= this.leftPaddle.y + this.paddleHeight) {
      this.ball.speedX *= -1.1; // Increase speed slightly
    }
    
    if (this.ball.x >= this.canvas.width - this.paddleWidth && 
        this.ball.y >= this.rightPaddle.y && 
        this.ball.y <= this.rightPaddle.y + this.paddleHeight) {
      this.ball.speedX *= -1.1; // Increase speed slightly
    }
    
    // Score points
    if (this.ball.x <= 0) {
      this.rightPaddle.score++;
      this.resetBall();
    }
    if (this.ball.x >= this.canvas.width) {
      this.leftPaddle.score++;
      this.resetBall();
    }
  }

  resetBall() {
    this.ball.x = this.canvas.width/2;
    this.ball.y = this.canvas.height/2;
    this.ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
    this.ball.speedY = 5 * (Math.random() > 0.5 ? 1 : -1);
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw middle line
    this.ctx.strokeStyle = '#fff';
    this.ctx.setLineDash([5, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width/2, 0);
    this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Draw paddles
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
    this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.rightPaddle.y, 
                     this.paddleWidth, this.paddleHeight);
    
    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ballSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw scores
    this.ctx.font = '32px Arial';
    this.ctx.fillText(this.leftPaddle.score, this.canvas.width/4, 50);
    this.ctx.fillText(this.rightPaddle.score, 3*this.canvas.width/4, 50);
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}