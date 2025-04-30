import React, { useState } from 'react';

const PracticeModule = ({ practice }) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleStepCompletion = (stepId) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepId)) {
      newCompletedSteps.delete(stepId);
    } else {
      newCompletedSteps.add(stepId);
    }
    setCompletedSteps(newCompletedSteps);
  };

  const handlePlayAudio = (audioUrl) => {
    if (currentAudio) {
      currentAudio.pause();
      if (currentAudio.src === audioUrl && isPlaying) {
        setIsPlaying(false);
        return;
      }
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="lesson-card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{practice.title}</h2>
          <p className="text-gray-600 mb-6">{practice.description}</p>

          <div className="space-y-6">
            {practice.steps.map((step, index) => (
              <div
                key={step.id}
                className={`practice-step ${
                  completedSteps.has(step.id) ? 'practice-step-completed' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{step.instructions}</p>

                    {step.audioExample && (
                      <div className="flex items-center space-x-3 mb-4">
                        <button
                          onClick={() => handlePlayAudio(step.audioExample)}
                          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
                        >
                          {currentAudio?.src === step.audioExample && isPlaying ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span>Listen to Example</span>
                        </button>
                      </div>
                    )}

                    {step.tips && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-yellow-800">
                              Pro Tip
                            </h4>
                            <p className="mt-2 text-sm text-yellow-700">
                              {step.tips}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className={`flex items-center space-x-2 text-sm font-medium ${
                          completedSteps.has(step.id)
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-500 hover:text-gray-600'
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 ${
                            completedSteps.has(step.id) ? 'text-green-500' : 'text-gray-400'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {completedSteps.has(step.id) ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          )}
                        </svg>
                        <span>
                          {completedSteps.has(step.id) ? 'Completed' : 'Mark as Complete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Practice Summary
              </h3>
              <p className="text-gray-600 mb-4">
                You've completed {completedSteps.size} out of {practice.steps.length} steps
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(completedSteps.size / practice.steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeModule;
