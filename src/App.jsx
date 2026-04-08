import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import Services from "./components/Services/Services";
import Banner from "./components/Banner/Banner";
import Subscribe from "./components/Subscribe/Subscribe";
import Banner2 from "./components/Banner/Banner2";
import Constitution from "./components/pages/constitution";
import Explore from "./components/pages/explore";
import Learn from "./components/pages/Learn";
import Citizen from "./components/pages/citizen";
import Contact from "./components/pages/contact";
import Engage from "./components/pages/engage";
import Games from "./components/pages/games";
import Ebooks from "./components/pages/ebooks";
import CaseStudies from "./components/pages/Explore/casestudies";
import Preamble from "./components/pages/constitution/preamble";
import History from "./components/pages/constitution/history";
import Rights from "./components/pages/Citizens/rights";
import Duties from "./components/pages/Citizens/duties";
import DPSP from "./components/pages/Citizens/dpsp";
import Schedules from "./components/pages/Citizens/schedules";
import Amendments from "./components/pages/Citizens/amendments";
import CitizenLessons from "./components/pages/Citizens/CitizenLessons";
import MarkdownViewer from "./components/MarkdownViewer";
import Signin from "./components/signin";
import Terms from "./components/pages/terms";
import BlogPage from "./components/pages/Engage/blog";
import PodcastPage from "./components/pages/Engage/podcast";
import VideoPage from "./components/pages/Engage/video";
import GoogleTranslate from "./components/Language";
import DiscussionForum from "./components/pages/Engage/discussion";
import QuizComponent from "./components/pages/Quiz/QuizComponent";
import PuzzleIntro from "./components/pages/Games/Puzzle/Intro";
import PuzzleGame from "./components/pages/Games/Puzzle/Game";
import ConstitutionSimplified from "./components/pages/Explore/ConstitutionSimplified";
import WordSearch from "./components/pages/Games/WordSearch/WordSearch";
import CrosswordGame from "./components/pages/Games/CrossWord/CrossWord";
import AboutUs from "./components/pages/AboutUs";
import SignUp from "./components/sign-up";
import ScrollToTop from "./components/Scrolltotop";
import PendingApproval from "./components/pages/PendingApproval";
import AdminPanel from "./components/pages/AdminPanel";
import EducatorPanel from "./components/pages/EducatorPanel";
import LegalExpertPanel from "./components/pages/LegalExpertPanel";
import CitizenPanel from "./components/pages/CitizenPanel";
import { onAuthStateChanged } from "firebase/auth";
import { authStorage } from "./services/authService";
import {
  isFirebaseConfigured,
  getFirebaseAuthAndDb,
  buildSessionFromFirebaseUser,
} from "./services/firebaseAuth";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(authStorage.getSession());

  const isLoggedIn = Boolean(session?.user);
  const currentRole = session?.user?.role || "";
  const isApproved = session?.user?.approvalStatus === "APPROVED";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.style.display = "none";
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const refreshSession = () => setSession(authStorage.getSession());
    // local testing: update session in the same tab too
    window.addEventListener("auth_session_updated", refreshSession);
    window.addEventListener("auth_session_cleared", refreshSession);
    return () => {
      window.removeEventListener("auth_session_updated", refreshSession);
      window.removeEventListener("auth_session_cleared", refreshSession);
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const el = getFirebaseAuthAndDb();
    if (!el) return undefined;
    const { auth } = el;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const next = await buildSessionFromFirebaseUser(user);
          authStorage.setSession(next);
        } catch (e) {
          console.error(e);
        }
      } else {
        authStorage.clearSession();
      }
      setSession(authStorage.getSession());
    });
    return () => unsub();
  }, []);

  // Wrapper for protected routes
  const ProtectedRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/" />;
  };

  const RoleRoute = ({ allowedRoles, requiresApproval = false, element }) => {
    if (!isLoggedIn) {
      return <Navigate to="/signin" />;
    }

    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to="/hero" />;
    }

    if (requiresApproval && !isApproved) {
      return <Navigate to="/pending-approval" />;
    }

    return element;
  };

  return (
    <Router>
      <main className="overflow-x-hidden">

        {/* Show Navbar only after login */}
        {isLoggedIn && <Navbar />}

        <main className="text-black bg-white dark:bg-gray-800 dark:text-white">
          <Routes>

            {/* Default routes */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  currentRole === "ADMIN" ? (
                    <Navigate to="/admin-panel" />
                  ) : currentRole === "EDUCATOR" ? (
                    isApproved ? <Navigate to="/educator-panel" /> : <Navigate to="/pending-approval" />
                  ) : currentRole === "LEGAL_EXPERT" ? (
                    isApproved ? <Navigate to="/legal-expert-panel" /> : <Navigate to="/pending-approval" />
                  ) : (
                    <Navigate to="/hero" />
                  )
                ) : (
                  <Signin />
                )
              }
            />
            <Route path="/signin" element={<Signin />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/pending-approval" element={<ProtectedRoute element={<PendingApproval />} />} />
            <Route path="/citizen-panel" element={<ProtectedRoute element={<CitizenPanel />} />} />

            <Route
              path="/admin-panel"
              element={<RoleRoute allowedRoles={["ADMIN"]} element={<AdminPanel />} />}
            />
            <Route
              path="/educator-panel"
              element={
                <RoleRoute
                  allowedRoles={["EDUCATOR"]}
                  requiresApproval={true}
                  element={<EducatorPanel />}
                />
              }
            />
            <Route
              path="/legal-expert-panel"
              element={
                <RoleRoute
                  allowedRoles={["LEGAL_EXPERT"]}
                  requiresApproval={true}
                  element={<LegalExpertPanel />}
                />
              }
            />

            {/* Protected Routes */}
            <Route path="/hero" element={<ProtectedRoute element={<Hero />} />} />
            <Route path="/services" element={<ProtectedRoute element={<Services />} />} />
            <Route path="/banner" element={<ProtectedRoute element={<Banner />} />} />
            <Route path="/subscribe" element={<ProtectedRoute element={<Subscribe />} />} />
            <Route path="/banner2" element={<ProtectedRoute element={<Banner2 />} />} />
            <Route path="/constitution" element={<ProtectedRoute element={<Constitution />} />} />
            <Route path="/explore" element={<ProtectedRoute element={<Explore />} />} />
            <Route path="/learn" element={<ProtectedRoute element={<Learn />} />} />
            <Route path="/citizen" element={<ProtectedRoute element={<Citizen />} />} />
            <Route path="/contact" element={<ProtectedRoute element={<Contact />} />} />
            <Route path="/engage" element={<ProtectedRoute element={<Engage />} />} />
            <Route path="/games" element={<ProtectedRoute element={<Games />} />} />
            <Route path="/ebooks" element={<ProtectedRoute element={<Ebooks />} />} />
            <Route path="/aboutus" element={<ProtectedRoute element={<AboutUs />} />} />
            <Route path="/casestudies" element={<ProtectedRoute element={<CaseStudies />} />} />

            {/* Constitution Sub Routes */}
            <Route path="/constitution/preamble" element={<ProtectedRoute element={<Preamble />} />} />
            <Route path="/constitution/history" element={<ProtectedRoute element={<History />} />} />

            {/* Citizen Sub Routes */}
            <Route path="/citizen/rights" element={<ProtectedRoute element={<Rights />} />} />
            <Route path="/citizen/duties" element={<ProtectedRoute element={<Duties />} />} />
            <Route path="/citizen/dpsp" element={<ProtectedRoute element={<DPSP />} />} />
            <Route path="/citizen/schedules" element={<ProtectedRoute element={<Schedules />} />} />
            <Route path="/citizen/amendment" element={<ProtectedRoute element={<Amendments />} />} />
            <Route path="/citizen/lessons" element={<ProtectedRoute element={<CitizenLessons />} />} />

            {/* Engage */}
            <Route path="/engage/discussionforum" element={<ProtectedRoute element={<DiscussionForum />} />} />
            <Route path="/engage/blog" element={<ProtectedRoute element={<BlogPage />} />} />
            <Route path="/engage/podcast" element={<ProtectedRoute element={<PodcastPage />} />} />
            <Route path="/engage/video" element={<ProtectedRoute element={<VideoPage />} />} />

            {/* Other */}
            <Route path="/docs/:fileName" element={<ProtectedRoute element={<MarkdownViewer />} />} />
            <Route path="/translate" element={<ProtectedRoute element={<GoogleTranslate />} />} />
            <Route path="/quiz" element={<ProtectedRoute element={<QuizComponent />} />} />

            {/* Games */}
            <Route path="/games/word-search" element={<ProtectedRoute element={<WordSearch />} />} />
            <Route path="/games/crossword" element={<ProtectedRoute element={<CrosswordGame />} />} />
            <Route path="/games/puzzle" element={<ProtectedRoute element={<PuzzleIntro />} />} />
            <Route path="/games/puzzle/:level" element={<ProtectedRoute element={<PuzzleGame />} />} />

            {/* Explore */}
            <Route path="/explore/constitution-simplified" element={<ProtectedRoute element={<ConstitutionSimplified />} />} />

            {/* Terms */}
            <Route path="/t&C" element={<ProtectedRoute element={<Terms />} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ScrollToTop />

        {/* Show Footer only after login */}
        {isLoggedIn && <Footer />}

        <Analytics />
        <SpeedInsights />
      </main>
    </Router>
  );
};

export default App;