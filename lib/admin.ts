// E-mail com acesso ao painel administrativo. Único ponto de verdade —
// middleware, layout e server actions do /admin checam contra esta constante.
export const ADMIN_EMAIL = "rafael.mediario@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  return email === ADMIN_EMAIL;
}
