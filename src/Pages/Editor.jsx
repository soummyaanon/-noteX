import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../Services/appwrite';
import { motion } from 'framer-motion';

const NoteEditor = lazy(() => import('../Components/Notes/NoteEditor'));

const EditorPage = () => {
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user && isMounted) {
          setUserId(user.$id);
        } else if (isMounted) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Consider adding a toast notification here for better user feedback
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (!userId) {
    return null; // Or a loading spinner
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <NoteEditor userId={userId} />
      </Suspense>
    </motion.div>
  );
};

export default EditorPage;