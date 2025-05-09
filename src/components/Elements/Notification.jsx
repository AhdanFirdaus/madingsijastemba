import { FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';

const Notification = ({ message, type, loading }) => {
  // If loading is active and there are no messages, show a loading spinner.
  if (loading && !message) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiLoader className="animate-spin text-rose-500 text-4xl" />
      </div>
    );
  }

  // If there is no message, nothing will be displayed.
  if (!message) return null;

  const isError = type === 'error';
  const icon = isError ? <FiAlertCircle className="mr-2 text-xl" /> : <FiCheckCircle className="mr-2 text-xl" />;
  const bgColor = isError ? 'bg-rose-100' : 'bg-green-100';
  const textColor = isError ? 'text-rose-700' : 'text-green-700';

  return (
    <div className={`flex items-center ${bgColor} ${textColor} p-4 rounded-lg mb-6 animate-fade-in`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default Notification;
