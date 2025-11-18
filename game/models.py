# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
import json

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    trophies = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)
    total_wins = models.IntegerField(default=0)
    total_losses = models.IntegerField(default=0)
    total_time_played = models.FloatField(default=0.0)
    
    def average_time_per_game(self):
        if self.total_games == 0:
            return 0
        return self.total_time_played / self.total_games
    
    def most_played_level(self):
        games = GameHistory.objects.filter(user=self)
        if not games:
            return "No games played"
        
        level_count = {'basic': 0, 'medium': 0, 'advanced': 0}
        for game in games:
            level_count[game.difficulty] += 1
        
        return max(level_count, key=level_count.get).capitalize()

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
    
    class Meta:
        ordering = ['-created_at']
