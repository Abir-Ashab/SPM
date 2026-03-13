import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingBag,
  FiSearch,
  FiPlus,
  FiImage,
  FiTrash2,
  FiX,
  FiMessageCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { productService, type Product } from "../../services/product";
import { orderService } from "../../services/order";

const categories = [
  "all",
  "electronics",
  "clothing",
  "books",
  "home",
  "sports",
  "toys",
  "food",
  "other",
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Text search filter (basic keyword)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query),
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      // Update both products and filteredProducts state
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setFilteredProducts((prev) => prev.filter((p) => p._id !== productId));
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">
              Browse and search our product catalog
            </p>
          </div>
          <button
            onClick={() => navigate("/products/create")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all"
                    ? "All Categories"
                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {products.length === 0 ? "No products yet" : "No products found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {products.length === 0
                ? "Products will appear here once they are added to the catalog."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => navigate("/products/create")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative group">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiImage className="w-12 h-12 text-gray-400" />
                  )}
                  {/* Delete button overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product._id, product.name);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    title="Delete product"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="text-xs text-blue-600 font-medium mb-1 uppercase">
                    {product.category}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Product Details
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Image */}
              {selectedProduct.imageUrl && (
                <div className="mb-4">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-cover rounded-xl shadow-md"
                    onError={(e) => {
                      console.error(
                        "Failed to load image:",
                        selectedProduct.imageUrl,
                      );
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-blue-600">
                      ${selectedProduct.price}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedProduct.stock > 0
                        ? `${selectedProduct.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 max-h-48 overflow-y-auto">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h4>
                  <p
                    className={`text-gray-700 leading-relaxed ${!expandedDescription ? "line-clamp-2" : ""}`}
                  >
                    {selectedProduct.description}
                  </p>
                  {selectedProduct.description &&
                    selectedProduct.description.length > 150 && (
                      <button
                        onClick={() =>
                          setExpandedDescription(!expandedDescription)
                        }
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        {expandedDescription ? "See Less" : "See More"}
                      </button>
                    )}
                </div>

                {selectedProduct.category && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Category
                    </h4>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                      {selectedProduct.category}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex gap-3">
                  <button
                    onClick={async () => {
                      if (selectedProduct.stock > 0) {
                        try {
                          // Create order with default shipping address
                          await orderService.createOrder({
                            items: [
                              {
                                productId: selectedProduct._id,
                                quantity: 1,
                              },
                            ],
                            shippingAddress: {
                              street: "123 Main Street",
                              city: "New York",
                              state: "NY",
                              zipCode: "10001",
                              country: "United States",
                            },
                          });
                          toast.success(
                            `Added ${selectedProduct.name} to cart!`,
                          );
                          setSelectedProduct(null);
                          navigate("/orders");
                        } catch (error: any) {
                          console.error("Failed to create order:", error);
                          toast.error(
                            error.response?.data?.message ||
                              "Failed to add to cart. Please try again.",
                          );
                        }
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={selectedProduct.stock === 0}
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
