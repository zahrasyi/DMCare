import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import React from 'react';

export function Newsletter() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-white mb-4">
          Stay Informed About Your Health
        </h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter for the latest health tips, research findings, 
          and wellness advice delivered to your inbox weekly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg outline-none text-gray-900"
          />
          <Button className="bg-white text-blue-600 hover:bg-gray-100">
            Subscribe
          </Button>
        </div>

        <p className="text-blue-200 mt-4">
          Join 50,000+ health-conscious readers
        </p>
      </div>
    </section>
  );
}
