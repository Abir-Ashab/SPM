import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { catchAsync } from "../utils/catchAsync.util";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
});

export const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const { category, minPrice, maxPrice } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);

    const products = await ProductService.getAllProducts(filters);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  },
);

export const getProductById = catchAsync(
  async (req: Request, res: Response) => {
    const product = await ProductService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  },
);

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.updateProduct(req.params.id, req.body);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const deleted = await ProductService.deleteProduct(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const searchProducts = catchAsync(
  async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const products = await ProductService.searchProducts(query as string);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  },
);

export const semanticSearch = catchAsync(
  async (req: Request, res: Response) => {
    const { query, topK } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await ProductService.semanticSearch(query, topK || 5);

    console.log(
      "Semantic search results:",
      JSON.stringify(result.products.slice(0, 1), null, 2),
    );

    res.status(200).json({
      success: true,
      data: result.products,
      response: result.response,
    });
  },
);

export const imageSearch = catchAsync(async (req: Request, res: Response) => {
  const { imageUrl, topK } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      message: "Image URL is required",
    });
  }

  const products = await ProductService.imageSearch(imageUrl, topK || 5);

  res.status(200).json({
    success: true,
    data: products,
  });
});

export const batchIndexProducts = catchAsync(
  async (req: Request, res: Response) => {
    await ProductService.batchIndexProducts();

    res.status(200).json({
      success: true,
      message: "Products indexed successfully",
    });
  },
);
