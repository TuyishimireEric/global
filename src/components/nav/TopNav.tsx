'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, X, Phone, Mail, Upload, Camera } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  hasDropdown?: boolean
  dropdownItems?: { label: string; href: string }[]
}

const TopNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [cartItemCount, setCartItemCount] = useState(3)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const logo = 'SpareParts Pro'

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { 
      label: 'Excavators', 
      href: '/excavators',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Caterpillar 320', href: '/parts/cat-320' },
        { label: 'Caterpillar 330', href: '/parts/cat-330' },
        { label: 'Caterpillar 336', href: '/parts/cat-336' },
        { label: 'Komatsu PC200', href: '/parts/komatsu-pc200' },
        { label: 'Volvo EC210', href: '/parts/volvo-ec210' }
      ]
    },
    { 
      label: 'Parts', 
      href: '/parts',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Engine Parts', href: '/parts/engine' },
        { label: 'Hydraulic Parts', href: '/parts/hydraulic' },
        { label: 'Undercarriage', href: '/parts/undercarriage' },
        { label: 'Filters', href: '/parts/filters' },
        { label: 'Seals & Gaskets', href: '/parts/seals' }
      ]
    },
    { label: 'Brands', href: '/brands' },
    { label: 'Service', href: '/service' },
    { label: 'Contact', href: '/contact' }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery.trim())
      // Add your search logic here
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Image uploaded:', file.name)
      // Add your image upload logic here
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    console.log('Camera opened')
    // Add your camera logic here
  }

  const handleCartClick = () => {
    console.log('Cart clicked')
    // Add your cart logic here
  }

  const handleLoginClick = () => {
    console.log('Login clicked')
    setIsLoggedIn(true)
    // Add your login logic here
  }

  const handleLogoutClick = () => {
    console.log('Logout clicked')
    setIsLoggedIn(false)
    // Add your logout logic here
  }

  const toggleDropdown = (itemLabel: string) => {
    setOpenDropdown(openDropdown === itemLabel ? null : itemLabel)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top contact bar */}
      <div className="bg-black text-yellow-400 text-center py-1 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>parts@spareparts.com</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <span>Free shipping on orders over $200</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-black hover:text-yellow-600 transition-colors">
              {logo}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-8 flex items-baseline space-x-6">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className="text-gray-800 hover:text-yellow-600 px-2 py-1 text-sm font-medium transition-colors"
                    onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
                    onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}
                  >
                    {item.label}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {item.hasDropdown && openDropdown === item.label && (
                    <div 
                      className="absolute left-0 mt-0 w-44 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-sm mx-6">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search part numbers..."
                  className="w-full pl-8 pr-20 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                
                {/* Image search controls */}
                <div className="absolute right-1 top-1 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    title="Upload image to search"
                  >
                    <Upload className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    title="Take photo to search"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded hover:bg-yellow-600 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <button 
              onClick={handleCartClick}
              className="relative text-gray-800 hover:text-yellow-600 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative group">
              <button className="text-gray-800 hover:text-yellow-600 transition-colors">
                <User className="h-5 w-5" />
              </button>
              
              {/* Account Dropdown */}
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-200">
                {isLoggedIn ? (
                  <>
                    <Link href="/account" className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-600">
                      My Account
                    </Link>
                    <Link href="/orders" className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-600">
                      Order History
                    </Link>
                    <Link href="/quotes" className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-600">
                      Quote Requests
                    </Link>
                    <hr className="my-1" />
                    <button 
                      onClick={handleLogoutClick}
                      className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleLoginClick}
                      className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
                    >
                      Login
                    </button>
                    <Link href="/register" className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-600">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-800 hover:text-yellow-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-gray-50 border-t">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search part numbers..."
                  className="w-full pl-8 pr-20 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                
                {/* Mobile image search controls */}
                <div className="absolute right-1 top-1 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    title="Upload image"
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    title="Take photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded hover:bg-yellow-600 transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            </form>

            {/* Mobile Navigation Items */}
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="text-gray-800 hover:text-yellow-600 block px-3 py-2 text-sm font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.hasDropdown && (
                  <div className="pl-6 space-y-1">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.label}
                        href={dropdownItem.href}
                        className="text-gray-600 hover:text-yellow-600 block px-3 py-1.5 text-xs transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default TopNav