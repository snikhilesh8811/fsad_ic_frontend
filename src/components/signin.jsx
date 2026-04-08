import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStorage, signin, signInWithGoogleCredential, decodeJwtPayload } from "../services/authService";
import GoogleSignUpButton from "./auth/GoogleSignUpButton";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const navigateAfterSession = (session) => {
    const role = session.user.role;
    const isApproved = session.user.approvalStatus === "APPROVED";

    if (role === "ADMIN") {
      navigate("/admin-panel");
      return;
    }

    if (role === "CITIZEN") {
      navigate("/hero");
      return;
    }

    if (!isApproved) {
      navigate("/pending-approval");
      return;
    }

    if (role === "EDUCATOR") {
      navigate("/educator-panel");
      return;
    }

    if (role === "LEGAL_EXPERT") {
      navigate("/legal-expert-panel");
      return;
    }

    navigate("/hero");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const session = await signin({
        email: formData.email.trim(),
        password: formData.password,
      });

      authStorage.setSession(session);
      navigateAfterSession(session);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleGoogleCredential = async (credential) => {
    setError(null);
    if (!credential) {
      setError("Google sign-in was cancelled or failed.");
      return;
    }
    
    try {
      // Enter the details of the email into the form visually
      const decoded = decodeJwtPayload(credential);
      if (decoded && decoded.email) {
        setFormData((prev) => ({ ...prev, email: decoded.email }));
      }
    } catch (e) {
      // Ignored
    }

    try {
      const session = await signInWithGoogleCredential(credential);
      authStorage.setSession(session);
      navigateAfterSession(session);
    } catch (err) {
      setError(err.message || "Google sign-in failed");
      console.error(err);
    }
  };

  return (
    <section className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-gradient-to-br from-orange-500 via-white to-green-500 px-3 py-2 sm:px-5 sm:py-3">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
        <div className="mb-2 shrink-0 text-center sm:mb-3">
          <p className="inline-block rounded-full bg-orange-100 px-3 py-0.5 text-[0.65rem] font-semibold tracking-wide text-orange-700 sm:text-xs">
            भारत का संविधान - Samvidhan Path
          </p>
          <h1 className="mt-1 text-xl font-bold leading-tight text-gray-900 sm:text-2xl">Welcome Back</h1>
          <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">
            Sign in to continue your constitutional learning journey.
          </p>
        </div>

        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-2 rounded-xl border border-green-200 bg-white/95 p-3 shadow-xl sm:space-y-2.5 sm:p-4"
          >
            <div className="border-b border-gray-200 pb-2 text-center">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Login</h2>
              <p className="text-[0.7rem] text-gray-600 sm:text-xs">Access your account</p>
            </div>

            {error && <p className="text-center text-xs font-medium text-red-600 sm:text-sm">{error}</p>}

            <div className="space-y-1.5">
              <GoogleSignUpButton
                mode="signin"
                onCredential={handleGoogleCredential}
                onFirebaseSession={(session) => {
                  authStorage.setSession(session);
                  navigateAfterSession(session);
                }}
                onError={(message) => setError(message || "Google sign-in failed.")}
              />
              <div className="relative py-0.5">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-[0.65rem] sm:text-xs">
                  <span className="bg-white/95 px-2 text-gray-500">or with email</span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[0.7rem] font-semibold text-gray-700 sm:text-xs">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="mb-0.5 block text-[0.7rem] font-semibold text-gray-700 sm:text-xs">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-gradient-to-r from-orange-500 to-green-600 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] sm:py-2.5"
            >
              Sign In
            </button>

            <div className="pt-0.5 text-center">
              <p className="text-xs text-gray-700 sm:text-sm">
                Don't have an account?{" "}
                <Link to="/sign-up" className="font-semibold text-orange-600 hover:text-green-700">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
