import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '/sign-in/',
          '/sign-up/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/sign-in/',
          '/sign-up/',
        ],
      },
    ],
    sitemap: 'https://stockamplify.com/sitemap.xml',
    host: 'https://stockamplify.com',
  }
}
