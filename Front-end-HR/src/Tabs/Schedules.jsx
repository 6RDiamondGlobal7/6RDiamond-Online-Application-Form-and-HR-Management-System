import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, Clock, MapPin, Mail, Phone, User, Check, X, Download, Calendar, Briefcase
} from 'lucide-react';
import './Schedules.css'; // Make sure your CSS is saved here

const Schedules = () => {
  const [activeTab, setActiveTab] = useState('Set Schedule');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [pendingApplicants, setPendingApplicants] = useState([]); // For "Set Schedule"
  const [scheduledApplicants, setScheduledApplicants] = useState([]); // For "Interview"
  const [currentInterviewee, setCurrentInterviewee] = useState(null); // Currently viewing in Interview tab

  // Form States
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleForm, setScheduleForm] = useState({
    location: 'Burke Building, Binondo, Manila',
    room: '210',
    date: '',
    time: ''
  });

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    
    // A. Fetch Candidates ready for Scheduling (Status: Interview, Schedule: NULL)
    const { data: pendingData } = await supabase
      .from('applicantfacttable')
      .select(`*, applicant:applicant_id(*), jobpostings:job_id(job_title)`)
      .eq('status', 'Interview') // Only those passed initial screening
      .is('schedule_id', null);  // Not yet scheduled

    // B. Fetch Candidates ready for Interviewing (Status: Interview, Schedule: NOT NULL)
    const { data: interviewData } = await supabase
      .from('applicantfacttable')
      .select(`
        *, 
        applicant:applicant_id(*), 
        jobpostings:job_id(job_title),
        schedule:schedule_id(*)
      `)
      .not('schedule_id', 'is', null)
      .eq('status', 'Interview'); // Only active interviews

    if (pendingData) setPendingApplicants(pendingData);
    if (interviewData) {
      setScheduledApplicants(interviewData);
      // Auto-select first person if none selected
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
    if (selectedIds.length === pendingApplicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingApplicants.map(app => app.applicant_fact_id));
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
            room_number: scheduleForm.room,
            reminders: scheduleForm.location
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
    fetchData(); // Refresh lists
  };

  // --- 4. HANDLE APPROVE / REJECT ---
  const handleDecision = async (status) => {
    if (!currentInterviewee) return;
    const confirmMsg = status === 'Hired' ? "Hire this candidate?" : "Reject this candidate?";
    if (!window.confirm(confirmMsg)) return;

    await supabase
      .from('applicantfacttable')
      .update({ status: status }) // 'Hired' or 'Rejected'
      .eq('applicant_fact_id', currentInterviewee.applicant_fact_id);

    alert(`Candidate marked as ${status}`);
    setCurrentInterviewee(null);
    fetchData(); // Refresh to remove them from list
  };

  // --- FILTERING ---
  const filteredPending = pendingApplicants.filter(app => 
    `${app.applicant?.first_name} ${app.applicant?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- VIEW COMPONENTS ---

  const SetScheduleView = () => (
    <div className="set-schedule-grid">
      {/* LEFT: LIST */}
      <div className="schedule-card">
        <div className="card-header-flex">
          <h3>Select Applicants ({filteredPending.length})</h3>
          <button className="text-link" onClick={toggleSelectAll}>
            {selectedIds.length === pendingApplicants.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="search-input-box"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="applicant-selection-list">
          {filteredPending.length === 0 ? (
             <p className="no-data-msg">No candidates waiting for schedule.</p>
          ) : (
            filteredPending.map((app) => (
              <div key={app.applicant_fact_id} className={`selection-row ${selectedIds.includes(app.applicant_fact_id) ? 'selected' : ''}`}>
                <div className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    className="custom-checkbox" 
                    checked={selectedIds.includes(app.applicant_fact_id)}
                    onChange={() => toggleSelection(app.applicant_fact_id)}
                  />
                </div>
                <div className="selection-details">
                  <div className="selection-top">
                    <span className="selection-name">
                      {app.applicant?.first_name} {app.applicant?.last_name}
                    </span>
                    <span className="role-pill">{app.jobpostings?.job_title}</span>
                  </div>
                  <div className="selection-bottom">
                    <span>{app.applicant?.email}</span>
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
          <h3>Assign Details</h3>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            className="form-input"
            value={scheduleForm.date}
            onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Time</label>
          <input 
            type="time" 
            className="form-input"
            value={scheduleForm.time}
            onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Location / Branch</label>
          <input 
            type="text" 
            className="form-input" 
            value={scheduleForm.location}
            onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Room Number</label>
          <input 
            type="text" 
            className="form-input" 
            value={scheduleForm.room}
            onChange={(e) => setScheduleForm({...scheduleForm, room: e.target.value})}
          />
        </div>

        <div className="empty-preview-state">
           {selectedIds.length > 0 ? (
             <div className="summary-preview">
                <Clock size={32} color="#5d9cec" />
                <p>Scheduling <strong>{selectedIds.length}</strong> applicant(s)</p>
             </div>
           ) : (
             <>
               <div className="empty-icon-circle"><User size={40} /></div>
               <p>Select applicants to start</p>
             </>
           )}
        </div>

        <button className="btn-save-schedule" onClick={handleSaveSchedule} disabled={loading}>
          {loading ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );

  const InterviewView = () => (
    <div className="interview-layout">
      {/* SIDEBAR QUEUE (Added so you can switch users) */}
      <div className="interview-sidebar">
         <h3>Queue ({scheduledApplicants.length})</h3>
         <div className="queue-list">
            {scheduledApplicants.map(app => (
               <div 
                 key={app.applicant_fact_id} 
                 className={`queue-item ${currentInterviewee?.applicant_fact_id === app.applicant_fact_id ? 'active' : ''}`}
                 onClick={() => setCurrentInterviewee(app)}
               >
                  <div className="queue-name">{app.applicant?.first_name} {app.applicant?.last_name}</div>
                  <div className="queue-time">
                    <Clock size={12}/> {app.schedule?.interview_time}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* MAIN PROFILE */}
      <div className="interview-profile-container">
        {currentInterviewee ? (
          <>
            <div className="profile-header-card">
              <div className="header-flex">
                <div className="avatar-placeholder">
                  {currentInterviewee.applicant?.first_name[0]}
                </div>
                <div className="header-info">
                  <h1>{currentInterviewee.applicant?.first_name} {currentInterviewee.applicant?.last_name}</h1>
                  <div className="header-meta">
                    <Briefcase size={14}/> <span>{currentInterviewee.jobpostings?.job_title}</span>
                    <span className="dot">•</span>
                    <span>Date Applied: {new Date(currentInterviewee.applied_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="btn-reject" onClick={() => handleDecision('Rejected')}>
                    <X size={18} /> Reject
                  </button>
                  <button className="btn-approve" onClick={() => handleDecision('Hired')}>
                    <Check size={18} /> Hire
                  </button>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label><Mail size={14} /> Email</label>
                  <p>{currentInterviewee.applicant?.email}</p>
                </div>
                <div className="info-item">
                  <label><Phone size={14} /> Contact</label>
                  <p>{currentInterviewee.applicant?.contact_number || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label><Calendar size={14} /> Scheduled For</label>
                  <p>{currentInterviewee.schedule?.interview_schedule} @ {currentInterviewee.schedule?.interview_time}</p>
                </div>
              </div>
            </div>

            <div className="resume-section">
              <div className="section-title">
                <h3>Resume / CV</h3>
                {currentInterviewee.applicant?.resume_url && (
                  <a href={currentInterviewee.applicant.resume_url} target="_blank" rel="noreferrer" className="btn-download">
                    <Download size={16} /> Open PDF
                  </a>
                )}
              </div>
              <div className="resume-viewer-mock">
                  {/* Mock resume view */}
                  <div className="resume-page">
                    <div className="resume-line title"></div>
                    <div className="resume-line"></div>
                    <div className="resume-line short"></div>
                    <div className="resume-block"></div>
                    <div className="resume-line"></div>
                  </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>No scheduled interviews found.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="schedules-page">
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
          Interview ({scheduledApplicants.length})
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'Set Schedule' ? <SetScheduleView /> : <InterviewView />}
      </div>
    </div>
  );
};

export default Schedules;