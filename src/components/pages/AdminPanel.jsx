import React, { useEffect, useState } from "react";
import { getPendingApprovals, updateApprovalStatus, authStorage } from "../../services/authService";
import UserProfile from "./UserProfile";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [queries, setQueries] = useState([]);
  
  const [newLesson, setNewLesson] = useState({ title: "", content: "", moduleName: "" });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const session = authStorage.getSession();
  const token = session?.token;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const fetchPendingUsers = async () => {
    setLoading(true); setError("");
    try {
      const users = await getPendingApprovals(token);
      setPendingUsers(users.filter((user) => user.approvalStatus === "PENDING"));
    } catch (err) {
      setError(err.message || "Unable to fetch pending users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      if (res.ok) setAllUsers(await res.json());
    } catch (err) {
      setError("Unable to fetch all users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLessons = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/all`);
      if (res.ok) setLessons(await res.json());
    } catch (err) {
      setError("Unable to fetch lessons.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`);
      if (res.ok) setQueries(await res.json());
    } catch (err) {
      console.error("Unable to fetch queries.", err);
    }
  };

  useEffect(() => {
    if (activeTab === "approvals") fetchPendingUsers();
    else if (activeTab === "users") fetchAllUsers();
    else if (activeTab === "content") fetchAllLessons();
    else if (activeTab === "queries") fetchQueries();
  }, [activeTab]);

  const handleStatusUpdate = async (userId, status) => {
    setActionMessage("");
    try {
      await updateApprovalStatus(userId, status, token);
      setActionMessage(`User ${status.toLowerCase()} successfully.`);
      fetchPendingUsers();
    } catch (err) {
      setError(err.message || "Unable to update approval status");
    }
  };

  const handleDeleteLesson = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/lessons/${id}`, { method: 'DELETE' });
      fetchAllLessons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuery = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/contact/${id}`, { method: 'DELETE' });
      fetchQueries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLesson),
      });
      if (!res.ok) throw new Error("Failed to create lesson");
      setActionMessage("Lesson created successfully. Status: PENDING (Waiting for Legal Expert).");
      setNewLesson({ title: "", content: "", moduleName: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <UserProfile />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        
        {/* Navigation Tabs */}
        <div className="flex border-b mt-6 mb-6">
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'approvals' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('approvals')}
          >
            Pending Roles
          </button>
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
          >
            All Users
          </button>
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'content' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('content')}
          >
            Content Overview
          </button>
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'create_lesson' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('create_lesson')}
          >
            Create Lesson
          </button>
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'queries' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('queries')}
          >
            Citizen Queries
          </button>
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}
        {actionMessage && <p className="mt-4 text-green-600">{actionMessage}</p>}

        {loading ? (
          <p className="mt-6 font-bold text-gray-500">Loading data...</p>
        ) : (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            
            {/* TAB: APPROVALS */}
            {activeTab === 'approvals' && (
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Requested Role</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.length === 0 ? (
                    <tr><td className="p-4" colSpan="4">No pending approvals.</td></tr>
                  ) : (
                    pendingUsers.map((user) => (
                      <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-3">{user.name || "N/A"}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3 font-semibold text-yellow-600">{user.role}</td>
                        <td className="p-3 flex gap-2">
                          <button onClick={() => handleStatusUpdate(user.id, "APPROVED")} className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700">Approve</button>
                          <button onClick={() => handleStatusUpdate(user.id, "REJECTED")} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">Reject</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB: ALL USERS */}
            {activeTab === 'users' && (
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="p-3">{user.name || "N/A"}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.role}</td>
                      <td className={`p-3 font-bold ${user.status === 'APPROVED' ? 'text-green-500' : 'text-gray-500'}`}>{user.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TAB: CONTENT OVERVIEW */}
            {activeTab === 'content' && (
              <div className="p-4 grid gap-4 lg:grid-cols-2">
                {lessons.length === 0 && <p>No lessons available.</p>}
                {lessons.map(lsn => (
                  <div key={lsn.id} className="border p-4 rounded bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-lg">{lsn.title}</h3>
                      <button onClick={() => handleDeleteLesson(lsn.id)} className="text-red-500 hover:text-red-700 font-bold text-sm">Delete</button>
                    </div>
                    <p className="text-sm font-semibold text-gray-400">{lsn.moduleName} - <span className={["APPROVED", "PUBLISHED", "EXPERT_APPROVED"].includes(lsn.approvalStatus) ? 'text-green-500' : lsn.approvalStatus === 'REJECTED' ? 'text-red-500' : 'text-yellow-600'}>{lsn.approvalStatus}</span></p>
                    {lsn.approvalStatus === 'REJECTED' && (
                      <p className="mt-1 text-sm font-bold text-red-500 border-l-2 border-red-500 pl-2">Reason: {lsn.rejectionReason}</p>
                    )}
                    <p className="mt-2 text-sm line-clamp-3">{lsn.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: CREATE LESSON */}
            {activeTab === 'create_lesson' && (
              <div className="p-4">
                <form onSubmit={handleCreateLesson} className="max-w-xl flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lesson Title</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full border rounded p-2 text-black" 
                      value={newLesson.title} 
                      onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                      placeholder="e.g. Introduction to Article 14"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Module Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full border rounded p-2 text-black" 
                      value={newLesson.moduleName} 
                      onChange={e => setNewLesson({...newLesson, moduleName: e.target.value})}
                      placeholder="e.g. Fundamental Rights"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lesson Content</label>
                    <textarea 
                      required 
                      rows="6" 
                      className="w-full border rounded p-2 text-black" 
                      value={newLesson.content} 
                      onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                      placeholder="Enter the foundational text..."
                    ></textarea>
                  </div>
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mt-2">
                    Submit Lesson for Review
                  </button>
                </form>
              </div>
            )}

            {/* TAB: CITIZEN QUERIES */}
            {activeTab === 'queries' && (
              <div className="p-4 grid gap-4 lg:grid-cols-2">
                {queries.length === 0 && <p className="text-gray-500">No Citizen Queries found.</p>}
                {queries.map(q => (
                  <div key={q.id} className="border p-4 rounded bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{q.firstName} {q.lastName}</h3>
                      <button onClick={() => handleDeleteQuery(q.id)} className="text-gray-400 hover:text-red-500 font-bold text-sm">Dismiss</button>
                    </div>
                    <a href={`mailto:${q.email}`} className="text-sm font-semibold text-gray-500 underline mb-4 inline-block">{q.email}</a>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded text-sm text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                      {q.message}
                    </div>
                    <p className="mt-3 text-xs text-gray-400">{new Date(q.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPanel;
