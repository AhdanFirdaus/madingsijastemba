import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DOMPurify from "dompurify";
import api from "../api/axios";
import Navbar from "../components/Fragments/Navbar";
import Footer from "../components/Fragments/Footer";
import ArticleCard from "../components/Elements/ArticleCard";
import ArticleActions from "../components/Elements/ArticleActions";
import Button from "../components/Elements/Button";
import { FiSearch } from "react-icons/fi";

export default function Blog() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch articles and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await api.get("/categories");
        setCategories(categoriesResponse.data);

        // Fetch articles
        const articlesResponse = await api.get("/articles", {
          params: { search: searchQuery },
        });
        setArticles(articlesResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load articles or categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category filter
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id === selectedCategory ? null : category.id);
    // In a real app, you might want to filter articles by category via API
    // For now, we'll filter on the client side
  };

  // Filter articles by selected category (client-side for simplicity)
  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.category_id === selectedCategory)
    : articles;

  // Handle like/unlike article
  const handleLikeClick = async (articleId) => {
    try {
      const article = articles.find((a) => a.id === articleId);
      const action = article.liked ? "unlike" : "like";
      const response = await api.post("/articles", {
        action,
        articleId,
      });

      // Update article's liked status
      setArticles((prevArticles) =>
        prevArticles.map((a) =>
          a.id === articleId ? { ...a, liked: action === "like" } : a
        )
      );
      console.log(response.data.message);
    } catch (err) {
      console.error("Error liking/unliking article:", err);
      alert("Failed to like/unlike article. Please try again.");
    }
  };

  // Utility to get image URL
  const getImageUrl = (imagePath) => {
    return imagePath ? `${import.meta.env.VITE_API_BASE_URL}/${imagePath}` : "https://via.placeholder.com/150";
  };

  // Utility to truncate HTML content
  const truncateHTML = (html, maxLength) => {
    const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow bg-white">
        {/* Hero Section with Search */}
        <section className="pt-32 mb-12">
          <div className="container mx-auto max-w-[90%] px-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
              Mading Sija Stembase
            </h1>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 transition-colors cursor-pointer">
                    <FiSearch />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-8">
          <div className="container mx-auto max-w-[90%] px-4">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Categories</h2>
              <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Button
                      key={category.id}
                      color="rose"
                      rounded="rounded-full"
                      txtcolor={
                        selectedCategory === category.id
                          ? "text-white"
                          : "text-rose-500"
                      }
                      className={`border-rose-400 text-sm hover:text-white transition-colors ${
                        selectedCategory === category.id
                          ? "bg-rose-600 text-white"
                          : "bg-rose-600/10"
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No categories available</p>
                )}
              </div>
            </div>

            {/* Articles Grid */}
            {loading ? (
              <div className="text-center text-gray-600">Loading articles...</div>
            ) : error ? (
              <div className="text-center text-rose-600">{error}</div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    getImageUrl={getImageUrl}
                    truncateHTML={truncateHTML}
                  >
                    <ArticleActions
                      article={article}
                      onLikeClick={handleLikeClick}
                      showLike={true} // Only show the Like button
                    />
                  </ArticleCard>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600">
                No articles found matching your criteria.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}