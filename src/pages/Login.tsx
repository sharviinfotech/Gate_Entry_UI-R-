import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, Truck, ClipboardCheck, BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import loginBg from '@/assets/login-bg.jpg';
import reslLogo from '@/assets/resl-logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24]/95 via-[#E31E24]/85 to-[#B71C1C]/90" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl p-3 shadow-xl">
              <img 
                src={reslLogo} 
                alt="RESL Sustainability Logo" 
                className="h-14 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">RE Sustainability</h1>
              <p className="text-white/80 text-sm">Gate Entry Management System</p>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="max-w-lg space-y-8">
            <div>
              <h2 className="text-5xl font-bold mb-4 leading-tight animate-slide-up">
                Smart Gate Operations for Sustainable Industries
              </h2>
              <p className="text-xl text-white/90 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
                Digitize your inward and outward material tracking with real-time SAP integration and comprehensive reporting.
              </p>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Truck className="w-8 h-8 mb-2 text-white/90" />
                <p className="text-sm font-medium">Vehicle Tracking</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <ClipboardCheck className="w-8 h-8 mb-2 text-white/90" />
                <p className="text-sm font-medium">PO Integration</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <FileText className="w-8 h-8 mb-2 text-white/90" />
                <p className="text-sm font-medium">Billing Docs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <BarChart3 className="w-8 h-8 mb-2 text-white/90" />
                <p className="text-sm font-medium">Real-time Reports</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Shield className="w-5 h-5" />
            <span>Enterprise-grade security with role-based access control</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-4 mb-8">
            <div className="bg-white rounded-xl p-2 shadow-lg border">
              <img 
                src={reslLogo} 
                alt="RESL Sustainability Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">RE Sustainability</h1>
              <p className="text-sm text-muted-foreground">Gate Entry System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to manage your gate operations efficiently</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button type="button" className="text-sm text-[#E31E24] hover:underline font-medium">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#E31E24] hover:bg-[#C41E24] text-white font-medium shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Developed by <span className="font-medium">Sharvi Infotech Pvt. Ltd.</span>
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}