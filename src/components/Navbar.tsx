"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiInstagram, FiYoutube } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";
import Logo from "./Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Désactiver le défilement du body lorsque le menu mobile est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/tarifs", label: "Enregistrement" },
    { href: "/formations", label: "Formations" },
    {
      href: "/cours-particuliers",
      label: "Cours particuliers",
    },
    { href: "/reservation", label: "Réservation" },
    { href: "/contact", label: "Contact" },
  ];

  const socialLinks = [
    {
      href: "https://instagram.com",
      icon: <FiInstagram size={22} />,
      label: "Instagram",
    },
    {
      href: "https://youtube.com",
      icon: <FiYoutube size={22} />,
      label: "YouTube",
    },
    {
      href: "https://open.spotify.com",
      icon: <FaSpotify size={22} />,
      label: "Spotify",
    },
  ];

  return (
    <>
      {/* Navbar principal */}
      <nav
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 ${
          scrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        {/* Barre de progression horizontale */}
        <div
          className={`h-0.5 bg-gradient-to-r from-primary via-white to-primary transition-transform duration-500 ${
            scrolled ? "scale-x-100" : "scale-x-0"
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
              <Logo
                size={40}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="relative flex items-center group">
                    <span className="font-medium transition-transform duration-300 group-hover:scale-110">
                      {link.label}
                    </span>
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
        className={`fixed inset-0 bg-black z-[90] transition-all duration-500 ease-in-out ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 flex flex-col h-full pt-20 pb-8">
          {/* Bouton de fermeture en haut à droite */}
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <FiX size={24} className="text-white" />
          </button>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`group flex items-center text-2xl font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-gray-300 hover:text-white hover:translate-x-2"
                }`}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Social Links - Remontés avec plus d'espace et redessinés */}
          <div className="flex justify-center items-center space-x-8 pt-12 pb-8 mt-auto">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary w-12 h-12 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110"
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
