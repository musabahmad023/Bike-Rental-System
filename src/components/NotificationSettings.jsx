import React, { useState } from 'react';

const NotificationSettings = ({ initialSettings, onSave }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [showPreview, setShowPreview] = useState(null);

  const updateSetting = (category, type, enabled) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: enabled
      }
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const emailTemplates = {
    enrollment: {
      title: 'Welcome to Your New Course!',
      content: `Dear {studentName},

We're excited to have you enrolled in {courseName}! Your journey to becoming a better vocalist starts now.

Your course details:
- Course: {courseName}
- Instructor: {instructorName}
- Start Date: {startDate}

Get started by accessing your first lesson through your dashboard.

Best regards,
The VocalMaster Team`
    },
    feedback: {
      title: 'New Feedback Available',
      content: `Dear {studentName},

Your instructor has provided feedback on your recent recording in {courseName}.

Highlights:
- Overall Rating: {rating}/5
- Key Points: {keyPoints}

Log in to your dashboard to view the detailed feedback and continue your progress.

Best regards,
The VocalMaster Team`
    },
    certificate: {
      title: 'Congratulations on Your Achievement!',
      content: `Dear {studentName},

Congratulations on completing {courseName}! Your dedication and hard work have paid off.

Your certificate of completion is now available in your dashboard. You can:
- Download it as a PDF
- Share it on social media
- Add it to your professional profiles

We hope this achievement marks another step in your musical journey.

Best regards,
The VocalMaster Team`
    }
  };

  const renderEmailPreview = (type) => {
    const template = emailTemplates[type];
    return (
      <div className="email-template">
        <div className="email-header">
          <h3 className="text-xl font-bold">{template.title}</h3>
        </div>
        <div className="email-body">
          <pre className="whitespace-pre-wrap font-sans">{template.content}</pre>
        </div>
        <div className="email-footer">
          <p>© 2025 VocalMaster. All rights reserved.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>
      
      <div className="settings-card">
        <div className="settings-section">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Enrollment Confirmation</p>
                <p className="text-sm text-gray-500">Receive a welcome email when you enroll in a new course</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                  onClick={() => setShowPreview(showPreview === 'enrollment' ? null : 'enrollment')}
                >
                  Preview
                </button>
                <label className="settings-toggle">
                  <div className={`settings-toggle-track ${settings.email.enrollment ? 'settings-toggle-track-active' : ''}`}>
                    <div className={`settings-toggle-thumb ${settings.email.enrollment ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.email.enrollment}
                    onChange={(e) => updateSetting('email', 'enrollment', e.target.checked)}
                  />
                </label>
              </div>
            </div>

            {showPreview === 'enrollment' && (
              <div className="email-preview">
                {renderEmailPreview('enrollment')}
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Instructor Feedback</p>
                <p className="text-sm text-gray-500">Get notified when an instructor provides feedback on your recordings</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                  onClick={() => setShowPreview(showPreview === 'feedback' ? null : 'feedback')}
                >
                  Preview
                </button>
                <label className="settings-toggle">
                  <div className={`settings-toggle-track ${settings.email.feedback ? 'settings-toggle-track-active' : ''}`}>
                    <div className={`settings-toggle-thumb ${settings.email.feedback ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.email.feedback}
                    onChange={(e) => updateSetting('email', 'feedback', e.target.checked)}
                  />
                </label>
              </div>
            </div>

            {showPreview === 'feedback' && (
              <div className="email-preview">
                {renderEmailPreview('feedback')}
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Achievement Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Certificate Issuance</p>
                <p className="text-sm text-gray-500">Receive an email when you earn a course completion certificate</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                  onClick={() => setShowPreview(showPreview === 'certificate' ? null : 'certificate')}
                >
                  Preview
                </button>
                <label className="settings-toggle">
                  <div className={`settings-toggle-track ${settings.email.certificate ? 'settings-toggle-track-active' : ''}`}>
                    <div className={`settings-toggle-thumb ${settings.email.certificate ? 'settings-toggle-thumb-active' : 'settings-toggle-thumb-inactive'}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.email.certificate}
                    onChange={(e) => updateSetting('email', 'certificate', e.target.checked)}
                  />
                </label>
              </div>
            </div>

            {showPreview === 'certificate' && (
              <div className="email-preview">
                {renderEmailPreview('certificate')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="certificate-button"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
