import { supabase } from './supabase';

// Blood compatibility matrix - who can donate to whom
const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Universal recipient (can only donate to AB+)
};

export interface BloodRequest {
  patient_name: string;
  blood_group: string;
  country: string;
  city: string;
  urgency_level: 'low' | 'medium' | 'high';
  hospital_name: string;
  contact_number: string;
  preferred_date: string;
  preferred_time: string;
}

export interface MatchingDonor {
  id: string;
  full_name: string;
  phone_number: string;
  blood_group: string;
  country: string;
  city: string;
  last_donation_date: string | null;
  days_since_last_donation: number | null;
  compatibility_score: number;
  urgency_priority: number;
}

export class DonorMatcherAgent {
  /**
   * Find matching donors for a blood request
   */
  async findMatchingDonors(request: BloodRequest): Promise<MatchingDonor[]> {
    try {
      console.log('🔍 Searching for donors matching:', {
        bloodGroup: request.blood_group,
        country: request.country,
        city: request.city,
        urgency: request.urgency_level
      });

      // Get compatible blood groups that can donate to the requested blood group
      const compatibleDonorGroups = this.getCompatibleDonorGroups(request.blood_group);
      
      console.log('🩸 Compatible donor blood groups:', compatibleDonorGroups);

      // Query donors from database with location-based matching
      const { data: donors, error } = await supabase
        .from('donors')
        .select('*')
        .eq('is_available', true)
        .in('blood_group', compatibleDonorGroups)
        .eq('country', request.country) // Exact country match
        .ilike('city', `%${request.city}%`); // Case-insensitive city matching

      if (error) {
        console.error('❌ Error fetching donors:', error);
        throw error;
      }

      if (!donors || donors.length === 0) {
        console.log('⚠️ No matching donors found in the same country and city');
        
        // Try broader search - same country, different cities
        const { data: countryDonors, error: countryError } = await supabase
          .from('donors')
          .select('*')
          .eq('is_available', true)
          .in('blood_group', compatibleDonorGroups)
          .eq('country', request.country);

        if (countryError) {
          console.error('❌ Error fetching country donors:', countryError);
          throw countryError;
        }

        if (!countryDonors || countryDonors.length === 0) {
          console.log('⚠️ No matching donors found in the same country');
          return [];
        }

        console.log(`✅ Found ${countryDonors.length} potential donors in the same country`);
        
        // Process and score donors from the same country
        const scoredDonors = countryDonors
          .map(donor => this.scoreDonor(donor, request))
          .filter(donor => donor.days_since_last_donation === null || donor.days_since_last_donation >= 90)
          .sort((a, b) => {
            // Sort by urgency priority first, then compatibility score, then days since last donation
            if (a.urgency_priority !== b.urgency_priority) {
              return b.urgency_priority - a.urgency_priority;
            }
            if (a.compatibility_score !== b.compatibility_score) {
              return b.compatibility_score - a.compatibility_score;
            }
            // Prefer donors who haven't donated recently (higher days since last donation)
            const aDays = a.days_since_last_donation || 365;
            const bDays = b.days_since_last_donation || 365;
            return bDays - aDays;
          })
          .slice(0, 10); // Return top 10 matches for country-wide search

        return scoredDonors;
      }

      console.log(`✅ Found ${donors.length} potential donors in the same city`);

      // Process and score donors from the same city
      const scoredDonors = donors
        .map(donor => this.scoreDonor(donor, request))
        .filter(donor => donor.days_since_last_donation === null || donor.days_since_last_donation >= 90)
        .sort((a, b) => {
          // Sort by urgency priority first, then compatibility score, then days since last donation
          if (a.urgency_priority !== b.urgency_priority) {
            return b.urgency_priority - a.urgency_priority;
          }
          if (a.compatibility_score !== b.compatibility_score) {
            return b.compatibility_score - a.compatibility_score;
          }
          // Prefer donors who haven't donated recently (higher days since last donation)
          const aDays = a.days_since_last_donation || 365;
          const bDays = b.days_since_last_donation || 365;
          return bDays - aDays;
        })
        .slice(0, 5); // Return top 5 matches for city-specific search

      console.log('🎯 Top matching donors:', scoredDonors.map(d => ({
        name: d.full_name,
        bloodGroup: d.blood_group,
        location: `${d.city}, ${d.country}`,
        daysSinceLastDonation: d.days_since_last_donation,
        score: d.compatibility_score
      })));

      return scoredDonors;

    } catch (error) {
      console.error('❌ Error in donor matching:', error);
      throw error;
    }
  }

  /**
   * Get blood groups that can donate to the requested blood group
   */
  private getCompatibleDonorGroups(recipientBloodGroup: string): string[] {
    const compatibleDonors: string[] = [];
    
    // Check each donor blood group to see if they can donate to the recipient
    for (const [donorGroup, canDonateTo] of Object.entries(BLOOD_COMPATIBILITY)) {
      if (canDonateTo.includes(recipientBloodGroup)) {
        compatibleDonors.push(donorGroup);
      }
    }
    
    return compatibleDonors;
  }

  /**
   * Score a donor based on compatibility and other factors
   */
  private scoreDonor(donor: any, request: BloodRequest): MatchingDonor {
    // Calculate days since last donation
    let daysSinceLastDonation: number | null = null;
    if (donor.last_donation_date) {
      const lastDonation = new Date(donor.last_donation_date);
      const today = new Date();
      daysSinceLastDonation = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Compatibility score (exact match gets higher score)
    let compatibilityScore = 1;
    if (donor.blood_group === request.blood_group) {
      compatibilityScore = 3; // Exact match
    } else if (donor.blood_group === 'O-') {
      compatibilityScore = 2; // Universal donor
    }

    // Location match bonus
    if (donor.country === request.country) {
      compatibilityScore += 1; // Same country bonus
    }
    if (donor.city.toLowerCase() === request.city.toLowerCase()) {
      compatibilityScore += 2; // Same city bonus (higher priority)
    }

    // Urgency priority
    const urgencyPriority = request.urgency_level === 'high' ? 3 : 
                           request.urgency_level === 'medium' ? 2 : 1;

    return {
      id: donor.id,
      full_name: donor.full_name,
      phone_number: donor.phone_number,
      blood_group: donor.blood_group,
      country: donor.country,
      city: donor.city,
      last_donation_date: donor.last_donation_date,
      days_since_last_donation: daysSinceLastDonation,
      compatibility_score: compatibilityScore,
      urgency_priority: urgencyPriority
    };
  }

  /**
   * Format donor information for display
   */
  formatDonorInfo(donor: MatchingDonor): string {
    const donationStatus = donor.days_since_last_donation 
      ? `Last donated ${donor.days_since_last_donation} days ago`
      : 'First-time donor';
    
    return `${donor.full_name} (${donor.blood_group}) - ${donor.city}, ${donor.country} - ${donor.phone_number} - ${donationStatus}`;
  }

  /**
   * Get donation eligibility status
   */
  getDonationEligibility(daysSinceLastDonation: number | null): {
    eligible: boolean;
    message: string;
  } {
    if (daysSinceLastDonation === null) {
      return { eligible: true, message: 'First-time donor - eligible' };
    }
    
    if (daysSinceLastDonation >= 90) {
      return { eligible: true, message: `Eligible (${daysSinceLastDonation} days since last donation)` };
    }
    
    const daysUntilEligible = 90 - daysSinceLastDonation;
    return { 
      eligible: false, 
      message: `Not eligible (needs ${daysUntilEligible} more days)` 
    };
  }
}

// Export singleton instance
export const donorMatcherAgent = new DonorMatcherAgent();