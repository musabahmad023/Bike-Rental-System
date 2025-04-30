import { useState } from 'react';

const LessonManager = () => {
  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: 'Breathing Techniques',
      duration: '45 minutes',
      description: 'Learn proper breathing techniques for singing',
      materials: ['Breathing exercise sheet', 'Practice recordings']
    }
  ]);

  const [newLesson, setNewLesson] = useState({
    title: '',
    duration: '',
    description: '',
    materials: []
  });

  const handleAddLesson = (e) => {
    e.preventDefault();
    setLessons([...lessons, { ...newLesson, id: lessons.length + 1 }]);
    setNewLesson({ title: '', duration: '', description: '', materials: [] });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Lesson Management</h2>
      
      {/* Add New Lesson Form */}
      <form onSubmit={handleAddLesson} className="mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Lesson Title
            </label>
            <input
              type="text"
              id="title"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <input
              type="text"
              id="duration"
              value={newLesson.duration}
              onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={newLesson.description}
              onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Lesson
          </button>
        </div>
      </form>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                <p className="text-sm text-gray-500">{lesson.duration}</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                <button className="text-red-600 hover:text-red-900">Delete</button>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{lesson.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonManager;
