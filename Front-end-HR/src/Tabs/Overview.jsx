import React from 'react';
import './Overview.css';

const Overview = () => {
  return (
    <div className="overview-content">
      <div className="tab-title-area">
        <div className="title-icon">⊞</div>
        <h2>Dashboard Overview</h2>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="stats-container">
        <div className="stat-card border-blue">
          <div className="stat-info">
            <p>Total Applicants</p>
            <h3>6</h3>
          </div>
          <div className="stat-icon blue-bg">👥</div>
        </div>
        <div className="stat-card border-orange">
          <div className="stat-info">
            <p>Pending Approval</p>
            <h3>2</h3>
          </div>
          <div className="stat-icon orange-bg">🕒</div>
        </div>
        <div className="stat-card border-purple">
          <div className="stat-info">
            <p>For Interview</p>
            <h3>2</h3>
          </div>
          <div className="stat-icon purple-bg">📋</div>
        </div>
        <div className="stat-card border-green">
          <div className="stat-info">
            <p>Hired Applicants</p>
            <h3>1</h3>
          </div>
          <div className="stat-icon green-bg">👤</div>
        </div>
      </div>

      {/* Main Grid: Chart and Lists */}
      <div className="data-grid">
        <div className="chart-section card">
          <h4>Applicant Status Distribution</h4>
          <div className="dummy-chart-container">
            <div className="pie-placeholder">
              {/* This represents your pie chart visually */}
              <div className="pie-segment blue"></div>
              <div className="pie-segment orange"></div>
              <div className="pie-segment green"></div>
              <div className="pie-segment red"></div>
            </div>
            <div className="chart-legend">
              <span><i className="dot blue"></i> Applied (2)</span>
              <span><i className="dot orange"></i> Interview (2)</span>
              <span><i className="dot green"></i> Hired (1)</span>
              <span><i className="dot red"></i> Rejected (1)</span>
            </div>
          </div>
        </div>

        <div className="lists-section">
          <div className="list-card card">
            <div className="list-header">
              <h4>Upcoming Interviews</h4>
              <span className="icon">📅</span>
            </div>
            <div className="list-item-box blue-fade">
              <p className="date">January 27, 2025</p>
              <p className="subtext">2 applicants scheduled</p>
            </div>
          </div>

          <div className="list-card card">
            <div className="list-header">
              <h4>Recent Applications</h4>
              <span className="icon">📄</span>
            </div>
            <div className="application-item">
              <p className="name">Juan Dela Cruz</p>
              <p className="date">01-15-2025</p>
            </div>
            <div className="application-item">
              <p className="name">Maria Santos</p>
              <p className="date">01-14-2025</p>
            </div>
            <div className="view-all">View All</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;