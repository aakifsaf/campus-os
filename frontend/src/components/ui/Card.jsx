import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md dark:hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 ${headerClassName}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
