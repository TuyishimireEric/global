"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Search,
  Upload,
  Camera,
} from "lucide-react";

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  image: string;
  bgGradient: string;
}

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: SlideData[] = [
    {
      id: 1,
      title: "Excavator Engine Parts",
      subtitle: "Premium Quality Components",
      description:
        "Find genuine and aftermarket engine parts for all major excavator brands. Quality guaranteed with fast shipping.",
      buttonText: "Shop Engine Parts",
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
      bgGradient: "from-yellow-500 via-yellow-600 to-black",
    },
    {
      id: 2,
      title: "Hydraulic Systems",
      subtitle: "Precision Engineering",
      description:
        "Complete hydraulic solutions including pumps, cylinders, and seals. Keep your machines running smoothly.",
      buttonText: "Browse Hydraulics",
      image:
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop",
      bgGradient: "from-yellow-400 via-orange-500 to-gray-900",
    },
    {
      id: 3,
      title: "Undercarriage Parts",
      subtitle: "Built to Last",
      description:
        "Tracks, rollers, sprockets and more. Heavy-duty undercarriage components for maximum durability.",
      buttonText: "View Undercarriage",
      image:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
      bgGradient: "from-black via-gray-800 to-yellow-600",
    },
    {
      id: 4,
      title: "Filtration Systems",
      subtitle: "Clean Performance",
      description:
        "Air, oil, fuel and hydraulic filters. Protect your investment with proper filtration maintenance.",
      buttonText: "Shop Filters",
      image:
        "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop",
      bgGradient: "from-yellow-500 via-yellow-400 to-gray-700",
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  return (
    <div
      className="relative w-full h-[60vh] min-h-[500px] overflow-hidden bg-gray-900"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1], // Custom easing for smooth animation
          }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="relative w-full h-full">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].bgGradient} opacity-75`}
            />
            <div className="absolute inset-0 bg-black opacity-30" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start lg:items-center min-h-full">
                {/* Left Content */}
                <div className="max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-yellow-400 text-sm font-semibold uppercase tracking-wide mb-2"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
                  >
                    {slides[currentSlide].title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-xl text-gray-200 mb-8 leading-relaxed"
                  >
                    {slides[currentSlide].description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <button className="px-8 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>{slides[currentSlide].buttonText}</span>
                    </button>
                  </motion.div>
                </div>

                {/* Right Content - Compact Modern Search */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="lg:justify-self-end"
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 max-w-xl w-full h-fit">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl mb-4 shadow-lg">
                        <Search className="h-7 w-7 text-black" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Find Your Parts
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Advanced search with AI recognition
                      </p>
                    </div>

                    {/* Main Search Input */}
                    <div className="relative mb-6">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Part number or description..."
                        className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all backdrop-blur-sm"
                      />
                    </div>

                    {/* Visual Search Methods - Same Height Row */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">
                        Visual Search
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <button className="group relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:border-yellow-500/50 hover:bg-white/15 transition-all duration-300 h-24 flex flex-col items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-yellow-500/5 rounded-xl transition-all duration-300"></div>
                          <Upload className="h-7 w-7 text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                          <div className="text-white font-medium text-sm">
                            Upload Image
                          </div>
                        </button>

                        <button className="group relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:border-yellow-500/50 hover:bg-white/15 transition-all duration-300 h-24 flex flex-col items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-yellow-500/5 rounded-xl transition-all duration-300"></div>
                          <Camera className="h-7 w-7 text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                          <div className="text-white font-medium text-sm">
                            Take Photo
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Search Button */}
                    <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-4">
                      Search Parts
                    </button>

                    {/* AI Feature Badge */}
                    <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl py-2">
                      <div className="relative">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-yellow-400 font-medium text-sm">
                        AI-Powered Recognition
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-yellow-400 p-3 rounded-full hover:bg-opacity-70 hover:text-yellow-300 transition-all duration-300 z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-yellow-400 p-3 rounded-full hover:bg-opacity-70 hover:text-yellow-300 transition-all duration-300 z-10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-6 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-yellow-500 w-8"
                : "bg-white bg-opacity-50 hover:bg-opacity-75"
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-30">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-yellow-500"
        />
      </div>
    </div>
  );
};

export default HeroCarousel;
