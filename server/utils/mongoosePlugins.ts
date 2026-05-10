import mongoose, { Schema } from 'mongoose';

/**
 * Multi-Tenant & Soft Delete Plugin
 * Applies soft-delete filtering by default.
 * Creates optimized compound indexes for `tenantId` and `isDeleted`.
 */
export function multiTenantPlugin(schema: Schema) {
  // Add common fields if they don't exist
  if (!schema.path('isDeleted')) {
    schema.add({ isDeleted: { type: Boolean, default: false } });
  }

  // Create highly optimized compound indexes
  if (schema.path('tenantId')) {
    schema.index({ tenantId: 1, isDeleted: 1 });
    // Add time-based index as well for timeline queries
    if (schema.path('createdAt')) {
       schema.index({ tenantId: 1, isDeleted: 1, createdAt: -1 });
    }
  }

  // Exclude soft-deleted documents from all queries by default
  const excludeDeleted = function (this: any) {
    if (this.getQuery().isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
  };

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('updateMany', excludeDeleted);

  // Soft delete method (you can also use findByIdAndUpdate)
  schema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
  };
}
