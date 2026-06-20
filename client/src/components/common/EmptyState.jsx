const EmptyState = ({ icon: Icon, heading, subtext, primaryAction, secondaryAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary">{heading}</h3>
      {subtext && <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{subtext}</p>}
      <div className="mt-6 flex items-center gap-3">
        {primaryAction && (
          <button onClick={primaryAction.onClick} className="btn-primary">
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="btn-outline">
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
