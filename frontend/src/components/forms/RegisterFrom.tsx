import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const SignupPage: React.FC = () => {
  
  const { register } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength indicators
  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!name || !username || !email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }


    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Username validation (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscore only)');
      setIsLoading(false);
      return;
    }

    // Password strength validation
    if (!passwordStrength.hasLength) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }


    try {
        const payload = {
            name: name,
            username: username,
            email: email,
            password: password
        }
        await register(payload);
        router.push("/")
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Invalid credentials. Please try again";
        setError(errorMessage)
    } finally {
        setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-950 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent"></div>
      
      <Card className="w-full max-w-lg sm:max-w-xl relative z-10 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-zinc-400 to-zinc-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-950" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center text-zinc-100">
            Create an account
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center text-zinc-400">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 sm:space-y-4">
          {error && (
            <Alert className="bg-red-950/50 border-red-900 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-zinc-300">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700"
                disabled={isLoading}
              />
            </div>
            {username && (
              <p className="text-xs text-zinc-500 mt-1">
                Your username will be: @{username}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Password strength indicators */}
            {password && (
              <div className="space-y-2 mt-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                <p className="text-xs font-medium text-zinc-400 mb-2">Password requirements:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasLength ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-zinc-600" />
                    )}
                    <span className={passwordStrength.hasLength ? 'text-green-500' : 'text-zinc-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasUpperCase ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-zinc-600" />
                    )}
                    <span className={passwordStrength.hasUpperCase ? 'text-green-500' : 'text-zinc-500'}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasLowerCase ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-zinc-600" />
                    )}
                    <span className={passwordStrength.hasLowerCase ? 'text-green-500' : 'text-zinc-500'}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasNumber ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-zinc-600" />
                    )}
                    <span className={passwordStrength.hasNumber ? 'text-green-500' : 'text-zinc-500'}>
                      One number
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 mt-0.5 rounded border-zinc-800 bg-zinc-900/50 text-zinc-400 focus:ring-zinc-700 focus:ring-offset-zinc-950"
            />
            <label
              htmlFor="terms"
              className="text-sm text-zinc-400 cursor-pointer leading-tight"
            >
              I agree to the{' '}
              <button type="button" className="text-zinc-300 hover:text-zinc-100 underline">
                Terms of Service
              </button>
              {' '}and{' '}
              <button type="button" className="text-zinc-300 hover:text-zinc-100 underline">
                Privacy Policy
              </button>
            </label>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create account'
            )}
          </Button>
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">Or sign up with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/upcoming")}
              className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/upcoming")}
              variant="outline"
              className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </Button>
          </div>
          
          <p className="text-center text-sm text-zinc-500 pt-2">
            Already have an account?{' '}
            <button
              onClick={() => router.push("/login")}
              type="button"
              className="text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;