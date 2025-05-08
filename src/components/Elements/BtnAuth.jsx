const BtnAuth = ({ type = 'button', text, onClick, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex w-full justify-center rounded-md bg-rose-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 cursor-pointer ${className}`}
    >
      {text}
    </button>
  );
};

export default BtnAuth;
