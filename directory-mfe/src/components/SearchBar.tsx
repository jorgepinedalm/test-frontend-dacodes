import React, { useState, useRef, useEffect } from 'react';
import { debounce } from '../utils/formatting';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  searchHistory: string[];
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearch,
  onClear,
  searchHistory,
  placeholder = 'Search users by name, email, company...',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showHistory, setShowHistory] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((query: string) => {
      onSearch(query);
    }, 300)
  ).current;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
    setShowHistory(newValue.length === 0 && searchHistory.length > 0);
  };

  const handleInputFocus = () => {
    setShowHistory(inputValue.length === 0 && searchHistory.length > 0);
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on history items
    setTimeout(() => {
      setShowHistory(false);
      setFocusedIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showHistory || searchHistory.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < searchHistory.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (focusedIndex >= 0) {
          e.preventDefault();
          selectHistoryItem(searchHistory[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowHistory(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const selectHistoryItem = (item: string) => {
    setInputValue(item);
    onSearch(item);
    setShowHistory(false);
    setFocusedIndex(-1);
  };

  const handleClear = () => {
    setInputValue('');
    onClear();
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    setShowHistory(false);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <div className="search-icon">
            🔍
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="search-input"
            autoComplete="off"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              disabled={disabled}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        {showHistory && searchHistory.length > 0 && (
          <div ref={historyRef} className="search-history">
            <div className="search-history-header">Recent searches</div>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                type="button"
                className={`search-history-item ${
                  index === focusedIndex ? 'focused' : ''
                }`}
                onClick={() => selectHistoryItem(item)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span className="history-icon">🕐</span>
                <span className="history-text">{item}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
