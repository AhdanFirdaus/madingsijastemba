import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/axios";
import Button from "../../components/Elements/Button";
import Modal from "../../components/Elements/Modal";
import Input from "../../components/Elements/Input";
import Notification from "../../components/Elements/Notification";
import ReactQuill from "react-quill-new";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const API_BASE_URL = "http://localhost/madingsijastemba/api";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "link",
];

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryConfirmModalOpen, setIsCategoryConfirmModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    image: null,
  });
  const [categoryFormData, setCategoryFormData] = useState({ name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token] = useState(localStorage.getItem("token"));
  const formRef = useRef(null);
  const categoryFormRef = useRef(null);

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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  const debouncedHandleContentChange = useCallback(
    debounce((value, setFormData) => {
      setFormData((prev) => ({ ...prev, content: value }));
    }, 300),
    []
  );

  const handleContentChange = (value) => {
    debouncedHandleContentChange(value, setFormData);
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token not found. Please log in.");
      return;
    }

    if (!isEditMode && !formData.image) {
      setError("An image is required when creating a new article.");
      return;
    }

    if (!formData.content || formData.content === "<p><br></p>") {
      setError("Content is required.");
      return;
    }

    const sanitizedContent = DOMPurify.sanitize(formData.content);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", sanitizedContent);
    if (formData.category_id) data.append("category_id", formData.category_id);
    if (formData.image) data.append("image", formData.image);

    try {
      let response;
      if (isEditMode && currentArticle?.id) {
        data.append("id", currentArticle.id);
        data.append("_method", "PUT");
        response = await api.post(`/articles`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await api.post("/articles", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        await fetchArticlesAndUpdateState();
        setIsModalOpen(false);
        resetForm();
        setSuccess(
          `Article ${isEditMode ? "updated" : "created"} successfully!`
        );
      } else {
        setError(response.data.error || `Failed to ${isEditMode ? "update" : "save"} article.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? "update" : "save"} article.`);
      console.error("handleSubmit Error:", err);
    }
  };

  const fetchArticlesAndUpdateState = async () => {
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

  const fetchCategoriesAndUpdateState = async () => {
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

  const handleDelete = (article) => {
    setArticleToDelete(article);
    setIsConfirmModalOpen(true);
  };

  const executeDelete = async () => {
    if (!token) {
      setError("Token not found. Please log in.");
      setIsConfirmModalOpen(false);
      setArticleToDelete(null);
      return;
    }

    try {
      const response = await api.delete("/articles", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: articleToDelete.id },
      });

      if (response.data.success) {
        setArticles(articles.filter((article) => article.id !== articleToDelete.id));
        setIsConfirmModalOpen(false);
        setArticleToDelete(null);
        setSuccess("Article deleted successfully!");
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
    setSuccess("");
    setCurrentArticle(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: "" });
    setCurrentCategory(null);
    setIsCategoryEditMode(false);
  };

  const openCategoryModal = () => {
    resetCategoryForm();
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category) => {
    setIsCategoryEditMode(true);
    setCurrentCategory(category);
    setCategoryFormData({ name: category.name || "" });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token not found. Please log in.");
      return;
    }

    if (!categoryFormData.name) {
      setError("Category name is required.");
      return;
    }

    try {
      let response;
      if (isCategoryEditMode && currentCategory?.id) {
        response = await api.put(
          "/categories",
          { id: currentCategory.id, name: categoryFormData.name },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await api.post(
          "/categories",
          { name: categoryFormData.name },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (response.data.message) {
        await fetchCategoriesAndUpdateState();
        setIsCategoryModalOpen(false);
        resetCategoryForm();
        setSuccess(
          `Category ${isCategoryEditMode ? "updated" : "created"} successfully!`
        );
      } else {
        setError(
          response.data.error ||
            `Failed to ${isCategoryEditMode ? "update" : "create"} category.`
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to ${isCategoryEditMode ? "update" : "create"} category.`
      );
      console.error("handleCategorySubmit Error:", err);
    }
  };

  const handleCategoryDelete = (category) => {
    setCategoryToDelete(category);
    setIsCategoryConfirmModalOpen(true);
  };

  const executeCategoryDelete = async () => {
    if (!token) {
      setError("Token not found. Please log in.");
      setIsCategoryConfirmModalOpen(false);
      setCategoryToDelete(null);
      return;
    }

    try {
      const response = await api.delete("/categories", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: categoryToDelete.id },
      });

      if (response.data.message) {
        setCategories(
          categories.filter((category) => category.id !== categoryToDelete.id)
        );
        setIsCategoryConfirmModalOpen(false);
        setCategoryToDelete(null);
        setSuccess("Category deleted successfully!");
      } else {
        setError(response.data.error || "Failed to delete category.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete category.");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${API_BASE_URL}/${imagePath}`;
  };

  const truncateHTML = (html, maxLength) => {
    const sanitizedHTML = DOMPurify.sanitize(html);
    const div = document.createElement("div");
    div.innerHTML = sanitizedHTML;
    let text = div.textContent || div.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const handleSubmitTrigger = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleCategorySubmitTrigger = () => {
    if (categoryFormRef.current) {
      categoryFormRef.current.requestSubmit();
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-center sm:justify-between flex-col sm:flex-row items-center mb-6 space-y-2 sm:space-y-0 sm:space-x-2">
        <h2 className="text-2xl font-bold">Articles</h2>
        <div className="space-x-2 sm:flex flex gap-2">
          <Button
            onClick={openCategoryModal}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Manage Categories
          </Button>
          <Button
            onClick={openCreateModal}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Create Article
          </Button>
        </div>
      </div>

      <Notification message={error} type="error" />
      <Notification message={success} type="success" />

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
              <div
                className="text-gray-600 mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(truncateHTML(article.content, 100)),
                }}
              />
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
                  onClick={() => handleDelete(article)}
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
        className="max-w-4xl w-full"
        maxHeight="70vh"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              color="rose"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleSubmitTrigger}
            >
              {isEditMode ? "Update Article" : "Create Article"}
            </Button>
          </div>
        }
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
            <div className="mt-2">
              <ReactQuill
                id="content"
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Enter article content"
              />
            </div>
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
              required={!isEditMode}
            />
            {isEditMode && currentArticle?.image && (
              <div className="mt-2">
                <img
                  src={getImageUrl(currentArticle.image)}
                  alt={currentArticle.title}
                  className="w-32 h-32 object-cover rounded-md"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/100";
                    console.error(`Failed to load image: ${currentArticle.image}`);
                  }}
                />
                <p className="text-sm text-gray-500">Current image</p>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setArticleToDelete(null);
        }}
        title="Confirm Delete Article"
      >
        <div className="mb-4">
          Are you sure you want to delete article{' '}
          <strong>{articleToDelete?.title}</strong>?
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            color="gray"
            onClick={() => {
              setIsConfirmModalOpen(false);
              setArticleToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button color="rose" onClick={executeDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          resetCategoryForm();
        }}
        title={isCategoryEditMode ? "Edit Category" : "Create Category"}
        className="max-w-md w-full"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              color="rose"
              onClick={() => {
                setIsCategoryModalOpen(false);
                resetCategoryForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleCategorySubmitTrigger}
            >
              {isCategoryEditMode ? "Update Category" : "Create Category"}
            </Button>
          </div>
        }
      >
        <form
          ref={categoryFormRef}
          onSubmit={handleCategorySubmit}
          className="space-y-4"
        >
          <Input
            label="Category Name"
            id="name"
            name="name"
            value={categoryFormData.name}
            onChange={handleCategoryInputChange}
            placeholder="Enter category name"
            required
          />
        </form>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Existing Categories</h3>
          {categories.length === 0 ? (
            <p className="text-gray-600">No categories available.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                >
                  <span>{category.name}</span>
                  <div className="flex space-x-2">
                    <Button
                      color="green"
                      onClick={() => openEditCategoryModal(category)}
                      className="p-1 bg-green-500 text-white hover:bg-green-600"
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      color="rose"
                      onClick={() => handleCategoryDelete(category)}
                      className="p-1 bg-rose-500 text-white hover:bg-rose-600"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isCategoryConfirmModalOpen}
        onClose={() => {
          setIsCategoryConfirmModalOpen(false);
          setCategoryToDelete(null);
        }}
        title="Confirm Delete Category"
      >
        <div className="mb-4">
          Are you sure you want to delete category{' '}
          <strong>{categoryToDelete?.name}</strong>?
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            color="gray"
            onClick={() => {
              setIsCategoryConfirmModalOpen(false);
              setCategoryToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button color="rose" onClick={executeCategoryDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}