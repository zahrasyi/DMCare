import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { StudentsPage } from './components/dashboard/StudentsPage';
import { RegisterStudentPage } from './components/dashboard/RegisterStudentPage';
import { MedicalRecordsPage } from './components/dashboard/MedicalRecordsPage';
import { SickLeavePage } from './components/dashboard/SickLeavePage';
import { MedicineInventoryPage } from './components/dashboard/MedicineInventoryPage';
import { HealthReportsPage } from './components/dashboard/HealthReportsPage';
import React from 'react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('students');
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <RegisterPage
          onRegister={() => setShowRegister(false)}
          onNavigateToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginPage
        onLogin={() => {}}
        onNavigateToRegister={() => setShowRegister(true)}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsPage />;
      case 'register-student':
        return <RegisterStudentPage />;
      case 'medical-records':
        return <MedicalRecordsPage />;
      case 'sick-leave':
        return <SickLeavePage />;
      case 'medicine':
        return <MedicineInventoryPage />;
      case 'reports':
        return <HealthReportsPage />;
      default:
        return <StudentsPage />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
