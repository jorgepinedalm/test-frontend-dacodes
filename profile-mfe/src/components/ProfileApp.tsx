import React, { useState, useEffect } from 'react';
import './ProfileApp.css';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  address?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  company?: {
    name: string;
    title: string;
  };
  birthDate?: string;
  gender?: string;
}

interface ProfileAppProps {
  userId?: number;
  username?: string;
}

const ProfileApp: React.FC<ProfileAppProps> = ({ userId, username }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    // Simulate loading user data
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from an API
        const mockUser: User = {
          id: userId || 1,
          username: username || 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-123-4567',
          image: `https://robohash.org/${username || 'johndoe'}?set=set4`,
          address: {
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA'
          },
          company: {
            name: 'Tech Corp',
            title: 'Software Developer'
          },
          birthDate: '1990-01-15',
          gender: 'male'
        };
        
        setTimeout(() => {
          setUser(mockUser);
          setFormData(mockUser);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, username]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(user || {});
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to an API
      setTimeout(() => {
        setUser(formData as User);
        setEditing(false);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof User] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading && !user) {
    return (
      <div className="profile-app">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-app">
        <div className="error-container">
          <h2>Profile Not Found</h2>
          <p>Unable to load user profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-app">
      <div className="profile-header">
        <h1>👤 Profile Management</h1>
        <p>Manage your personal information and settings</p>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <img 
              src={user.image || `https://robohash.org/${user.username}?set=set4`} 
              alt={`${user.firstName} ${user.lastName}`}
              className="avatar-image"
            />
            <div className="avatar-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="username">@{user.username}</p>
            </div>
          </div>

          <div className="profile-actions">
            {!editing ? (
              <button onClick={handleEdit} className="btn btn-primary">
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="btn btn-success" disabled={loading}>
                  {loading ? '💾 Saving...' : '💾 Save Changes'}
                </button>
                <button onClick={handleCancel} className="btn btn-secondary">
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-details">
          <div className="details-section">
            <h3>Personal Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>First Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span>{user.firstName}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span>{user.lastName}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span>{user.email}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span>{user.phone || 'Not provided'}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Birth Date</label>
                {editing ? (
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span>{user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Gender</label>
                {editing ? (
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span>{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}</span>
                )}
              </div>
            </div>
          </div>

          {user.company && (
            <div className="details-section">
              <h3>Company Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Company</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.company?.name || ''}
                      onChange={(e) => handleInputChange('company.name', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{user.company.name}</span>
                  )}
                </div>

                <div className="detail-item">
                  <label>Job Title</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.company?.title || ''}
                      onChange={(e) => handleInputChange('company.title', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{user.company.title}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {user.address && (
            <div className="details-section">
              <h3>Address Information</h3>
              <div className="details-grid">
                <div className="detail-item full-width">
                  <label>Street Address</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.address || ''}
                      onChange={(e) => handleInputChange('address.address', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{user.address.address}</span>
                  )}
                </div>

                <div className="detail-item">
                  <label>City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{user.address.city}</span>
                  )}
                </div>

                <div className="detail-item">
                  <label>State</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.state || ''}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{user.address.state}</span>
                  )}
                </div>

                <div className="detail-item">
                  <label>Postal Code</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.postalCode || ''}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{user.address.postalCode}</span>
                  )}
                </div>

                <div className="detail-item">
                  <label>Country</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.country || ''}
                      onChange={(e) => handleInputChange('address.country', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{user.address.country}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileApp;
