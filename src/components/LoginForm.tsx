import React, { useState, useEffect } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'

interface LoginFormProps {
  onLoginSuccess?: (username: string) => void
}

interface AlertState {
  type: 'error' | 'success'
  message: string
}

const WIPRO_MINI_DOTS = [
  '#7ec45f',
  '#355493',
  '#3498b3',
  '#746fa7',
  '#be266a',
  '#f57f2a',
  '#ffcd2e'
]

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUsernameFocused, setIsUsernameFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [alert, setAlert] = useState<AlertState | null>(null)

  useEffect(() => {
    if (!alert) return
    const timer = setTimeout(() => {
      setAlert(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [alert])

  const validate = (): boolean => {
    let isValid = true
    setUsernameError(null)
    setPasswordError(null)

    if (!username.trim()) {
      setUsernameError('Username is required')
      isValid = false
    }

    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      setAlert({
        type: 'error',
        message: 'Invalid Username or Password.'
      })
      return
    }

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 750))

    setIsLoading(false)

    if (username.trim().toLowerCase() !== 'admin' || password !== 'admin123') {
      setAlert({
        type: 'error',
        message: 'Invalid Username or Password.'
      })
      return
    }

    setAlert({
      type: 'success',
      message: 'Login Successful.'
    })

    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess(username)
      }
    }, 700)
  }

  const isUsernameFloating = isUsernameFocused || username.length > 0
  const isPasswordFloating = isPasswordFocused || password.length > 0

  return (
    <>
      {alert && (
        <div className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none max-w-[92vw] w-max">
          {alert.type === 'error' ? (
            <div className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#FFF2F2] border border-[#FFCDD2] shadow-lg text-[#D92534] select-none text-xs sm:text-sm">
              <svg
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D92534] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
              </svg>
              <span className="font-medium tracking-tight">
                {alert.message}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] shadow-lg text-[#16A34A] select-none text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#16A34A] shrink-0" />
              <span className="font-medium tracking-tight">
                {alert.message}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="w-full bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-2xl shadow-black/5 border border-[#EAE7DF]">
        <div className="pb-3.5 mb-4 sm:mb-5 border-b border-[#EAE7DF]/80">
          <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wider text-[#171717] uppercase">
            HAM PRO ASSET MANAGEMENT SYSTEM
          </h2>
          <div className="w-12 h-1 bg-[#F5A23A] rounded-full mt-1.5" />
        </div>

        <div className="mb-7 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
            Login
          </h1>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#666666] leading-relaxed">
            Please enter your credentials to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-7 sm:space-y-8">
          <div>
            <div className="relative">
              <input
                id="username"
                type="text"
                autoComplete="username"
                disabled={isLoading}
                value={username}
                onFocus={() => setIsUsernameFocused(true)}
                onBlur={() => setIsUsernameFocused(false)}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (usernameError) setUsernameError(null)
                  if (alert) setAlert(null)
                }}
                className={`w-full pl-10 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-[#171717] bg-white rounded-xl border transition-all duration-200 outline-none disabled:opacity-60 ${usernameError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : isUsernameFocused
                      ? 'border-[#171717] ring-1 ring-[#171717]'
                      : 'border-[#EAE7DF] hover:border-[#D5D0C6]'
                  }`}
              />

              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${isUsernameFocused ? 'text-[#171717]' : 'text-[#99958D]'
                  }`}
              >
                <User className="w-4.5 h-4.5" />
              </div>

              <label
                htmlFor="username"
                className={`absolute transition-all duration-200 pointer-events-none ${isUsernameFloating
                    ? '-top-2.5 left-3.5 px-1.5 bg-white text-xs font-semibold z-10'
                    : 'top-1/2 -translate-y-1/2 left-10 text-xs sm:text-sm'
                  } ${usernameError
                    ? 'text-rose-500'
                    : isUsernameFocused
                      ? 'text-[#171717]'
                      : isUsernameFloating
                        ? 'text-[#666666]'
                        : 'text-[#99958D]'
                  }`}
              >
                Username
              </label>
            </div>
            {usernameError && (
              <p className="mt-1 text-xs text-rose-500 font-normal pl-1">{usernameError}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError(null)
                  if (alert) setAlert(null)
                }}
                className={`w-full pl-10 pr-11 py-3 sm:py-3.5 text-sm sm:text-base text-[#171717] bg-white rounded-xl border transition-all duration-200 outline-none disabled:opacity-60 ${passwordError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : isPasswordFocused
                      ? 'border-[#171717] ring-1 ring-[#171717]'
                      : 'border-[#EAE7DF] hover:border-[#D5D0C6]'
                  }`}
              />

              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${isPasswordFocused ? 'text-[#171717]' : 'text-[#99958D]'
                  }`}
              >
                <Lock className="w-4.5 h-4.5" />
              </div>

              <label
                htmlFor="password"
                className={`absolute transition-all duration-200 pointer-events-none ${isPasswordFloating
                    ? '-top-2.5 left-3.5 px-1.5 bg-white text-xs font-semibold z-10'
                    : 'top-1/2 -translate-y-1/2 left-10 text-xs sm:text-sm'
                  } ${passwordError
                    ? 'text-rose-500'
                    : isPasswordFocused
                      ? 'text-[#171717]'
                      : isPasswordFloating
                        ? 'text-[#666666]'
                        : 'text-[#99958D]'
                  }`}
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#99958D] hover:text-[#171717] cursor-pointer transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-rose-500 font-normal pl-1">{passwordError}</p>
            )}
          </div>

          <div className="pt-1 sm:pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2.5 py-3 sm:py-3.5 px-5 rounded-xl font-semibold text-sm sm:text-base text-white shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed bg-[#171717] hover:bg-[#292524] active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {WIPRO_MINI_DOTS.map((col, idx) => (
                      <span
                        key={idx}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: col,
                          animationDelay: `${idx * 120}ms`
                        }}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-white">Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
