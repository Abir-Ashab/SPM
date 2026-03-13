import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSend,
  FiFile,
  FiMessageCircle,
  FiUser,
  FiLoader,
  FiRefreshCw,
  FiImage,
  FiUpload,
  FiSearch,
  FiZap,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { productService, type Product } from "../../services/product";
import { orderService } from "../../services/order";
import api from "../../services/api";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  images?: string[];
  products?: Product[];
}

interface Document {
  _id: string;
  originalName: string;
  filename: string;
}

interface EnhancedChatProps {
  selectedDocuments?: Document[];
  className?: string;
}

export default function EnhancedChat({
  selectedDocuments = [],
  className = "",
}: EnhancedChatProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<"semantic" | "image">(
    "semantic",
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/products/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const uploadedUrl = response.data.data.url;
        setUploadedImageUrl(uploadedUrl);
        toast.success("Image uploaded! Click Search to find similar products");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (searchMode === "semantic" && !input.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    if (searchMode === "image" && !uploadedImageUrl && !input.trim()) {
      toast.error("Please upload an image or provide an image URL");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text:
        searchMode === "image" && uploadedImageUrl
          ? "Searching for products from image..."
          : input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      sender: "bot",
      text: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      let botResponse: Message;

      if (searchMode === "semantic" && currentInput) {
        // Semantic product search
        const { products, response: aiResponse } =
          await productService.semanticSearch(currentInput, 10);
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text:
            aiResponse ||
            (products.length > 0
              ? `Found ${products.length} product(s) for "${currentInput}".`
              : `No products found matching "${currentInput}". Try different keywords.`),
          timestamp: new Date(),
          products: products,
        };
      } else if (searchMode === "image") {
        // Image-based product search
        const imageUrl = uploadedImageUrl || currentInput;
        const products = await productService.imageSearch(imageUrl, 10);
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text:
            products.length > 0
              ? `Found ${products.length} similar products based on the image:`
              : "No similar products found. Try a different image.",
          timestamp: new Date(),
          products: products,
        };
        setUploadedImageUrl(""); // Clear uploaded image after search
      }

      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => msg.id !== "typing");
        return [...withoutTyping, botResponse];
      });
    } catch (error: any) {
      // Remove typing indicator and add error message
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => msg.id !== "typing");
        return [
          ...withoutTyping,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: "I apologize, but I encountered an error while processing your request. Please try again.",
            timestamp: new Date(),
          },
        ];
      });

      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const suggestedQuestions = [
    "Show me bags",
    "I need a camera under $500",
    "What's available in clothing?",
    "Help me find perfumes",
  ];

  const renderProductResults = (products: Product[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => setSelectedProduct(product)}
            className="border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all cursor-pointer bg-white hover:border-blue-400 transform hover:scale-[1.02]"
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            )}
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {product.name}
            </h4>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-blue-600 font-bold">${product.price}</span>
              <span className="text-xs text-gray-500">
                {product.stock} in stock
              </span>
            </div>
            <div className="mt-2 text-xs text-blue-500 font-medium flex items-center gap-1">
              <FiSearch className="w-3 h-3" />
              Click for details
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        className={`flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}
        style={{ height: "calc(100vh - 2rem)" }}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiMessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Product Assistant
                </h3>
                <p className="text-sm text-gray-600">
                  {searchMode === "semantic"
                    ? "Search products by description"
                    : "Search by image"}
                  'Search products by image'
                </p>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Clear chat"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Search Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode("semantic")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                searchMode === "semantic"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-green-50"
              }`}
            >
              <FiZap className="w-4 h-4" />
              Semantic
            </button>
            <button
              onClick={() => setSearchMode("image")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                searchMode === "image"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-purple-50"
              }`}
            >
              <FiImage className="w-4 h-4" />
              Image
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
                <FiMessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Search products
              </h4>
              <p className="text-gray-600 mb-6">
                Use semantic search to find products by description or upload an
                image.
              </p>

              {/* Suggested Questions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Try asking:
                </p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="block w-full text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all duration-200"
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === "user"
                      ? "bg-blue-500"
                      : "bg-gradient-to-br from-gray-100 to-gray-200"
                  }`}
                >
                  {message.sender === "user" ? (
                    <FiUser className="w-4 h-4 text-white" />
                  ) : (
                    <FiMessageCircle className="w-4 h-4 text-gray-600" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-xs md:max-w-md lg:max-w-lg ${
                    message.sender === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          AI is thinking...
                        </span>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {message.sender === "bot" ? (
                          <ReactMarkdown
                            components={{
                              // Custom styling for markdown elements
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-2 text-gray-900">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-semibold mb-2 text-gray-900">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-medium mb-1 text-gray-900">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-2 text-gray-900">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-2 text-gray-900">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-2 text-gray-900">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="mb-1 text-gray-900">
                                  {children}
                                </li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-900">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-gray-900">
                                  {children}
                                </em>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm text-gray-900">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap text-white">
                            {message.text}
                          </p>
                        )}
                        {message.images && message.images.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            {message.images.map((imgUrl, idx) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt={`chat-image-${idx}`}
                                className="rounded-lg border border-gray-300 shadow-sm"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Product Results */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3">
                      {renderProductResults(message.products)}
                    </div>
                  )}

                  {!message.isTyping && (
                    <p
                      className={`text-xs mt-1 text-gray-500 ${
                        message.sender === "user" ? "text-right" : ""
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {/* Image Upload for Image Search Mode */}
          {searchMode === "image" && (
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-purple-500 transition-colors flex items-center justify-center gap-2 bg-white"
              >
                <FiUpload className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {uploading
                    ? "Uploading..."
                    : uploadedImageUrl
                      ? "✓ Image uploaded"
                      : "Upload image to search"}
                </span>
              </button>
              {uploadedImageUrl && (
                <div className="mt-2 relative">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => setUploadedImageUrl("")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  searchMode === "semantic"
                    ? "Describe what you're looking for..."
                    : "Paste image URL or upload above..."
                }
                disabled={isLoading || uploading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">
                  {input.length}/500
                </span>
              </div>
            </div>

            <button
              onClick={sendMessage}
              disabled={
                (searchMode === "semantic" && !input.trim()) ||
                (searchMode === "image" &&
                  !uploadedImageUrl &&
                  !input.trim()) ||
                isLoading ||
                uploading
              }
              className={`px-6 py-3 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium ${
                searchMode === "semantic"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              {isLoading ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : searchMode === "image" ? (
                <FiSearch className="w-4 h-4" />
              ) : (
                <FiSend className="w-4 h-4" />
              )}
              {searchMode === "image" ? "Search" : "Send"}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>
              {searchMode === "semantic"
                ? "AI-powered semantic search"
                : "Search by visual similarity"}
            </span>
            <span
              className={`font-medium ${
                searchMode === "semantic" ? "text-green-600" : "text-purple-600"
              }`}
            >
              {searchMode.charAt(0).toUpperCase() + searchMode.slice(1)} Mode
            </span>
          </div>
        </div>
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
    </>
  );
}
