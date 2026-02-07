import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  MapPin, 
  Mail, 
  Phone,
  User,
  Check,
  X,
  Download
} from 'lucide-react';

const Schedules = () => {
  const [activeTab, setActiveTab] = useState('Set Schedule');

  const applicants = [
    { id: 'APP004', name: 'Ana Garcia', email: 'ana.garcia@email.com', phone: '+63 945 678 9012', position: 'Logistics Coordinator', time: '10:30 AM' },
    { id: 'APP005', name: 'Jose Mendoza', email: 'jose.mendoza@email.com', phone: '+63 956 789 0123', position: 'Warehouse Supervisor', time: '11:30 AM' },
    { id: 'APP006', name: 'Maria Santos', email: 'm.santos@email.com', phone: '+63 917 123 4567', position: 'Logistics Coordinator', time: '01:00 PM' },
  ];

  // --- SET SCHEDULE VIEW (IMAGE 1 REPLICA) ---
  const SetScheduleView = () => (
    <div className="set-schedule-grid">
      {/* LEFT COLUMN: SELECT APPLICANTS */}
      <div className="schedule-card">
        <div className="card-header-flex">
          <h3>Select Applicants</h3>
          <button className="text-link">Select All</button>
        </div>
        
        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input-box" />
        </div>

        <div className="applicant-selection-list">
          {applicants.map((app) => (
            <div key={app.id} className="selection-row">
              <div className="checkbox-wrapper">
                <input type="checkbox" className="custom-checkbox" />
              </div>
              <div className="selection-details">
                <div className="selection-top">
                  <span className="selection-id">{app.id}</span>
                  <span className="selection-name">{app.name}</span>
                </div>
                <div className="selection-bottom">
                  <span>{app.email}</span>
                  <span className="separator">|</span>
                  <span>{app.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: ASSIGN DATES & TIMES */}
      <div className="schedule-card">
        <div className="card-header-flex">
          <h3>Assign Dates and Times</h3>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input 
            type="text" 
            className="form-input" 
            defaultValue="Burke Building, Binondo, Manila" 
          />
        </div>

        <div className="form-group">
          <label>Room Number</label>
          <input 
            type="text" 
            className="form-input" 
            defaultValue="210" 
          />
        </div>

        <div className="empty-preview-state">
          <div className="empty-icon-circle">
            <Clock size={48} strokeWidth={1.5} />
          </div>
          <p>No applicants with dates yet</p>
        </div>

        <button className="btn-save-schedule">Save Schedule</button>
      </div>
    </div>
  );

  // --- INTERVIEW VIEW (CLEAN PROFILE VERSION) ---
  const InterviewView = () => (
    <div className="interview-profile-container">
      <div className="profile-header-card">
        <div className="header-flex">
          <div className="avatar-placeholder">
            <User size={32} />
          </div>
          <div className="header-info">
            <h1>Ana Garcia</h1>
            <div className="header-meta">
              <span>Logistics Coordinator</span>
              <span className="dot">•</span>
              <span>ID: APP004</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-reject"><X size={18} /> Reject</button>
            <button className="btn-approve"><Check size={18} /> Approve</button>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label><Mail size={14} /> Email Address</label>
            <p>ana.garcia@email.com</p>
          </div>
          <div className="info-item">
            <label><Phone size={14} /> Contact Number</label>
            <p>+63 945 678 9012</p>
          </div>
          <div className="info-item">
            <label><MapPin size={14} /> Current Location</label>
            <p>Binondo, Manila</p>
          </div>
        </div>
      </div>

      <div className="resume-section">
        <div className="section-title">
          <h3>Resume / Application Form</h3>
          <button className="btn-download"><Download size={16} /> Download PDF</button>
        </div>
        <div className="resume-viewer-mock">
          <div className="resume-page">
            <div className="resume-line title"></div>
            <div className="resume-line"></div>
            <div className="resume-line short"></div>
            <div className="resume-block"></div>
            <div className="resume-line"></div>
            <div className="resume-line"></div>
            <div className="resume-line short"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="schedules-page">
      <style>{`
        .schedules-page { font-family: 'Inter', sans-serif; color: #1e293b; }
        
        /* Navigation Tabs */
        .tab-nav { display: flex; gap: 32px; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px; }
        .tab-btn { background: none; border: none; padding: 12px 4px; font-size: 0.95rem; font-weight: 600; color: #94a3b8; cursor: pointer; position: relative; }
        .tab-btn.active { color: #3b82f6; }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #3b82f6; }

        /* SET SCHEDULE LAYOUT */
        .set-schedule-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .schedule-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; display: flex; flex-direction: column; }
        .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .card-header-flex h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
        .text-link { background: none; border: none; color: #3b82f6; font-weight: 600; cursor: pointer; font-size: 0.9rem; }

        .search-bar-container { position: relative; margin-bottom: 20px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-input-box { width: 100%; padding: 10px 12px 10px 40px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; outline: none; }

        .applicant-selection-list { display: flex; flex-direction: column; gap: 10px; }
        .selection-row { display: flex; align-items: flex-start; gap: 14px; padding: 12px; border: 1px solid #f1f5f9; border-radius: 10px; }
        .custom-checkbox { width: 18px; height: 18px; border-radius: 4px; border: 2px solid #cbd5e1; cursor: pointer; margin-top: 2px; }
        
        .selection-details { display: flex; flex-direction: column; gap: 2px; }
        .selection-top { display: flex; gap: 10px; align-items: center; }
        .selection-id { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
        .selection-name { font-size: 0.95rem; font-weight: 700; color: #1e293b; }
        .selection-bottom { font-size: 0.8rem; color: #64748b; display: flex; gap: 8px; }
        .separator { color: #e2e8f0; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #64748b; margin-bottom: 8px; }
        .form-input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; }

        .empty-preview-state { flex: 1; min-height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #f1f5f9; border-radius: 12px; margin: 10px 0 24px; color: #94a3b8; }
        .empty-icon-circle { width: 90px; height: 90px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #cbd5e1; }
        .empty-preview-state p { font-weight: 500; font-size: 1rem; }

        .btn-save-schedule { width: 100%; background: #3b82f6; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.2s; }
        .btn-save-schedule:hover { background: #2563eb; }

        /* INTERVIEW VIEW (NO QUEUE) */
        .interview-profile-container { width: 100%; }
        .profile-header-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .header-flex { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
        .avatar-placeholder { width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .header-info h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .header-meta { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.9rem; margin-top: 4px; }
        .header-actions { margin-left: auto; display: flex; gap: 12px; }
        .btn-reject { display: flex; align-items: center; gap: 8px; border: 1px solid #fecaca; color: #dc2626; background: #fef2f2; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-approve { display: flex; align-items: center; gap: 8px; background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; border-top: 1px solid #f1f5f9; padding-top: 24px; }
        .info-item label { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
        .info-item p { margin: 0; font-size: 0.95rem; font-weight: 600; color: #1e293b; }

        .resume-section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
        .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-title h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
        .btn-download { display: flex; align-items: center; gap: 8px; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }

        .resume-viewer-mock { background: #f1f5f9; border-radius: 8px; padding: 40px; display: flex; justify-content: center; border: 1px solid #e2e8f0; }
        .resume-page { background: white; width: 100%; max-width: 600px; min-height: 500px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 40px; }
        .resume-line { height: 10px; background: #f1f5f9; margin-bottom: 12px; border-radius: 2px; }
        .resume-line.title { height: 20px; width: 60%; margin-bottom: 30px; background: #e2e8f0; }
        .resume-line.short { width: 40%; }
        .resume-block { height: 100px; background: #f8fafc; margin: 20px 0; border-radius: 4px; border: 1px solid #f1f5f9; }
      `}</style>

      <nav className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'Set Schedule' ? 'active' : ''}`} 
          onClick={() => setActiveTab('Set Schedule')}
        >
          Set Schedule
        </button>
        <button 
          className={`tab-btn ${activeTab === 'Interview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('Interview')}
        >
          Interview
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'Set Schedule' ? <SetScheduleView /> : <InterviewView />}
      </div>
    </div>
  );
};

export default Schedules;