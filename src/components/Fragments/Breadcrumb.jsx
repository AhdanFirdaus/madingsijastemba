import { Link, useLocation } from "react-router";

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    ...pathnames.map((name, index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      href: '/' + pathnames.slice(0, index + 1).join('/'),
    })),
  ];

  return (
    <nav className="flex mb-2 md:mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={item.name} className="flex items-center">
            {index !== 0 && (
              <svg
                className="w-4 h-4 text-rose-500 mx-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            )}
            <Link
              to={item.href}
              className={`${
                index === breadcrumbs.length - 1
                  ? 'text-rose-500 font-medium'
                  : 'text-gray-600 hover:text-rose-500'
              } transition-colors duration-300`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;