// ═══════════════════════════════════════════════════════════════════════════════
// GRACE-X OSINT™ SOURCES - Safe Data Sources Registry
// © Zac Crockett - White-hat OSINT only - Ethical · Legal · Professional
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file defines SAFE, PUBLIC data sources for OSINT research.
// All sources must be:
// ✅ Publicly accessible
// ✅ Legal to use
// ✅ No scraping behind logins
// ✅ Link-out only (user manually visits)
//
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // OSINT SOURCES REGISTRY
  // ═══════════════════════════════════════════════════════════════════════════

  const OSINTSources = {

    // ═════════════════════════════════════════════════════════════════════════
    // PERSON OSINT SOURCES
    // ═════════════════════════════════════════════════════════════════════════

    person: {
      general: [
        {
          id: 'google',
          name: 'Google Search',
          url: 'https://www.google.com/search?q={query}',
          description: 'General web search',
          category: 'search',
          icon: '🔍'
        },
        {
          id: 'duckduckgo',
          name: 'DuckDuckGo',
          url: 'https://duckduckgo.com/?q={query}',
          description: 'Privacy-focused search',
          category: 'search',
          icon: '🦆'
        }
      ],
      
      social: [
        {
          id: 'linkedin',
          name: 'LinkedIn',
          url: 'https://www.linkedin.com/search/results/all/?keywords={query}',
          description: 'Professional network (public profiles)',
          category: 'professional',
          icon: '💼',
          note: 'Public profiles only'
        },
        {
          id: 'twitter',
          name: 'Twitter/X',
          url: 'https://twitter.com/search?q={query}',
          description: 'Social media search',
          category: 'social',
          icon: '🐦'
        },
        {
          id: 'facebook',
          name: 'Facebook',
          url: 'https://www.facebook.com/search/top?q={query}',
          description: 'Social network (public only)',
          category: 'social',
          icon: '📘',
          note: 'Public profiles only'
        },
        {
          id: 'instagram',
          name: 'Instagram',
          url: 'https://www.instagram.com/{query}/',
          description: 'Photo-sharing platform',
          category: 'social',
          icon: '📷',
          note: 'Direct username access only'
        },
        {
          id: 'reddit',
          name: 'Reddit',
          url: 'https://www.reddit.com/search/?q={query}',
          description: 'Reddit user/content search',
          category: 'social',
          icon: '🔴'
        },
        {
          id: 'tiktok',
          name: 'TikTok',
          url: 'https://www.tiktok.com/search?q={query}',
          description: 'Video platform search',
          category: 'social',
          icon: '🎵'
        }
      ],
      
      technical: [
        {
          id: 'github',
          name: 'GitHub',
          url: 'https://github.com/search?q={query}',
          description: 'Code repos & developer profiles',
          category: 'technical',
          icon: '💻'
        },
        {
          id: 'gitlab',
          name: 'GitLab',
          url: 'https://gitlab.com/search?search={query}',
          description: 'Alternative code platform',
          category: 'technical',
          icon: '🦊'
        },
        {
          id: 'stackoverflow',
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com/search?q={query}',
          description: 'Developer Q&A',
          category: 'technical',
          icon: '📚'
        }
      ],
      
      breach: [
        {
          id: 'hibp',
          name: 'Have I Been Pwned',
          url: 'https://haveibeenpwned.com/',
          description: 'Email breach database',
          category: 'breach',
          icon: '🔐',
          note: 'Manual email entry required'
        },
        {
          id: 'dehashed_info',
          name: 'DeHashed (Info)',
          url: 'https://dehashed.com/',
          description: 'Breach search (requires account)',
          category: 'breach',
          icon: '🔓',
          note: 'Account required for searches'
        }
      ],
      
      username: [
        {
          id: 'namechk',
          name: 'Namechk',
          url: 'https://namechk.com/',
          description: 'Username availability checker',
          category: 'username',
          icon: '📛',
          note: 'Manual username entry'
        },
        {
          id: 'knowem',
          name: 'KnowEm',
          url: 'https://knowem.com/',
          description: 'Social media username search',
          category: 'username',
          icon: '🔎'
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // COMPANY OSINT SOURCES
    // ═════════════════════════════════════════════════════════════════════════

    company: {
      registries: [
        {
          id: 'companies_house_uk',
          name: 'Companies House (UK)',
          url: 'https://find-and-update.company-information.service.gov.uk/search?q={query}',
          description: 'UK company registry',
          category: 'registry',
          icon: '🇬🇧',
          region: 'UK'
        },
        {
          id: 'opencorporates',
          name: 'OpenCorporates',
          url: 'https://opencorporates.com/companies?q={query}',
          description: 'Global corporate database',
          category: 'registry',
          icon: '🌍',
          region: 'Global'
        },
        {
          id: 'sec_edgar',
          name: 'SEC EDGAR (US)',
          url: 'https://www.sec.gov/cgi-bin/browse-edgar?company={query}&type=&dateb=&owner=include&count=40&action=getcompany',
          description: 'US SEC filings',
          category: 'registry',
          icon: '🇺🇸',
          region: 'US'
        }
      ],
      
      business: [
        {
          id: 'linkedin_company',
          name: 'LinkedIn Companies',
          url: 'https://www.linkedin.com/search/results/companies/?keywords={query}',
          description: 'Company profiles',
          category: 'professional',
          icon: '💼'
        },
        {
          id: 'crunchbase',
          name: 'Crunchbase',
          url: 'https://www.crunchbase.com/textsearch?q={query}',
          description: 'Startup & funding info',
          category: 'business',
          icon: '💰'
        },
        {
          id: 'glassdoor',
          name: 'Glassdoor',
          url: 'https://www.glassdoor.com/Search/results.htm?keyword={query}',
          description: 'Company reviews',
          category: 'employment',
          icon: '🪟'
        }
      ],
      
      news: [
        {
          id: 'google_news',
          name: 'Google News',
          url: 'https://news.google.com/search?q={query}',
          description: 'Recent news',
          category: 'news',
          icon: '📰'
        },
        {
          id: 'reuters',
          name: 'Reuters',
          url: 'https://www.reuters.com/site-search/?query={query}',
          description: 'Business news',
          category: 'news',
          icon: '📊'
        }
      ],
      
      financial: [
        {
          id: 'bloomberg',
          name: 'Bloomberg',
          url: 'https://www.bloomberg.com/search?query={query}',
          description: 'Financial news & data',
          category: 'financial',
          icon: '📈'
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // DOMAIN/IP OSINT SOURCES
    // ═════════════════════════════════════════════════════════════════════════

    domain: {
      registration: [
        {
          id: 'whois',
          name: 'WHOIS Lookup',
          url: 'https://who.is/whois/{query}',
          description: 'Domain registration info',
          category: 'registration',
          icon: '📋'
        },
        {
          id: 'icann',
          name: 'ICANN Lookup',
          url: 'https://lookup.icann.org/en/lookup?name={query}',
          description: 'Official ICANN WHOIS',
          category: 'registration',
          icon: '🌐'
        }
      ],
      
      dns: [
        {
          id: 'mxtoolbox',
          name: 'MXToolbox',
          url: 'https://mxtoolbox.com/SuperTool.aspx?action=dns%3a{query}&run=toolpage',
          description: 'DNS records lookup',
          category: 'dns',
          icon: '🔧'
        },
        {
          id: 'dnsdumpster',
          name: 'DNSDumpster',
          url: 'https://dnsdumpster.com/',
          description: 'DNS recon & research',
          category: 'dns',
          icon: '🗃️',
          note: 'Manual domain entry'
        },
        {
          id: 'securitytrails',
          name: 'SecurityTrails',
          url: 'https://securitytrails.com/domain/{query}/dns',
          description: 'DNS history & records',
          category: 'dns',
          icon: '🛤️'
        }
      ],
      
      security: [
        {
          id: 'ssllabs',
          name: 'SSL Labs',
          url: 'https://www.ssllabs.com/ssltest/analyze.html?d={query}',
          description: 'SSL/TLS analysis',
          category: 'security',
          icon: '🔒'
        },
        {
          id: 'virustotal',
          name: 'VirusTotal',
          url: 'https://www.virustotal.com/gui/domain/{query}',
          description: 'Security reputation',
          category: 'security',
          icon: '🛡️'
        },
        {
          id: 'urlscan',
          name: 'URLScan.io',
          url: 'https://urlscan.io/search/#domain:{query}',
          description: 'URL/domain scanning',
          category: 'security',
          icon: '📡'
        }
      ],
      
      infrastructure: [
        {
          id: 'shodan',
          name: 'Shodan',
          url: 'https://www.shodan.io/search?query={query}',
          description: 'Internet device search',
          category: 'infrastructure',
          icon: '👁️',
          note: 'Account for full access'
        },
        {
          id: 'censys',
          name: 'Censys',
          url: 'https://search.censys.io/search?resource=hosts&q={query}',
          description: 'Internet asset search',
          category: 'infrastructure',
          icon: '🔬'
        }
      ],
      
      history: [
        {
          id: 'wayback',
          name: 'Wayback Machine',
          url: 'https://web.archive.org/web/*/{query}',
          description: 'Historical snapshots',
          category: 'history',
          icon: '⏰'
        }
      ],
      
      technical: [
        {
          id: 'builtwith',
          name: 'BuiltWith',
          url: 'https://builtwith.com/{query}',
          description: 'Technology stack',
          category: 'technical',
          icon: '🏗️'
        },
        {
          id: 'wappalyzer',
          name: 'Wappalyzer',
          url: 'https://www.wappalyzer.com/lookup/{query}',
          description: 'Technology detection',
          category: 'technical',
          icon: '⚙️'
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // MEDIA OSINT SOURCES
    // ═════════════════════════════════════════════════════════════════════════

    media: {
      reverse_image: [
        {
          id: 'google_images',
          name: 'Google Images',
          url: 'https://images.google.com/',
          description: 'Reverse image search',
          category: 'reverse_image',
          icon: '🖼️',
          note: 'Drag & drop image'
        },
        {
          id: 'tineye',
          name: 'TinEye',
          url: 'https://tineye.com/',
          description: 'Reverse image search',
          category: 'reverse_image',
          icon: '👁️',
          note: 'Upload image'
        },
        {
          id: 'yandex_images',
          name: 'Yandex Images',
          url: 'https://yandex.com/images/',
          description: 'Often finds unique results',
          category: 'reverse_image',
          icon: '🔴',
          note: 'Upload image'
        },
        {
          id: 'bing_images',
          name: 'Bing Visual Search',
          url: 'https://www.bing.com/visualsearch',
          description: 'Microsoft image search',
          category: 'reverse_image',
          icon: '🔷'
        }
      ],
      
      analysis: [
        {
          id: 'fotoforensics',
          name: 'FotoForensics',
          url: 'https://fotoforensics.com/',
          description: 'Image manipulation analysis',
          category: 'analysis',
          icon: '🔬',
          note: 'Upload image'
        },
        {
          id: 'exifdata',
          name: 'Jeffrey EXIF Viewer',
          url: 'http://exif.regex.info/exif.cgi',
          description: 'Online EXIF viewer',
          category: 'analysis',
          icon: '📊'
        }
      ],
      
      video: [
        {
          id: 'invid',
          name: 'InVID WeVerify',
          url: 'https://www.invid-project.eu/tools-and-services/invid-verification-plugin/',
          description: 'Video verification plugin',
          category: 'video',
          icon: '🎬'
        },
        {
          id: 'youtube_dataviewer',
          name: 'YouTube DataViewer',
          url: 'https://citizenevidence.amnestyusa.org/',
          description: 'Extract YouTube metadata',
          category: 'video',
          icon: '📺'
        }
      ],
      
      deepfake: [
        {
          id: 'deepware',
          name: 'Deepware Scanner',
          url: 'https://scanner.deepware.ai/',
          description: 'Deepfake detection',
          category: 'deepfake',
          icon: '🤖',
          note: 'Upload video'
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // GEOLOCATION SOURCES
    // ═════════════════════════════════════════════════════════════════════════

    geolocation: {
      maps: [
        {
          id: 'google_maps',
          name: 'Google Maps',
          url: 'https://www.google.com/maps/search/{query}',
          description: 'Location search',
          category: 'maps',
          icon: '🗺️'
        },
        {
          id: 'openstreetmap',
          name: 'OpenStreetMap',
          url: 'https://www.openstreetmap.org/search?query={query}',
          description: 'Open source maps',
          category: 'maps',
          icon: '🌍'
        },
        {
          id: 'google_earth',
          name: 'Google Earth',
          url: 'https://earth.google.com/web/search/{query}',
          description: 'Satellite imagery',
          category: 'maps',
          icon: '🌎'
        }
      ],
      
      ip: [
        {
          id: 'ipinfo',
          name: 'IPinfo',
          url: 'https://ipinfo.io/{query}',
          description: 'IP geolocation',
          category: 'ip',
          icon: '📍'
        },
        {
          id: 'iplocation',
          name: 'IP-API',
          url: 'https://ip-api.com/#{query}',
          description: 'IP location lookup',
          category: 'ip',
          icon: '🎯'
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Get all sources for a category
     */
    getSourcesByCategory(mainCategory, subCategory = null) {
      const cat = this[mainCategory];
      if (!cat) return [];
      
      if (subCategory) {
        return cat[subCategory] || [];
      }
      
      // Return all sources in category
      return Object.values(cat).flat();
    },

    /**
     * Build URL with query
     */
    buildUrl(source, query) {
      if (!source || !source.url) return null;
      return source.url.replace('{query}', encodeURIComponent(query));
    },

    /**
     * Get all sources as flat array
     */
    getAllSources() {
      const all = [];
      ['person', 'company', 'domain', 'media', 'geolocation'].forEach(cat => {
        const category = this[cat];
        if (category) {
          Object.keys(category).forEach(subCat => {
            category[subCat].forEach(source => {
              all.push({
                ...source,
                mainCategory: cat,
                subCategory: subCat
              });
            });
          });
        }
      });
      return all;
    },

    /**
     * Search sources by keyword
     */
    searchSources(keyword) {
      const kw = keyword.toLowerCase();
      return this.getAllSources().filter(s => 
        s.name.toLowerCase().includes(kw) ||
        s.description.toLowerCase().includes(kw) ||
        s.category.toLowerCase().includes(kw)
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.OSINTSources = OSINTSources;

  console.log('[GRACEX] OSINT Sources registry loaded');

})();
