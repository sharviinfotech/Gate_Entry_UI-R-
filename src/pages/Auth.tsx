import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Loader2, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';
import reslLogo from '@/assets/resl-logo.png';
import gateEntry4 from '@/assets/gate-entry-4.jpg';
import gateEntry5 from '@/assets/gate-entry-5.jpg';
import { z } from 'zod';

// Updated schema to use 'username' (min 3 chars) instead of email
const authSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

const backgroundImages = [gateEntry4, gateEntry5];

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
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
      authSchema.parse({ username, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { username?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'username') fieldErrors.username = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     localStorage.removeItem('gate_entry_user');
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Calling your Node.js API through the AuthContext
      const { error } = await signIn(username, password);
      console.log("error",error)
      
      if (error) {
        // Handle custom error messages from your Node server
        toast.error(error.message || 'Authentication failed');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Unable to connect to the server. Please try again.');
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
      <button
        onClick={() => setIsFormOnLeft(!isFormOnLeft)}
        className="absolute top-4 right-4 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground hidden lg:flex items-center gap-2 text-sm"
        title="Switch layout"
      >
        <ArrowLeftRight className="w-4 h-4" />
        <span className="text-xs">Switch</span>
      </button>

      <div className="mx-auto w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white rounded-xl p-2 shadow-md">
            <img src={reslLogo} alt="RESL Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">RE Sustainability</h1>
            <p className="text-xs text-muted-foreground">Gate Entry System</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground mt-1">
            Enter your employee credentials to access the system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="e.g. 062003"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username}</p>
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
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </Button>
        </form>

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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/50" />
      
      <div className="relative z-10 text-center text-white p-12 max-w-lg">
        <h2 className="text-3xl font-bold mb-4">Gate Entry Management System</h2>
        <p className="text-white/80 text-lg mb-6">
          Inward & Outward Gate Operations with SAP Real-Time Integration
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {["Inward PO Reference", "Outward Billing", "Without Reference", "Subcontracting", "RGP", "NRGP", "Real-Time SAP Sync"].map((feature) => (
            <div key={feature} className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <p className="text-sm font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button onClick={prevImage} className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
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
        <button onClick={nextImage} className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {isFormOnLeft ? (
        <>{FormPanel}{ImagePanel}</>
      ) : (
        <>{ImagePanel}{FormPanel}</>
      )}
    </div>
  );
}