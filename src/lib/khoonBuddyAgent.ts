export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BloodDonationQA {
  keywords: string[];
  question: string;
  answer: string;
  category: 'eligibility' | 'process' | 'health' | 'myths' | 'general' | 'location';
}

export class KhoonBuddyAgent {
  private knowledgeBase: BloodDonationQA[] = [
    // Eligibility Questions
    {
      keywords: ['age', 'old', 'young', '18', 'under', 'minimum'],
      question: 'Can I donate if I\'m under 18?',
      answer: 'You need to be at least 18 years old to donate blood in most places. Some locations allow 16-17 year olds with parental consent. The upper age limit is usually 65-70 years. You\'re never too young to start planning to be a hero! 🦸‍♂️',
      category: 'eligibility'
    },
    {
      keywords: ['dengue', 'fever', 'mosquito', 'viral'],
      question: 'Can I donate if I had dengue?',
      answer: 'If you\'ve recovered from dengue, you can usually donate after 4 weeks of being completely symptom-free. Always inform the medical staff about your medical history. Your honesty helps keep everyone safe! 🛡️',
      category: 'health'
    },
    {
      keywords: ['covid', 'coronavirus', 'vaccine', 'vaccination'],
      question: 'Can I donate if I had COVID recently?',
      answer: 'Great question! If you\'ve recovered from COVID and it\'s been 14+ days symptom-free, you\'re usually eligible. If you\'ve been vaccinated, you can donate immediately after most COVID vaccines. You\'re amazing for wanting to help! ❤️',
      category: 'health'
    },
    {
      keywords: ['weight', 'minimum', 'kg', 'pounds', 'heavy', 'light'],
      question: 'What\'s the minimum weight to donate?',
      answer: 'You need to weigh at least 50kg (110 pounds) to donate blood safely. This ensures your body can handle the donation without any issues. Every hero comes in different sizes! 💪',
      category: 'eligibility'
    },
    {
      keywords: ['pregnant', 'pregnancy', 'breastfeeding', 'nursing'],
      question: 'Can I donate while pregnant or breastfeeding?',
      answer: 'You cannot donate blood during pregnancy or while breastfeeding. You can usually donate 6 weeks after delivery if you\'re not breastfeeding, or 3 months after you stop breastfeeding. Your health and baby\'s health come first! 👶',
      category: 'eligibility'
    },
    {
      keywords: ['medication', 'medicine', 'pills', 'drugs', 'antibiotics'],
      question: 'Can I donate if I\'m taking medication?',
      answer: 'It depends on the medication! Many common medications like vitamins, birth control, and some blood pressure medications are fine. Antibiotics usually require a waiting period. Always tell the medical staff about ALL medications you\'re taking. Honesty saves lives! 💊',
      category: 'health'
    },
    {
      keywords: ['tattoo', 'piercing', 'ink', 'needle'],
      question: 'Can I donate if I have a tattoo or piercing?',
      answer: 'Yes! If your tattoo or piercing was done at a licensed facility with sterile equipment, you can usually donate immediately. If done elsewhere, there might be a 3-12 month waiting period. Your body art doesn\'t stop you from being a hero! 🎨',
      category: 'eligibility'
    },
    
    // Process Questions
    {
      keywords: ['how often', 'frequency', 'again', 'next time', 'wait'],
      question: 'How often can I give blood?',
      answer: 'You can donate whole blood every 8-12 weeks (about 3-4 times per year). Your body needs time to replenish the blood cells. Mark your calendar - regular donors are the real MVPs! 📅',
      category: 'process'
    },
    {
      keywords: ['hurt', 'pain', 'painful', 'needle', 'scary'],
      question: 'Does it hurt?',
      answer: 'Most people describe it as a quick pinch when the needle goes in, then just a slight pressure. The actual donation takes 8-10 minutes and most donors say it\'s much easier than they expected! You\'re braver than you think! 💪',
      category: 'process'
    },
    {
      keywords: ['time', 'long', 'duration', 'minutes', 'hours'],
      question: 'How long does donation take?',
      answer: 'The whole process takes about 45-60 minutes, but the actual blood collection is only 8-10 minutes! You\'ll spend more time on paperwork and snacks than donating. Time well spent to save lives! ⏰',
      category: 'process'
    },
    {
      keywords: ['prepare', 'before', 'eat', 'drink', 'ready'],
      question: 'How should I prepare for donation?',
      answer: 'Eat a healthy meal, drink plenty of water, get good sleep, and bring ID! Avoid alcohol 24 hours before. Iron-rich foods like spinach and red meat help too. You\'re already preparing to be someone\'s hero! 🥗',
      category: 'process'
    },
    {
      keywords: ['after', 'rest', 'recovery', 'side effects'],
      question: 'What should I do after donating?',
      answer: 'Rest for 10-15 minutes, drink fluids, eat the snacks provided, and avoid heavy lifting for 24 hours. Most people feel great immediately! Listen to your body - you just did something amazing! 🍪',
      category: 'process'
    },
    {
      keywords: ['eat', 'food', 'meal', 'before donating', 'nutrition'],
      question: 'What should I eat before donating?',
      answer: 'Eat a healthy, balanced meal 2-3 hours before donating! Include iron-rich foods like lean meat, spinach, or beans. Avoid fatty foods and make sure you\'re well-hydrated. Your body will thank you for the good fuel! 🍎',
      category: 'process'
    },
    
    // Health & Safety
    {
      keywords: ['safe', 'safety', 'risk', 'infection', 'clean'],
      question: 'Is blood donation safe?',
      answer: 'Absolutely! All equipment is sterile and used only once. You cannot get any infection from donating blood. The process is carefully monitored by trained professionals. Your safety is the top priority! 🛡️',
      category: 'health'
    },
    {
      keywords: ['weak', 'tired', 'energy', 'fatigue'],
      question: 'Will I feel weak after donating?',
      answer: 'Most people feel fine immediately! Some might feel slightly tired for a few hours. Your body replaces the fluid within 24 hours and red blood cells within 4-6 weeks. You\'re stronger than you think! 💪',
      category: 'health'
    },
    {
      keywords: ['blood type', 'universal', 'donor', 'recipient', 'compatible'],
      question: 'What\'s the universal donor blood group?',
      answer: 'O-negative is the universal donor - they can give to anyone! AB-positive is the universal recipient - they can receive from anyone. But every blood type is needed and valuable! 🩸',
      category: 'general'
    },
    
    // Myths & Misconceptions
    {
      keywords: ['fat', 'weight gain', 'heavy', 'diet'],
      question: 'Will donating blood make me gain weight?',
      answer: 'No! Donating blood doesn\'t cause weight gain. You might feel hungrier afterward because your body is working to replenish the blood, but that\'s temporary. Stay hydrated and eat normally! 🏃‍♀️',
      category: 'myths'
    },
    {
      keywords: ['addictive', 'addiction', 'dependent'],
      question: 'Can blood donation become addictive?',
      answer: 'No, blood donation is not addictive! However, many donors do become regular volunteers because they love helping others. The only thing you might get addicted to is the amazing feeling of saving lives! 😊',
      category: 'myths'
    },
    {
      keywords: ['iron', 'anemia', 'deficiency', 'low'],
      question: 'Will donating blood cause iron deficiency?',
      answer: 'If you have healthy iron levels, donating blood won\'t cause deficiency. We test your hemoglobin before each donation. Eat iron-rich foods and your body will naturally replenish what you\'ve given! 🥬',
      category: 'health'
    },
    
    // Location & General
    {
      keywords: ['where', 'location', 'near me', 'find', 'center'],
      question: 'Where can I donate near me?',
      answer: 'You can find donation centers through our BloodLink app, local hospitals, Red Cross centers, or blood banks. Many workplaces and schools also host blood drives. Heroes are needed everywhere! 📍',
      category: 'location'
    },
    {
      keywords: ['why', 'important', 'help', 'save', 'lives'],
      question: 'Why is blood donation important?',
      answer: 'Every 2 seconds, someone needs blood! One donation can save up to 3 lives. Blood cannot be manufactured - it can only come from generous donors like you. You have the power to be someone\'s hero! 🦸‍♀️',
      category: 'general'
    },
    {
      keywords: ['first time', 'nervous', 'scared', 'new'],
      question: 'I\'m nervous about donating for the first time',
      answer: 'It\'s completely normal to feel nervous! The staff are experienced and will guide you through everything. Bring a friend for support, ask questions, and remember - you\'re about to do something incredibly brave and generous! 🤗',
      category: 'general'
    }
  ];

  private motivationalEndings = [
    "Thanks for stepping up! 🦸‍♂️",
    "You're saving lives, hero! ❤️",
    "Every drop matters! 💧",
    "You're someone's hero today! 💪",
    "Thanks for being a life-saver! 🌟",
    "Heroes like you make the world better! 🌍",
    "Your kindness saves lives! 🙏",
    "You're making a real difference! ✨",
    "The world needs more people like you! 🌈",
    "You're absolutely incredible! 🎉"
  ];

  private greetings = [
    "Hi there! I'm KhoonBuddy, your friendly blood donation assistant! 🩸",
    "Hello! KhoonBuddy here, ready to help with all your blood donation questions! 😊",
    "Hey! I'm KhoonBuddy, and I'm excited to help you become a blood donation hero! 🦸‍♀️",
    "Hi! KhoonBuddy at your service - let's talk about saving lives through blood donation! ❤️"
  ];

  generateResponse(userMessage: string): string {
    const message = userMessage.toLowerCase().trim();
    
    // Handle greetings
    if (this.isGreeting(message)) {
      return this.getRandomGreeting() + " What would you like to know about blood donation?";
    }

    // Handle thanks
    if (this.isThanking(message)) {
      return "You're so welcome! I'm here whenever you need help. " + this.getRandomMotivationalEnding();
    }

    // Find best matching answer
    const bestMatch = this.findBestMatch(message);
    
    if (bestMatch) {
      return bestMatch.answer + "\n\n" + this.getRandomMotivationalEnding();
    }

    // Default response for unmatched queries
    return this.getDefaultResponse(message);
  }

  private isGreeting(message: string): boolean {
    const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetingWords.some(greeting => message.includes(greeting));
  }

  private isThanking(message: string): boolean {
    const thankWords = ['thank', 'thanks', 'appreciate', 'grateful'];
    return thankWords.some(word => message.includes(word));
  }

  private findBestMatch(message: string): BloodDonationQA | null {
    let bestMatch: BloodDonationQA | null = null;
    let highestScore = 0;

    for (const qa of this.knowledgeBase) {
      const score = this.calculateMatchScore(message, qa.keywords);
      if (score > highestScore && score > 0) {
        highestScore = score;
        bestMatch = qa;
      }
    }

    return bestMatch;
  }

  private calculateMatchScore(message: string, keywords: string[]): number {
    let score = 0;
    const words = message.split(' ');
    
    for (const keyword of keywords) {
      if (message.includes(keyword.toLowerCase())) {
        score += 2; // Exact keyword match
      }
      
      // Check for partial matches
      for (const word of words) {
        if (word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)) {
          score += 1;
        }
      }
    }
    
    return score;
  }

  private getRandomGreeting(): string {
    return this.greetings[Math.floor(Math.random() * this.greetings.length)];
  }

  private getRandomMotivationalEnding(): string {
    return this.motivationalEndings[Math.floor(Math.random() * this.motivationalEndings.length)];
  }

  private getDefaultResponse(message: string): string {
    const responses = [
      "That's a great question! While I don't have specific information about that, I'd recommend speaking with a healthcare professional or visiting your local blood donation center. They'll have the most accurate and up-to-date information for your situation.",
      "I want to make sure I give you the best answer! For specific medical questions like this, it's always best to consult with the medical staff at a blood donation center. They're the experts and can give you personalized advice.",
      "That's an important question to ask! Since everyone's situation is unique, I'd suggest contacting your local blood bank or donation center directly. They can provide the most accurate guidance for your specific circumstances.",
      "I appreciate you asking! While I have information about common blood donation topics, for specific situations like yours, the medical professionals at donation centers are your best resource. They can give you personalized, accurate advice."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return randomResponse + "\n\n" + this.getRandomMotivationalEnding();
  }

  // Get all available topics for help
  getAvailableTopics(): string[] {
    const topics = [
      "Age and eligibility requirements",
      "Health conditions and medications",
      "Donation process and what to expect",
      "Recovery and aftercare",
      "Blood types and compatibility",
      "Common myths and misconceptions",
      "Finding donation locations",
      "Preparation tips"
    ];
    return topics;
  }

  // Get sample questions
  getSampleQuestions(): string[] {
    return [
      "Can I donate if I'm under 18?",
      "Does blood donation hurt?",
      "How often can I donate blood?",
      "What's the universal donor blood type?",
      "Can I donate if I had COVID recently?",
      "What should I eat before donating?"
    ];
  }
}

// Export singleton instance
export const khoonBuddyAgent = new KhoonBuddyAgent();