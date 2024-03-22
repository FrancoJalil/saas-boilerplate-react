import { useContext, useState, useCallback } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import {
  BACK_FROM_IS_NOT_REGISTERED_FORM,
  BACK_FROM_OTP_FORM,
  BACK_FROM_IS_REGISTERED_FORM,
  BACK_FROM_FORGOT_PASSWORD,
} from "./utils/variables"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ModeToggle } from "../../components/mode-toggle"
import { IsRegisteredForm } from "./components/IsRegisteredForm"
import { IsNotRegisteredForm } from "./components/IsNotRegisteredForm"
import { EmailForm } from "./components/EmailForm"
import { OtpForm } from "./components/OtpForm"
import { FormErrors } from "./models/forms"
import { HandleGoBackFunction } from "./models/functions"
import { AuthContextType } from "@/models/context"

import {
  useGoogleOneTapLogin,
  TokenResponse,
  useGoogleLogin,
  CredentialResponse,
} from "@react-oauth/google"

import { urlBase } from "@/utils/variables"
import { AuthContext } from "@/contexts/AuthContext"
import { ForgotPassword } from "./components/ForgotPassword"

export const Login = () => {
  let { logInWithTokens } = useContext(AuthContext) as AuthContextType

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [email, setEmail] = useState<string>("")
  const [googleCredentials, setGoogleCredentials] = useState<string | null>(null)
  const [otp, setOtp] = useState<string>("")
  const [otpVerified, setOtpVerified] = useState<boolean | null>(null)
  const [showOtpForm, setShowOtpForm] = useState<boolean | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showLoginForm, setShowLoginForm] = useState<boolean>(true)
  const [showIsNotRegisteredForm, setShowIsNotRegisteredForm] =
    useState<boolean>(true)
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState<
    boolean | null
  >(null)

  const googleLogin = useGoogleLogin({
    onSuccess: (credentialResponse) => handleGoogleAuth(credentialResponse),
  })

  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => handleGoogleAuth(credentialResponse),
  })

  const handleGoogleAuth = async (
    userCredential:
      | Omit<TokenResponse, "error" | "error_description" | "error_uri">
      | CredentialResponse
  ) => {
    try {
      const response = await fetch(urlBase + "/users/auth/google/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInfo: userCredential }),
      })
      const data = await response.json()
      if (data.is_new_user === true) {
        setIsRegistered(false)
        setEmail(data.email)
        setShowLoginForm(false)
        setIsLoading(false)
        setGoogleCredentials(data.google_token)
        setOtpVerified(true)
        setShowOtpForm(false)
        setShowIsNotRegisteredForm(true)
        // redirect to isNotRegisteredForm
        return
      } else {
        logInWithTokens(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleGoBack = useCallback<HandleGoBackFunction>((from) => {
    if (from === BACK_FROM_IS_NOT_REGISTERED_FORM && !googleCredentials) {
      setOtpVerified(null)
      setShowOtpForm(true)
    } else if (
      from === BACK_FROM_IS_NOT_REGISTERED_FORM && googleCredentials
    ) {
      setGoogleCredentials(null)
      setOtp("")
      setOtpVerified(null)
      setEmail("")
      setIsRegistered(null)
      setShowLoginForm(true)
    } else if (from === BACK_FROM_OTP_FORM) {
      setOtp("")
      setIsRegistered(null)
      setShowLoginForm(true)
    } else if (from === BACK_FROM_IS_REGISTERED_FORM) {
      setIsRegistered(null)
      setShowLoginForm(true)
    } else if (from === BACK_FROM_FORGOT_PASSWORD) {
      setShowForgotPasswordForm(false)
      setShowLoginForm(true)
      setIsRegistered(null)

    }
    setErrors({})
  }, [otp])

  const handleForgotPassword = () => {
    setShowForgotPasswordForm(true)
    setShowLoginForm(false)
    setIsRegistered(null)

  }

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center text-left">
        <Card className="w-lvw max-w-md min-w-80">
          <CardHeader className="space-y-1 gap-6 justify-between flex">
            <div className="flex justify-between w-full">
              <CardTitle className="justify-between">
                <div className="text-2xl flex items-center justify-normal gap-2">
                  <img
                    className="w-10"
                    src="https://res.cloudinary.com/de49grmxi/image/upload/v1704653058/logo-tweet-x_nesbfm.png"
                    alt=""
                  />
                  <h1>Authenticate</h1>
                </div>
              </CardTitle>
              <ModeToggle />
            </div>

            <CardDescription>
              {isRegistered === true
                ? `Hi again ${email}`
                : isRegistered === false
                  ? `Welcome ${email}`
                  : "Enter your email and continue to [Example Inc]"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid">
              
              <Button variant="outline" onClick={() => googleLogin()}>
                <Icons.google className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <EmailForm
              showLoginForm={showLoginForm}
              setShowLoginForm={setShowLoginForm}
              setShowOtpForm={setShowOtpForm}
              setShowForgotPasswordForm={handleForgotPassword}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              email={email}
              setEmail={setEmail}
              setIsRegistered={setIsRegistered}
              errors={errors}
              setErrors={setErrors}
            />

            {isRegistered === true ? (
              <IsRegisteredForm
                setShowForgotPasswordForm={handleForgotPassword}
                email={email}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setErrors={setErrors}
                errors={errors}
                handleGoBack={handleGoBack}
              />
            ) : isRegistered === false ? (
              <OtpForm
                otp={otp}
                setOtp={setOtp}
                email={email}
                showOtpForm={showOtpForm}
                setShowOtpForm={setShowOtpForm}
                setShowIsNotRegisteredForm={setShowIsNotRegisteredForm}
                setOtpVerified={setOtpVerified}
                setErrors={setErrors}
                errors={errors}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                handleGoBack={handleGoBack}
              />
            ) : null}

            {otpVerified === true ? (
              <IsNotRegisteredForm
                email={email}
                googleCredentials={googleCredentials}
                otp={otp}
                showIsNotRegisteredForm={showIsNotRegisteredForm}
                errors={errors}
                setErrors={setErrors}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                handleGoBack={handleGoBack}
              />
            ) : null}

            {showForgotPasswordForm ? (
              <ForgotPassword
                errors={errors}
                setErrors={setErrors}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                handleGoBack={handleGoBack}
                setShowForgotPasswordForm={handleForgotPassword}
              />
            ) : null}
          </CardContent>

          
        </Card>
      </div>
    </>
  )
}
