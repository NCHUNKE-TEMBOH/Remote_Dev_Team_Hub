import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationPanel from './NotificationPanel';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-midnight-950 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationPanelOpen(true)}
        />
        
        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Notification panel */}
      <NotificationPanel 
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
