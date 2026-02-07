import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ApplicationForm.css';

// --- ICONS ---
const IconArrowRight = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg> );
const IconArrowLeft = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg> );
const IconLoading = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFB81C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> );

// --- 1. THE MASTER LIST OF ROLES ---
// We keep this so the UI always knows what to show, even if the DB is empty.
const ROLES_DATA = [
  { id: 'corp-sec', title: 'Corporate Secretary', desc: 'Oversee brokerage division operations and manage corporate secretarial duties' },
  { id: 'licensed-broker', title: 'Licensed Customs Broker', desc: 'Handle customs clearance procedures and regulatory compliance' },
  { id: 'office-manager', title: 'Office Manager', desc: 'Manage office operations and administrative functions' },
  { id: 'messenger', title: 'Messenger / Logistics', desc: 'Handle document delivery and logistics coordination' },
  { id: 'secretary', title: 'Secretary to the Office Manager', desc: 'Provide administrative support to the Office Manager' },
  { id: 'brokerage-specialist', title: 'Brokerage Specialist', desc: 'Specialize in brokerage operations and client services' },
  { id: 'import-export-head', title: 'Import & Export Head', desc: 'Lead import and export operations and compliance' },
  { id: 'admin-staff', title: 'Administration Staff', desc: 'Support administrative and operational functions' },
  { id: 'doc-head', title: 'Documentations Head', desc: 'Manage documentation processes and compliance records' },
];

const SelectPosition = () => {
  const navigate = useNavigate();
  const { branch } = useParams();
  
  const [availableJobTitles, setAvailableJobTitles] = useState([]); // Stores titles found in DB
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  const displayBranch = branch ? branch.charAt(0).toUpperCase() + branch.slice(1) : 'Manila';

  // --- 2. FETCH OPEN JOBS FROM DB ---
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        
        // Filter jobs that are for THIS branch
        const branchJobs = response.data.filter(job => 
            job.location?.toLowerCase().includes(branch.toLowerCase()) || 
            job.branch?.toLowerCase().includes(branch.toLowerCase())
        );

        // We only save the TITLES of the open jobs to compare later
        // We normalize them (trim spaces) to avoid mismatches
        const titles = branchJobs.map(job => job.job_title.trim());
        setAvailableJobTitles(titles);
        
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [branch]);

  const handleBack = () => {
    navigate('/apply/branch');
  };

  const handleRoleClick = (roleId, isAvailable) => {
    if (isAvailable) {
      setSelectedRole(roleId);
    }
  };

  const handleNext = () => {
    if (selectedRole) {
      navigate(`/apply/${branch}/${selectedRole}`);
    }
  };

  return (
    <div className="af-page-container">
      <div className="af-top-nav">
        <button className="af-back-btn" onClick={handleBack}><IconArrowLeft/> Back to Branch Selection</button>
        <div className="af-progress-wrapper">
            <span className="af-progress-step">Step 1 of 5</span>
            <div className="af-progress-bar"><div className="af-progress-fill" style={{ width: '20%' }}></div></div>
        </div>
      </div>

      <div className="af-card">
        <div className="sp-header">
          <h1 className="af-title">Select Position</h1>
          <p className="af-subtitle">Applying for: <span style={{color: '#FFB81C'}}>{displayBranch} Branch</span></p>
        </div>

        {loading ? (
           <div style={{textAlign: 'center', padding: '40px'}}><IconLoading /></div>
        ) : (
          <div className="sp-grid">
            {/* --- 3. RENDER THE MASTER LIST --- */}
            {ROLES_DATA.map((role) => {
              
              // CHECK: Is this role title in our DB list of "Open" jobs?
              // (We use .find to check roughly if the string matches)
              const isAvailable = availableJobTitles.some(
                  dbTitle => dbTitle.toLowerCase() === role.title.toLowerCase()
              );

              return (
                <div 
                  key={role.id} 
                  // If not available, add 'disabled' class (You can style this to look blurred)
                  className={`sp-role-card ${!isAvailable ? 'disabled' : ''} ${selectedRole === role.id ? 'selected' : ''}`}
                  onClick={() => handleRoleClick(role.id, isAvailable)}
                  style={{ 
                    // Visual Logic
                    border: selectedRole === role.id ? '2px solid #FFB81C' : '1px solid #e2e8f0',
                    backgroundColor: selectedRole === role.id ? '#FFFBEB' : (isAvailable ? 'white' : '#F1F5F9'),
                    opacity: isAvailable ? 1 : 0.6, // Blur effect
                    cursor: isAvailable ? 'pointer' : 'not-allowed'
                  }}
                >
                  <div className="sp-card-header">
                    <h3 className="sp-role-title">{role.title}</h3>
                    {!isAvailable && <span className="sp-badge-closed" style={{fontSize: '10px', background:'#94a3b8', color:'white', padding:'2px 6px', borderRadius:'4px'}}>Closed</span>}
                  </div>
                  <p className="sp-role-desc">{role.desc}</p>
                </div>
              );
            })}
          </div>
        )}
        
        <button 
          className="af-next-btn" 
          onClick={handleNext} 
          disabled={!selectedRole}
          style={{ opacity: selectedRole ? 1 : 0.5, marginTop: '40px' }}
        >
          Next <IconArrowRight />
        </button>
      </div>
    </div>
  );
};

export default SelectPosition;