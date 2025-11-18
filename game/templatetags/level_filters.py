from django import template
import math

register = template.Library()

@register.filter(name='calc_level')
def calc_level(total_games):
    """Calcula el nivel basado en partidas."""
    try:
        games = int(total_games)
        return math.floor( math.sqrt(games) )
    except:
        return 0