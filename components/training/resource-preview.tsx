"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { PlayCircle, Image as ImageIcon } from "lucide-react"

interface ResourcePreviewProps {
  url: string
  title: string
  type: 'video' | 'article' | 'blog'
  summary: string
  image?: string
}

export function ResourcePreview({ url, title, type, summary, image }: ResourcePreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  
  let thumbnailUrl = ''
  if (isYouTube || type === 'video') {
    const videoId = extractYouTubeId(url)
    thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
  } else {
    thumbnailUrl = image || ''
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block border border-border rounded-lg overflow-hidden hover:shadow-md transition-all group",
        "hover:scale-[1.02]"
      )}
    >
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-muted h-full w-full" />
          </div>
        )}
        {thumbnailUrl ? (
          <>
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100",
                imageError && "hidden"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
            {!imageError && isYouTube && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            )}
          </>
        ) : null}
        
        {(imageError || !thumbnailUrl) && !imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">No preview available</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {summary}
        </p>
      </div>
    </a>
  )
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

