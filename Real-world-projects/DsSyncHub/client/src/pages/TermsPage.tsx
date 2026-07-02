const TermsPage = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">Terms of Service</h1>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>

      {[
        { title: '1. Acceptance of Terms', text: 'By accessing or using DsSync Hub, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.' },
        { title: '2. Description of Service', text: 'DsSync Hub provides a team collaboration platform including task management, notes, chat, calendar, video meetings, and AI-powered features.' },
        { title: '3. User Accounts', text: 'You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use.' },
        { title: '4. Acceptable Use', text: 'You agree not to use DsSync Hub for any unlawful purpose or in violation of any applicable laws. You may not attempt to disrupt, damage, or gain unauthorized access to the service.' },
        { title: '5. Intellectual Property', text: 'The service and its original content, features, and functionality are owned by DsSync Hub and are protected by international copyright laws.' },
        { title: '6. Limitation of Liability', text: 'DsSync Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.' },
        { title: '7. Changes to Terms', text: 'We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the service.' },
        { title: '8. Contact', text: 'For questions about these terms, contact us at chauhandigvijay669@gmail.com.' },
      ].map((section) => (
        <section className="mb-8" key={section.title}>
          <h2 className="mb-3 text-xl font-semibold text-zinc-800 dark:text-zinc-100">{section.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{section.text}</p>
        </section>
      ))}
    </main>
  )
}

export default TermsPage
