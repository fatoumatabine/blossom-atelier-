import perfume from "@/assets/product-perfume.jpg";
import lipstick from "@/assets/product-lipstick.jpg";
import serum from "@/assets/product-serum.jpg";
import cream from "@/assets/product-cream.jpg";
import heroPerfume from "@/assets/hero-perfume.jpg";

// Use local assets from `src/assets` for public product images

export type ProductNote = {
  tete: string;
  coeur: string;
  fond: string;
};

export type ProductSize = {
  label: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "Parfum" | "Maquillage" | "Soin";
  subcategory?: string;
  badge?: "Nouveau" | "Best-seller" | "Promo" | "Épuisé";
  description: string;
  problematic?: string;
  notes?: ProductNote;
  sizes?: ProductSize[];
  scentFamily?: string;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Éclat Floral",
    brand: "Blossom Privé",
    price: 89,
    image: perfume,
    category: "Parfum",
    subcategory: "Parfums Femme",
    badge: "Best-seller",
    description:
      "Une eau de parfum florale et lumineuse. Notes de rose, pivoine et musc blanc pour une signature délicate et inoubliable.",
    notes: { tete: "Rose", coeur: "Pivoine", fond: "Musc blanc" },
    scentFamily: "Floral",
    sizes: [
      { label: "30ML", price: 59 },
      { label: "50ML", price: 89 },
      { label: "100ML", price: 129 },
    ],
  },
  {
    id: "p2",
    name: "Rouge Velours",
    brand: "Maison Blossom",
    price: 32,
    image: lipstick,
    category: "Maquillage",
    badge: "Nouveau",
    description:
      "Rouge à lèvres mat longue tenue, texture velours, fini soyeux. Une teinte universelle, féminine et élégante.",
  },
  {
    id: "p3",
    name: "Sérum Botanique",
    brand: "Blossom Nature",
    price: 64,
    image: serum,
    category: "Soin",
    badge: "Best-seller",
    description:
      "Sérum éclat enrichi en extraits botaniques. Hydrate, lisse et révèle l'éclat naturel de la peau.",
  },
  {
    id: "p4",
    name: "Crème Précieuse",
    brand: "Blossom Or",
    price: 78,
    originalPrice: 110,
    image: cream,
    category: "Soin",
    badge: "Promo",
    description:
      "Crème visage anti-âge à la texture fondante. Parfumée subtilement, elle nourrit et repulpe la peau.",
  },
  {
    id: "p5",
    name: "Brume Pétale",
    brand: "Blossom Privé",
    price: 54,
    image: heroPerfume,
    category: "Parfum",
    subcategory: "Parfums Mixte",
    badge: "Nouveau",
    description: "Brume parfumée légère, idéale pour le corps et les cheveux. Sillage doux et envoûtant.",
    notes: { tete: "Pêche", coeur: "Rose", fond: "Cèdre" },
    scentFamily: "Fruité",
    sizes: [
      { label: "50ML", price: 54 },
      { label: "100ML", price: 89 },
    ],
  },
  {
    id: "p6",
    name: "Baume Nuit",
    brand: "Blossom Nature",
    price: 48,
    image: "https://picsum.photos/seed/baume-nuit/520/520",
    category: "Soin",
    description:
      "Baume nuit régénérant. Réveille la peau, l'apaise et la nourrit en profondeur pendant le sommeil.",
  },
  {
    id: "p7",
    name: "Nuit Dorée",
    brand: "Blossom Privé",
    price: 115,
    image: "https://picsum.photos/seed/nuit-doree/520/520",
    category: "Parfum",
    subcategory: "Parfums de Niche",
    badge: "Nouveau",
    description:
      "Un extrait de parfum intense et profond, inspiré des nuits orientales. Oud, ambre et vanille se mêlent dans une symphonie enivrante.",
    notes: { tete: "Bergamote", coeur: "Oud", fond: "Vanille" },
    scentFamily: "Oriental",
    sizes: [
      { label: "50ML", price: 115 },
      { label: "100ML", price: 195 },
    ],
  },
  {
    id: "p8",
    name: "Velvet Homme",
    brand: "Maison Blossom",
    price: 72,
    originalPrice: 95,
    image: "https://picsum.photos/seed/velvet-homme/520/520",
    category: "Parfum",
    subcategory: "Parfums Homme",
    badge: "Promo",
    description:
      "Eau de parfum masculine aux notes boisées et épicées. Un sillage affirmé pour l'homme d'aujourd'hui.",
    notes: { tete: "Poivre noir", coeur: "Vétiver", fond: "Bois de santal" },
    scentFamily: "Boisé",
    sizes: [
      { label: "60ML", price: 72 },
      { label: "100ML", price: 110 },
    ],
  },
  {
    id: "p9",
    name: "Fond de Teint Satin",
    brand: "Maison Blossom",
    price: 44,
    image: "https://picsum.photos/seed/fond-de-teint/520/520",
    category: "Maquillage",
    badge: "Best-seller",
    description:
      "Fond de teint à texture légère et fini satiné. Couvrance modulable, tient 24h, protège des UV.",
  },
  {
    id: "p10",
    name: "Huile Précieuse",
    brand: "Blossom Or",
    price: 58,
    image: "https://picsum.photos/seed/huile-precieuse/520/520",
    category: "Soin",
    badge: "Nouveau",
    description:
      "Huile visage et corps multi-usages enrichie en or et en extraits de jasmin. Nourrit et sublime le teint.",
  },
  {
    id: "p11",
    name: "Chypré Secret",
    brand: "Atelier Pétale",
    price: 96,
    image: "https://picsum.photos/seed/chypre-secret/520/520",
    category: "Parfum",
    subcategory: "Parfums Femme",
    description:
      "Un chypré floral mystérieux et sophistiqué. Bergamote, rose centifolia et mousse de chêne forment un accord envoûtant.",
    notes: { tete: "Bergamote", coeur: "Rose", fond: "Mousse de chêne" },
    scentFamily: "Chypré",
    sizes: [
      { label: "50ML", price: 96 },
      { label: "100ML", price: 148 },
    ],
  },
  {
    id: "p12",
    name: "Acqua Fresca",
    brand: "Velours & Or",
    price: 65,
    image: "https://picsum.photos/seed/acqua-fresca/520/520",
    category: "Parfum",
    subcategory: "Parfums Mixte",
    badge: "Best-seller",
    description:
      "Une eau fraîche et pétillante aux notes d'agrumes et de thé vert. Légère, énergisante, parfaite au quotidien.",
    notes: { tete: "Citron", coeur: "Thé vert", fond: "Musc" },
    scentFamily: "Hespéridé",
    sizes: [
      { label: "50ML", price: 65 },
      { label: "100ML", price: 98 },
    ],
  },

  // ---- Skincare ----
  {
    id: "sk1",
    name: "Nettoyant Mousse Éclat",
    brand: "Blossom Nature",
    price: 28,
    image: cream,
    category: "Soin",
    subcategory: "Visage",
    badge: "Nouveau",
    description:
      "Mousse nettoyante purifiante aux extraits de rose et d'aloé vera. Élimine les impuretés en douceur, hydrate et révèle une peau lumineuse dès la première utilisation.",
  },
  {
    id: "sk2",
    name: "Tonique Floral Rose",
    brand: "Blossom Nature",
    price: 34,
    image: "https://picsum.photos/seed/tonique-floral/520/520",
    category: "Soin",
    subcategory: "Visage",
    description:
      "Tonique apaisant à l'eau de rose pure. Équilibre le pH, resserre les pores et prépare la peau pour les soins suivants. Formule sans alcool, convient aux peaux sensibles.",
  },
  {
    id: "sk3",
    name: "Sérum Vitamine C Pro",
    brand: "Blossom Or",
    price: 72,
    image: "https://picsum.photos/seed/serum-vit-c/520/520",
    category: "Soin",
    subcategory: "Visage",
    badge: "Best-seller",
    description:
      "Sérum anti-taches à haute teneur en vitamine C stabilisée (20%). Corrige les irrégularités, uniformise le teint et protège contre les agressions extérieures. Résultats visibles en 4 semaines.",
  },
  {
    id: "sk4",
    name: "Masque Argile Purifiant",
    brand: "Blossom Nature",
    price: 38,
    image: "https://picsum.photos/seed/masque-argile/520/520",
    category: "Soin",
    subcategory: "Visage",
    description:
      "Masque à l'argile kaolin et au charbon actif. Absorbe l'excès de sébum, désincruste les pores et laisse la peau parfaitement purifiée. Utilisation 1 à 2 fois par semaine.",
  },
  {
    id: "sk5",
    name: "Crème Contour Yeux",
    brand: "Blossom Or",
    price: 58,
    image: "https://picsum.photos/seed/contour-yeux/520/520",
    category: "Soin",
    subcategory: "Visage",
    badge: "Nouveau",
    description:
      "Soin contour des yeux anti-âge au rétinol et à la caféine. Atténue les poches, les cernes et les ridules pour un regard reposé et lumineux. Texture gel-crème fondante.",
  },
  {
    id: "sk6",
    name: "Écran Solaire SPF 50",
    brand: "Blossom Nature",
    price: 36,
    image: "https://picsum.photos/seed/ecran-spf/520/520",
    category: "Soin",
    subcategory: "Visage",
    description:
      "Écran solaire léger et invisible SPF 50+ avec filtre minéral. Protège des UVA/UVB, hydrate et laisse un fini mat. Convient aux peaux sensibles et au quotidien.",
  },
  {
    id: "sk7",
    name: "Gommage Corps Rose",
    brand: "Blossom Nature",
    price: 42,
    image: "https://picsum.photos/seed/gommage-corps/520/520",
    category: "Soin",
    subcategory: "Corps",
    badge: "Nouveau",
    description:
      "Exfoliant corps aux sucres de canne et pétales de roses séchées. Élimine les cellules mortes, nourrit en profondeur et laisse la peau soyeuse et parfumée. Idéal avant hydratation.",
  },
  {
    id: "sk8",
    name: "Lait Corps Précieux",
    brand: "Blossom Or",
    price: 45,
    image: "https://picsum.photos/seed/lait-corps/520/520",
    category: "Soin",
    subcategory: "Corps",
    description:
      "Lait corporel ultra-nourrissant au beurre de karité et à l'huile d'argan. Fond instantanément, hydrate pour 24h et laisse un voile parfumé subtil sur la peau.",
  },
  {
    id: "sk9",
    name: "Masque Nuit Reboot",
    brand: "Blossom Or",
    price: 55,
    image: "https://picsum.photos/seed/masque-nuit/520/520",
    category: "Soin",
    subcategory: "Visage",
    description:
      "Masque de nuit à la niacinamide et aux peptides. Régénère, repulpe et répare la peau pendant le sommeil. Au réveil, la peau paraît rebondie, lissée et éclatante.",
  },
  {
    id: "sk10",
    name: "Huile Sèche Corps",
    brand: "Atelier Pétale",
    price: 62,
    originalPrice: 79,
    image: "https://picsum.photos/seed/huile-seche/520/520",
    category: "Soin",
    subcategory: "Huiles",
    badge: "Promo",
    description:
      "Huile sèche corps multi-usages aux actifs précieux : jasmin, rose centifolia et squalane végétal. Non grasse, elle sublime le teint, satiné et parfumé d'un éclat naturel.",
  },
];

export const brands = [
  "Maison Blossom",
  "Blossom Privé",
  "Blossom Nature",
  "Blossom Or",
  "Atelier Pétale",
  "Velours & Or",
];

export const scentFamilies = [
  { name: "Boisé", image: "https://picsum.photos/seed/boise/200/200" },
  { name: "Fruité", image: "https://picsum.photos/seed/fruite/200/200" },
  { name: "Oud", image: "https://picsum.photos/seed/oud/200/200" },
  { name: "Chypré", image: "https://picsum.photos/seed/chypre/200/200" },
  { name: "Hespéridé", image: "https://picsum.photos/seed/hesperide/200/200" },
  { name: "Floral", image: "https://picsum.photos/seed/floral/200/200" },
  { name: "Oriental", image: "https://picsum.photos/seed/oriental/200/200" },
];

export const categorySubcategories: Record<string, string[]> = {
  Parfum: ["Parfums Homme", "Parfums Femme", "Parfums de Niche", "Parfums Mixte"],
  Maquillage: ["Lèvres", "Teint", "Yeux", "Coffrets"],
  Soin: ["Visage", "Corps", "Huiles", "Coffrets"],
};
