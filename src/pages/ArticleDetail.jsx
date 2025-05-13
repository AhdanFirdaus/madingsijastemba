import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import DOMPurify from "dompurify";
import api from "../api/axios";
import Navbar from "../components/Fragments/Navbar";
import Footer from "../components/Fragments/Footer";
import Button from "../components/Elements/Button";
import Notification from "../components/Elements/Notification";
import Modal from "../components/Elements/Modal";
import { FiHeart } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "error" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const commentTextareaRef = useRef(null); // Ref untuk text area komentar

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
      setNotification({ message: error.message || "Gagal memuat data.", type: "error" });
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
    try {
      const response = await api.post(
        "/articles",
        { action: "like", articleId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNotification({ message: response.data.message || "Artikel berhasil disukai!", type: "success" });
      setArticle((prev) => ({ ...prev, liked: true }));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Gagal menyukai artikel. Coba lagi.";
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
      setNotification({ message: "Komentar tidak boleh kosong.", type: "error" });
      return;
    }
    try {
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
      if (response.data.success) {
        setNotification({ message: "Komentar berhasil ditambahkan!", type: "success" });
        setNewComment("");
        if (commentTextareaRef.current) commentTextareaRef.current.focus(); // Fokus ulang setelah submit
        await fetchData();
      } else {
        throw new Error("Gagal menambahkan komentar.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Gagal menambahkan komentar. Coba lagi.";
      setNotification({ message: errorMessage, type: "error" });
    }
  };

  const handleEditComment = async (commentId, content) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
      return;
    }
    try {
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
      if (response.data.success) {
        setNotification({ message: "Komentar berhasil diperbarui!", type: "success" });
        await fetchData();
      } else {
        throw new Error("Gagal memperbarui komentar.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Gagal memperbarui komentar.";
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
      const response = await api.delete("/comments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { id: commentId },
      });
      if (response.data.success) {
        setNotification({ message: "Komentar berhasil dihapus!", type: "success" });
        await fetchData();
      } else {
        throw new Error("Gagal menghapus komentar.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Gagal menghapus komentar.";
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
      commentTextareaRef.current.focus(); // Aktifkan (fokus) text area
      const commentSection = document.getElementById("comment-section");
      if (commentSection) {
        commentSection.scrollIntoView({ behavior: "smooth" }); // Scroll ke bagian komentar
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
            <p className="text-gray-600 text-lg">Artikel tidak ditemukan.</p>
            <Button onClick={() => navigate("/")} color="rose" className="mt-4">
              Kembali ke Beranda
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
          {/* Judul */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-12 text-center">
            {article.title || "Where does it come from?"}
          </h1>

          {/* Gambar */}
          {article.image && (
            <img
              src={getImageUrl(article.image)}
              alt={article.title}
              className="w-full h-84 object-cover rounded-lg mb-6"
            />
          )}

          {/* Author, Tanggal, dan Tombol Aksi */}
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
                  <AiFillHeart className="w-5 h-5 text-white" />
                ) : (
                  <FiHeart className="w-5 h-5 stroke-current" />
                )}
              </Button>
              <Button
                color="blue"
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleCommentButtonClick}
              >
                <FaComment className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Konten */}
          <div
            className="prose max-w-none text-gray-700 mb-8"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                article.content ||
                  "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics."
              ),
            }}
          />

          {/* Kolom Komentar */}
          <div id="comment-section" className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Komentar</h2>
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                ref={commentTextareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar Anda..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows="4"
              />
              <Button type="submit" color="rose" className="mt-2">
                Kirim Komentar
              </Button>
            </form>
            {comments.length === 0 ? (
              <p className="text-gray-600">Belum ada komentar.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-rose-600">{comment.username}</p>
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
                      </div>
                      {comment.user_id === localStorage.getItem("userId") && (
                        <div className="flex gap-2">
                          <Button
                            color="blue"
                            className="text-xs"
                            onClick={() => {
                              const newContent = prompt("Edit komentar:", comment.content);
                              if (newContent) handleEditComment(comment.id, newContent);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            color="red"
                            className="text-xs"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Hapus
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
        title="Login Diperlukan"
        footer={
          <>
            <Button color="rose" onClick={handleModalClose} className="mr-2">
              Batal
            </Button>
            <Button color="green" onClick={handleLoginRedirect}>
              Login
            </Button>
          </>
        }
      >
        <p className="text-gray-700">Silakan login untuk menyukai atau mengomentari artikel ini.</p>
      </Modal>

      {notification.message && <Notification message={notification.message} type={notification.type} />}

      <Footer />
    </>
  );
}