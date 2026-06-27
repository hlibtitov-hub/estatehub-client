export const metadata = {
  title: 'Privacy Policy',
  description: 'EstateHub Privacy Policy — how we collect, use, and protect your personal data.',
}

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including: name and email address when you create an account; profile information such as phone number and avatar; property listing details including photos, descriptions, and location; messages exchanged with other users through our platform; and payment information processed securely through our payment partners.

We also automatically collect: log data (IP address, browser type, pages visited); device information; cookies and similar tracking technologies; and usage data about how you interact with the Platform.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to: provide, maintain, and improve our services; process transactions and send related information; send technical notices, updates, and support messages; respond to your comments and questions; send marketing communications (you may opt out at any time); monitor and analyze usage patterns; detect and prevent fraudulent transactions and other illegal activities; and comply with legal obligations.`,
  },
  {
    title: '3. Sharing of Information',
    content: `We do not sell your personal information. We may share your information with: other users as necessary to facilitate property transactions (e.g., your name and contact details with a property owner when you send an inquiry); service providers who assist in our operations (hosting, email delivery, analytics); law enforcement or other authorities when required by law; and in connection with a merger, acquisition, or sale of assets.`,
  },
  {
    title: '4. Cookies',
    content: `We use cookies and similar tracking technologies to: keep you logged in; remember your preferences; understand how you use the Platform; and improve our services. You can control cookies through your browser settings, but disabling cookies may affect Platform functionality. We use both session cookies (deleted when you close your browser) and persistent cookies (remain until deleted or expired).`,
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security measures to protect your personal data, including encryption in transit (HTTPS), secure password hashing, and access controls. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data and encourage you to use a strong, unique password for your account.`,
  },
  {
    title: '6. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us. Some information may be retained for legal, tax, or regulatory purposes even after account deletion.`,
  },
  {
    title: '7. Your Rights (GDPR)',
    content: `If you are located in the European Economic Area, you have the right to: access your personal data; correct inaccurate data; request deletion of your data; object to processing of your data; request restriction of processing; data portability; and withdraw consent at any time. To exercise these rights, please contact us at privacy@estatehub.cy.`,
  },
  {
    title: '8. Third-Party Services',
    content: `Our Platform integrates with third-party services including Google (for OAuth sign-in and maps), Supabase (for image storage), and Socket.io (for real-time messaging). These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `The Platform is not directed to children under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us and we will take steps to delete such information.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on the Platform. Your continued use of the Platform after changes become effective constitutes acceptance of the updated policy.`,
  },
  {
    title: '11. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at: privacy@estatehub.cy, or write to us at EstateHub, Limassol, Cyprus.`,
  },
]

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Legal
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: January 1, 2025</p>
      </div>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 leading-relaxed mb-8">
          At EstateHub, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our platform. Please read this
          policy carefully.
        </p>

        <div className="flex flex-col gap-8">
          {SECTIONS.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
              {content.split('\n\n').map((para, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-3 last:mb-0">{para}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Your privacy matters.</strong> If you have any questions or concerns about this
            Privacy Policy, please <a href="/contact" className="underline hover:text-blue-600">contact us</a>.
            We're committed to protecting your personal data.
          </p>
        </div>
      </div>
    </main>
  )
}
