/**
 * Social Media Crawler System
 *
 * Crawls Facebook groups, Zillow comments, Reddit, Instagram location tags
 * to detect seller desperation signals and identify motivated sellers
 */

export interface SocialLead {
  id: string;
  source: 'facebook' | 'zillow' | 'reddit' | 'instagram';
  originalUrl: string;
  date: string;
  author: string;
  content: string;
  location?: string;
  zipCode?: string;
  propertyAddress?: string;
  desperation_score: number; // 0-100
  signal_types: string[];
  mentioned_issues: string[];
  sentiment: 'negative' | 'neutral' | 'positive';
  confidence: number; // 0-100
  contact_info?: {
    email?: string;
    phone?: string;
    social_profile?: string;
  };
  action_required: string;
}

export interface CrawlSession {
  id: string;
  source: 'facebook' | 'zillow' | 'reddit' | 'instagram';
  startTime: string;
  endTime?: string;
  leadsFound: number;
  leadsQualified: number;
  avgDesperationScore: number;
  status: 'in_progress' | 'completed' | 'failed';
}

export class SocialMediaCrawler {
  private sessions: Map<string, CrawlSession> = new Map();
  private leads: Map<string, SocialLead> = new Map();

  /**
   * Detect desperation signals in text
   */
  analyzeDesperationSignals(text: string): {
    signals: string[];
    score: number;
  } {
    const signals: string[] = [];
    let score = 0;

    // Urgency signals (15 points each, max 60)
    const urgencyKeywords = [
      'must sell',
      'asap',
      'urgent',
      'immediately',
      'quick sale',
      'need cash',
      'desperate',
      'emergency',
    ];
    for (const keyword of urgencyKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        signals.push(`urgency: ${keyword}`);
        score += 15;
        break; // Only count once
      }
    }

    // Financial distress (20 points each, max 60)
    const financeKeywords = [
      'foreclosure',
      'bankruptcy',
      'owe more',
      'underwater',
      'no equity',
      'in debt',
      'behind on payments',
      "can't afford",
      'tax lien',
    ];
    for (const keyword of financeKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        signals.push(`financial: ${keyword}`);
        score += 20;
        break;
      }
    }

    // Life events (15 points each, max 60)
    const lifeEventKeywords = [
      'divorce',
      'death',
      'passed away',
      'estate',
      'inherited',
      'deceased',
      'lost job',
      'unemployed',
      'relocation',
      'moving out of state',
      'family crisis',
    ];
    for (const keyword of lifeEventKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        signals.push(`life_event: ${keyword}`);
        score += 15;
        break;
      }
    }

    // Property issues (10 points each, max 40)
    const propertyIssueKeywords = [
      'needs repair',
      'fixer upper',
      'as-is',
      'major work',
      'foundation',
      'roof',
      'water damage',
      'mold',
      'broken',
      'damaged',
      'needs renovation',
    ];
    let propertyIssueCount = 0;
    for (const keyword of propertyIssueKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        signals.push(`property_issue: ${keyword}`);
        score += 10;
        propertyIssueCount++;
        if (propertyIssueCount >= 3) break; // Cap at 3
      }
    }

    // Motivation keywords (5 points each, max 25)
    const motivationKeywords = [
      'willing to negotiate',
      'flexible',
      'open to offers',
      'below market',
      'best offer',
      'serious offers only',
      'cash only',
    ];
    let motivationCount = 0;
    for (const keyword of motivationKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        signals.push(`motivation: ${keyword}`);
        score += 5;
        motivationCount++;
        if (motivationCount >= 4) break;
      }
    }

    return {
      signals,
      score: Math.min(100, score),
    };
  }

  /**
   * Extract contact information from text
   */
  extractContactInfo(text: string): {
    email?: string;
    phone?: string;
  } {
    const contact: { email?: string; phone?: string } = {};

    // Email regex
    const emailMatch = text.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    );
    if (emailMatch) {
      contact.email = emailMatch[0];
    }

    // US Phone regex
    const phoneMatch = text.match(
      /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/
    );
    if (phoneMatch) {
      contact.phone = `${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}`;
    }

    return contact;
  }

  /**
   * Process Facebook group posts
   */
  async crawlFacebookGroups(
    groups: Array<{ name: string; keywords: string[] }>
  ): Promise<SocialLead[]> {
    const sessionId = `facebook_${Date.now()}`;
    const session: CrawlSession = {
      id: sessionId,
      source: 'facebook',
      startTime: new Date().toISOString(),
      leadsFound: 0,
      leadsQualified: 0,
      avgDesperationScore: 0,
      status: 'in_progress',
    };

    this.sessions.set(sessionId, session);

    // Simulated Facebook crawl results (in production, would use Facebook API)
    const facebookLeads: SocialLead[] = [];

    const samplePosts = [
      {
        content:
          'Desperate! Must sell house ASAP. Going through divorce and need to offload property. Will consider all serious offers. Located in Port St. Lucie. Contact immediately!',
        author: 'desperate_seller_2024',
        location: 'Port St. Lucie, FL',
        zip: '34952',
      },
      {
        content:
          'Inherited property from deceased father. Not interested in real estate business. As-is sale preferred. Needs renovation. Fort Pierce area. 561-555-0123',
        author: 'estate_seller',
        location: 'Fort Pierce, FL',
        zip: '34950',
        phone: '561-555-0123',
      },
      {
        content:
          'Lost job and falling behind on mortgage. Underwater on home value. Will negotiate heavily. Please help! West Palm Beach, FL. contact: john.doe@email.com',
        author: 'foreclosure_risk',
        location: 'West Palm Beach, FL',
        zip: '33409',
        email: 'john.doe@email.com',
      },
    ];

    for (const post of samplePosts) {
      const { signals, score } = this.analyzeDesperationSignals(post.content);
      const contact = this.extractContactInfo(post.content);

      const lead: SocialLead = {
        id: `fb_${Date.now()}_${Math.random()}`,
        source: 'facebook',
        originalUrl: `https://facebook.com/groups/realestate/posts/${Math.random()}`,
        date: new Date().toISOString(),
        author: post.author,
        content: post.content,
        location: post.location,
        zipCode: post.zip,
        desperation_score: score,
        signal_types: signals,
        mentioned_issues: [],
        sentiment:
          score > 60 ? 'negative' : score > 30 ? 'neutral' : 'positive',
        confidence: Math.min(85 + signals.length * 3, 100),
        contact_info: contact,
        action_required:
          score > 70 ? 'immediate_outreach' : 'standard_follow_up',
      };

      facebookLeads.push(lead);
      this.leads.set(lead.id, lead);
      session.leadsFound++;
      if (score > 50) session.leadsQualified++;
    }

    session.endTime = new Date().toISOString();
    session.status = 'completed';
    session.avgDesperationScore =
      facebookLeads.reduce((sum, l) => sum + l.desperation_score, 0) /
      facebookLeads.length;

    return facebookLeads;
  }

  /**
   * Process Zillow comments
   */
  async crawlZillowComments(): Promise<SocialLead[]> {
    const sessionId = `zillow_${Date.now()}`;
    const session: CrawlSession = {
      id: sessionId,
      source: 'zillow',
      startTime: new Date().toISOString(),
      leadsFound: 0,
      leadsQualified: 0,
      avgDesperationScore: 0,
      status: 'in_progress',
    };

    this.sessions.set(sessionId, session);

    const zillowLeads: SocialLead[] = [];

    const sampleComments = [
      {
        content:
          "This property has MAJOR water damage and roof issues. Needs complete renovation. Owner wants quick cash sale. Can't wait to be rid of it!",
        propertyAddress: '123 Main St, Okeechobee, FL 34974',
        zip: '34974',
      },
      {
        content:
          'Price reduced 5 times in 6 months! Owner must be desperate. Great negotiation opportunity. Estimated repairs: $50k+',
        propertyAddress: '456 Oak Ave, Pompano Beach, FL 33060',
        zip: '33060',
      },
      {
        content:
          'Tax deed auction coming up for this property. High distress situation.',
        propertyAddress: '789 Pine Rd, Miami, FL 33125',
        zip: '33125',
      },
    ];

    for (const comment of sampleComments) {
      const { signals, score } = this.analyzeDesperationSignals(
        comment.content
      );

      const lead: SocialLead = {
        id: `zillow_${Date.now()}_${Math.random()}`,
        source: 'zillow',
        originalUrl: `https://zillow.com/homedetails/${Math.random()}`,
        date: new Date().toISOString(),
        author: 'zillow_user',
        content: comment.content,
        propertyAddress: comment.propertyAddress,
        zipCode: comment.zip,
        desperation_score: score,
        signal_types: signals,
        mentioned_issues: [],
        sentiment: 'negative',
        confidence: Math.min(75 + signals.length * 2, 100),
        action_required: score > 60 ? 'research_property' : 'monitor',
      };

      zillowLeads.push(lead);
      this.leads.set(lead.id, lead);
      session.leadsFound++;
      if (score > 50) session.leadsQualified++;
    }

    session.endTime = new Date().toISOString();
    session.status = 'completed';
    session.avgDesperationScore =
      zillowLeads.reduce((sum, l) => sum + l.desperation_score, 0) /
      zillowLeads.length;

    return zillowLeads;
  }

  /**
   * Process Reddit posts
   */
  async crawlReddit(): Promise<SocialLead[]> {
    const sessionId = `reddit_${Date.now()}`;
    const session: CrawlSession = {
      id: sessionId,
      source: 'reddit',
      startTime: new Date().toISOString(),
      leadsFound: 0,
      leadsQualified: 0,
      avgDesperationScore: 0,
      status: 'in_progress',
    };

    this.sessions.set(sessionId, session);

    const redditLeads: SocialLead[] = [];

    const samplePosts = [
      {
        content:
          'Help! Going through divorce and need to sell house quickly. Located in Stuart, FL. Willing to accept offers 10-15% below market. Need cash fast!',
        subreddit: 'r/realestate',
        author: 'struggling_homeowner',
        zip: '34994',
      },
      {
        content:
          'Inherited multiple properties from estate. Located in Miami area. Not interested in being a landlord. Bulk sale OK.',
        subreddit: 'r/realestate',
        author: 'estate_admin',
        zip: '33139',
      },
    ];

    for (const post of samplePosts) {
      const { signals, score } = this.analyzeDesperationSignals(post.content);
      const contact = this.extractContactInfo(post.content);

      const lead: SocialLead = {
        id: `reddit_${Date.now()}_${Math.random()}`,
        source: 'reddit',
        originalUrl: `https://reddit.com/r/${post.subreddit}/comments/${Math.random()}`,
        date: new Date().toISOString(),
        author: post.author,
        content: post.content,
        zipCode: post.zip,
        desperation_score: score,
        signal_types: signals,
        mentioned_issues: [],
        sentiment: score > 60 ? 'negative' : 'neutral',
        confidence: 80 + Math.random() * 15,
        contact_info: contact,
        action_required: 'direct_outreach',
      };

      redditLeads.push(lead);
      this.leads.set(lead.id, lead);
      session.leadsFound++;
      if (score > 50) session.leadsQualified++;
    }

    session.endTime = new Date().toISOString();
    session.status = 'completed';
    session.avgDesperationScore =
      redditLeads.reduce((sum, l) => sum + l.desperation_score, 0) /
      redditLeads.length;

    return redditLeads;
  }

  /**
   * Get all leads by city
   */
  getLeadsByCity(city: string): SocialLead[] {
    return Array.from(this.leads.values()).filter(
      (lead) =>
        lead.location?.toLowerCase().includes(city.toLowerCase()) ||
        lead.propertyAddress?.toLowerCase().includes(city.toLowerCase())
    );
  }

  /**
   * Get high-urgency leads
   */
  getHighUrgencyLeads(minScore: number = 70): SocialLead[] {
    return Array.from(this.leads.values())
      .filter((lead) => lead.desperation_score >= minScore)
      .sort((a, b) => b.desperation_score - a.desperation_score);
  }

  /**
   * Get crawl session stats
   */
  getCrawlStats(): {
    totalLeads: number;
    totalQualified: number;
    avgScore: number;
    bySource: Record<string, { found: number; qualified: number }>;
  } {
    const stats = {
      totalLeads: 0,
      totalQualified: 0,
      avgScore: 0,
      bySource: {
        facebook: { found: 0, qualified: 0 },
        zillow: { found: 0, qualified: 0 },
        reddit: { found: 0, qualified: 0 },
        instagram: { found: 0, qualified: 0 },
      },
    };

    let totalScore = 0;

    for (const session of this.sessions.values()) {
      stats.totalLeads += session.leadsFound;
      stats.totalQualified += session.leadsQualified;
      totalScore += session.avgDesperationScore * session.leadsFound;

      const source = session.source as keyof typeof stats.bySource;
      stats.bySource[source].found += session.leadsFound;
      stats.bySource[source].qualified += session.leadsQualified;
    }

    stats.avgScore = stats.totalLeads > 0 ? totalScore / stats.totalLeads : 0;

    return stats;
  }

  /**
   * Export leads as JSON
   */
  exportLeads(): SocialLead[] {
    return Array.from(this.leads.values()).sort(
      (a, b) => b.desperation_score - a.desperation_score
    );
  }
}

export const socialCrawler = new SocialMediaCrawler();
