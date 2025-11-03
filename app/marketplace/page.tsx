"use client"

import { SiteHeader } from "@/components/site-header"
import { ProductCard } from "@/components/marketplace/product-card"
import { ProductForm, type ProductInput } from "@/components/marketplace/product-form"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

type Product = {
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

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"browse" | "mine">("browse")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const { user } = useAuth()

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (response.ok) {
        setAllProducts(data.products || [])
        // Filter user's products
        if (user) {
          setMyProducts(data.products?.filter((p: Product) => p.sellerId === user.id) || [])
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [user])

  const editingProduct = useMemo(() => myProducts.find((p) => p._id === editingId), [editingId, myProducts])

  async function addProduct(input: ProductInput) {
    if (!user) return
    
    try {
      setSubmitting(true)
      const tags = (input.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: input.name,
          price: Number(input.price || 0),
          description: input.description,
          image: input.image,
          tags,
          sellerId: user.id,
          sellerName: user.fullName,
          sellerEmail: user.email,
        }),
      })

      if (response.ok) {
        await fetchProducts() // Refresh the list
        setActiveTab("mine")
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateProduct(input: ProductInput) {
    if (!editingId) return
    
    try {
      setSubmitting(true)
      const tags = (input.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      
      const response = await fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: input.name,
          price: Number(input.price || 0),
          description: input.description,
          image: input.image,
          tags,
        }),
      })

      if (response.ok) {
        await fetchProducts() // Refresh the list
        setEditingId(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      setSubmitting(true)
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProducts() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <main>
        <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Marketplace</h1>
              <p className="text-sm text-foreground/70 mt-1">Browse community products or manage your own listings.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Tabs (custom segmented control) */}
        <div className="mb-6 inline-flex rounded-md border border-border p-1">
          <button
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              activeTab === "browse"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => setActiveTab("browse")}
          >
            Browse ({allProducts.length})
          </button>
          <button
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              activeTab === "mine"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => setActiveTab("mine")}
          >
            My products ({myProducts.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading products...</span>
          </div>
        ) : activeTab === "browse" ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {allProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No products available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to add a product!</p>
              </div>
            ) : (
              allProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))
            )}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-medium">Add a new product</h2>
              <p className="text-sm text-foreground/70 mt-1">Share your craft with the community.</p>
              <div className="mt-4">
                <ProductForm 
                  onSubmit={addProduct} 
                  submitLabel={submitting ? "Adding..." : "Add product"}
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <h2 className="font-medium">Your listings</h2>
              <p className="text-sm text-foreground/70 mt-1">Edit or remove your products below.</p>

              <div className="mt-4 grid gap-4">
                {myProducts.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-5 text-sm text-foreground/70">
                    You haven&apos;t added any products yet.
                  </div>
                ) : (
                  myProducts.map((p) =>
                    editingId === p._id ? (
                      <div key={p._id} className="rounded-lg border border-border bg-card p-5">
                        <h3 className="mb-3 font-medium">Edit: {p.name}</h3>
                        <ProductForm
                          defaultValue={{
                            name: p.name,
                            price: p.price,
                            description: p.description,
                            image: p.image,
                            tags: (p.tags || []).join(", "),
                          }}
                          onSubmit={updateProduct}
                          submitLabel={submitting ? "Saving..." : "Save changes"}
                          disabled={submitting}
                        />
                        <div className="mt-3">
                          <button 
                            className="text-sm underline underline-offset-4" 
                            onClick={() => setEditingId(null)}
                            disabled={submitting}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <ProductCard
                        key={p._id}
                        product={p}
                        actions={
                          <>
                            <button
                              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                              onClick={() => setEditingId(p._id)}
                              disabled={submitting}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-md bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-50"
                              onClick={() => removeProduct(p._id)}
                              disabled={submitting}
                            >
                              Delete
                            </button>
                          </>
                        }
                      />
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      </main>
    </ProtectedRoute>
  )
}
