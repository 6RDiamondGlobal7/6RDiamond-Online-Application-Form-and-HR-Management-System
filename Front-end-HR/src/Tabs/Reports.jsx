import React from 'react';
import './Reports.css';

const Reports = () => {
  return (
    <div className="reports-container">
      {/* Page Header */}
      <div className="reports-header-section">
        <div className="header-with-icon">
          <div className="title-icon-box">📊</div>
          <div className="title-text">
            <h2>Reports & Analytics</h2>
            <p>Track recruitment performance and key metrics</p>
          </div>
        </div>
      </div>

      {/* Report Configuration Card */}
      <div className="config-card">
        <div className="card-header-row">
          <span className="calendar-icon">📅</span>
          <h3>Report Configuration</h3>
        </div>
        <div className="config-form">
          <div className="config-group">
            <label>Report Type</label>
            <select className="config-select">
              <option>Monthly Report</option>
              <option>Quarterly Report</option>
              <option>Annual Report</option>
            </select>
          </div>
          <div className="config-group">
            <label>Month</label>
            <select className="config-select">
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
          </div>
          <div className="config-group">
            <label>Year</label>
            <select className="config-select">
              <option>2024</option>
              <option value="2025" selected>2025</option>
              <option>2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Report Dashboard */}
      <div className="report-dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <h3>Monthly Recruitment Report</h3>
            <p>📅 Summary for January 2025</p>
          </div>
          <button className="export-pdf-btn">📥 Export PDF</button>
        </div>

        {/* Top Metric Cards */}
        <div className="metrics-row">
          <div className="metric-card light-blue">
            <div className="metric-icon">📄</div>
            <p>Total Applications</p>
            <h4>19</h4>
          </div>
          <div className="metric-card soft-blue">
            <div className="metric-icon">📋</div>
            <p>New Applications</p>
            <h4>2</h4>
          </div>
          <div className="metric-card soft-green">
            <div className="metric-icon">✅</div>
            <p>Hired</p>
            <h4>1</h4>
          </div>
          <div className="metric-card soft-red">
            <div className="metric-icon">🚫</div>
            <p>Rejected</p>
            <h4>1</h4>
          </div>
        </div>

        {/* Hiring Success Section */}
        <div className="success-rate-section">
          <div className="success-main-display">
            <div className="trend-icon">📈</div>
            <p className="success-label">Hiring Success Rate</p>
            <h2 className="success-percentage">5%</h2>
            <p className="success-subtext">1 hired out of 19 total applications</p>
          </div>
          
          <div className="rate-breakdown-grid">
            <div className="rate-mini-card">
              <p>Interview Rate</p>
              <h5>84%</h5>
              <span>16 reached interview</span>
            </div>
            <div className="rate-mini-card">
              <p>Hiring Rate</p>
              <h5>5%</h5>
              <span>1 successfully hired</span>
            </div>
            <div className="rate-mini-card">
              <p>Rejection Rate</p>
              <h5>5%</h5>
              <span>1 rejected</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown Section */}
        <div className="status-breakdown-wrapper">
          <h3 className="section-title-bar">Application Status Breakdown</h3>
          <div className="status-grid">
            <div className="status-pill-item blue-pill">
              <div className="pill-dot"></div>
              <span>Applied</span>
              <strong>2</strong>
            </div>
            <div className="status-pill-item purple-pill">
              <div className="pill-dot"></div>
              <span>Interview</span>
              <strong>7</strong>
            </div>
            <div className="status-pill-item green-pill">
              <div className="pill-dot"></div>
              <span>Hired</span>
              <strong>1</strong>
            </div>
            <div className="status-pill-item red-pill">
              <div className="pill-dot"></div>
              <span>Rejected</span>
              <strong>1</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;