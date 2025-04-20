// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import SearchBar from '../components/home/SearchBar';
import SeriesList from '../components/home/SeriesList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchCategories, searchContent } from '../services/api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchQuery(query);

    try {
      const category = selectedCategory !== 'all' ? selectedCategory : null;
      const results = await searchContent(query, category);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again later.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  if (isCategoriesLoading) {
    return (
      <div className="container mx-auto">
        <Header title="Home" />
        <div className="py-10">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Header
        title="Home"
        subtitle="Search and download content from your M3U links"
      />

      <SearchBar 
        onSearch={handleSearch} 
        categories={categories} 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <SeriesList 
          results={searchResults} 
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
};

export default Home;
