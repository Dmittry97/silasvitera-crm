import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';

type Product = {
  _id: string;
  title: string;
  article?: string;
  price: number;
  mainImage?: string;
  backImage?: string;
  otherImages?: string[];
  sizes?: string[];
  category?: string;
  isReserved?: boolean;
};

type FiltersData = {
  sizes: string[];
  categories: string[];
  priceRange: { min: number; max: number };
};

export default function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FiltersData>({ sizes: [], categories: [], priceRange: { min: 0, max: 10000 } });
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'price-desc' | 'price-asc'>('default');

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        const data = res.data || [];
        setAllProducts(data);
        setProducts(data);
        
        // Extract filters
        const sizes = new Set<string>();
        const categories = new Set<string>();
        let minPrice = Infinity;
        let maxPrice = 0;
        
        data.forEach((p: Product) => {
          if (p.sizes) p.sizes.forEach(s => sizes.add(s));
          if (p.category) categories.add(p.category);
          if (p.price < minPrice) minPrice = p.price;
          if (p.price > maxPrice) maxPrice = p.price;
        });
        
        setFilters({
          sizes: Array.from(sizes),
          categories: Array.from(categories),
          priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice || 10000 }
        });
      })
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];
    
    if (selectedSize) {
      filtered = filtered.filter(p => p.sizes?.includes(selectedSize));
    }
    
    setProducts(filtered);
  }, [selectedSize, allProducts]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setSortOrder('default');
  };

  // Group products by category and apply sorting
  const groupedProducts = React.useMemo(() => {
    if (!products) return null;
    
    const groups: Record<string, Product[]> = {};
    
    products.forEach(p => {
      const cat = p.category || 'Без категории';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    
    // Sort products within each category
    if (sortOrder !== 'default') {
      Object.keys(groups).forEach(cat => {
        groups[cat].sort((a, b) => {
          if (sortOrder === 'price-desc') return b.price - a.price;
          if (sortOrder === 'price-asc') return a.price - b.price;
          return 0;
        });
      });
    }
    
    return groups;
  }, [products, sortOrder]);

  // Filter categories to display with fixed order
  const categoryOrder = ['Свитер', 'Двусторонний сарафан', 'Рубашка'];
  
  const categoriesToShow = selectedCategory 
    ? [selectedCategory] 
    : categoryOrder.filter(cat => filters.categories.includes(cat))
        .concat(filters.categories.filter(cat => !categoryOrder.includes(cat)));

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 mb-4">
          Сила Свитера
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Новая жизнь старых вещей
        </p>
      </div>

      {/* Horizontal Filters */}
      <div className="mb-8">
        <Filters
          categories={filters.categories}
          sizes={filters.sizes}
          selectedCategory={selectedCategory}
          selectedSize={selectedSize}
          sortOrder={sortOrder}
          onCategoryChange={setSelectedCategory}
          onSizeChange={setSelectedSize}
          onSortChange={setSortOrder}
          onReset={resetFilters}
        />
      </div>

      {/* Products Grid Grouped by Category */}
      {products === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[3/4] bg-neutral-200 rounded-lg" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-neutral-400 text-lg mb-4">Товары не найдены</div>
          <p className="text-sm text-neutral-500 mb-6">Попробуйте изменить фильтры</p>
          <button
            onClick={resetFilters}
            className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {categoriesToShow.map(category => {
            const categoryProducts = groupedProducts?.[category] || [];
            if (categoryProducts.length === 0) return null;
            
            return (
              <div key={category}>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6 pb-3 border-b border-neutral-200">
                  {category}
                  <span className="ml-3 text-base font-normal text-neutral-500">
                    ({categoryProducts.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {categoryProducts.map(p => {
                    const mainImg = p.mainImage ? `/photos/${p.mainImage}` : undefined;
                    const backImg = p.backImage ? `/photos/${p.backImage}` : undefined;
                    const displayImages = [mainImg, backImg].filter(Boolean) as string[];
                    return (
                      <ProductCard 
                        key={p._id} 
                        id={p._id} 
                        title={p.title} 
                        price={p.price} 
                        image={mainImg} 
                        images={displayImages}
                        isReserved={p.isReserved}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
