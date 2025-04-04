"use client";

import { useState, useEffect, useRef } from "react";

interface SpotifyPlayerProps {
  playlistId: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ playlistId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Ce hook simule le chargement du player Spotify
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  // Fonction pour appliquer des styles personnalisés au player Spotify via l'API postMessage
  useEffect(() => {
    const customizePlayer = () => {
      // Si l'iframe est chargée
      if (iframeRef.current) {
        // Créer un observer qui va attendre que le contenu de l'iframe soit chargé
        const observer = new MutationObserver(() => {
          // Tentative d'application des styles personnalisés
          try {
            // Essayer d'accéder à l'iframe et d'envoyer un message pour changer les styles
            const iframe = iframeRef.current;
            if (iframe.contentWindow) {
              iframe.contentWindow.postMessage(
                {
                  type: "customize",
                  themeColor: "#7a42d9", // Couleur primaire qui correspond au thème du site
                },
                "*"
              );
              console.log(
                "Message de personnalisation envoyé au player Spotify"
              );
            }
          } catch (error) {
            console.error(
              "Erreur lors de la personnalisation du player:",
              error
            );
          }
        });

        // Observer l'iframe
        if (iframeRef.current) {
          observer.observe(iframeRef.current, {
            childList: true,
            subtree: true,
          });
        }

        return () => {
          observer.disconnect();
        };
      }
    };

    if (!isLoading) {
      customizePlayer();
    }
  }, [isLoading]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Player Spotify avec fond sombre personnalisé */}
      <div className="w-full aspect-auto">
        {isLoading ? (
          <div className="w-full h-[352px] bg-card flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="animate-spin h-8 w-8 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p className="text-white/70">Chargement du player Spotify...</p>
            </div>
          </div>
        ) : (
          <div className="player-container border border-white/10 rounded-xl overflow-hidden">
            <iframe
              ref={iframeRef}
              className="w-full h-[352px]"
              src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ backgroundColor: "rgba(22, 22, 26, 0.95)" }}
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyPlayer;
