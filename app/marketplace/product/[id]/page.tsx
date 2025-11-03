"use client"

import { SiteHeader } from "@/components/site-header"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface Product {
  _id: string
  name: string
  price: number
  description?: string
  image?: string
  tags: string[]
  sellerId: string
  sellerName: string
  sellerEmail: string
  createdAt: string
  updatedAt: string
}

export default function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [productId, setProductId] = useState<string | null>(null)

  // Get the product ID from params
  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id)
    })
  }, [params])

  // Fetch product data
  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        
        if (!response.ok) {
          setProduct(null)
          return
        }
        
        const data = await response.json()
        setProduct(data.product)
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <ProtectedRoute>
        <main>
          <SiteHeader />
          <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading product...</p>
              </div>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <main>
        <SiteHeader />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
        {/* Header Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border">
          <div className="max-w-6xl mx-auto">
            <Link 
              href="/marketplace" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Product Image */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image || "/placeholder.svg?height=400&width=400&query=product"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
                      <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
                        ₹{product.price.toLocaleString("en-IN")}
                      </Badge>
                    </div>

                    {product.description && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Seller Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Seller Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {product.sellerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.sellerName}</p>
                        <p className="text-sm text-muted-foreground">Verified Seller</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => window.open(`mailto:${product.sellerEmail}`, '_blank')}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Seller
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.open(`mailto:${product.sellerEmail}?subject=Interest in ${product.name}`, '_blank')}
                >
                  Contact Seller
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.open(`mailto:${product.sellerEmail}?subject=Question about ${product.name}`, '_blank')}
                >
                  Ask Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </ProtectedRoute>
  )
}
