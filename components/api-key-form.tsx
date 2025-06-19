"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Key, Loader2, Shield, ExternalLink } from "lucide-react"
import { validateApiKey } from "@/app/actions/validate-api-key"

interface ApiKeyFormProps {
  onApiKeyValidated: (apiKey: string) => void
}

export default function ApiKeyForm({ onApiKeyValidated }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("")
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const handleValidateApiKey = useCallback(async (keyToValidate: string) => {
    if (!keyToValidate || typeof keyToValidate !== "string" || !keyToValidate.startsWith("sk-")) {
      setValidationError("Invalid API key format. API keys should start with 'sk-'")
      return
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      const result = await validateApiKey(keyToValidate)

      if (result.valid) {
        setIsValid(true)
        localStorage.setItem("openai_api_key", keyToValidate)
        setSavedApiKey(keyToValidate)
        onApiKeyValidated(keyToValidate)
      } else {
        setValidationError(result.error || "Invalid API key")
        setIsValid(false)
      }
    } catch (error: any) {
      console.error("Error during validation:", error)
      setValidationError(error.message || "Error validating API key. Please try again.")
      setIsValid(false)
    } finally {
      setIsValidating(false)
    }
  }, [onApiKeyValidated])

  // Check for saved API key on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key")
    if (storedApiKey) {
      setSavedApiKey(storedApiKey)
      setApiKey(storedApiKey)
      // Auto-validate the stored key
      handleValidateApiKey(storedApiKey)
    }
  }, [handleValidateApiKey])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey) {
      handleValidateApiKey(apiKey)
    }
  }

  const handleClearApiKey = () => {
    localStorage.removeItem("openai_api_key")
    setSavedApiKey(null)
    setApiKey("")
    setIsValid(false)
  }

  if (isValid) {
    return (
      <Card className="bg-gradient-to-br from-green-500/15 to-emerald-500/10 backdrop-blur-md border-green-400/40 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-green-300 flex items-center text-xl">
            <div className="bg-green-500/20 p-2 rounded-lg mr-3">
              <CheckCircle className="h-6 w-6 text-green-300" />
            </div>
            <div>
              <h3 className="text-green-200 font-bold">API Key Successfully Validated</h3>
              <p className="text-sm text-green-300/80 font-normal mt-1">Ready to start generating games!</p>
            </div>
          </CardTitle>
          <CardDescription className="text-green-200/90 text-base leading-relaxed pt-2">
            Your OpenAI API key has been validated and securely saved for this session. 
            You can now create amazing games with AI assistance.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button 
            variant="outline" 
            onClick={handleClearApiKey} 
            className="border-green-400/50 text-green-200 hover:bg-green-500/20 hover:text-green-100 transition-all duration-200"
          >
            <Key className="h-4 w-4 mr-2" />
            Use Different API Key
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border-purple-400/40 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center text-xl">
          <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
            <Key className="h-6 w-6 text-purple-300" />
          </div>
          <div>
            <h3 className="text-white font-bold">OpenAI API Key Required</h3>
            <p className="text-sm text-purple-200 font-normal mt-1">Connect your API key to start creating</p>
          </div>
        </CardTitle>
        <CardDescription className="text-purple-200/90 text-base leading-relaxed pt-2">
          Enter your OpenAI API key to unlock the full potential of AI-powered game generation. 
          Your key is stored locally and never sent to our servers.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="relative group">
              <Input
                type="password"
                placeholder="sk-proj-... or sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-12 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/60 
                         focus:border-purple-400/60 focus:ring-purple-400/20 text-base py-3
                         transition-all duration-200 group-hover:bg-white/15"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Key className="h-5 w-5 text-purple-300/60" />
              </div>
            </div>
            
            {validationError && (
              <div
                role="alert"
                className="bg-red-500/15 border border-red-400/40 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-medium text-sm">Validation Error</p>
                    <p className="text-red-300/90 text-sm mt-1">{validationError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={!apiKey || isValidating} 
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 
                     text-white py-3 text-base font-medium transition-all duration-200 shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Validating Your Key...
              </>
            ) : (
              <>
                <Shield className="mr-3 h-5 w-5" />
                Validate API Key
              </>
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-stretch space-y-4 pt-2">
        {/* Security Notice */}
        <div className="bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border border-yellow-400/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-500/20 p-1.5 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 text-yellow-300" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-200 text-sm">Security & Privacy</h4>
              <div className="text-xs text-yellow-200/90 space-y-1 leading-relaxed">
                <p>
                  • Your API key is stored locally in your browser and never transmitted to our servers
                </p>
                <p>
                  • This demo uses client-side key handling for educational purposes
                </p>
                <p>
                  • In production apps, always use server-side API calls with environment variables
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Get API Key Link */}
        <div className="text-center">
          <p className="text-sm text-purple-200/80 mb-3">
            Don't have an API key yet?
          </p>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-200 
                     border border-purple-400/30 rounded-lg hover:bg-purple-500/20 hover:text-purple-100 
                     hover:border-purple-400/50 transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Your API Key from OpenAI
          </a>
        </div>
      </CardFooter>
    </Card>
  )
}