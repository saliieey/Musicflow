import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Music, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { signup, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password validation
  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "Contains number", met: /\d/.test(formData.password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const doPasswordsMatch = formData.password === formData.confirmPassword;
  const isFormValid = formData.username.trim() && formData.email.trim() && isPasswordValid && doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!isFormValid) {
      return;
    }

    try {
      await signup(formData);
      // Redirect to home page after successful signup
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
          <p className="text-spotify-light-gray">Create your account</p>
        </div>

        {/* Signup Form */}
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
                 placeholder="Choose a username"
                 className="h-12 w-full rounded-md border border-spotify-dark-gray bg-white/90 text-black placeholder:text-black/60 px-4 py-3 focus:border-spotify-green focus:ring-2 focus:ring-spotify-green/20 focus:outline-none transition-all duration-200"
                 style={{ color: 'black' }}
                 required
               />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email
              </Label>
                             <input
                 id="email"
                 type="email"
                 value={formData.email}
                 onChange={(e) => handleInputChange("email", e.target.value)}
                 placeholder="Enter your email"
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
                   placeholder="Create a password"
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

              {/* Password Requirements */}
              <div className="space-y-2 mt-3">
                <p className="text-xs text-spotify-light-gray">Password requirements:</p>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {req.met ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span className={cn(
                        "text-xs",
                        req.met ? "text-green-400" : "text-red-400"
                      )}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                                 <input
                   id="confirmPassword"
                   type={showConfirmPassword ? "text" : "password"}
                   value={formData.confirmPassword}
                   onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                   placeholder="Confirm your password"
                   className={`h-12 w-full rounded-md border px-4 py-3 pr-12 focus:ring-2 focus:ring-spotify-green/20 focus:outline-none transition-all duration-200 ${
                     formData.confirmPassword && !doPasswordsMatch 
                       ? "border-red-500 focus:border-red-500" 
                       : "border-spotify-dark-gray focus:border-spotify-green"
                   } bg-white/90 text-black placeholder:text-black/60`}
                   style={{ color: 'black' }}
                   required
                 />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-spotify-light-gray hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 mt-2">
                  {doPasswordsMatch ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className={cn(
                    "text-xs",
                    doPasswordsMatch ? "text-green-400" : "text-red-400"
                  )}>
                    {doPasswordsMatch ? "Passwords match" : "Passwords don't match"}
                  </span>
                </div>
              )}
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
              disabled={isLoading || !isFormValid}
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
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-spotify-dark-gray/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-spotify-gray/20 text-spotify-light-gray">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Button
            variant="outline"
            onClick={() => setLocation("/login")}
            className="w-full h-12 border-spotify-dark-gray text-white hover:bg-spotify-dark-gray/50 hover:border-spotify-green transition-all duration-200"
          >
            Sign In
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-spotify-light-gray text-sm">
            By creating an account, you agree to our{" "}
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