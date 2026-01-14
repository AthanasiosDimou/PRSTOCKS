// =============================================================================
// INSPECTION PAGE COMPONENT
// =============================================================================
// Component for handling inspection functionality

import React from 'react';
import './InspectionPage.css';

interface InspectionPageProps {
  onBackToMain?: () => void;
}

export const InspectionPage: React.FC<InspectionPageProps> = ({ onBackToMain }) => {
  return (
    <div className="inspection-page">
      <div className="inspection-header">
        <h1>Inspection Module</h1>
        <p>Quality control and inspection management for electrical stock items</p>
      </div>

      <div className="inspection-content">
        <div className="inspection-section">
          <h2>📋 Inspection Checklist</h2>
          <div className="checklist-container">
            <div className="checklist-item">
              <input type="checkbox" id="visual-check" />
              <label htmlFor="visual-check">Visual Inspection</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="resistance-check" />
              <label htmlFor="resistance-check">Resistance Testing</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="voltage-check" />
              <label htmlFor="voltage-check">Voltage Rating Verification</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="continuity-check" />
              <label htmlFor="continuity-check">Continuity Testing</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="insulation-check" />
              <label htmlFor="insulation-check">Insulation Testing</label>
            </div>
          </div>
        </div>

        <div className="inspection-section">
          <h2>📊 Inspection Results</h2>
          <div className="results-container">
            <div className="result-item">
              <span className="result-label">Last Inspection:</span>
              <span className="result-value">2024-01-15</span>
            </div>
            <div className="result-item">
              <span className="result-label">Items Inspected:</span>
              <span className="result-value">127</span>
            </div>
            <div className="result-item">
              <span className="result-label">Pass Rate:</span>
              <span className="result-value success">94.5%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Failures:</span>
              <span className="result-value warning">7</span>
            </div>
          </div>
        </div>

        <div className="inspection-section">
          <h2>🔧 Quick Actions</h2>
          <div className="actions-container">
            <button className="action-button primary">
              Start New Inspection
            </button>
            <button className="action-button secondary">
              View Reports
            </button>
            <button className="action-button secondary">
              Export Results
            </button>
            {onBackToMain && (
              <button className="action-button tertiary" onClick={onBackToMain}>
                Back to Main
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionPage;
