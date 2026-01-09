'use client'

interface KPICardsProps {
  stats: {
    totalReceivedMonth: number
    totalPendingMonth: number
    totalPendingAll: number
    totalCompletedMonth: number
  }
}

export default function KPICards({ stats }: KPICardsProps) {
  const cards = [
    {
      title: 'Total Received (This Month)',
      value: stats.totalReceivedMonth,
      color: 'bg-indigo-600',
      icon: '📥',
    },
    {
      title: 'Total Pending (This Month)',
      value: stats.totalPendingMonth,
      color: 'bg-yellow-500',
      icon: '⏳',
    },
    {
      title: 'Total Pending (All time)',
      value: stats.totalPendingAll,
      color: 'bg-orange-500',
      icon: '📋',
    },
    {
      title: 'Total Completed (Month)',
      value: stats.totalCompletedMonth,
      color: 'bg-green-500',
      icon: '✅',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-md p-3 md:p-6 hover:shadow-lg transition ${
            // Ẩn card thứ 2 và 3 trên mobile
            (index === 1 || index === 2) ? 'hidden md:block' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-600 mb-1 line-clamp-2">{card.title}</p>
              <p className={`text-xl md:text-3xl font-bold ${card.color.replace('bg-', 'text-')}`}>
                {card.value}
              </p>
            </div>
            <div className="text-2xl md:text-4xl ml-2">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

