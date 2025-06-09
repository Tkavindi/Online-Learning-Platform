// Course Edit Form Component
import React, { useState } from 'react';

const CourseEditForm = ({ course, onSubmit, onCancel }) => {
    const [form, setForm] = useState({
      title: course?.title || '',
      description: course?.description || '',
      content: course?.content || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.title.trim() || !form.description.trim()) {
        showDialog('error', 'Validation Error', 'Please fill in all required fields.');
        return;
      }
      onSubmit(form);
    };

    const handleChange = (field, value) => {
      setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Course</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-vertical"
                  placeholder="Enter course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-vertical"
                  placeholder="Enter course content (optional)"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
                >
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };


  export default CourseEditForm;