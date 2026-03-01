export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: March 1, 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using AIReachOut ("the Service") at aireachout.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
          <p>AIReachOut is a unified contact centre and outreach platform that allows businesses to manage customer communications across multiple channels including Facebook Messenger, Instagram, WhatsApp, Telegram, email, and SMS, as well as run outreach campaigns to leads.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">3. Account Registration</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You must be at least 18 years old to use this Service</li>
            <li>One person or entity may not maintain more than one free account</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Send spam, unsolicited messages, or bulk communications without recipient consent</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Transmit harmful, offensive, or illegal content</li>
            <li>Attempt to gain unauthorised access to our systems</li>
            <li>Violate Meta's Platform Policies when using Facebook, Instagram, or WhatsApp integrations</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">5. Third-Party Integrations</h2>
          <p>The Service integrates with third-party platforms including Meta (Facebook, Instagram, WhatsApp), Telegram, and others. Your use of these integrations is subject to the respective platform's terms of service. We are not responsible for changes to third-party APIs or platform policies that may affect the Service.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">6. Data and Privacy</h2>
          <p>Your use of the Service is also governed by our <a href="/privacy" className="text-primary underline">Privacy Policy</a>. By using the Service, you consent to the collection and use of your data as described therein.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">7. Subscription and Billing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Some features require a paid subscription</li>
            <li>Subscription fees are billed in advance on a monthly or annual basis</li>
            <li>Refunds are provided at our discretion within 7 days of billing</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">8. Termination</h2>
          <p>We reserve the right to suspend or terminate your account if you violate these Terms. You may cancel your account at any time from your account settings. Upon termination, your data will be deleted in accordance with our Privacy Policy.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">9. Disclaimer of Warranties</h2>
          <p>The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or meet your specific requirements.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">10. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, AIReachOut shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">11. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of significant changes by email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">12. Contact</h2>
          <p>For questions about these Terms, contact us at: <a href="mailto:legal@aireachout.com" className="text-primary underline">legal@aireachout.com</a></p>
        </div>
      </section>
    </div>
  )
}
