document.addEventListener('DOMContentLoaded', function() {
    // Direct DOM references
    const gameContainer = document.getElementById('game-container');
    const startBtn = document.getElementById('start-game');
    const gameBoard = document.getElementById('game-board');
    const autoGameBoard = document.getElementById('auto-game-board');
    const scoreDisplay = document.getElementById('score-display');
    const humanScoreDisplay = document.getElementById('human-score-display');
    const autoScoreDisplay = document.getElementById('auto-score-display');
    const timerDisplay = document.getElementById('timer-display');
    const humanTimerDisplay = document.getElementById('human-timer-display');
    const autoTimerDisplay = document.getElementById('auto-timer-display');
    const gameMessage = document.getElementById('game-message');
    const instructionsPanel = document.getElementById('instructions-panel');
    const comparisonResults = document.getElementById('comparison-results');
    
    // Hide game container initially
    gameContainer.style.display = 'none';
    
    // Game variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;
    let timer = 0;
    let timerInterval;
    let gameStarted = false;
    let autoPlayEnabled = false;
    let autoScore = 0;
    let autoMatchedPairs = 0;
    let autoPlayMemory = {}; // To track cards seen by auto-player
    let autoPlayInterval;
    let humanCardElements = []; // Store all human player cards
    let autoCardElements = []; // Store all auto player cards

    // Farewell themed card images (emoji-based to avoid external assets)
    const cardEmojis = [
        '👋', '🎉', '🎁', '🎊', '🥳', '🍾', 
        '🎈', '👨‍💼', '✈️', '🌟', '🚀', '🏆'
    ];

    // Start the game
    startBtn.addEventListener('click', function() {
        startGame();
    });

    function startGame() {
        gameStarted = true;
        autoPlayEnabled = true;
        instructionsPanel.style.display = 'none';
        gameContainer.style.display = 'block';
        
        // Initialize game variables
        matchedPairs = 0;
        score = 0;
        autoScore = 0;
        autoMatchedPairs = 0;
        autoPlayMemory = {};
        humanCardElements = [];
        autoCardElements = [];
        flippedCards = [];
        timer = 180; // 60 seconds to complete
        
        updateScore();
        updateTimer();
        
        // Create shuffled cards
        const humanCards = shuffleCards();
        const autoCards = [...humanCards]; // Same order for fair comparison
        
        // Clear existing boards
        gameBoard.innerHTML = '';
        autoGameBoard.innerHTML = '';
        
        // Create the human game board
        createGameBoard(humanCards, gameBoard, humanCardElements, true);
        
        // Create the auto game board
        createGameBoard(autoCards, autoGameBoard, autoCardElements, false);

        // Hide comparison results
        comparisonResults.classList.add('d-none');

        // Start timer
        timerInterval = setInterval(function() {
            timer--;
            updateTimer();
            
            if (timer <= 0) {
                endGame(false);
            }
        }, 1000);
        
        // Start auto-play with a delay so player can get prepared
        setTimeout(() => {
            startAutoPlay();
        }, 3000);
    }
    
    // Duplicate emojis to create pairs and shuffle
    function shuffleCards() {
        // Create pairs
        let pairs = [];
        for (let i = 0; i < cardEmojis.length; i++) {
            pairs.push(cardEmojis[i]);
            pairs.push(cardEmojis[i]);
        }
        
        // Shuffle pairs
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }
        
        return pairs;
    }
    
    // Create game board
    function createGameBoard(cards, boardElement, cardElementsArray, isHuman) {
        boardElement.classList.add('memory-board');
        
        cards.forEach((emoji, index) => {
            // Create card container
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.cardIndex = index;
            card.dataset.emoji = emoji;
            
            // Card inner structure for flip effect
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            // Card front - This is what you see FIRST (blue with question mark)
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            // Card number on front
            const cardNumber = document.createElement('div');
            cardNumber.className = 'card-number';
            cardNumber.textContent = index + 1;
            cardNumber.style.position = 'absolute';
            cardNumber.style.top = '5px';
            cardNumber.style.left = '5px';
            cardNumber.style.backgroundColor = 'rgba(255,255,255,0.5)';
            cardNumber.style.color = '#000';
            cardNumber.style.width = '24px';
            cardNumber.style.height = '24px';
            cardNumber.style.borderRadius = '50%';
            cardNumber.style.display = 'flex';
            cardNumber.style.alignItems = 'center';
            cardNumber.style.justifyContent = 'center';
            cardNumber.style.fontWeight = 'bold';
            cardNumber.style.fontSize = '14px';
            cardNumber.style.zIndex = '10';
            cardFront.appendChild(cardNumber);
            
            // Question mark icon
            const cardIcon = document.createElement('div');
            cardIcon.innerHTML = '<i class="fas fa-question fa-3x" style="color: white;"></i>';
            cardIcon.style.width = '100%';
            cardIcon.style.height = '100%';
            cardIcon.style.display = 'flex';
            cardIcon.style.alignItems = 'center';
            cardIcon.style.justifyContent = 'center';
            cardFront.appendChild(cardIcon);
            
            // Card back - This is what appears after clicking (shows emoji)
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            
            // Number on back too
            const backCardNumber = document.createElement('div');
            backCardNumber.className = 'card-number card-number-back';
            backCardNumber.textContent = index + 1;
            backCardNumber.style.position = 'absolute';
            backCardNumber.style.top = '5px';
            backCardNumber.style.left = '5px';
            backCardNumber.style.backgroundColor = 'rgba(0,0,0,0.1)';
            backCardNumber.style.color = '#000';
            backCardNumber.style.width = '24px';
            backCardNumber.style.height = '24px';
            backCardNumber.style.borderRadius = '50%';
            backCardNumber.style.display = 'flex';
            backCardNumber.style.alignItems = 'center';
            backCardNumber.style.justifyContent = 'center';
            backCardNumber.style.fontWeight = 'bold';
            backCardNumber.style.fontSize = '14px';
            backCardNumber.style.zIndex = '10';
            cardBack.appendChild(backCardNumber);
            
            // Emoji element
            const emojiElement = document.createElement('span');
            emojiElement.className = 'card-emoji';
            emojiElement.textContent = emoji;
            cardBack.appendChild(emojiElement);
            
            // Assemble card
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            
            // Add click event for human player only
            if (isHuman) {
                card.addEventListener('click', flipCard);
            }
            
            // Add to board and array
            boardElement.appendChild(card);
            cardElementsArray.push(card);
        });
    }
    
    // Handle card flipping
    function flipCard() {
        if (!gameStarted) return;
        
        const selectedCard = this;
        
        // Ignore if card is already flipped or matched
        if (selectedCard.classList.contains('flipped') || 
            selectedCard.classList.contains('matched')) {
            return;
        }
        
        // Ignore if two cards are already flipped
        if (flippedCards.length === 2) return;
        
        // Flip the card
        selectedCard.classList.add('flipped');
        flippedCards.push(selectedCard);
        
        // Check for match if two cards are flipped
        if (flippedCards.length === 2) {
            setTimeout(() => checkForMatch(flippedCards, true), 500);
        }
    }
    
    // Check if flipped cards match
    function checkForMatch(cards, isHuman) {
        const [card1, card2] = cards;
        
        if (card1.dataset.emoji === card2.dataset.emoji) {
            // Cards match
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            // Add celebrate effect
            addCelebrateEffect(card1);
            addCelebrateEffect(card2);
            
            if (isHuman) {
                matchedPairs++;
                score += 10;
                
                // Add bonus points based on remaining time
                const timeBonus = Math.floor(timer / 5);
                score += timeBonus;
                
                updateScore();
                
                // Check if all pairs are matched
                if (matchedPairs === cardEmojis.length) {
                    endGame(true);
                }
            } else {
                autoMatchedPairs++;
                autoScore += 10;
                
                // Add bonus points based on remaining time
                const timeBonus = Math.floor(timer / 5);
                autoScore += timeBonus;
                
                updateAutoScore();
                
                // Check if all pairs are matched
                if (autoMatchedPairs === cardEmojis.length) {
                    // Auto player finished
                    stopAutoPlay();
                }
            }
        } else {
            // Cards don't match, flip them back
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 500);
            
            // Penalty for wrong match
            if (isHuman) {
                score = Math.max(0, score - 2);
                updateScore();
            } else {
                autoScore = Math.max(0, autoScore - 2);
                updateAutoScore();
            }
        }
        
        if (isHuman) {
            flippedCards = [];
        }
    }
    
    // Auto-play functionality
    function startAutoPlay() {
        let autoFlippedCards = [];
        
        autoPlayInterval = setInterval(() => {
            if (!gameStarted || autoMatchedPairs === cardEmojis.length) {
                stopAutoPlay();
                return;
            }
            
            // If we have two cards flipped, check for match
            if (autoFlippedCards.length === 2) {
                checkForMatch(autoFlippedCards, false);
                autoFlippedCards = [];
                return;
            }
            
            // Sometimes make a mistake (20% chance)
            const makeMistake = Math.random() < 0.2;
            
            // Strategy: First, try to match cards we've seen, unless making a mistake
            let knownPairs = findKnownPairs();
            
            if (knownPairs.length > 0 && !makeMistake) {
                // We found a known pair, flip both cards
                const [card1, card2] = knownPairs[0];
                flipAutoCard(autoCardElements[card1], autoFlippedCards);
                
                // Add a small delay before flipping the second card
                setTimeout(() => {
                    flipAutoCard(autoCardElements[card2], autoFlippedCards);
                }, 400);
            } else {
                // No known pairs or making a deliberate mistake, flip a random unflipped card
                let availableCards = autoCardElements.filter(card => 
                    !card.classList.contains('flipped') && 
                    !card.classList.contains('matched')
                );
                
                if (availableCards.length > 0) {
                    // If making a mistake, randomly select any card (even if we've seen it before)
                    // Otherwise, prefer cards we haven't seen yet
                    let cardToFlip;
                    
                    if (makeMistake) {
                        // Choose a random card
                        cardToFlip = availableCards[Math.floor(Math.random() * availableCards.length)];
                    } else {
                        // Select random card that we haven't seen yet if possible
                        let unseenCards = availableCards.filter(card => 
                            !autoPlayMemory[card.dataset.cardIndex]
                        );
                        
                        cardToFlip = unseenCards.length > 0 ? 
                            unseenCards[Math.floor(Math.random() * unseenCards.length)] : 
                            availableCards[Math.floor(Math.random() * availableCards.length)];
                    }
                    
                    flipAutoCard(cardToFlip, autoFlippedCards);
                    
                    // Remember this card only if we're not making a mistake
                    if (!makeMistake) {
                        let cardIndex = cardToFlip.dataset.cardIndex;
                        let cardEmoji = cardToFlip.dataset.emoji;
                        autoPlayMemory[cardIndex] = {
                            emoji: cardEmoji,
                            index: parseInt(cardIndex)
                        };
                    }
                }
            }
        }, 1500); // Medium speed - 1.5 seconds per move
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }
    
    function findKnownPairs() {
        // Group cards by emoji
        let emojiGroups = {};
        
        // Process all cards we've seen
        Object.values(autoPlayMemory).forEach(card => {
            if (!emojiGroups[card.emoji]) {
                emojiGroups[card.emoji] = [];
            }
            emojiGroups[card.emoji].push(card.index);
        });
        
        // Find pairs of the same emoji that aren't already matched
        let pairs = [];
        Object.values(emojiGroups).forEach(indices => {
            if (indices.length >= 2) {
                // Check if these cards are not already matched
                let unmatched = indices.filter(index => 
                    !autoCardElements[index].classList.contains('matched')
                );
                
                // If we have at least 2 unmatched cards with the same emoji, that's a pair
                if (unmatched.length >= 2) {
                    pairs.push([unmatched[0], unmatched[1]]);
                }
            }
        });
        
        return pairs;
    }
    
    function flipAutoCard(card, autoFlippedCards) {
        if (!card.classList.contains('flipped') && !card.classList.contains('matched')) {
            card.classList.add('flipped');
            autoFlippedCards.push(card);
        }
    }
    
    function addCelebrateEffect(card) {
        // Add a brief celebratory animation
        card.classList.add('celebrate');
        setTimeout(() => {
            card.classList.remove('celebrate');
        }, 1000);
    }
    
    function updateScore() {
        scoreDisplay.textContent = score;
        if (humanScoreDisplay) {
            humanScoreDisplay.textContent = score;
        }
    }
    
    function updateAutoScore() {
        if (autoScoreDisplay) {
            autoScoreDisplay.textContent = autoScore;
        }
    }
    
    function updateTimer() {
        timerDisplay.textContent = timer;
        if (humanTimerDisplay) {
            humanTimerDisplay.textContent = timer;
        }
        if (autoTimerDisplay) {
            autoTimerDisplay.textContent = timer;
        }
        
        // Visual countdown warning
        if (timer <= 10) {
            timerDisplay.classList.add('text-danger');
            if (humanTimerDisplay) humanTimerDisplay.classList.add('text-danger');
            if (autoTimerDisplay) autoTimerDisplay.classList.add('text-danger');
        } else {
            timerDisplay.classList.remove('text-danger');
            if (humanTimerDisplay) humanTimerDisplay.classList.remove('text-danger');
            if (autoTimerDisplay) autoTimerDisplay.classList.remove('text-danger');
        }
    }
    
    function displayComparisonResults() {
        // Calculate human vs auto performance
        let humanMatchRate = matchedPairs / cardEmojis.length;
        let autoMatchRate = autoMatchedPairs / cardEmojis.length;
        
        let humanEfficiency = score / (cardEmojis.length * 10); // Potential max score
        let autoEfficiency = autoScore / (cardEmojis.length * 10);
        
        // Determine who won
        let humanWon = score > autoScore;
        let message = '';
        
        if (humanWon) {
            message = `<div class="alert alert-success">
                <h4 class="alert-heading"><i class="fas fa-trophy me-2"></i>Congratulations!</h4>
                <p>You outperformed the computer! Well done!</p>
            </div>`;
        } else if (score === autoScore) {
            message = `<div class="alert alert-info">
                <h4 class="alert-heading"><i class="fas fa-balance-scale me-2"></i>It's a Tie!</h4>
                <p>You matched the computer's performance exactly!</p>
            </div>`;
        } else {
            message = `<div class="alert alert-warning">
                <h4 class="alert-heading"><i class="fas fa-robot me-2"></i>Computer Wins</h4>
                <p>The computer performed better this time. Keep practicing!</p>
            </div>`;
        }
        
        // Create comparison chart
        let comparison = `
            <div class="container">
                ${message}
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-3 ${humanWon ? 'border-success' : ''}">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="fas fa-user me-2"></i>Your Performance</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Final Score:</strong> ${score} points</p>
                                <p><strong>Pairs Matched:</strong> ${matchedPairs} of ${cardEmojis.length}</p>
                                <p><strong>Match Rate:</strong> ${Math.round(humanMatchRate * 100)}%</p>
                                <p><strong>Efficiency:</strong> ${Math.round(humanEfficiency * 100)}%</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card mb-3 ${!humanWon && score !== autoScore ? 'border-success' : ''}">
                            <div class="card-header bg-info text-white">
                                <h5 class="mb-0"><i class="fas fa-robot me-2"></i>Computer Performance</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Final Score:</strong> ${autoScore} points</p>
                                <p><strong>Pairs Matched:</strong> ${autoMatchedPairs} of ${cardEmojis.length}</p>
                                <p><strong>Match Rate:</strong> ${Math.round(autoMatchRate * 100)}%</p>
                                <p><strong>Efficiency:</strong> ${Math.round(autoEfficiency * 100)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 text-center">
                        <p class="mt-3">How did you compare to the computer's memory?</p>
                        <div class="mt-4">
                            <button id="play-again-btn" class="btn btn-primary me-2">
                                <i class="fas fa-sync-alt me-1"></i>Play Again
                            </button>
                            <button id="submit-score-btn" class="btn btn-success">
                                <i class="fas fa-save me-1"></i>Submit Score
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        comparisonResults.innerHTML = comparison;
        comparisonResults.classList.remove('d-none');
        comparisonResults.scrollIntoView({ behavior: 'smooth' });
        
        // Add event listeners to the new buttons
        document.getElementById('play-again-btn').addEventListener('click', function() {
            startGame();
        });
        
        document.getElementById('submit-score-btn').addEventListener('click', function() {
            submitScore(score);
        });
    }
    
    function endGame(isCompleted) {
        clearInterval(timerInterval);
        stopAutoPlay();
        gameStarted = false;
        
        // Show the comparison results
        displayComparisonResults();
        
        // Add confetti celebration for winning
        if (isCompleted && score > autoScore) {
            // More confetti for higher scores
            const confettiAmount = Math.min(500, score * 2);
            window.confetti({
                particleCount: confettiAmount,
                spread: 100,
                origin: { y: 0.6 }
            });
        }
    }
    
    function submitScore(finalScore) {
        fetch('/api/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game: 'memory_game',
                score: finalScore,
                details: {
                    pairs_matched: matchedPairs,
                    auto_score: autoScore
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    position: 'top-end',
                    icon: 'info',
                    title: `Your rank: ${data.rank} out of ${data.total_players}`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    }
});
