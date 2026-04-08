import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStorage, signup, signInWithGoogleCredential, signUpWithGoogleCredential, decodeJwtPayload } from "../services/authService";
import GoogleSignUpButton from "./auth/GoogleSignUpButton";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CITIZEN",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
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

  const handleGoogleCredential = async (credential) => {
    setError(null);
    if (!credential) {
      setError("Google sign-in was cancelled or failed.");
      return;
    }
    
    try {
      const decoded = decodeJwtPayload(credential);
      const email = decoded.email || "";
      const name =
        decoded.name ||
        [decoded.given_name, decoded.family_name].filter(Boolean).join(" ") ||
        "";

      setFormData((prev) => ({
        ...prev,
        email,
        name,
      }));
      setGoogleCredential(credential);
    } catch (err) {
      setError("Could not read Google profile.");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (googleCredential) {
        await signUpWithGoogleCredential(googleCredential, formData.role);
      } else {
        await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/signin");
      }, 3500);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <section className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-gradient-to-br from-orange-500 via-white to-green-500 px-3 py-2 sm:px-5 sm:py-3">
      {success && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
          <div className="animate-fade-in rounded-lg border border-orange-100 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-green-600">Success!</h2>
            <p className="mt-2 text-gray-700">
              {formData.role === "CITIZEN"
                ? "Citizen account created successfully."
                : "Account created successfully and sent for admin approval."}
            </p>
            <p className="mt-2 text-gray-700">Redirecting to sign in page...</p>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
        <div className="mb-2 shrink-0 text-center sm:mb-3">
          <p className="inline-block rounded-full bg-orange-100 px-3 py-0.5 text-[0.65rem] font-semibold tracking-wide text-orange-700 sm:text-xs">
            संविधान जागरूकता मंच - Create Account
          </p>
          <h1 className="mt-1 text-xl font-bold leading-tight text-gray-900 sm:text-2xl">Join Samvidhan Path</h1>
          <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">Create your account and start learning with purpose.</p>
        </div>

        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-2 rounded-xl border border-green-200 bg-white/95 p-3 shadow-xl sm:space-y-2.5 sm:p-4"
          >
            <div className="border-b border-gray-200 pb-2 text-center">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Sign Up</h2>
              <p className="text-[0.7rem] text-gray-600 sm:text-xs">Create your role-based account</p>
            </div>

            {error && <p className="text-center text-xs font-medium text-red-600 sm:text-sm">{error}</p>}

            <div className="space-y-1.5">
              {!googleCredential && (
                <>
                  <GoogleSignUpButton
                    onCredential={handleGoogleCredential}
                    onFirebaseSession={(session) => {
                      authStorage.setSession(session);
                      navigateAfterSession(session);
                    }}
                    onError={(message) => setError(message || "Google sign-in failed. Try again.")}
                  />
                  <div className="relative py-0.5">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[0.65rem] sm:text-xs">
                      <span className="bg-white/95 px-2 text-gray-500">or with email</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-1.5">
              <div className="sm:col-span-1">
                <label className="mb-0.5 block text-[0.7rem] font-semibold text-gray-700 sm:text-xs">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="sm:col-span-1">
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
            </div>

            {!googleCredential && (
              <div>
                <label className="mb-0.5 block text-[0.7rem] font-semibold text-gray-700 sm:text-xs">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div>
              <label className="mb-0.5 block text-[0.7rem] font-semibold text-gray-700 sm:text-xs">Select Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="CITIZEN">Citizen</option>
                <option value="EDUCATOR">Educator</option>
                <option value="LEGAL_EXPERT">Legal Expert</option>
                <option value="ADMIN">Admin (test)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-gradient-to-r from-orange-500 to-green-600 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] sm:py-2.5"
            >
              Sign Up
            </button>

            <div className="pt-0.5 text-center">
              <p className="text-xs text-gray-700 sm:text-sm">
                Already have an account?{" "}
                <Link to="/signin" className="font-semibold text-orange-600 hover:text-green-700">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
