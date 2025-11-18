class PokemonAPI {
    static async fetchPokemonCards(count = 8) {
        console.log('🔄 Cargando Pokémon desde la API...');
        const pokemonList = [];
        
        try {
            // Fetch random Pokémon
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=100`);
            const data = await response.json();
            
            if (!data.results) {
                throw new Error('No se pudieron obtener los Pokémon');
            }
            
            // Select random Pokémon
            const randomPokemon = data.results
                .sort(() => 0.5 - Math.random())
                .slice(0, count);
            
            console.log(`📝 Pokémon seleccionados: ${randomPokemon.map(p => p.name).join(', ')}`);
            
            // Fetch details for each Pokémon
            for (const pokemon of randomPokemon) {
                try {
                    const pokemonResponse = await fetch(pokemon.url);
                    const pokemonData = await pokemonResponse.json();
                    
                    pokemonList.push({
                        id: pokemonData.id,
                        name: this.capitalizeName(pokemonData.name),
                        image: pokemonData.sprites.other['official-artwork']?.front_default ||
                              pokemonData.sprites.other?.dream_world?.front_default ||
                              pokemonData.sprites.front_default,
                        types: pokemonData.types.map(type => type.type.name)
                    });
                } catch (error) {
                    console.error(`Error cargando ${pokemon.name}:`, error);
                    // Agregar un Pokémon de respaldo
                    pokemonList.push(this.createFallbackPokemon(pokemonList.length + 1));
                }
            }
            
            console.log('✅ Pokémon cargados exitosamente:', pokemonList);
            return pokemonList;
            
        } catch (error) {
            console.error('❌ Error fetching Pokémon from API:', error);
            console.log('🔄 Usando Pokémon de respaldo...');
            return this.getFallbackPokemon(count);
        }
    }
    
    static capitalizeName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    static createFallbackPokemon(id) {
        const fallbackPokemon = [
            { id: 25, name: 'Pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', types: ['electric'] },
            { id: 4, name: 'Charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', types: ['fire'] },
            { id: 7, name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', types: ['water'] },
            { id: 1, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', types: ['grass', 'poison'] },
            { id: 133, name: 'Eevee', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', types: ['normal'] },
            { id: 39, name: 'Jigglypuff', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', types: ['normal', 'fairy'] },
            { id: 16, name: 'Pidgey', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png', types: ['normal', 'flying'] },
            { id: 10, name: 'Caterpie', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png', types: ['bug'] }
        ];
        
        return fallbackPokemon[id % fallbackPokemon.length];
    }
    
    static getFallbackPokemon(count) {
        console.log('🎨 Generando Pokémon de respaldo...');
        const fallbackPokemon = [
            { id: 25, name: 'Pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', types: ['electric'] },
            { id: 4, name: 'Charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', types: ['fire'] },
            { id: 7, name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', types: ['water'] },
            { id: 1, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', types: ['grass', 'poison'] },
            { id: 133, name: 'Eevee', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', types: ['normal'] },
            { id: 39, name: 'Jigglypuff', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', types: ['normal', 'fairy'] },
            { id: 16, name: 'Pidgey', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png', types: ['normal', 'flying'] },
            { id: 10, name: 'Caterpie', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png', types: ['bug'] }
        ];
        
        // Seleccionar aleatoriamente y duplicar para pares
        const selected = fallbackPokemon
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
            
        return selected;
    }
}

// Hacer la clase globalmente disponible
window.PokemonAPI = PokemonAPI;
console.log('✅ PokemonAPI cargado correctamente');