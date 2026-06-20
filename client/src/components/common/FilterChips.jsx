const FilterChips = ({ options, selected, onSelect, label }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value === selected ? null : option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              option.value === selected
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-primary'
            }`}
          >
            {option.icon && <span className="mr-1">{option.icon}</span>}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;
