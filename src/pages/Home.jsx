import Navbar from "../components/Fragments/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import Button from "../components/Elements/Button";
import ArticleCard from "../components/Elements/ArticleCard";
import ArticleActions from "../components/Elements/ArticleActions";
import Notification from "../components/Elements/Notification";
import Modal from "../components/Elements/Modal";
import { FiHeart } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { useState, useEffect } from "react";
import api from "../api/axios";
import Footer from "../components/Fragments/Footer";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "error" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6; // Number of articles per page

  const fetchData = async (categoryId = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";

      // Fetch categories
      const categoriesResponse = await api.get("/categories");
      const limitedCategories = categoriesResponse.data.slice(0, 4);
      setCategories(limitedCategories);

      // Fetch articles with optional category filter
      const articlesResponse = await api.get("/articles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          category_id: categoryId, // Pass the selected category ID to the API
        },
      });
      const fetchedArticles = articlesResponse.data;
      const sortedArticles = fetchedArticles
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10) // Limit to 10 articles as per original logic
        .map((article) => ({
          ...article,
          liked: article.liked !== undefined ? article.liked : false,
        }));
      setArticles(sortedArticles);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setNotification({ message: "Gagal memuat data. Coba lagi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedCategory); // Fetch data based on selected category
  }, [selectedCategory]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: "", type: "error" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  const handleStartClick = () => {
    navigate("/blog");
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setCurrentPage(1); // Reset to first page on category change
  };

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
        prevArticles.map((article) =>
          article.id === articleId ? { ...article, liked: !isLiked } : article
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchData(selectedCategory); // Refresh data with current category filter
    } catch (error) {
      console.error("Error handling like/unlike:", error.response?.status, error.response?.data);
      let errorMessage = isLiked ? "Gagal menghapus like." : "Gagal menyukai artikel.";
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Tidak diizinkan. Silakan login lagi.";
            break;
          case 404:
            errorMessage = "Artikel tidak ditemukan.";
            break;
          case 400:
            errorMessage = error.response.data.error || (isLiked ? "Anda belum menyukai artikel ini." : "Anda sudah menyukai artikel ini.");
            break;
          case 500:
            errorMessage = error.response.data.error || "Error server. Coba lagi nanti.";
            break;
          default:
            errorMessage = error.response.data.error || "Terjadi error tak terduga.";
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
  };

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/400x300";
    return `http://localhost/madingsijastemba/api/${image}`;
  };

  const truncateHTML = (html, maxLength) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const latestArticle = articles[0];
  const otherArticles = articles.slice(1, 10);

  // Pagination logic
  const totalPages = Math.ceil(otherArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = otherArticles.slice(indexOfFirstArticle, indexOfLastArticle);

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

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center pt-32 lg:pt-0">
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between max-w-[90%]">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight mb-4">
                Jadilah Bagian dari Inovasi dan Karya-Karya Hebat
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Temukan dan pamerkan karya-karya luar biasa di sini. Bergabunglah sekarang untuk menjadi bagian dari komunitas inovator!
              </p>
              <Button onClick={handleStartClick} color="rose" className="text-lg">
                Mulai
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="lg:w-1/2 flex justify-end"
            >
              <div className="relative">
                <div className="w-64 h-54 sm:w-96 sm:h-80 flex items-center justify-center">
                  <img src="../src/assets/website.svg" alt="website" />
                </div>
                <motion.div
                  className="absolute -top-5 -left-5 w-10 h-10 bg-rose-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-8 h-8 bg-rose-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="py-8 bg-gray-50">
          <div className="container mx-auto max-w-[90%]">
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
                        selectedCategory === category.id ? "text-white" : "text-rose-500"
                      }
                      className={`border-rose-400 text-sm hover:text-white transition-colors ${
                        selectedCategory === category.id
                          ? "bg-rose-600 text-white"
                          : "bg-rose-600/10"
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No categories available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-gray-50 mb-8">
          <div className="container mx-auto max-w-[90%]">
            {loading ? (
              <Notification loading={true} />
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No articles available.</p>
              </div>
            ) : (
              <>
                {/* Latest Article (Custom Section) */}
                {latestArticle && (
                  <div
                    onClick={() => navigate(`/articles/${latestArticle.id}`)}
                    className="mb-12 bg-white shadow-md rounded-2xl overflow-hidden flex flex-col lg:flex-row h-auto lg:h-72 cursor-pointer"
                  >
                    <div className="w-full lg:w-1/3">
                      <img
                        src={getImageUrl(latestArticle.image)}
                        alt={latestArticle.title}
                        className="w-full h-48 lg:h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <span className="text-rose-600 border border-rose-400 bg-rose-600/10 px-2 py-1 rounded-full text-xs font-semibold w-fit">
                        {latestArticle.category_name || "Tidak Ada Kategori"}
                      </span>
                      <h2 className="text-2xl font-bold my-4 text-gray-800">{latestArticle.title}</h2>
                      <p className="text-gray-600 mb-4 flex-grow">
                        {truncateHTML(latestArticle.content, 350)}
                      </p>
                      <div
                        className="flex justify-between items-center mt-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <div className="text-xs">
                            <span className="font-medium text-rose-600">By: {latestArticle.username || "Anonim"}</span>
                            <br />
                            <span className="text-gray-500">
                              {new Date(latestArticle.created_at).toLocaleString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          color="rose"
                          className={`p-2 rounded-full text-white ${latestArticle.liked ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"}`}
                          onClick={() => handleLikeClick(latestArticle.id)}
                        >
                          {latestArticle.liked ? (
                            <AiFillHeart className="w-5 h-5 text-white" />
                          ) : (
                            <FiHeart className="w-5 h-5 stroke-current" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Articles (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            )}
          </div>
        </div>
      </div>

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

      <Footer />
    </>
  );
}