import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { UserButton } from '../../auth/components/UserButton';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed UserButton in upper right corner */}
      <div className="fixed top-4 right-4 z-50">
        <UserButton />
      </div>
      
      {/* Main content area */}
      <main className="pt-16 px-4">
        <Outlet />
      </main>
    </div>
  );
}
