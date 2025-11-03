import { SiteHeader } from "@/components/site-header"
import AIChat from "@/components/training/ai-chat"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function TrainingPage() {
  return (
    <ProtectedRoute>
      <main>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
          <div className="px-4 sm:px-6 lg:px-8 py-6 bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">AI Trainer</h1>
              <p className="text-muted-foreground">Learn digital skills with your personal AI assistant</p>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-6">
            <AIChat />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
