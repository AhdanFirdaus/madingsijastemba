import Button from "./Button";
import { FiHeart, FiMessageSquare, FiEdit, FiTrash2 } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai"; 

const ArticleActions = ({
  article,
  onLikeClick = () => {},
  onCommentClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
  showLike = false,
  showComment = false,
  showEdit = false,
  showDelete = false,
}) => {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      {showLike && (
        <Button
          color="rose"
          className={`p-2 rounded-full text-white ${article.liked ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"}`}
          onClick={() => onLikeClick(article.id)}
        >
          {article.liked ? (
            <AiFillHeart className="w-5 h-5 text-white" />
          ) : (
            <FiHeart className="w-5 h-5 stroke-current" />
          )}
        </Button>
      )}
      {showComment && (
        <Button
          color="blue"
          onClick={() => onCommentClick(article)}
          className="p-2 text-white bg-blue-500 hover:bg-blue-600"
        >
          <FiMessageSquare />
        </Button>
      )}
      {showEdit && (
        <Button
          color="green"
          onClick={() => onEditClick(article)}
          className="p-2 text-white bg-green-500 hover:bg-green-600"
        >
          <FiEdit />
        </Button>
      )}
      {showDelete && (
        <Button
          color="rose"
          onClick={() => onDeleteClick(article)}
          className="p-2 text-white bg-rose-500 hover:bg-rose-600"
        >
          <FiTrash2 />
        </Button>
      )}
    </div>
  );
};

export default ArticleActions;