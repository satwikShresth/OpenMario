import { isLoggedIn, useAuth } from '#/hooks/useAuth';
import { NavLink } from 'react-router';

export default () => {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }: {
    isActive: boolean;
  }): string => {
    return `
      px-6 py-4
      font-medium
      transition-colors
      duration-200
      border-b-2
      ${isActive
        ? 'text-blue-400 border-blue-400'
        : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-400'
      }
    `;
  };

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {
              isLoggedIn()
                ? (
                  <>
                    <NavLink to="/" end className={navLinkClasses}>
                      Home
                    </NavLink>
                    <NavLink to="/book" className={navLinkClasses}>
                      Books
                    </NavLink>
                    <NavLink to="/author" className={navLinkClasses}>
                      Authors
                    </NavLink>
                  </>
                )
                : (<></>)
            }
          </div>
          {
            isLoggedIn()
              ? (
                <>
                  <button
                    onClick={logout}
                    className={navLinkClasses({ isActive: false })}
                  >
                    {user?.username || "Logout"}
                  </button>
                </>
              )
              : (
                <>
                  <NavLink to="/login" className={navLinkClasses}>
                    Login
                  </NavLink>
                </>
              )
          }
        </div>
      </div>
    </nav>
  );
};
