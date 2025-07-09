import React from 'react';
import { User } from '../types/directory';
import { formatFullName, formatCompany, formatEmail, getUserAvatar, generateAvatarColor } from '../utils/formatting';
import './UserTable.css';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onSort: (column: keyof User | 'company.name' | 'address.city', direction: 'asc' | 'desc') => void;
  currentSort: {
    column: keyof User | 'company.name' | 'address.city';
    direction: 'asc' | 'desc';
  };
  onViewProfile?: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onSort,
  currentSort,
  onViewProfile
}) => {const handleSort = (column: keyof User | 'company.name' | 'address.city') => {
    const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
    onSort(column, direction);
  };

  const getSortIcon = (column: keyof User | 'company.name' | 'address.city') => {
    if (currentSort.column !== column) return '↕️';
    return currentSort.direction === 'asc' ? '↑' : '↓';
  };

  if (loading && users.length === 0) {
    return (
      <div className="table-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-table-container">
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th 
                onClick={() => handleSort('firstName')}
                className="sortable"
              >
                Name {getSortIcon('firstName')}
              </th>
              <th 
                onClick={() => handleSort('username')}
                className="sortable"
              >
                Username {getSortIcon('username')}
              </th>
              <th 
                onClick={() => handleSort('email')}
                className="sortable"
              >
                Email {getSortIcon('email')}
              </th>
              <th 
                onClick={() => handleSort('company.name')}
                className="sortable"
              >
                Company {getSortIcon('company.name')}
              </th>
              <th 
                onClick={() => handleSort('age')}
                className="sortable"
              >
                Age {getSortIcon('age')}
              </th>              <th 
                onClick={() => handleSort('address.city')}
                className="sortable"
              >
                City {getSortIcon('address.city')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const avatar = getUserAvatar(user);
              const email = formatEmail(user.email);
              
              return (
                <tr key={user.id}>
                  <td className="user-cell">
                    <div className="user-avatar">
                      {avatar.type === 'image' ? (
                        <img 
                          src={avatar.value} 
                          alt={formatFullName(user)}
                          className="avatar-image"
                        />
                      ) : (
                        <div 
                          className="avatar-initials"
                          style={{ backgroundColor: generateAvatarColor(formatFullName(user)) }}
                        >
                          {avatar.value}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="name-cell">
                    <div className="user-name">
                      <span className="full-name">{formatFullName(user)}</span>
                      <span className="gender">{user.gender}</span>
                    </div>
                  </td>
                  <td className="username-cell">@{user.username}</td>
                  <td className="email-cell">
                    <span className="email-name">{email.name}</span>
                    <span className="email-domain">@{email.domain}</span>
                  </td>
                  <td className="company-cell">
                    <div className="company-info">
                      <span className="company-name">{user.company.name}</span>
                      <span className="company-title">{user.company.title}</span>
                    </div>
                  </td>                  <td className="age-cell">{user.age}</td>
                  <td className="city-cell">{user.address.city}</td>
                  <td className="actions-cell">
                    {onViewProfile && (
                      <button 
                        className="btn-view-profile"
                        onClick={() => onViewProfile(user.id)}
                        title="View Profile"
                      >
                        👤 View Profile
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {loading && (
        <div className="table-loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading more users...</p>
          </div>
        </div>
      )}
      
      {users.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3>No users found</h3>
          <p>Try adjusting your search criteria or refresh the page.</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;
