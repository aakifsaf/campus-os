export default function LoadingSpinner({ fullScreen = false, className = '' }) {
  const baseClasses = 'flex items-center justify-center';
  const sizeClasses = fullScreen 
    ? 'h-screen w-screen' 
    : 'h-16 w-16';
  
  return (
    <div className={`${baseClasses} ${sizeClasses} ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}
