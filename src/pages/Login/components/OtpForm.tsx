import React from 'react'

import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormErrors } from "../models/forms"
import { HandleGoBackFunction } from '../models/functions';
import { BACK_FROM_OTP_FORM } from '../utils/variables'
import { urlBase } from "@/utils/variables"

type Props = {
  otp: string
  setOtp: React.Dispatch<React.SetStateAction<string>>
  email: string
  showOtpForm: boolean | null
  setShowOtpForm: React.Dispatch<React.SetStateAction<boolean | null>>
  setShowIsNotRegisteredForm: React.Dispatch<React.SetStateAction<boolean>>
  setOtpVerified: React.Dispatch<React.SetStateAction<boolean | null>>
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  errors: FormErrors
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  handleGoBack: HandleGoBackFunction
}

export const OtpForm = ({ otp, setOtp, setOtpVerified, email, showOtpForm, setShowOtpForm, setShowIsNotRegisteredForm, errors, setErrors, isLoading, setIsLoading, handleGoBack }: Props) => {


  const handleSubmitOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const newErrors: { otp?: string } = {};

    try {
      const response = await fetch(urlBase + '/users/signup/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        }),
      });

      //const data = await response.json()
      
      setOtp(otp.trim())
      if (!response.ok) {
        newErrors.otp = 'Error'
        throw new Error('Invalid response');
      }


      setIsLoading(false);
      setOtpVerified(true);
      setShowOtpForm(false);
      setShowIsNotRegisteredForm(true);


    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false)
    }

    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;

  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmitOtp} style={{ display: showOtpForm ? 'grid' : 'none' }}>
      <Label className="flex items-center gap-2 justify-between" htmlFor="otp">Enter the code we sent to your email
        {errors.otp && <div className="text-red-500 text-xs">*{errors.otp}</div>}
      </Label>
      <Input
        disabled={isLoading}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        autoFocus={true}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        id="otp"
        type="number"
        placeholder="Code"
        required={true}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Check Code
      </Button>
      <Button disabled={isLoading} type="button" variant="outline" onClick={() => handleGoBack(BACK_FROM_OTP_FORM)}>Go Back</Button>
    </form>
  )
}
