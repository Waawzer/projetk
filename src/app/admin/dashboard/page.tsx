'use client';

import React from 'react';
import { FiUsers, FiCalendar, FiMessageSquare, FiMusic } from 'react-icons/fi';

export default function DashboardPage() {
  return (
    <div className="container px-4 py-6 mx-auto">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 mr-4">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Utilisateurs</p>
              <h3 className="text-2xl font-bold">128</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500/10 text-green-500 mr-4">
              <FiCalendar size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Réservations</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500 mr-4">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Messages</p>
              <h3 className="text-2xl font-bold">42</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500 mr-4">
              <FiMusic size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Morceaux</p>
              <h3 className="text-2xl font-bold">16</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Messages récents</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={`message-${i}`} className="border-b border-gray-800 pb-4 last:border-0">
                <p className="font-medium">Jean Dupont</p>
                <p className="text-gray-400 text-sm">Question sur les tarifs d'enregistrement</p>
                <p className="text-gray-500 text-xs mt-1">Il y a {i} jour{i > 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Réservations récentes</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={`booking-${i}`} className="border-b border-gray-800 pb-4 last:border-0">
                <p className="font-medium">Marie Martin</p>
                <p className="text-gray-400 text-sm">Session d'enregistrement - Studio A</p>
                <p className="text-gray-500 text-xs mt-1">Le {new Date().getDate() + i}/{new Date().getMonth() + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 