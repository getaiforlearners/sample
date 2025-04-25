document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.getElementById('game-container');
    const startBtn = document.getElementById('start-game');
    const wordDisplay = document.getElementById('word-display');
    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    const hintBtn = document.getElementById('hint-btn');
    const hintDisplay = document.getElementById('hint-display');
    const gameMessage = document.getElementById('game-message');
    const instructionsPanel = document.getElementById('instructions-panel');
    const remainingDisplay = document.getElementById('remaining-display');
    
    // Game variables
    let currentWord = '';
    let currentHint = '';
    let scrambledWord = '';
    let score = 0;
    let timer = 0;
    let timerInterval;
    let gameStarted = false;
    let wordsRemaining = 0;
    let wordsInRound = 10;
    let usedHints = 0;
    let currentQuestionIndex = 0;
    let gameWords = [];
    
    // Track wrong guesses for automatic language switching
    let wrongGuessesForCurrentWord = 0;
    const MAX_WRONG_ATTEMPTS = 3; // After 3 wrong attempts, show answer button

    // English words
    const englishWords = [
        { word: 'FAREWELL', hint: 'Saying goodbye' },
        { word: 'GOODBYE', hint: 'Parting expression' },
        { word: 'MEMORIES', hint: 'Things to cherish from the past' },
        { word: 'ADVENTURE', hint: 'An exciting journey ahead' },
        { word: 'CELEBRATION', hint: 'A special occasion to honor someone' },
        { word: 'COLLEAGUE', hint: 'A person you work with' },
        { word: 'FRIENDSHIP', hint: 'A relationship built on trust' },
        { word: 'SUCCESS', hint: 'Achievement of goals' },
        { word: 'OPPORTUNITY', hint: 'A favorable circumstance' },
        { word: 'JOURNEY', hint: 'Life path or career' },
        { word: 'FUTURE', hint: 'Time that is yet to come' },
        { word: 'GRATITUDE', hint: 'Feeling of appreciation' },
        { word: 'THANKYOU', hint: 'Expression of appreciation' },
        { word: 'ACHIEVEMENT', hint: 'Something accomplished' },
        { word: 'BLESSING', hint: 'Something beneficial in your life' },
        { word: 'PROGRESS', hint: 'Moving forward' },
        { word: 'NEWBEGINNING', hint: 'Fresh start' },
        { word: 'ACCOMPLISHMENT', hint: 'Something achieved successfully' },
        { word: 'TEAMWORK', hint: 'Collaborative effort' },
        { word: 'INSPIRATION', hint: 'Something that motivates you' }
    ];
    
    // French words with English hints - simple everyday vocabulary
    const frenchWords = [
        { word: 'BONJOUR', hint: 'Common greeting (hello)' },
        { word: 'MERCI', hint: 'Expression of thanks (thank you)' },
        { word: 'AMI', hint: 'Person you like (friend)' },
        { word: 'CHAT', hint: 'Popular pet animal (cat)' },
        { word: 'CHIEN', hint: 'Man\'s best friend (dog)' },
        { word: 'JOUR', hint: 'Time when sun is up (day)' },
        { word: 'NUIT', hint: 'Dark time (night)' },
        { word: 'PAIN', hint: 'Baked food (bread)' },
        { word: 'EAU', hint: 'What you drink (water)' },
        { word: 'LAIT', hint: 'White drink (milk)' },
        { word: 'ÉCOLE', hint: 'Place for learning (school)' },
        { word: 'LIVRE', hint: 'You read it (book)' },
        { word: 'PORTE', hint: 'You open and close it (door)' },
        { word: 'TABLE', hint: 'Furniture to eat on (table)' },
        { word: 'ARBRE', hint: 'Grows in forests (tree)' },
        { word: 'POMME', hint: 'Common fruit (apple)' },
        { word: 'BLEU', hint: 'Color of the sky (blue)' },
        { word: 'ROUGE', hint: 'Color of stop signs (red)' },
        { word: 'PETIT', hint: 'Not big (small)' },
        { word: 'GRAND', hint: 'Not small (big)' },
        { word: 'MAISON', hint: 'Where you live (house)' },
        { word: 'SOLEIL', hint: 'Shines during the day (sun)' },
        { word: 'LUNE', hint: 'Visible at night in the sky (moon)' },
        { word: 'FLEUR', hint: 'Colorful plant part (flower)' },
        { word: 'MAIN', hint: 'Has five fingers (hand)' },
        { word: 'PIED', hint: 'Used for walking (foot)' },
        { word: 'TÊTE', hint: 'Contains your brain (head)' },
        { word: 'CORPS', hint: 'Your physical self (body)' },
        { word: 'JARDIN', hint: 'Where plants grow (garden)' },
        { word: 'FENÊTRE', hint: 'See through it in a wall (window)' },
        { word: 'BUREAU', hint: 'Where you work (office/desk)' },
        { word: 'FAMILLE', hint: 'Related people (family)' },
        { word: 'CAFÉ', hint: 'Morning beverage (coffee)' },
        { word: 'SUCRE', hint: 'Sweet ingredient (sugar)' },
        { word: 'FROMAGE', hint: 'Dairy product (cheese)' },
        { word: 'MUSIQUE', hint: 'You listen to it (music)' },
        { word: 'DANSE', hint: 'Movement to music (dance)' },
        { word: 'TÉLÉPHONE', hint: 'Communication device (phone)' },
        { word: 'MANGER', hint: 'Action of consuming food (to eat)' },
        { word: 'BOIRE', hint: 'Action of consuming liquid (to drink)' },
        { word: 'DORMIR', hint: 'What you do at night (to sleep)' },
        { word: 'PARLER', hint: 'Using your voice (to speak)' },
        { word: 'ÉCOUTER', hint: 'Using your ears (to listen)' },
        { word: 'VOIR', hint: 'Using your eyes (to see)' },
        { word: 'MARCHER', hint: 'Moving on foot (to walk)' }
    ];
    
    // Start with French words by default
    let wordList = frenchWords;
    let currentLanguage = 'french';
    
    // Create additional UI elements
    // Create Show Answer button
    let showAnswerBtn = document.createElement('button');
    showAnswerBtn.id = 'show-answer-btn';
    showAnswerBtn.className = 'btn btn-warning ms-2';
    showAnswerBtn.innerHTML = '<i class="fas fa-eye me-1"></i>Show Answer';
    showAnswerBtn.style.display = 'none';
    if (guessBtn && guessBtn.parentNode) {
        guessBtn.parentNode.appendChild(showAnswerBtn);
    }
    
    // Add a "Next Word" button
    let nextWordBtn = document.createElement('button');
    nextWordBtn.id = 'next-word-btn';
    nextWordBtn.className = 'btn btn-primary ms-2';
    nextWordBtn.innerHTML = '<i class="fas fa-forward me-1"></i>Next Word';
    nextWordBtn.style.display = 'none';
    if (guessBtn && guessBtn.parentNode) {
        guessBtn.parentNode.appendChild(nextWordBtn);
    }
    
    // Add a question counter display
    const questionCounter = document.createElement('div');
    questionCounter.id = 'question-counter';
    questionCounter.className = 'alert alert-info mt-3';
    questionCounter.style.display = 'none';
    if (wordDisplay.parentElement) {
        wordDisplay.parentElement.appendChild(questionCounter);
    }
    
    // Start the game
    startBtn.addEventListener('click', function() {
        startGame();
    });
    
    // Submit guess
    guessBtn.addEventListener('click', function() {
        submitGuess();
    });
    
    // Allow enter key for submission
    guessInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            submitGuess();
        }
    });
    
    // Request hint
    hintBtn.addEventListener('click', function() {
        if (!gameStarted) return;
        
        hintDisplay.textContent = currentHint;
        hintDisplay.classList.remove('d-none');
        
        // Using a hint reduces score potential
        usedHints++;
    });
    
    // Language toggle buttons
    const toggleFrenchBtn = document.getElementById('toggle-french');
    const toggleEnglishBtn = document.getElementById('toggle-english');
    
    // Function to toggle button styles
    function updateLanguageButtons(isEnglish) {
        if (isEnglish) {
            toggleEnglishBtn.classList.add('btn-primary');
            toggleEnglishBtn.classList.remove('btn-outline-primary');
            toggleFrenchBtn.classList.remove('btn-primary');
            toggleFrenchBtn.classList.add('btn-outline-primary');
        } else {
            toggleFrenchBtn.classList.add('btn-primary');
            toggleFrenchBtn.classList.remove('btn-outline-primary');
            toggleEnglishBtn.classList.remove('btn-primary');
            toggleEnglishBtn.classList.add('btn-outline-primary');
        }
    }
    
    // Switch to French
    toggleFrenchBtn.addEventListener('click', function() {
        if (!gameStarted) return;
        if (currentLanguage === 'french') return; // Already in French
        
        // Switch to French
        currentLanguage = 'french';
        updateLanguageButtons(false);
        
        // Find the matching French word using the English word
        // Extract the English word from the current word or hint
        let englishWord = currentWord;
        
        // If we're switching from English, the current word might be the English version
        // Look for a French equivalent using the English hint brackets
        const matchingFrenchWord = frenchWords.find(w => {
            const englishInBrackets = w.hint.match(/\(([^)]+)\)/);
            return englishInBrackets && 
                  (englishInBrackets[1].toUpperCase() === englishWord.toUpperCase());
        });
        
        if (matchingFrenchWord) {
            // Update current word to French
            currentWord = matchingFrenchWord.word;
            currentHint = matchingFrenchWord.hint;
            scrambledWord = scrambleWord(currentWord);
            wordDisplay.textContent = scrambledWord;
            
            gameMessage.textContent = "Switched to French version!";
            gameMessage.className = 'alert alert-info';
        } else {
            // If no match found, just notify the user
            gameMessage.textContent = "Couldn't find a French equivalent for this word.";
            gameMessage.className = 'alert alert-warning';
        }
        
        // Always reset wrong guesses when switching languages
        wrongGuessesForCurrentWord = 0;
        
        // Hide answer button
        showAnswerBtn.style.display = 'none';
    });
    
    // Switch to English
    toggleEnglishBtn.addEventListener('click', function() {
        if (!gameStarted) return;
        if (currentLanguage === 'english') return; // Already in English
        
        // Switch to English
        currentLanguage = 'english';
        updateLanguageButtons(true);
        
        // Extract the English word from the hint
        const englishWordInBrackets = currentHint.match(/\(([^)]+)\)/);
        
        if (englishWordInBrackets && englishWordInBrackets[1]) {
            const englishWord = englishWordInBrackets[1].toUpperCase();
            
            // Try to find an exact matching English word
            const matchingEnglishWord = englishWords.find(w => 
                w.word.toUpperCase() === englishWord
            );
            
            if (matchingEnglishWord) {
                // Update current word to English
                currentWord = matchingEnglishWord.word;
                currentHint = matchingEnglishWord.hint;
                scrambledWord = scrambleWord(currentWord);
                wordDisplay.textContent = scrambledWord;
                
                gameMessage.textContent = "Switched to English version!";
                gameMessage.className = 'alert alert-info';
            } else {
                // If no match found, create a simple English entry
                currentWord = englishWord;
                currentHint = "English equivalent";
                scrambledWord = scrambleWord(currentWord);
                wordDisplay.textContent = scrambledWord;
                
                gameMessage.textContent = "Switched to English version!";
                gameMessage.className = 'alert alert-info';
            }
        } else {
            // If no English word in brackets, just notify the user
            gameMessage.textContent = "Couldn't extract English equivalent for this word.";
            gameMessage.className = 'alert alert-warning';
        }
        
        // Always reset wrong guesses when switching languages
        wrongGuessesForCurrentWord = 0;
        
        // Hide answer button
        showAnswerBtn.style.display = 'none';
    });
    
    // Event listeners for new buttons
    showAnswerBtn.addEventListener('click', function() {
        if (!gameStarted) return;
        
        // Show the answer
        gameMessage.innerHTML = `The answer is: <strong>${currentWord}</strong>`;
        gameMessage.className = 'alert alert-warning';
        
        // Penalize score more heavily for showing answer
        score = Math.max(0, score - 5);
        updateScore();
        
        // Show Next Word button
        nextWordBtn.style.display = 'inline-block';
        
        // Hide other buttons
        guessBtn.style.display = 'none';
        showAnswerBtn.style.display = 'none';
    });
    
    nextWordBtn.addEventListener('click', function() {
        if (!gameStarted) return;
        
        // Reset wrong guesses counter
        wrongGuessesForCurrentWord = 0;
        
        // Move to next question
        currentQuestionIndex++;
        
        if (currentQuestionIndex >= gameWords.length) {
            // We've exhausted our prepared words, end the game
            endGame(true);
        } else {
            // Move to the next word in our prepared list
            selectNextWord(currentQuestionIndex);
            
            // Reset UI elements
            gameMessage.textContent = '';
            guessBtn.style.display = 'inline-block';
            showAnswerBtn.style.display = 'none';
            nextWordBtn.style.display = 'none';
            hintDisplay.textContent = '';
            hintDisplay.classList.add('d-none');
            usedHints = 0;
        }
    });
    
    function startGame() {
        gameStarted = true;
        instructionsPanel.style.display = 'none';
        wordDisplay.parentElement.style.display = 'block';
        guessInput.parentElement.style.display = 'flex';
        questionCounter.style.display = 'block';
        
        score = 0;
        timer = 180; // 3 minutes
        wordsRemaining = wordsInRound;
        usedHints = 0;
        currentQuestionIndex = 0;
        
        updateScore();
        updateTimer();
        
        // Shuffle the word list and pick a subset
        const shuffledWords = [...wordList].sort(() => 0.5 - Math.random());
        gameWords = shuffledWords.slice(0, wordsInRound);
        
        // Set first word
        selectNextWord(currentQuestionIndex);
        
        // Clear previous messages
        gameMessage.textContent = '';
        hintDisplay.textContent = '';
        hintDisplay.classList.add('d-none');
        
        // Start timer
        timerInterval = setInterval(function() {
            timer--;
            updateTimer();
            
            if (timer <= 0) {
                endGame(false);
            }
        }, 1000);
        
        // Focus input field
        guessInput.focus();
    }
    
    function selectNextWord(index) {
        if (index >= gameWords.length || wordsRemaining <= 0) {
            endGame(true);
            return;
        }
        
        // Get word from our prepared list
        const wordObj = gameWords[index];
        currentWord = wordObj.word;
        currentHint = wordObj.hint;
        
        // Reset wrong guesses counter for the new word
        wrongGuessesForCurrentWord = 0;
        
        // Scramble the word
        scrambledWord = scrambleWord(currentWord);
        
        // Display scrambled word
        wordDisplay.textContent = scrambledWord;
        
        // Clear input and hide hint
        guessInput.value = '';
        hintDisplay.textContent = '';
        hintDisplay.classList.add('d-none');
        
        // Update question counter
        updateQuestionCounter();
    }
    
    function updateQuestionCounter() {
        // Display both current question number and total questions
        const currentQuestionNumber = currentQuestionIndex + 1;
        questionCounter.textContent = `Question ${currentQuestionNumber} of ${wordsInRound}`;
    }
    
    function scrambleWord(word) {
        const array = word.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
    
    function submitGuess() {
        if (!gameStarted) return;
        
        const guess = guessInput.value.trim().toUpperCase();
        
        if (guess === currentWord) {
            // Correct guess
            let wordScore = Math.max(5, currentWord.length * 2); // Base score by word length
            
            // Bonus based on time left
            const timeBonus = Math.floor(timer / 10);
            
            // Penalty for using hints
            const hintPenalty = usedHints * 2;
            
            // Calculate total score for this word
            const wordTotal = Math.max(0, wordScore + timeBonus - hintPenalty);
            score += wordTotal;
            
            updateScore();
            
            // Show success message
            gameMessage.textContent = `Correct! +${wordTotal} points`;
            gameMessage.className = 'alert alert-success';
            
            // Small confetti celebration
            if (typeof window.confetti === 'function') {
                window.confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { y: 0.7 }
                });
            }
            
            // Reset hint status and wrong guesses counter
            usedHints = 0;
            wrongGuessesForCurrentWord = 0;
            
            // Decrease words remaining
            wordsRemaining--;
            
            // Show Next Word button
            nextWordBtn.style.display = 'inline-block';
            guessBtn.style.display = 'none';
            
            // Don't automatically move to next word - let user click Next button
        } else {
            // Incorrect guess
            wrongGuessesForCurrentWord++;
            
            // If playing in French and struggling, offer to switch to English
            if (currentLanguage === 'french' && wrongGuessesForCurrentWord >= MAX_WRONG_ATTEMPTS) {
                // Find the English equivalent for the current French word
                let englishEquivalent = null;
                
                // Get the English translation/equivalent from the hint
                const hintText = currentHint;
                const englishWordInBrackets = hintText.match(/\(([^)]+)\)/);
                
                if (englishWordInBrackets && englishWordInBrackets[1]) {
                    const englishWord = englishWordInBrackets[1].toUpperCase();
                    
                    // Show the English equivalent and the Show Answer button
                    gameMessage.innerHTML = `Struggling with this word? The English word is: <strong>${englishWord}</strong>`;
                    gameMessage.className = 'alert alert-info';
                    showAnswerBtn.style.display = 'inline-block';
                } else {
                    // If no English word found in the hint, just show generic message
                    gameMessage.textContent = 'Incorrect! Try again or use a hint.';
                    gameMessage.className = 'alert alert-danger';
                    showAnswerBtn.style.display = 'inline-block';
                }
            } else {
                // Regular incorrect guess feedback
                gameMessage.textContent = 'Incorrect! Try again.';
                gameMessage.className = 'alert alert-danger';
                
                // Show the Show Answer button after MAX_WRONG_ATTEMPTS wrong attempts regardless of language
                if (wrongGuessesForCurrentWord >= MAX_WRONG_ATTEMPTS) {
                    showAnswerBtn.style.display = 'inline-block';
                }
            }
            
            // Small penalty
            score = Math.max(0, score - 1);
            updateScore();
        }
        
        // Clear and focus input field
        guessInput.value = '';
        guessInput.focus();
    }
    
    function updateScore() {
        scoreDisplay.textContent = score;
    }
    
    function updateTimer() {
        timerDisplay.textContent = timer;
        
        // Visual countdown warning
        if (timer <= 30) {
            timerDisplay.classList.add('text-danger');
        } else {
            timerDisplay.classList.remove('text-danger');
        }
    }
    
    function endGame(isCompleted) {
        clearInterval(timerInterval);
        gameStarted = false;
        
        // Calculate final score
        let finalScore = score;
        
        // Add completion bonus if all words were solved
        if (isCompleted && wordsRemaining <= 0) {
            const timeBonus = timer * 2;
            finalScore += timeBonus;
            
            gameMessage.textContent = `Great job! You completed all words! Time bonus: +${timeBonus}`;
            gameMessage.className = 'alert alert-success';
            
            // Big celebration
            if (typeof window.confetti === 'function') {
                window.confetti({
                    particleCount: 200,
                    spread: 90,
                    origin: { y: 0.6 }
                });
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Fantastic!',
                    text: `You solved all words and scored ${finalScore} points!`,
                    icon: 'success',
                    confirmButtonText: 'Play Again'
                }).then((result) => {
                    if (result.isConfirmed) {
                        submitScore(finalScore);
                        startGame();
                    } else {
                        submitScore(finalScore);
                        showInstructions();
                    }
                });
            }
        } else if (timer <= 0) {
            gameMessage.textContent = `Time's up! Your score: ${finalScore}`;
            gameMessage.className = 'alert alert-warning';
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Time\'s Up!',
                    text: `You scored ${finalScore} points.`,
                    icon: 'info',
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.isConfirmed) {
                        submitScore(finalScore);
                        startGame();
                    } else {
                        submitScore(finalScore);
                        showInstructions();
                    }
                });
            }
        }
    }
    
    function showInstructions() {
        wordDisplay.parentElement.style.display = 'none';
        guessInput.parentElement.style.display = 'none';
        questionCounter.style.display = 'none';
        instructionsPanel.style.display = 'block';
        gameMessage.textContent = '';
    }
    
    function submitScore(finalScore) {
        fetch('/api/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game: 'word_puzzle',
                score: finalScore,
                details: {
                    language: currentLanguage
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && typeof Swal !== 'undefined') {
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