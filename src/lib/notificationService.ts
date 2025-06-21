export interface NotificationChannel {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
}

export interface NotificationPreferences {
  bloodRequestConfirmation: NotificationChannel;
  donorMatchFound: NotificationChannel;
  donationReminder: NotificationChannel;
  appointmentReminder: NotificationChannel;
  volunteerWelcome: NotificationChannel;
  partnershipConfirmation: NotificationChannel;
}

export interface NotificationData {
  type: 'blood_request_confirmation' | 'donor_match_found' | 'donation_reminder' | 'appointment_reminder' | 'volunteer_welcome' | 'partnership_confirmation';
  recipient: {
    name: string;
    email?: string;
    phone?: string;
  };
  data: {
    bloodGroup?: string;
    city?: string;
    country?: string;
    hospitalName?: string;
    patientName?: string;
    donorCount?: number;
    appointmentDate?: string;
    appointmentTime?: string;
    daysSinceLastDonation?: number;
    contactNumber?: string;
    urgencyLevel?: string;
    name?: string;
    region?: string;
    motivation?: string;
    organizationName?: string;
    contactName?: string;
    organizationType?: string;
    message?: string;
  };
  urgency: 'low' | 'medium' | 'high';
  channels: NotificationChannel;
}

export interface NotificationLog {
  id: string;
  type: string;
  recipient_email?: string;
  recipient_phone?: string;
  channels_used: string[];
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  data: any;
}

export class NotificationService {
  private isLiveMode: boolean;

  constructor() {
    this.isLiveMode = import.meta.env.VITE_NOTIFICATION_MODE === 'live';
    console.log(`🔔 Notification Service initialized in ${this.isLiveMode ? 'LIVE' : 'DEMO'} mode`);
  }

  /**
   * Send notification through specified channels
   */
  async sendNotification(notification: NotificationData): Promise<boolean> {
    console.log('📤 Sending notification:', notification);

    const results: boolean[] = [];
    const channelsUsed: string[] = [];

    try {
      // Send email notification
      if (notification.channels.email && notification.recipient.email) {
        const emailSent = await this.sendEmailNotification(notification);
        results.push(emailSent);
        if (emailSent) channelsUsed.push('email');
      }

      // Send SMS notification
      if (notification.channels.sms && notification.recipient.phone) {
        const smsSent = await this.sendSMSNotification(notification);
        results.push(smsSent);
        if (smsSent) channelsUsed.push('sms');
      }

      // Send WhatsApp notification
      if (notification.channels.whatsapp && notification.recipient.phone) {
        const whatsappSent = await this.sendWhatsAppNotification(notification);
        results.push(whatsappSent);
        if (whatsappSent) channelsUsed.push('whatsapp');
      }

      // Log notification attempt
      await this.logNotification({
        id: crypto.randomUUID(),
        type: notification.type,
        recipient_email: notification.recipient.email,
        recipient_phone: notification.recipient.phone,
        channels_used: channelsUsed,
        status: results.some(r => r) ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
        data: notification.data
      });

      return results.some(result => result); // Return true if at least one channel succeeded

    } catch (error) {
      console.error('❌ Error sending notification:', error);
      
      // Log failed notification
      await this.logNotification({
        id: crypto.randomUUID(),
        type: notification.type,
        recipient_email: notification.recipient.email,
        recipient_phone: notification.recipient.phone,
        channels_used: [],
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        data: notification.data
      });

      return false;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: NotificationData): Promise<boolean> {
    try {
      const emailContent = this.generateEmailContent(notification);
      
      if (this.isLiveMode) {
        // TODO: Implement real email service (Resend, SendGrid, etc.)
        console.log('📧 Email would be sent via real service:', {
          to: notification.recipient.email,
          subject: emailContent.subject,
          body: emailContent.body
        });
        
        // For now, simulate success
        await new Promise(resolve => setTimeout(resolve, 500));
        return Math.random() > 0.05; // 95% success rate
      } else {
        console.log('📧 Email Demo Mode:', {
          to: notification.recipient.email,
          subject: emailContent.subject,
          body: emailContent.body
        });
        return true;
      }

    } catch (error) {
      console.error('❌ Email notification failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(notification: NotificationData): Promise<boolean> {
    try {
      const smsContent = this.generateSMSContent(notification);
      
      if (!notification.recipient.phone) {
        console.warn('⚠️ No phone number provided for SMS');
        return false;
      }

      // In demo mode, just log the message
      console.log('📱 SMS Demo Mode:', {
        to: notification.recipient.phone,
        message: smsContent
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Simulate 90% success rate
      return Math.random() > 0.1;

    } catch (error) {
      console.error('❌ SMS notification failed:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsAppNotification(notification: NotificationData): Promise<boolean> {
    try {
      const whatsappContent = this.generateWhatsAppContent(notification);
      
      if (!notification.recipient.phone) {
        console.warn('⚠️ No phone number provided for WhatsApp');
        return false;
      }

      // In demo mode, just log the message
      console.log('💬 WhatsApp Demo Mode:', {
        to: notification.recipient.phone,
        message: whatsappContent
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));

      // Simulate 85% success rate
      return Math.random() > 0.15;

    } catch (error) {
      console.error('❌ WhatsApp notification failed:', error);
      return false;
    }
  }

  /**
   * Generate email content based on notification type
   */
  private generateEmailContent(notification: NotificationData): { subject: string; body: string } {
    const { type, recipient, data } = notification;

    switch (type) {
      case 'volunteer_welcome':
        return {
          subject: '🎉 Welcome to BloodLink Volunteer Team!',
          body: `
            <h2>Welcome to the BloodLink Family!</h2>
            <p>Dear ${recipient.name},</p>
            <p>Thank you for joining our volunteer team! Your commitment to helping save lives is truly inspiring.</p>
            <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Your Volunteer Profile:</h3>
              <ul>
                <li><strong>Name:</strong> ${data.name}</li>
                <li><strong>Region:</strong> ${data.region}</li>
                ${data.motivation ? `<li><strong>Motivation:</strong> ${data.motivation}</li>` : ''}
              </ul>
            </div>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>What's Next?</h3>
              <ol>
                <li>Our volunteer coordinator will contact you within 48 hours</li>
                <li>You'll receive training materials and guidelines</li>
                <li>Join our volunteer WhatsApp group for updates</li>
                <li>Start making a difference in your community!</li>
              </ol>
            </div>
            <p>Together, we can save more lives and build stronger communities. Welcome aboard! 🚀</p>
            <p>Best regards,<br>The BloodLink Volunteer Team</p>
          `
        };

      case 'partnership_confirmation':
        return {
          subject: '🤝 Partnership Inquiry Received - BloodLink',
          body: `
            <h2>Thank You for Your Partnership Interest!</h2>
            <p>Dear ${recipient.name},</p>
            <p>We've received your partnership inquiry for <strong>${data.organizationName}</strong> and are excited about the possibility of working together.</p>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Your Inquiry Details:</h3>
              <ul>
                <li><strong>Organization:</strong> ${data.organizationName}</li>
                <li><strong>Type:</strong> ${data.organizationType}</li>
                <li><strong>Contact:</strong> ${data.contactName}</li>
              </ul>
            </div>
            <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Next Steps:</h3>
              <ol>
                <li>Our partnership team will review your inquiry within 24 hours</li>
                <li>We'll schedule a call to discuss collaboration opportunities</li>
                <li>Together, we'll create a partnership plan that saves lives</li>
              </ol>
            </div>
            <p>Thank you for joining our mission to make blood donation more accessible worldwide!</p>
            <p>Best regards,<br>The BloodLink Partnership Team</p>
          `
        };

      case 'blood_request_confirmation':
        return {
          subject: '🩸 Blood Request Confirmed - BloodLink',
          body: `
            <h2>Blood Request Confirmed</h2>
            <p>Dear ${recipient.name},</p>
            <p>Your blood request has been successfully submitted to our global network.</p>
            <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Request Details:</h3>
              <ul>
                <li><strong>Blood Group:</strong> ${data.bloodGroup}</li>
                <li><strong>Patient:</strong> ${data.patientName}</li>
                <li><strong>Hospital:</strong> ${data.hospitalName}</li>
                <li><strong>Location:</strong> ${data.city}, ${data.country}</li>
              </ul>
            </div>
            <p>We're now searching for matching donors in your area. You'll be notified as soon as we find potential matches.</p>
            <p>Stay strong! 💪</p>
            <p>Best regards,<br>The BloodLink Team</p>
          `
        };

      case 'donor_match_found':
        return {
          subject: '🎯 Matching Donors Found - BloodLink',
          body: `
            <h2>Great News! We Found Matching Donors</h2>
            <p>Dear ${recipient.name},</p>
            <p>We've found <strong>${data.donorCount} potential donors</strong> who can help with your blood request!</p>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Next Steps:</h3>
              <ol>
                <li>Log into your BloodLink account to view donor details</li>
                <li>Contact the donors directly using the provided information</li>
                <li>Coordinate with your hospital for the donation process</li>
              </ol>
            </div>
            <p>Time is precious - reach out to the donors as soon as possible!</p>
            <p>Wishing you the best,<br>The BloodLink Team</p>
          `
        };

      case 'donation_reminder':
        return {
          subject: '🩸 You\'re Eligible to Donate Again - BloodLink',
          body: `
            <h2>Ready to Save Another Life?</h2>
            <p>Dear ${recipient.name},</p>
            <p>It's been ${data.daysSinceLastDonation} days since your last donation, which means you're now eligible to donate blood again!</p>
            <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Why Your Donation Matters:</h3>
              <ul>
                <li>Every donation can save up to 3 lives</li>
                <li>Blood cannot be manufactured - it can only come from generous donors like you</li>
                <li>Your ${data.bloodGroup} blood type is always needed</li>
              </ul>
            </div>
            <p>Ready to be someone's hero again? Update your availability in the BloodLink app!</p>
            <p>Thank you for being a lifesaver! 🦸‍♀️</p>
            <p>With gratitude,<br>The BloodLink Team</p>
          `
        };

      case 'appointment_reminder':
        return {
          subject: '📅 Donation Appointment Reminder - BloodLink',
          body: `
            <h2>Appointment Reminder</h2>
            <p>Dear ${recipient.name},</p>
            <p>This is a friendly reminder about your upcoming blood donation appointment.</p>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Appointment Details:</h3>
              <ul>
                <li><strong>Date:</strong> ${data.appointmentDate}</li>
                <li><strong>Time:</strong> ${data.appointmentTime}</li>
                <li><strong>Location:</strong> ${data.hospitalName}, ${data.city}</li>
              </ul>
            </div>
            <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Before You Donate:</h3>
              <ul>
                <li>Eat a healthy meal 2-3 hours before</li>
                <li>Drink plenty of water</li>
                <li>Get a good night's sleep</li>
                <li>Bring a valid ID</li>
              </ul>
            </div>
            <p>Thank you for your commitment to saving lives!</p>
            <p>See you soon,<br>The BloodLink Team</p>
          `
        };

      default:
        return {
          subject: 'BloodLink Notification',
          body: `<p>Dear ${recipient.name},</p><p>You have a new notification from BloodLink.</p>`
        };
    }
  }

  /**
   * Generate SMS content based on notification type
   */
  private generateSMSContent(notification: NotificationData): string {
    const { type, recipient, data } = notification;

    switch (type) {
      case 'volunteer_welcome':
        return `🎉 BloodLink: Welcome to our volunteer team, ${recipient.name}! Your commitment to saving lives is inspiring. Our coordinator will contact you within 48 hours with next steps. Thank you for joining our mission! 💪`;

      case 'partnership_confirmation':
        return `🤝 BloodLink: Thank you for your partnership inquiry, ${data.organizationName}! Our team will contact you within 24 hours to discuss collaboration opportunities. Together, we'll save more lives! 🌟`;

      case 'blood_request_confirmation':
        return `🩸 BloodLink: Your blood request for ${data.bloodGroup} at ${data.hospitalName}, ${data.city} has been confirmed. We're searching for donors now. Stay strong! 💪`;

      case 'donor_match_found':
        return `🎯 BloodLink: Great news ${recipient.name}! We found ${data.donorCount} matching donors for your blood request. Check the app to contact them immediately. Time is precious! ⏰`;

      case 'donation_reminder':
        return `🩸 BloodLink: Hi ${recipient.name}! You're now eligible to donate blood again (${data.daysSinceLastDonation} days since last donation). Ready to save another life? Update your availability in the app! 🦸‍♀️`;

      case 'appointment_reminder':
        return `📅 BloodLink: Reminder - Your donation appointment is tomorrow at ${data.appointmentTime} at ${data.hospitalName}. Eat well, hydrate, and bring ID. Thank you for being a hero! 💪`;

      default:
        return `BloodLink: You have a new notification. Check the app for details.`;
    }
  }

  /**
   * Generate WhatsApp content based on notification type
   */
  private generateWhatsAppContent(notification: NotificationData): string {
    const { type, recipient, data } = notification;

    switch (type) {
      case 'volunteer_welcome':
        return `🎉 *BloodLink - Welcome Volunteer!*\n\nHi ${recipient.name}!\n\nWelcome to our amazing volunteer team! 🙌\n\n📋 *Your Details:*\n• Name: ${data.name}\n• Region: ${data.region}\n${data.motivation ? `• Motivation: ${data.motivation}\n` : ''}\n*What's Next:*\n✅ Coordinator will contact you in 48hrs\n✅ Training materials coming soon\n✅ Join our volunteer WhatsApp group\n✅ Start making a difference!\n\nThank you for joining our life-saving mission! 💪`;

      case 'partnership_confirmation':
        return `🤝 *BloodLink - Partnership Inquiry*\n\nHi ${recipient.name}!\n\nThank you for your interest in partnering with BloodLink!\n\n🏥 *Organization:* ${data.organizationName}\n📋 *Type:* ${data.organizationType}\n\n*Next Steps:*\n✅ Review within 24 hours\n✅ Schedule partnership call\n✅ Create collaboration plan\n✅ Start saving lives together!\n\nWe're excited about this opportunity! 🌟`;

      case 'blood_request_confirmation':
        return `🩸 *BloodLink - Request Confirmed*\n\nHi ${recipient.name}!\n\nYour blood request has been submitted:\n• Blood Group: ${data.bloodGroup}\n• Patient: ${data.patientName}\n• Hospital: ${data.hospitalName}\n• Location: ${data.city}, ${data.country}\n\nWe're searching our global network for donors. You'll hear from us soon! 💪`;

      case 'donor_match_found':
        return `🎯 *BloodLink - Donors Found!*\n\nAmazing news ${recipient.name}!\n\nWe found *${data.donorCount} potential donors* for your blood request.\n\n✅ Check the BloodLink app now\n✅ Contact donors immediately\n✅ Coordinate with your hospital\n\nTime is precious - act fast! ⏰`;

      case 'donation_reminder':
        return `🩸 *BloodLink - Ready to Donate?*\n\nHi ${recipient.name}!\n\nYou're eligible to donate again! 🎉\n\n📊 Days since last donation: ${data.daysSinceLastDonation}\n🩸 Your blood type: ${data.bloodGroup}\n💝 Lives you can save: Up to 3\n\nUpdate your availability in the app and be someone's hero again! 🦸‍♀️`;

      case 'appointment_reminder':
        return `📅 *BloodLink - Appointment Tomorrow*\n\nHi ${recipient.name}!\n\nDonation appointment reminder:\n• 📅 Date: ${data.appointmentDate}\n• ⏰ Time: ${data.appointmentTime}\n• 🏥 Location: ${data.hospitalName}\n\n*Before you come:*\n✅ Eat a healthy meal\n✅ Drink plenty of water\n✅ Bring valid ID\n\nThank you for saving lives! 💪`;

      default:
        return `*BloodLink Notification*\n\nHi ${recipient.name}!\n\nYou have a new notification. Check the BloodLink app for details.`;
    }
  }

  /**
   * Log notification attempt to database
   */
  private async logNotification(log: NotificationLog): Promise<void> {
    try {
      console.log('📝 Notification logged:', log);
      
      // Store in localStorage for demo purposes
      const existingLogs = JSON.parse(localStorage.getItem('notification_logs') || '[]');
      existingLogs.push(log);
      localStorage.setItem('notification_logs', JSON.stringify(existingLogs.slice(-100))); // Keep last 100 logs
      
    } catch (error) {
      console.error('❌ Failed to log notification:', error);
    }
  }

  /**
   * Get notification logs for admin dashboard
   */
  async getNotificationLogs(limit: number = 50): Promise<NotificationLog[]> {
    try {
      const logs = JSON.parse(localStorage.getItem('notification_logs') || '[]');
      return logs.slice(-limit).reverse(); // Return most recent first
    } catch (error) {
      console.error('❌ Failed to get notification logs:', error);
      return [];
    }
  }

  /**
   * Send blood request confirmation
   */
  async sendBloodRequestConfirmation(
    recipient: { name: string; email?: string; phone?: string },
    requestData: {
      bloodGroup: string;
      patientName: string;
      hospitalName: string;
      city: string;
      country: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      type: 'blood_request_confirmation',
      recipient,
      data: requestData,
      urgency: 'medium',
      channels: {
        email: !!recipient.email,
        sms: !!recipient.phone,
        whatsapp: false // Can be enabled based on user preferences
      }
    });
  }

  /**
   * Send donor match notification
   */
  async sendDonorMatchNotification(
    recipient: { name: string; email?: string; phone?: string },
    matchData: {
      bloodGroup: string;
      donorCount: number;
      city: string;
      country: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      type: 'donor_match_found',
      recipient,
      data: matchData,
      urgency: 'high',
      channels: {
        email: !!recipient.email,
        sms: !!recipient.phone,
        whatsapp: !!recipient.phone
      }
    });
  }

  /**
   * Send donation reminder
   */
  async sendDonationReminder(
    recipient: { name: string; email?: string; phone?: string },
    reminderData: {
      bloodGroup: string;
      daysSinceLastDonation: number;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      type: 'donation_reminder',
      recipient,
      data: reminderData,
      urgency: 'low',
      channels: {
        email: !!recipient.email,
        sms: !!recipient.phone,
        whatsapp: false
      }
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    recipient: { name: string; email?: string; phone?: string },
    appointmentData: {
      appointmentDate: string;
      appointmentTime: string;
      hospitalName: string;
      city: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      type: 'appointment_reminder',
      recipient,
      data: appointmentData,
      urgency: 'medium',
      channels: {
        email: !!recipient.email,
        sms: !!recipient.phone,
        whatsapp: !!recipient.phone
      }
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();