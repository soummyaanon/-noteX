import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiateEmailOTP, createSessionWithEmailOTP, getCurrentUser, updateUserProfile } from '../../Services/appwrite';
import { useForm } from 'react-hook-form';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { ArrowRight, Mail, RefreshCw } from 'lucide-react';

export default function Login({ setUser }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [error, setError] = useState('');
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [securityPhrase, setSecurityPhrase] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    let timer;
    if (step === 'otp' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0) {
      setCanResend(true);
    }
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const onSubmitEmail = async (data) => {
    setError('');
    try {
      const result = await initiateEmailOTP(data.email);
      setEmail(data.email);
      setUserId(result.userId);
      setSecurityPhrase(result.phrase || '');
      setStep('otp');
      setTimeRemaining(900);
      setCanResend(false);
    } catch (error) {
      console.error('Failed to initiate Email OTP', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const onSubmitOTP = async (data) => {
    setError('');
    const otp = Object.values(data.otp).join('');
    try {
      await createSessionWithEmailOTP(userId, otp);
      const user = await getCurrentUser();
      if (user) {
        if (!user.name) {
          setStep('profile');
        } else {
          setUser(user);
          navigate('/notes');
        }
      } else {
        throw new Error('Failed to fetch user information');
      }
    } catch (error) {
      console.error('Login failed', error);
      setError(error.message || 'Invalid OTP. Please try again.');
    }
  };

  const onSubmitProfile = async (data) => {
    setError('');
    try {
      await updateUserProfile(userId, { name: data.name, username: data.username });
      const user = await getCurrentUser();
      if (user) {
        setUser(user);
        navigate('/notes');
      } else {
        throw new Error('Failed to fetch user information');
      }
    } catch (error) {
      console.error('Profile update failed', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (value.length <= 1) {
      setValue(`otp.${index}`, value);
      if (value.length === 1 && index < 5) {
        otpRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && e.target.value === '') {
      otpRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#0f1117]">
      <Card className="w-[400px] bg-white dark:bg-[#1a1d27] border-0 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            {step === 'profile' ? 'Complete Your Profile' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            {step === 'email' && 'Enter your email to receive an OTP.'}
            {step === 'otp' && 'Enter the OTP sent to your email.'}
            {step === 'profile' && 'Please provide your details to complete your profile.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'email' && (
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    placeholder="your.email@example.com"
                    className="pl-10 bg-white dark:bg-[#252836] border-gray-300 dark:border-[#3a3f4b] text-gray-900 dark:text-white"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                </div>
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit">
                Send OTP <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
          {step === 'otp' && (
            <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-4">
              {securityPhrase && (
                <Alert className="bg-blue-50 dark:bg-[#252836] border-blue-200 dark:border-[#3a3f4b] text-blue-800 dark:text-white">
                  <AlertDescription>Security Phrase: {securityPhrase}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">One-Time Password</Label>
                <div className="flex justify-between">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center bg-white dark:bg-[#252836] border-gray-300 dark:border-[#3a3f4b] text-gray-900 dark:text-white text-xl"
                      {...register(`otp.${index}`, { required: true })}
                      onChange={(e) => handleOtpChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      ref={otpRefs[index]}
                    />
                  ))}
                </div>
                {errors.otp && <span className="text-red-500 text-sm">All fields are required</span>}
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                {canResend ? (
                  <Button
                    onClick={onSubmitEmail}
                    type="button"
                    variant="outline"
                    className="mt-2"
                  >
                    Resend OTP <RefreshCw className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    OTP will expire in {formatTime(timeRemaining)}
                    <br />
                    You can resend the OTP after it expires.
                  </>
                )}
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit">
                Verify OTP <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
          {step === 'profile' && (
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  className="bg-white dark:bg-[#252836] border-gray-300 dark:border-[#3a3f4b] text-gray-900 dark:text-white"
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  className="bg-white dark:bg-[#252836] border-gray-300 dark:border-[#3a3f4b] text-gray-900 dark:text-white"
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: {
                      value: 2,
                      message: 'Username must be at least 2 characters'
                    }
                  })}
                />
                {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit">
                Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
          {error && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500 dark:text-gray-400">
          Protected by state-of-the-art security
        </CardFooter>
      </Card>
    </div>
  );
}