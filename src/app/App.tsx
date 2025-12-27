import React, { useState, useEffect } from 'react';
import { depotsApi } from './utils/api';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import NewBooking from './components/NewBooking';
import TripCreation from './components/TripCreation';
import TripsDeliveries from './components/TripsDeliveries';
import Reports from './components/Reports';
import DepotReports from './components/DepotReports';
import AllReceipts from './components/AllReceipts';
import CreditLedger from './components/CreditLedger';
import Settings from './components/Settings';
import OfflineIndicator from './components/OfflineIndicator';
import ConflictResolver from './components/ConflictResolver';
import { startSyncEngine, stopSyncEngine } from './utils/syncEngine';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [assignedDepotId, setAssignedDepotId] = useState<string | null>(null);
  const [depotInfo, setDepotInfo] = useState<any>(null);

  // Initialize sync engine on mount
  useEffect(() => {
    startSyncEngine();
    return () => {
      stopSyncEngine();
    };
  }, []);

  const handleLogin = async (role: string, id: string, depotId?: string | null) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserId(id);
    setAssignedDepotId(depotId || null);

    console.log('handleLogin called:', { role, id, depotId }); // Debug log

    // Fetch depot info for depot managers
    if (role === 'depot_manager' && depotId) {
      console.log('Fetching depot info for:', depotId); // Debug log
      try {
        const info = await depotsApi.getById(depotId);
        console.log('Depot info fetched:', info); // Debug log
        setDepotInfo(info);
      } catch (error) {
        console.error('Error fetching depot info:', error);
      }
    }
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Status Indicator */}
      <OfflineIndicator />
      {/* Conflict Resolution Modal */}
      <ConflictResolver />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.webp" alt="Mango Express Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Mango Express</h1>
                <p className="text-sm text-gray-500 capitalize">{userRole.replace('_', ' ')}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {/* Dashboard - Available to all */}
              <NavItem
                icon="📊"
                label="Dashboard"
                active={currentPage === 'dashboard'}
                onClick={() => setCurrentPage('dashboard')}
              />

              {/* Booking Clerk & Admin have access */}
              {(userRole === 'owner' || userRole === 'booking_clerk') && (
                <NavItem
                  icon="📝"
                  label="New Booking"
                  active={currentPage === 'new_booking'}
                  onClick={() => setCurrentPage('new_booking')}
                />
              )}

              {/* Booking Clerk & Admin + Forwarding Depot Managers */}
              {(userRole === 'owner' || userRole === 'booking_clerk' ||
                (userRole === 'depot_manager' && depotInfo?.forwarding_enabled)) && (
                  <NavItem
                    icon="🚚"
                    label={depotInfo?.forwarding_enabled ? 'Create Forwarding Trip' : 'Create Trip'}
                    active={currentPage === 'trip_creation'}
                    onClick={() => setCurrentPage('trip_creation')}
                  />
                )}

              {/* All users have access */}
              <NavItem
                icon="📦"
                label="Trips & Deliveries"
                active={currentPage === 'trips_deliveries'}
                onClick={() => setCurrentPage('trips_deliveries')}
              />

              {/* Only Admin & Depot Manager (financial access) */}
              {(userRole === 'owner' || userRole === 'depot_manager') && (
                <NavItem
                  icon="📈"
                  label="Reports"
                  active={currentPage === 'reports'}
                  onClick={() => setCurrentPage('reports')}
                />
              )}

              {/* Only Admin & Depot Manager */}
              {(userRole === 'owner' || userRole === 'depot_manager') && (
                <NavItem
                  icon="🧾"
                  label="All Receipts"
                  active={currentPage === 'receipts'}
                  onClick={() => setCurrentPage('receipts')}
                />
              )}

              {/* Only Admin has access to Credit Ledger */}
              {userRole === 'owner' && (
                <NavItem
                  icon="💳"
                  label="Credit Ledger"
                  active={currentPage === 'credit_ledger'}
                  onClick={() => setCurrentPage('credit_ledger')}
                />
              )}

              {/* Only Admin has access to Settings */}
              {userRole === 'owner' && (
                <NavItem
                  icon="⚙️"
                  label="Settings"
                  active={currentPage === 'settings'}
                  onClick={() => setCurrentPage('settings')}
                />
              )}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-8 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {currentPage === 'dashboard' && <Dashboard userRole={userRole} assignedDepotId={assignedDepotId} />}
          {currentPage === 'new_booking' && (userRole === 'owner' || userRole === 'booking_clerk') && <NewBooking onNavigate={setCurrentPage} />}
          {currentPage === 'trip_creation' && (userRole === 'owner' || userRole === 'booking_clerk' ||
            (userRole === 'depot_manager' && depotInfo?.forwarding_enabled)) && <TripCreation userRole={userRole} assignedDepotId={assignedDepotId} />}
          {currentPage === 'trips_deliveries' && <TripsDeliveries userRole={userRole} assignedDepotId={assignedDepotId} />}
          {currentPage === 'reports' && userRole === 'owner' && <Reports assignedDepotId={assignedDepotId} />}
          {currentPage === 'reports' && userRole === 'depot_manager' && assignedDepotId && <DepotReports assignedDepotId={assignedDepotId} />}
          {currentPage === 'receipts' && (userRole === 'owner' || userRole === 'depot_manager') && <AllReceipts assignedDepotId={assignedDepotId} />}
          {currentPage === 'credit_ledger' && userRole === 'owner' && <CreditLedger assignedDepotId={assignedDepotId} />}
          {currentPage === 'settings' && userRole === 'owner' && <Settings userRole={userRole} />}
        </main>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
        ? 'bg-orange-50 text-orange-600'
        : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}