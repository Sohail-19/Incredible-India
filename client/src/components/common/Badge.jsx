const variantClasses = {
  primary: 'bg-primary-tint text-primary',
  green: 'bg-secondary-tint text-secondary',
  success: 'bg-green-50 text-success',
  warning: 'bg-orange-50 text-warning',
  danger: 'bg-red-50 text-danger',
  neutral: 'bg-gray-100 text-text-secondary',
};

const Badge = ({ children, variant = 'primary', className = '', icon: Icon }) => {
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
};

export default Badge;
