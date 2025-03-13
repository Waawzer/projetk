'use client';

import { useEffect } from 'react';

/**
 * Composant qui gère la hauteur du viewport sur les appareils mobiles
 * Cela résout le problème de la barre d'adresse des navigateurs mobiles
 * qui change la hauteur du viewport
 */
const ViewportHandler = () => {
  useEffect(() => {
    // Fonction pour définir la hauteur du viewport
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Définir la hauteur initiale
    setVh();

    // Mettre à jour la hauteur lors du redimensionnement ou du changement d'orientation
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  return null; // Ce composant ne rend rien
};

export default ViewportHandler; 