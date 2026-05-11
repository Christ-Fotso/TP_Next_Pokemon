"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./pokemons.module.css";
import PokemonCard from "../../components/PokemonCard";
import { TYPE_COLORS } from "../../utils/colors";
import { useDebounce } from "../../hooks/useDebounce";

type PokemonType = {
  id: number;
  name: string;
  image: string;
};

type Pokemon = {
  id: number;
  pokedexId: number;
  name: string;
  image: string;
  types: PokemonType[];
};

const API = "https://nestjs-pokedex-api.vercel.app";

export default function PokemonsPage() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const name = useDebounce(searchTerm, 400);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);


  useEffect(() => {
    fetch(`${API}/types`)
      .then((r) => r.json())
      .then(setTypes);
  }, []);

  // Remise à zéro de la page quand on change un filtre
  useEffect(() => {
    setPage(1);
  }, [name, selectedTypes, limit]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (name) params.set("name", name);
      
      // Gestion de la limite de l'API avec le filtre de type
      for (let i = 0; i < selectedTypes.length; i++) {
        params.append("types", selectedTypes[i].toString());
      }

      const res = await fetch(`${API}/pokemons?${params.toString()}`);
      const data: Pokemon[] = await res.json();

      if (page === 1) {
        setPokemons(data);
      } else {
        setPokemons((prev) => [...prev, ...data]);
      }
      
      if (data.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setLoading(false);
    }

    load();
  }, [page, name, selectedTypes, limit]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  function toggleType(id: number) {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Pokédex</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Rechercher un pokémon..."
          onChange={handleNameChange}
          className={styles.searchInput}
        />

        <div className={styles.limitWrapper}>
          <label>Par page :</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className={styles.select}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className={styles.typeFilters}>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleType(t.id)}
              className={`${styles.typeBtn} ${
                selectedTypes.includes(t.id) ? styles.typeBtnActive : ""
              }`}
              style={
                selectedTypes.includes(t.id)
                  ? { backgroundColor: TYPE_COLORS[t.name] || "#4caf50", borderColor: TYPE_COLORS[t.name] || "transparent" }
                  : {}
              }
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {pokemons.map((p, index) => (
          <PokemonCard
            key={`${p.pokedexId}-${index}`}
            pokedexId={p.pokedexId}
            name={p.name}
            image={p.image}
            types={p.types}
          />
        ))}
      </div>

      {loading && <p className={styles.loading}>Chargement...</p>}
      <div ref={lastElementRef} className={styles.loaderTarget} />
    </div>
  );
}
