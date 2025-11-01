import { useState } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import './SearchBar.css';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { searchEvents } = useCalendarStore();

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const events = await searchEvents(searchQuery);
      setResults(events);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (event) => {
    // Close search and navigate to event date
    setShowResults(false);
    setQuery('');
    // In a full implementation, you'd navigate to the event's date and highlight it
    console.log('Navigate to event:', event);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search events..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => query && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />

      {showResults && (
        <div className="search-results">
          {isSearching ? (
            <div className="search-message">Searching...</div>
          ) : results.length > 0 ? (
            results.map(event => (
              <div
                key={event.id}
                className="search-result-item"
                onClick={() => handleResultClick(event)}
              >
                <div className="result-title">{event.title}</div>
                <div className="result-details">
                  {new Date(event.start_time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                  {event.location && ` • ${event.location}`}
                </div>
                <div className="result-calendar" style={{ color: event.calendar_color }}>
                  {event.calendar_name}
                </div>
              </div>
            ))
          ) : (
            <div className="search-message">No events found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
