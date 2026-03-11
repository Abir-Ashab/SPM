import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrls?: string[]; // Product images shared in this message
  extractedEntities?: {
    products?: string[];
    quantities?: number[];
    intent?: string;
  };
}

export interface IConversation extends Document {
  title: string;
  messages: IMessage[];
  user: Schema.Types.ObjectId;
  lastActivity: Date;
  isActive: boolean;
  context: {
    intent?: string; // Current conversation intent (inquiry, order, pricing, etc.)
    orderDraft?: {
      items: Array<{ productId: string; quantity: number }>;
      shippingAddress?: any;
      contactPhone?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  imageUrls: [{
    type: String
  }],
  extractedEntities: {
    products: [String],
    quantities: [Number],
    intent: String
  }
}, { _id: false });

const conversationSchema = new Schema<IConversation>({
  title: {
    type: String,
    required: true,
    default: 'New Conversation'
  },
  messages: [messageSchema],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  context: {
    intent: String,
    orderDraft: {
      items: [{
        productId: String,
        quantity: Number
      }],
      shippingAddress: Schema.Types.Mixed,
      contactPhone: String
    }
  }
}, {
  timestamps: true
});

// Update lastActivity on save
conversationSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export const Conversation = model<IConversation>('Conversation', conversationSchema);
