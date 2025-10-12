import { SiteHeader } from "@/components/site-header"
import TrainingVideoClient from "@/components/training/training-video-client"

// Dummy training data with video modules
const trainingData = {
  modules: [
    {
      id: "module-1",
      name: "Digital Literacy Basics",
      topics: [
        {
          id: "topic-1-1",
          title: "Introduction to Smartphones",
          videoUrl: "https://www.youtube.com/embed/r22jFymPxRY",
          duration: "6:12",
          notes: "Learn the basics of using a smartphone - from turning it on to navigating the interface."
        },
        {
          id: "topic-1-2", 
          title: "Understanding Apps and Settings",
          videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
          duration: "4:03",
          notes: "Discover how to install apps, manage settings, and customize your phone experience."
        }
      ]
    },
    {
      id: "module-2",
      name: "Digital Payments & Banking",
      topics: [
        {
          id: "topic-2-1",
          title: "UPI Payments - Quick Start Guide",
          videoUrl: "https://www.youtube.com/embed/lTTajzrSkCw",
          duration: "7:45",
          notes: "Master UPI payments for safe and convenient digital transactions."
        },
        {
          id: "topic-2-2",
          title: "Online Banking Security",
          videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ", 
          duration: "5:10",
          notes: "Learn essential security practices for online banking and digital payments."
        }
      ]
    },
    {
      id: "module-3",
      name: "E-commerce & Business",
      topics: [
        {
          id: "topic-3-1",
          title: "Product Photography with Phone",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: "8:30",
          notes: "Take professional product photos using just your smartphone camera."
        },
        {
          id: "topic-3-2",
          title: "Pricing Your Products",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: "6:45",
          notes: "Learn how to price your products competitively for online sales."
        },
        {
          id: "topic-3-3",
          title: "Social Media Marketing",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: "9:15",
          notes: "Use social media platforms to promote your business and reach customers."
        }
      ]
    }
  ]
}

export default function TrainingPage() {
  return (
    <main>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
        {/* Header Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2">Training Modules</h1>
            <p className="text-muted-foreground">Empower yourself with digital skills through our comprehensive training program</p>
          </div>
        </div>

        <TrainingVideoClient trainingData={trainingData} />
      </div>
    </main>
  )
}
