import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Track from '@/models/Track';
import PricingPlan from '@/models/PricingPlan';
import Booking from '@/models/Booking';
import Contact from '@/models/Contact';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Récupérer les statistiques des musiques
    const totalTracks = await Track.countDocuments();
    const featuredTracks = await Track.countDocuments({ featured: true });
    
    // Calculer les nouvelles musiques ce mois-ci
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newTracksThisMonth = await Track.countDocuments({
      createdAt: { $gte: firstDayOfMonth },
    });
    
    // Récupérer les statistiques des forfaits
    const totalPricingPlans = await PricingPlan.countDocuments();
    const popularPricingPlans = await PricingPlan.countDocuments({ popular: true });
    
    // Récupérer les statistiques des réservations
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    // Récupérer les statistiques des messages
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ read: false });
    
    // Récupérer les activités récentes
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('customerName service createdAt status');
      
    const recentMessages = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name service message createdAt read');
      
    const recentTracks = await Track.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title artist genre createdAt');
    
    // Formater les activités récentes
    const recentActivity = [
      ...recentBookings.map(booking => ({
        id: booking._id,
        type: 'booking',
        title: 'Nouvelle réservation',
        description: `${booking.customerName} a réservé une session de ${booking.service}`,
        date: booking.createdAt,
        status: booking.status,
      })),
      ...recentMessages.map(message => ({
        id: message._id,
        type: 'message',
        title: 'Nouveau message',
        description: `Message de ${message.name} concernant ${message.service}`,
        date: message.createdAt,
        read: message.read,
      })),
      ...recentTracks.map(track => ({
        id: track._id,
        type: 'track',
        title: 'Nouvelle musique',
        description: `"${track.title}" par ${track.artist} (${track.genre})`,
        date: track.createdAt,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 5);

    // Construire l'objet de statistiques
    const stats = {
      tracks: {
        total: totalTracks,
        featured: featuredTracks,
        newThisMonth: newTracksThisMonth,
      },
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

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 