import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfileApp.css';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  university: string;
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  birthDate: string;
  role: string;
}

interface ProfileAppProps {
  userId?: number;
  username?: string;
}

const ProfileApp: React.FC<ProfileAppProps> = ({ userId: propUserId = 1, username }) => {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use URL parameter if available, otherwise use prop
  const effectiveUserId = urlUserId ? parseInt(urlUserId, 10) : propUserId;
  
  // Check if we came from directory (has URL parameter)
  const isFromDirectory = !!urlUserId;

  const handleBackToDirectory = () => {
    navigate('/directory');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://dummyjson.com/users/${effectiveUserId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [effectiveUserId]);

  if (loading) {
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

  if (error || !user) {
    return (
      <div className="profile-app">
        <div className="error-container">
          <h2>Profile Not Found</h2>
          <p>{error || 'Unable to load user profile. Please try again later.'}</p>
        </div>
      </div>
    );
  }  return (
    <div className="profile-app">
      <div className={`profile-header ${!isFromDirectory ? 'centered' : ''}`}>
        <div className="header-content">
          <h1>👤 Profile Information</h1>
          <p>View detailed profile information</p>
        </div>
        {isFromDirectory && (
          <button 
            className="btn-back-to-directory"
            onClick={handleBackToDirectory}
            title="Back to Directory"
          >
            ← Back to Directory
          </button>
        )}
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <img 
              src={user.image} 
              alt={`${user.firstName} ${user.lastName}`}
              className="avatar-image"
            />
            <div className="avatar-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="username">@{user.username}</p>
              <p className="role">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="details-section">
            <h3>Personal Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>First Name</label>
                <span>{user.firstName}</span>
              </div>

              <div className="detail-item">
                <label>Last Name</label>
                <span>{user.lastName}</span>
              </div>

              <div className="detail-item">
                <label>Maiden Name</label>
                <span>{user.maidenName || 'Not provided'}</span>
              </div>

              <div className="detail-item">
                <label>Age</label>
                <span>{user.age} years</span>
              </div>

              <div className="detail-item">
                <label>Gender</label>
                <span>{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</span>
              </div>

              <div className="detail-item">
                <label>Birth Date</label>
                <span>{new Date(user.birthDate).toLocaleDateString()}</span>
              </div>

              <div className="detail-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>

              <div className="detail-item">
                <label>Phone</label>
                <span>{user.phone}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Physical Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Height</label>
                <span>{user.height} cm</span>
              </div>

              <div className="detail-item">
                <label>Weight</label>
                <span>{user.weight} kg</span>
              </div>

              <div className="detail-item">
                <label>Eye Color</label>
                <span>{user.eyeColor}</span>
              </div>

              <div className="detail-item">
                <label>Hair Color</label>
                <span>{user.hair.color}</span>
              </div>

              <div className="detail-item">
                <label>Hair Type</label>
                <span>{user.hair.type}</span>
              </div>

              <div className="detail-item">
                <label>Blood Group</label>
                <span>{user.bloodGroup}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Company Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Company</label>
                <span>{user.company.name}</span>
              </div>

              <div className="detail-item">
                <label>Department</label>
                <span>{user.company.department}</span>
              </div>

              <div className="detail-item">
                <label>Job Title</label>
                <span>{user.company.title}</span>
              </div>

              <div className="detail-item full-width">
                <label>Company Address</label>
                <span>
                  {user.company.address.address}, {user.company.address.city}, 
                  {user.company.address.state} {user.company.address.postalCode}, 
                  {user.company.address.country}
                </span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Address Information</h3>
            <div className="details-grid">
              <div className="detail-item full-width">
                <label>Street Address</label>
                <span>{user.address.address}</span>
              </div>

              <div className="detail-item">
                <label>City</label>
                <span>{user.address.city}</span>
              </div>

              <div className="detail-item">
                <label>State</label>
                <span>{user.address.state} ({user.address.stateCode})</span>
              </div>

              <div className="detail-item">
                <label>Postal Code</label>
                <span>{user.address.postalCode}</span>
              </div>

              <div className="detail-item">
                <label>Country</label>
                <span>{user.address.country}</span>
              </div>

              <div className="detail-item">
                <label>Coordinates</label>
                <span>{user.address.coordinates.lat}, {user.address.coordinates.lng}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Academic Information</h3>
            <div className="details-grid">
              <div className="detail-item full-width">
                <label>University</label>
                <span>{user.university}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileApp;
