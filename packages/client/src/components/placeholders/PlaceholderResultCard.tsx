import React from 'react';

export const PlaceholderResultCard = () => {
  return (
    <div className="col placeholder-glow">
      <div className="card shadow-sm">
        <div className="d-flex align-items-center" style={{ minHeight: 420, maxHeight: 420, overflow: 'hidden' }}>
          <span className="placeholder" style={{ height: '420px', width: '100%' }}></span>
        </div>
        <div className="card-body">
          <p className="card-text placeholder placeholder-sm" style={{ minHeight: '48px', width: '100%' }}></p>
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group">
              <button type="button" className="btn btn-sm btn-outline-secondary">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
