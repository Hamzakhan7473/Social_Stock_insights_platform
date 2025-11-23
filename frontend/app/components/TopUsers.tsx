'use client'

interface TopUsersProps {
  users: any[]
}

export default function TopUsers({ users }: TopUsersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Top Contributors</h2>
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No users available</div>
        ) : (
          users.map((user, idx) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {user.username}
                    {user.is_verified && (
                      <span className="text-blue-600 text-sm">✓</span>
                    )}
                  </div>
                  {user.full_name && (
                    <div className="text-sm text-gray-500">{user.full_name}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-600">
                  ⭐ {user.reputation_score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Reputation</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

