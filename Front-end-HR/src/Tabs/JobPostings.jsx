import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjusted path based on your folder structure
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';
import './JobPostings.css'; 

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('All');

  // 1. Fetch ALL Jobs (Open and Closed)
  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobpostings')
      .select('*')
      .order('job_id', { ascending: true });

    if (error) console.error('Error fetching jobs:', error);
    else setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 2. The Toggle Logic
  const toggleJobStatus = async (job_id, currentStatus) => {
    // Optimistic Update (Update UI immediately)
    const updatedJobs = jobs.map((job) => 
      job.job_id === job_id ? { ...job, job_status: !currentStatus } : job
    );
    setJobs(updatedJobs);

    // Update Database
    const { error } = await supabase
      .from('jobpostings')
      .update({ job_status: !currentStatus }) // Flip boolean
      .eq('job_id', job_id);

    if (error) {
      console.error('Error updating status:', error);
      fetchJobs(); // Revert if error
    }
  };

  // Filter Logic
  const filteredJobs = selectedBranch === 'All' 
    ? jobs 
    : jobs.filter(job => job.branch === selectedBranch);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Manage Job Postings</h2>
        <div className="controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search role..." />
          </div>
          <div className="filter-box">
            <Filter size={18} />
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="All">All Branches</option>
              <option value="Manila">Manila</option>
              <option value="Cebu">Cebu</option>
              <option value="Davao">Davao</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div className="table-container">
          <table className="job-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Job Title</th>
                <th>Branch</th>
                <th>Department</th>
                <th>Applicants</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.job_id} className={job.job_status ? 'row-active' : 'row-inactive'}>
                  <td>
                    <span className={`status-badge ${job.job_status ? 'open' : 'closed'}`}>
                      {job.job_status ? 'OPEN' : 'CLOSED'}
                    </span>
                  </td>
                  <td className="job-title-cell">
                    <Briefcase size={16} /> {job.job_title}
                  </td>
                  <td>
                    <MapPin size={16} /> {job.branch}
                  </td>
                  <td>{job.department}</td>
                  <td>{job.total_applicants}</td>
                  <td>
                    {/* THE SWITCH */}
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={job.job_status} 
                        onChange={() => toggleJobStatus(job.job_id, job.job_status)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobPostings;