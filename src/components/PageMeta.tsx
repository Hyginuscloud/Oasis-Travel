import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const DEFAULT_SEO_KEYWORDS =
  'travel agency in Dubai, travel consultants Dubai, travel consultancy Dubai, Dubai holiday packages from Nigeria, Dubai honeymoon package, UAE visit guidance, Dubai visa, family visa, freelance visa, work visa, work visa family visa, visit visa change, Dubai Hotel Reservations, Dubai airport taxi pickup, African travel consultants from African countries, Dubai tourism packages, European travel information from Dubai, Dubai relocation information, bedspace rental, accommodation inquiring';

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: string;
  schema?: Record<string, unknown> | null;
}

export function PageMeta({ title, description, keywords, schema }: PageMetaProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;

    const ensureMeta = (attrName: 'name' | 'property', key: string, value: string) => {
      let el = document.querySelector(`meta[${attrName}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    const canonicalUrl = `${window.location.origin}${location.pathname}`;
    const resolvedKeywords = keywords ? `${keywords}, ${DEFAULT_SEO_KEYWORDS}` : DEFAULT_SEO_KEYWORDS;

    ensureMeta('name', 'description', description);
    ensureMeta('name', 'keywords', resolvedKeywords);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:url', canonicalUrl);
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const existingRouteSchema = document.querySelector('script[data-route-jsonld="true"]');
    if (schema) {
      const scriptEl = existingRouteSchema || document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.setAttribute('data-route-jsonld', 'true');
      scriptEl.textContent = JSON.stringify(schema);
      if (!existingRouteSchema) {
        document.head.appendChild(scriptEl);
      }
    } else if (existingRouteSchema) {
      existingRouteSchema.remove();
    }
  }, [title, description, keywords, schema, location.pathname]);

  return null;
}
