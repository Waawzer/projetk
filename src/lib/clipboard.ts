/**
 * Utilitaire pour copier du texte dans le clipboard de manière sécurisée
 * avec fallback pour les navigateurs plus anciens
 */
export async function copyToClipboard(
  text: string,
  successMessage?: string
): Promise<boolean> {
  try {
    // Méthode moderne (recommandée)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      if (successMessage) {
        alert(successMessage);
      }
      return true;
    }

    // Fallback pour navigateurs plus anciens
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (success && successMessage) {
      alert(successMessage);
    }

    return success;
  } catch (error) {
    console.error("Erreur lors de la copie:", error);
    return false;
  }
}

/**
 * Copier un lien PayPal dans le clipboard
 */
export function copyPayPalLink(link: string): Promise<boolean> {
  return copyToClipboard(link, "Lien PayPal copié dans le presse-papiers!");
}

/**
 * Copier un lien Stripe dans le clipboard
 */
export function copyStripeLink(link: string): Promise<boolean> {
  return copyToClipboard(link, "Lien Stripe copié dans le presse-papiers!");
}
