import Button from "./Button";
import { FiMessageSquare, FiEdit, FiTrash2 } from "react-icons/fi";
import DOMPurify from "dompurify";

const ArticleCard = ({
  article,
  onCommentClick,
  onEditClick,
  onDeleteClick,
  getImageUrl,
  truncateHTML,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full">
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
          {article.category_name || "Kategori"}
        </span>

        {/* Judul */}
        <h2 className="text-lg font-semibold text-gray-800 leading-snug line-clamp-2">
          {article.title}
        </h2>

        {/* Konten ringkasan */}
        <div
          className="text-gray-600 text-sm line-clamp-3 flex-grow mt-1"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(truncateHTML(article.content, 100)),
          }}
        />

        {/* Info penulis dan tanggal */}
        <div className="text-xs text-rose-600 mt-3">
          <span className="font-medium">By: {article.username}</span> <br />
          <span className="text-gray-500">
            {new Date(article.created_at).toLocaleString()}
          </span>
        </div>

        {/* Tombol aksi */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            color="blue"
            onClick={() => onCommentClick(article)}
            className="p-2 text-white bg-blue-500 hover:bg-blue-600"
          >
            <FiMessageSquare />
          </Button>
          <Button
            color="green"
            onClick={() => onEditClick(article)}
            className="p-2 text-white bg-green-500 hover:bg-green-600"
          >
            <FiEdit />
          </Button>
          <Button
            color="rose"
            onClick={() => onDeleteClick(article)}
            className="p-2 text-white bg-rose-500 hover:bg-rose-600"
          >
            <FiTrash2 />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
