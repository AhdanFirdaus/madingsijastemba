import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import DOMPurify from "dompurify";
import api from "../api/axios";
import Navbar from "../components/Fragments/Navbar";
import Footer from "../components/Fragments/Footer";
import Button from "../components/Elements/Button";
import Notification from "../components/Elements/Notification";
import Modal from "../components/Elements/Modal";
import { FiHeart, FiEdit, FiTrash2 } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "error" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const commentTextareaRef = useRef(null);

  // Retrieve user information from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id;
  const userRole = currentUser.role || "user";

  const fetchData = async () => {
    setLoading(true);
    try {
      const articleResponse = await api.get(`/articles?id=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (articleResponse.data.error) throw new Error(articleResponse.data.error);
      setArticle(articleResponse.data);

      const commentsResponse = await api.get(`/comments?article_id=${id}`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setNotification({ message: error.message || "Failed to load data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: "", type: "error" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  const handleLikeClick = async (articleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
      return;
    }

    const isLiked = article?.liked || false;
    const action = isLiked ? "unlike" : "like";

    try {
      console.log("Sending like/unlike request:", { action, articleId });
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
        message: response.data.message || (isLiked ? "Like removed successfully!" : "Article liked successfully!"),
        type: "success",
      });
      setArticle((prev) => ({ ...prev, liked: !isLiked }));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchData();
    } catch (error) {
      console.error("Error handling like/unlike:", error.response?.status, error.response?.data);
      let errorMessage = isLiked ? "Failed to remove like." : "Failed to like article.";
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Unauthorized. Please log in again.";
            break;
          case 404:
            errorMessage = "Article not found.";
            break;
          case 400:
            errorMessage = error.response.data.error || (isLiked ? "You haven't liked this article." : "You already liked this article.");
            break;
          case 500:
            errorMessage = error.response.data.error || "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data.error || "An unexpected error occurred.";
        }
      } else {
        errorMessage = "Network error. Please check your connection.";
      }
      setNotification({ message: errorMessage, type: "error" });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
      return;
    }
    if (!newComment.trim()) {
      setNotification({ message: "Comment cannot be empty.", type: "error" });
      return;
    }
    try {
      console.log("Submitting comment:", { article_id: id, content: newComment });
      const response = await api.post(
        "/comments",
        { article_id: id, content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.message) {
        setNotification({ message: "Comment added successfully!", type: "success" });
        setNewComment("");
        if (commentTextareaRef.current) commentTextareaRef.current.focus();
        await fetchData();
      } else {
        throw new Error("Failed to add comment.");
      }
    } catch (error) {
      console.error("Error submitting comment:", error.response?.data);
      const errorMessage = error.response?.data?.error || "Failed to add comment. Please try again.";
      setNotification({ message: errorMessage, type: "error" });
    }
  };

  const handleEditComment = async (commentId, content) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
      return;
    }
    if (!content.trim()) {
      setNotification({ message: "Comment cannot be empty.", type: "error" });
      return;
    }
    try {
      console.log("Editing comment:", { id: commentId, content });
      const response = await api.put(
        "/comments",
        { id: commentId, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.message) {
        setNotification({ message: "Comment updated successfully!", type: "success" });
        setEditCommentId(null);
        setEditCommentContent("");
        await fetchData();
      } else {
        throw new Error("Failed to update comment.");
      }
    } catch (error) {
      console.error("Error editing comment:", error.response?.data);
      const errorMessage = error.response?.data?.error || "Failed to update comment.";
      setNotification({ message: errorMessage, type: "error" });
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
      return;
    }
    try {
      console.log("Deleting comment:", { id: commentId });
      const response = await api.delete("/comments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { id: commentId },
      });
      if (response.data.message) {
        setNotification({ message: "Comment deleted successfully!", type: "success" });
        await fetchData();
      } else {
        throw new Error("Failed to delete comment.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error.response?.data);
      const errorMessage = error.response?.data?.error || "Failed to delete comment.";
      setNotification({ message: errorMessage, type: "error" });
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/400x300";
    return `http://localhost/madingsijastemba/api/${image}`;
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleCommentButtonClick = () => {
    if (commentTextareaRef.current) {
      commentTextareaRef.current.focus();
      const commentSection = document.getElementById("comment-section");
      if (commentSection) {
        commentSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Notification loading={true} />
        </div>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Article not found.</p>
            <Button onClick={() => navigate("/")} color="rose" className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-white py-8 pt-32">
        <div className="container mx-auto max-w-[90%]">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-12 text-center">
            {article.title || "Where does it come from?"}
          </h1>

          {article.image && (
            <img
              src={getImageUrl(article.image)}
              alt={article.title}
              className="w-full h-84 object-cover rounded-lg mb-6"
            />
          )}

          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col text-sm text-gray-500">
              <span className="font-medium text-rose-600">
                By: {article.username || "admin"}
              </span>
              <span>
                {new Date(article.created_at || "2025-05-13").toLocaleString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex gap-4">
              <Button
                color="rose"
                className={`p-2 rounded-full text-white ${
                  article.liked ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
                }`}
                onClick={() => handleLikeClick(article.id)}
              >
                {article.liked ? (
                  <AiFillHeart className="text-white" />
                ) : (
                  <FiHeart className="stroke-current" />
                )}
              </Button>
              <Button
                color="blue"
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleCommentButtonClick}
              >
                <FaComment />
              </Button>
            </div>
          </div>

          <div
            className="prose max-w-none text-gray-700 mb-8"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                article.content ||
                  "Contrary to popular belief, Lorem Ipsum is not simply random text..."
              ),
            }}
          />

          <div id="comment-section" className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                ref={commentTextareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows="4"
              />
              <Button type="submit" color="rose" className="mt-2">
                Submit Comment
              </Button>
            </form>
            {comments.length === 0 ? (
              <p className="text-gray-600">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <p className="font-medium text-rose-600">{comment.username}</p>
                        {editCommentId === comment.id ? (
                          <div>
                            <textarea
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                              rows="3"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                color="rose"
                                onClick={() => {
                                  setEditCommentId(null);
                                  setEditCommentContent("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                color="green"
                                onClick={() => handleEditComment(comment.id, editCommentContent)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-700">{comment.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comment.created_at).toLocaleString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </>
                        )}
                      </div>
                      {(comment.user_id === currentUserId || userRole === "admin") && editCommentId !== comment.id && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            color="blue"
                            onClick={() => {
                              setEditCommentId(comment.id);
                              setEditCommentContent(comment.content);
                            }}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            color="red"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
        <p className="text-gray-700">Please log in to like or comment on this article.</p>
      </Modal>

      <Footer />
    </>
  );
}