import { useEffect } from 'react';
import { useChannel } from '@/lib/channel-context';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  tags?: string[];
}

export function SEO({
  title,
  description,
  image,
  type = 'website',
  publishedTime,
  author,
  tags,
}: SEOProps) {
  const { channel } = useChannel();

  useEffect(() => {
    if (!channel) return;

    // Update document title
    const fullTitle = title 
      ? `${title} | ${channel.name}` 
      : `${channel.name} - ${channel.tagline}`;
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Basic meta tags
    const metaDescription = description || channel.description;
    updateMetaTag('description', metaDescription, false);
    updateMetaTag('keywords', tags ? tags.join(', ') : channel.keywords.join(', '), false);

    // Open Graph tags
    updateMetaTag('og:title', fullTitle);
    updateMetaTag('og:description', metaDescription);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', channel.name);
    
    if (image) {
      updateMetaTag('og:image', image);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', fullTitle, false);
    updateMetaTag('twitter:description', metaDescription, false);
    
    if (image) {
      updateMetaTag('twitter:image', image, false);
    }

    // Article specific tags - cleanup old tags first
    const oldArticleTags = document.querySelectorAll('meta[property="article:tag"]');
    oldArticleTags.forEach(tag => tag.remove());
    
    const oldPublishedTime = document.querySelector('meta[property="article:published_time"]');
    if (oldPublishedTime && type !== 'article') {
      oldPublishedTime.remove();
    }
    
    const oldAuthor = document.querySelector('meta[property="article:author"]');
    if (oldAuthor && type !== 'article') {
      oldAuthor.remove();
    }

    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime);
      }
      if (author) {
        updateMetaTag('article:author', author);
      }
      if (tags) {
        // Use fragment to batch DOM updates
        const fragment = document.createDocumentFragment();
        tags.forEach(tag => {
          const tagElement = document.createElement('meta');
          tagElement.setAttribute('property', 'article:tag');
          tagElement.content = tag;
          fragment.appendChild(tagElement);
        });
        document.head.appendChild(fragment);
      }
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    // Cleanup function to remove article-specific tags when component unmounts or type changes
    return () => {
      if (type === 'article') {
        const articleTags = document.querySelectorAll('meta[property="article:tag"]');
        articleTags.forEach(tag => tag.remove());
      }
    };

  }, [channel, title, description, image, type, publishedTime, author, tags]);

  return null;
}
