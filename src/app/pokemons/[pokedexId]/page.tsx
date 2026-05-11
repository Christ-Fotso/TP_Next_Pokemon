"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./detail.module.css";
import { TYPE_COLORS } from "../../../utils/colors";

type PokemonType = {
  id: number;
  name: string;
  image: string;
};

type Evolution = {
  name: string;
  pokedexId: number;
};

type Pokemon = {
  id: number;
  pokedexId: number;
  name: string;
  image: string;
  types: PokemonType[];
  stats: {
    HP: number;
    attack: number;
    defense: number;
    speed: number;
    specialAttack: number;
    specialDefense: number;
  };
  evolutions: Evolution[];
  generation: number;
};

export default function PokemonDetail() {
  const { pokedexId } = useParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pokedexId) return;
    fetch(`https://nestjs-pokedex-api.vercel.app/pokemons/${pokedexId}`)
      .then((r) => r.json())
      .then((data) => {
        setPokemon(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API pokemon:", err);
      });
  }, [pokedexId]);

  if (loading) {
    return (
      <div className={styles.center}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className={styles.center}>
        <p>Pokémon introuvable</p>
      </div>
    );
  }

  const statsList = [
    { label: "HP", value: pokemon.stats.HP, max: 250 },
    { label: "Attaque", value: pokemon.stats.attack, max: 200 },
    { label: "Défense", value: pokemon.stats.defense, max: 200 },
    { label: "Vitesse", value: pokemon.stats.speed, max: 200 },
    { label: "Atk Spé", value: pokemon.stats.specialAttack, max: 200 },
    { label: "Déf Spé", value: pokemon.stats.specialDefense, max: 200 },
  ];

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        ← Retour
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.id}>#{pokemon.pokedexId}</span>
          <h1 className={styles.name}>{pokemon.name}</h1>
          <div className={styles.types}>
            {pokemon.types.map((t) => (
              <span key={t.id} className={styles.badge} style={{ backgroundColor: TYPE_COLORS[t.name] || "#555" }}>
                {t.name}
              </span>
            ))}
          </div>
        </div>

        <img src={pokemon.image} alt={pokemon.name} className={styles.img} />

        <div className={styles.stats}>
          <h2>Statistiques</h2>
          {statsList.map((s) => (
            <div key={s.label} className={styles.statRow}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
              <div className={styles.barBg}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${Math.min((s.value / s.max) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {pokemon.evolutions.length > 0 ? (
          <div className={styles.evolutions}>
            <h2>Évolutions</h2>
            <div className={styles.evoList}>
              {pokemon.evolutions.map((evo) => (
                <div
                  key={evo.pokedexId}
                  className={styles.evoCard}
                  onClick={() => router.push(`/pokemons/${evo.pokedexId}`)}
                >
                  <div className={styles.evoInfo}>
                    <span className={styles.evoName}>{evo.name}</span>
                    <span className={styles.evoId}>#{evo.pokedexId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.evolutions}>
            <h2>Évolutions</h2>
            <p className={styles.noEvo}>Aucune évolution</p>
          </div>
        )}
      </div>
    </div>
  );
}
