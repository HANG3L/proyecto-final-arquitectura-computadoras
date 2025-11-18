class MemoryGame {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.maxAttempts = this.getMaxAttempts();
        this.attemptsLeft = this.maxAttempts;
        this.maxTime = this.getMaxTime();
        this.timeLeft = this.maxTime;
        this.timer = null;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.timeToShow = this.getTimetoShow();
        console.log(`🎮 Iniciando juego en dificultad: ${difficulty}`);
        this.initializeGame();
    }
    
    // Método simplificado para reproducir sonidos
    playSound(type) {
        if (window.audioManager && window.audioManager.isEnabled()) {
            window.audioManager.play(type);
            console.log('🔊 Sonido:', type);
        }
    }

    getMaxAttempts() {
        const attempts = {
            'basic': 6,
            'medium': 4,
            'advanced': 2
        };
        return attempts[this.difficulty] || 6;
    }

    getTimetoShow(){
        const times = {
            'basic': 10000,
            'medium': 7000,
            'advanced': 5000
        };
        return times[this.difficulty] || 3000;
    }
    
    getMaxTime() {
        const times = {
            'basic': 180,  // 3 minutos
            'medium': 120, // 2 minutos
            'advanced': 60  // 1 minuto
        };
        return times[this.difficulty] || 60;
    }

    // Mostrar todas las cartas brevemente al inicio
    showCardsPreview() {
        setTimeout(() => {
            this.cards.forEach((card, index) => {
                setTimeout(() => {
                    const cardElement = document.querySelector(`[data-id="${card.uniqueId}"]`);
                    if (cardElement) {
                        cardElement.classList.add('flipped');
                        cardElement.classList.add('locked');
                        this.playSound("flip");
                        setTimeout(() => {
                            if (!card.matched) {
                                cardElement.classList.remove('flipped');
                                cardElement.classList.remove('locked');
                                this.playSound("flip");
                            }
                        }, this.timeToShow); // Mostrar por 5 segundos
                    }
                }, index * 100); // Efecto cascada
            });
        }, 500);
    }

    showStartModal() {
        const timeText = this.formatTime(this.maxTime);
        const pairsText = this.cards.length / 2;
        const attemptsText = this.maxAttempts;
        
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.id = 'startModal';
        modal.innerHTML = `
            <div class="modal-content success">
                <h3>🎮 ¡Memoriza los Pokémon!</h3>
                <p>Encontrarás <strong>${pairsText} pares</strong> de Pokémon</p>
                <div class="game-rules">
                    <div class="rule">⏱️ <strong>Tiempo:</strong> ${timeText}</div>
                    <div class="rule">❤️ <strong>Vidas:</strong> ${attemptsText}</div>
                    <div class="rule">🎯 <strong>Dificultad:</strong> ${this.difficulty}</div>
                </div>
                <p>Las cartas se mostrarán por ${this.timeToShow/1000} segundos cuando hagas click en "Comenzar"</p>
                <button onclick="window.memoryGame.startGameWithPreview()" class="btn-start">
                    ¡Comenzar Partida!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    startGameWithPreview() {
        // Remover modal de inicio
        const startModal = document.getElementById('startModal');
        if (startModal) {
            startModal.remove();
        }
        
        // Marcar que el usuario interactuó (permite sonidos)
        this.userInteracted = true;
        
        // Iniciar el juego
        this.gameStarted = true;
        this.startTimer();
        
        // Mostrar preview de cartas con sonidos
        this.showCardsPreview();
        
        console.log('⏱️ Juego iniciado, preview activado');
    }
    
    async initializeGame() {
        console.log('🔄 Inicializando juego...');
        this.showLoadingScreen();
        
        try {
            await this.loadPokemonCards();
            this.hideLoadingScreen();
            this.setupGameBoard();
            this.updateHearts();
            this.updateUI();

            this.showStartModal();
            console.log('✅ Juego inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando juego:', error);
            this.hideLoadingScreen();
            this.showError('Error cargando el juego. Recarga la página.');
        }
    }
    
    async loadPokemonCards() {
        console.log('🔄 Cargando cartas Pokémon...');
        
        // Verificar que PokemonAPI esté disponible
        if (typeof PokemonAPI === 'undefined') {
            throw new Error('PokemonAPI no está definida');
        }
        
        const pokemonList = await PokemonAPI.fetchPokemonCards(8);
        console.log('📦 Pokémon obtenidos:', pokemonList);
        
        // Duplicate cards for pairs and shuffle
        this.cards = [...pokemonList, ...pokemonList]
            .map((card, index) => ({
                ...card,
                uniqueId: index,
                flipped: false,
                matched: false
            }))
            .sort(() => Math.random() - 0.5);
        
        console.log(`🎴 ${this.cards.length} cartas creadas:`, this.cards);
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
    
    showError(message) {
        alert(`Error: ${message}`);
    }
    
    updateHearts() {
        const heartsContainer = document.getElementById('heartsContainer');
        if (!heartsContainer) {
            console.error('No se encontró el contenedor de corazones');
            return;
        }
        
        heartsContainer.innerHTML = '';
        
        // SIEMPRE mostrar 6 espacios de corazón para mantener diseño consistente
        const totalHeartsToShow = 6;
        
        for (let i = 0; i < totalHeartsToShow; i++) {
            const heart = document.createElement('span');
            
            if (i < this.attemptsLeft) {
                // Corazón activo (vidas restantes)
                heart.className = 'heart active';
                heart.innerHTML = '❤️';
                heart.title = `${this.attemptsLeft - i} vida(s) restante(s)`;
            } else if (i < this.maxAttempts) {
                // Corazón perdido (pero dentro del máximo de intentos)
                heart.className = 'heart inactive';
                heart.innerHTML = '💔';
                heart.title = 'Vida perdida';
            } else {
                // Espacio vacío (para dificultades con menos de 6 intentos)
                heart.className = 'heart empty';
                heart.innerHTML = '🤍';
                heart.title = 'No disponible en esta dificultad';
            }
            
            heartsContainer.appendChild(heart);
        }
        
        console.log(`❤️ ${this.attemptsLeft}/${this.maxAttempts} corazones (mostrando 6 espacios)`);
    }
    
    setupGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) {
            console.error('❌ No se encontró el tablero de juego');
            return;
        }
        
        console.log('🔄 Configurando tablero de juego...');
        gameBoard.innerHTML = '';
        
        if (this.cards.length === 0) {
            console.error('❌ No hay cartas para mostrar');
            gameBoard.innerHTML = '<p>Error: No se pudieron cargar las cartas</p>';
            return;
        }
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-game locked';
            cardElement.dataset.id = card.uniqueId;
            
            const pokemonImage = card.image || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
            
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball">
                    </div>
                    <div class="card-back">
                        <img src="${pokemonImage}" alt="${card.name}" 
                             onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                        <p>${card.name}</p>
                    </div>
                </div>
            `;
            
            cardElement.addEventListener('click', () => {
                console.log(`🃏 Click en carta ${index}: ${card.name}`);
                this.flipCard(cardElement, card);
            });
            
            gameBoard.appendChild(cardElement);
        });
        
        console.log(`✅ Tablero configurado con ${this.cards.length} cartas`);
    }
    
    flipCard(cardElement, card) {
        if (!this.gameStarted) {
            this.startGame();
        }
        
        if (this.flippedCards.length === 2 || card.flipped || card.matched || this.gameCompleted) {
            console.log('❌ No se puede voltear la carta');
            return;
        }
        
        console.log(`🔄 Volteando carta: ${card.name}`);

        this.playSound('flip');
        
        card.flipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push({ element: cardElement, card: card });
        
        if (this.flippedCards.length === 2) {
            setTimeout(() => {
                this.checkMatch();
            }, 500);
        }
    }
    
    checkMatch() {
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];
        
        console.log(`🔍 Verificando match: ${card1.card.name} vs ${card2.card.name}`);
        
        if (card1.card.id === card2.card.id) {
            console.log('🎉 ¡Match encontrado!');
            this.playSound('match');
            card1.card.matched = true;
            card2.card.matched = true;
            this.matchedPairs++;
            
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            
            this.playSound('match');
            
            if (this.matchedPairs === 8) {
                setTimeout(() => {
                    this.endGame('win');
                }, 500);
            }
        } else {
            console.log('💔 No hay match');
            this.playSound('mismatch');
            this.attemptsLeft--;
            this.updateHearts();
            this.updateUI();
            this.playSound('mismatch');
            
            setTimeout(() => {
                card1.card.flipped = false;
                card2.card.flipped = false;
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                
                if (this.attemptsLeft <= 0) {
                    this.endGame('no_lives');
                }
            }, 1000);
        }
        
        this.flippedCards = [];
    }
    
    startGame() {
        this.gameStarted = true;
        this.startTimer();
        console.log('⏱️ Juego iniciado, temporizador activado');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame('time_up');
            }
        }, 1000);
    }
    
    endGame(reason) {
        clearInterval(this.timer);
        this.gameCompleted = true;
        
        const won = reason === 'win';
        console.log(`🎯 Juego terminado: ${reason}, ganó: ${won}`);

         // 🔊 SONIDO DE VICTORIA/DERROTA
        if (won) {
            this.playSound('win');
        } else {
            this.playSound('lose');
        }
        
        this.showGameResult(reason, won);
        this.saveGameResult(won);
    }
    
    showGameResult(reason, won) {
        const messages = {
            'win': {
                title: '🎉 ¡Felicidades!',
                message: '¡Has ganado el juego! Encontraste todos los pares Pokémon.',
                type: 'success'
            },
            'time_up': {
                title: '⏰ Tiempo Agotado',
                message: 'Se te acabó el tiempo. ¡Inténtalo de nuevo!',
                type: 'warning'
            },
            'no_lives': {
                title: '💔 Vidas Agotadas',
                message: 'Se te acabaron los intentos. ¡Sigue practicando!',
                type: 'error'
            }
        };
        
        const result = messages[reason];
        this.showCustomAlert(result.title, result.message, result.type);
    }
    
    showCustomAlert(title, message, type) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content ${type}">
                <h3>${title}</h3>
                <p>${message}</p>
                <button onclick="this.closest('.custom-modal').remove(); location.href='/difficulty/'">
                    Volver al Menú
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    async saveGameResult(won) {
        const attemptsUsed = this.maxAttempts - this.attemptsLeft;
        const timeTaken = this.maxTime - this.timeLeft;
        
        try {
            const response = await fetch('/save_game_result/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({
                    difficulty: this.difficulty,
                    won: won,
                    attempts_used: attemptsUsed,
                    time_taken: timeTaken
                })
            });
            
            const result = await response.json();
            console.log('💾 Resultado guardado:', result);
            
            if (result.success) {
                setTimeout(() => {
                    this.showTrophyMessage(
                        result.trophies_earned, 
                        result.total_trophies, 
                        result.won,
                        result.previous_trophies
                    );
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Error guardando resultado:', error);
        }
    }
    
    showTrophyMessage(trophiesChange, totalTrophies, won, previousTrophies) {
        let message, title;
        
        if (won) {
            title = '🏆 ¡Victoria!';
            message = `¡Ganaste ${trophiesChange} trofeos!<br>Total: ${totalTrophies} trofeos`;
        } else {
            if (trophiesChange < 0) {
                title = '💔 Derrota';
                message = `Perdiste ${Math.abs(trophiesChange)} trofeos<br>Total: ${totalTrophies} trofeos`;
            } else {
                title = '💔 Derrota';
                message = `No perdiste trofeos (no tenías suficientes)<br>Total: ${totalTrophies} trofeos`;
            }
        }
        
        const trophyModal = document.createElement('div');
        trophyModal.className = 'custom-modal';
        trophyModal.innerHTML = `
            <div class="modal-content ${won ? 'success' : 'error'}">
                <h3>${title}</h3>
                <p>${message}</p>
                <button onclick="this.closest('.custom-modal').remove()">
                    Aceptar
                </button>
            </div>
        `;
        document.body.appendChild(trophyModal);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateUI() {
        const timeElement = document.getElementById('timeLeft');
        const pairsElement = document.getElementById('matchedPairs');
        
        if (timeElement) timeElement.textContent = this.formatTime(this.timeLeft);
        if (pairsElement) pairsElement.textContent = `${this.matchedPairs}/8`;
    }
}

// Inicializar juego
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página del juego cargada');
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty') || 'basic';
    
    console.log(`🎯 Dificultad: ${difficulty}`);
    window.memoryGame = new MemoryGame(difficulty);
});

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('❌ Error global:', e.error);
});