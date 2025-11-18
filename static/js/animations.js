document.addEventListener('DOMContentLoaded', function() {
    // Efecto de partículas en botones
    initButtonEffects();
    
    // Animación de entrada para elementos
    initScrollAnimations();
    
    // Efectos de hover para cartas
    initCardEffects();
});

function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn-primary');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Efecto de ripple
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.slide-in').forEach(el => {
        observer.observe(el);
    });
}

function initCardEffects() {
    const cards = document.querySelectorAll('.card');
    
    // cards.forEach(card => {
    //     card.addEventListener('mousemove', (e) => {
    //         const rect = card.getBoundingClientRect();
    //         const x = e.clientX - rect.left;
    //         const y = e.clientY - rect.top;
            
    //         const centerX = rect.width / 2;
    //         const centerY = rect.height / 2;
            
    //         const angleY = (x - centerX) / 25;
    //         const angleX = (centerY - y) / 25;
            
    //         card.style.transform = `
    //             perspective(1000px)
    //             rotateX(${angleX}deg)
    //             rotateY(${angleY}deg)
    //             translateY(-5px)
    //         `;
    //     });
        
    //     card.addEventListener('mouseleave', () => {
    //         card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    //     });
    // });
}

// Efecto de confeti para victorias
function showConfetti() {
    const confettiCount = 100;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}