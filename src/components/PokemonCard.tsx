import Link from "next/link";
import styles from "./PokemonCard.module.css";
import { TYPE_COLORS } from "../utils/colors";

type PokemonType = {
  id: number;
  name: string;
  image: string;
};

type PokemonCardProps = {
  pokedexId: number;
  name: string;
  image: string;
  types: PokemonType[];
};

export default function PokemonCard({ pokedexId, name, image, types }: PokemonCardProps) {
  return (
    <Link href={`/pokemons/${pokedexId}`}>
      <div className={styles.card}>
        <span className={styles.cardId}>#{pokedexId}</span>
        <img src={image} alt={name} className={styles.cardImg} />
        <h2 className={styles.cardName}>{name}</h2>
        <div className={styles.cardTypes}>
          {types.map((t) => (
            <span 
              key={t.id} 
              className={styles.badge}
              style={{ backgroundColor: TYPE_COLORS[t.name] || "#555" }}
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
