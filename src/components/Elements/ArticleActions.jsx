import Button from "./Button";
import { FiMessageSquare, FiEdit, FiTrash2 } from "react-icons/fi";

const ArticleActions = ({
  article,
  onCommentClick,
  onEditClick,
  onDeleteClick,
}) => {
  return (
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
  );
};

export default ArticleActions;