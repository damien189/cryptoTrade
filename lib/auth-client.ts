import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    // baseURL is inferred from window.location.origin + /api/auth
    baseURL: "http://localhost:3000"
})
