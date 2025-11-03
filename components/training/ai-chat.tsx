"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Paperclip, Loader2, ExternalLink, PlayCircle, FileText, Newspaper } from "lucide-react"
import { ResourcePreview } from "./resource-preview"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

const GEMINI_ICON = (
    <svg
        height="1em"
        style={{ flex: "none", lineHeight: "1" }}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient
                id="lobe-icons-gemini-fill"
                x1="0%"
                x2="68.73%"
                y1="100%"
                y2="30.395%"
            >
                <stop offset="0%" stopColor="#1C7DFF" />
                <stop offset="52.021%" stopColor="#1C69FF" />
                <stop offset="100%" stopColor="#F0DCD6" />
            </linearGradient>
        </defs>
        <path
            d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
            fill="url(#lobe-icons-gemini-fill)"
            fillRule="nonzero"
        />
    </svg>
)

interface YouTubeVideo {
    title: string
    link: string
    summary: string
}

interface StructuredResource {
    type: 'article' | 'blog'
    title: string
    link: string
    summary: string
    image?: string
}

interface StructuredData {
    header: string
    intro: string
    youtubeVideos?: YouTubeVideo[]
    resources: StructuredResource[]
}

interface Message {
    role: 'user' | 'model'
    content: string
    citations?: Array<{ title: string; url: string; index: number }>
    structuredData?: StructuredData
}

export default function AIChat() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    })

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput("")
        adjustHeight(true)

        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))

            const response = await fetch('/api/training/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: conversationHistory
                })
            })

            const data = await response.json()

            if (response.ok) {
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: data.message,
                    citations: data.citations || [],
                    structuredData: data.structuredData
                }])
            } else {
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: `Sorry, I encountered an error: ${data.error}`
                }])
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'model',
                content: 'Sorry, I encountered an error. Please try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-4 flex flex-col h-[calc(100vh-250px)]">
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 pt-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-2.5 mx-2">
                    <div className="flex-1 flex items-center gap-2">
                        {GEMINI_ICON}
                        <h3 className="text-black dark:text-white/90 text-xs tracking-tighter">
                            Your AI trainer is ready
                        </h3>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 mb-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-4">{GEMINI_ICON}</div>
                            <h3 className="text-lg font-semibold mb-2">Welcome to AI Trainer</h3>
                            <p className="text-muted-foreground text-sm">
                                Ask me anything about digital skills, business, or entrepreneurship...
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {GEMINI_ICON}
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "rounded-lg p-4 max-w-[80%]",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card border border-border"
                                    )}
                                >
                                    {msg.role === 'user' ? (
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    ) : (
                                        <div className="text-sm">
                                            {msg.structuredData ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="text-base font-semibold mb-2">{msg.structuredData.header}</h3>
                                                        {msg.structuredData.intro && (
                                                            <p className="text-muted-foreground mb-4">{msg.structuredData.intro}</p>
                                                        )}
                                                    </div>
                                                    {msg.structuredData.youtubeVideos && msg.structuredData.youtubeVideos.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                                <PlayCircle className="w-4 h-4" />
                                                                YouTube Videos
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {msg.structuredData.youtubeVideos.map((video, idx) => (
                                                                    <ResourcePreview
                                                                        key={idx}
                                                                        url={video.link}
                                                                        title={video.title}
                                                                        type="video"
                                                                        summary={video.summary}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {msg.structuredData.resources && msg.structuredData.resources.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                                <FileText className="w-4 h-4" />
                                                                Articles & Blogs
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {msg.structuredData.resources.map((resource, idx) => (
                                                                    <ResourcePreview
                                                                        key={idx}
                                                                        url={resource.link}
                                                                        title={resource.title}
                                                                        type={resource.type}
                                                                        summary={resource.summary}
                                                                        image={resource.image}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={{
                                                            img: ({ src, alt }) => (
                                                                <img
                                                                    src={src}
                                                                    alt={alt}
                                                                    className="max-w-full h-auto rounded-lg my-2"
                                                                />
                                                            ),
                                                            a: ({ href, children }) => (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:underline flex items-center gap-1"
                                                                >
                                                                    {children}
                                                                    <ExternalLink className="w-3 h-3 inline" />
                                                                </a>
                                                            ),
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            {msg.citations && msg.citations.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-border">
                                                    <p className="text-xs font-semibold mb-2">Additional Sources:</p>
                                                    <div className="space-y-1">
                                                        {msg.citations.map((cite, i) => (
                                                            <a
                                                                key={i}
                                                                href={cite.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary hover:underline flex items-center gap-1 block"
                                                            >
                                                                [{cite.index}] {cite.title}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary text-xs font-semibold">Y</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {GEMINI_ICON}
                            </div>
                            <div className="rounded-lg p-4 bg-card border border-border">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="relative">
                    <div className="relative flex flex-col border-t border-border pt-2">
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "300px" }}
                        >
                            <Textarea
                                value={input}
                                placeholder="Ask me anything about digital skills, business, or entrepreneurship..."
                                className={cn(
                                    "w-full rounded-xl border-none bg-black/5 dark:bg-white/5 placeholder:text-black/50 dark:placeholder:text-white/50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[72px]"
                                )}
                                ref={textareaRef}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    setInput(e.target.value)
                                    adjustHeight()
                                }}
                                disabled={loading}
                            />
                        </div>

                        <div className="h-14 flex items-center">
                            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 h-8 pl-2 pr-2 text-xs rounded-md dark:text-white">
                                        <span className="flex items-center gap-1">
                                            {GEMINI_ICON}
                                            <span>Gemini 2.5 Flash</span>
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                    <label
                                        className={cn(
                                            "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" />
                                        <Paperclip className="w-4 h-4 transition-colors" />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className={cn(
                                        "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                    aria-label="Send message"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin dark:text-white" />
                                    ) : (
                                        <ArrowRight
                                            className={cn(
                                                "w-4 h-4 dark:text-white transition-opacity duration-200",
                                                input.trim() ? "opacity-100" : "opacity-30"
                                            )}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

