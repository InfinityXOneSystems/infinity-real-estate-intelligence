/**
 * Complete Workflow Automation System
 * Email, Calendar, Tasks integration with Gmail API, Google Calendar, SendGrid
 * Personal assistant capabilities for brokers
 */

import { google } from 'googleapis';
import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  attendees?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

interface Task {
  title: string;
  notes?: string;
  due?: Date;
  priority?: 'low' | 'medium' | 'high';
  propertyId?: string;
  assignedTo?: string;
}

interface BrokerAssistantAction {
  type: 'email' | 'calendar' | 'task' | 'followup';
  propertyId: string;
  clientEmail: string;
  context: Record<string, any>;
}

export class WorkflowAutomationSystem {
  private gmail: any;
  private calendar: any;
  private tasks: any;
  private oauth2Client: any;

  constructor() {
    this.initializeGoogleServices();
  }

  /**
   * Initialize Google API services
   */
  private async initializeGoogleServices(): Promise<void> {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set refresh token (from initial OAuth flow)
    if (process.env.GMAIL_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    this.tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Send email via Gmail API (for personal addresses)
   */
  async sendGmailEmail(message: EmailMessage): Promise<string> {
    try {
      const email = [
        `To: ${message.to}`,
        `Subject: ${message.subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        message.html || message.text || '',
      ].join('\n');

      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      });

      console.log(`âœ“ Gmail sent: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('Gmail send failed:', error);
      throw error;
    }
  }

  /**
   * Send email via SendGrid (for marketing/transactional emails)
   */
  async sendMarketingEmail(message: EmailMessage): Promise<string> {
    try {
      const msg = {
        to: message.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@infinityxai.com',
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
        templateId: message.templateId,
        dynamicTemplateData: message.dynamicTemplateData,
      };

      const response = await sgMail.send(msg);
      console.log(`âœ“ SendGrid sent: ${response[0].statusCode}`);
      return response[0].headers['x-message-id'] || 'sent';
    } catch (error) {
      console.error('SendGrid send failed:', error);
      throw error;
    }
  }

  /**
   * Read inbox messages with filters
   */
  async readInbox(options?: {
    maxResults?: number;
    query?: string; // Gmail search query
    unreadOnly?: boolean;
  }): Promise<any[]> {
    try {
      const query = options?.unreadOnly ? 'is:unread' : options?.query || '';

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: options?.maxResults || 10,
        q: query,
      });

      const messages = response.data.messages || [];

      // Fetch full message details
      const fullMessages = await Promise.all(
        messages.map(async (msg: any) => {
          const details = await this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
          });
          return details.data;
        })
      );

      return fullMessages;
    } catch (error) {
      console.error('Failed to read inbox:', error);
      throw error;
    }
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(event: CalendarEvent): Promise<string> {
    try {
      const eventResource = {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'America/New_York',
        },
        attendees: event.attendees?.map((email) => ({ email })),
        reminders: event.reminders || {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventResource,
        sendUpdates: 'all', // Send email invitations
      });

      console.log(`âœ“ Calendar event created: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  /**
   * Get upcoming calendar events
   */
  async getUpcomingEvents(daysAhead: number = 7): Promise<any[]> {
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + daysAhead);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get upcoming events:', error);
      throw error;
    }
  }

  /**
   * Create task
   */
  async createTask(task: Task): Promise<string> {
    try {
      const taskResource = {
        title: task.title,
        notes: task.notes,
        due: task.due?.toISOString(),
      };

      const response = await this.tasks.tasks.insert({
        tasklist: '@default',
        requestBody: taskResource,
      });

      console.log(`âœ“ Task created: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  /**
   * Get all tasks
   */
  async getTasks(options?: { showCompleted?: boolean }): Promise<any[]> {
    try {
      const response = await this.tasks.tasks.list({
        tasklist: '@default',
        showCompleted: options?.showCompleted || false,
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      throw error;
    }
  }

  /**
   * Automated follow-up system
   */
  async sendFollowUpEmail(params: {
    clientEmail: string;
    clientName: string;
    propertyId: string;
    propertyAddress: string;
    daysSinceInquiry: number;
  }): Promise<void> {
    let template: string;
    let subject: string;

    if (params.daysSinceInquiry === 1) {
      subject = `Follow up: ${params.propertyAddress}`;
      template = `
        <p>Hi ${params.clientName},</p>
        <p>Thank you for your interest in ${params.propertyAddress}!</p>
        <p>I wanted to follow up and see if you have any questions or would like to schedule a viewing.</p>
        <p>Best regards,<br/>Your Real Estate Intelligence System</p>
      `;
    } else if (params.daysSinceInquiry === 3) {
      subject = `Still interested in ${params.propertyAddress}?`;
      template = `
        <p>Hi ${params.clientName},</p>
        <p>I noticed you inquired about ${params.propertyAddress} a few days ago.</p>
        <p>Properties are moving fast in this market. Would you like to schedule a tour?</p>
        <p>Best regards,<br/>Your Real Estate Intelligence System</p>
      `;
    } else {
      subject = `New properties similar to ${params.propertyAddress}`;
      template = `
        <p>Hi ${params.clientName},</p>
        <p>While ${params.propertyAddress} is still available, I found some similar properties you might like:</p>
        <p>Would you like to see them?</p>
        <p>Best regards,<br/>Your Real Estate Intelligence System</p>
      `;
    }

    await this.sendMarketingEmail({
      to: params.clientEmail,
      subject,
      html: template,
    });

    console.log(
      `âœ“ Follow-up email sent to ${params.clientEmail} (day ${params.daysSinceInquiry})`
    );
  }

  /**
   * Broker personal assistant - automate routine tasks
   */
  async executeBrokerAssistantAction(
    action: BrokerAssistantAction
  ): Promise<void> {
    switch (action.type) {
      case 'email':
        await this.handleAutomatedEmail(action);
        break;

      case 'calendar':
        await this.handleAutomatedCalendar(action);
        break;

      case 'task':
        await this.handleAutomatedTask(action);
        break;

      case 'followup':
        await this.handleAutomatedFollowup(action);
        break;
    }
  }

  private async handleAutomatedEmail(
    action: BrokerAssistantAction
  ): Promise<void> {
    await this.sendMarketingEmail({
      to: action.clientEmail,
      subject: `Property Update: ${action.propertyId}`,
      html: `<p>Automated update about ${action.propertyId}</p>`,
    });
  }

  private async handleAutomatedCalendar(
    action: BrokerAssistantAction
  ): Promise<void> {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    await this.createCalendarEvent({
      summary: `Property Tour: ${action.propertyId}`,
      description: `Automated tour scheduling`,
      start,
      end,
      attendees: [action.clientEmail],
    });
  }

  private async handleAutomatedTask(
    action: BrokerAssistantAction
  ): Promise<void> {
    await this.createTask({
      title: `Follow up on ${action.propertyId}`,
      notes: `Client: ${action.clientEmail}`,
      priority: 'high',
      propertyId: action.propertyId,
    });
  }

  private async handleAutomatedFollowup(
    action: BrokerAssistantAction
  ): Promise<void> {
    await this.sendFollowUpEmail({
      clientEmail: action.clientEmail,
      clientName: action.context.clientName || 'there',
      propertyId: action.propertyId,
      propertyAddress: action.context.propertyAddress || 'the property',
      daysSinceInquiry: action.context.daysSinceInquiry || 1,
    });
  }

  /**
   * Parse incoming email and extract intent
   */
  async parseIncomingEmail(messageId: string): Promise<{
    intent: 'inquiry' | 'appointment' | 'feedback' | 'complaint' | 'other';
    propertyId?: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    const message = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const subject =
      message.data.payload.headers.find((h: any) => h.name === 'Subject')
        ?.value || '';
    const body = Buffer.from(
      message.data.payload.body?.data || '',
      'base64'
    ).toString();

    // Simple intent detection (enhance with AI)
    let intent: 'inquiry' | 'appointment' | 'feedback' | 'complaint' | 'other' =
      'other';

    if (
      subject.match(/interested|inquiry|information/i) ||
      body.match(/interested|want to know/i)
    ) {
      intent = 'inquiry';
    } else if (
      subject.match(/appointment|schedule|visit/i) ||
      body.match(/schedule|visit|see/i)
    ) {
      intent = 'appointment';
    } else if (subject.match(/feedback|review/i)) {
      intent = 'feedback';
    } else if (subject.match(/complaint|problem|issue/i)) {
      intent = 'complaint';
    }

    // Extract property ID if mentioned
    const propertyMatch = body.match(/property[:\s]+([A-Z0-9-]+)/i);
    const propertyId = propertyMatch ? propertyMatch[1] : undefined;

    // Sentiment analysis
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (body.match(/great|excellent|love|wonderful/i)) {
      sentiment = 'positive';
    } else if (body.match(/bad|terrible|disappointed|unhappy/i)) {
      sentiment = 'negative';
    }

    return { intent, propertyId, sentiment };
  }

  /**
   * Auto-respond to incoming emails based on intent
   */
  async autoRespondToEmail(messageId: string): Promise<void> {
    const { intent, propertyId, sentiment } =
      await this.parseIncomingEmail(messageId);

    const message = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const from =
      message.data.payload.headers.find((h: any) => h.name === 'From')?.value ||
      '';
    const subject =
      message.data.payload.headers.find((h: any) => h.name === 'Subject')
        ?.value || '';

    let response: string;

    switch (intent) {
      case 'inquiry':
        response = `Thank you for your interest${propertyId ? ` in property ${propertyId}` : ''}! I'll get back to you with detailed information shortly.`;
        break;
      case 'appointment':
        response = `I'd be happy to schedule a viewing${propertyId ? ` for property ${propertyId}` : ''}. What time works best for you?`;
        break;
      case 'complaint':
        response = `I'm sorry to hear about your concern. Your feedback is important to us, and I'll make sure this is addressed immediately.`;
        break;
      default:
        response = `Thank you for your message. I'll review it and get back to you soon.`;
    }

    await this.sendGmailEmail({
      to: from,
      subject: `Re: ${subject}`,
      html: `<p>${response}</p>`,
    });

    console.log(`âœ“ Auto-responded to email from ${from} (intent: ${intent})`);
  }
}

export default new WorkflowAutomationSystem();
