// Utility to make authenticated API requests
export async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token')

    const headers: HeadersInit = {
        ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    // Only add Content-Type if there's a body and it's not FormData
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
    }

    return fetch(url, {
        ...options,
        headers
    })
}
