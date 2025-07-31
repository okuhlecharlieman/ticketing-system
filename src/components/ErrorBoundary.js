"use client";

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h2>Something went wrong.</h2>
          <button 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}