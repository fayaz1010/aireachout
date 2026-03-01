export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: March 1, 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
          <p>AIReachOut ("we", "our", "us") operates the aireachout.com platform. This Privacy Policy explains how we collect, use, and protect information when you use our services, including integrations with Meta platforms (Facebook, Instagram, WhatsApp) and other messaging channels.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account information: name, email address, and password when you register</li>
            <li>Message content: messages sent and received through integrated channels (Messenger, Instagram DMs, WhatsApp, Telegram)</li>
            <li>Contact information: names, email addresses, and phone numbers of your leads and customers</li>
            <li>Usage data: how you interact with our platform</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and operate the AIReachOut platform</li>
            <li>To process and display messages from integrated channels in your unified inbox</li>
            <li>To send outreach campaigns on your behalf</li>
            <li>To improve our services</li>
            <li>To communicate with you about your account</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">4. Meta Platform Data</h2>
          <p>When you connect Facebook, Instagram, or WhatsApp, we access messages and profile data through the Meta Platform APIs. This data is used solely to display messages in your inbox and send replies on your behalf. We do not sell or share this data with third parties.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">5. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You may request deletion of your data at any time by contacting us.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">6. Data Security</h2>
          <p>We implement industry-standard security measures including encryption in transit (HTTPS) and at rest to protect your data.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">7. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@aireachout.com to exercise these rights.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
          <p>For privacy-related questions, contact us at: <a href="mailto:privacy@aireachout.com" className="text-primary underline">privacy@aireachout.com</a></p>
        </div>
      </section>
    </div>
  )
}
