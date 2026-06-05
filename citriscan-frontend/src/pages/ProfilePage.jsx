import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Pencil,
  Mail,
  User,
  Calendar,
  Shield,
  LogOut,
  Info,
} from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, onSignOut } = useOutletContext();
  const [showToast, setShowToast] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const email = user?.email || 'Not available';
  const provider = user?.providerData?.[0]?.providerId || 'email/password';
  const createdAt = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  const handleEditProfile = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const FIELDS = [
    { icon: User, label: 'Display Name', value: displayName },
    { icon: Mail, label: 'Email Address', value: email },
    { icon: Calendar, label: 'Account Created', value: createdAt },
    { icon: Shield, label: 'Auth Provider', value: providerLabel(provider) },
  ];

  return (
    <div className="profile" id="profile-page">
      {/* Toast notification */}
      {showToast && (
        <div className="profile__toast" role="status">
          <Info size={16} className="profile__toast-icon" />
          Edit Profile feature coming soon!
        </div>
      )}

      {/* Header Card */}
      <div className="profile__header" id="profile-header">
        <div className="profile__avatar-wrap">
          <div className="profile__avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile avatar" />
            ) : (
              initials
            )}
          </div>
        </div>
        <h2 className="profile__name">{displayName}</h2>
        <p className="profile__role">CitriScan Member</p>
        <button className="profile__edit-btn" onClick={handleEditProfile} id="profile-edit-btn">
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* Details Card */}
      <div className="profile__details" id="profile-details">
        <h3 className="profile__details-title">Account Information</h3>
        {FIELDS.map((field) => (
          <div className="profile__field" key={field.label}>
            <div className="profile__field-icon">
              <field.icon size={16} />
            </div>
            <div>
              <p className="profile__field-label">{field.label}</p>
              <p className="profile__field-value">{field.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Card */}
      <div className="profile__actions" id="profile-actions">
        <h3 className="profile__actions-title">Account Actions</h3>
        <button className="profile__signout-btn" onClick={onSignOut} id="profile-signout-btn">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function providerLabel(providerId) {
  switch (providerId) {
    case 'google.com': return 'Google';
    case 'github.com': return 'GitHub';
    case 'facebook.com': return 'Facebook';
    case 'password': return 'Email & Password';
    default: return providerId;
  }
}
