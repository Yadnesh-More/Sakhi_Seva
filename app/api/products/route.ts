import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/jwt'
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

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name is too long'),
  price: z.number().min(0, 'Price cannot be negative'),
  description: z.string().max(500, 'Description is too long').optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  sellerId: z.string().min(1, 'Seller ID is required'),
  sellerName: z.string().min(1, 'Seller name is required'),
  sellerEmail: z.string().email('Invalid seller email'),
  sellerPhoneNumber: z.string().optional()
})

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!connectDB || !Product) {
      // Fallback mode - return empty array
      return NextResponse.json({ products: [] })
    }

    // MongoDB mode
    await connectDB()
    
    let products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean()

    let User: any = null;
    try {
      User = require('@/models/User').default;
    } catch (error) {
      console.log('User model not available');
    }

    if (User) {
      const productsWithoutPhone = products.filter((p: any) => !p.sellerPhoneNumber);
      if (productsWithoutPhone.length > 0) {
        const userIds = [...new Set(productsWithoutPhone.map((p: any) => p.sellerId))];
        const users = await User.find({ _id: { $in: userIds } }).select('_id phoneNumber').lean();
        const userPhoneMap = new Map(users.map((u: any) => [u._id.toString(), u.phoneNumber]));
        
        for (const product of products) {
          if (!product.sellerPhoneNumber && userPhoneMap.has(product.sellerId)) {
            product.sellerPhoneNumber = userPhoneMap.get(product.sellerId);
            await Product.findByIdAndUpdate(product._id, { sellerPhoneNumber: userPhoneMap.get(product.sellerId) });
          }
        }
      }
    }

    return NextResponse.json({ products })

  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = productSchema.parse(body)
    
    // Check if MongoDB is available
    if (!connectDB || !Product) {
      // Fallback mode - simulate successful creation
      const mockProduct = {
        _id: `product_${Date.now()}`,
        ...validatedData,
        sellerPhoneNumber: validatedData.sellerPhoneNumber || '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json(
        { 
          message: 'Product created successfully (Demo Mode)',
          product: mockProduct
        },
        { status: 201 }
      )
    }

    // MongoDB mode
    await connectDB()
    
    // Create new product
    const product = new Product(validatedData)
    await product.save()

    return NextResponse.json(
      { 
        message: 'Product created successfully',
        product
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Create product error:', error)
    
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









