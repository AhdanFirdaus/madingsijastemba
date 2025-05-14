import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DOMPurify from "dompurify";
import api from "../api/axios";
import Navbar from "../components/Fragments/Navbar";
import Footer from "../components/Fragments/Footer";
import ArticleCard from "../components/Elements/ArticleCard";
import ArticleActions from "../components/Elements/ArticleActions";
import Button from "../components/Elements/Button";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Modal from "../components/Elements/Modal";
import Notification from "../components/Elements/Notification";

export default function Blog() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "error" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6; // Number of articles per page

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
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category filter
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id === selectedCategory ? null : category.id);
    setCurrentPage(1); // Reset to first page on category change
  };

  // Filter articles by selected category (client-side for simplicity)
  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.category_id === selectedCategory)
    : articles;

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Handle like/unlike article
  const handleLikeClick = async (articleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
      return;
    }

    const article = articles.find((a) => a.id === articleId);
    const isLiked = article?.liked || false;
    const action = isLiked ? "unlike" : "like";

    try {
      console.log("Sending request:", { action, articleId });
      const response = await api.post(
        "/articles",
        { action, articleId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNotification({
        message: response.data.message || (isLiked ? "Like berhasil dihapus!" : "Artikel berhasil disukai!"),
        type: "success",
      });

      setArticles((prevArticles) =>
        prevArticles.map((a) =>
          a.id === articleId ? { ...a, liked: !isLiked } : a
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      const articlesResponse = await api.get("/articles", {
        params: { search: searchQuery },
      });
      setArticles(articlesResponse.data);
    } catch (err) {
      console.error("Error handling like/unlike:", err.response?.status, err.response?.data);
      let errorMessage = isLiked ? "Gagal menghapus like." : "Gagal menyukai artikel.";
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Tidak diizinkan. Silakan login lagi.";
            break;
          case 404:
            errorMessage = "Artikel tidak ditemukan.";
            break;
          case 400:
            errorMessage = err.response.data.error || (isLiked ? "Anda belum menyukai artikel ini." : "Anda sudah menyukai artikel ini.");
            break;
          case 500:
            errorMessage = err.response.data.error || "Error server. Coba lagi nanti.";
            break;
          default:
            errorMessage = err.response.data.error || "Terjadi error tak terduga.";
        }
      } else {
        errorMessage = "Error jaringan. Periksa koneksi Anda.";
      }
      setNotification({ message: errorMessage, type: "error" });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLoginRedirect = () => {
    navigate("/login");
    setIsModalOpen(false);
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

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: "", type: "error" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

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
              <h2 className="text-3xl font-bold text-gray-800">Articles</h2>
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      getImageUrl={getImageUrl}
                      truncateHTML={truncateHTML}
                    >
                      <ArticleActions
                        article={article}
                        onLikeClick={handleLikeClick}
                        showLike={true}
                      />
                    </ArticleCard>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center my-6 space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-full cursor-pointer ${
                        currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-100'
                      }`}
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`px-4 py-2 rounded-md cursor-pointer ${
                          currentPage === number ? 'bg-rose-500 text-white' : 'text-rose-500 hover:bg-rose-100'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-full cursor-pointer ${
                        currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-100'
                      }`}
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
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

      {/* Modal for Login Prompt */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Login Required"
        footer={
          <>
            <Button color="rose" onClick={handleModalClose} className="mr-2">
              Cancel
            </Button>
            <Button color="green" onClick={handleLoginRedirect}>
              Login
            </Button>
          </>
        }
      >
        <p className="text-gray-700">Please log in to like this article.</p>
      </Modal>
    </div>
  );
}