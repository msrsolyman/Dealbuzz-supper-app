import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string; // Service Name
  category: string;
  providerName?: string;
  shortDescription?: string;

  // Pricing
  priceType: 'fixed' | 'hourly' | 'package';
  rate: number; // base rate or starting from
  packages?: { name: string, price: number, description: string }[];
  discount?: number;

  // Details
  description?: string;
  whatsIncluded?: string[];
  whatsNotIncluded?: string[];
  serviceProcess?: string[];

  // Location & Availability
  serviceArea?: string;
  availableTime?: string;
  serviceType?: 'on_site' | 'remote' | 'pickup';

  // Booking
  bookingType?: 'instant' | 'schedule';
  leadTimeHours?: number;
  maxBookingsPerDay?: number;

  // Media
  mainImage?: string;
  galleryImages?: string[];
  demoVideoUrl?: string;

  // Provider
  providerExperience?: string;
  providerRating?: number;
  contactInfo?: string;

  // Terms
  cancellationPolicy?: string;
  refundPolicy?: string;
  warranty?: string;

  // SEO
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: [true, 'Service name is required'] },
    category: { type: String, required: true },
    providerName: { type: String },
    shortDescription: { type: String },

    priceType: { type: String, enum: ['fixed', 'hourly', 'package'], default: 'fixed' },
    rate: { type: Number, required: true, min: 0 },
    packages: [{ name: String, price: Number, description: String }],
    discount: { type: Number, min: 0, max: 100 },

    description: { type: String },
    whatsIncluded: [{ type: String }],
    whatsNotIncluded: [{ type: String }],
    serviceProcess: [{ type: String }],

    serviceArea: { type: String },
    availableTime: { type: String },
    serviceType: { type: String, enum: ['on_site', 'remote', 'pickup'], default: 'on_site' },

    bookingType: { type: String, enum: ['instant', 'schedule'], default: 'schedule' },
    leadTimeHours: { type: Number, default: 24 },
    maxBookingsPerDay: { type: Number },

    mainImage: { type: String },
    galleryImages: [{ type: String }],
    demoVideoUrl: { type: String },

    providerExperience: { type: String },
    providerRating: { type: Number },
    contactInfo: { type: String },

    cancellationPolicy: { type: String },
    refundPolicy: { type: String },
    warranty: { type: String },

    tags: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },

    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
