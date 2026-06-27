export const metadata = {
  title: 'Terms of Service',
  description: 'EstateHub Terms of Service — rules and conditions for using our platform.',
}

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using EstateHub ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these terms at any time, and continued use of the Platform constitutes acceptance of any changes.`,
  },
  {
    title: '2. User Accounts',
    content: `You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these terms.`,
  },
  {
    title: '3. Property Listings',
    content: `Property owners and agents ("Owners") may list properties on the Platform. All listings must be accurate, truthful, and comply with applicable laws. EstateHub does not guarantee the accuracy of any listing and is not responsible for errors or omissions. We reserve the right to remove any listing that violates our policies without notice.`,
  },
  {
    title: '4. Prohibited Activities',
    content: `You may not use the Platform to: post false, misleading, or fraudulent listings; harass, threaten, or harm other users; scrape or copy content without permission; attempt to gain unauthorized access to any part of the Platform; violate any applicable laws or regulations; or use the Platform for any commercial purpose other than listing or searching for properties.`,
  },
  {
    title: '5. Intellectual Property',
    content: `All content on the Platform, including text, graphics, logos, and software, is the property of EstateHub or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.`,
  },
  {
    title: '6. Limitation of Liability',
    content: `EstateHub is a platform connecting property owners and buyers/renters. We are not a party to any transaction between users. To the maximum extent permitted by law, EstateHub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to loss of data, loss of revenue, or property disputes.`,
  },
  {
    title: '7. Disclaimer of Warranties',
    content: `The Platform is provided "as is" without warranties of any kind, either express or implied. EstateHub does not warrant that the Platform will be uninterrupted, error-free, or free of viruses. We do not endorse or take responsibility for any content posted by users.`,
  },
  {
    title: '8. Privacy',
    content: `Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of information as described in our Privacy Policy.`,
  },
  {
    title: '9. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the Republic of Cyprus, without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Cyprus.`,
  },
  {
    title: '10. Contact',
    content: `If you have questions about these Terms of Service, please contact us at legal@estatehub.cy or through our Contact page.`,
  },
]

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Legal
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last updated: January 1, 2025</p>
      </div>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 leading-relaxed mb-8">
          Please read these Terms of Service carefully before using EstateHub. These terms govern your
          access to and use of our real estate platform, including all features, content, and services.
        </p>

        <div className="flex flex-col gap-8">
          {SECTIONS.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Questions?</strong> If you have any questions about these Terms of Service,
            please <a href="/contact" className="underline hover:text-blue-600">contact us</a> and
            we'll be happy to help.
          </p>
        </div>
      </div>
    </main>
  )
}
