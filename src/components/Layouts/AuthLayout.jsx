import { Link } from "react-router";

const AuthLayout = ({ title, children, bottomText, bottomLink, bottomHref }) => {
  return (
    <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div>
          <img
            alt="Logo SIJA SMKN 7 Semarang"
            src="../src/assets/logo_sija.png"
            className="mx-auto h-20 w-auto" // Sesuaikan tinggi agar tampak baik di semua perangkat
          />
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
        </div>

        <div className="mt-6">
          {children}
          <p className="mt-6 text-center text-sm text-gray-500">
            {bottomText}{' '}
            <Link to={bottomHref} className="font-semibold text-rose-500 hover:text-rose-600">
              {bottomLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
