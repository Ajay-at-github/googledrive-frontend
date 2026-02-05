import React from "react";
import { Link } from "react-router-dom";
import { Cloud, Shield, Zap, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              CloudDrive
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your files, always within reach
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Store, share, and collaborate on files and folders from any device.
            Secure cloud storage for all your needs.
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/register">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700">
                Try CloudDrive Free
              </button>
            </Link>

            <Link to="/login">
              <button className="px-8 py-3 border border-gray-300 rounded-lg text-base font-medium hover:bg-gray-100">
                Sign In
              </button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why choose CloudDrive?
          </h2>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
            <Feature
              icon={<Shield className="w-6 h-6 text-blue-600" />}
              title="Secure Storage"
              text="Your files are encrypted and protected with enterprise-grade security."
            />
            <Feature
              icon={<Zap className="w-6 h-6 text-blue-600" />}
              title="Lightning Fast"
              text="Upload and download files at blazing speeds with optimized infrastructure."
            />
            <Feature
              icon={<Users className="w-6 h-6 text-blue-600" />}
              title="Easy Sharing"
              text="Share files and folders with anyone using granular permissions."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-white text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CloudDrive. All rights reserved.
      </footer>
    </div>
  );
};

/**
 * @typedef {Object} FeatureProps
 * @property {React.ReactNode} icon
 * @property {string} title
 * @property {string} text
 */

const Feature = ({ icon, title, text }) => (
  <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default Index;
