import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Button from "../../components/Elements/Button";
import Modal from "../../components/Elements/Modal";
import Input from "../../components/Elements/Input";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const API_BASE_URL = "http://localhost/madingsijastemba/api";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [token] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const fetchArticles = async () => {
      if (!token) {
        setError("Token not found. Please log in.");
        setArticles([]);
        return;
      }

      try {
        const response = await api.get("/articles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArticles(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setArticles([]);
        setError(
          err.response?.data?.error || "Failed to load articles. Please try again."
        );
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load categories. Please try again."
        );
      }
    };

    fetchArticles();
    fetchCategories();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token not found. Please log in.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.category_id) data.append("category_id", formData.category_id);
    if (formData.image) data.append("image", formData.image);
    if (isEditMode) data.append("id", currentArticle.id);
    data.append("_method", isEditMode ? "PUT" : "POST");

    try {
      const response = await api.post("/articles", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const updatedArticles = await api.get("/articles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArticles(
          Array.isArray(updatedArticles.data) ? updatedArticles.data : []
        );
        setIsModalOpen(false);
        resetForm();
      } else {
        setError(response.data.error || "Failed to save article.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save article.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    if (!token) {
      setError("Token not found. Please log in.");
      return;
    }

    try {
      const response = await api.post(
        "/articles",
        { id, _method: "DELETE" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setArticles(articles.filter((article) => article.id !== id));
      } else {
        setError(response.data.error || "Failed to delete article.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete article.");
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (article) => {
    if (categories.length === 0) {
      setError("Categories not loaded yet. Please try again.");
      return;
    }
    setIsEditMode(true);
    setCurrentArticle(article);
    const newFormData = {
      title: article.title || "",
      content: article.content || "",
      category_id: article.category_id ? String(article.category_id) : "",
      image: null,
    };
    setFormData(newFormData);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", category_id: "", image: null });
    setError("");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${API_BASE_URL}/${imagePath}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Articles</h2>
        <Button
          onClick={openCreateModal}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Create Article
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {articles.length === 0 ? (
        <p className="text-gray-600">No articles available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col"
            >
              {article.image && (
                <img
                  src={getImageUrl(article.image)}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                    console.error(`Failed to load image: ${article.image}`);
                  }}
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.content}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Category: {article.category_name || "No category"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Author: {article.username}
              </p>
              <div className="flex justify-end space-x-2 mt-auto">
                <Button
                  color="green"
                  onClick={() => openEditModal(article)}
                  className="p-2 bg-green-500 text-white hover:bg-green-600"
                >
                  <FiEdit />
                </Button>
                <Button
                  color="rose"
                  onClick={() => handleDelete(article.id)}
                  className="p-2 bg-rose-500 text-white hover:bg-rose-600"
                >
                  <FiTrash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Article" : "Create Article"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter article title"
            required
          />
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-900"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={5}
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 sm:text-sm"
              placeholder="Enter article content"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-900"
            >
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 sm:text-sm"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 hover:file:bg-gray-100"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isEditMode ? "Update Article" : "Save Article"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
