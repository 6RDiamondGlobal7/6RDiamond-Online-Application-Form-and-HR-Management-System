import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
  ChevronLeft, ChevronRight, Eye, Download, ChevronDown, 
  Search, Mail, Phone, FileText, CheckCircle, X
} from 'lucide-react';
import './Applicants.css';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- FETCH DATA ---
  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/applicants');
      setApplicants(response.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // --- HANDLE STATUS UPDATE ---
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this applicant as ${newStatus}?`)) return;
    
    try {
      await axios.put(`http://localhost:5000/api/applicants/${id}/status`, { status: newStatus });
      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      setSelectedApplicant(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // --- FILTERS & PAGINATION ---
  const positions = ['All Positions', ...new Set(applicants.map(item => item.position))];
  const branches = ['All Branches', ...new Set(applicants.map(item => item.branch))];

  const filteredData = applicants.filter(app => {
    const matchesStatus = statusFilter === 'All' || app.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPosition = positionFilter === 'All Positions' || app.position === positionFilter;
    const matchesBranch = branchFilter === 'All Branches' || app.branch === branchFilter;
    const matchesSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        app.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPosition && matchesBranch && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const updateStatus = (val) => { setStatusFilter(val); setCurrentPage(1); };

  return (
    <div className="applicants-container">
      {/* HEADER */}
      <div className="tab-title-area">
        <div className="title-icon">👥</div>
        <h2>Applicants</h2>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="top-tabs-card">
        {['All', 'Applied', 'Interview', 'Hired', 'Rejected'].map((tab, index, array) => {
          const count = applicants.filter(a => 
            tab === 'All' ? true : a.status.toLowerCase() === tab.toLowerCase()
          ).length;

          return (
            <React.Fragment key={tab}>
              <button 
                className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
                onClick={() => updateStatus(tab)}
              >
                {tab} ({count})
              </button>
              {index < array.length - 1 && <span className="tab-divider">|</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* FILTERS AREA */}
      <div className="filters-card">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="select-wrapper">
          <FileText className="select-left-icon" size={18} />
          <select className="filter-select" value={positionFilter} onChange={(e) => { setPositionFilter(e.target.value); setCurrentPage(1); }}>
            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
          <ChevronDown className="select-right-icon" size={18} />
        </div>

        <div className="select-wrapper">
          <Search className="select-left-icon" size={18} />
          <select className="filter-select" value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}>
            {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
          </select>
          <ChevronDown className="select-right-icon" size={18} />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="applicants-table">
          <thead>
            <tr>
              <th>Applicant #</th>
              <th>Name</th>
              <th>Contact Information</th>
              <th>Status</th>
              <th>Position</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="no-data">Loading applicants...</td></tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((app) => (
                <tr key={app.id}>
                  <td className="bold">{app.id}</td>
                  <td className="bold">{app.name}</td>
                  <td>
                    <div className="contact-wrapper">
                      <div className="contact-info">
                        <Mail size={14} className="contact-icon" /> {app.email}
                      </div>
                      <div className="contact-info">
                        <Phone size={14} className="contact-icon" /> {app.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{app.position}</td>
                  <td>{app.branch}</td>
                  <td className="actions">
                    <button className="action-icon" title="View Details" onClick={() => setSelectedApplicant(app)}>
                      <Eye size={18} />
                    </button>
                    {app.resume_url && (
                      <a href={app.resume_url} target="_blank" rel="noreferrer" className="action-icon" title="Download Resume">
                        <Download size={18} />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="no-data">No applicants found matching filters.</td></tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {currentItems.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="pagination-controls">
            <button 
              className="page-nav-text" 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button 
                key={index + 1} 
                className={`page-number ${currentPage === index + 1 ? 'active' : ''}`} 
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button 
              className="page-nav-text" 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedApplicant && (
        <div className="app-modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-title-area">
                <h3>Applicant Profile</h3>
                <p className="app-modal-subtitle">ID: {selectedApplicant.id} | Status: {selectedApplicant.status}</p>
              </div>
              <button className="app-modal-close-btn" onClick={() => setSelectedApplicant(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="app-modal-body">
              {/* PERSONAL INFO */}
              <section>
                <div className="app-section-header">
                  <CheckCircle size={18} />
                  <span className="app-section-title">Personal Information</span>
                </div>
                <div className="app-info-grid">
                  <div className="app-info-item"><span className="app-info-label">First Name</span><span className="app-info-value">{selectedApplicant.firstName || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Middle Initial</span><span className="app-info-value">{selectedApplicant.middleInitial || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Last Name</span><span className="app-info-value">{selectedApplicant.lastName || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Date of Birth</span><span className="app-info-value">{selectedApplicant.birthday || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Age</span><span className="app-info-value">{selectedApplicant.age || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Nationality</span><span className="app-info-value">{selectedApplicant.nationality || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Email</span><span className="app-info-value">{selectedApplicant.email || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Phone</span><span className="app-info-value">{selectedApplicant.phone || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Branch</span><span className="app-info-value">{selectedApplicant.branch || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Position Applied</span><span className="app-info-value">{selectedApplicant.position || 'N/A'}</span></div>
                </div>
              </section>

              {/* ADDRESS */}
              <section>
                <div className="app-section-header">
                  <Search size={18} />
                  <span className="app-section-title">Address</span>
                </div>
                <div className="app-address-grid">
                  <div className="app-info-item"><span className="app-info-label">Region</span><span className="app-info-value">{selectedApplicant.region || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Province</span><span className="app-info-value">{selectedApplicant.province || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">City/Municipality</span><span className="app-info-value">{selectedApplicant.city || 'N/A'}</span></div>
                  <div className="app-info-item"><span className="app-info-label">Barangay</span><span className="app-info-value">{selectedApplicant.barangay || 'N/A'}</span></div>
                  <div className="app-info-item" style={{ gridColumn: 'span 2' }}><span className="app-info-label">Detailed Address</span><span className="app-info-value">{selectedApplicant.detailedAddress || 'N/A'}</span></div>
                </div>
              </section>

              {/* DOCUMENTS */}
              <section>
                <div className="app-section-header">
                  <FileText size={18} />
                  <span className="app-section-title">Documents</span>
                </div>
                <div className="app-doc-list">
                  {selectedApplicant.resume_url ? (
                    <div className="app-doc-card">
                      <div className="app-doc-info">
                        <div className="app-doc-icon-box"><FileText size={20} /></div>
                        <div className="app-doc-details">
                          <span className="app-doc-type">Resume</span>
                          <span className="app-doc-name">Submitted</span>
                        </div>
                      </div>
                      <div className="app-doc-actions">
                        <button className="app-btn-view" onClick={() => window.open(selectedApplicant.resume_url, '_blank')}>View PDF</button>
                      </div>
                    </div>
                  ) : <p className="no-data" style={{fontSize: '0.85rem', color: '#718096', paddingLeft: '10px'}}>No Resume Uploaded</p>}
                  
                  {selectedApplicant.cover_letter_url ? (
                    <div className="app-doc-card">
                      <div className="app-doc-info">
                        <div className="app-doc-icon-box"><FileText size={20} /></div>
                        <div className="app-doc-details">
                          <span className="app-doc-type">Cover Letter</span>
                          <span className="app-doc-name">Submitted</span>
                        </div>
                      </div>
                      <div className="app-doc-actions">
                        <button className="app-btn-view" onClick={() => window.open(selectedApplicant.cover_letter_url, '_blank')}>View PDF</button>
                      </div>
                    </div>
                  ) : <p className="no-data" style={{fontSize: '0.85rem', color: '#718096', paddingLeft: '10px'}}>No Cover Letter Uploaded</p>}
                </div>
              </section>

              {/* MEDICAL CONDITION */}
              <section>
                <div className="app-section-header">
                  <CheckCircle size={18} />
                  <span className="app-section-title">Medical Condition</span>
                </div>
                <div className="app-medical-box">
                  <div className="app-info-item">
                    <span className="app-info-label">Has Pre-existing Medical Conditions?</span>
                    <span className="app-info-value" style={{ color: selectedApplicant.medicalCondition === 'yes' ? '#e74c3c' : '#2ecc71' }}>
                      {selectedApplicant.medicalCondition ? selectedApplicant.medicalCondition.toUpperCase() : 'NO'}
                    </span>
                  </div>
                  {selectedApplicant.medicalCondition === 'yes' && (
                    <div className="app-info-item" style={{ marginTop: '15px' }}>
                      <span className="app-info-label">Condition Details</span>
                      <span className="app-info-value">{selectedApplicant.medicalDetails || 'No details provided'}</span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ACTION BUTTONS */}
            {selectedApplicant.status.toLowerCase() === 'applied' && (
              <div className="app-modal-footer">
                <button className="app-btn-reject" onClick={() => handleUpdateStatus(selectedApplicant.id, 'Rejected')}>
                   Reject Application
                </button>
                <button className="app-btn-approve" onClick={() => handleUpdateStatus(selectedApplicant.id, 'Interview')}>
                   Approve Interview
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;