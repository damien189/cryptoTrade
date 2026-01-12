"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, User, Loader2 } from "lucide-react"
import { searchUsers } from "@/app/actions/admin"

interface UserResult {
  id: string
  email: string
  name: string | null
  role: string
  balance: number
  createdAt: string
}

interface AdminUserSearchProps {
  onSelectUser: (user: UserResult) => void
}

export function AdminUserSearch({ onSelectUser }: AdminUserSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await searchUsers(searchQuery)
      if (response.users) {
        setResults(response.users)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, performSearch])

  const handleSelectUser = (user: UserResult) => {
    onSelectUser(user)
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Input
            placeholder="Search by email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          
          {isOpen && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
              <ul className="max-h-60 overflow-auto py-1">
                {results.map((user) => (
                  <li key={user.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-3 py-2 h-auto"
                      onClick={() => handleSelectUser(user)}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Balance: ${user.balance.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
