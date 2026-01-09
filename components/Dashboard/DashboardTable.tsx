'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { api } from '@/lib/api'

interface DepartmentDetail {
  Department: string
  receivedMonth: number
  completedMonth: number
  pendingMonth: number
  pendingAll: number
}

interface DashboardTableProps {
  data: DepartmentDetail[]
  loading?: boolean
}

export default function DashboardTable({ data, loading }: DashboardTableProps) {
  const [filters, setFilters] = useState({
    department: '',
    sortBy: 'receivedMonth',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  // Filter và sort data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Filter by department
    if (filters.department) {
      result = result.filter(item => 
        item.Department.toLowerCase().includes(filters.department.toLowerCase())
      )
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof DepartmentDetail] as number
      const bValue = b[filters.sortBy as keyof DepartmentDetail] as number
      
      if (filters.sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return result
  }, [data, filters])

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['No.', 'Department', 'Received (Month)', 'Completed (Month)', 'Pending (Month)', 'Pending (All time)']
    const rows = filteredData.map((item, index) => [
      index + 1,
      item.Department,
      item.receivedMonth,
      item.completedMonth,
      item.pendingMonth,
      item.pendingAll,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to PDF
  const exportToPDF = async () => {
    try {
      // Dynamic import để giảm bundle size
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(18)
      doc.text('Dashboard Report - Department Summary', 14, 20)
      
      // Date
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString('vi-VN')}`, 14, 30)

      // Table data
      const tableData = filteredData.map((item, index) => [
        index + 1,
        item.Department,
        item.receivedMonth.toString(),
        item.completedMonth.toString(),
        item.pendingMonth.toString(),
        item.pendingAll.toString(),
      ])

      autoTable(doc, {
        head: [['No.', 'Department', 'Received (Month)', 'Completed (Month)', 'Pending (Month)', 'Pending (All time)']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] }, // Blue
        alternateRowStyles: { fillColor: [249, 250, 251] },
      })

      doc.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Header: Title bên trái, Export bên phải - cùng một hàng */}
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
        {/* Title bên trái */}
        <h3 className="text-base md:text-lg font-semibold text-gray-800 flex-shrink-0">📊 Details by Department</h3>
        
        {/* Export Dropdown cho mobile, Buttons cho desktop - bên phải */}
        <div className="relative flex-shrink-0" ref={exportMenuRef}>
          {/* Mobile: Dropdown */}
          <div className="md:hidden">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <span>📊</span>
              <span>Export</span>
              <span>{showExportMenu ? '▲' : '▼'}</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    exportToCSV()
                    setShowExportMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
                >
                  <span>📄</span>
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    exportToPDF()
                    setShowExportMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm border-t border-gray-200 transition-colors"
                >
                  <span>📑</span>
                  <span>Export PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop: Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <span>📄</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <span>📑</span>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter input - riêng một hàng */}
      <div className="mb-4 md:mb-6">
        <input
          type="text"
          placeholder="Filter by department..."
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div key={item.Department} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <h4 className="font-semibold text-gray-900">{item.Department}</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Received:</span>
                  <span className="ml-1 font-medium text-gray-900">{item.receivedMonth}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-1 font-medium text-gray-900">{item.completedMonth}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pending (M):</span>
                  <span className="ml-1 font-medium text-gray-900">{item.pendingMonth}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pending (All):</span>
                  <span className="ml-1 font-medium text-gray-900">{item.pendingAll}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">No data available</div>
        )}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <button
                  onClick={() => setFilters({
                    ...filters,
                    sortBy: 'receivedMonth',
                    sortOrder: filters.sortBy === 'receivedMonth' && filters.sortOrder === 'desc' ? 'asc' : 'desc'
                  })}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  No.
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <button
                  onClick={() => setFilters({
                    ...filters,
                    sortBy: 'receivedMonth',
                    sortOrder: filters.sortBy === 'receivedMonth' && filters.sortOrder === 'desc' ? 'asc' : 'desc'
                  })}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Received (Month)
                  {filters.sortBy === 'receivedMonth' && (
                    <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <button
                  onClick={() => setFilters({
                    ...filters,
                    sortBy: 'completedMonth',
                    sortOrder: filters.sortBy === 'completedMonth' && filters.sortOrder === 'desc' ? 'asc' : 'desc'
                  })}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Completed (Month)
                  {filters.sortBy === 'completedMonth' && (
                    <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <button
                  onClick={() => setFilters({
                    ...filters,
                    sortBy: 'pendingMonth',
                    sortOrder: filters.sortBy === 'pendingMonth' && filters.sortOrder === 'desc' ? 'asc' : 'desc'
                  })}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Pending (Month)
                  {filters.sortBy === 'pendingMonth' && (
                    <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <button
                  onClick={() => setFilters({
                    ...filters,
                    sortBy: 'pendingAll',
                    sortOrder: filters.sortBy === 'pendingAll' && filters.sortOrder === 'desc' ? 'asc' : 'desc'
                  })}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Pending (All time)
                  {filters.sortBy === 'pendingAll' && (
                    <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.Department} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.Department}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.receivedMonth}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.completedMonth}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.pendingMonth}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.pendingAll}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filteredData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
            <div>
              <span className="text-gray-600">Total Received:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {filteredData.reduce((sum, item) => sum + item.receivedMonth, 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Completed:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {filteredData.reduce((sum, item) => sum + item.completedMonth, 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Pending (Month):</span>
              <span className="ml-2 font-semibold text-gray-900">
                {filteredData.reduce((sum, item) => sum + item.pendingMonth, 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Pending (All):</span>
              <span className="ml-2 font-semibold text-gray-900">
                {filteredData.reduce((sum, item) => sum + item.pendingAll, 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

