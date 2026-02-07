import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { ChevronLeft, ChevronRight, Eye, Download, ChevronDown } from 'lucide-react';

const Applicants = () => {
  // 1. STATE: Store real data here
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- 2. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        // Calls the new route we created
        const response = await axios.get('http://localhost:5000/api/applicants');
        setApplicants(response.data);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      }
      setLoading(false);
    };

    fetchApplicants();
  }, []);

  // --- 3. DYNAMIC FILTERS ---
  const positions = ['All Positions', ...new Set(applicants.map(item => item.position))];
  const branches = ['All Branches', ...new Set(applicants.map(item => item.branch))];

  // --- 4. FILTERING LOGIC ---
  const filteredData = applicants.filter(app => {
    const matchesStatus = statusFilter === 'All' || app.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPosition = positionFilter === 'All Positions' || app.position === positionFilter;
    const matchesBranch = branchFilter === 'All Branches' || app.branch === branchFilter;
    const matchesSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        app.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPosition && matchesBranch && matchesSearch;
  });

  // --- 5. PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const updateStatus = (val) => { setStatusFilter(val); setCurrentPage(1); };

  return (
    <div className="applicants-container">
      {/* CSS STYLES */}
      <style>{`
        .applicants-container { display: flex; flex-direction: column; gap: 20px; font-family: 'Inter', sans-serif; }
        .tab-title-area { display: flex; align-items: center; gap: 12px; margin-bottom: 5px; }
        .title-icon { font-size: 1.5rem; }
        .tab-title-area h2 { font-size: 1.4rem; color: #2d3748; margin: 0; }
        
        .sub-tabs { background: white; padding: 10px; border-radius: 10px; display: flex; gap: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
        .sub-tab-btn { padding: 8px 20px; border: none; background: none; cursor: pointer; border-radius: 6px; font-weight: 500; color: #718096; transition: all 0.2s; }
        .sub-tab-btn.active { background: #5d9cec; color: white; }
        
        .table-controls { display: flex; gap: 15px; margin-top: 10px; align-items: center; }
        .search-input { flex: 2; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: #5d9cec; }
        
        .select-wrapper { position: relative; flex: 1; }
        .filter-select { width: 100%; padding: 12px 16px; padding-right: 40px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; color: #4a5568; font-size: 0.9rem; appearance: none; outline: none; }
        .filter-select:focus { border-color: #5d9cec; }
        .select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #a0aec0; pointer-events: none; }
        
        .table-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.03); display: flex; flex-direction: column; min-height: 400px; }
        .applicants-table { width: 100%; border-collapse: collapse; text-align: left; }
        .applicants-table th { background: #f8fafc; padding: 15px; font-size: 0.85rem; color: #5d9cec; border-bottom: 1px solid #e0e6ed; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .applicants-table td { padding: 15px; border-bottom: 1px solid #f0f2f5; font-size: 0.9rem; vertical-align: middle; }
        
        .bold { font-weight: 600; color: #2d3748; }
        .contact-info { font-size: 0.75rem; color: #718096; margin-bottom: 2px; }
        
        .status-pill { padding: 4px 12px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .status-pill.applied, .status-pill.pending { background: #eef5ff; color: #5d9cec; }
        .status-pill.interview { background: #f5f3ff; color: #a29bfe; }
        .status-pill.hired { background: #ebfbf2; color: #2ecc71; }
        .status-pill.rejected { background: #fff1f0; color: #e74c3c; }
        
        .action-icon { background: none; border: none; cursor: pointer; margin-right: 8px; color: #94a3b8; transition: color 0.2s; }
        .action-icon:hover { color: #5d9cec; }
        
        .pagination-container { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; background: white; border-top: 1px solid #f0f2f5; margin-top: auto; }
        .pagination-info { font-size: 0.85rem; color: #718096; }
        .pagination-controls { display: flex; align-items: center; gap: 8px; }
        .page-nav-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; color: #718096; cursor: pointer; transition: all 0.2s; }
        .page-nav-btn.disabled { opacity: 0.5; cursor: not-allowed; background: #f8fafc; }
        .page-number { width: 32px; height: 32px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #718096; cursor: pointer; transition: all 0.2s; }
        .page-number.active { background: #5d9cec; border-color: #5d9cec; color: white; }
        
        .no-data { padding: 40px; text-align: center; color: #718096; font-style: italic; }
      `}</style>
      
      <div className="tab-title-area">
        <div className="title-icon">👥</div>
        <h2>Applicants</h2>
      </div>

      <div className="sub-tabs">
        {['All', 'Applied', 'Interview', 'Hired', 'Rejected'].map((tab) => {
          const count = applicants.filter(a => 
            tab === 'All' ? true : a.status.toLowerCase() === tab.toLowerCase()
          ).length;

          return (
            <button 
              key={tab}
              className={`sub-tab-btn ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => updateStatus(tab)}
            >
              {tab} {tab !== 'All' && `(${count})`}
            </button>
          );
        })}
      </div>

      <div className="table-controls">
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          className="search-input" 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
        />
        
        <div className="select-wrapper">
          <select 
            className="filter-select" 
            value={positionFilter} 
            onChange={(e) => { setPositionFilter(e.target.value); setCurrentPage(1); }}
          >
            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
          <ChevronDown className="select-icon" size={18} />
        </div>

        <div className="select-wrapper">
          <select 
            className="filter-select" 
            value={branchFilter} 
            onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
          >
            {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
          </select>
          <ChevronDown className="select-icon" size={18} />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="applicants-table">
          <thead>
            <tr>
              <th>Applicant #</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Position</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="no-data">Loading applicants...</td></tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((app) => (
                <tr key={app.id}>
                  <td className="bold">{app.id}</td>
                  <td className="bold">{app.name}</td>
                  <td>
                    <div className="contact-info">📧 {app.email}</div>
                    <div className="contact-info">📞 {app.phone}</div>
                  </td>
                  <td>{app.date}</td>
                  <td>
                    <span className={`status-pill ${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{app.position}</td>
                  <td>{app.branch}</td>
                  <td className="actions">
                    <button className="action-icon" title="View Details"><Eye size={18} /></button>
                    <button className="action-icon" title="Download Resume"><Download size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" className="no-data">No applicants found matching filters.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="pagination-controls">
            <button 
              className={`page-nav-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            
            {totalPages > 0 && [...Array(totalPages)].map((_, index) => (
              <button 
                key={index + 1}
                className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button 
              className={`page-nav-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applicants;