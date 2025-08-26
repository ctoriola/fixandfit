import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="description" content="Fix and Fit - Making You Fit Again. Professional prosthetics and orthotics services." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Fix and Fit - Making You Fit Again" />
        <meta property="og:description" content="Professional prosthetics and orthotics services with personalized care." />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Fix and Fit - Making You Fit Again" />
        <meta property="twitter:description" content="Professional prosthetics and orthotics services with personalized care." />
        <meta property="twitter:image" content="/og-image.jpg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
