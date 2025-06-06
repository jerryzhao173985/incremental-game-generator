"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Key, Loader2 } from "lucide-react"
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
      <Card className="bg-white/10 backdrop-blur-sm border-green-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-400 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            API Key Validated
          </CardTitle>
          <CardDescription>Your OpenAI API key has been validated and saved for this session.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={handleClearApiKey} className="text-sm">
            Use Different API Key
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white">OpenAI API Key</CardTitle>
        <CardDescription>
          Enter your OpenAI API key to use the game generator. Your key is stored locally and never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 bg-white/5 border-white/10 text-white"
              />
              <Key className="absolute right-3 top-2.5 h-5 w-5 text-white/50" />
            </div>
            {validationError && <p className="text-red-400 text-sm">{validationError}</p>}
          </div>
          <Button type="submit" disabled={!apiKey || isValidating} className="w-full bg-purple-600 hover:bg-purple-700">
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Validate API Key"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20 text-xs text-yellow-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Security Note</p>
            <p>
              This demo uses client-side API key handling for educational purposes. In production, you should use
              environment variables and server-side API calls.
            </p>
          </div>
        </div>
        <p className="text-xs text-purple-200/70">
          Don't have an API key? Get one from{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 hover:text-purple-100 underline"
          >
            OpenAI's platform
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
