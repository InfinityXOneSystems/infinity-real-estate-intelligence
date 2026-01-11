/**
 * CRAWLER SEED LIST CONFIGURATION
 * Integrates all keyword databases to configure crawler searches
 * Maps keywords to specific search targets and data sources
 */

import { distressKeywords } from './distress-keywords';
import { commercialKeywords } from './commercial-industrial-keywords';
import { investorKeywords } from './investor-keywords';
import { foreclosureAreaDatabase } from './foreclosure-area-database';

export const CrawlerSeedConfiguration = {
  /**
   * GOVERNMENT CRAWLER SEED LIST
   * Targets government foreclosure and lien databases
   */
  governmentCrawler: {
    name: 'Government Data Crawler',
    description:
      'Searches government foreclosure, tax lien, and auction records',

    searchTargets: [
      // Federal Sources
      {
        source: 'HUD - Housing and Urban Development',
        url: 'https://www.hud.gov/',
        searchType: 'API',
        keywords: [
          'foreclosure',
          'property sale',
          'auction',
          'distressed property',
        ],
        refreshRate: 'daily',
        geoTargets: ['all_us'],
      },
      {
        source: 'Federal Reserve - Delinquency Data',
        url: 'https://www.federalreserve.gov/',
        searchType: 'data_download',
        keywords: ['mortgage delinquency', 'foreclosure rate', 'default rate'],
        refreshRate: 'monthly',
        geoTargets: ['all_us'],
      },
      {
        source: 'Census Bureau - Housing Data',
        url: 'https://www.census.gov/',
        searchType: 'data_portal',
        keywords: ['housing', 'population', 'economic'],
        refreshRate: 'annual',
        geoTargets: ['all_us'],
      },

      // State & County Sources
      {
        source: 'County Assessor Records',
        url: 'https://assessor.county-{state}.gov',
        searchType: 'online_search',
        keywords: [
          'property tax',
          'delinquent taxes',
          'tax lien',
          'property value',
        ],
        refreshRate: 'daily',
        geoTargets: ['by_county'],
        notes: 'Search each county individually',
      },
      {
        source: 'County Clerk - Deed Records',
        url: 'https://clerk.county-{state}.gov',
        searchType: 'online_search',
        keywords: [
          'foreclosure notice',
          'notice of default',
          'lis pendens',
          'deed of trust',
        ],
        refreshRate: 'daily',
        geoTargets: ['by_county'],
        notes: 'Search deed/lien recordings',
      },
      {
        source: 'County Court Records',
        url: 'https://court.county-{state}.gov',
        searchType: 'online_search',
        keywords: ['foreclosure', 'judgment', 'lawsuit', 'default'],
        refreshRate: 'weekly',
        geoTargets: ['by_county'],
        notes: 'Search civil court filings',
      },
      {
        source: 'Tax Assessor Foreclosure Sales',
        url: 'https://treasurer.county-{state}.gov',
        searchType: 'auction_list',
        keywords: ['tax foreclosure', 'tax sale', 'delinquent tax'],
        refreshRate: 'weekly',
        geoTargets: ['by_county'],
        notes: 'Search upcoming tax foreclosure auctions',
      },
    ],

    // Keywords to use in all government searches
    distressKeywords: [
      'foreclosure',
      'pre-foreclosure',
      'notice of default',
      'lis pendens',
      'tax lien',
      'judgment',
      'delinquent',
      'default',
      'short sale',
      'auction',
    ],

    // Geographic focus
    primaryTargets: [
      'Florida',
      'California',
      'Texas',
      'New York',
      'Arizona',
      'Nevada',
    ],
  },

  /**
   * SOCIAL MEDIA CRAWLER SEED LIST
   * Targets Facebook, Zillow, Reddit for desperate sellers
   */
  socialMediaCrawler: {
    name: 'Social Media & Marketplace Crawler',
    description:
      'Searches social media and online marketplaces for distressed sellers',

    searchTargets: [
      {
        platform: 'Facebook Marketplace',
        url: 'https://www.facebook.com/marketplace',
        searchType: 'keyword_search',
        keywords: [
          'must sell',
          'ASAP',
          'urgent',
          'foreclosure',
          'short sale',
          'divorce',
          'fixer upper',
          'as-is',
          'need to move',
          'quick sale',
        ],
        searchLocations: ['city', 'county', 'state'],
        refreshRate: 'daily',
        contactMethods: ['messenger', 'phone'],
      },
      {
        platform: 'Facebook Groups',
        url: 'https://www.facebook.com/groups/',
        searchType: 'group_search',
        keywords: [
          'real estate',
          'property',
          'housing',
          'foreclosure',
          'divorce support',
          'bankruptcy help',
          'job loss support',
          'financial hardship',
        ],
        searchLocations: ['city', 'county', 'state'],
        refreshRate: 'daily',
        contactMethods: ['post_comment', 'private_message'],
      },
      {
        platform: 'Zillow - For Sale',
        url: 'https://www.zillow.com/homes/for_sale/',
        searchType: 'listing_search',
        keywords: [
          'distressed',
          'foreclosure',
          'short sale',
          'fixer',
          'FSBO',
          'motivated seller',
        ],
        filters: ['price_reduced', 'days_on_market', 'status'],
        refreshRate: 'daily',
        contactMethods: ['contact_agent', 'make_offer'],
      },
      {
        platform: 'Zillow - Off-Market/FSBO',
        url: 'https://www.zillow.com/fsbo/',
        searchType: 'listing_search',
        keywords: [
          'owner sale',
          'no realtor',
          'direct owner',
          'motivated',
          'urgent',
        ],
        refreshRate: 'daily',
        contactMethods: ['phone', 'email'],
      },
      {
        platform: 'Reddit - Real Estate Subreddits',
        url: 'https://www.reddit.com/r/',
        searchType: 'post_search',
        keywords: [
          'foreclosure',
          'short sale',
          'distressed',
          'divorce',
          'bankruptcy',
          'must sell',
          'forced to sell',
          'losing home',
        ],
        subreddits: [
          'r/realestate',
          'r/personalfinance',
          'r/legaladvice',
          'r/IAmA',
          'r/assistance',
        ],
        refreshRate: 'daily',
        contactMethods: ['private_message'],
      },
      {
        platform: 'Craigslist - Real Estate',
        url: 'https://craigslist.org/',
        searchType: 'posting_search',
        keywords: [
          'foreclosure',
          'FSBO',
          'motivated',
          'urgent sale',
          'must sell',
          'quick',
          'ASAP',
        ],
        sections: ['real estate sale', 'real estate wanted'],
        refreshRate: 'daily',
        contactMethods: ['email', 'phone'],
      },
      {
        platform: 'Instagram Real Estate Hashtags',
        url: 'https://www.instagram.com/',
        searchType: 'hashtag_search',
        keywords: [
          '#foreclosure',
          '#shortsale',
          '#distressedproperty',
          '#mustsel',
          '#realestatedeals',
          '#investmentproperty',
        ],
        refreshRate: 'daily',
        contactMethods: ['direct_message'],
      },
      {
        platform: 'LinkedIn - Real Estate Professionals',
        url: 'https://www.linkedin.com/',
        searchType: 'profile_search',
        keywords: [
          'real estate investor',
          'property investor',
          'landlord',
          'portfolio manager',
          'investment company',
        ],
        refreshRate: 'weekly',
        contactMethods: ['direct_message', 'connect_request'],
      },
    ],

    // Posts/content keywords
    despiteKeywords: distressKeywords.getAll().slice(0, 50),

    // Geographic targeting
    primaryMarkets: [
      'Port St. Lucie, FL',
      'Stuart, FL',
      'West Palm Beach, FL',
      'Fort Lauderdale, FL',
      'Miami, FL',
      'Tampa, FL',
      'Orlando, FL',
    ],
  },

  /**
   * MARKET DATA & STATISTICS CRAWLER SEED LIST
   * Targets market analysis sites and statistical databases
   */
  marketCrawler: {
    name: 'Market Data & Statistics Crawler',
    description: 'Searches market analysis sites for trends and statistics',

    searchTargets: [
      {
        source: 'Zillow Research',
        url: 'https://www.zillow.com/research/',
        searchType: 'report_download',
        keywords: [
          'foreclosure',
          'market trends',
          'home values',
          'price trends',
          'market report',
        ],
        dataTypes: ['zestimate', 'market indices', 'trends'],
        refreshRate: 'monthly',
        geoTargets: ['all_us', 'metro_area', 'county', 'zip'],
      },
      {
        source: 'Redfin Research',
        url: 'https://www.redfin.com/research/',
        searchType: 'report_download',
        keywords: ['market report', 'trends', 'housing data', 'price trends'],
        dataTypes: ['market data', 'trend analysis'],
        refreshRate: 'monthly',
        geoTargets: ['metro_area', 'city', 'zip'],
      },
      {
        source: 'ATTOM Data Solutions',
        url: 'https://www.attomdata.com/',
        searchType: 'data_api',
        keywords: ['foreclosure', 'property data', 'market analysis'],
        dataTypes: ['foreclosure data', 'property data'],
        refreshRate: 'daily',
        geoTargets: ['all_us'],
      },
      {
        source: 'Black Knight - Market Insights',
        url: 'https://www.blackknight.com/',
        searchType: 'report_download',
        keywords: [
          'mortgage market',
          'delinquency',
          'foreclosure',
          'market insights',
        ],
        dataTypes: ['mortgage data', 'delinquency rates', 'market indices'],
        refreshRate: 'monthly',
        geoTargets: ['national', 'state'],
      },
      {
        source: 'NAR - National Association of Realtors',
        url: 'https://www.nar.realtor/',
        searchType: 'report_download',
        keywords: [
          'market statistics',
          'existing home sales',
          'foreclosure',
          'market data',
        ],
        dataTypes: ['sales data', 'market statistics', 'trends'],
        refreshRate: 'monthly',
        geoTargets: ['national', 'state', 'metro'],
      },
      {
        source: 'Federal Reserve Economic Data (FRED)',
        url: 'https://fred.stlouisfed.org/',
        searchType: 'data_download',
        keywords: ['unemployment', 'housing', 'economic data', 'mortgage'],
        dataTypes: ['economic indicators', 'housing data', 'employment'],
        refreshRate: 'monthly',
        geoTargets: ['state', 'metro'],
      },
      {
        source: 'Census Bureau - Housing',
        url: 'https://www.census.gov/topics/housing.html',
        searchType: 'data_portal',
        keywords: ['housing', 'vacancy', 'homeownership', 'population'],
        dataTypes: ['housing data', 'demographics'],
        refreshRate: 'annual',
        geoTargets: ['all_us'],
      },
      {
        source: 'Case-Shiller Home Price Index',
        url: 'https://www.spglobal.com/spdji/en/indices/',
        searchType: 'data_download',
        keywords: ['home prices', 'price trends', 'appreciation'],
        dataTypes: ['price index', 'trends'],
        refreshRate: 'monthly',
        geoTargets: ['metro_area'],
      },
    ],

    distressIndicators: foreclosureAreaDatabase.distressIndicators,
  },

  /**
   * COMMERCIAL/INDUSTRIAL PROPERTY CRAWLER SEED LIST
   */
  commercialCrawler: {
    name: 'Commercial & Industrial Property Crawler',
    description: 'Searches for distressed commercial and industrial properties',

    searchTargets: [
      {
        platform: 'CoStar',
        url: 'https://www.costar.com/',
        searchType: 'commercial_listing',
        keywords: commercialKeywords.getAll(),
        propertyTypes: [
          'retail',
          'office',
          'industrial',
          'warehouse',
          'hospitality',
          'mixed-use',
        ],
        filters: ['distressed', 'foreclosure', 'liquidation'],
        refreshRate: 'daily',
      },
      {
        platform: 'LoopNet',
        url: 'https://www.loopnet.com/',
        searchType: 'commercial_listing',
        keywords: [
          'commercial',
          'retail',
          'office',
          'industrial',
          'distressed',
          'foreclosure',
        ],
        refreshRate: 'daily',
      },
      {
        platform: 'LinkedIn - Commercial Real Estate',
        url: 'https://www.linkedin.com/',
        searchType: 'profile_search',
        keywords: [
          'commercial real estate',
          'commercial investor',
          'commercial broker',
          'business failure',
          'business closure',
        ],
        refreshRate: 'weekly',
      },
      {
        platform: 'Business For Sale Sites',
        url: 'https://www.bizbuysell.com/',
        searchType: 'listing_search',
        keywords: [
          'business for sale',
          'business closure',
          'liquidation',
          'owner financing',
          'motivated seller',
        ],
        refreshRate: 'daily',
      },
      {
        platform: 'Restaurant/Retail Liquidation',
        url: 'https://www.auction.com/',
        searchType: 'commercial_auction',
        keywords: [
          'restaurant',
          'retail',
          'equipment auction',
          'liquidation sale',
          'going out of business',
        ],
        refreshRate: 'daily',
      },
    ],

    keywords: commercialKeywords.getAll(),
  },

  /**
   * INVESTOR OUTREACH CRAWLER SEED LIST
   */
  investorCrawler: {
    name: 'Investor Database & Outreach Crawler',
    description: 'Identifies and reaches real estate investors',

    searchTargets: [
      {
        platform: 'LinkedIn - Investors',
        url: 'https://www.linkedin.com/',
        searchType: 'profile_search',
        keywords: investorKeywords.getByCategory('investorProfile'),
        filters: ['location', 'industry', 'title'],
        enrichment: ['email', 'phone', 'company'],
        refreshRate: 'weekly',
      },
      {
        platform: 'REIA Meetings & Events',
        url: 'https://www.nationalreia.org/',
        searchType: 'event_search',
        keywords: ['reia', 'real estate investment', 'investor meeting'],
        refreshRate: 'weekly',
      },
      {
        platform: 'Bigger Pockets - Forum',
        url: 'https://www.biggerpockets.com/',
        searchType: 'forum_search',
        keywords: [
          'fix and flip',
          'wholesale',
          'rental',
          'investment property',
        ],
        refreshRate: 'daily',
      },
      {
        platform: 'Connected Investors',
        url: 'https://www.connectedinvestors.com/',
        searchType: 'profile_search',
        keywords: ['investor', 'property investor', 'real estate'],
        geoTargets: ['by_location'],
        refreshRate: 'weekly',
      },
      {
        platform: 'Facebook - Investor Groups',
        url: 'https://www.facebook.com/groups/',
        searchType: 'group_search',
        keywords: [
          'real estate investment',
          'property investment',
          'flipping',
          'wholesaling',
        ],
        refreshRate: 'weekly',
      },
      {
        platform: 'Meetup - Real Estate Groups',
        url: 'https://www.meetup.com/',
        searchType: 'group_search',
        keywords: ['real estate investor', 'property investment', 'reia'],
        geoTargets: ['by_city'],
        refreshRate: 'weekly',
      },
      {
        platform: 'LinkedIn - Real Estate Companies',
        url: 'https://www.linkedin.com/',
        searchType: 'company_search',
        keywords: [
          'real estate investment',
          'investment company',
          'property management',
        ],
        enrichment: ['company_size', 'employees', 'contact_info'],
        refreshRate: 'monthly',
      },
    ],

    investorKeywords: investorKeywords.getAll(),
  },

  /**
   * DISTRESS AREA IDENTIFICATION CRAWLER
   */
  distressAreaCrawler: {
    name: 'Distress Area Identification Crawler',
    description:
      'Identifies geographic areas with high foreclosure and distress',

    searchTargets: [
      ...foreclosureAreaDatabase.governmentSources,
      ...foreclosureAreaDatabase.privateDataProviders,
      ...foreclosureAreaDatabase.marketDataSources,
    ],

    metrics: [
      'foreclosure_rate',
      'delinquency_rate',
      'unemployment_rate',
      'price_decline',
      'tax_delinquency',
      'bankruptcy_filings',
      'divorce_rate',
      'vacancy_rate',
      'population_decline',
    ],

    thresholds: {
      highForeclosure: 1.0, // >1% foreclosure rate
      highDelinquency: 2.0, // >2% delinquency
      highUnemployment: 7.0, // >7%
      highTaxDelinquency: 5.0, // >5%
      significantPriceDrop: -10.0, // >10% decline
    },

    heatmapTools: foreclosureAreaDatabase.heatmapTools,
  },

  /**
   * DIVORCE & FAMILY LAW CRAWLER SEED LIST
   */
  divorceDataCrawler: {
    name: 'Divorce & Family Law Data Crawler',
    description: 'Identifies divorce proceedings and family law activity',

    searchTargets: [
      {
        source: 'County Courthouse Records',
        url: 'https://court.county-{state}.gov',
        searchType: 'online_search',
        keywords: [
          'divorce filing',
          'dissolution of marriage',
          'family court',
          'divorce decree',
          'property division',
        ],
        refreshRate: 'weekly',
        geoTargets: ['by_county'],
      },
      {
        source: 'Divorce Attorney Directories',
        url: 'https://www.avvo.com/',
        searchType: 'profile_search',
        keywords: ['divorce attorney', 'family law attorney'],
        geoTargets: ['by_location'],
        refreshRate: 'weekly',
      },
      {
        source: 'State Bar Referral Services',
        url: 'https://www.bar.org/',
        searchType: 'referral_search',
        keywords: ['family law', 'divorce attorney'],
        refreshRate: 'monthly',
      },
      {
        source: 'Local Support Groups',
        url: 'https://www.supportgroups.com/',
        searchType: 'group_search',
        keywords: ['divorce support', 'divorce recovery'],
        geoTargets: ['by_location'],
        refreshRate: 'monthly',
      },
    ],

    propertyDivisionKeywords: [
      'property division',
      'real property',
      'home equity',
      'forced sale',
      'equitable distribution',
      'community property',
      'marital property',
    ],
  },
};

/**
 * CRAWLER EXECUTION CONFIGURATION
 */
export const CrawlerExecutionConfig = {
  /**
   * EXECUTION SCHEDULE
   */
  schedule: {
    governmentCrawler: {
      frequency: 'daily',
      time: '6:00 AM',
      timezone: 'America/New_York',
      duration: '30-45 minutes',
    },
    socialMediaCrawler: {
      frequency: 'daily',
      time: '12:00 PM',
      timezone: 'America/New_York',
      duration: '45-60 minutes',
    },
    marketCrawler: {
      frequency: 'weekly',
      time: 'Monday 2:00 PM',
      timezone: 'America/New_York',
      duration: '30 minutes',
    },
    commercialCrawler: {
      frequency: 'daily',
      time: '6:00 PM',
      timezone: 'America/New_York',
      duration: '30-45 minutes',
    },
    investorCrawler: {
      frequency: 'weekly',
      time: 'Friday 10:00 AM',
      timezone: 'America/New_York',
      duration: '60 minutes',
    },
    distressAreaCrawler: {
      frequency: 'monthly',
      time: '1st Monday 3:00 PM',
      timezone: 'America/New_York',
      duration: '2-3 hours',
    },
    divorceDataCrawler: {
      frequency: 'weekly',
      time: 'Wednesday 9:00 AM',
      timezone: 'America/New_York',
      duration: '30 minutes',
    },
  },

  /**
   * GEOGRAPHIC TARGETING
   */
  primaryTargets: [
    'Florida',
    'California',
    'Texas',
    'New York',
    'Arizona',
    'Nevada',
  ],

  secondaryTargets: [
    'Illinois',
    'Pennsylvania',
    'Georgia',
    'North Carolina',
    'Ohio',
    'Michigan',
  ],

  /**
   * DATA INTEGRATION
   */
  dataOutputs: {
    googleSheets: {
      spreadsheetId: '1u1USJDfPR5qZSb6-Zs4JyIyDFLLLfZhHKr1KJcFKrgU',
      sheets: {
        properties: 'New Properties',
        investors: 'Investors',
        commercial: 'Commercial Properties',
        divorceLeads: 'Divorce Leads',
        heatmaps: 'Heatmap Data',
      },
    },
    memory: {
      folder: './memory/',
      types: [
        'property_insights',
        'seller_profiles',
        'investor_database',
        'market_trends',
        'distress_areas',
      ],
    },
  },

  /**
   * KEYWORD STATISTICS
   */
  keywordStats: {
    distressKeywords: distressKeywords.getStats(),
    commercialKeywords: commercialKeywords.getStats(),
    investorKeywords: investorKeywords.getStats(),
    foreclosureArea: foreclosureAreaDatabase.getStats(),
  },
};

// Export all crawler configurations
export const crawlerConfigs = {
  government: CrawlerSeedConfiguration.governmentCrawler,
  socialMedia: CrawlerSeedConfiguration.socialMediaCrawler,
  market: CrawlerSeedConfiguration.marketCrawler,
  commercial: CrawlerSeedConfiguration.commercialCrawler,
  investor: CrawlerSeedConfiguration.investorCrawler,
  distressArea: CrawlerSeedConfiguration.distressAreaCrawler,
  divorceData: CrawlerSeedConfiguration.divorceDataCrawler,
};
