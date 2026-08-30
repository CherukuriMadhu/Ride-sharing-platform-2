import React from 'react';
import './SkeletonLoader.css'; // We'll assume the CSS is injected into index.css or created separately

const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`skeleton-card ${className}`}>
                        <div className="skeleton skeleton-title"></div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                    </div>
                );
            case 'table-row':
                return (
                    <div className={`skeleton-table-row ${className}`}>
                        <div className="skeleton skeleton-cell w-25"></div>
                        <div className="skeleton skeleton-cell w-25"></div>
                        <div className="skeleton skeleton-cell w-25"></div>
                        <div className="skeleton skeleton-cell w-25"></div>
                    </div>
                );
            case 'metric':
                return (
                    <div className={`skeleton-metric ${className}`}>
                        <div className="skeleton skeleton-sm-text mb-2"></div>
                        <div className="skeleton skeleton-lg-text"></div>
                    </div>
                );
            case 'chart':
                return (
                    <div className={`skeleton-chart ${className}`}>
                        <div className="skeleton skeleton-title mb-3"></div>
                        <div className="skeleton skeleton-box h-100"></div>
                    </div>
                );
            default:
                return <div className={`skeleton skeleton-text ${className}`}></div>;
        }
    };

    return (
        <React.Fragment>
            {Array(count).fill(0).map((_, i) => (
                <div key={i} className="skeleton-wrapper mb-3">
                    {renderSkeleton()}
                </div>
            ))}
        </React.Fragment>
    );
};

export default SkeletonLoader;
