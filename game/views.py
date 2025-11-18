# game/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import CustomUser, GameHistory
from collections import Counter
import json
import requests

def login_view(request):
    if request.user.is_authenticated:
        return redirect('difficulty_selection')
    
    if request.method == 'POST':
        email = request.POST['email']  # Cambiar de username a email
        password = request.POST['password']
        
        # Buscar usuario por email
        try:
            user = CustomUser.objects.get(email=email)
            user = authenticate(request, username=user.username, password=password)
        except CustomUser.DoesNotExist:
            user = None
        
        if user is not None:
            login(request, user)
            return redirect('difficulty_selection')
        else:
            return render(request, 'login.html', {'error': 'Email o contraseña incorrectos'})
    
    return render(request, 'login.html')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('difficulty_selection')
    
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        # Validar que el email no exista
        if CustomUser.objects.filter(email=email).exists():
            return render(request, 'register.html', {'error': 'Este email ya está registrado'})
        
        # Validar que el username no exista
        if CustomUser.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Este usuario ya existe'})
        
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        login(request, user)
        return redirect('difficulty_selection')
    
    return render(request, 'register.html')

@login_required
def difficulty_selection(request):
    # Obtener top 10 jugadores por trofeos
    top_players = CustomUser.objects.all().order_by('-trophies')[:10]
    
    # Preparar datos para el template
    leaderboard_data = []
    for index, player in enumerate(top_players, 1):
        leaderboard_data.append({
            'position': index,
            'username': player.username,
            'trophies': player.trophies,
            'total_wins': player.total_wins,
            'total_games': player.total_games,
            'is_current_user': player == request.user
        })
    
    return render(request, 'difficulty_selection.html', {
        'leaderboard': leaderboard_data
    })

@login_required
def get_leaderboard(request):
    top_players = CustomUser.objects.all().order_by('-trophies')[:10]
    
    leaderboard_data = []
    for index, player in enumerate(top_players, 1):
        leaderboard_data.append({
            'position': index,
            'username': player.username,
            'trophies': player.trophies,
            'total_wins': player.total_wins,
            'total_games': player.total_games,
            'is_current_user': player.username == request.user.username
        })
    
    return JsonResponse({'leaderboard': leaderboard_data})

@login_required
def game_view(request):
    difficulty = request.GET.get('difficulty', 'basic')
    return render(request, 'game.html', {'difficulty': difficulty})

# game/views.py - Actualiza save_game_result
@login_required
def save_game_result(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            difficulty = data.get('difficulty')
            won = data.get('won', False)
            attempts_used = data.get('attempts_used', 0)
            time_taken = data.get('time_taken', 0.0)
            
            # Sistema de trofeos por dificultad
            trophy_values = {
                'basic': 5,
                'medium': 10, 
                'advanced': 15
            }
            
            base_trophies = trophy_values.get(difficulty, 5)
            trophies_earned = 0
            trophies_change = 0  # Para mostrar en historial
            
            user = request.user
            current_trophies = user.trophies  # Guardar trofeos actuales
            
            if won:
                # Calcular bonus por vidas restantes
                max_attempts = {
                    'basic': 6,
                    'medium': 4,
                    'advanced': 2
                }.get(difficulty, 6)
                
                lives_left = max_attempts - attempts_used
                life_multiplier = {0: 1.0, 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 2.5, 6: 3.0}.get(lives_left, 1.0)
                
                # Bonus por tiempo (más rápido = más trofeos)
                max_time = {
                    'basic': 180,  # 3 minutos
                    'medium': 120, # 2 minutos  
                    'advanced': 60  # 1 minuto
                }.get(difficulty, 60)
                
                time_bonus = max(0, (max_time - time_taken) / max_time * base_trophies)
                
                trophies_earned = int((base_trophies + time_bonus) * life_multiplier)
                user.trophies += trophies_earned
                trophies_change = trophies_earned  # Positivo para victorias
                
            else:
                # Perder trofeos - NUNCA dejar en negativo
                trophies_to_lose = base_trophies
                actual_trophies_lost = min(trophies_to_lose, user.trophies)  # No quitar más de los que tiene
                
                user.trophies -= actual_trophies_lost
                trophies_change = -actual_trophies_lost  # Negativo para derrotas
            
            # Actualizar estadísticas del usuario
            user.total_games += 1
            user.total_time_played += time_taken
            
            if won:
                user.total_wins += 1
            else:
                user.total_losses += 1
            
            user.save()
            
            # Guardar historial del juego
            game_history = GameHistory.objects.create(
                user=user,
                difficulty=difficulty,
                won=won,
                attempts_used=attempts_used,
                time_taken=time_taken,
                trophies_earned=trophies_change  # Guardar el cambio real (puede ser negativo)
            )
            
            return JsonResponse({
                'success': True,
                'trophies_earned': trophies_change,  # Cambio real (puede ser negativo)
                'total_trophies': user.trophies,
                'won': won,
                'previous_trophies': current_trophies  # Para mostrar en el mensaje
            })
            
        except Exception as e:
            print(f"❌ Error guardando resultado: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)})

@login_required
def profile_view(request):
    user = request.user
    # Solo mostrar las últimas 7 partidas
    all_history = GameHistory.objects.filter(user=user)
    game_history = GameHistory.objects.filter(user=user).order_by('-created_at')[:7]

    most_common_difficulty = (
        Counter(h.difficulty for h in all_history).most_common(1)[0][0]
        if all_history else
        'basic'
    )
    
    # Calcular estadísticas
    total_games = user.total_games
    total_wins = user.total_wins
    total_losses = user.total_losses
    
    average_time = 0
    if total_games > 0:
        average_time = round(user.total_time_played / total_games, 2)
    
    stats = {
        'total_games': total_games,
        'total_wins': total_wins,
        'total_losses': total_losses,
        'average_time': average_time,
        'average_wins': (total_wins/total_games)*100 if total_games > 0 else 0,
        'most_common_difficulty': most_common_difficulty,
        'total_trophies': user.trophies
    }
    
    return render(request, 'profile.html', {
        'user': user,
        'stats': stats,
        'game_history': game_history
    })

def logout_view(request):
    logout(request)
    return redirect('login')