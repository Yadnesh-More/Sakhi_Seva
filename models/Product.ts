import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  name: string
  price: number
  description?: string
  image?: string
  tags: string[]
  sellerId: string
  sellerName: string
  sellerEmail: string
  sellerPhoneNumber: string
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  sellerId: {
    type: String,
    required: [true, 'Seller ID is required']
  },
  sellerName: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true
  },
  sellerEmail: {
    type: String,
    required: [true, 'Seller email is required'],
    trim: true
  },
  sellerPhoneNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for better query performance
ProductSchema.index({ sellerId: 1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)









