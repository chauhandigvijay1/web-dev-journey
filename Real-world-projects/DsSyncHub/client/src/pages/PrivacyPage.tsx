const PrivacyPage = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">Privacy Policy</h1>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>

      {[
        { title: '1. Information We Collect', text: 'We collect information you provide when creating an account, including your name, email address, and profile information. We also collect data about your usage of the service, such as tasks, notes, and workspace activity.' },
        { title: '2. How We Use Your Information', text: 'We use your information to provide, maintain, and improve the service. This includes authenticating your access, storing your workspace data, and sending service-related communications.' },
        { title: '3. Data Storage', text: 'Your data is stored securely on MongoDB Atlas with encryption at rest. File uploads are stored on Cloudinary with CDN delivery. We implement industry-standard security measures to protect your data.' },
        { title: '4. Third-Party Services', text: 'We integrate with third-party services for specific features: Google OAuth (authentication), Razorpay (payments), Groq (AI), Cloudinary (file storage), Sentry (error monitoring), and Jitsi Meet (video conferencing). Each service has its own privacy policy.' },
        { title: '5. Data Export and Deletion', text: 'You can export your workspace data at any time from the workspace settings. You can request account deletion by contacting us. We will delete your data within 30 days of your request.' },
        { title: '6. Cookies', text: 'We use httpOnly cookies for authentication. We do not use tracking cookies or third-party analytics cookies. You can control cookie settings through your browser.' },
        { title: '7. Your Rights', text: 'You have the right to access, correct, or delete your personal data. You may also export your data in a portable format. To exercise these rights, contact us at chauhandigvijay669@gmail.com.' },
        { title: '8. Changes to This Policy', text: 'We may update this privacy policy from time to time. We will notify users of material changes via email or through the service.' },
        { title: '9. Contact', text: 'For questions about this privacy policy, contact us at chauhandigvijay669@gmail.com.' },
      ].map((section) => (
        <section className="mb-8" key={section.title}>
          <h2 className="mb-3 text-xl font-semibold text-zinc-800 dark:text-zinc-100">{section.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{section.text}</p>
        </section>
      ))}
    </main>
  )
}

export default PrivacyPage
