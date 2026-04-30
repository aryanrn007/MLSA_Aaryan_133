import { quizData } from './questions.js';
import { Leaderboard } from './leaderboard.js';
import { AudioSystem } from './audio.js';

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
};

const UI = {
    usernameInput: document.getElementById('username'),
    difficultySelect: document.getElementById('difficulty'),
    questionCount: document.getElementById('question-count'),
    scoreDisplay: document.getElementById('score-display'),
    timerDisplay: document.getElementById('timer'),
    progressBar: document.getElementById('progress-bar'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    nextBtn: document.getElementById('next-btn'),
    finalScore: document.getElementById('final-score'),
    resultMessage: document.getElementById('result-message'),
    leaderboardList: document.getElementById('leaderboard-list')
};

// Game State
let currentState = {
    username: 'Anonymous',
    difficulty: 'easy',
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    timer: null,
    timeLeft: 15,
    maxTime: 15,
    isAnswered: false
};

const leaderboard = new Leaderboard();
const audioSystem = new AudioSystem();

// Initialize App
function init() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('restart-btn').addEventListener('click', showStartScreen);
    
    // Leaderboard buttons
    document.getElementById('view-leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('result-leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('back-home-btn').addEventListener('click', showStartScreen);
    
    // Validate Input
    UI.usernameInput.addEventListener('input', (e) => {
        if(e.target.value.trim() !== '') {
            e.target.style.borderColor = 'var(--primary-color)';
        }
    });
}

function switchScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function showStartScreen() {
    switchScreen('start');
    UI.usernameInput.value = '';
}

function startGame() {
    const name = UI.usernameInput.value.trim();
    if (!name) {
        UI.usernameInput.style.borderColor = 'var(--incorrect-color)';
        // Shake animation
        UI.usernameInput.parentElement.style.animation = 'shake 0.4s ease';
        setTimeout(() => UI.usernameInput.parentElement.style.animation = '', 400);
        return;
    }

    currentState.username = name;
    currentState.difficulty = UI.difficultySelect.value;
    currentState.score = 0;
    currentState.currentQuestionIndex = 0;
    
    // Set timer based on difficulty
    currentState.maxTime = currentState.difficulty === 'easy' ? 15 : (currentState.difficulty === 'medium' ? 10 : 5);
    
    // Shuffle and select questions
    const allQuestions = [...quizData[currentState.difficulty]];
    currentState.questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5); // Take 5 random questions

    switchScreen('quiz');
    loadQuestion();
}

function loadQuestion() {
    clearInterval(currentState.timer);
    currentState.isAnswered = false;
    UI.nextBtn.style.display = 'none';
    
    const question = currentState.questions[currentState.currentQuestionIndex];
    UI.questionCount.textContent = `Question ${currentState.currentQuestionIndex + 1}/${currentState.questions.length}`;
    UI.scoreDisplay.textContent = currentState.score;
    UI.questionText.textContent = question.question;
    
    // Render Options
    UI.optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;
        btn.onclick = () => handleAnswer(index, btn);
        UI.optionsContainer.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    currentState.timeLeft = currentState.maxTime;
    updateTimerUI();
    
    currentState.timer = setInterval(() => {
        currentState.timeLeft--;
        updateTimerUI();
        
        if (currentState.timeLeft <= 0) {
            clearInterval(currentState.timer);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerUI() {
    UI.timerDisplay.textContent = currentState.timeLeft;
    
    // Change color if time is low (<30%)
    if (currentState.timeLeft <= currentState.maxTime * 0.3) {
        UI.timerDisplay.style.color = 'var(--incorrect-color)';
    } else {
        UI.timerDisplay.style.color = 'var(--primary-color)';
    }

    // Progress Bar width
    const percentage = (currentState.timeLeft / currentState.maxTime) * 100;
    UI.progressBar.style.width = `${percentage}%`;
}

function handleAnswer(selectedIndex, btnElement) {
    if (currentState.isAnswered) return;
    currentState.isAnswered = true;
    clearInterval(currentState.timer);

    const question = currentState.questions[currentState.currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;
    
    const allOptions = UI.optionsContainer.children;
    
    // Highlight selected
    if (isCorrect) {
        btnElement.classList.add('correct');
        currentState.score += 10 * currentState.timeLeft; // Score based on time left
        audioSystem.playCorrect();
    } else {
        btnElement.classList.add('incorrect');
        allOptions[question.correct].classList.add('correct');
        audioSystem.playIncorrect();
    }
    
    // Disable all options
    Array.from(allOptions).forEach(btn => btn.disabled = true);
    
    UI.scoreDisplay.textContent = currentState.score;
    UI.nextBtn.style.display = 'block';
}

function handleTimeOut() {
    if (currentState.isAnswered) return;
    currentState.isAnswered = true;
    audioSystem.playTimeout();
    
    const question = currentState.questions[currentState.currentQuestionIndex];
    const allOptions = UI.optionsContainer.children;
    
    // Highlight correct answer
    allOptions[question.correct].classList.add('correct');
    
    // Disable all options
    Array.from(allOptions).forEach(btn => btn.disabled = true);
    
    UI.nextBtn.style.display = 'block';
    
    // Auto move to next question after 2 seconds
    setTimeout(() => {
        if (screens.quiz.classList.contains('active')) {
            nextQuestion();
        }
    }, 2000);
}

function nextQuestion() {
    currentState.currentQuestionIndex++;
    
    if (currentState.currentQuestionIndex < currentState.questions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    clearInterval(currentState.timer);
    
    // Save to leaderboard
    leaderboard.addScore(currentState.username, currentState.score, currentState.difficulty);
    
    switchScreen('result');
    UI.finalScore.textContent = currentState.score;
    
    // Set message based on score
    const maxPossibleScore = currentState.questions.length * 10 * currentState.maxTime;
    const percentage = currentState.score / maxPossibleScore;
    
    if (percentage > 0.8) UI.resultMessage.textContent = "Outstanding Performance! 🏆";
    else if (percentage > 0.5) UI.resultMessage.textContent = "Good Job! 👍";
    else UI.resultMessage.textContent = "Keep Practicing! 💪";
}

function showLeaderboard() {
    switchScreen('leaderboard');
    UI.leaderboardList.innerHTML = '';
    
    const scores = leaderboard.getScores();
    
    if (scores.length === 0) {
        UI.leaderboardList.innerHTML = '<li style="text-align: center; color: var(--text-color); opacity: 0.6;">No scores yet. Play a game to be the first!</li>';
        return;
    }
    
    scores.forEach((entry, index) => {
        const li = document.createElement('li');
        li.classList.add('leaderboard-item');
        
        let medal = '';
        if (index === 0) medal = '🥇 ';
        else if (index === 1) medal = '🥈 ';
        else if (index === 2) medal = '🥉 ';
        else medal = `${index + 1}. `;

        li.innerHTML = `
            <div>
                <strong>${medal}${entry.name}</strong>
                <span style="font-size: 0.8rem; opacity: 0.6; margin-left: 10px;">${entry.difficulty.toUpperCase()}</span>
            </div>
            <div class="score-details">
                <strong>${entry.score} pts</strong>
            </div>
        `;
        UI.leaderboardList.appendChild(li);
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);
