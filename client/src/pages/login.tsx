import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Music, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      return;
    }

    try {
      await login(formData);
      // Redirect to home page after successful login
      setLocation("/");
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-spotify-black via-purple-900/20 to-spotify-black flex items-center justify-center p-4">
      {/* Background Music Notes - More Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl text-purple-500/10 animate-pulse">♪</div>
        <div className="absolute top-40 right-20 text-3xl text-blue-500/10 animate-pulse delay-1000">♫</div>
        <div className="absolute bottom-40 left-20 text-2xl text-green-500/10 animate-pulse delay-2000">♬</div>
        <div className="absolute bottom-20 right-10 text-5xl text-pink-500/10 animate-pulse delay-3000">♩</div>
      </div>

             <div className="w-full max-w-md">
         {/* Back Button - positioned relative to form container */}
         <div className="mb-6">
           <Button
             variant="ghost"
             onClick={() => setLocation("/")}
             className="text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray/50 rounded-lg px-3 py-2 transition-all duration-200"
           >
             <ArrowLeft className="w-5 h-5 mr-2" />
             Back to Home
           </Button>
         </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-spotify-green to-green-400 rounded-full mb-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <Music className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 hover:text-spotify-green transition-colors duration-300">MusicFlow</h1>
          <p className="text-spotify-light-gray">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-spotify-gray/20 backdrop-blur-md border border-spotify-dark-gray/30 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-medium">
                Username
              </Label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username"
                className="h-12 w-full rounded-md border border-spotify-dark-gray bg-white/90 text-black placeholder:text-black/60 px-4 py-3 focus:border-spotify-green focus:ring-2 focus:ring-spotify-green/20 focus:outline-none transition-all duration-200"
                style={{ color: 'black' }}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Password
              </Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-md border border-spotify-dark-gray bg-white/90 text-black placeholder:text-black/60 px-4 py-3 pr-12 focus:border-spotify-green focus:ring-2 focus:ring-spotify-green/20 focus:outline-none transition-all duration-200"
                  style={{ color: 'black' }}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-spotify-light-gray hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.username.trim() || !formData.password.trim()}
              className={cn(
                "w-full h-12 bg-spotify-green hover:bg-spotify-green/90 text-black font-semibold",
                "rounded-lg transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-spotify-dark-gray/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-spotify-gray/20 text-spotify-light-gray">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Button
            variant="outline"
            onClick={() => setLocation("/signup")}
            className="w-full h-12 border-spotify-dark-gray text-white hover:bg-spotify-dark-gray/50 hover:border-spotify-green transition-all duration-200"
          >
            Create Account
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-spotify-light-gray text-sm">
            By signing in, you agree to our{" "}
            <a href="#" className="text-spotify-green hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-spotify-green hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 