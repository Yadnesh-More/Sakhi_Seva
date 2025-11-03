import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Try to import MongoDB dependencies, fallback if not available
let connectDB: any = null;
let Product: any = null;

try {
  connectDB = require('@/lib/mongodb').default;
  Product = require('@/models/Product').default;
} catch (error) {
  console.warn('MongoDB not available, using fallback mode');
}

const productUpdateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name is too long'),
  price: z.number().min(0, 'Price cannot be negative'),
  description: z.string().max(500, 'Description is too long').optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional()
})

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if MongoDB is available
    if (!connectDB || !Product) {
      // Fallback mode - return mock product
      const mockProduct = {
        _id: id,
        name: 'Demo Product',
        price: 1000,
        description: 'This is a demo product',
        image: '/placeholder.svg',
        tags: ['demo'],
        sellerId: 'demo_user',
        sellerName: 'Demo User',
        sellerEmail: 'demo@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json({ product: mockProduct })
    }

    // MongoDB mode
    await connectDB()
    
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })

  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate input
    const validatedData = productUpdateSchema.parse(body)
    
    // Check if MongoDB is available
    if (!connectDB || !Product) {
      // Fallback mode - simulate successful update
      const mockProduct = {
        _id: id,
        ...validatedData,
        sellerId: 'demo_user',
        sellerName: 'Demo User',
        sellerEmail: 'demo@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json(
        { 
          message: 'Product updated successfully (Demo Mode)',
          product: mockProduct
        }
      )
    }

    // MongoDB mode
    await connectDB()
    
    const product = await Product.findByIdAndUpdate(
      id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Product updated successfully',
        product
      }
    )

  } catch (error: any) {
    console.error('Update product error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if MongoDB is available
    if (!connectDB || !Product) {
      // Fallback mode - simulate successful deletion
      return NextResponse.json(
        { message: 'Product deleted successfully (Demo Mode)' }
      )
    }

    // MongoDB mode
    await connectDB()
    
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Product deleted successfully' }
    )

  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}









