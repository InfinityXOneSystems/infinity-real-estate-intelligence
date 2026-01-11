/**
 * Real Estate Lead Generation System - Type Definitions
 * Autonomous distressed property lead generation with investor matching
 */

export interface DistressedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  // Property details
  property_type:
    | 'single_family'
    | 'multi_family'
    | 'condo'
    | 'townhouse'
    | 'land'
    | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;

  // Financial info
  estimated_value?: number;
  listed_price?: number;
  tax_assessment?: number;
  mortgage_balance?: number;
  equity?: number;

  // Distress indicators
  distress_type: DistressType[];
  distress_score: number; // 0-100 (higher = more likely to sell)
  urgency_level: 'low' | 'medium' | 'high' | 'critical';

  // Owner information
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  owner_age?: number;

  // Distress signals
  foreclosure_status?: 'pre_foreclosure' | 'auction' | 'bank_owned' | 'none';
  foreclosure_date?: string;
  tax_lien?: boolean;
  tax_lien_amount?: number;
  days_on_market?: number;
  price_reductions?: number;
  last_sale_date?: string;
  last_sale_price?: number;

  // Social signals
  social_distress_indicators: SocialDistressIndicator[];
  social_media_presence?: SocialMediaProfile;

  // Metadata
  source: string;
  source_url?: string;
  scraped_at: string;
  last_updated: string;

  // Lead status
  lead_status:
    | 'new'
    | 'contacted'
    | 'interested'
    | 'negotiating'
    | 'closed'
    | 'lost';
  contact_attempts: number;
  last_contact?: string;
  notes?: string[];
}

export type DistressType =
  | 'foreclosure'
  | 'pre_foreclosure'
  | 'tax_lien'
  | 'divorce'
  | 'probate'
  | 'bankruptcy'
  | 'job_loss'
  | 'relocation'
  | 'medical_emergency'
  | 'hoarder'
  | 'fire_damage'
  | 'water_damage'
  | 'code_violations'
  | 'vacant'
  | 'inherited'
  | 'behind_on_payments'
  | 'upside_down_mortgage'
  | 'tired_landlord'
  | 'downsizing'
  | 'elderly_care'
  | 'death_in_family'
  | 'military_deployment';

export interface SocialDistressIndicator {
  type:
    | 'job_loss'
    | 'divorce_filing'
    | 'bankruptcy_mention'
    | 'medical_issue'
    | 'relocation_post'
    | 'financial_stress'
    | 'property_complaint'
    | 'moving_sale';
  source: 'facebook' | 'linkedin' | 'twitter' | 'instagram' | 'public_records';
  confidence: number; // 0-1
  detected_at: string;
  evidence?: string;
  url?: string;
}

export interface SocialMediaProfile {
  facebook_profile?: string;
  linkedin_profile?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  recent_posts?: SocialPost[];
}

export interface SocialPost {
  platform: string;
  content: string;
  posted_at: string;
  distress_signals: string[];
  sentiment_score: number; // -1 to 1 (negative = distressed)
}

export interface Investor {
  id: string;
  name: string;
  company?: string;

  // Contact info
  phone: string;
  email: string;
  address?: string;

  // Investment criteria
  buy_criteria: BuyCriteria;
  cash_available: number;
  max_purchase_price: number;
  min_purchase_price?: number;

  // Preferences
  preferred_property_types: string[];
  preferred_locations: PreferredLocation[];
  avoid_locations?: string[];

  // Investment style
  investment_strategy:
    | 'fix_and_flip'
    | 'buy_and_hold'
    | 'wholesale'
    | 'rental'
    | 'development';
  experience_level: 'beginner' | 'intermediate' | 'expert';

  // Track record
  properties_purchased: number;
  average_deal_size?: number;
  last_purchase_date?: string;

  // Status
  active: boolean;
  last_contact?: string;

  // Metadata
  source: string;
  added_at: string;
  last_updated: string;
}

export interface BuyCriteria {
  max_arv?: number; // After Repair Value
  min_equity_percentage?: number;
  max_repair_cost?: number;
  must_be_vacant?: boolean;
  accepts_liens?: boolean;
  closing_timeline_days?: number;
}

export interface PreferredLocation {
  city?: string;
  state?: string;
  zip_codes?: string[];
  counties?: string[];
  radius_miles?: number;
  center_point?: { lat: number; lon: number };
}

export interface PropertyInvestorMatch {
  property_id: string;
  investor_id: string;
  match_score: number; // 0-100
  match_reasons: string[];
  property: DistressedProperty;
  investor: Investor;
  created_at: string;
  status: 'pending' | 'sent' | 'viewed' | 'interested' | 'passed' | 'deal_made';
}

export interface LeadScoringFactors {
  // Financial pressure (0-40 points)
  foreclosure_status: number; // 0-15
  tax_liens: number; // 0-10
  mortgage_status: number; // 0-10
  days_on_market: number; // 0-5

  // Life events (0-30 points)
  divorce: number; // 0-10
  job_loss: number; // 0-10
  medical_emergency: number; // 0-5
  death_in_family: number; // 0-5

  // Property condition (0-15 points)
  deferred_maintenance: number; // 0-5
  code_violations: number; // 0-5
  vacancy: number; // 0-5

  // Social signals (0-15 points)
  social_distress_indicators: number; // 0-10
  recent_negative_posts: number; // 0-5

  total_score: number; // 0-100
  urgency_multiplier: number; // 1.0-2.0
  final_score: number; // total_score * urgency_multiplier
}

export interface DistressSeeds {
  // Life event keywords
  life_events: string[];

  // Financial keywords
  financial_distress: string[];

  // Property keywords
  property_issues: string[];

  // Legal keywords
  legal_events: string[];

  // Social media patterns
  social_patterns: string[];

  // Public record indicators
  public_records: string[];
}

export interface CrawlerConfig {
  sources: CrawlerSource[];
  crawl_interval_hours: number;
  max_concurrent_requests: number;
  rate_limit_per_minute: number;
  user_agent: string;
  proxy_enabled: boolean;
}

export interface CrawlerSource {
  name: string;
  type: 'real_estate' | 'public_records' | 'social_media' | 'investor_network';
  url: string;
  enabled: boolean;
  requires_auth: boolean;
  rate_limit?: number;
  selectors?: Record<string, string>;
}

export interface DailyReport {
  date: string;

  // New leads
  new_properties: number;
  new_investors: number;
  new_matches: number;

  // Lead quality
  high_urgency_leads: number;
  medium_urgency_leads: number;
  low_urgency_leads: number;
  average_distress_score: number;

  // Top leads
  top_10_leads: DistressedProperty[];

  // Investor matches
  properties_matched: number;
  investors_notified: number;

  // Outreach
  emails_sent: number;
  calls_scheduled: number;
  contact_success_rate: number;

  // Sources
  sources_crawled: string[];
  total_pages_scraped: number;

  // System health
  crawl_errors: number;
  api_errors: number;
  uptime_percentage: number;
}

export interface AISchedulerConfig {
  voice_provider: 'twilio' | 'bland_ai' | 'eleven_labs';
  email_provider: 'sendgrid' | 'mailgun' | 'smtp';
  crm_provider: 'google_sheets' | 'hubspot' | 'salesforce';

  // AI behavior
  voice_personality: string;
  email_template: string;
  follow_up_intervals_days: number[];
  max_contact_attempts: number;

  // Scheduling
  business_hours_start: string; // "09:00"
  business_hours_end: string; // "17:00"
  timezone: string;
  blackout_dates: string[];
}

export interface ContactAttempt {
  property_id: string;
  attempt_number: number;
  method: 'phone' | 'email' | 'sms' | 'letter';
  timestamp: string;

  // For calls
  call_duration_seconds?: number;
  call_recording_url?: string;
  call_transcript?: string;
  call_sentiment?: number;

  // For emails
  email_opened?: boolean;
  email_clicked?: boolean;
  email_replied?: boolean;

  // Outcome
  contact_reached: boolean;
  interest_level?: 'none' | 'low' | 'medium' | 'high';
  appointment_scheduled?: boolean;
  appointment_time?: string;
  next_action?: string;
  notes?: string;
}

export interface CRMExport {
  property: DistressedProperty;
  scoring: LeadScoringFactors;
  matched_investors: Investor[];
  contact_history: ContactAttempt[];
  next_action: string;
  priority: number;
  export_timestamp: string;
}
