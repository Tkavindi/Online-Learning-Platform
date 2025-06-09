import React from 'react';
// Enrolled Students Table Component
const EnrolledStudentsTable = ({ students, loading }) => {

    const formatDateTime = (dateString) =>
        new Date(dateString).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

    if (loading) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrolled Students</h3>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-t-2 border-black rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600">Loading students...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Enrolled Students</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </span>
        </div>
        
        {students.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">No students enrolled yet</p>
            <p className="text-sm text-gray-400 mt-1">Students will appear here once they enroll in your course</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Username</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Enrolled Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student ID</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.studentId} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">@{student.username}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDateTime(student.enrolledAt)}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {student.studentId}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

export default EnrolledStudentsTable;
