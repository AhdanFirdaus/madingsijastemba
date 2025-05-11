import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/axios";
import Button from "../../components/Elements/Button";
import Modal from "../../components/Elements/Modal";
import Input from "../../components/Elements/Input";
import Notification from "../../components/Elements/Notification";
import ReactQuill from "react-quill-new";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { FiEdit, FiTrash2, FiSearch, FiLoader } from "react-icons/fi";
import ArticleCard from "../../components/Elements/ArticleCard";

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
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryConfirmModalOpen, setIsCategoryConfirmModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isCommentConfirmModalOpen, setIsCommentConfirmModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [isCommentEditMode, setIsCommentEditMode] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentComment, setCurrentComment] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    image: null,
  });
  const [categoryFormData, setCategoryFormData] = useState({ name: "" });
  const [commentFormData, setCommentFormData] = useState({ content: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token] = useState(localStorage.getItem("token"));
  const [userRole] = useState(localStorage.getItem("role") || "user");
  const formRef = useRef(null);
  const categoryFormRef = useRef(null);
  const commentFormRef = useRef(null);

  const MINIMUM_LOADING_TIME = 500; 

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [token, searchQuery]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchArticles = async () => {
    if (!token) {
      setError("Token not found. Please log in.");
      setArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const url = searchQuery ? `/articles?search=${encodeURIComponent(searchQuery)}` : "/articles";
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const elapsedTime = Date.now() - startTime;
      const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setArticles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setArticles([]);
      setError(
        err.response?.data?.error || "Failed to load articles. Please try again."
      );
    } finally {
      setIsLoading(false);
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

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentInputChange = (e) => {
    const { name, value } = e.target;
    setCommentFormData((prev) => ({ ...prev, [name]: value }));
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
        await fetchArticles();
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

  const fetchCommentsAndUpdateState = async (articleId) => {
    if (!token) {
      setError("Token not found. Please log in.");
      setComments([]);
      return;
    }

    try {
      const response = await api.get(`/comments?article_id=${articleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setComments([]);
      setError(
        err.response?.data?.error || "Failed to load comments. Please try again."
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

  const resetCommentForm = () => {
    setCommentFormData({ content: "" });
    setCurrentComment(null);
    setIsCommentEditMode(false);
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

  const openCommentModal = (article) => {
    setCurrentArticle(article);
    resetCommentForm();
    fetchCommentsAndUpdateState(article.id);
    setIsCommentModalOpen(true);
  };

  const openEditCommentModal = (comment) => {
    setIsCommentEditMode(true);
    setCurrentComment(comment);
    setCommentFormData({ content: comment.content || "" });
    setIsCommentModalOpen(true);
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
        await fetchCategories();
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token not found. Please log in.");
      return;
    }

    if (!commentFormData.content) {
      setError("Comment content is required.");
      return;
    }

    try {
      let response;
      if (isCommentEditMode && currentComment?.id) {
        response = await api.put(
          "/comments",
          { id: currentComment.id, content: commentFormData.content },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await api.post(
          "/comments",
          {
            article_id: currentArticle.id,
            content: commentFormData.content,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (response.data.success || response.data.message) {
        await fetchCommentsAndUpdateState(currentArticle.id);
        setIsCommentModalOpen(false);
        resetCommentForm();
        setSuccess(
          `Comment ${isCommentEditMode ? "updated" : "created"} successfully!`
        );
      } else {
        setError(
          response.data.error ||
            `Failed to ${isCommentEditMode ? "update" : "create"} comment.`
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to ${isCommentEditMode ? "update" : "create"} comment.`
      );
      console.error("handleCommentSubmit Error:", err);
    }
  };

  const handleCommentDelete = (comment) => {
    setCommentToDelete(comment);
    setIsCommentConfirmModalOpen(true);
  };

  const executeCommentDelete = async () => {
    if (!token) {
      setError("Token not found. Please log in.");
      setIsCommentConfirmModalOpen(false);
      setCommentToDelete(null);
      return;
    }

    try {
      const response = await api.delete("/comments", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: commentToDelete.id },
      });

      if (response.data.success || response.data.message) {
        setComments(
          comments.filter((comment) => comment.id !== commentToDelete.id)
        );
        setIsCommentConfirmModalOpen(false);
        setCommentToDelete(null);
        setSuccess("Comment deleted successfully!");
      } else {
        setError(response.data.error || "Failed to delete comment.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete comment.");
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

  const handleCommentSubmitTrigger = () => {
    if (commentFormRef.current) {
      commentFormRef.current.requestSubmit();
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold">Articles</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search articles..."
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <Button onClick={openCategoryModal} color="green">
              Manage Categories
            </Button>
            <Button onClick={openCreateModal} color="green">
              Create Article
            </Button>
          </div>
        </div>
      </div>

      <Notification message={error} type="error" />
      <Notification message={success} type="success" />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin text-green-500"><FiLoader size={40} /></div>
        </div>
      ) : articles.length === 0 ? (
        <p className="text-gray-600 text-center">
          {searchQuery ? "No articles found for your search." : "No articles available."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onCommentClick={openCommentModal}
              onEditClick={openEditModal}
              onDeleteClick={handleDelete}
              getImageUrl={getImageUrl}
              truncateHTML={truncateHTML}
            />
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
              color="green"
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
              color="green"
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
                      className="p-1"
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      color="rose"
                      onClick={() => handleCategoryDelete(category)}
                      className="p-1"
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

      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setCurrentArticle(null);
          resetCommentForm();
        }}
        title={`Manage Comments for "${currentArticle?.title || "Article"}"`}
        className="max-w-2xl w-full"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              color="rose"
              onClick={() => {
                setIsCommentModalOpen(false);
                setCurrentArticle(null);
                resetCommentForm();
              }}
            >
              Close
            </Button>
            {!isCommentEditMode && (
              <Button
                type="button"
                color="green"
                onClick={handleCommentSubmitTrigger}
              >
                Add Comment
              </Button>
            )}
            {isCommentEditMode && (
              <Button
                type="button"
                color="green"
                onClick={handleCommentSubmitTrigger}
              >
                Update Comment
              </Button>
            )}
          </div>
        }
      >
        <form
          ref={commentFormRef}
          onSubmit={handleCommentSubmit}
          className="space-y-4 mb-6"
        >
          <Input
            label="Comment Content"
            id="content"
            name="content"
            value={commentFormData.content}
            onChange={handleCommentInputChange}
            placeholder="Enter your comment"
            required
          />
        </form>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Existing Comments</h3>
          {comments.length === 0 ? (
            <p className="text-gray-600">No comments available.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                >
                  <div>
                    <p className="text-gray-600">{comment.content}</p>
                    <p className="text-sm text-gray-500">
                      By: {comment.username} |{" "}
                      { Instant.now().toString() }
                      {comment.updated_at && (
                        <span> | Updated: {new Date(comment.updated_at).toLocaleString()}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      color="green"
                      onClick={() => openEditCommentModal(comment)}
                      className="p-1"
                      disabled={userRole !== "admin" && comment.user_id !== JSON.parse(localStorage.getItem("userData") || "{}").user_id}
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      color="rose"
                      onClick={() => handleCommentDelete(comment)}
                      className="p-1"
                      disabled={userRole !== "admin" && comment.user_id !== JSON.parse(localStorage.getItem("userData") || "{}").user_id}
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
        isOpen={isCommentConfirmModalOpen}
        onClose={() => {
          setIsCommentConfirmModalOpen(false);
          setCommentToDelete(null);
        }}
        title="Confirm Delete Comment"
      >
        <div className="mb-4">
          Are you sure you want to delete this comment by{' '}
          <strong>{commentToDelete?.username}</strong>?
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            color="gray"
            onClick={() => {
              setIsCommentConfirmModalOpen(false);
              setCommentToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button color="rose" onClick={executeCommentDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}