import React from "react";
import { Link } from "react-router-dom";

const PendingApproval = () => {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 px-6">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-gray-800">Approval Pending</h1>
        <p className="mt-4 text-gray-600">
          Your account is created successfully. An admin needs to approve your role before you can access your panel.
        </p>
        <p className="mt-2 text-gray-600">
          Please check back later or contact the admin team.
        </p>

        <Link
          to="/signin"
          className="inline-block mt-6 rounded-md bg-yellow-500 px-5 py-3 text-white hover:bg-yellow-600"
        >
          Back to Sign In
        </Link>
      </div>
    </section>
  );
};

export default PendingApproval;
