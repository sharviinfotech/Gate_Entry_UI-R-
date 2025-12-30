import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, UserPlus, Loader2, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';
import reslLogo from '@/assets/resl-logo.png';
import gateEntry4 from '@/assets/gate-entry-4.jpg';
import gateEntry5 from '@/assets/gate-entry-5.jpg';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const backgroundImages = [gateEntry4, gateEntry5];

const quotes = [
  { text: "Sustainability is not a destination, it's a journey of continuous improvement.", author: "RE Sustainability" },
  { text: "Every gate entry marks a step towards a greener tomorrow.", author: "RE Sustainability" },
];

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFormOnLeft, setIsFormOnLeft] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully! Please login.');
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const FormPanel = (
    <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 lg:px-12 py-12 bg-card relative">
      {/* Layout Toggle Button */}
      <button
        onClick={() => setIsFormOnLeft(!isFormOnLeft)}
        className="absolute top-4 right-4 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground hidden lg:flex items-center gap-2 text-sm"
        title="Switch layout"
      >
        <ArrowLeftRight className="w-4 h-4" />
        <span className="text-xs">Switch</span>
      </button>

      <div className="mx-auto w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white rounded-xl p-2 shadow-md">
            <img src={reslLogo} alt="RESL Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">RE Sustainability</h1>
            <p className="text-xs text-muted-foreground">Gate Entry System</p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Fill in the details to create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="ml-1 text-accent hover:underline font-medium"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Developer Info */}
        <div className="mt-8 text-center border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Developed By Sharvi Infotech Pvt. Ltd</p>
          <p className="text-xs text-muted-foreground mt-1">Version 1.00</p>
        </div>
      </div>
    </div>
  );

  const ImagePanel = (
    <div 
      className="hidden lg:flex flex-1 items-center justify-center bg-cover relative overflow-hidden transition-all duration-700"
      style={{
        backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
        backgroundPosition: 'right center',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/50" />
      
      
      {/* Content */}
      <div className="relative z-10 text-center text-white p-12 max-w-lg">
        <h2 className="text-3xl font-bold mb-4">Gate Entry Management System</h2>
        <p className="text-white/80 text-lg mb-6">
          Inward & Outward Gate Operations with SAP Real-Time Integration
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-sm font-medium">Inward PO Reference</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-sm font-medium">Outward Billing</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-sm font-medium">Without Reference</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-sm font-medium">Subcontracting</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-sm font-medium">RGP</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-sm font-medium">NRGP</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-sm font-medium">Real-Time SAP Sync</p>
          </div>
        </div>
      </div>

      {/* Image Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={prevImage}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex gap-2">
          {backgroundImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        <button
          onClick={nextImage}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {isFormOnLeft ? (
        <>
          {FormPanel}
          {ImagePanel}
        </>
      ) : (
        <>
          {ImagePanel}
          {FormPanel}
        </>
      )}
    </div>
  );
}
