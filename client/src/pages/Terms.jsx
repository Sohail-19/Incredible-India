const Terms = () => {
  return (
    <div className="min-h-screen bg-background pb-24 pt-24 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Terms of Service</h1>
      
      <div className="prose prose-sm sm:prose text-text-secondary space-y-6">
        <p>
          Welcome to IncredibleIndia. By accessing or using our platform to discover travel destinations, 
          create itineraries, or log journal entries, you agree to comply with and be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our application.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">1. User Accounts and Content</h2>
        <p>
          When you create an account, you are responsible for maintaining the security of your password 
          and for all activities that occur under your account. Any content you submit, including reviews, 
          journal entries, and saved places, remains your intellectual property, but you grant IncredibleIndia 
          a license to display and use it within the context of the application.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">2. Third-Party Services</h2>
        <p>
          Our trip planning features utilize third-party artificial intelligence services, including Gemini AI. 
          While we strive for accuracy, AI-generated itineraries are suggestions only. We do not guarantee 
          the availability, safety, or accuracy of any suggested routes, accommodations, or activities. 
          You are responsible for independently verifying all travel arrangements.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">3. Limitation of Liability</h2>
        <p>
          IncredibleIndia is a discovery and planning tool. We are not a travel agency and are not responsible 
          for any loss, injury, or damages incurred during your travels. Use the information provided by the 
          platform at your own risk.
        </p>

        <p className="mt-8 text-sm italic text-text-muted">
          Last updated: October 2023. Note: This is a student portfolio project. These terms are placeholders 
          and not legally binding.
        </p>
      </div>
    </div>
  );
};

export default Terms;
