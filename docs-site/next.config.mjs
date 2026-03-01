import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
})

export default withNextra({
  // Static export for Vercel deployment
  // Remove 'output: export' if you need server-side features
  reactStrictMode: true,
})
