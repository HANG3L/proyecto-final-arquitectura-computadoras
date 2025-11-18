# 🎮 Pokémon Memory Game
Un juego de memoria interactivo desarrollado con Django y JavaScript que utiliza la Pokémon API para crear una experiencia de juego única y divertida.

---
## 🚀 Características Principales
- Sistema de autenticación con registro y login
- Tres niveles de dificultad (Básico, Medio, Avanzado)
- Sistema de trofeos con recompensas y penalizaciones
- Interfaz responsive con diseño atractivo
- Integración con Pokémon API para cartas dinámicas
- Base de datos SQLite para almacenamiento local
- Estadísticas de jugador y historial de partidas

## 🛠️ Tecnologías Utilizadas
- Backend: Django 4.2.7
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Base de datos: SQLite
- API Externa: PokéAPI
- Estilos: CSS personalizado + Bootstrap

## 🏆 Sistema de Trofeos
| Dificultad | Trofeos Base | Tiempo Máximo | Vidas Máximas |
|------------|--------------|---------------|----------------|
| Básico     | 5 trofeos    | 3 minutos     | 6 vidas        |
| Medio      | 10 trofeos   | 2 minutos     | 4 vidas        |
| Avanzado   | 15 trofeos   | 1 minuto      | 2 vidas        |

### Bonificaciones
- *Bonus por vidas restantes:* Multiplicador según vidas conservadas
- *Bonus por tiempo:* Más trofeos por terminación rápida
- *Penalización por derrota:* Pierdes los mismos trofeos que hubieras ganado

### Ejemplo de Cálculo
```py
# Victoria en nivel Avanzado con 1 vida restante y 30 segundos
base_trophies = 15
life_multiplier = 1.0  # (1 vida de 2)
time_bonus = (60 - 30) / 60 * 15 = 7.5
total_trophies = int((15 + 7.5) * 1.0) = 22 trofeos
```
---
## 📡 Pokémon API Integration

**¿Qué es PokéAPI?**</br>
PokéAPI es una API RESTful gratuita que proporciona información completa sobre Pokémon, incluyendo sprites, tipos, habilidades y más.

### Uso en el Proyecto
```js
class PokemonAPI {
    static async fetchPokemonCards(count = 8) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=100`);
        const data = await response.json();
        
        // Seleccionar Pokémon aleatorios
        const randomPokemon = data.results.sort(() => 0.5 - Math.random()).slice(0, count);
        
        // Obtener detalles de cada Pokémon
        for (const pokemon of randomPokemon) {
            const pokemonResponse = await fetch(pokemon.url);
            const pokemonData = await pokemonResponse.json();
            
            // Extraer información relevante
            return {
                id: pokemonData.id,
                name: pokemonData.name,
                image: pokemonData.sprites.other['official-artwork'].front_default,
                types: pokemonData.types.map(type => type.type.name)
            };
        }
    }
}
```

### Características de la Implementación
- Fallback system: Imágenes de respaldo si la API falla
- Cache local: Reduce llamadas a la API
- Error handling: Manejo robusto de errores de conexión
- Optimización: Límite de 8 Pokémon por partida

## 🗄️ Base de Datos

### Modelos Principales

**CustomUser**
```python
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    trophies = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)
    total_wins = models.IntegerField(default=0)
    total_losses = models.IntegerField(default=0)
    total_time_played = models.FloatField(default=0.0)
```

**GameHistory**
```python
class GameHistory(models.Model):
    DIFFICULTY_CHOICES = [
        ('basic', 'Básico'),
        ('medium', 'Medio'),
        ('advanced', 'Avanzado'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    won = models.BooleanField(default=False)
    attempts_used = models.IntegerField(default=0)
    time_taken = models.FloatField(default=0.0)
    trophies_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Relaciones
- 1:N Usuario → Historial de Partidas
- Cada usuario tiene múltiples registros de GameHistory
- Índices automáticos en campos frecuentemente consultados

## 🔐 Validaciones Importantes
### Autenticación y Registro

```python
def register_view(request):
    # Validación de email único
    if CustomUser.objects.filter(email=email).exists():
        return error('Este email ya está registrado')
    
    # Validación de username único
    if CustomUser.objects.filter(username=username).exists():
        return error('Este usuario ya existe')
    
    # Validación de formato de email
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return error('Formato de email inválido')
```

### Sistema de Juego

```python
def save_game_result(request):
    # Validación de dificultad
    difficulty = data.get('difficulty')
    if difficulty not in ['basic', 'medium', 'advanced']:
        return error('Dificultad inválida')
    
    # Validación de trofeos no negativos
    user.trophies = max(0, user.trophies - trophies_lost)
    
    # Validación de datos del juego
    if attempts_used < 0 or time_taken < 0:
        return error('Datos del juego inválidos')
```
---
## 📥 Instalación y Ejecución
### Prerrequisitos
- Python 3.8+
- pip (gestor de paquetes de Python)
- Git

### Pasos para Instalar
1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd memorygame
```

2. Crear entorno virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Instalar dependencias
```bash
pip install -r requirements.txt
```

4. Configurar base de datos
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Ejecutar servidor de desarrollo
```bash
python manage.py runserver
```

6. Acceder a la aplicación
```bash
http://127.0.0.1:8000/
```

---
## 🎯 Cómo Jugar
1. Registrarse con email y contraseña
2. Seleccionar dificultad en el menú principal
3. Voltear cartas para encontrar pares de Pokémon
4. Completar el juego antes de que se acabe el tiempo o los intentos
5. Ver estadísticas en el perfil personal
6. Competir por los primeros lugares en el leaderboard