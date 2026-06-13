// Google Sign-In — désactivé en mode Expo Go (nécessite un build natif)
export async function nativeGoogleSignIn(): Promise<string | null> {
  console.warn("Google Sign-In non disponible en mode Expo Go.");
  return null;
}

export async function nativeGoogleSignOut(): Promise<void> {}
