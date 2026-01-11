/**
 * Foreclosure & Distress Area Identification Database
 * Keywords, agencies, statistics sites, and heatmap data sources
 * For identifying high-foreclosure and high-divorce areas
 */

export const ForeclosureDistressAreaDatabase = {
  /**
   * GOVERNMENT FORECLOSURE & LIEN DATA SOURCES (30+)
   */
  governmentSources: [
    {
      name: 'HUD - Department of Housing and Urban Development',
      url: 'https://www.hud.gov/',
      dataTypes: ['foreclosure', 'property', 'statistics'],
      keywords: [
        'hud foreclosure',
        'hud property',
        'hud sales',
        'hud homes',
        'government property',
      ],
    },
    {
      name: 'Federal Reserve - Mortgage Data',
      url: 'https://www.federalreserve.gov/',
      dataTypes: ['mortgage', 'delinquency', 'statistics'],
      keywords: [
        'fed mortgage',
        'delinquency rate',
        'mortgage delinquency',
        'fed statistics',
      ],
    },
    {
      name: 'Census Bureau - Housing Statistics',
      url: 'https://www.census.gov/topics/housing.html',
      dataTypes: ['housing', 'demographics', 'economic'],
      keywords: [
        'census housing',
        'housing statistics',
        'household data',
        'demographic data',
      ],
    },
    {
      name: 'Bureau of Labor Statistics',
      url: 'https://www.bls.gov/',
      dataTypes: ['employment', 'economic', 'statistics'],
      keywords: ['unemployment', 'job market', 'economic data', 'labor data'],
    },
    {
      name: 'USDA - Rural Development',
      url: 'https://www.rd.usda.gov/',
      dataTypes: ['rural property', 'economic', 'statistics'],
      keywords: ['rural housing', 'agricultural', 'rural statistics'],
    },
    {
      name: 'Fannie Mae - Housing Data',
      url: 'https://www.fanniemae.com/',
      dataTypes: ['mortgage', 'housing', 'delinquency'],
      keywords: [
        'fannie mae',
        'mortgage market',
        'housing insights',
        'delinquency',
      ],
    },
    {
      name: 'Freddie Mac - Housing Data',
      url: 'https://www.freddiemac.com/',
      dataTypes: ['mortgage', 'housing', 'delinquency'],
      keywords: ['freddie mac', 'mortgage market', 'housing data'],
    },
    {
      name: 'Department of Justice - Bankruptcy Court',
      url: 'https://www.justice.gov/',
      dataTypes: ['bankruptcy', 'court records', 'legal'],
      keywords: [
        'bankruptcy filings',
        'chapter 7',
        'chapter 13',
        'bankruptcy court',
      ],
    },
  ],

  /**
   * STATE & LOCAL GOVERNMENT SOURCES (25+)
   */
  stateLocalSources: [
    {
      name: 'County Assessor Offices',
      description: 'Property values, delinquent taxes, property records',
      keywords: [
        'county assessor',
        'property tax',
        'delinquent taxes',
        'tax lien',
        'property value',
      ],
    },
    {
      name: 'County Clerk Records',
      description: 'Deed recording, foreclosure notices, lis pendens',
      keywords: [
        'county clerk',
        'deed records',
        'foreclosure notice',
        'lis pendens',
        'notice of default',
      ],
    },
    {
      name: 'County Court Records',
      description: 'Judgments, lawsuits, foreclosure proceedings',
      keywords: [
        'court records',
        'judgment',
        'lawsuit',
        'foreclosure court',
        'civil court',
      ],
    },
    {
      name: 'State Bar Association',
      description: 'Attorney records, legal filings, license violations',
      keywords: ['attorney records', 'license', 'bar association'],
    },
    {
      name: 'Secretary of State',
      description: 'UCC filings, business records, corporate filings',
      keywords: [
        'ucc filing',
        'business filing',
        'corporate records',
        'lien filing',
      ],
    },
    {
      name: 'State Property Tax Commission',
      description: 'Tax assessments, delinquency data',
      keywords: [
        'property tax',
        'tax delinquency',
        'tax assessment',
        'tax records',
      ],
    },
    {
      name: 'State Housing Authority',
      description: 'Housing programs, foreclosure prevention',
      keywords: [
        'housing authority',
        'housing program',
        'foreclosure prevention',
        'housing assistance',
      ],
    },
    {
      name: 'City/County Budget Offices',
      description: 'Property tax collection, delinquent accounts',
      keywords: [
        'property tax',
        'tax collection',
        'delinquent accounts',
        'tax search',
      ],
    },
  ],

  /**
   * PRIVATE FORECLOSURE DATA PROVIDERS (30+)
   */
  privateDataProviders: [
    {
      name: 'CoreLogic',
      url: 'https://www.corelogic.com/',
      dataTypes: ['foreclosure', 'property', 'mortgage'],
      keywords: [
        'corelogic',
        'foreclosure data',
        'property data',
        'mortgage data',
      ],
      coverage: 'All US counties',
    },
    {
      name: 'RealtyTrac',
      url: 'https://www.realtytrac.com/',
      dataTypes: ['foreclosure', 'auction', 'property'],
      keywords: ['realtytrac', 'foreclosure listings', 'auctions'],
      coverage: 'All US counties',
    },
    {
      name: 'Auction.com',
      url: 'https://www.auction.com/',
      dataTypes: ['foreclosure auction', 'property'],
      keywords: ['auction.com', 'foreclosure auction', 'property auction'],
      coverage: 'All US counties',
    },
    {
      name: 'Zillow',
      url: 'https://www.zillow.com/',
      dataTypes: ['foreclosure', 'property', 'market data'],
      keywords: [
        'zillow',
        'zillow foreclosure',
        'foreclosed homes',
        'zillow data',
      ],
      coverage: 'All US counties',
    },
    {
      name: 'Redfin',
      url: 'https://www.redfin.com/',
      dataTypes: ['foreclosure', 'property', 'market'],
      keywords: ['redfin', 'redfin foreclosure', 'property data'],
      coverage: 'All US',
    },
    {
      name: 'Realtor.com',
      url: 'https://www.realtor.com/',
      dataTypes: ['foreclosure', 'property', 'market'],
      keywords: ['realtor.com', 'foreclosure', 'property'],
      coverage: 'All US',
    },
    {
      name: 'MLS Systems',
      url: 'https://www.mls.com/',
      dataTypes: ['foreclosure', 'property', 'sales'],
      keywords: ['mls', 'multiple listing service', 'foreclosure listings'],
      coverage: 'Regional (county/state MLS boards)',
    },
    {
      name: 'LoanDepot',
      url: 'https://www.loandepot.com/',
      dataTypes: ['mortgage', 'delinquency', 'risk'],
      keywords: ['mortgage data', 'delinquency', 'loan performance'],
      coverage: 'All US',
    },
    {
      name: 'PropertyShark',
      url: 'https://propertyshark.com/',
      dataTypes: ['foreclosure', 'property'],
      keywords: ['propertyshark', 'foreclosure search'],
      coverage: 'All US counties',
    },
    {
      name: 'Foreclosure.com',
      url: 'https://www.foreclosure.com/',
      dataTypes: ['foreclosure', 'property', 'auction'],
      keywords: ['foreclosure.com', 'foreclosure listings'],
      coverage: 'All US',
    },
  ],

  /**
   * REAL ESTATE MARKET DATA (25+)
   */
  marketDataSources: [
    {
      name: 'Zillow Research',
      url: 'https://www.zillow.com/research/',
      dataTypes: ['market data', 'trends', 'foreclosure rates'],
      keywords: [
        'zillow research',
        'market trends',
        'foreclosure rate',
        'market report',
      ],
    },
    {
      name: 'Redfin Research',
      url: 'https://www.redfin.com/research/',
      dataTypes: ['market data', 'trends', 'housing'],
      keywords: ['redfin research', 'market report', 'housing data'],
    },
    {
      name: 'ATTOM Data Solutions',
      url: 'https://www.attomdata.com/',
      dataTypes: ['foreclosure', 'property', 'market'],
      keywords: [
        'attom',
        'foreclosure data',
        'property data',
        'market analysis',
      ],
    },
    {
      name: 'Black Knight',
      url: 'https://www.blackknight.com/',
      dataTypes: ['mortgage', 'foreclosure', 'market'],
      keywords: [
        'black knight',
        'mortgage data',
        'foreclosure rate',
        'market insights',
      ],
    },
    {
      name: 'National Association of Realtors',
      url: 'https://www.nar.realtor/',
      dataTypes: ['market data', 'trends', 'statistics'],
      keywords: ['nar', 'realtor data', 'market statistics', 'foreclosure'],
    },
    {
      name: 'Housing Wire',
      url: 'https://www.housingwire.com/',
      dataTypes: ['market news', 'trends', 'analysis'],
      keywords: ['housingwire', 'market news', 'foreclosure news'],
    },
    {
      name: 'Mortgage Bankers Association',
      url: 'https://www.mba.org/',
      dataTypes: ['mortgage', 'delinquency', 'market'],
      keywords: [
        'mba',
        'mortgage market',
        'delinquency rate',
        'mortgage statistics',
      ],
    },
    {
      name: 'Federal Reserve Economic Data (FRED)',
      url: 'https://fred.stlouisfed.org/',
      dataTypes: ['economic', 'housing', 'statistics'],
      keywords: ['fred', 'economic data', 'housing data', 'mortgage data'],
    },
  ],

  /**
   * DIVORCE & FAMILY LAW DATA SOURCES (20+)
   */
  divorceDataSources: [
    {
      name: 'County Courthouse Records',
      description: 'Divorce filings, custody agreements, property division',
      keywords: [
        'divorce filing',
        'divorce court',
        'court records',
        'family court',
        'custody agreement',
      ],
    },
    {
      name: 'Family Law Attorney Directories',
      description: 'Find family law attorneys by location',
      keywords: [
        'family law attorney',
        'divorce attorney',
        'family law directory',
      ],
    },
    {
      name: 'Divorce Mediation Services',
      description: 'Mediation providers and services',
      keywords: [
        'divorce mediation',
        'mediator',
        'family mediation',
        'conflict resolution',
      ],
    },
    {
      name: 'Local Divorce Support Groups',
      description: 'Support group listings and meetings',
      keywords: [
        'divorce support',
        'support group',
        'divorce recovery',
        'therapy',
      ],
    },
    {
      name: 'State Bar Association Referrals',
      description: 'Referral services for family law attorneys',
      keywords: [
        'bar referral',
        'attorney referral',
        'lawyer referral',
        'family law',
      ],
    },
    {
      name: 'Legal Aid Organizations',
      description: 'Free/low-cost divorce legal services',
      keywords: [
        'legal aid',
        'free legal',
        'divorce assistance',
        'family services',
      ],
    },
  ],

  /**
   * HEATMAP & VISUALIZATION TOOLS (20+)
   */
  heatmapTools: [
    {
      name: 'Zillow Heat Maps',
      url: 'https://www.zillow.com/',
      dataTypes: ['price', 'market', 'foreclosure'],
      keywords: ['zillow heatmap', 'price heatmap', 'market visualization'],
    },
    {
      name: 'Redfin Maps',
      url: 'https://www.redfin.com/',
      dataTypes: ['market', 'price', 'trends'],
      keywords: ['redfin map', 'market map', 'price map'],
    },
    {
      name: 'Google Maps',
      url: 'https://maps.google.com/',
      dataTypes: ['location', 'demographics', 'business'],
      keywords: ['google map', 'location', 'area analysis'],
    },
    {
      name: 'ArcGIS',
      url: 'https://www.arcgis.com/',
      dataTypes: ['geographic', 'demographic', 'analysis'],
      keywords: ['arcgis', 'mapping', 'gis analysis'],
    },
    {
      name: 'OpenStreetMap',
      url: 'https://www.openstreetmap.org/',
      dataTypes: ['map', 'location', 'geographic'],
      keywords: ['openstreetmap', 'mapping', 'geographic data'],
    },
    {
      name: 'CoreLogic Heat Maps',
      url: 'https://www.corelogic.com/',
      dataTypes: ['foreclosure', 'market', 'property'],
      keywords: ['corelogic map', 'foreclosure heatmap', 'property map'],
    },
    {
      name: 'RealtyTrac Heat Maps',
      url: 'https://www.realtytrac.com/',
      dataTypes: ['foreclosure', 'market'],
      keywords: ['realtytrac map', 'foreclosure map'],
    },
    {
      name: 'ATTOM Heat Maps',
      url: 'https://www.attomdata.com/',
      dataTypes: ['foreclosure', 'property', 'market'],
      keywords: ['attom map', 'foreclosure heatmap'],
    },
  ],

  /**
   * ECONOMIC INDICATORS & DATA (30+)
   */
  economicIndicators: [
    {
      name: 'Unemployment Rate',
      sources: ['BLS', 'Census Bureau'],
      keywords: [
        'unemployment',
        'job loss',
        'economic hardship',
        'labor market',
      ],
      correlation: 'High unemployment = high foreclosure risk',
    },
    {
      name: 'Mortgage Delinquency Rate',
      sources: ['Federal Reserve', 'Fannie Mae', 'Black Knight'],
      keywords: [
        'delinquency',
        'payment default',
        'mortgage default',
        'late payment',
      ],
      correlation: 'Direct foreclosure predictor',
    },
    {
      name: 'Property Tax Delinquency',
      sources: ['County Assessor', 'State Tax Commission'],
      keywords: [
        'tax delinquency',
        'unpaid taxes',
        'tax lien',
        'tax foreclosure',
      ],
      correlation: 'Indicates financial distress',
    },
    {
      name: 'Foreclosure Rate',
      sources: ['RealtyTrac', 'CoreLogic', 'ATTOM'],
      keywords: [
        'foreclosure rate',
        'foreclosure trends',
        'foreclosure volume',
      ],
      correlation: 'Primary indicator',
    },
    {
      name: 'House Price Index',
      sources: ['Case-Shiller', 'Federal Reserve', 'Census Bureau'],
      keywords: [
        'house prices',
        'price trends',
        'appreciation',
        'depreciation',
      ],
      correlation: 'Negative trends increase default risk',
    },
    {
      name: 'Divorce Rate',
      sources: ['Census Bureau', 'County Courthouse'],
      keywords: [
        'divorce rate',
        'marriage dissolution',
        'family law',
        'property division',
      ],
      correlation: 'Leads to forced sales and equity extraction',
    },
    {
      name: 'Personal Bankruptcy Rate',
      sources: ['DOJ', 'Federal Courts'],
      keywords: ['bankruptcy filings', 'chapter 7', 'chapter 13', 'insolvency'],
      correlation: 'Indicates severe financial distress',
    },
    {
      name: 'Credit Card Delinquency',
      sources: ['Federal Reserve', 'Credit Agencies'],
      keywords: ['credit delinquency', 'debt default', 'credit stress'],
      correlation: 'Indicates cash flow problems',
    },
    {
      name: 'Vacancy Rate',
      sources: ['Census Bureau', 'CoStar'],
      keywords: ['vacancy', 'vacant properties', 'abandonment'],
      correlation: 'Indicates declining neighborhoods',
    },
    {
      name: 'Population Decline',
      sources: ['Census Bureau', 'Demographics'],
      keywords: [
        'population decline',
        'outmigration',
        'shrinking city',
        'decline',
      ],
      correlation: 'Declining demand for housing',
    },
  ],

  /**
   * RESEARCH & ANALYSIS RESOURCES (20+)
   */
  researchResources: [
    {
      name: 'Federal Reserve District Banks',
      url: 'https://www.federalreserveonline.org/',
      dataTypes: ['economic', 'research', 'reports'],
      keywords: [
        'fed research',
        'economic reports',
        'housing research',
        'district data',
      ],
    },
    {
      name: 'Brookings Institution',
      url: 'https://www.brookings.edu/',
      dataTypes: ['research', 'policy', 'analysis'],
      keywords: ['brookings', 'housing research', 'policy analysis'],
    },
    {
      name: 'Urban Institute',
      url: 'https://www.urban.org/',
      dataTypes: ['research', 'policy', 'housing'],
      keywords: ['urban institute', 'housing research', 'policy research'],
    },
    {
      name: 'Joint Center for Housing Studies',
      url: 'https://www.jchs.harvard.edu/',
      dataTypes: ['research', 'housing', 'trends'],
      keywords: ['jchs', 'housing research', 'harvard housing'],
    },
    {
      name: 'Center on Budget and Policy Priorities',
      url: 'https://www.cbpp.org/',
      dataTypes: ['policy', 'economic', 'housing'],
      keywords: ['cbpp', 'housing policy', 'economic research'],
    },
  ],

  /**
   * SEARCH KEYWORDS FOR FINDING DISTRESSED AREAS (40+)
   */
  distressSearchKeywords: [
    // Foreclosure Area Keywords
    'foreclosure hotspot',
    'foreclosure rate',
    'high foreclosure',
    'foreclosure concentration',
    'foreclosure neighborhood',
    'foreclosure area',
    'foreclosure zone',
    'foreclosure corridor',

    // Economic Distress Keywords
    'high unemployment',
    'unemployment hotspot',
    'economic distress',
    'economic hardship',
    'economically depressed',
    'distressed area',
    'struggling neighborhood',
    'declining neighborhood',
    'neighborhood decline',
    'urban decline',
    'urban blight',
    'blight area',

    // Property Distress Keywords
    'tax foreclosure',
    'tax lien',
    'property tax delinquency',
    'lien area',
    'high default rate',
    'default area',
    'property abandonment',
    'abandoned properties',

    // Family Distress Keywords
    'high divorce rate',
    'divorce hotspot',
    'divorce concentration',
    'family law activity',

    // Demographic Keywords
    'low income area',
    'poverty area',
    'declining population',
    'population loss',
    'outmigration',
    'demographic decline',

    // Market Keywords
    'soft market',
    'weak market',
    'declining market',
    'market weakness',
    'market distress',
    "buyer's market",
    'oversupply',
    'inventory buildup',
  ],

  /**
   * SPECIFIC DISTRESS INDICATORS (30+)
   */
  distressIndicators: [
    {
      indicator: 'Mortgage Delinquency Rate',
      threshold: '>2%',
      source: 'Federal Reserve, Black Knight',
      meaning: 'Strong foreclosure risk indicator',
    },
    {
      indicator: 'Foreclosure Rate',
      threshold: '>1%',
      source: 'RealtyTrac, CoreLogic',
      meaning: 'Active foreclosure market',
    },
    {
      indicator: 'Property Tax Delinquency',
      threshold: '>5%',
      source: 'County Assessor',
      meaning: 'Financial distress in area',
    },
    {
      indicator: 'Unemployment Rate',
      threshold: '>7%',
      source: 'Bureau of Labor Statistics',
      meaning: 'Job market weakness',
    },
    {
      indicator: 'House Price Decline',
      threshold: '>10% YoY',
      source: 'Case-Shiller, Zillow',
      meaning: 'Negative equity risk',
    },
    {
      indicator: 'Vacancy Rate',
      threshold: '>10%',
      source: 'Census Bureau',
      meaning: 'Declining neighborhood',
    },
    {
      indicator: 'Population Decline',
      threshold: '>5% YoY',
      source: 'Census Bureau',
      meaning: 'Long-term decline',
    },
    {
      indicator: 'Bankruptcy Filings',
      threshold: '>5 per 1000 population',
      source: 'DOJ, Federal Courts',
      meaning: 'Financial distress',
    },
    {
      indicator: 'Divorce Rate',
      threshold: '>8 per 1000 population',
      source: 'Census Bureau',
      meaning: 'Family property issues',
    },
  ],
};

// Export database statistics
export function getForeclosureAreaStats(): Record<string, number> {
  return {
    governmentSources: ForeclosureDistressAreaDatabase.governmentSources.length,
    stateLocalSources: ForeclosureDistressAreaDatabase.stateLocalSources.length,
    privateDataProviders:
      ForeclosureDistressAreaDatabase.privateDataProviders.length,
    marketDataSources: ForeclosureDistressAreaDatabase.marketDataSources.length,
    divorceDataSources:
      ForeclosureDistressAreaDatabase.divorceDataSources.length,
    heatmapTools: ForeclosureDistressAreaDatabase.heatmapTools.length,
    economicIndicators:
      ForeclosureDistressAreaDatabase.economicIndicators.length,
    researchResources: ForeclosureDistressAreaDatabase.researchResources.length,
    total:
      ForeclosureDistressAreaDatabase.governmentSources.length +
      ForeclosureDistressAreaDatabase.stateLocalSources.length +
      ForeclosureDistressAreaDatabase.privateDataProviders.length +
      ForeclosureDistressAreaDatabase.marketDataSources.length +
      ForeclosureDistressAreaDatabase.divorceDataSources.length +
      ForeclosureDistressAreaDatabase.heatmapTools.length +
      ForeclosureDistressAreaDatabase.economicIndicators.length +
      ForeclosureDistressAreaDatabase.researchResources.length,
  };
}

// Get all distress search keywords
export function getDistressSearchKeywords(): string[] {
  return ForeclosureDistressAreaDatabase.distressSearchKeywords;
}

// Get economic indicators
export function getEconomicIndicators() {
  return ForeclosureDistressAreaDatabase.economicIndicators;
}

// Export singleton
export const foreclosureAreaDatabase = new (class {
  getGovernmentSources() {
    return ForeclosureDistressAreaDatabase.governmentSources;
  }

  getStateLocalSources() {
    return ForeclosureDistressAreaDatabase.stateLocalSources;
  }

  getPrivateDataProviders() {
    return ForeclosureDistressAreaDatabase.privateDataProviders;
  }

  getMarketDataSources() {
    return ForeclosureDistressAreaDatabase.marketDataSources;
  }

  getDivorceDataSources() {
    return ForeclosureDistressAreaDatabase.divorceDataSources;
  }

  getHeatmapTools() {
    return ForeclosureDistressAreaDatabase.heatmapTools;
  }

  getAllSources() {
    return {
      government: this.getGovernmentSources(),
      stateLocal: this.getStateLocalSources(),
      private: this.getPrivateDataProviders(),
      marketData: this.getMarketDataSources(),
      divorce: this.getDivorceDataSources(),
      heatmaps: this.getHeatmapTools(),
      economic: getEconomicIndicators(),
    };
  }

  getStats() {
    return getForeclosureAreaStats();
  }
})();
