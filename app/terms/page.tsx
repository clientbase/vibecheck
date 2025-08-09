export default function TermsOfServicePage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-2 font-semibold">Terms of Service for VibeCheckTO</p>
      <p className="mb-6 text-sm text-gray-500">Last updated: Auth 8th, 2025</p>
      <p className="mb-4">By using VibeCheckTO (“Service”), you agree to these Terms.</p>
      <ol className="list-decimal ml-6 mb-4 space-y-2">
        <li>
          <strong>Use of the Service</strong><br />
          You agree to use the Service only for lawful purposes and in compliance with these Terms.
        </li>
        <li>
          <strong>Accounts</strong><br />
          You are responsible for your account and for all activities that occur under it.
        </li>
        <li>
          <strong>Intellectual Property</strong><br />
          All content in the app is owned by us or our licensors.
        </li>
        <li>
          <strong>Limitation of Liability</strong><br />
          We are not responsible for any damages arising from your use of the Service.
        </li>
        <li>
          <strong>Changes to Terms</strong><br />
          We may update these Terms from time to time. Continued use of the Service means you accept the updated Terms.
        </li>
        <li>
          <strong>Contact</strong><br />
          If you have questions, contact us at <a href="mailto:vibechecktoapp@gmail.com" className="text-blue-600 underline">vibechecktoapp@gmail.com</a>.
        </li>
      </ol>
    </main>
  );
}
