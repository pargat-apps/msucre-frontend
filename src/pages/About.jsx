import React from 'react';
import { FaHeart, FaCertificate, FaStar } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-display font-bold mb-4">About M. Sucre</h1>
          <p className="text-xl opacity-90">Crafting Sweet Memories Since Day One</p>
        </div>
      </div>

      {/* Story */}
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 mb-8">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Our Story</h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                Welcome to M. Sucre, where every cake tells a story and every bite brings joy. 
                Our journey began with a simple passion: creating beautiful, delicious cakes that 
                make special moments even more memorable.
              </p>
              <p>
                Based in the heart of the Ottawa-Gatineau region, we proudly serve customers across 
                Gatineau (Quebec) and Downtown Ottawa. What started as a home baking hobby has grown 
                into a thriving business, thanks to our amazing customers and their continuous support.
              </p>
              <p>
                At M. Sucre, we believe that quality ingredients and attention to detail make all 
                the difference. That's why we use only premium ingredients and put love into every 
                creation. Whether you're celebrating a birthday, wedding, anniversary, or any special 
                occasion, we're here to help make it sweeter.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 text-center">
              <FaHeart className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
              <p className="text-gray-600">
                Every cake is handcrafted with care, attention, and lots of love.
              </p>
            </div>
            <div className="card p-6 text-center">
              <FaStar className="text-4xl text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                We use only the finest ingredients for exceptional taste and quality.
              </p>
            </div>
            <div className="card p-6 text-center">
              <FaCertificate className="text-4xl text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Certified & Safe</h3>
              <p className="text-gray-600">
                Fully licensed and certified with proper food handling standards.
              </p>
            </div>
          </div>

          {/* Certifications */}
          <div className="card p-8">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
              Certifications & Licenses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Food Handler Certification</h3>
                <p className="text-gray-600 text-sm">
                  Certified food handler with current health and safety training, ensuring 
                  the highest standards of food hygiene and safety.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Business License</h3>
                <p className="text-gray-600 text-sm">
                  Licensed food business operating in the Ottawa-Gatineau region, fully 
                  compliant with local health and business regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

