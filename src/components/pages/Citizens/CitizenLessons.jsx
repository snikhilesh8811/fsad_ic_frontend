import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CitizenLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/lessons`);
      if (!res.ok) {
        throw new Error("Failed to fetch lessons");
      }
      const data = await res.json();
      setLessons(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load lessons. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-orange-50 via-white to-green-50 pt-20 px-4 pb-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Constitutional Lessons</h1>
          <p className="mt-3 text-lg text-gray-600">
            Explore curated lessons prepared by experts and educators to help you understand your Constitution.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">{error}</div>
        ) : lessons.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">No lessons are currently published. Please check back later!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                    {lesson.moduleName || "General Topic"}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                  {lesson.title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-gray-600 line-clamp-3">
                  {lesson.content}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-400">
                    Published: {new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    onClick={() => {
                        // For a real app, this could open a modal or dedicated page.
                        // Here we just expand the content
                        alert(lesson.content);
                    }}
                  >
                    Read More &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenLessons;
