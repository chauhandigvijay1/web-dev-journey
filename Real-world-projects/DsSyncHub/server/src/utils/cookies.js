const getAuthCookieOptions = (persistSession = true) => {
  const isProduction = process.env.NODE_ENV === 'production'

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  }

  if (persistSession) {
    cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000
  }

  return cookieOptions
}

module.exports = {
  getAuthCookieOptions,
}
