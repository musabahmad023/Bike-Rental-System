import React, { useState, useRef } from 'react';

const InstructorFeedback = ({ recording, onSubmitFeedback }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [timestampedComments, setTimestampedComments] = useState([]);
  const [metrics, setMetrics] = useState({
    pitchAccuracy: 0,
    rhythm: 0,
    breathing: 0,
    expression: 0
  });
  const audioRef = useRef(null);

  const handleTimeStampComment = () => {
    const currentTime = audioRef.current?.currentTime || 0;
    const formattedTime = new Date(currentTime * 1000).toISOString().substr(14, 5);
    
    setTimestampedComments([
      ...timestampedComments,
      {
        id: Date.now(),
        time: currentTime,
        displayTime: formattedTime,
        comment: '',
        isEditing: true
      }
    ]);
  };

  const updateTimestampedComment = (id, comment) => {
    setTimestampedComments(
      timestampedComments.map(tc =>
        tc.id === id ? { ...tc, comment, isEditing: false } : tc
      )
    );
  };

  const deleteTimestampedComment = (id) => {
    setTimestampedComments(timestampedComments.filter(tc => tc.id !== id));
  };

  const handleMetricChange = (metric, value) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: value
    }));
  };

  const handleSubmit = () => {
    onSubmitFeedback({
      rating,
      comments,
      timestampedComments: timestampedComments.filter(tc => tc.comment),
      metrics,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="feedback-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Provide Feedback</h2>

        {/* Audio Player */}
        <div className="mb-8">
          <audio
            ref={audioRef}
            src={recording.url}
            controls
            className="w-full"
          />
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <svg
                  className={`rating-star ${
                    star <= rating ? 'rating-star-active' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(metrics).map(([metric, value]) => (
            <div key={metric} className="feedback-metric">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {metric.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleMetricChange(metric, parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-600 w-8">{value}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* General Comments */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            General Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Provide overall feedback about the performance..."
          />
        </div>

        {/* Timestamped Comments */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Timestamped Comments
            </label>
            <button
              onClick={handleTimeStampComment}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Add Timestamp
            </button>
          </div>
          
          <div className="space-y-4">
            {timestampedComments.map((tc) => (
              <div key={tc.id} className="timestamp-comment group">
                <span className="absolute left-2 top-2 text-sm font-medium text-gray-500">
                  {tc.displayTime}
                </span>
                {tc.isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add your comment..."
                      autoFocus
                      onBlur={(e) => updateTimestampedComment(tc.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateTimestampedComment(tc.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700">{tc.comment}</p>
                    <button
                      onClick={() => deleteTimestampedComment(tc.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorFeedback;
