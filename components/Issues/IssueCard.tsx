'use client'

interface IssueCardProps {
  issue: any
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
}

export default function IssueCard({ issue, getStatusColor, getPriorityColor }: IssueCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {issue.Issue}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(issue.IssueDay).toLocaleDateString('en-US')}
            </p>
          </div>
          <div className="flex flex-col gap-2 ml-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(issue.Priority)}`}>
              {issue.Priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(issue.Status)}`}>
              {issue.Status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
          <div>
            <span className="text-gray-500">Area:</span>
            <p className="font-medium">{issue.Area || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Department:</span>
            <p className="font-medium">{issue.Department || '-'}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-indigo-600 font-medium">Click to view details →</span>
        </div>
      </div>
  )
}

