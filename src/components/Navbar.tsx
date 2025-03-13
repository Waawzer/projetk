'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMusic, FiCalendar, FiDollarSign, FiMail } from 'react-icons/fi';
import BlackHoleLogo from './BlackHoleLogo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Désactiver le défilement du body lorsque le menu mobile est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Accueil', icon: <FiMusic className="mr-2" /> },
    { href: '/tarifs', label: 'Tarifs', icon: <FiDollarSign className="mr-2" /> },
    { href: '/reservation', label: 'Réservation', icon: <FiCalendar className="mr-2" /> },
    { href: '/contact', label: 'Contact', icon: <FiMail className="mr-2" /> },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-bold text-white flex items-center" onClick={closeMenu}>
            <BlackHoleLogo className="text-primary mr-2" size={24} />
            <span className="text-primary mr-1">Kasar</span>
            <span>Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center text-sm font-medium transition-colors duration-300 ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden text-white focus:outline-none p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-black/95 backdrop-blur-lg z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Bouton de fermeture en haut à droite */}
        <button
          className="absolute top-4 right-4 text-white p-2 z-50"
          onClick={closeMenu}
          aria-label="Fermer le menu"
        >
          <FiX size={28} />
        </button>
        
        {/* Logo en haut */}
        <div className="flex justify-center pt-16 pb-8">
          <div className="flex items-center text-2xl font-bold">
            <BlackHoleLogo className="text-primary mr-2" size={32} />
            <span className="text-primary mr-1">Kasar</span>
            <span className="text-white">Studio</span>
          </div>
        </div>
        
        {/* Liens de navigation */}
        <div className="flex flex-col items-center justify-center h-full pb-20 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center text-xl font-medium transition-colors duration-300 px-4 py-2 rounded-lg ${
                pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              onClick={closeMenu}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 