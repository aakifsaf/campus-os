import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { Link } from 'react-router-dom';

const Layout = ({ children, fullScreen = false }) => {
  const { theme } = useTheme();

  if (fullScreen) {
    return <div className={`${theme === 'dark' ? 'dark' : ''}`}>{children}</div>;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-xl font-semibold text-gray-900 dark:text-white">
                CampusOS
              </Link>
              <div className="flex items-center space-x-4">
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;