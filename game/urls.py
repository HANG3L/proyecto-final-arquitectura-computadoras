from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),  # Raíz va al login
    path('login/', views.login_view, name='login'),  # También accesible como /login/
    path('register/', views.register_view, name='register'),
    path('difficulty/', views.difficulty_selection, name='difficulty_selection'),
    path('game/', views.game_view, name='game'),
    path('save_game_result/', views.save_game_result, name='save_game_result'),
    path('profile/', views.profile_view, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('get_leaderboard/', views.get_leaderboard, name='get_leaderboard'),
]