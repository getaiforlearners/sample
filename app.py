import os
import logging
import uuid
import json
from datetime import datetime
from flask import Flask, render_template, redirect, url_for, session, request, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Set up the memories directory
MEMORIES_DIR = 'memories'
os.makedirs(MEMORIES_DIR, exist_ok=True)

# Load farewell information
farewell_config_path = os.path.join(MEMORIES_DIR, 'farewell_config.json')
if os.path.exists(farewell_config_path):
    try:
        with open(farewell_config_path, 'r') as f:
            farewell_info = json.load(f)
            app.config['FAREWELL_PERSON'] = farewell_info.get('farewell_person', 'Colleague')
            app.config['FAREWELL_MESSAGE'] = farewell_info.get('farewell_message', "We'll miss you!")
    except:
        # Default farewell information if config can't be loaded
        app.config['FAREWELL_PERSON'] = "Colleague"
        app.config['FAREWELL_MESSAGE'] = "We'll miss you!"
else:
    # Default farewell information if no config exists
    app.config['FAREWELL_PERSON'] = "Colleague"
    app.config['FAREWELL_MESSAGE'] = "We'll miss you!"

# File paths for data storage
USERS_FILE = os.path.join(MEMORIES_DIR, 'users.json')
SCORES_FILE = os.path.join(MEMORIES_DIR, 'scores.json')

# Initialize data storage
def load_data():
    global users, leaderboards
    
    # Load users if file exists
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r') as f:
                users = json.load(f)
                # Convert string dates back to datetime objects
                for username in users:
                    if 'join_date' in users[username]:
                        users[username]['join_date'] = datetime.fromisoformat(users[username]['join_date'])
        except:
            users = {}
    else:
        users = {}  # {username: {password_hash, email, profile_pic, bio, join_date}}
    
    # Load leaderboards if file exists
    if os.path.exists(SCORES_FILE):
        try:
            with open(SCORES_FILE, 'r') as f:
                leaderboards = json.load(f)
                # Convert string dates back to datetime objects
                for game in leaderboards:
                    for i in range(len(leaderboards[game])):
                        if 'date' in leaderboards[game][i]:
                            leaderboards[game][i]['date'] = datetime.fromisoformat(leaderboards[game][i]['date'])
        except:
            # Initialize with default game types
            leaderboards = {
                'memory_game': [],      # [{username, score, date}]
                'word_puzzle': [],      # [{username, score, date}]
                'trivia_quiz': [],      # [{username, score, date}]
                'hangman': [],          # New games will be added here
                'snake_game': [],
                'tic_tac_toe': [],
                'photo_puzzle': [],
                'quiz_show': [],
                'riddle_game': [],
                'typing_race': [],
                'minesweeper': [],
                'card_match': [],
                'jigsaw_puzzle': [],
                'number_match': [],
                'color_memory': [],
                'pattern_recognition': [],
                'sequence_memory': [],
                'reaction_time': [],
                'word_search': [],
                'math_challenge': []
            }
    else:
        # Initialize with all game types
        leaderboards = {
            'memory_game': [],      # [{username, score, date}]
            'word_puzzle': [],      # [{username, score, date}]
            'trivia_quiz': [],      # [{username, score, date}]
            'hangman': [],          # New games
            'snake_game': [],
            'tic_tac_toe': [],
            'photo_puzzle': [],
            'quiz_show': [],
            'riddle_game': [],
            'typing_race': [],
            'minesweeper': [],
            'card_match': [],
            'jigsaw_puzzle': [],
            'number_match': [],
            'color_memory': [],
            'pattern_recognition': [],
            'sequence_memory': [],
            'reaction_time': [],
            'word_search': [],
            'math_challenge': []
        }

# Save data to files
def save_data():
    # Save users
    with open(USERS_FILE, 'w') as f:
        # Convert datetime objects to ISO format strings for JSON serialization
        users_json = {}
        for username, user_data in users.items():
            users_json[username] = user_data.copy()
            if 'join_date' in users_json[username]:
                users_json[username]['join_date'] = users_json[username]['join_date'].isoformat()
        json.dump(users_json, f)
    
    # Save leaderboards
    with open(SCORES_FILE, 'w') as f:
        # Convert datetime objects to ISO format strings for JSON serialization
        leaderboards_json = {}
        for game, scores in leaderboards.items():
            leaderboards_json[game] = []
            for score in scores:
                score_copy = score.copy()
                if 'date' in score_copy:
                    score_copy['date'] = score_copy['date'].isoformat()
                leaderboards_json[game].append(score_copy)
        json.dump(leaderboards_json, f)

# Load initial data
load_data()

# Active users tracking
active_users = {}  # {username: {last_active, current_game}}

# Routes
@app.route('/')
def index():
    if 'username' in session:
        return render_template('index.html', 
                             username=session['username'],
                             active_users=active_users,
                             farewell_person=app.config['FAREWELL_PERSON'],
                             farewell_message=app.config['FAREWELL_MESSAGE'])
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Validation
        if username in users:
            flash('Username already exists!', 'danger')
            return render_template('register.html',
                                farewell_person=app.config['FAREWELL_PERSON'],
                                farewell_message=app.config['FAREWELL_MESSAGE'])
        
        if not username or not email or not password:
            flash('All fields are required!', 'danger')
            return render_template('register.html',
                                farewell_person=app.config['FAREWELL_PERSON'],
                                farewell_message=app.config['FAREWELL_MESSAGE'])
        
        # Create new user
        users[username] = {
            'password_hash': generate_password_hash(password),
            'email': email,
            'profile_pic': f'https://avatars.dicebear.com/api/personas/{username}.svg',
            'bio': f'Hi! I\'m {username}.',
            'join_date': datetime.now()
        }
        
        # Save the updated user data to file
        save_data()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
        
    return render_template('register.html',
                         farewell_person=app.config['FAREWELL_PERSON'],
                         farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username not in users:
            flash('Invalid username or password', 'danger')
            return render_template('login.html')
        
        if check_password_hash(users[username]['password_hash'], password):
            session['username'] = username
            active_users[username] = {
                'last_active': datetime.now(),
                'current_game': None
            }
            flash(f'Welcome back, {username}!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password', 'danger')
    
    return render_template('login.html', 
                         farewell_person=app.config['FAREWELL_PERSON'],
                         farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/logout')
def logout():
    if 'username' in session:
        username = session['username']
        if username in active_users:
            del active_users[username]
        session.pop('username', None)
        flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    user_data = users[username]
    
    if request.method == 'POST':
        bio = request.form['bio']
        users[username]['bio'] = bio
        # Save the updated user data to file
        save_data()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('profile'))
    
    # Get user's scores across all games
    user_scores = {
        'memory_game': next((s['score'] for s in leaderboards['memory_game'] if s['username'] == username), 0),
        'word_puzzle': next((s['score'] for s in leaderboards['word_puzzle'] if s['username'] == username), 0),
        'trivia_quiz': next((s['score'] for s in leaderboards['trivia_quiz'] if s['username'] == username), 0)
    }
    
    return render_template('profile.html', 
                        user=user_data, 
                        username=username, 
                        scores=user_scores,
                        farewell_person=app.config['FAREWELL_PERSON'],
                        farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/leaderboard')
def leaderboard():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    # Sort leaderboards by score
    sorted_leaderboards = {
        'memory_game': sorted(leaderboards['memory_game'], key=lambda x: x['score'], reverse=True)[:10],
        'word_puzzle': sorted(leaderboards['word_puzzle'], key=lambda x: x['score'], reverse=True)[:10],
        'trivia_quiz': sorted(leaderboards['trivia_quiz'], key=lambda x: x['score'], reverse=True)[:10]
    }
    
    return render_template('leaderboard.html', 
                         leaderboards=sorted_leaderboards, 
                         username=session['username'],
                         farewell_person=app.config['FAREWELL_PERSON'],
                         farewell_message=app.config['FAREWELL_MESSAGE'])

# Game Routes
@app.route('/games/memory-game')
def memory_game():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'memory_game'
    
    return render_template('games/memory_game.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/word-puzzle')
def word_puzzle():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'word_puzzle'
    
    return render_template('games/word_puzzle.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/trivia-quiz')
def trivia_quiz():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'trivia_quiz'
    
    return render_template('games/trivia_quiz.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

# Additional game routes
@app.route('/games/2048-game')
def game_2048():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = '2048_game'
    
    return render_template('games/2048_game.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/pong-game')
def pong_game():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'pong_game'
    
    return render_template('games/pong_game.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/tetris-game')
def tetris_game():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'tetris_game'
    
    return render_template('games/tetris_game.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/hangman')
def hangman():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'hangman'
    
    return render_template('games/hangman.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/snake-game')
def snake_game():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'snake_game'
    
    return render_template('games/snake_game.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/tic-tac-toe')
def tic_tac_toe():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'tic_tac_toe'
    
    return render_template('games/tic_tac_toe.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/photo-puzzle')
def photo_puzzle():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'photo_puzzle'
    
    return render_template('games/photo_puzzle.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/quiz-show')
def quiz_show():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'quiz_show'
    
    return render_template('games/quiz_show.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/riddle-game')
def riddle_game():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'riddle_game'
    
    return render_template('games/riddle_game.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/typing-race')
def typing_race():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'typing_race'
    
    return render_template('games/typing_race.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/minesweeper')
def minesweeper():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'minesweeper'
    
    return render_template('games/minesweeper.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/card-match')
def card_match():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'card_match'
    
    return render_template('games/card_match.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/jigsaw-puzzle')
def jigsaw_puzzle():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'jigsaw_puzzle'
    
    return render_template('games/jigsaw_puzzle.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/number-match')
def number_match():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'number_match'
    
    return render_template('games/number_match.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/color-memory')
def color_memory():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'color_memory'
    
    return render_template('games/color_memory.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/pattern-recognition')
def pattern_recognition():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'pattern_recognition'
    
    return render_template('games/pattern_recognition.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/sequence-memory')
def sequence_memory():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'sequence_memory'
    
    return render_template('games/sequence_memory.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/reaction-time')
def reaction_time():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'reaction_time'
    
    return render_template('games/reaction_time.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/word-search')
def word_search():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'word_search'
    
    return render_template('games/word_search.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

@app.route('/games/math-challenge')
def math_challenge():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    username = session['username']
    active_users[username]['current_game'] = 'math_challenge'
    
    return render_template('games/math_challenge.html', 
                          username=username,
                          farewell_person=app.config['FAREWELL_PERSON'],
                          farewell_message=app.config['FAREWELL_MESSAGE'])

# API Routes for games
@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'Not logged in'}), 401
    
    data = request.json
    username = session['username']
    game = data.get('game')
    score = data.get('score')
    
    if not game or score is None:
        return jsonify({'status': 'error', 'message': 'Missing game or score'}), 400
    
    # Add score to leaderboard
    leaderboards[game].append({
        'username': username,
        'score': score,
        'date': datetime.now()
    })
    
    # Save the updated leaderboards to file
    save_data()
    
    # Get user rank for this score
    sorted_scores = sorted(leaderboards[game], key=lambda x: x['score'], reverse=True)
    rank = next((i+1 for i, s in enumerate(sorted_scores) if s['username'] == username), 0)
    
    return jsonify({
        'status': 'success', 
        'message': 'Score submitted', 
        'rank': rank,
        'total_players': len(set(s['username'] for s in leaderboards[game]))
    })

@app.route('/api/active-users')
def get_active_users():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'Not logged in'}), 401
    
    # Update current user's last active timestamp
    username = session['username']
    active_users[username]['last_active'] = datetime.now()
    
    # Remove users inactive for more than 10 minutes
    current_time = datetime.now()
    for user in list(active_users.keys()):
        if (current_time - active_users[user]['last_active']).seconds > 600:  # 10 minutes
            del active_users[user]
    
    return jsonify({
        'status': 'success',
        'active_users': [{'username': u, 'game': active_users[u]['current_game']} 
                        for u in active_users]
    })

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', 
                         farewell_person=app.config['FAREWELL_PERSON'],
                         farewell_message=app.config['FAREWELL_MESSAGE']), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html',
                         farewell_person=app.config['FAREWELL_PERSON'],
                         farewell_message=app.config['FAREWELL_MESSAGE']), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
