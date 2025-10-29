import { Navigation } from "@/components/navigation"
import { FeedManagement } from "@/components/feed-management"

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FeedManagement />
      </main>
    </div>
  )
}
