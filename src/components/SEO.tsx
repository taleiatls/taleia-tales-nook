
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const SEO = ({ 
  title = "TaleiaTLS Novel Reader - Read Web Novels Online",
  description = "Discover and read amazing web novels on TaleiaTLS. Explore fantasy, romance, adventure stories and more in our extensive novel library.",
  keywords = "web novels, online reading, fantasy novels, romance novels, adventure stories, light novels, fiction",
  image = "/lovable-uploads/ff222b8a-1c63-4a30-92ca-ee02bd543023.png",
  url = window.location.href,
  type = "website"
}: SEOProps) => {
  const siteTitle = "TaleiaTLS Novel Reader";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="TaleiaTLS" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#1f2937" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
