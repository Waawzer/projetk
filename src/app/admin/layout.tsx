"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiDollarSign,
  FiCalendar,
  FiMail,
  FiHome,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import BlackHoleLogo from "@/components/BlackHoleLogo";

// Dans une application réelle, vous utiliseriez NextAuth.js ou un autre système d'authentification
// Ceci est une implémentation simplifiée pour la démonstration
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Simuler la vérification d'authentification
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Dans une application réelle, vous feriez une requête API pour vérifier les identifiants
    // Pour cette démonstration, nous utilisons des identifiants codés en dur
    if (username === "admin" && password === "password") {
      localStorage.setItem("admin_token", "demo_token_123");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Identifiants incorrects");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    {
      href: "/admin",
      label: "Tableau de bord",
      icon: <FiHome className="mr-2" />,
    },
    {
      href: "/admin/pricing",
      label: "Tarifs",
      icon: <FiDollarSign className="mr-2" />,
    },
    {
      href: "/admin/bookings",
      label: "Réservations",
      icon: <FiCalendar className="mr-2" />,
    },
    {
      href: "/admin/messages",
      label: "Messages",
      icon: <FiMail className="mr-2" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <BlackHoleLogo size={40} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-gray-400 mt-2">
              Connectez-vous pour accéder au tableau de bord
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-card border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-card border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Se connecter
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-400 mt-4">
            <p>Pour la démonstration :</p>
            <p>
              Nom d&apos;utilisateur :{" "}
              <span className="text-primary">admin</span>
            </p>
            <p>
              Mot de passe : <span className="text-primary">password</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-card border-r border-gray-800">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
            <Link href="/admin" className="flex items-center">
              <BlackHoleLogo className="text-primary mr-2" size={24} />
              <span className="text-xl font-bold text-white">Admin</span>
            </Link>
          </div>
          <div className="flex flex-col flex-grow px-4 py-4">
            <nav className="flex-1 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="pt-4 mt-auto border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white w-full"
              >
                <FiLogOut className="mr-2" />
                Déconnexion
              </button>
              <Link
                href="/"
                className="flex items-center px-4 py-2 mt-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white"
              >
                <FiHome className="mr-2" />
                Retour au site
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden flex items-center justify-between bg-card border-b border-gray-800 p-4">
          <Link href="/admin" className="flex items-center">
            <BlackHoleLogo className="text-primary mr-2" size={24} />
            <span className="text-xl font-bold text-white">Admin</span>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-background pt-16">
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white w-full"
                >
                  <FiLogOut className="mr-2" />
                  Déconnexion
                </button>
                <Link
                  href="/"
                  className="flex items-center px-4 py-3 mt-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiHome className="mr-2" />
                  Retour au site
                </Link>
              </div>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
