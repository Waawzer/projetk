"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiFilter,
  FiCheck,
  FiClock,
  FiXCircle,
  FiCalendar,
  FiEye,
} from "react-icons/fi";
import React from "react";

interface Booking {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service: string;
  date: string;
  time: string;
  endTime?: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  depositPaid?: boolean;
  totalPrice?: number;
  depositAmount?: number;
  remainingAmount?: number;
  remainingPaid?: boolean;
  remainingPaymentDate?: string;
  remainingPaymentMethod?: string;
  paymentMethod?: string;
  paymentId?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "confirmed" | "cancelled" | "completed"
  >("all");
  const [filterPayment, setFilterPayment] = useState<
    "all" | "paid_all" | "paid_deposit" | "paid_none" | "paid_remaining"
  >("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [paypalLink, setPaypalLink] = useState<string | null>(null);
  const [stripeLink, setStripeLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);

        // Récupérer les réservations depuis l'API
        const response = await fetch("/api/admin/bookings");

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des réservations");
        }

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des réservations:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;

    try {
      // Appel API pour supprimer la réservation
      const response = await fetch(
        `/api/admin/bookings?id=${bookingToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la réservation");
      }

      setBookings(
        bookings.filter((booking) => booking._id !== bookingToDelete._id)
      );
      setShowDeleteModal(false);
      setBookingToDelete(null);

      // Si la réservation supprimée est celle qui est actuellement affichée, fermer le modal
      if (selectedBooking && selectedBooking._id === bookingToDelete._id) {
        setSelectedBooking(null);
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la réservation:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
    setPaypalLink(null);
    setStripeLink(null);
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed"
  ) => {
    try {
      // Appel API pour mettre à jour le statut
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      // Mise à jour de l'état local
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      // Mettre à jour le modal si la réservation est actuellement affichée
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  // Nouvelle fonction pour mettre à jour le paiement restant
  const handleRemainingPaymentChange = async (
    bookingId: string,
    paid: boolean,
    method?: string
  ) => {
    try {
      // Appel API pour mettre à jour le paiement
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bookingId,
          remainingPaid: paid,
          remainingPaymentMethod: method || "cash",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du paiement");
      }

      // Mise à jour de l'état local sans utiliser la réponse
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                remainingPaid: paid,
                remainingPaymentMethod: method || "cash",
                remainingPaymentDate: paid
                  ? new Date().toISOString()
                  : undefined,
              }
            : booking
        )
      );

      // Mise à jour du modal si la réservation est actuellement affichée
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          remainingPaid: paid,
          remainingPaymentMethod: method || "cash",
          remainingPaymentDate: paid ? new Date().toISOString() : undefined,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement:", error);
    }
  };

  // Nouvelle fonction pour mettre à jour le statut de paiement de l'acompte
  const handleDepositPaymentChange = async (
    bookingId: string,
    paid: boolean,
    method?: string
  ) => {
    try {
      // Appel API pour mettre à jour le paiement de l'acompte
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bookingId,
          depositPaid: paid,
          paymentMethod: method || "cash",
          status: paid ? "confirmed" : "pending",
          sendConfirmationEmail: paid,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la mise à jour du paiement de l'acompte"
        );
      }

      // Mise à jour de l'état local
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                depositPaid: paid,
                paymentMethod: method || "cash",
                paymentDate: paid ? new Date().toISOString() : undefined,
                status: paid ? "confirmed" : "pending",
              }
            : booking
        )
      );

      // Mise à jour du modal si la réservation est actuellement affichée
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          depositPaid: paid,
          paymentMethod: method || "cash",
          paymentDate: paid ? new Date().toISOString() : undefined,
          status: paid ? "confirmed" : "pending",
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du paiement de l'acompte:",
        error
      );
    }
  };

  // Nouvelle fonction pour générer un lien de paiement PayPal
  const createPayPalLink = async (booking: Booking) => {
    if (!booking.remainingAmount) return;

    try {
      setPaypalLink("Génération du lien en cours...");
      setStripeLink(null); // Réinitialiser le lien Stripe

      const response = await fetch("/api/payment/paypal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: booking.remainingAmount,
          bookingId: booking._id,
          service: getServiceLabel(booking.service),
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          returnUrl: `${window.location.origin}/payment/success?bookingId=${booking._id}&type=remaining`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du lien PayPal");
      }

      const data = await response.json();
      setPaypalLink(data.approveUrl);
    } catch (error) {
      console.error("Erreur lors de la création du lien PayPal:", error);
      setPaypalLink(null);
      alert("Erreur lors de la création du lien PayPal. Veuillez réessayer.");
    }
  };

  // Nouvelle fonction pour générer un lien de paiement Stripe
  const createStripeLink = async (booking: Booking) => {
    if (!booking.remainingAmount) return;

    try {
      setStripeLink("Génération du lien en cours...");
      setPaypalLink(null); // Réinitialiser le lien PayPal

      const response = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: booking.remainingAmount,
          bookingId: booking._id,
          service: getServiceLabel(booking.service),
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          paymentType: "remaining",
          returnUrl: `${window.location.origin}/payment/success?bookingId=${booking._id}&type=remaining`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du lien Stripe");
      }

      const data = await response.json();
      setStripeLink(data.url);
    } catch (error) {
      console.error("Erreur lors de la création du lien Stripe:", error);
      setStripeLink(null);
      alert("Erreur lors de la création du lien Stripe. Veuillez réessayer.");
    }
  };

  // Fonction pour copier le lien PayPal
  const copyPayPalLink = () => {
    if (!paypalLink) return;

    navigator.clipboard
      .writeText(paypalLink)
      .then(() => {
        alert("Lien PayPal copié dans le presse-papiers!");
      })
      .catch((err) => {
        console.error("Erreur lors de la copie:", err);
        // Méthode de repli
        const textarea = document.createElement("textarea");
        textarea.value = paypalLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Lien PayPal copié dans le presse-papiers!");
      });
  };

  // Fonction pour copier le lien Stripe
  const copyStripeLink = () => {
    if (!stripeLink) return;

    navigator.clipboard
      .writeText(stripeLink)
      .then(() => {
        alert("Lien Stripe copié dans le presse-papiers!");
      })
      .catch((err) => {
        console.error("Erreur lors de la copie:", err);
        // Méthode de repli
        const textarea = document.createElement("textarea");
        textarea.value = stripeLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Lien Stripe copié dans le presse-papiers!");
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    return `${formatDate(dateString)} à ${timeString}`;
  };

  const formatDuration = (hours: number) => {
    // Correction: duration est maintenant en heures et non plus en minutes
    return `${hours}h`;
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case "recording":
        return "Enregistrement";
      case "mixing":
        return "Mixage";
      case "mastering":
        return "Mastering";
      case "production":
        return "Production";
      default:
        return service;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "En attente",
          icon: FiClock,
          className: "bg-yellow-500/20 text-yellow-500",
        };
      case "confirmed":
        return {
          label: "Confirmée",
          icon: FiCheck,
          className: "bg-green-500/20 text-green-500",
        };
      case "cancelled":
        return {
          label: "Annulée",
          icon: FiXCircle,
          className: "bg-red-500/20 text-red-500",
        };
      case "completed":
        return {
          label: "Terminée",
          icon: FiCheck,
          className: "bg-blue-500/20 text-blue-500",
        };
      default:
        return {
          label: status,
          icon: FiClock,
          className: "bg-gray-500/20 text-gray-500",
        };
    }
  };

  // Fonction pour déterminer le statut de paiement et la couleur associée
  const getPaymentStatus = (booking: Booking) => {
    // Tout payé (acompte + reste)
    if (booking.depositPaid && booking.remainingPaid) {
      return {
        label: "Payé intégralement",
        className: "bg-green-500/20 text-green-500",
        icon: FiCheck,
        details: "Acompte et solde payés",
      };
    }

    // Acompte payé, reste dû
    if (booking.depositPaid && !booking.remainingPaid) {
      return {
        label: "Acompte payé",
        className: "bg-yellow-500/20 text-yellow-500",
        icon: FiClock,
        details: "Reste à payer",
      };
    }

    // Rien payé
    if (!booking.depositPaid && !booking.remainingPaid) {
      return {
        label: "Non payé",
        className: "bg-red-500/20 text-red-500",
        icon: FiXCircle,
        details: "Acompte et solde dus",
      };
    }

    // Cas rare: solde payé mais pas l'acompte
    if (!booking.depositPaid && booking.remainingPaid) {
      return {
        label: "Solde payé",
        className: "bg-blue-500/20 text-blue-500",
        icon: FiCheck,
        details: "Acompte dû",
      };
    }

    // Par défaut
    return {
      label: "Statut inconnu",
      className: "bg-gray-500/20 text-gray-500",
      icon: FiClock,
      details: "-",
    };
  };

  const filteredBookings = bookings.filter((booking) => {
    // Filtrer par statut
    if (filterStatus !== "all" && booking.status !== filterStatus) return false;

    // Filtrer par statut de paiement
    if (filterPayment !== "all") {
      if (
        filterPayment === "paid_all" &&
        !(booking.depositPaid && booking.remainingPaid)
      )
        return false;
      if (
        filterPayment === "paid_deposit" &&
        !(booking.depositPaid && !booking.remainingPaid)
      )
        return false;
      if (
        filterPayment === "paid_none" &&
        (booking.depositPaid || booking.remainingPaid)
      )
        return false;
      if (
        filterPayment === "paid_remaining" &&
        !(!booking.depositPaid && booking.remainingPaid)
      )
        return false;
    }

    // Filtrer par terme de recherche
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.customerName.toLowerCase().includes(searchLower) ||
      booking.customerEmail.toLowerCase().includes(searchLower) ||
      getServiceLabel(booking.service).toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des réservations</h1>
          <p className="text-gray-400 mt-1">
            Gérez les réservations de vos clients
          </p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="mt-4 md:mt-0 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center justify-center"
        >
          <FiPlus className="mr-2" />
          Nouvelle réservation
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou service..."
              className="bg-gray-700 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm("")}
              >
                <FiX className="text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiFilter className="text-gray-400 mr-2" />
              <select
                className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "confirmed"
                      | "cancelled"
                      | "completed"
                  )
                }
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="cancelled">Annulées</option>
                <option value="completed">Terminées</option>
              </select>
            </div>
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M12 4v.01M12 8v.01M12 12v.01M12 16v.01M12 20v.01M4 12h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <select
                className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filterPayment}
                onChange={(e) =>
                  setFilterPayment(
                    e.target.value as
                      | "all"
                      | "paid_all"
                      | "paid_deposit"
                      | "paid_none"
                      | "paid_remaining"
                  )
                }
              >
                <option value="all">Tous les paiements</option>
                <option value="paid_all">Intégralement payé</option>
                <option value="paid_deposit">Acompte payé uniquement</option>
                <option value="paid_none">Non payé</option>
                <option value="paid_remaining">Solde payé uniquement</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Aucune réservation trouvée
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== "all"
              ? "Aucune réservation ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore de réservations."}
          </p>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg"
          >
            <FiPlus className="mr-2" />
            Créer une réservation
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredBookings.map((booking) => {
                  const StatusIcon = getStatusConfig(booking.status).icon;
                  const PaymentStatus = getPaymentStatus(booking);
                  return (
                    <tr key={booking._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">
                          {getServiceLabel(booking.service)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Durée: {formatDuration(booking.duration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">
                          {formatDateTime(booking.date, booking.time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusConfig(booking.status).className
                          }`}
                        >
                          <StatusIcon className="mr-1" />
                          {getStatusConfig(booking.status).label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PaymentStatus.className}`}
                        >
                          <PaymentStatus.icon className="mr-1" />
                          {PaymentStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="text-blue-400 hover:text-blue-300 focus:outline-none"
                            title="Voir les détails"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(booking)}
                            className="text-red-400 hover:text-red-300 focus:outline-none"
                            title="Supprimer"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer la réservation de{" "}
              <span className="font-semibold">
                {bookingToDelete?.customerName}
              </span>{" "}
              ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de réservation */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Détails de la réservation</h3>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Client</h4>
                <p className="font-medium">{selectedBooking.customerName}</p>
                <p className="text-gray-300">{selectedBooking.customerEmail}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Service</h4>
                <p className="font-medium">
                  {getServiceLabel(selectedBooking.service)}
                </p>
                <p className="text-gray-300">
                  Durée: {formatDuration(selectedBooking.duration)}
                </p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Date et heure</h4>
                <p className="font-medium">
                  {formatDateTime(selectedBooking.date, selectedBooking.time)}
                </p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Statut</h4>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusConfig(selectedBooking.status).className
                    } mr-3`}
                  >
                    {React.createElement(
                      getStatusConfig(selectedBooking.status).icon,
                      { className: "mr-1" }
                    )}
                    {getStatusConfig(selectedBooking.status).label}
                  </span>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedBooking._id,
                        e.target.value as
                          | "pending"
                          | "confirmed"
                          | "cancelled"
                          | "completed"
                      )
                    }
                    className="bg-gray-700 text-white px-2 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">
                  Informations de paiement
                </h4>
                {selectedBooking.totalPrice ? (
                  <div className="space-y-2">
                    <p className="font-medium">
                      Prix total: {selectedBooking.totalPrice}€
                    </p>

                    {selectedBooking.depositAmount && (
                      <div className="flex items-center">
                        <span className="text-gray-300 mr-2">
                          Acompte (
                          {(
                            (selectedBooking.depositAmount /
                              selectedBooking.totalPrice) *
                            100
                          ).toFixed(0)}
                          %):
                        </span>
                        <span
                          className={`${
                            selectedBooking.depositPaid
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {selectedBooking.depositAmount}€{" "}
                          {selectedBooking.depositPaid
                            ? "(Payé)"
                            : "(Non payé)"}
                        </span>
                      </div>
                    )}

                    {selectedBooking.depositAmount && (
                      <div className="mt-1 mb-3">
                        {/* Boutons pour gérer le paiement de l'acompte */}
                        {!selectedBooking.depositPaid ? (
                          <div className="mt-2">
                            <label className="text-sm text-gray-400 mb-2 block">
                              Marquer l&apos;acompte comme payé:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                              <select
                                className="bg-gray-700 text-white px-2 py-2 rounded-lg text-sm col-span-1"
                                id="depositPaymentMethod"
                                defaultValue="cash"
                              >
                                <option value="cash">Espèces</option>
                                <option value="card">Carte bancaire</option>
                                <option value="transfer">Virement</option>
                                <option value="paypal">PayPal</option>
                              </select>
                              <button
                                onClick={() => {
                                  const method = (
                                    document.getElementById(
                                      "depositPaymentMethod"
                                    ) as HTMLSelectElement
                                  ).value;
                                  handleDepositPaymentChange(
                                    selectedBooking._id,
                                    true,
                                    method
                                  );
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                              >
                                Marquer comme payé
                              </button>
                              <button
                                onClick={() => {
                                  // Créer un lien PayPal pour l'acompte
                                  if (selectedBooking.depositAmount) {
                                    createPayPalLink({
                                      ...selectedBooking,
                                      remainingAmount:
                                        selectedBooking.depositAmount,
                                    });
                                  }
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.876-.02.114a.804.804 0 0 1-.794.679h-2.52a.477.477 0 0 1-.47-.543l.955-6.211.01-.01a.802.802 0 0 1 .791-.679h1.666c3.559 0 6.326-1.443 7.134-5.62.003-.013.01-.027.01-.04.307-1.97-.02-3.317-1.143-4.298-4-3.358-16.599-3.358-16.599 4.536v.1c0 .535.145 1.67.398 2.857.564 2.644 1.92 7.015 1.92 7.015a.642.642 0 0 0 .631.516h3.209a.804.804 0 0 0 .794-.679l.04-.22.63-4.876a.803.803 0 0 1 .795-.68H12c3.237 0 5.772-1.313 6.514-5.12.256-1.313.192-2.447-.3-3.327" />
                                </svg>
                                Générer lien PayPal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400">
                              Acompte payé le{" "}
                              {new Date(
                                selectedBooking.paymentDate || ""
                              ).toLocaleDateString()}
                              par{" "}
                              {selectedBooking.paymentMethod === "cash"
                                ? "espèces"
                                : selectedBooking.paymentMethod === "card"
                                ? "carte bancaire"
                                : selectedBooking.paymentMethod === "paypal"
                                ? "PayPal"
                                : "virement"}
                            </p>
                            <button
                              onClick={() =>
                                handleDepositPaymentChange(
                                  selectedBooking._id,
                                  false
                                )
                              }
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 mt-1 rounded-lg text-sm"
                            >
                              Marquer acompte comme non payé
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section pour le reste à payer */}
                    {selectedBooking.depositAmount && (
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="text-gray-300 mr-2">
                            Reste à payer:
                          </span>
                          <span
                            className={`${
                              selectedBooking.remainingPaid
                                ? "text-green-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {selectedBooking.totalPrice -
                              (selectedBooking.depositAmount || 0)}
                            €
                            {selectedBooking.remainingPaid
                              ? " (Payé)"
                              : " (Non payé)"}
                          </span>
                        </div>

                        {/* Bouton pour marquer le paiement restant comme payé/non payé */}
                        {!selectedBooking.remainingPaid ? (
                          <div className="mt-2">
                            <label className="text-sm text-gray-400 mb-2 block">
                              Méthode de paiement:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                              <select
                                className="bg-gray-700 text-white px-2 py-2 rounded-lg text-sm col-span-1"
                                id="remainingPaymentMethod"
                                defaultValue="cash"
                              >
                                <option value="cash">Espèces</option>
                                <option value="card">Carte bancaire</option>
                                <option value="transfer">Virement</option>
                                <option value="paypal">PayPal</option>
                              </select>
                              <button
                                onClick={() => {
                                  const method = (
                                    document.getElementById(
                                      "remainingPaymentMethod"
                                    ) as HTMLSelectElement
                                  ).value;
                                  handleRemainingPaymentChange(
                                    selectedBooking._id,
                                    true,
                                    method
                                  );
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                              >
                                Marquer comme payé
                              </button>
                              <button
                                onClick={() =>
                                  createPayPalLink(selectedBooking)
                                }
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.876-.02.114a.804.804 0 0 1-.794.679h-2.52a.477.477 0 0 1-.47-.543l.955-6.211.01-.01a.802.802 0 0 1 .791-.679h1.666c3.559 0 6.326-1.443 7.134-5.62.003-.013.01-.027.01-.04.307-1.97-.02-3.317-1.143-4.298-4-3.358-16.599-3.358-16.599 4.536v.1c0 .535.145 1.67.398 2.857.564 2.644 1.92 7.015 1.92 7.015a.642.642 0 0 0 .631.516h3.209a.804.804 0 0 0 .794-.679l.04-.22.63-4.876a.803.803 0 0 1 .795-.68H12c3.237 0 5.772-1.313 6.514-5.12.256-1.313.192-2.447-.3-3.327" />
                                </svg>
                                Générer lien PayPal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400">
                              Payé le{" "}
                              {new Date(
                                selectedBooking.remainingPaymentDate || ""
                              ).toLocaleDateString()}
                              par{" "}
                              {selectedBooking.remainingPaymentMethod === "cash"
                                ? "espèces"
                                : selectedBooking.remainingPaymentMethod ===
                                  "card"
                                ? "carte bancaire"
                                : selectedBooking.remainingPaymentMethod ===
                                  "paypal"
                                ? "PayPal"
                                : "virement"}
                            </p>
                            <button
                              onClick={() =>
                                handleRemainingPaymentChange(
                                  selectedBooking._id,
                                  false
                                )
                              }
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 mt-1 rounded-lg text-sm"
                            >
                              Marquer comme non payé
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300">
                    Informations de paiement non disponibles
                  </p>
                )}
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="mb-6">
                <h4 className="text-gray-400 text-sm mb-1">Notes</h4>
                <p className="bg-gray-700 p-3 rounded-lg">
                  {selectedBooking.notes}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => handleDeleteClick(selectedBooking)}
                className="flex items-center text-red-400 hover:text-red-300"
              >
                <FiTrash2 className="mr-1" />
                Supprimer
              </button>
              <button
                onClick={closeBookingModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Fermer
              </button>
            </div>

            {/* Boutons pour générer des liens de paiement */}
            {selectedBooking &&
              !selectedBooking.remainingPaid &&
              selectedBooking.remainingAmount &&
              selectedBooking.depositPaid && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => createPayPalLink(selectedBooking)}
                    className="flex items-center justify-center bg-blue-800 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.554 9.488c.121.563.106 1.246-.04 2.051-.582 2.978-2.477 4.466-5.683 4.466h-.442a.666.666 0 0 0-.444.166.72.72 0 0 0-.239.427l-.041.189-.553 3.479-.021.151a.706.706 0 0 1-.247.426.666.666 0 0 1-.447.166H8.874a.395.395 0 0 1-.331-.15.457.457 0 0 1-.09-.363c.061-.373.148-.938.267-1.689.119-.75.217-1.37.297-1.859l.043-.242c.031-.19.068-.436.114-.735.046-.3.085-.536.114-.711a.28.28 0 0 1 .096-.2.282.282 0 0 1 .187-.07h1.446c.087 0 .155.011.2.035.047.023.08.069.102.137.02.068.029.111.035.194.006.083.001.163-.016.239a5.97 5.97 0 0 1-.008.071l-.147.917-.028.182a.8.8 0 0 0 .264.713c.14.108.325.16.558.16h.266c2.213 0 3.721-1.184 4.254-3.552.224-.818.305-1.593.25-2.328a2.433 2.433 0 0 0-.663-1.57c-.255-.268-.6-.49-1.027-.667z" />
                      <path d="M18.071 6.608c-.303-.424-.723-.745-1.262-.963-.535-.217-1.19-.326-1.967-.326h-3.681a.707.707 0 0 0-.477.195.627.627 0 0 0-.224.425l-1.3 8.148-.013.087a.393.393 0 0 0 .134.33.456.456 0 0 0 .332.141h2.039l.032-.208.558-3.5c.017-.108.066-.193.144-.256a.46.46 0 0 1 .304-.096h.67c1.949 0 3.468-.394 4.553-1.179 1.085-.786 1.666-1.821 1.745-3.099.036-.694-.069-1.276-.307-1.745l-.28.047z" />
                      <path d="M7.847 6.064a.393.393 0 0 1 .297-.138h3.683c.414 0 .784.022 1.112.069a5.13 5.13 0 0 1 .765.139c.198.053.401.126.608.219.154.068.28.131.376.185l.18.099c.07.042.117.071.14.09.176.114.33.246.464.393.134.148.243.309.326.485.099-.012.19-.018.272-.018 1.069 0 1.919.328 2.553.985.634.657.911 1.538.833 2.64-.087 1.544-.817 2.824-2.194 3.84-1.377 1.017-3.144 1.525-5.3 1.525H9.815l-1.042 6.566h-2.79l-.002-.013 1.866-11.708z" />
                    </svg>
                    Générer lien PayPal
                  </button>
                  <button
                    onClick={() => createStripeLink(selectedBooking)}
                    className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2 px-4 rounded"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.453 19.902c-.338.066-.701.107-1.074.107C6.889 20.009 4 18.055 4 14.553c0-3.532 2.889-6.536 6.379-6.536 3.491 0 6.379 3.004 6.379 6.536 0 1.863-.785 3.27-2.129 4.289-.38.287-.521.602-.511.945l.04 1.315c.012.346-.248.62-.594.62-.174 0-.34-.072-.46-.198l-1.032-1.103c-.102-.108-.163-.249-.174-.396l-.044-.519zm3.935-7.963c-.82-.2-1.11-.363-1.11-.607 0-.211.171-.365.487-.365.559 0 1.12.123 1.687.384.208.097.423.146.628.146.629 0 1.098-.512.098-.982 0-.156-.046-.313-.139-.464-.196-.323-.624-.616-1.188-.802.055-.157.087-.322.087-.493 0-.87-.717-1.529-1.882-1.529-.548 0-1.033.161-1.358.451-.368.291-.583.741-.605 1.241-.545.163-.968.522-.968 1.011 0 .589.538 1.007 1.334 1.12l.024.004c-.037.116-.056.23-.056.344 0 .407.24.748.694.97l.017.009c-.608.179-2.615.821-2.615 2.474 0 1.504 1.461 2.419 2.989 2.419 2.095 0 3.537-1.214 3.537-2.54 0-.851-.694-1.442-2.661-1.816zm-10.913.864c.625 0 1.193.314 1.193.966 0 .572-.53.86-1.175.86-.59 0-1.192-.286-1.192-.86 0-.652.602-.966 1.174-.966zm5.906 2.764c.627 0 1.083.362 1.083.798 0 .51-.534 1.012-1.51 1.012-.828 0-1.472-.416-1.472-1.01 0-.444.419-.8 1.17-.8h.73zM8.293 13.57c-.625 0-1.147-.34-1.147-.948 0-.536.474-.918 1.111-.918.764 0 1.193.487 1.193.918 0 .607-.5.948-1.157.948z" />
                    </svg>
                    Générer lien carte
                  </button>
                </div>
              )}

            {/* Affichage du lien PayPal une fois généré */}
            {paypalLink && (
              <div className="mt-3 bg-gray-700 p-2 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-400">
                    Lien de paiement PayPal:
                  </label>
                  <button
                    onClick={copyPayPalLink}
                    className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copier
                  </button>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={paypalLink}
                    readOnly
                    className="bg-gray-600 text-white text-xs w-full rounded-lg p-2 pr-10 overflow-x-auto whitespace-nowrap"
                    style={{ scrollbarWidth: "none" }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Envoyez ce lien au client pour qu&apos;il puisse effectuer le
                  paiement restant.
                </p>
              </div>
            )}

            {/* Affichage du lien Stripe une fois généré */}
            {stripeLink && (
              <div className="mt-3 bg-gray-700 p-2 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-400">
                    Lien de paiement Stripe:
                  </label>
                  <button
                    onClick={copyStripeLink}
                    className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copier
                  </button>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={stripeLink}
                    readOnly
                    className="bg-gray-600 text-white text-xs w-full rounded-lg p-2 pr-10 overflow-x-auto whitespace-nowrap"
                    style={{ scrollbarWidth: "none" }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Envoyez ce lien au client pour qu&apos;il puisse effectuer le
                  paiement restant.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
