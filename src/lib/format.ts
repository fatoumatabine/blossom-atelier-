export function formatCfa(value: number) {
  return `${Math.round(value || 0).toLocaleString("fr-FR")} FCFA`;
}
