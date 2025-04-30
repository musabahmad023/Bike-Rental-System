import { useState } from 'react';
import CourseCard from '../components/CourseCard';

const Dashboard = () => {
  const [courses] = useState([
    {
      id: 1,
      title: 'Vocal Fundamentals',
      description: 'Master the basics of vocal technique and breathing exercises. Learn proper posture, breath support, and vocal warm-ups.',
      lessonCount: 12,
      level: 'Beginner',
      duration: '6 weeks',
      enrolled: 45,
      completion: 85
    },
    {
      id: 2,
      title: 'Advanced Vocal Techniques',
      description: 'Take your singing to the next level with advanced vocal exercises. Focus on range extension, vocal agility, and style development.',
      lessonCount: 15,
      level: 'Advanced',
      duration: '8 weeks',
      enrolled: 32,
      completion: 92
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top spacing for fixed navbar */}
      <div className="h-16"></div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, Instructor!</h1>
                <p className="mt-2 text-gray-600">Here's what's happening with your courses today.</p>
              </div>
              <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Course
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Students */}
            <div className="bg-white overflow-hidden shadow-sm rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                      <dd className="text-lg font-semibold text-gray-900">125</dd>
                      <dd className="text-sm text-green-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        12% increase
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Courses */}
            <div className="bg-white overflow-hidden shadow-sm rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Courses</dt>
                      <dd className="text-lg font-semibold text-gray-900">8</dd>
                      <dd className="text-sm text-indigo-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        View all
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Lessons */}
            <div className="bg-white overflow-hidden shadow-sm rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Lessons</dt>
                      <dd className="text-lg font-semibold text-gray-900">96</dd>
                      <dd className="text-sm text-gray-600 mt-1">Last updated 2h ago</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white overflow-hidden shadow-sm rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg. Completion Rate</dt>
                      <dd className="text-lg font-semibold text-gray-900">88.5%</dd>
                      <dd className="text-sm text-green-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        3.2% increase
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="mt-8 px-4 sm:px-0">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Courses</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
