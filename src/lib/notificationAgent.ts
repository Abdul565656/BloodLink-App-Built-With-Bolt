import { supabase } from './supabase';
import { notificationService } from './notificationService';
import { donorMatcherAgent } from './donorMatcher';

export interface NotificationTrigger {
  event: 'blood_request_submitted' | 'donor_registered' | 'donation_due' | 'appointment_scheduled' | 'volunteer_registered' | 'partnership_inquiry';
  data: any;
}

export class NotificationAgent {
  /**
   * Process notification triggers
   */
  async processTrigger(trigger: NotificationTrigger): Promise<void> {
    console.log('🔔 Processing notification trigger:', trigger);

    try {
      switch (trigger.event) {
        case 'blood_request_submitted':
          await this.handleBloodRequestSubmitted(trigger.data);
          break;
        
        case 'donor_registered':
          await this.handleDonorRegistered(trigger.data);
          break;
        
        case 'donation_due':
          await this.handleDonationDue(trigger.data);
          break;
        
        case 'appointment_scheduled':
          await this.handleAppointmentScheduled(trigger.data);
          break;
        
        case 'volunteer_registered':
          await this.handleVolunteerRegistered(trigger.data);
          break;
        
        case 'partnership_inquiry':
          await this.handlePartnershipInquiry(trigger.data);
          break;
        
        default:
          console.warn('⚠️ Unknown notification trigger:', trigger.event);
      }
    } catch (error) {
      console.error('❌ Error processing notification trigger:', error);
    }
  }

  /**
   * Handle volunteer registration
   */
  private async handleVolunteerRegistered(volunteerData: any): Promise<void> {
    console.log('👥 Handling volunteer registration notification');

    try {
      await notificationService.sendNotification({
        type: 'volunteer_welcome',
        recipient: {
          name: volunteerData.name,
          email: volunteerData.email
        },
        data: {
          name: volunteerData.name,
          region: volunteerData.region,
          motivation: volunteerData.motivation
        },
        urgency: 'low',
        channels: {
          email: true,
          sms: false,
          whatsapp: false
        }
      });

      console.log(`✅ Sent welcome message to new volunteer ${volunteerData.name}`);
    } catch (error) {
      console.error(`❌ Failed to send welcome message to ${volunteerData.name}:`, error);
    }
  }

  /**
   * Handle partnership inquiry
   */
  private async handlePartnershipInquiry(partnerData: any): Promise<void> {
    console.log('🤝 Handling partnership inquiry notification');

    try {
      // Send confirmation to the organization
      await notificationService.sendNotification({
        type: 'partnership_confirmation',
        recipient: {
          name: partnerData.contactName,
          email: partnerData.email
        },
        data: {
          organizationName: partnerData.organizationName,
          contactName: partnerData.contactName,
          organizationType: partnerData.organizationType,
          message: partnerData.message
        },
        urgency: 'medium',
        channels: {
          email: true,
          sms: false,
          whatsapp: false
        }
      });

      console.log(`✅ Sent partnership confirmation to ${partnerData.organizationName}`);
    } catch (error) {
      console.error(`❌ Failed to send partnership confirmation to ${partnerData.organizationName}:`, error);
    }
  }

  /**
   * Handle blood request submitted
   */
  private async handleBloodRequestSubmitted(requestData: any): Promise<void> {
    console.log('🩸 Handling blood request submission notification');

    // Send confirmation to requester
    await notificationService.sendBloodRequestConfirmation(
      {
        name: requestData.patient_name,
        phone: requestData.contact_number
      },
      {
        bloodGroup: requestData.blood_group,
        patientName: requestData.patient_name,
        hospitalName: requestData.hospital_name,
        city: requestData.city,
        country: requestData.country
      }
    );

    // Find matching donors and notify them
    try {
      const bloodRequest = {
        patient_name: requestData.patient_name,
        blood_group: requestData.blood_group,
        country: requestData.country,
        city: requestData.city,
        urgency_level: requestData.urgency_level,
        hospital_name: requestData.hospital_name,
        contact_number: requestData.contact_number,
        preferred_date: requestData.preferred_date,
        preferred_time: requestData.preferred_time
      };

      const matchingDonors = await donorMatcherAgent.findMatchingDonors(bloodRequest);

      if (matchingDonors.length > 0) {
        // Notify requester about found donors
        await notificationService.sendDonorMatchNotification(
          {
            name: requestData.patient_name,
            phone: requestData.contact_number
          },
          {
            bloodGroup: requestData.blood_group,
            donorCount: matchingDonors.length,
            city: requestData.city,
            country: requestData.country
          }
        );

        // Notify each matching donor
        for (const donor of matchingDonors.slice(0, 5)) { // Notify top 5 matches
          await this.notifyDonorAboutRequest(donor, requestData);
        }
      }
    } catch (error) {
      console.error('❌ Error finding/notifying matching donors:', error);
    }
  }

  /**
   * Notify donor about blood request
   */
  private async notifyDonorAboutRequest(donor: any, requestData: any): Promise<void> {
    const urgencyEmoji = requestData.urgency_level === 'high' ? '🚨' : 
                        requestData.urgency_level === 'medium' ? '⚠️' : 'ℹ️';

    const message = `${urgencyEmoji} BloodLink: URGENT blood request for ${requestData.blood_group} at ${requestData.hospital_name}, ${requestData.city}. Patient: ${requestData.patient_name}. Contact: ${requestData.contact_number}. Can you help save a life? 🩸💪`;

    try {
      await notificationService.sendNotification({
        type: 'donor_match_found',
        recipient: {
          name: donor.full_name,
          phone: donor.phone_number
        },
        data: {
          bloodGroup: requestData.blood_group,
          patientName: requestData.patient_name,
          hospitalName: requestData.hospital_name,
          city: requestData.city,
          country: requestData.country,
          contactNumber: requestData.contact_number,
          urgencyLevel: requestData.urgency_level
        },
        urgency: requestData.urgency_level,
        channels: {
          sms: true,
          whatsapp: true,
          email: false // SMS/WhatsApp are more immediate for donors
        }
      });

      console.log(`✅ Notified donor ${donor.full_name} about blood request`);
    } catch (error) {
      console.error(`❌ Failed to notify donor ${donor.full_name}:`, error);
    }
  }

  /**
   * Handle donor registration
   */
  private async handleDonorRegistered(donorData: any): Promise<void> {
    console.log('👤 Handling donor registration notification');

    // Send welcome message to new donor
    const welcomeMessage = `🎉 Welcome to BloodLink, ${donorData.full_name}! You're now part of our global network of life-savers. Your ${donorData.blood_group} blood can help save up to 3 lives per donation. Thank you for being a hero! 🦸‍♀️`;

    try {
      await notificationService.sendNotification({
        type: 'blood_request_confirmation', // Reusing type for welcome message
        recipient: {
          name: donorData.full_name,
          phone: donorData.phone_number
        },
        data: {
          bloodGroup: donorData.blood_group,
          city: donorData.city,
          country: donorData.country
        },
        urgency: 'low',
        channels: {
          sms: true,
          email: false,
          whatsapp: false
        }
      });

      console.log(`✅ Sent welcome message to new donor ${donorData.full_name}`);
    } catch (error) {
      console.error(`❌ Failed to send welcome message to ${donorData.full_name}:`, error);
    }

    // Check for pending blood requests that match this donor
    await this.checkPendingRequestsForNewDonor(donorData);
  }

  /**
   * Check pending requests for new donor
   */
  private async checkPendingRequestsForNewDonor(donorData: any): Promise<void> {
    try {
      const { data: pendingRequests, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'pending')
        .eq('country', donorData.country)
        .eq('blood_group', donorData.blood_group);

      if (error) {
        console.error('❌ Error fetching pending requests:', error);
        return;
      }

      if (pendingRequests && pendingRequests.length > 0) {
        console.log(`🔍 Found ${pendingRequests.length} pending requests matching new donor`);

        // Notify the new donor about urgent requests
        for (const request of pendingRequests.slice(0, 3)) { // Limit to 3 most recent
          if (request.urgency_level === 'high') {
            await this.notifyDonorAboutRequest(donorData, request);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking pending requests for new donor:', error);
    }
  }

  /**
   * Handle donation due reminder
   */
  private async handleDonationDue(donorData: any): Promise<void> {
    console.log('⏰ Handling donation due reminder');

    const daysSinceLastDonation = donorData.days_since_last_donation || 365;

    if (daysSinceLastDonation >= 90) {
      await notificationService.sendDonationReminder(
        {
          name: donorData.full_name,
          phone: donorData.phone_number
        },
        {
          bloodGroup: donorData.blood_group,
          daysSinceLastDonation
        }
      );

      console.log(`✅ Sent donation reminder to ${donorData.full_name}`);
    }
  }

  /**
   * Handle appointment scheduled
   */
  private async handleAppointmentScheduled(appointmentData: any): Promise<void> {
    console.log('📅 Handling appointment scheduled notification');

    await notificationService.sendAppointmentReminder(
      {
        name: appointmentData.donor_name,
        phone: appointmentData.donor_phone
      },
      {
        appointmentDate: appointmentData.appointment_date,
        appointmentTime: appointmentData.appointment_time,
        hospitalName: appointmentData.hospital_name,
        city: appointmentData.city
      }
    );

    console.log(`✅ Sent appointment reminder to ${appointmentData.donor_name}`);
  }

  /**
   * Schedule donation reminders for eligible donors
   */
  async scheduleEligibilityReminders(): Promise<void> {
    console.log('🔄 Checking for donors eligible for donation reminders');

    try {
      const { data: donors, error } = await supabase
        .from('donors')
        .select('*')
        .eq('is_available', true);

      if (error) {
        console.error('❌ Error fetching donors for reminders:', error);
        return;
      }

      if (!donors) return;

      const today = new Date();
      let remindersSent = 0;

      for (const donor of donors) {
        if (donor.last_donation_date) {
          const lastDonation = new Date(donor.last_donation_date);
          const daysSince = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));

          // Send reminder if it's been exactly 90 days (eligible again)
          if (daysSince === 90) {
            await this.processTrigger({
              event: 'donation_due',
              data: {
                ...donor,
                days_since_last_donation: daysSince
              }
            });
            remindersSent++;
          }
        } else {
          // For donors who never donated, send reminder after 30 days of registration
          const registrationDate = new Date(donor.created_at);
          const daysSinceRegistration = Math.floor((today.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceRegistration === 30) {
            await this.processTrigger({
              event: 'donation_due',
              data: {
                ...donor,
                days_since_last_donation: null
              }
            });
            remindersSent++;
          }
        }
      }

      console.log(`✅ Sent ${remindersSent} donation reminders`);
    } catch (error) {
      console.error('❌ Error scheduling eligibility reminders:', error);
    }
  }

  /**
   * Send bulk notifications for emergency blood requests
   */
  async sendEmergencyAlert(requestData: any): Promise<void> {
    console.log('🚨 Sending emergency blood alert');

    try {
      // Find all compatible donors in the area
      const bloodRequest = {
        patient_name: requestData.patient_name,
        blood_group: requestData.blood_group,
        country: requestData.country,
        city: requestData.city,
        urgency_level: 'high',
        hospital_name: requestData.hospital_name,
        contact_number: requestData.contact_number,
        preferred_date: requestData.preferred_date,
        preferred_time: requestData.preferred_time
      };

      const matchingDonors = await donorMatcherAgent.findMatchingDonors(bloodRequest);

      // Send emergency alert to all matching donors
      const emergencyMessage = `🚨 EMERGENCY: Critical blood shortage! ${requestData.blood_group} needed IMMEDIATELY at ${requestData.hospital_name}, ${requestData.city}. Patient: ${requestData.patient_name}. Contact: ${requestData.contact_number}. Every minute counts! 🩸⏰`;

      for (const donor of matchingDonors) {
        try {
          await notificationService.sendNotification({
            type: 'donor_match_found',
            recipient: {
              name: donor.full_name,
              phone: donor.phone_number
            },
            data: {
              bloodGroup: requestData.blood_group,
              patientName: requestData.patient_name,
              hospitalName: requestData.hospital_name,
              city: requestData.city,
              country: requestData.country,
              contactNumber: requestData.contact_number,
              urgencyLevel: 'high'
            },
            urgency: 'high',
            channels: {
              sms: true,
              whatsapp: true,
              email: false
            }
          });
        } catch (error) {
          console.error(`❌ Failed to send emergency alert to ${donor.full_name}:`, error);
        }
      }

      console.log(`🚨 Sent emergency alerts to ${matchingDonors.length} donors`);
    } catch (error) {
      console.error('❌ Error sending emergency alerts:', error);
    }
  }
}

// Export singleton instance
export const notificationAgent = new NotificationAgent();