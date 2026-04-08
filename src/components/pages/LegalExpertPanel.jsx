import React, { useState, useEffect } from "react";
import UserProfile from "./UserProfile";

const LegalExpertPanel = () => {
  const [pendingLessons, setPendingLessons] = useState([]);
  const [expertApprovedLessons, setExpertApprovedLessons] = useState([]);
  const [rejectedLessons, setRejectedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [statusMessage, setStatusMessage] = useState("");
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", content: "", moduleName: "" });
  
  const [rejectingLessonId, setRejectingLessonId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchLessons = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/lessons/pending`),
        fetch(`${API_BASE_URL}/api/lessons/expert-approved`),
        fetch(`${API_BASE_URL}/api/lessons/rejected`)
      ]);
      
      if (pendingRes.ok) {
        setPendingLessons(await pendingRes.json());
      }
      if (approvedRes.ok) {
        setExpertApprovedLessons(await approvedRes.json());
      }
      if (rejectedRes.ok) {
        setRejectedLessons(await rejectedRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleApprove = async (id) => {
    setStatusMessage("Approving...");
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const response = await fetch(`${API_BASE_URL}/api/lessons/${id}/approve`, {
        method: "PATCH"
      });
      if (response.ok) {
        setStatusMessage("Lesson successfully approved and published!");
        fetchLessons(); // update both lists
      } else {
        setStatusMessage("Failed to approve lesson. (Did you restart your backend server?)");
      }
    } catch (err) {
      setStatusMessage("Error approving lesson. (Did you restart your backend server?)");
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      setStatusMessage("Please provide a rejection reason.");
      return;
    }
    
    setStatusMessage("Rejecting...");
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const response = await fetch(`${API_BASE_URL}/api/lessons/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (response.ok) {
        setStatusMessage("Lesson successfully rejected.");
        setRejectingLessonId(null);
        setRejectReason("");
        fetchLessons();
      } else {
        setStatusMessage("Failed to reject lesson.");
      }
    } catch (err) {
      setStatusMessage("Error rejecting lesson.");
      console.error(err);
    }
  };

  return (
    <section className="px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <UserProfile />
        <h1 className="text-3xl font-bold mb-2">Legal Expert Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Review, edit, and approve foundational constitutional content submitted by Admins before it goes to Educators.
        </p>

        {statusMessage && <p className="mt-4 font-medium text-blue-600">{statusMessage}</p>}

        <div className="flex border-b mt-6 mb-6">
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Review
          </button>
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'approved' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Queue
          </button>
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'rejected' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected list
          </button>
        </div>

        <div className="mt-8 space-y-6">
          {activeTab === 'pending' && (
            <>
              {pendingLessons.length === 0 ? (
                <p className="text-gray-500">No lessons are currently awaiting review.</p>
              ) : (
            pendingLessons.map(lsn => (
              <div key={lsn.id} className="p-6 bg-white border border-yellow-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-yellow-600 relative">
                <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                  AWAITING REVIEW
                </span>
                <h3 className="text-xl font-bold">{lsn.title}</h3>
                <p className="text-sm font-semibold text-gray-500 mb-4">{lsn.moduleName}</p>
                
                {editingLessonId === lsn.id ? (
                  <div className="mb-4">
                    <input 
                      className="w-full border p-2 mb-2 rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                      value={editFormData.title} 
                      onChange={e => setEditFormData({...editFormData, title: e.target.value})} 
                    />
                    <input 
                      className="w-full border p-2 mb-2 rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                      value={editFormData.moduleName} 
                      onChange={e => setEditFormData({...editFormData, moduleName: e.target.value})} 
                    />
                    <textarea 
                      className="w-full border p-2 mb-2 rounded h-32 bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                      value={editFormData.content} 
                      onChange={e => setEditFormData({...editFormData, content: e.target.value})} 
                    />
                    <div className="flex gap-2">
                       <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={async () => {
                         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
                         await fetch(`${API_BASE_URL}/api/lessons/${lsn.id}`, {
                           method: "PUT",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify(editFormData)
                         });
                         setEditingLessonId(null);
                         fetchLessons();
                       }}>Save Edits</button>
                       <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => setEditingLessonId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm mb-4">
                    {lsn.content}
                  </div>
                )}
                
                {editingLessonId !== lsn.id && rejectingLessonId !== lsn.id && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleApprove(lsn.id)}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
                    >
                      Approve Match for Educators
                    </button>
                    <button 
                      onClick={() => {
                        setEditingLessonId(lsn.id);
                        setEditFormData({ title: lsn.title, content: lsn.content, moduleName: lsn.moduleName });
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-600 font-semibold rounded hover:bg-blue-200 transition"
                    >
                      Edit Content
                    </button>
                    <button 
                      onClick={() => setRejectingLessonId(lsn.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded hover:bg-red-200 transition"
                    >
                      Reject Lesson
                    </button>
                  </div>
                )}
                
                {rejectingLessonId === lsn.id && (
                  <div className="mt-4 p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900 dark:bg-opacity-20">
                    <label className="block text-red-800 dark:text-red-300 font-semibold mb-2">Rejection Reason</label>
                    <textarea
                      required
                      className="w-full border p-2 mb-2 rounded border-red-300 dark:border-red-600 bg-white text-black dark:bg-gray-800 dark:text-white"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g. Inaccurate information..."
                    />
                    <div className="flex gap-2">
                       <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold" onClick={() => handleReject(lsn.id)}>Confirm Reject</button>
                       <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 font-semibold" onClick={() => {
                         setRejectingLessonId(null);
                         setRejectReason("");
                       }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))
            )}
           </>
          )}

          {activeTab === 'approved' && (
            <>
              {expertApprovedLessons.length === 0 ? (
                <p className="text-gray-500">No lessons approved yet.</p>
              ) : (
                expertApprovedLessons.map(lsn => (
                  <div key={lsn.id} className="p-6 bg-white border border-green-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-green-600 relative">
                    <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                      EXPERT_APPROVED
                    </span>
                    <h3 className="text-xl font-bold">{lsn.title}</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-4">{lsn.moduleName}</p>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm mb-4">
                      {lsn.content}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'rejected' && (
            <>
              {rejectedLessons.length === 0 ? (
                <p className="text-gray-500">No lessons rejected yet.</p>
              ) : (
                rejectedLessons.map(lsn => (
                  <div key={lsn.id} className="p-6 bg-white border border-red-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-red-600 relative">
                    <span className="absolute top-4 right-4 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                      REJECTED
                    </span>
                    <h3 className="text-xl font-bold">{lsn.title}</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-2">{lsn.moduleName}</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">Reason: {lsn.rejectionReason}</p>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm mb-4">
                      {lsn.content}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default LegalExpertPanel;
