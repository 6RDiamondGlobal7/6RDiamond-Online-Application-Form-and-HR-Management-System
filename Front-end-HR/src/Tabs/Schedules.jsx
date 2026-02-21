import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, Clock, MapPin, Mail, Phone, User, Check, X, Download, Calendar, Briefcase
} from 'lucide-react';
import './Schedules.css';

const Schedules = () => {
  const [activeTab, setActiveTab] = useState('Set Schedule');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [scheduledApplicants, setScheduledApplicants] = useState([]);
  const [currentInterviewee, setCurrentInterviewee] = useState(null);

  // Form States
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(''); // NEW: Branch Filter State
  
  const [scheduleForm, setScheduleForm] = useState({
    location: 'Burke Building, Binondo, Manila',
    room: '210',
    date: '',
    time: '',
    reminders: '' // NEW: Reminders State added
  });

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    
    // A. Fetch Candidates ready for Scheduling (Status: Interview, Schedule: NULL)
    const { data: pendingData } = await supabase
      .from('applicantfacttable')
      .select(`*, applicant:applicant_id(*), jobpostings:job_id(job_title, branch)`) // Make sure branch is fetched
      .eq('status', 'Interview')
      .is('schedule_id', null); 

    // B. Fetch Candidates ready for Interviewing (Status: Interview, Schedule: NOT NULL)
    const { data: interviewData } = await supabase
      .from('applicantfacttable')
      .select(`
        *, 
        applicant:applicant_id(*), 
        jobpostings:job_id(job_title, branch),
        schedule:schedule_id(*)
      `)
      .not('schedule_id', 'is', null)
      .eq('status', 'Interview');

    if (pendingData) setPendingApplicants(pendingData);
    if (interviewData) {
      setScheduledApplicants(interviewData);
      if (!currentInterviewee && interviewData.length > 0) {
        setCurrentInterviewee(interviewData[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HANDLE CHECKBOXES ---
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPending.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPending.map(app => app.applicant_fact_id));
    }
  };

  // --- 3. SAVE SCHEDULE TO DATABASE ---
  const handleSaveSchedule = async () => {
    if (selectedIds.length === 0) return alert("Please select at least one applicant.");
    if (!scheduleForm.date || !scheduleForm.time) return alert("Please set a date and time.");

    setLoading(true);

    for (const fact_id of selectedIds) {
      // 1. Create Schedule Entry
      const { data: schedData, error: schedError } = await supabase
        .from('schedule')
        .insert([{
            interview_schedule: scheduleForm.date,
            interview_time: scheduleForm.time,
            room_number: `${scheduleForm.location}, Room ${scheduleForm.room}`, // Combined since DB has no location column
            reminders: scheduleForm.reminders // FIXED: Now saves actual reminders
        }])
        .select()
        .single();

      if (schedError) {
        console.error("Error creating schedule:", schedError);
        continue;
      }

      // 2. Link Schedule to Applicant
      await supabase
        .from('applicantfacttable')
        .update({ schedule_id: schedData.schedule_id })
        .eq('applicant_fact_id', fact_id);
    }

    alert("Schedules saved successfully!");
    setSelectedIds([]);
    // Reset Form
    setScheduleForm(prev => ({...prev, date: '', time: '', reminders: ''}));
    fetchData(); 
  };

  // --- 4. HANDLE APPROVE / REJECT ---
  const handleDecision = async (status) => {
    if (!currentInterviewee) return;
    const confirmMsg = status === 'Hired' ? "Hire this candidate?" : "Reject this candidate?";
    if (!window.confirm(confirmMsg)) return;

    await supabase
      .from('applicantfacttable')
      .update({ status: status }) 
      .eq('applicant_fact_id', currentInterviewee.applicant_fact_id);

    alert(`Candidate marked as ${status}`);
    setCurrentInterviewee(null);
    fetchData(); 
  };

  // --- FILTERING (UPDATED FOR BRANCH AND SEARCH) ---
  const filteredPending = pendingApplicants.filter(app => {
    const matchesSearch = `${app.applicant?.first_name} ${app.applicant?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch ? app.jobpostings?.branch === selectedBranch : true;
    return matchesSearch && matchesBranch;
  });

  // --- VIEW COMPONENTS ---
  const SetScheduleView = () => (
    <div className="set-schedule-grid">
      {/* LEFT: LIST */}
      <div className="schedule-card">
        <div className="card-header-flex">
          <h3>Select Applicants</h3>
          <button className="text-link" onClick={toggleSelectAll}>
            Select All
          </button>
        </div>
        
        <div className="search-bar-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search applicants..." 
              className="search-input-box"
              style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* NEW: Branch Dropdown mapped exactly to your screenshot */}
          <div style={{ position: 'relative' }}>
            <MapPin size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <select 
              className="search-input-box"
              style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', appearance: 'none', background: 'white' }}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              <option value="Manila">Manila</option>
              <option value="Cebu">Cebu</option>
              <option value="Davao">Davao</option>
            </select>
          </div>
        </div>

        <div className="applicant-selection-list">
          {filteredPending.length === 0 ? (
             <p className="no-data-msg" style={{textAlign: 'center', color: '#94a3b8', padding: '20px'}}>No candidates waiting for schedule.</p>
          ) : (
            filteredPending.map((app) => (
              <div key={app.applicant_fact_id} className={`selection-row ${selectedIds.includes(app.applicant_fact_id) ? 'selected' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', backgroundColor: selectedIds.includes(app.applicant_fact_id) ? '#eff6ff' : 'white', borderColor: selectedIds.includes(app.applicant_fact_id) ? '#3b82f6' : '#f1f5f9' }}>
                <div className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    className="custom-checkbox" 
                    style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
                    checked={selectedIds.includes(app.applicant_fact_id)}
                    onChange={() => toggleSelection(app.applicant_fact_id)}
                  />
                </div>
                <div className="selection-details" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="selection-top" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="selection-id" style={{ fontSize: '0.75rem', color: 'white', backgroundColor: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      APP{app.application_id || app.applicant_fact_id}
                    </span>
                    <span className="selection-name" style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                      {app.applicant?.first_name} {app.applicant?.last_name}
                    </span>
                  </div>
                  <div className="selection-bottom" style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span><Mail size={12} style={{display: 'inline', marginRight: '4px'}}/>{app.applicant?.email}</span>
                    <span className="separator">|</span>
                    <span><Phone size={12} style={{display: 'inline', marginRight: '4px'}}/>{app.applicant?.contact_number}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="schedule-card">
        <div className="card-header-flex">
          <h3>Assign Times</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedIds.length} Applicant(s) Selected</span>
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Location</label>
          <input 
            type="text" 
            className="form-input" 
            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
            value={scheduleForm.location}
            onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Room Number</label>
          <input 
            type="text" 
            className="form-input" 
            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
            value={scheduleForm.room}
            onChange={(e) => setScheduleForm({...scheduleForm, room: e.target.value})}
          />
        </div>

        {/* NEW: Reminders Input */}
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Reminders</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Be on time."
            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
            value={scheduleForm.reminders}
            onChange={(e) => setScheduleForm({...scheduleForm, reminders: e.target.value})}
          />
        </div>

        {/* Native Date and Time inputs styled to look clean */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Date</label>
            <input 
              type="date" 
              className="form-input"
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Time</label>
            <input 
              type="time" 
              className="form-input"
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
              value={scheduleForm.time}
              onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
            />
          </div>
        </div>

        <div className="empty-preview-state" style={{ flex: 1, minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #f1f5f9', borderRadius: '12px', margin: '10px 0 24px', color: '#94a3b8', backgroundColor: '#fffdf5', borderColor: '#fcd34d' }}>
           {selectedIds.length > 0 && scheduleForm.date ? (
             <div className="summary-preview" style={{ textAlign: 'center' }}>
                <Clock size={32} color="#f6ad55" style={{ marginBottom: '10px' }} />
                <p style={{ color: '#2d3748', fontWeight: 'bold' }}>Ready to Schedule</p>
                <p style={{ fontSize: '0.85rem' }}>Scheduling {selectedIds.length} applicant(s)</p>
             </div>
           ) : (
             <>
               <Clock size={40} color="#fcd34d" style={{ marginBottom: '10px' }} />
               <p style={{ color: '#2d3748', fontWeight: 'bold' }}>No applicants with dates yet</p>
               <p style={{ fontSize: '0.85rem' }}>Assign dates to applicants first</p>
             </>
           )}
        </div>

        <button 
          className="btn-save-schedule" 
          onClick={handleSaveSchedule} 
          disabled={loading || selectedIds.length === 0}
          style={{ width: '100%', background: selectedIds.length > 0 ? '#3b82f6' : '#cbd5e1', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed', transition: '0.2s' }}
        >
          {loading ? 'Saving...' : 'Complete Scheduling'}
        </button>
      </div>
    </div>
  );

  const InterviewView = () => (
    <div className="interview-layout" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
      {/* SIDEBAR QUEUE */}
      <div className="interview-sidebar" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', height: 'fit-content' }}>
         <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#64748b' }}>Queue ({scheduledApplicants.length})</h3>
         <div className="queue-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scheduledApplicants.map(app => (
               <div 
                 key={app.applicant_fact_id} 
                 className={`queue-item ${currentInterviewee?.applicant_fact_id === app.applicant_fact_id ? 'active' : ''}`}
                 onClick={() => setCurrentInterviewee(app)}
                 style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent', backgroundColor: currentInterviewee?.applicant_fact_id === app.applicant_fact_id ? '#eff6ff' : 'transparent', borderColor: currentInterviewee?.applicant_fact_id === app.applicant_fact_id ? '#3b82f6' : 'transparent' }}
               >
                  <div className="queue-name" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>{app.applicant?.first_name} {app.applicant?.last_name}</div>
                  <div className="queue-time" style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Clock size={12}/> {app.schedule?.interview_time}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* MAIN PROFILE */}
      <div className="interview-profile-container" style={{ width: '100%' }}>
        {currentInterviewee ? (
          <>
            <div className="profile-header-card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div className="header-flex" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div className="avatar-placeholder" style={{ width: '64px', height: '64px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#0284c7' }}>
                  {currentInterviewee.applicant?.first_name[0]}
                </div>
                <div className="header-info">
                  <h1 style={{ margin: '0', fontSize: '1.5rem', color: '#0f172a' }}>{currentInterviewee.applicant?.first_name} {currentInterviewee.applicant?.last_name}</h1>
                  <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                    <Briefcase size={14}/> <span>{currentInterviewee.jobpostings?.job_title}</span>
                    <span className="dot">•</span>
                    <span>Date Applied: {new Date(currentInterviewee.applied_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                  <button className="btn-reject" onClick={() => handleDecision('Rejected')} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca', color: '#dc2626', background: '#fef2f2', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    <X size={18} /> Reject
                  </button>
                  <button className="btn-approve" onClick={() => handleDecision('Hired')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    <Check size={18} /> Hire
                  </button>
                </div>
              </div>

              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                <div className="info-item">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}><Mail size={14} /> Email</label>
                  <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>{currentInterviewee.applicant?.email}</p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}><Phone size={14} /> Contact</label>
                  <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>{currentInterviewee.applicant?.contact_number || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}><Calendar size={14} /> Scheduled For</label>
                  <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>{currentInterviewee.schedule?.interview_schedule} @ {currentInterviewee.schedule?.interview_time}</p>
                </div>
              </div>
            </div>

            <div className="resume-section" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Resume / CV</h3>
                {currentInterviewee.applicant?.resume_url && (
                  <a href={currentInterviewee.applicant.resume_url} target="_blank" rel="noreferrer" className="btn-download" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}>
                    <Download size={16} /> Open PDF
                  </a>
                )}
              </div>
              <div className="resume-viewer-mock" style={{ background: '#f1f5f9', borderRadius: '8px', padding: '40px', display: 'flex', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                  <div className="resume-page" style={{ background: 'white', width: '100%', maxWidth: '600px', minHeight: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '40px' }}>
                    <div className="resume-line title" style={{ height: '20px', width: '60%', marginBottom: '30px', background: '#e2e8f0', borderRadius: '2px' }}></div>
                    <div className="resume-line" style={{ height: '10px', background: '#f1f5f9', marginBottom: '12px', borderRadius: '2px' }}></div>
                    <div className="resume-line short" style={{ height: '10px', background: '#f1f5f9', marginBottom: '12px', borderRadius: '2px', width: '40%' }}></div>
                    <div className="resume-block" style={{ height: '100px', background: '#f8fafc', margin: '20px 0', borderRadius: '4px', border: '1px solid #f1f5f9' }}></div>
                    <div className="resume-line" style={{ height: '10px', background: '#f1f5f9', marginBottom: '12px', borderRadius: '2px' }}></div>
                  </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#718096', background: 'white', borderRadius: '12px' }}>
            <p>No scheduled interviews found.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="schedules-page" style={{ fontFamily: "'Inter', sans-serif", color: '#1e293b', height: '100%' }}>
      <nav className="tab-nav" style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button 
          className={`tab-btn ${activeTab === 'Set Schedule' ? 'active' : ''}`} 
          onClick={() => setActiveTab('Set Schedule')}
          style={{ background: 'none', border: 'none', padding: '12px 4px', fontSize: '0.95rem', fontWeight: '600', color: activeTab === 'Set Schedule' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', position: 'relative' }}
        >
          Set Schedule
          {activeTab === 'Set Schedule' && <div style={{ position: 'absolute', bottom: '-1px', left: '0', right: '0', height: '2px', background: '#3b82f6' }} />}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'Interview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('Interview')}
          style={{ background: 'none', border: 'none', padding: '12px 4px', fontSize: '0.95rem', fontWeight: '600', color: activeTab === 'Interview' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', position: 'relative' }}
        >
          Interview ({scheduledApplicants.length})
          {activeTab === 'Interview' && <div style={{ position: 'absolute', bottom: '-1px', left: '0', right: '0', height: '2px', background: '#3b82f6' }} />}
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'Set Schedule' ? <SetScheduleView /> : <InterviewView />}
      </div>
    </div>
  );
};

export default Schedules;