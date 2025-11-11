import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import React from 'react';

export function Hero() {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              Your Trusted Health Resource
            </div>
            <h1 className="text-gray-900">
              Empowering Your Journey to Better Health
            </h1>
            <p className="text-gray-600">
              Access reliable health information, expert advice, and comprehensive resources 
              to make informed decisions about your wellbeing and that of your loved ones.
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 bg-white rounded-lg shadow-md p-2">
              <div className="flex items-center flex-1 gap-2 px-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search health topics..."
                  className="flex-1 outline-none text-gray-700"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <div className="text-blue-600">500+</div>
                <p className="text-gray-600">Articles</p>
              </div>
              <div>
                <div className="text-blue-600">50+</div>
                <p className="text-gray-600">Topics</p>
              </div>
              <div>
                <div className="text-blue-600">100K+</div>
                <p className="text-gray-600">Readers</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758691462123-8a17ae95d203?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoJTIwZG9jdG9yfGVufDF8fHx8MTc2MTYxOTczMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Healthcare professionals"
                className="w-full h-auto"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-200 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-200 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
