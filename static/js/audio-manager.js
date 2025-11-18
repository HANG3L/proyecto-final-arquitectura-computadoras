class AudioManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.init();
    }
    
    init() {
        // Cargar preferencia del usuario
        const savedPref = localStorage.getItem('soundEnabled');
        if (savedPref !== null) {
            this.enabled = savedPref === 'true';
        }
        
        // Configurar el evento del botón
        this.setupButton();
        this.updateButton();
        
        // Precargar sonidos básicos
        this.preloadSounds();
    }
    
    setupButton() {
        const btn = document.getElementById('toggleSound');
        if (btn) {
            // Remover event listeners previos para evitar duplicados
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = document.getElementById('toggleSound');
            
            // Agregar event listener
            newBtn.addEventListener('click', () => this.toggle());
            console.log('✅ Botón de audio configurado');
        } else {
            console.log('❌ Botón toggleSound no encontrado');
        }
    }
    
    preloadSounds() {
        // Sonidos básicos - si no se cargan, no pasa nada
        this.sounds = {
            flip: this.createSound('/static/sounds/card-flip.wav'),
            match: this.createSound('/static/sounds/match-success.wav'),
            mismatch: this.createSound('/static/sounds/match-fail.wav'),
            win: this.createSound('/static/sounds/game-win.wav'),
            lose: this.createSound('/static/sounds/game-lose.wav')
        };
    }
    
    createSound(src) {
        try {
            const audio = new Audio();
            audio.src = src;
            audio.volume = 0.7;
            audio.preload = 'auto';
            return audio;
        } catch (error) {
            console.warn('No se pudo crear sonido:', src);
            return null;
        }
    }
    
    play(soundName) {
        if (!this.enabled) {
            console.log('🔇 Sonido desactivado:', soundName);
            return;
        }
        
        const sound = this.sounds[soundName];
        if (sound) {
            try {
                // Clonar el audio para permitir superposición
                const audioClone = sound.cloneNode();
                audioClone.volume = 0.7;
                audioClone.play().catch(error => {
                    // Silenciar errores de autoplay
                    console.log('Audio no reproducido (autoplay):', error);
                });
                console.log('🔊 Reproduciendo:', soundName);
            } catch (error) {
                // Silenciar errores de reproducción
                console.log('Error reproduciendo sonido:', soundName);
            }
        } else {
            console.log('❌ Sonido no encontrado:', soundName);
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        this.updateButton();
        
        // Reproducir sonido de toggle (feedback)
        if (this.enabled) {
            this.play('flip'); // Sonido cuando se activa
        }
        
        console.log('🔊 Sonido', this.enabled ? 'activado' : 'desactivado');
        
        // Feedback visual
        const btn = document.getElementById('toggleSound');
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
        }
    }
    
    updateButton() {
        const btn = document.getElementById('toggleSound');
        if (btn) {
            btn.textContent = this.enabled ? '🔊' : '🔇';
            btn.classList.toggle('muted', !this.enabled);
            btn.title = this.enabled ? 'Desactivar sonido' : 'Activar sonido';
        }
    }
    
    isEnabled() {
        return this.enabled;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.audioManager = new AudioManager();
    console.log('🎵 AudioManager inicializado');
});

// También exportar para usar en otros archivos
window.AudioManager = AudioManager;