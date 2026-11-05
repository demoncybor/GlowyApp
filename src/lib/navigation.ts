/**
 * Pantalla a la que va el usuario según su estado.
 * Las zonas protegidas de App.tsx redirigen aquí cuando el usuario no puede entrar en ellas.
 */
export const homeHref = (signedIn: boolean, onboarded: boolean) =>
  !signedIn ? '/login' : !onboarded ? '/skin-type' : '/';
