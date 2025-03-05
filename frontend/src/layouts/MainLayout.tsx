import React from "react";
import { Outlet } from "react-router-dom";
import AuthErrorToast from "../components/auth/AuthErrorToast";

/**
 * Main layout component that wraps the application content
 * Includes common elements like navigation, footer, and error toast
 */
const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Include navbar component here when it's available */}
      {/* <Navbar /> */}

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* AuthErrorToast displays auth-related error messages */}
        <AuthErrorToast />

        {/* Outlet renders the matched route component */}
        <Outlet />
      </main>

      {/* Include footer component here when it's available */}
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
