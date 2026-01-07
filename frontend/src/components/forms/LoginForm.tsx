import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  
  // Changed 'email' to 'identifier' to represent Email OR Username
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!identifier || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
        // Determine if input is Email or Username based on "@"
        const isEmail = identifier.includes("@");
        
        // Construct payload dynamically based on your backend controller expectations
        const payload = isEmail 
            ? { email: identifier, password } 
            : { username: identifier, password };

        await login(payload);
        toast.success("Login successfull!")
        router.push('/'); 

    } catch (err: any) {
        toast.error(`Login failed: ${err}`)
        const errorMessage = err.response?.data?.message || "Invalid credentials. Please try again.";
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4">

      <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-950 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent"></div>
      
      <Card className="w-full max-w-md relative z-10 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-1">
                <div className="w-12 h-12 bg-linear-to-br from-zinc-400 to-zinc-600 rounded-full flex items-center justify-center">
                <Image width={100} height={100} src="/assets/login.png" alt='Login' className="w-12 h-12 rounded-full" />
                </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-zinc-100">
                Welcome back
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
                Enter your credentials to access your account
            </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {error && (
                <Alert className="bg-red-950/50 border-red-900 text-red-400">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                )}
                
                <div className="space-y-2">
                <Label htmlFor="identifier" className="text-zinc-300">
                    Email or Username
                </Label>
                <div className="relative">
                    {/* Switch icon based on input content */}
                    {identifier.includes('@') ? (
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    ) : (
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    )}
                   
                    <Input
                    id="identifier"
                    type="text"
                    placeholder="username or user@mimi.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700"
                    disabled={isLoading}
                    />
                </div>
                </div>
                
                <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className=" text-zinc-300">
                    Password
                    </Label>
                    <button
                    type="button"
                    className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                    onClick={() => router.push("/upcoming")}
                    >
                    Forgot password?
                    </button>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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
                </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-6">
                <Button
                type="submit"
                className="cursor-pointer w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold transition-all duration-200"
                disabled={isLoading}
                >
                {isLoading ? (
                    <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                    </div>
                ) : (
                    'Sign in'
                )}
                </Button>
                
                <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer hover:text-zinc-100"
                    disabled={isLoading}
                    onClick={() => router.push("/upcoming")}
                >
                    {/* SVG Icons kept same as provided */}
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
                    variant="outline"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 cursor-pointer hover:bg-zinc-800 hover:text-zinc-100"
                    disabled={isLoading}
                    onClick={() => router.push("/upcoming")}
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    GitHub
                </Button>
                </div>
                
                <p className="text-center text-sm text-zinc-500 pt-2">
                Don't have an account?{' '}
                <Link
                    href="/register"
                    className="text-zinc-300 cursor-pointer hover:text-zinc-100 font-medium transition-colors hover:underline"
                >
                    Sign up
                </Link>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;