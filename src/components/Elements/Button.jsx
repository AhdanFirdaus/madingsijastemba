const Button = ({ children, onClick, color = 'green', type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-md bg-${color}-500 text-white hover:bg-${color}-600 transition cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
