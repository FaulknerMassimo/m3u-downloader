// frontend/src/components/home/SeriesList.jsx
import React from 'react';
import SeriesItem from './SeriesItem';

const SeriesList = ({ results, searchQuery }) => {
  if (!searchQuery) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 dark:text-gray-400">
          Enter a search query to find series and movies
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 dark:text-gray-400">
          No results found for "{searchQuery}"
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Search Results
      </h2>
      
      <div className="space-y-4">
        {results.map((series) => (
          <SeriesItem 
            key={series.id} 
            series={series} 
          />
        ))}
      </div>
    </div>
  );
};

export default SeriesList;
