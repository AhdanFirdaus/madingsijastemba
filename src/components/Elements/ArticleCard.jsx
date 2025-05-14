import { useNavigate } from "react-router";
import DOMPurify from "dompurify";

const ArticleCard = ({
  article,
  onCommentClick = () => {}, // Default ke fungsi kosong
  onEditClick = () => {}, // Default ke fungsi kosong
  onDeleteClick = () => {}, // Default ke fungsi kosong
  getImageUrl,
  truncateHTML,
  children,
}) => {
  const navigate = useNavigate();

  // Fungsi untuk menangani klik kartu
  const handleCardClick = () => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {article.image && (
        <img
          src={getImageUrl(article.image)}
          alt={article.title}
          className="w-full h-48 object-cover rounded-2xl"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150";
            console.error(`Failed to load image: ${article.image}`);
          }}
        />
      )}

      <div className="p-4 flex flex-col flex-grow">
        {/* Badge Kategori */}
        <span className="text-rose-600 border border-rose-400 bg-rose-600/10 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-2">
          {article.category_name || "Tidak Ada Kategori"}
        </span>

        {/* Judul */}
        <h2 className="text-lg font-semibold text-gray-800 leading-snug line-clamp-2">
          {article.title}
        </h2>

        {/* Konten ringkasan */}
        <div
          className="text-gray-600 text-sm line-clamp-3 flex-grow mt-1"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              truncateHTML(article.content || "Tidak ada konten", 100)
            ),
          }}
        />

        {/* Info penulis/tanggal dan actions dalam satu baris */}
        <div
          className="flex flex-row justify-between items-center mt-3"
          onClick={(e) => e.stopPropagation()} // Mencegah navigasi saat klik actions
        >
          <div className="text-xs text-rose-600">
            <span className="font-medium">
              By: {article.username || "Anonim"}
            </span>
            <br />
            <span className="text-gray-500">
              {article.created_at
                ? new Date(article.created_at).toLocaleString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })
                : "Tanggal tidak tersedia"}
            </span>
          </div>
          {/* Injected actions */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;