class HangmanGame {
  constructor(container) {
    this.container = container;
    this.words = ['FAREWELL', 'GOODBYE', 'MEMORIES', 'FRIENDSHIP', 'CELEBRATION'];
    this.word = '';
    this.guessed = new Set();
    this.maxWrong = 6;
    this.mistakes = 0;
    this.gameOver = false;
    
    this.init();
  }

  init() {
    this.word = this.words[Math.floor(Math.random() * this.words.length)];
    this.createUI();
    this.updateDisplay();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="text-center">
        <h3 class="mb-4">Hangman Game</h3>
        <div id="hangman-word" class="mb-4" style="font-size: 2rem; letter-spacing: 5px;"></div>
        <div id="hangman-letters" class="mb-4"></div>
        <div id="hangman-status" class="mb-3"></div>
        <button id="hangman-reset" class="btn btn-primary">New Game</button>
      </div>
    `;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const letterButtons = document.getElementById('hangman-letters');
    
    letters.forEach(letter => {
      const button = document.createElement('button');
      button.className = 'btn btn-outline-secondary m-1';
      button.textContent = letter;
      button.addEventListener('click', () => this.handleGuess(letter));
      letterButtons.appendChild(button);
    });

    document.getElementById('hangman-reset').addEventListener('click', () => this.reset());
  }

  handleGuess(letter) {
    if (this.gameOver || this.guessed.has(letter)) return;

    this.guessed.add(letter);
    if (!this.word.includes(letter)) {
      this.mistakes++;
    }

    this.updateDisplay();
    this.checkGameEnd();
  }

  updateDisplay() {
    const wordDisplay = document.getElementById('hangman-word');
    wordDisplay.textContent = this.word
      .split('')
      .map(letter => this.guessed.has(letter) ? letter : '_')
      .join(' ');

    const status = document.getElementById('hangman-status');
    status.textContent = `Mistakes: ${this.mistakes} of ${this.maxWrong}`;

    document.querySelectorAll('#hangman-letters button').forEach(button => {
      if (this.guessed.has(button.textContent)) {
        button.disabled = true;
        button.className = this.word.includes(button.textContent) 
          ? 'btn btn-success m-1' 
          : 'btn btn-danger m-1';
      }
    });
  }

  checkGameEnd() {
    if (this.mistakes >= this.maxWrong) {
      this.gameOver = true;
      alert('Game Over! The word was: ' + this.word);
    } else if ([...this.word].every(letter => this.guessed.has(letter))) {
      this.gameOver = true;
      alert('Congratulations! You won!');
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  reset() {
    this.word = this.words[Math.floor(Math.random() * this.words.length)];
    this.guessed.clear();
    this.mistakes = 0;
    this.gameOver = false;
    this.updateDisplay();
  }
}