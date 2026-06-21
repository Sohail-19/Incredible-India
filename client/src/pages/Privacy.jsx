const Privacy = () => {
  return (
    <div className="min-h-screen bg-background pb-24 pt-24 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Privacy Policy</h1>
      
      <div className="prose prose-sm sm:prose text-text-secondary space-y-6">
        <p>
          At IncredibleIndia, we take your privacy seriously. This Privacy Policy explains how we collect, 
          use, and protect your personal information when you use our travel discovery platform.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as your name and email address when you 
          create an account. We also collect data about your interactions with the platform, such as places 
          you save to your wishlist, itineraries you generate, and travel journals you write. Essential cookies 
          are used solely to maintain your active login session and preferences.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">2. How We Use Your Information</h2>
        <p>
          Your account data is used strictly to provide you with personalized travel discovery features. 
          We do not sell your personal data to third parties. We may securely share specific anonymous prompts 
          (such as requested destinations and dates) with third-party AI services like Gemini AI to generate 
          your custom travel itineraries.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">3. Data Security and Contact</h2>
        <p>
          We implement standard security measures, including secure password hashing and authenticated sessions, 
          to protect your information. If you have any concerns regarding your privacy or wish to delete your 
          account data, please contact us at privacy@example.com.
        </p>

        <p className="mt-8 text-sm italic text-text-muted">
          Last updated: October 2023. Note: This is a student portfolio project. This privacy policy is a 
          placeholder and not a legally binding document.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
