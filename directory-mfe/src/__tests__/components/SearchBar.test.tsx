import { render, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';

describe('SearchBar - handleInputChange', () => {
  it('should update input value and call onSearch (debounced)', async () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    const onClear = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onSearch={onSearch}
        onClear={onClear}
        searchHistory={[]}
      />
    );
    const input = getByPlaceholderText(/search users/i);
    fireEvent.change(input, { target: { value: 'John' } });
    expect(input).toHaveValue('John');
    jest.advanceTimersByTime(300);
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('John'));
    jest.useRealTimers();
  });
});

describe('SearchBar - handleInputFocus', () => {
  it('should show history if input is empty and history exists', () => {
    const onSearch = jest.fn();
    const onClear = jest.fn();
    const searchHistory = ['Alice', 'Bob'];
    const { getByPlaceholderText, getByText } = render(
      <SearchBar
        value=""
        onSearch={onSearch}
        onClear={onClear}
        searchHistory={searchHistory}
      />
    );
    const input = getByPlaceholderText(/search users/i);
    fireEvent.focus(input);
    expect(getByText('Recent searches')).toBeInTheDocument();
    expect(getByText('Alice')).toBeInTheDocument();
    expect(getByText('Bob')).toBeInTheDocument();
  });
});

describe('SearchBar - handleInputBlur', () => {
  it('should hide history after blur (with delay)', async () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    const onClear = jest.fn();
    const searchHistory = ['Alice'];
    const { getByPlaceholderText, queryByText } = render(
      <SearchBar
        value=""
        onSearch={onSearch}
        onClear={onClear}
        searchHistory={searchHistory}
      />
    );
    const input = getByPlaceholderText(/search users/i);
    fireEvent.focus(input);
    expect(queryByText('Recent searches')).toBeInTheDocument();
    fireEvent.blur(input);
    jest.advanceTimersByTime(151);
    await waitFor(() => expect(queryByText('Recent searches')).not.toBeInTheDocument());
    jest.useRealTimers();
  });
});

describe('SearchBar - handleKeyDown', () => {
  it('should navigate history with arrow keys and select with enter', () => {
    const onSearch = jest.fn();
    const onClear = jest.fn();
    const searchHistory = ['Alice', 'Bob'];
    const { getByPlaceholderText, getByText } = render(
      <SearchBar
        value=""
        onSearch={onSearch}
        onClear={onClear}
        searchHistory={searchHistory}
      />
    );
    const input = getByPlaceholderText(/search users/i);
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('Alice');
  });
});

describe('SearchBar - handleClear', () => {
  it('should clear input and call onClear', () => {
    const onSearch = jest.fn();
    const onClear = jest.fn();
    const { getByPlaceholderText, getByLabelText } = render(
      <SearchBar
        value="foo"
        onSearch={onSearch}
        onClear={onClear}
        searchHistory={[]}
      />
    );
    const input = getByPlaceholderText(/search users/i);
    const clearBtn = getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(input).toHaveValue('');
    expect(onClear).toHaveBeenCalled();
  });
});

describe('SearchBar - handleSubmit', () => {
  it('should call onSearch with input value on submit', () => {
    const onSearch = jest.fn();
    const onClear = jest.fn();
    const { getByPlaceholderText, container } = render(
      <SearchBar
        value=""
        onSearch={onSearch}
        onClear={onClear}
        searchHistory={[]}
      />
    );
    const input = getByPlaceholderText(/search users/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    expect(onSearch).toHaveBeenCalledWith('Test');
  });
});
