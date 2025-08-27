import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Building, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle mouse movement for dynamic glassmorphism effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay restrictions
        console.log('Video autoplay blocked by browser');
      });
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Set authentication flag
      localStorage.setItem('isAuthenticated', 'true');
      // Navigate to dashboard after successful sign-in
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        style={{ filter: 'brightness(0.3) contrast(1.2)' }}
      >
        <source src="/src/components/layout/asserts/WhatsApp Video 2025-08-25 at 2.34.20 PM.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Animated Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Dynamic Glassmorphism Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.1), transparent 40%)`
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and App Name */}
          <div className="text-center mb-8">
            {/* Logo - Direct image with rotation */}
            <img 
              src="/src/components/layout/asserts/download-removebg-preview.png" 
              alt="SES Logo" 
              className="w-20 h-20 mx-auto mb-6 animate-slow-rotate"
            />
            
            {/* Company Name - Single line, no wrapping */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 animate-fade-in whitespace-nowrap">
              Shiva Engineering Services
            </h1>
            <p className="text-white/80 text-lg font-medium animate-fade-in-delay">
              Sign in to your account
            </p>
            
            {/* Sparkle Effect */}
            <div className="flex justify-center mt-3 space-x-1">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0s' }} />
              <Sparkles className="w-4 h-4 text-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <Sparkles className="w-4 h-4 text-purple-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          {/* Enhanced Sign In Form with Advanced Glassmorphism */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-fade-in-up">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-primary-brand" />
                Secure Access
              </CardTitle>
              <p className="text-white/70 text-sm">
                Enter your credentials to access your dashboard
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white/90">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 group-focus-within:text-primary-brand transition-colors duration-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-primary-brand/50 focus:ring-2 focus:ring-primary-brand/20 transition-all duration-300 backdrop-blur-sm"
                    />
                    {/* Glow effect on focus */}
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-brand/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-white/90">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 group-focus-within:text-primary-brand transition-colors duration-300" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-12 py-3 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-primary-brand/50 focus:ring-2 focus:ring-primary-brand/20 transition-all duration-300 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-300 p-1 rounded-md hover:bg-white/10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {/* Glow effect on focus */}
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-brand/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/30 text-primary-brand focus:ring-primary-brand/20 bg-white/10"
                    />
                    <span className="text-white/80 group-hover:text-white transition-colors duration-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-primary-brand hover:text-primary-brand/80 font-medium transition-colors duration-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Enhanced Sign In Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-brand via-blue-600 to-purple-600 hover:from-primary-brand/90 hover:via-blue-600/90 hover:to-purple-600/90 py-3 text-base font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Enhanced Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/50 text-white/60 backdrop-blur-sm rounded-full">Or continue with</span>
                </div>
              </div>

              {/* Enhanced Demo Credentials */}
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 group">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Demo Credentials
                </h4>
                <div className="text-xs text-white/80 space-y-1 mb-3">
                  <p><strong>Email:</strong> demo@ses.com</p>
                  <p><strong>Password:</strong> demo123</p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setEmail('demo@ses.com');
                    setPassword('demo123');
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 group-hover:scale-105"
                >
                  Use Demo Credentials
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-white/70">
              Don't have an account?{' '}
              <button className="text-primary-brand hover:text-primary-brand/80 font-medium transition-colors duration-300 hover:underline">
                Contact your administrator
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Additional Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}
