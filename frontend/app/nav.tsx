import { NavLink } from 'react-router';


export default () => {
  const navLinkClasses = ({ isActive }: {
    isActive: boolean;
    isPending: boolean;
    isTransitioning: boolean;
  }): string => {
    return `px-4 py-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`;
  };

  return (
    <nav className="bg-white border-b">
      <div className="px-4">
        <div className="flex space-x-4 h-14 items-center">
          <NavLink to="/" end className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/books" className={navLinkClasses}>
            Books
          </NavLink>
          <NavLink to="/authors" className={navLinkClasses}>
            Authors
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
