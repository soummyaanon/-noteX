import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Services/appwrite';
import { FiLogOut } from 'react-icons/fi'; // Import the logout icon

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page after successful logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center"
    >
      <FiLogOut className="mr-2" /> {/* Add the icon here */}
      Logout
    </button>
  );
}

export default Logout;