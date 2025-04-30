import React from 'react';

const ProgressTracker = ({ totalCourses, averageProgress }) => {
  return (
    <div>
      <div className="progress-bar mb-6">
        <div 
          className="progress-fill"
          style={{ width: `${averageProgress}%` }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Overall Progress</p>
          <p className="text-2xl font-bold text-indigo-600">{Math.round(averageProgress)}%</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Active Courses</p>
          <p className="text-2xl font-bold text-indigo-600">{totalCourses}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
