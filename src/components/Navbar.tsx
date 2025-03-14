'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMusic, FiCalendar, FiDollarSign, FiMail, FiInstagram, FiYoutube, FiTwitter } from 'react-icons/fi';
import Logo from './Logo';
import BrandLogo from './BrandLogo';

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
    { href: '/', label: 'Accueil', icon: <FiMusic /> },
    { href: '/tarifs', label: 'Tarifs', icon: <FiDollarSign /> },
    { href: '/reservation', label: 'Réservation', icon: <FiCalendar /> },
    { href: '/contact', label: 'Contact', icon: <FiMail /> },
  ];

  const socialLinks = [
    { href: 'https://instagram.com', icon: <FiInstagram size={20} />, label: 'Instagram' },
    { href: 'https://youtube.com', icon: <FiYoutube size={20} />, label: 'YouTube' },
    { href: 'https://twitter.com', icon: <FiTwitter size={20} />, label: 'Twitter' },
  ];

  return (
    <>
      {/* Navbar principal */}
      <nav 
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 ${
          scrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        {/* Barre de progression horizontale */}
        <div 
          className={`h-0.5 bg-gradient-to-r from-primary via-white to-primary transition-transform duration-500 ${
            scrolled ? 'scale-x-100' : 'scale-x-0'
          }`} 
        />

        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="relative group flex items-center"
              onClick={closeMenu}
            >
              <Logo size={40} className="transition-transform duration-300 group-hover:scale-110" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="relative flex items-center group">
                    <span className="mr-2 transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                    <span className="font-medium transition-transform duration-300 group-hover:scale-110">{link.label}</span>
                  </div>
                  {pathname === link.href && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative p-2 z-[100]"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <div className="text-white transition-transform duration-300 hover:scale-110">
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile séparé */}
      <div 
        className={`fixed inset-0 bg-black z-[90] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-[-100%]'
        }`}
      >
        <div className="container mx-auto px-4 flex flex-col h-full pt-20 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`group flex items-center text-2xl font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-gray-300 hover:text-white hover:translate-x-2'
                }`}
              >
                <span className="mr-4 transition-transform duration-300 group-hover:scale-110">
                  {link.icon}
                </span>
                <span className="transition-transform duration-300 group-hover:scale-110">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex justify-center items-center space-x-8 pt-8 border-t border-white/10">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar; 