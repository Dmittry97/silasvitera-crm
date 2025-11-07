type FiltersProps = {
  categories: string[];
  sizes: string[];
  selectedCategory: string;
  selectedSize: string;
  sortOrder: 'default' | 'price-desc' | 'price-asc';
  onCategoryChange: (cat: string) => void;
  onSizeChange: (size: string) => void;
  onSortChange: (sort: 'default' | 'price-desc' | 'price-asc') => void;
  onReset: () => void;
};

export default function Filters({
  categories,
  sizes,
  selectedCategory,
  selectedSize,
  sortOrder,
  onCategoryChange,
  onSizeChange,
  onSortChange,
  onReset,
}: FiltersProps) {
  const hasFilters = selectedCategory || selectedSize || sortOrder !== 'default';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6">
      <div className="flex flex-wrap items-center gap-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-900">Категория:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-300 hover:border-neutral-900'
                }`}
              >
                Все
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-300 hover:border-neutral-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-900">Размер:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSizeChange('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !selectedSize
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-300 hover:border-neutral-900'
                }`}
              >
                Все
              </button>
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onSizeChange(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-300 hover:border-neutral-900'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort Order */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-900">Сортировка:</span>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'default' | 'price-desc' | 'price-asc')}
            className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium hover:border-neutral-900 transition-colors focus:outline-none focus:border-neutral-900"
          >
            <option value="default">По умолчанию</option>
            <option value="price-desc">От дорогих к дешевым</option>
            <option value="price-asc">От дешевых к дорогим</option>
          </select>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-sm text-neutral-600 hover:text-neutral-900 transition-colors underline"
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    </div>
  );
}
