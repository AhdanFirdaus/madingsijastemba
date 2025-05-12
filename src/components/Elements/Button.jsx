const colorMap = {
  green: 'bg-green-500 hover:bg-green-600',
  rose: 'bg-rose-500 hover:bg-rose-600',
  blue: 'bg-blue-500 hover:bg-blue-600',
  // tambahkan warna lain sesuai kebutuhan
};

const Button = ({ children, onClick, color = 'green', type = 'button', className = '' }) => {
  const colorClasses = colorMap[color] || colorMap['green']; // default ke hijau
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white transition cursor-pointer ${colorClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
