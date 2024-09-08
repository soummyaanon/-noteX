import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiateEmailOTP, createSessionWithEmailOTP, getCurrentUser, updateUserProfile, initiatePhoneAuth, createSessionWithPhoneAuth } from '../../Services/appwrite';
import { useForm } from 'react-hook-form';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { ArrowRight, Mail, Phone, RefreshCw, Lock, User, AtSign, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import AuroraBackground from '../ui/aurora-background';

const countryCodes = [
  { code: '+91', name: 'India' },
  { code: '+1', name: 'USA' },
  { code: '+44', name: 'UK' },
  { code: '+61', name: 'Australia' },
  { code: '+81', name: 'Japan' },
];

export default function AnimatedLogin({ setUser }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const [error, setError] = useState('');
  const [step, setStep] = useState('login');
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [userId, setUserId] = useState('');
  const [securityPhrase, setSecurityPhrase] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(900);
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

  const onSubmitLogin = async (data) => {
    setError('');
    try {
      if (loginMethod === 'email') {
        const result = await initiateEmailOTP(data.email);
        setEmail(data.email);
        setUserId(result.userId);
        setSecurityPhrase(result.phrase || '');
      } else {
        const result = await initiatePhoneAuth(`${countryCode}${data.phoneNumber}`);
        setPhoneNumber(data.phoneNumber);
        setUserId(result.userId);
      }
      setStep('otp');
      setTimeRemaining(900);
      setCanResend(false);
    } catch (error) {
      console.error('Failed to initiate login', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const onSubmitOTP = async (data) => {
    setError('');
    const otp = Object.values(data.otp).join('');
    try {
      if (loginMethod === 'email') {
        await createSessionWithEmailOTP(userId, otp);
      } else {
        await createSessionWithPhoneAuth(userId, otp);
      }
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
    <AuroraBackground>

  
    <div className="relative flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        <Card className="w-[400px] shadow-2xl bg-background/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                noteX
              </CardTitle>
            </motion.div>
            <CardDescription className="text-center">
              {step === 'login' && 'Access your account securely'}
              {step === 'otp' && 'Enter the OTP sent to you'}
              {step === 'profile' && 'Complete your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 'login' && (
                  <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginMethod" className="text-sm font-medium">Login Methods</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={loginMethod === 'email' ? 'default' : 'outline'}
                          onClick={() => setLoginMethod('email')}
                          className="flex-1"
                        >
                          <Mail className="mr-2 h-4 w-4" /> Email
                        </Button>
                        <Button
                          type="button"
                          variant={loginMethod === 'phone' ? 'default' : 'outline'}
                          onClick={() => setLoginMethod('phone')}
                          className="flex-1"
                        >
                          <Phone className="mr-2 h-4 w-4" /> Phone
                        </Button>
                      </div>
                    </div>
                    {loginMethod === 'email' ? (
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="email"
                            placeholder="your.email@example.com"
                            className="pl-10"
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                              }
                            })}
                          />
                        </div>
                        {errors.email && <span className="text-destructive text-sm">{errors.email.message}</span>}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="countryCode" className="text-sm font-medium">Country Code</Label>
                          <select
                            id="countryCode"
                            className="w-full bg-background border border-input rounded-md p-2"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.name} ({country.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="phoneNumber"
                              placeholder="Phone Number"
                              className="pl-10"
                              {...register('phoneNumber', { 
                                required: 'Phone number is required',
                                pattern: {
                                  value: /^\d{10,14}$/,
                                  message: "Invalid phone number"
                                }
                              })}
                            />
                          </div>
                          {errors.phoneNumber && <span className="text-destructive text-sm">{errors.phoneNumber.message}</span>}
                        </div>
                      </>
                    )}
                    <Button className="w-full" type="submit">
                      Send OTP <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
                {step === 'otp' && (
                  <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-4">

                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm font-medium">One-Time Password</Label>
                      <div className="flex justify-between">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <Input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-12 h-12 text-center text-xl"
                            {...register(`otp.${index}`, { required: true })}
                            onChange={(e) => handleOtpChange(index, e)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={otpRefs[index]}
                          />
                        ))}
                      </div>
                      {errors.otp && <span className="text-destructive text-sm">All fields are required</span>}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      {canResend ? (
                        <Button
                          onClick={() => handleSubmit(onSubmitLogin)()}
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
                    <Button className="w-full" type="submit">
                      Verify OTP <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
                {step === 'profile' && (
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Your full name"
                          className="pl-10"
                          {...register('name', { 
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters'
                            }
                          })}
                        />
                      </div>
                      {errors.name && <span className="text-destructive text-sm">{errors.name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="username"
                          placeholder="Choose a username"
                          className="pl-10"
                          {...register('username', { 
                            required: 'Username is required',
                            minLength: {
                              value: 2,
                              message: 'Username must be at least 2 characters'
                            }
                          })}
                        />
                      </div>
                      {errors.username && <span className="text-destructive text-sm">{errors.username.message}</span>}
                    </div>
                    <Button className="w-full" type="submit">
                      Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            <Lock className="inline-block mr-2 h-4 w-4" />
            Powerd By Appwrite
          </CardFooter>
        </Card>
      </motion.div>
    </div>
    </AuroraBackground>
  );
}