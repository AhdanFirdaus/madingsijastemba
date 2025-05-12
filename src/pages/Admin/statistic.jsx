import { useState, useEffect } from "react";
import api from "../../api/axios";
import Button from "../../components/Elements/Button";
import Notification from "../../components/Elements/Notification";
import ArticleCard from "../../components/Elements/ArticleCard";
import { FiLoader, FiRefreshCw } from "react-icons/fi";

const API_BASE_URL = "http://localhost/madingsijastemba/api";

export default function Statistic() {
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    comments: 0,
    most_viewed_article: null,
    most_liked_article: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token] = useState(localStorage.getItem("token"));
  const [userRole] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").role || "user"
  );

  const MINIMUM_LOADING_TIME = 500;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchStats = async () => {
    if (!token) {
      setError("Token not found. Please log in.");
      setStats({
        users: 0,
        articles: 0,
        comments: 0,
        most_viewed_article: null,
        most_liked_article: null,
      });
      setIsLoading(false);
      return;
    }

    if (userRole !== "admin") {
      setError(`Access denied. Expected role: admin, but got: ${userRole}`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await api.get("/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const elapsedTime = Date.now() - startTime;
      const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setStats(response.data);
      setSuccess("Statistics loaded successfully!");
    } catch (err) {
      setStats({
        users: 0,
        articles: 0,
        comments: 0,
        most_viewed_article: null,
        most_liked_article: null,
      });
      setError(
        err.response?.data?.error || "Failed to load statistics. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token, userRole]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${API_BASE_URL}/${imagePath}`;
  };

  const truncateHTML = (html, maxLength) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    let text = div.textContent || div.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="container mx-auto mb-17">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
        <Button
          onClick={fetchStats}
          color="green"
          className="flex items-center space-x-2"
          disabled={isLoading}
        >
          <FiRefreshCw />
          <span>Refresh Stats</span>
        </Button>
      </div>

      <Notification message={error} type="error" />
      <Notification message={success} type="success" />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin text-rose-500">
            <FiLoader size={40} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Statistik Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <p className="text-3xl font-bold text-rose-500">{stats.users}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-700">Total Articles</h3>
              <p className="text-3xl font-bold text-rose-500">{stats.articles}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-700">Total Comments</h3>
              <p className="text-3xl font-bold text-rose-500">{stats.comments}</p>
            </div>
          </div>

          {/* Artikel Populer */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Popular Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 sm:gap-6 mb-6">
              {/* Most Viewed Article */}
              {stats.most_viewed_article ? (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Most Viewed Article ({stats.most_viewed_article.view_count} Views)
                  </h4>
                  <ArticleCard
                    article={{
                      id: stats.most_viewed_article.id,
                      title: stats.most_viewed_article.title,
                      content: stats.most_viewed_article.content,
                      image: stats.most_viewed_article.image || null,
                      username: stats.most_viewed_article.username,
                      created_at: stats.most_viewed_article.created_at,
                      category_name: stats.most_viewed_article.category_name,
                    }}
                    getImageUrl={getImageUrl}
                    truncateHTML={truncateHTML}
                    onCommentClick={() => {}}
                    onEditClick={() => {}}
                    onDeleteClick={() => {}}
                  />
                </div>
              ) : (
                <p className="text-gray-600">No views recorded yet.</p>
              )}

              {/* Most Liked Article */}
              {stats.most_liked_article ? (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Most Liked Article ({stats.most_liked_article.like_count} Likes)
                  </h4>
                  <ArticleCard
                    article={{
                      id: stats.most_liked_article.id,
                      title: stats.most_liked_article.title,
                      content: stats.most_viewed_article.content,
                      image: stats.most_liked_article.image || null,
                      username: stats.most_liked_article.username,
                      created_at: stats.most_liked_article.created_at,
                      category_name: stats.most_liked_article.category_name,
                    }}
                    getImageUrl={getImageUrl}
                    truncateHTML={truncateHTML}
                    onCommentClick={() => {}}
                    onEditClick={() => {}}
                    onDeleteClick={() => {}}
                  />
                </div>
              ) : (
                <p className="text-gray-600">No likes recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}