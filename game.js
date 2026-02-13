// Background Lines Generator
function createBackgroundLines() {
    const container = document.getElementById('bgLines');
    const lineCount = 15;
    
    for (let i = 0; i < lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'line';
        line.style.left = `${(i / lineCount) * 100}%`;
        line.style.animationDelay = `${Math.random() * 3}s`;
        line.style.animationDuration = `${2 + Math.random() * 2}s`;
        container.appendChild(line);
    }
}

// Encrypted Text Effect
function encryptedTextEffect() {
    const element = document.getElementById('encryptedText');
    const targetText = "Prepare for Battle, Player One.";
    const chars = "█▓▒░ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    let revealed = 0;
    let iterations = 0;

    const interval = setInterval(() => {
        let displayText = "";
        
        for (let i = 0; i < targetText.length; i++) {
            if (i < revealed) {
                displayText += targetText[i];
            } else {
                displayText += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        element.textContent = displayText;
        
        if (iterations % 3 === 0) {
            revealed++;
        }
        
        iterations++;
        
        if (revealed > targetText.length) {
            element.classList.add('revealed');
            clearInterval(interval);
        }
    }, 50);
}

// Game Variables
let gameActive = false;
let score = 0;
let lives = 3;
let level = 1;
let playerPos = 50;
let enemies = [];
let bullets = [];
let gameLoop;
let enemySpawnRate = 2000;

const gameCanvas = document.getElementById('gameCanvas');
const player = document.getElementById('player');
const startBtn = document.getElementById('startBtn');
const gameOverDiv = document.getElementById('gameOver');

// Player Movement
let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameActive) {
        e.preventDefault();
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function updatePlayerPosition() {
    if (keys['ArrowLeft'] && playerPos > 0) {
        playerPos -= 2;
    }
    if (keys['ArrowRight'] && playerPos < 100) {
        playerPos += 2;
    }
    player.style.left = playerPos + '%';
}

// Shoot Bullet
function shootBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = playerPos + '%';
    bullet.style.bottom = '60px';
    gameCanvas.appendChild(bullet);
    bullets.push({element: bullet, y: 340});
}

// Spawn Enemy
function spawnEnemy() {
    if (!gameActive) return;
    
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    const x = Math.random() * 90;
    enemy.style.left = x + '%';
    enemy.style.top = '-30px';
    gameCanvas.appendChild(enemy);
    enemies.push({element: enemy, x: x, y: -30});

    setTimeout(spawnEnemy, enemySpawnRate / level);
}

// Create Explosion Particles
function createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + '%';
        particle.style.top = y + 'px';
        gameCanvas.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 2;
        let px = parseFloat(x);
        let py = y;

        const particleInterval = setInterval(() => {
            px += Math.cos(angle) * velocity;
            py += Math.sin(angle) * velocity;
            particle.style.left = px + '%';
            particle.style.top = py + 'px';
        }, 16);

        setTimeout(() => {
            clearInterval(particleInterval);
            particle.remove();
        }, 500);
    }
}

// Game Loop
function gameUpdate() {
    if (!gameActive) return;

    updatePlayerPosition();

    // Update Bullets
    bullets = bullets.filter(bullet => {
        bullet.y -= 5;
        bullet.element.style.bottom = (400 - bullet.y) + 'px';

        if (bullet.y < 0) {
            bullet.element.remove();
            return false;
        }
        return true;
    });

    // Update Enemies
    enemies = enemies.filter(enemy => {
        enemy.y += 1 + (level * 0.3);
        enemy.element.style.top = enemy.y + 'px';

        // Check collision with bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bulletX = playerPos;
            const bulletY = bullets[i].y;
            const dx = Math.abs(bulletX - enemy.x);
            const dy = Math.abs(bulletY - enemy.y);

            if (dx < 5 && dy < 20) {
                // Hit!
                createExplosion(enemy.x, enemy.y);
                enemy.element.remove();
                bullets[i].element.remove();
                bullets.splice(i, 1);
                score += 10;
                document.getElementById('score').textContent = score;

                // Level up
                if (score % 100 === 0) {
                    level++;
                    document.getElementById('level').textContent = level;
                }

                return false;
            }
        }

        // Check if enemy reached bottom
        if (enemy.y > 400) {
            enemy.element.remove();
            lives--;
            document.getElementById('lives').textContent = lives;

            if (lives <= 0) {
                endGame();
            }
            return false;
        }

        return true;
    });
}

// Start Game
function startGame() {
    gameActive = true;
    score = 0;
    lives = 3;
    level = 1;
    playerPos = 50;
    enemies = [];
    bullets = [];

    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;

    gameOverDiv.classList.remove('show');
    startBtn.textContent = 'RESTART';

    // Clear existing elements
    document.querySelectorAll('.enemy, .bullet, .particle').forEach(el => el.remove());

    spawnEnemy();
    gameLoop = setInterval(gameUpdate, 16);
}

// End Game
function endGame() {
    gameActive = false;
    clearInterval(gameLoop);
    gameOverDiv.classList.add('show');
    startBtn.textContent = 'PLAY AGAIN';
}

// Event Listeners
startBtn.addEventListener('click', startGame);

// Initialize
createBackgroundLines();
setTimeout(encryptedTextEffect, 500);