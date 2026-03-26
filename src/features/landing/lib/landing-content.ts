import { Trees, CalendarCheck, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Highlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Testimonial {
  rating: number;
  quote: string;
  author: string;
  establishment: string;
}

export const HIGHLIGHTS: Highlight[] = [
  {
    icon: Trees,
    title: "Cadre naturel unique",
    description:
      "Forêts, vallées et rivières — chaque établissement offre un écrin de nature préservée.",
  },
  {
    icon: CalendarCheck,
    title: "Réservation directe",
    description:
      "Sans intermédiaire, au meilleur prix. Votre séjour en quelques clics.",
  },
  {
    icon: Heart,
    title: "Service personnalisé",
    description:
      "Des gérants passionnés, à votre écoute pour un séjour sur mesure.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    rating: 5,
    quote:
      "Un cadre exceptionnel, le silence de la forêt et un accueil chaleureux. On reviendra !",
    author: "Marie L.",
    establishment: "Le Moulin du Vallon",
  },
  {
    rating: 5,
    quote:
      "La vue depuis notre suite était à couper le souffle. Personnel aux petits soins.",
    author: "Thomas D.",
    establishment: "La Ferme des Crêtes",
  },
  {
    rating: 4,
    quote:
      "Parfait pour se ressourcer. Les enfants ont adoré les balades autour du domaine.",
    author: "Sophie & Marc B.",
    establishment: "Le Domaine des Pins",
  },
];
