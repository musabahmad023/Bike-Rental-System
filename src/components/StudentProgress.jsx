import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const StudentProgress = ({ feedbackHistory }) => {
  // Calculate average metrics over time
  const progressData = feedbackHistory.map(feedback => ({
    date: new Date(feedback.timestamp).toLocaleDateString(),
    rating: feedback.rating,
    pitchAccuracy: feedback.metrics.pitchAccuracy,
    rhythm: feedback.metrics.rhythm,
    breathing: feedback.metrics.breathing,
    expression: feedback.metrics.expression,
  }));

  // Calculate current vs previous performance
  const currentMetrics = progressData[progressData.length - 1];
  const previousMetrics = progressData[progressData.length - 2];

  const getPerformanceIndicator = (current, previous) => {
    if (!previous) return 'steady';
    const difference = current - previous;
    if (difference > 5) return 'improved';
    if (difference < -5) return 'needs-work';
    return 'steady';
  };

  const getPerformanceText = (indicator) => {
    switch (indicator) {
      case 'improved':
        return 'Improving';
      case 'needs-work':
        return 'Needs Work';
      default:
        return 'Steady';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(currentMetrics || {}).map(([metric, value]) => {
            if (metric === 'date') return null;
            const indicator = getPerformanceIndicator(
              value,
              previousMetrics?.[metric]
            );
            return (
              <div key={metric} className="metric-card">
                <h3 className="text-sm font-medium text-gray-500 capitalize">
                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="mt-2 flex items-baseline justify-between">
                  <p className="text-2xl font-semibold text-gray-900">
                    {typeof value === 'number' ? `${value}%` : value}
                  </p>
                  <span className={`performance-indicator indicator-${indicator}`}>
                    {getPerformanceText(indicator)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Chart */}
        <div className="lg:col-span-2">
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="pitchAccuracy"
                    stroke="#8884d8"
                    name="Pitch Accuracy"
                  />
                  <Line
                    type="monotone"
                    dataKey="rhythm"
                    stroke="#82ca9d"
                    name="Rhythm"
                  />
                  <Line
                    type="monotone"
                    dataKey="breathing"
                    stroke="#ffc658"
                    name="Breathing"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Skills Radar */}
        <div className="lg:col-span-1">
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[currentMetrics]}>
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="name"
                    tickFormatter={(value) => value.replace(/([A-Z])/g, ' $1').trim()}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Feedback Timeline */}
        <div className="lg:col-span-3">
          <div className="feedback-card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-6">
              {feedbackHistory.slice(-3).reverse().map((feedback, index) => (
                <div key={index} className="timeline-item">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Feedback from {new Date(feedback.timestamp).toLocaleDateString()}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{feedback.comments}</p>
                      </div>
                      {feedback.timestampedComments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {feedback.timestampedComments.map((tc, tcIndex) => (
                            <div key={tcIndex} className="text-sm text-gray-500">
                              <span className="font-medium">{tc.displayTime}:</span> {tc.comment}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
