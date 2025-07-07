import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [subscribers, setSubscribers] = useState(() => {
    const saved = localStorage.getItem('test_subscribers');
    return saved ? JSON.parse(saved) : [];
  });
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    email: '',
    tradingViewId: '',
    pricing: '1',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    subscriptionStatus: 'Active' // Default to Active
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [viewDetails, setViewDetails] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(subscriber => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subscriber.userName.toLowerCase().includes(searchLower) ||
      subscriber.email.toLowerCase().includes(searchLower) ||
      subscriber.referralId.toLowerCase().includes(searchLower) ||
      subscriber.phoneNumber.toLowerCase().includes(searchLower) ||
      subscriber.tradingViewId.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const expiryDate = new Date(startDate);
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      const now = new Date();
      let endOfDay = new Date(expiryDate);
      endOfDay.setHours(23, 59, 59, 999);
      let diffMs = endOfDay.getTime() - now.getTime();
      
      let remainingTime = 'Expired';
      let subscriptionStatus = 'Expired';
      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        remainingTime = `${days}d ${hours}h ${minutes}m`;
        subscriptionStatus = 'Active';
      }

      setFormData(prev => ({
        ...prev,
        expiryDate: expiryDate.toISOString().split('T')[0],
        remainingTime,
        subscriptionStatus,
        pricing: '1'
      }));
    }
  }, [formData.startDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate referral code if not present
    let referralId = formData.referralId;
    if (!referralId) {
      const nextNumber = subscribers.length + 1;
      referralId = `REF${String(nextNumber).padStart(4, '0')}`;
    }

    if (editingId !== null) {
      setSubscribers(subscribers.map(sub =>
        sub.id === editingId ? { ...formData, referralId, id: editingId } : sub
      ));
      setEditingId(null);
      setSuccessMsg('Subscriber updated successfully!');
    } else {
      const newSubscriber = {
        ...formData,
        referralId,
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        subscriptionStatus: formData.subscriptionStatus || 'Active'
      };
      setSubscribers([...subscribers, newSubscriber]);
      setSuccessMsg('Subscriber added successfully!');
    }

    setFormData({
      userName: '',
      phoneNumber: '',
      email: '',
      referralId: '',
      tradingViewId: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      subscriptionStatus: 'Active'
    });

    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleEdit = (id) => {
    const subscriberToEdit = subscribers.find(sub => sub.id === id);
    if (subscriberToEdit) {
      setFormData(subscriberToEdit);
      setEditingId(id);
      setActiveTab('add');
    }
  };

  const handleDelete = (id) => {
    setSubscribers(subscribers.filter(sub => sub.id !== id));
  };

  const handleViewDetails = (subscriber) => {
    setViewDetails(subscriber);
  };

  const closeDetails = () => setViewDetails(null);

  useEffect(() => {
    localStorage.setItem('test_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  const getSubscriptionStatus = (expiryDate) => {
    if (!expiryDate) return 'Unknown';
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    expiry.setHours(23, 59, 59, 999);
    return now > expiry ? 'Expired' : 'Active';
  };

  return (
    <div className="app-container">
      <div className="header-banner">
        <h1>
          <i className="fas fa-users" style={{ color: "white", marginRight: "10px" }}></i>
          Total Demo Subscribers List
        </h1>
        <p>Manage all your total demo subscribers</p>
      </div>

      <div className="tabs custom-tabs">
        <button
          className={activeTab === 'add' ? 'tab active custom-tab' : 'tab custom-tab'}
          onClick={() => setActiveTab('add')}
        >
          <i className="fas fa-user-plus" style={{ color: "blue", marginRight: "6px" }}></i>
          Add Subscriber
        </button>
        <button
          className={activeTab === 'view' ? 'tab active custom-tab' : 'tab custom-tab'}
          onClick={() => setActiveTab('view')}
        >
          <i className="fas fa-address-book" style={{ color: "blue", marginRight: "6px" }}></i>
          View Subscribers
        </button>
      </div>
      
      {activeTab === 'add' && (
        <div className="subscriber-form custom-form-bg">
          <h2>
            <i className="fas fa-user-plus" style={{ color: "#28a745", marginRight: "8px" }}></i>
            {editingId !== null ? 'Edit Subscriber' : 'Add New Subscriber'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group input-icon-group">
                <label><i className="fas fa-user-circle"></i> User Name</label>
                <span className="input-icon"><i className="fas fa-user"></i></span>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  readOnly={editingId !== null}
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-phone-square-alt"></i> Phone Number</label>
                <span className="input-icon"><i className="fas fa-phone"></i></span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  readOnly={editingId !== null}
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-at"></i> Email ID</label>
                <span className="input-icon"><i className="fas fa-envelope"></i></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  readOnly={editingId !== null}
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-chart-bar"></i> Trading View ID</label>
                <span className="input-icon"><i className="fas fa-chart-line"></i></span>
                <input
                  type="text"
                  name="tradingViewId"
                  value={formData.tradingViewId}
                  onChange={handleChange}
                  readOnly={editingId !== null}
                />
              </div>
              <div className="form-group input-icon-group">
                <label>
                  <i className="fas fa-calendar-alt"></i> Start Date
                </label>
                <span className="input-icon">
                  <i className="fas fa-calendar-alt"></i>
                </span>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  readOnly={editingId !== null}
                />
              </div>
              <div className="form-group input-icon-group">
                <label>
                  <i className="fas fa-calendar-check"></i> Expiry Date
                </label>
                <span className="input-icon">
                  <i className="fas fa-calendar-check"></i>
                </span>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-hourglass-half"></i> Remaining Time </label>
                <span className="input-icon"><i className="fas fa-hourglass-half"></i></span>
                <input
                  type="text"
                  name="remainingTime"
                  value={formData.remainingTime || ''}
                  readOnly
                  className="read-only"
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-clock"></i> Status</label>
                <span className="input-icon">
                  <i className="fas fa-clock"></i>
                </span>
                <input
                  type="text"
                  name="subscriptionStatus"
                  value={formData.subscriptionStatus || 'Active'}
                  readOnly
                  className="read-only"
                />
              </div>
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                <i className={`fas ${editingId !== null ? 'fa-save' : 'fa-plus'}`}></i>
                &nbsp;{editingId !== null ? 'Update Subscriber' : 'Add Subscriber'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      userName: '',
                      phoneNumber: '',
                      email: '',
                      referralId: '',
                      tradingViewId: '',
                      startDate: new Date().toISOString().split('T')[0],
                      expiryDate: '',
                      subscriptionStatus: 'Active'
                    });
                  }}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              )}
            </div>
          </form>
          {successMsg && (
            <div className="success-message" style={{
              color: "#155724",
              padding: "10px 20px",
              borderRadius: "5px",
              margin: "15px 0",
              textAlign: "center",
              fontWeight: "bold",
              boxShadow: "0 2px 8px #0001"
            }}>
              <i className="fas fa-check-circle" style={{ color: "#28a745", marginRight: "8px" }}></i>
              {successMsg}
            </div>
          )}
        </div>
      )}

      {activeTab === 'view' && (
        <div className="subscriber-list">
          <h2>Total Demo Subscribers ({subscribers.length})</h2>
          
          {/* Search Bar */}
          <div className="search-bar">
            <div className="input-icon-group">
              <span className="input-icon"><i className="fas fa-search"></i></span>
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Serial No</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Referral ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber, idx) => (
                    <tr key={subscriber.id}>
                      <td>{idx + 1}</td>
                      <td>{subscriber.userName}</td>
                      <td>{subscriber.email}</td>
                      <td>{subscriber.referralId}</td>
                      <td className={getSubscriptionStatus(subscriber.expiryDate) === 'Active' ? 'status-active' : 'status-expired'}>
                        {getSubscriptionStatus(subscriber.expiryDate)}
                      </td>
                      <td>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(subscriber)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          style={{ color: "red", marginLeft: "6px" }}
                          title="Delete"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this subscriber?")) {
                              handleDelete(subscriber.id);
                            }
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#888' }}>
                      {searchTerm ? 'No matching subscribers found' : 'No subscribers found. Add your first subscriber!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'view' && viewDetails && (
        <div className="details-modal">
          <div className="details-card">
            <h3>
              <i className="fas fa-id-card" style={{ color: "#6f42c1", marginRight: "8px" }}></i>
              Subscriber Details
            </h3>
            <button className="close-btn" onClick={closeDetails}>&times;</button>
            <ul>
              <li>
                <span className="modal-label">
                  <i className="fas fa-user" style={{ color: "#007bff", marginRight: "10px" }}></i> User Name:
                </span>
                <span className="modal-value">{viewDetails.userName}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-envelope" style={{ color: "#fd7e14", marginRight: "10px" }}></i> Email:
                </span>
                <span className="modal-value">{viewDetails.email}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-phone" style={{ color: "#20c997", marginRight: "10px" }}></i> Phone Number:
                </span>
                <span className="modal-value">{viewDetails.phoneNumber}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-user-friends" style={{ color: "#6f42c1", marginRight: "10px" }}></i> Referral ID:
                </span>
                <span className="modal-value">{viewDetails.referralId}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-chart-line" style={{ color: "#e83e8c", marginRight: "10px" }}></i> Trading View ID:
                </span>
                <span className="modal-value">{viewDetails.tradingViewId}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-calendar-alt" style={{ color: "#007bff" , marginRight: "10px" }}></i> Start Date:
                </span>
                <span className="modal-value">{viewDetails.startDate}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-calendar-check" style={{ color: "#28a745", marginRight: "10px" }}></i> Expiry Date:
                </span>
                <span className="modal-value">{viewDetails.expiryDate}</span>
              </li>
              <li>
                  <span className="modal-label">
                      <i className="fas fa-hourglass-half" style={{ color: "#6c757d", marginRight: "10px" }}></i> Remaining Time:
                  </span>
                  <span className="modal-value">
                  {(() => {
                  if (viewDetails && viewDetails.expiryDate) {
                  const now = new Date();
                  const expiry = new Date(viewDetails.expiryDate);
                  expiry.setHours(23, 59, 59, 999);
                  let diffMs = expiry.getTime() - now.getTime();
                  
                  if (diffMs <= 0) return 'Expired';
                  
                  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  
                  return `${days}d ${hours}h ${minutes}m`;
                }
                return '';
                })()}
                </span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-clock" style={{ color: "#17a2b8", marginRight: "10px" }}></i> Status:
                </span>
                <span className="modal-value">{getSubscriptionStatus(viewDetails.expiryDate)}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;