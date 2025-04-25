document.addEventListener('DOMContentLoaded', function() {
    // Poll for active users every 10 seconds
    if (document.querySelector('.active-users-list')) {
        setInterval(updateActiveUsers, 10000);
        updateActiveUsers(); // Initial update
    }
    
    // Add celebratory effects to certain elements
    addCelebratoryEffects();
});

// Function to update active users list
function updateActiveUsers() {
    fetch('/api/active-users')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const activeUsersList = document.querySelector('.active-users-list');
                if (activeUsersList) {
                    activeUsersList.innerHTML = '';
                    
                    if (data.active_users.length === 0) {
                        const emptyMessage = document.createElement('li');
                        emptyMessage.className = 'list-group-item text-muted';
                        emptyMessage.textContent = 'No users online';
                        activeUsersList.appendChild(emptyMessage);
                    } else {
                        data.active_users.forEach(user => {
                            const listItem = document.createElement('li');
                            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                            
                            const nameSpan = document.createElement('span');
                            nameSpan.textContent = user.username;
                            
                            // Add badge if user is in a game
                            if (user.game) {
                                listItem.classList.add('list-group-item-action');
                                
                                const badge = document.createElement('span');
                                badge.className = 'badge bg-primary rounded-pill';
                                
                                let gameName;
                                switch(user.game) {
                                    case 'memory_game':
                                        gameName = 'Memory Game';
                                        badge.className = 'badge bg-info rounded-pill';
                                        break;
                                    case 'word_puzzle':
                                        gameName = 'Word Puzzle';
                                        badge.className = 'badge bg-success rounded-pill';
                                        break;
                                    case 'trivia_quiz':
                                        gameName = 'Trivia Quiz';
                                        badge.className = 'badge bg-warning rounded-pill';
                                        break;
                                    default:
                                        gameName = 'Playing';
                                }
                                
                                badge.textContent = gameName;
                                listItem.appendChild(badge);
                            }
                            
                            listItem.prepend(nameSpan);
                            activeUsersList.appendChild(listItem);
                        });
                    }
                }
            }
        });
}

// Add celebratory effects to various UI elements
function addCelebratoryEffects() {
    // Add confetti effect to game card links
    const gameCards = document.querySelectorAll('.game-card');
    
    if (gameCards) {
        gameCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const cardRect = card.getBoundingClientRect();
                const x = (cardRect.left + cardRect.right) / 2 / window.innerWidth;
                const y = (cardRect.top + cardRect.bottom) / 2 / window.innerHeight;
                
                window.confetti({
                    particleCount: 20,
                    spread: 50,
                    origin: { x, y }
                });
            });
        });
    }
    
    // Add surprise effect to profile image
    const profileImg = document.querySelector('.profile-image');
    
    if (profileImg) {
        let clickCount = 0;
        profileImg.addEventListener('click', function() {
            clickCount++;
            
            if (clickCount >= 3) {
                Swal.fire({
                    title: 'Surprise!',
                    text: 'You found a secret! Keep clicking for more fun!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
                
                window.confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                
                clickCount = 0;
            }
        });
    }
    
    // Add celebratory message to farewell page
    const farewellMessage = document.querySelector('.farewell-message');
    
    if (farewellMessage) {
        // Trigger confetti when the page loads
        setTimeout(() => {
            window.confetti({
                particleCount: 200,
                spread: 180,
                origin: { y: 0.6 }
            });
        }, 1000);
    }
}

// Function to show a surprise message
function showSurpriseMessage() {
    const surprises = [
        "We'll miss your awesome sense of humor!",
        "Remember all the good times we shared!",
        "Your new workplace is lucky to have you!",
        "Don't forget to stay in touch!",
        "You made our workplace better!",
        "Wishing you all the best in your next adventure!",
        "Your contribution to our team was invaluable!",
        "We hope your new job is amazing!",
        "You've left big shoes to fill!"
    ];
    
    const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
    
    Swal.fire({
        title: 'Surprise Message!',
        text: randomSurprise,
        icon: 'info',
        confirmButtonText: 'Thanks!'
    });
    
    window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}
