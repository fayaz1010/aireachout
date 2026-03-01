export default function DataDeletionPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Data Deletion Request</h1>
      <p className="text-muted-foreground mb-8">Last updated: March 1, 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold mb-2">How to Request Data Deletion</h2>
          <p>If you have connected your Facebook or Instagram account to AIReachOut and wish to have your data deleted, you can submit a deletion request using either of the following methods:</p>
        </div>

        <div className="rounded-lg border p-5 space-y-2">
          <h3 className="font-semibold">Option 1 — Email Request</h3>
          <p>Send an email to <a href="mailto:privacy@aireachout.com" className="text-primary underline">privacy@aireachout.com</a> with the subject line <strong>"Data Deletion Request"</strong> and include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your full name</li>
            <li>The email address associated with your AIReachOut account</li>
            <li>Your Facebook or Instagram username (if applicable)</li>
          </ul>
        </div>

        <div className="rounded-lg border p-5 space-y-2">
          <h3 className="font-semibold">Option 2 — Facebook Settings</h3>
          <p>You can also revoke AIReachOut's access to your Facebook/Instagram data directly from Facebook:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Go to <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-primary underline">Facebook Settings → Apps and Websites</a></li>
            <li>Find <strong>AIReachOut</strong> in the list</li>
            <li>Click <strong>Remove</strong></li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">What Gets Deleted</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All messages received from your Facebook or Instagram account</li>
            <li>Your profile information stored in our system</li>
            <li>Any conversation history linked to your account</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Processing Time</h2>
          <p>We will process your deletion request within <strong>30 days</strong> and send a confirmation to your email address.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <p>For any questions about data deletion, contact us at: <a href="mailto:privacy@aireachout.com" className="text-primary underline">privacy@aireachout.com</a></p>
        </div>
      </section>
    </div>
  )
}
