import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TrackModel from '@/models/Track';
import PricingPlanModel from '@/models/PricingPlan';
import BookingModel from '@/models/Booking';
import ContactModel from '@/models/Contact';
import { FilterQuery } from 'mongoose';
import { ITrackDocument } from '@/models/Track';
import { IPricingPlanDocument } from '@/models/PricingPlan';
import { IBookingDocument } from '@/models/Booking';
import { IContactDocument } from '@/models/Contact';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Récupérer les statistiques des musiques
    const totalTracks = await TrackModel.countDocuments();
    const featuredTracks = await TrackModel.countDocuments({ featured: true });
    
    // Calculer les nouvelles musiques ce mois-ci
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newTracksThisMonth = await TrackModel.countDocuments({
      createdAt: { $gte: firstDayOfMonth },
    } as FilterQuery<ITrackDocument>);
    
    // Récupérer les statistiques des forfaits
    const totalPricingPlans = await PricingPlanModel.countDocuments();
    const popularPricingPlans = await PricingPlanModel.countDocuments({ popular: true });
    
    // Récupérer les statistiques des réservations
    const totalBookings = await BookingModel.countDocuments();
    const pendingBookings = await BookingModel.countDocuments({ status: 'pending' });
    const confirmedBookings = await BookingModel.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await BookingModel.countDocuments({ status: 'cancelled' });
    
    // Récupérer les statistiques des messages
    const totalMessages = await ContactModel.countDocuments();
    const unreadMessages = await ContactModel.countDocuments({ read: false });
    
    // Récupérer les activités récentes
    const recentBookings = await BookingModel.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('customerName service createdAt status')
      .lean();
      
    const recentMessages = await ContactModel.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name service message createdAt read')
      .lean();
      
    const recentTracks = await TrackModel.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title artist genre createdAt')
      .lean();
    
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