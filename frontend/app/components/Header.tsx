'use client'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            📈 Social Stock Insights
          </h1>
          <nav className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Explore
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Post
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Profile
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

