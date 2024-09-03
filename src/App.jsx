import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { getCurrentUser } from './Services/appwrite';
import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';
import Loading from './Components/Common/Loading';
import ErrorBoundary from './Components/Common/ErrorBoundary';
import './App.css';

// Lazy-loaded components
const Login = lazy(() => import('./Components/Auth/Login'));
const NoteList = lazy(() => import('./Components/Notes/NoteList'));
const SharedNote = lazy(() => import('./Components/Notes/SharedNote'));
const NoteEditor = lazy(() => import('./Components/Notes/NoteEditor'));
const NoteView = lazy(() => import('./Components/Notes/NoteView'));
const Home = lazy(() => import('./Pages/Home'));
const Editor = lazy(() => import('./Pages/Editor'));
const UserProfile = lazy(() => import('./Components/Auth/UserProfile'));

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <Router>
        <ErrorBoundary>
          <div className="flex flex-col min-h-screen">
            <Header user={user} setUser={setUser} />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home user={user} />} />
                  <Route
                    path="/login"
                    element={user ? <Navigate to="/notes" /> : <Login setUser={setUser} />}
                  />
                  <Route
                    path="/notes"
                    element={user ? <NoteList userId={user.$id} /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/notes/:noteId"
                    element={user ? <NoteView userId={user.$id} /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/new-note"
                    element={user ? <Editor userId={user.$id} /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/edit-note/:noteId"
                    element={user ? <Editor userId={user.$id} /> : <Navigate to="/login" />}
                  />
                  <Route path="/shared-note/:noteId" element={<SharedNote />} />
                  <Route
                    path="/profile"
                    element={user ? <UserProfile user={user} setUser={setUser} /> : <Navigate to="/login" />}
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}