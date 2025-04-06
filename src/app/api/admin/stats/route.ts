import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PricingPlanModel from "@/models/PricingPlan";
import BookingModel from "@/models/Booking";
import ContactModel from "@/models/Contact";

export async function GET() {
  console.log("API Stats: Début de la récupération des statistiques");
  try {
    console.log("API Stats: Tentative de connexion à MongoDB");
    await dbConnect();
    console.log("API Stats: Connexion à MongoDB réussie");

    // Récupérer les statistiques des forfaits
    console.log("API Stats: Récupération des statistiques de prix");
    const totalPricingPlans = await PricingPlanModel.countDocuments();
    const popularPricingPlans = await PricingPlanModel.countDocuments({
      popular: true,
    });
    console.log("API Stats: Statistiques de prix récupérées:", {
      totalPricingPlans,
      popularPricingPlans,
    });

    // Récupérer les statistiques des réservations
    console.log("API Stats: Récupération des statistiques de réservation");
    const totalBookings = await BookingModel.countDocuments();
    const pendingBookings = await BookingModel.countDocuments({
      status: "pending",
    });
    const confirmedBookings = await BookingModel.countDocuments({
      status: "confirmed",
    });
    const cancelledBookings = await BookingModel.countDocuments({
      status: "cancelled",
    });
    console.log("API Stats: Statistiques de réservation récupérées:", {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
    });

    // Récupérer les statistiques des messages
    console.log("API Stats: Récupération des statistiques de messages");
    const totalMessages = await ContactModel.countDocuments();
    const unreadMessages = await ContactModel.countDocuments({ read: false });
    console.log("API Stats: Statistiques de messages récupérées:", {
      totalMessages,
      unreadMessages,
    });

    // Récupérer les activités récentes
    console.log("API Stats: Récupération des activités récentes");
    const recentBookings = await BookingModel.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("customerName service createdAt status")
      .lean();

    const recentMessages = await ContactModel.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name service message createdAt read")
      .lean();

    console.log("API Stats: Activités récentes récupérées:", {
      bookings: recentBookings.length,
      messages: recentMessages.length,
    });

    // Formater les activités récentes
    const recentActivity = [
      ...recentBookings.map((booking) => ({
        id: booking._id,
        type: "booking",
        title: "Nouvelle réservation",
        description: `${booking.customerName} a réservé une session de ${booking.service}`,
        date: booking.createdAt,
        status: booking.status,
      })),
      ...recentMessages.map((message) => ({
        id: message._id,
        type: "message",
        title: "Nouveau message",
        description: `Message de ${message.name} concernant ${message.service}`,
        date: message.createdAt,
        read: message.read,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    console.log(
      "API Stats: Activités récentes formatées:",
      recentActivity.length
    );

    // Construire l'objet de statistiques
    const stats = {
      pricing: {
        total: totalPricingPlans,
        popular: popularPricingPlans,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
      },
      recentActivity,
    };

    console.log(
      "API Stats: Statistiques générées avec succès, retour de la réponse"
    );
    return NextResponse.json(stats);
  } catch (error) {
    console.error(
      "Erreur détaillée lors de la récupération des statistiques:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
