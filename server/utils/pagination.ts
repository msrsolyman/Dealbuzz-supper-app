import mongoose, { Model } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Highly optimized pagination utility for Mongoose.
 * Uses `.lean()` and runs `countDocuments` and `find` in parallel.
 * 
 * @param model Mongoose model
 * @param query Filter query (e.g. { tenantId, isDeleted: false })
 * @param options Pagination options
 */
export const paginateQuery = async <T>(
  model: Model<any>,
  query: any = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 10);
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  // Run counting and fetching in parallel for performance optimization
  const [data, total] = await Promise.all([
    model
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
      
    model.countDocuments(query).exec()
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data as T[],
    total,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
