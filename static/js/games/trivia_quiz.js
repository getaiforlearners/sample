document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const startBtn = document.getElementById('start-game');
    const instructionsPanel = document.getElementById('instructions-panel');
    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question-text');
    const answerContainer = document.getElementById('answer-container');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    const questionCounter = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');
    const gameMessage = document.getElementById('game-message');
    
    // Game variables
    let score = 0;
    let timer = 0;
    let timerInterval;
    let questionTimer = 0;
    let questionInterval;
    let currentQuestionIndex = 0;
    let gameStarted = false;
    let questions = [];
    let totalQuestions = 0;
    
    // Set up the questions
    // Each question has options including all colleagues
    const baseQuestions = [
        {
            question: "Who would survive longest in a zombie apocalypse? 🧟",
            correct: 4, // Shiv
            reactions: ["🧟", "🔪", "🧠", "🏃‍♂️", "🦸‍♂️", "🏆", "🛡️", "⚔️", "👑", "🧪", "🔬", "🧟‍♀️", "🧟‍♂️", "☠️"],
            responseCorrect: "Absolutely! Shiv says: 'The zombies would take one look at my project management skills and make me their leader instead.'",
            responseWrong: "Shiv would say: 'I've already created a spreadsheet with everyone's survival odds. Yours just dropped to zero.'"
        },
        {
            question: "Who is most likely to be secretly playing games during virtual meetings? 🎮",
            correct: 10, // Suyash
            reactions: ["🎮", "🎯", "🎲", "🎪", "🎭", "🎨", "🎮", "🕹️", "👾", "🎯", "🎰", "🎮", "🎯", "🎲"],
            responseCorrect: "You caught me! Suyash says: 'I'm not playing games, I'm conducting interactive digital research while multitasking.'",
            responseWrong: "Suyash would say: 'Those keyboard sounds? I'm taking very detailed notes, definitely not my character jumping in Fortnite.'"
        },
        {
            question: "Who is most likely to send 'per my last email' with the previous email attached? 📧",
            correct: 11, // Priyadarshini
            reactions: ["📧", "📨", "📩", "📤", "📥", "📮", "📝", "📑", "📊", "📈", "📉", "📇", "📋", "📁"],
            responseCorrect: "Correct! Priyadarshini says: 'I'm not being passive-aggressive, I'm just efficiently reminding you that I've already solved this problem once.'",
            responseWrong: "Priyadarshini would say: 'As previously mentioned in the email you clearly didn't read (now attached for your convenience), this matter was resolved 3 weeks ago.'"
        },
        {
            question: "Who takes the longest lunch breaks but insists they were 'just 30 minutes'? 🍽️",
            correct: 0, // Aakash
            reactions: ["🍽️", "🍳", "🍲", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥧"],
            responseCorrect: "You're right! Aakash says: 'Time is relative. Einstein proved it. My 90-minute lunch breaks are actually just 30 minutes in my personal time zone.'",
            responseWrong: "Aakash would say: 'I was having a working lunch. Those were strategic food pauses between productivity bursts.'"
        },
        {
            question: "Who is the office comedian whose jokes no one actually gets? 🎭",
            correct: 5, // Praveen
            reactions: ["🎭", "🎬", "🎪", "🎨", "🎤", "🎧", "🎼", "🎹", "🎵", "🎷", "🎺", "🎸", "🎻", "🥁"],
            responseCorrect: "That's right! Praveen says: 'It's not that my jokes are bad, it's that they're so advanced they require a specialized sense of humor upgrade.'",
            responseWrong: "Praveen would say: 'You know, not understanding my jokes is actually the joke. Meta-humor. You'll get it eventually.'"
        },
        {
            question: "Who is most likely to solve a complex technical problem but forget to tell anyone? 💻",
            correct: 1, // Ajith
            reactions: ["💻", "🖥️", "🖱️", "⌨️", "💽", "💾", "💿", "📀", "🧮", "📱", "📲", "☎️", "📞", "📟"],
            responseCorrect: "You got it! Ajith says: 'I fixed it three weeks ago but didn't want to interrupt your fascinating discussions about potential solutions.'",
            responseWrong: "Ajith would say: 'Oh, did you need to know about that fix? I thought the lack of system crashes was self-explanatory.'"
        },
        {
            question: "Who has the most organized desk but can never find their coffee mug? ☕",
            correct: 8, // Shalan
            reactions: ["☕", "🍵", "🥤", "🧋", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🧃"],
            responseCorrect: "Correct! Shalan says: 'My desk organization system is perfect. It's the mug that keeps moving on its own. Probably quantum physics.'",
            responseWrong: "Shalan would say: 'My coffee mug isn't lost. It's exactly where it's supposed to be according to my system. I just don't remember where that is.'"
        },
        {
            question: "Who is most likely to have a 30-minute meeting that somehow lasts 2 hours? ⏰",
            correct: 3, // Mithun
            reactions: ["⏰", "⏱️", "⏲️", "🕰️", "🕛", "🕧", "🕐", "🕜", "🕑", "🕝", "🕒", "🕞", "🕓", "🕟"],
            responseCorrect: "Spot on! Mithun says: 'That wasn't a meeting running long, it was a strategic temporal extension for maximum ideation potential.'",
            responseWrong: "Mithun would say: 'Time is just a construct. The real measure of a meeting is how many tangential topics we can explore.'"
        },
        {
            question: "Who would bring a 50-slide PowerPoint presentation to a 15-minute meeting? 📊",
            correct: 7, // Rituraj
            reactions: ["📊", "📈", "📉", "📋", "📂", "📁", "📄", "📃", "📑", "🗂️", "🗃️", "🗄️", "📌", "📍"],
            responseCorrect: "Yes! Rituraj says: 'I just needed 50 slides to properly contextualize the situation. The first 49 are just background information.'",
            responseWrong: "Rituraj would say: 'Actually, I cut it down from 100 slides. You should be thanking me for my restraint.'"
        },
        {
            question: "Who is most likely to reply to an email thread with just 'Thanks'? 💌",
            correct: 6, // Lakshman
            reactions: ["💌", "✉️", "📧", "📨", "📩", "📤", "📥", "📦", "📫", "📬", "📭", "📮", "🗳️", "✏️"],
            responseCorrect: "Correct! Lakshman says: 'My comprehensive 'Thanks' acknowledges receipt, expresses gratitude, and concludes the conversation efficiently.'",
            responseWrong: "Lakshman would say: 'Why use many word when few word do trick? Thanks.'"
        },
        {
            question: "Who is secretly judging everyone's coffee choices? ☕",
            correct: 9, // Sunita
            reactions: ["☕", "🍵", "🧋", "🍶", "🥤", "🧃", "🧉", "🍷", "🍸", "🥃", "🥛", "🧊", "🍽️", "🍴"],
            responseCorrect: "You know it! Sunita says: 'I'm not judging, I'm just mentally categorizing everyone on a 37-point coffee sophistication scale.'",
            responseWrong: "Sunita would say: 'Instant coffee isn't real coffee, it's bean-flavored sadness water. But I respect your choices... sort of.'"
        },
        {
            question: "Who has the most browser tabs open at any given time? 🌐",
            correct: 2, // Harshita
            reactions: ["🌐", "💻", "🖥️", "🖱️", "⌨️", "💽", "💾", "💿", "📀", "📱", "📲", "📶", "📳", "📴"],
            responseCorrect: "That's right! Harshita says: 'Those 173 open tabs are all essential research. I'll get to tab 94 eventually.'",
            responseWrong: "Harshita would say: 'Closing tabs is like throwing away knowledge. My browser is basically a library of Alexandria.'"
        },
        {
            question: "Who is most likely to start a diet on Monday and abandon it by Tuesday lunch? 🥗",
            correct: 12, // Pradeep
            reactions: ["🥗", "🍔", "🍕", "🌮", "🥪", "🍰", "🧁", "🍩", "🍪", "🍫", "🍬", "🍭", "🍮", "🍯"],
            responseCorrect: "You got it! Pradeep says: 'Tuesday's pizza was a strategic carb-loading phase of my flexible, non-linear wellness journey.'",
            responseWrong: "Pradeep would say: 'I didn't abandon my diet, I just pivoted to a more sustainable approach involving regular pizza consumption.'"
        },
        {
            question: "Who sends emails at 3 AM and expects an immediate response? 📨",
            correct: 13, // Deepak
            reactions: ["📨", "📧", "📩", "📤", "📥", "📮", "📯", "📪", "📫", "📬", "📭", "📦", "📝", "🖊️"],
            responseCorrect: "Exactly! Deepak says: 'Sleep is inefficient. I've optimized my workflow to include the traditionally wasted midnight hours.'",
            responseWrong: "Deepak would say: 'My 3 AM emails are just ensuring you have something interesting to wake up to. You're welcome.'"
        },
        {
            question: "Who has the messiest desk but somehow knows exactly where everything is? 📚",
            correct: 0, // Aakash
            reactions: ["📚", "📑", "📇", "📌", "📍", "📎", "🖇️", "📏", "📐", "✂️", "🔒", "🔑", "🔨", "⛏️"],
            responseCorrect: "Bingo! Aakash says: 'My desk isn't messy, it's a carefully engineered 3D filing system only I can navigate.'",
            responseWrong: "Aakash would say: 'What you call mess, I call an organic workflow optimization landscape.'"
        }
    ];
    
    // All colleagues list
    const allColleagues = [
        "Aakash",
        "Ajith Nair",
        "Harshita",
        "Mithun",
        "Shiv",
        "Praveen",
        "Lakshman",
        "Rituraj",
        "Shalan",
        "Sunita",
        "Suyash Kumar Sahu",
        "Priyadarshini Hk",
        "Pradeep",
        "Deepak"
    ];
    
    // Function to initialize game
    function initializeGame() {
        // Initialize questions with all colleagues as options
        questions = baseQuestions.map(q => {
            return {
                ...q,
                answers: [...allColleagues] // Use all colleagues for every question
            };
        });
        
        totalQuestions = questions.length;
    }
    
    // Start button click event
    startBtn.addEventListener('click', function() {
        startGame();
    });
    
    // Start the game
    function startGame() {
        // Initialize game
        initializeGame();
        
        // Reset game variables
        score = 0;
        timer = 120; // 2 minutes
        currentQuestionIndex = 0;
        gameStarted = true;
        
        // Update score and timer
        updateScore();
        updateTimer();
        
        // Show first question
        showQuestion(questions[currentQuestionIndex]);
        
        // Hide instructions and show game
        instructionsPanel.style.display = 'none';
        questionContainer.style.display = 'block';
        
        // Start game timer
        timerInterval = setInterval(function() {
            timer--;
            updateTimer();
            
            if (timer <= 0) {
                // Time's up!
                clearInterval(timerInterval);
                endGame(false);
            }
        }, 1000);
    }
    
    // Show a question
    function showQuestion(questionObj) {
        // Clear previous question content
        if (questionInterval) {
            clearInterval(questionInterval);
        }
        
        // No timer needed - we'll wait for user to click next
        // Hide the progress bar since we don't need it
        const progressBarContainer = document.querySelector('.progress');
        if (progressBarContainer) {
            progressBarContainer.style.display = 'none';
        }
        
        // Display question
        questionText.textContent = questionObj.question;
        answerContainer.innerHTML = '';
        
        // Create a grid container for the buttons
        const gridContainer = document.createElement('div');
        gridContainer.className = 'row g-2';
        answerContainer.appendChild(gridContainer);
        
        // Create answer buttons in a grid (2 columns)
        questionObj.answers.forEach((answer, index) => {
            // Create column for each button
            const column = document.createElement('div');
            column.className = 'col-md-6 mb-2';
            
            // Create the button
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary answer-btn w-100 text-truncate';
            button.textContent = answer;
            button.dataset.index = index;
            
            button.addEventListener('click', () => {
                if (questionInterval) {
                    clearInterval(questionInterval);
                }
                
                checkAnswer(index, questionObj);
            });
            
            // Add button to column and column to grid
            column.appendChild(button);
            gridContainer.appendChild(column);
        });
        
        // Update question counter
        questionCounter.textContent = `${currentQuestionIndex + 1}/${totalQuestions}`;
    }
    
    // Check answer
    function checkAnswer(selectedIndex, questionObj) {
        const answerButtons = answerContainer.querySelectorAll('.answer-btn');
        
        // Disable all buttons
        answerButtons.forEach(btn => {
            btn.disabled = true;
        });
        
        // Always show a funny response without indicating if it's correct or wrong
        const selectedPersonName = questionObj.answers[selectedIndex];
        const isCorrect = parseInt(selectedIndex) === questionObj.correct;
        
        // Add a simple highlight to the selected button (no color coding for right/wrong)
        answerButtons[selectedIndex].classList.remove('btn-outline-primary');
        answerButtons[selectedIndex].classList.add('btn-primary');
        
        // Add a reaction emoji to the selected button
        const reactionEmoji = document.createElement('span');
        reactionEmoji.className = 'position-absolute top-0 end-0 translate-middle badge rounded-pill bg-secondary';
        reactionEmoji.innerHTML = questionObj.reactions[selectedIndex % questionObj.reactions.length];
        answerButtons[selectedIndex].style.position = 'relative';
        answerButtons[selectedIndex].appendChild(reactionEmoji);
        
        // Display funny response message regardless of correct/incorrect
        let responseMessage = isCorrect ? questionObj.responseCorrect : questionObj.responseWrong;
        
        // Show the funny response in a speech bubble
        gameMessage.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <span class="emoji-reaction fs-3 me-2">${questionObj.reactions[selectedIndex % questionObj.reactions.length]}</span>
                <strong>${selectedPersonName} says:</strong>
            </div>
            <div class="mt-2 p-3 bg-light rounded border border-secondary">
                <i class="fas fa-comment me-2 text-primary"></i>
                "${responseMessage}"
            </div>
        `;
        gameMessage.className = 'alert alert-info';
        
        // If answer is correct, add points (but don't tell the user)
        if (isCorrect) {
            score += 10;
            updateScore();
            
            // Small confetti celebration without telling why
            window.confetti({
                particleCount: 20,
                spread: 30,
                origin: { y: 0.7 }
            });
        }
        
        // Add a "Next Question" button
        const nextQuestionBtn = document.createElement('button');
        nextQuestionBtn.className = 'btn btn-lg btn-success mt-3 d-block mx-auto';
        nextQuestionBtn.innerHTML = '<i class="fas fa-arrow-right me-2"></i>Next Question';
        nextQuestionBtn.addEventListener('click', moveToNextQuestion);
        
        // Add the button to the answer container
        answerContainer.appendChild(document.createElement('hr'));
        answerContainer.appendChild(nextQuestionBtn);
    }
    
    function moveToNextQuestion() {
        currentQuestionIndex++;
        
        // Clear message
        gameMessage.textContent = '';
        
        if (currentQuestionIndex < questions.length) {
            // Show next question
            showQuestion(questions[currentQuestionIndex]);
            
            // Update progress
            updateProgress();
        } else {
            // All questions answered
            endGame(true);
        }
    }
    
    function updateScore() {
        scoreDisplay.textContent = score;
    }
    
    function updateTimer() {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // Visual warning when time is running low
        if (timer <= 15) {
            timerDisplay.classList.add('text-danger');
        } else {
            timerDisplay.classList.remove('text-danger');
        }
    }
    
    function updateQuestionTimer() {
        // Update the progress bar for the question timer
        const progressPercent = (questionTimer / 15) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Change color when time is running out
        if (questionTimer <= 5) {
            progressBar.classList.remove('bg-primary');
            progressBar.classList.add('bg-danger');
        } else {
            progressBar.classList.remove('bg-danger');
            progressBar.classList.add('bg-primary');
        }
    }
    
    function updateProgress() {
        const progressPercent = (currentQuestionIndex / totalQuestions) * 100;
        //progressBar.style.width = `${progressPercent}%`;
    }
    
    function endGame(isCompleted) {
        // Stop all timers
        clearInterval(timerInterval);
        clearInterval(questionInterval);
        
        gameStarted = false;
        
        // Calculate final score
        let finalScore = score;
        
        if (isCompleted) {
            // Add completion bonus
            const completionBonus = timer * 2;
            finalScore += completionBonus;
            
            gameMessage.innerHTML = `<span class="emoji-reaction">🎊</span> Quiz completed! Time bonus: +${completionBonus} <span class="emoji-reaction">🎁</span>`;
            gameMessage.className = 'alert alert-success';
            
            // Big celebration
            window.confetti({
                particleCount: 300,
                spread: 100,
                origin: { y: 0.6 }
            });
            
            // Funny feedback messages based on score
            let funnyMessage;
            let funnyIcon;
            
            if (finalScore > 200) {
                funnyMessage = "Are you secretly Google in human form? 🧠";
                funnyIcon = "🏆";
            } else if (finalScore > 150) {
                funnyMessage = "Impressive! Your brain cells are having a party! 🎉";
                funnyIcon = "🥇";
            } else if (finalScore > 100) {
                funnyMessage = "Not bad! Your brain is working better than our office Wi-Fi! 📶";
                funnyIcon = "🥈";
            } else if (finalScore > 50) {
                funnyMessage = "Well, at least you're better than our AI assistant after a power outage! 🔌";
                funnyIcon = "👍";
            } else {
                funnyMessage = "Hey, you finished! That's already better than most Zoom meetings! 📹";
                funnyIcon = "🎯";
            }
            
            Swal.fire({
                title: `${funnyIcon} Quiz Completed! ${funnyIcon}`,
                html: `<p>You scored <strong>${finalScore}</strong> points!</p><p>${funnyMessage}</p>`,
                icon: 'success',
                confirmButtonText: 'Play Again',
                showCancelButton: true,
                cancelButtonText: 'Main Menu'
            }).then((result) => {
                submitScore(finalScore);
                if (result.isConfirmed) {
                    startGame();
                } else {
                    showInstructions();
                }
            });
        } else {
            gameMessage.innerHTML = `<span class="emoji-reaction">⏰</span> Time's up! Final score: ${finalScore} <span class="emoji-reaction">💨</span>`;
            gameMessage.className = 'alert alert-warning';
            
            // Funny timeout messages
            let timeoutMessage;
            let timeoutIcon;
            
            if (currentQuestionIndex <= 2) {
                timeoutMessage = "Did you fall asleep on the keyboard? That was quick! ⌨️";
                timeoutIcon = "😴";
            } else if (currentQuestionIndex <= 5) {
                timeoutMessage = "Time management isn't your thing, is it? Just like our project deadlines! 📅";
                timeoutIcon = "⏱️";
            } else if (currentQuestionIndex <= 8) {
                timeoutMessage = "So close yet so far! Like trying to leave work at 5pm on a Friday!";
                timeoutIcon = "🏃";
            } else {
                timeoutMessage = "Almost made it! Like pretending to pay attention in the last 5 minutes of a meeting!";
                timeoutIcon = "👀";
            }
            
            Swal.fire({
                title: `${timeoutIcon} Time's Up! ${timeoutIcon}`,
                html: `<p>You answered <strong>${currentQuestionIndex}</strong> out of <strong>${totalQuestions}</strong> questions<br>and scored <strong>${finalScore}</strong> points.</p><p>${timeoutMessage}</p>`,
                icon: 'warning',
                confirmButtonText: 'Try Again',
                showCancelButton: true,
                cancelButtonText: 'Main Menu'
            }).then((result) => {
                submitScore(finalScore);
                if (result.isConfirmed) {
                    startGame();
                } else {
                    showInstructions();
                }
            });
        }
    }
    
    function showInstructions() {
        questionContainer.style.display = 'none';
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
                game: 'trivia_quiz',
                score: finalScore
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
