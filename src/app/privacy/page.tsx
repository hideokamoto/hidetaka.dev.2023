import type { Metadata } from 'next'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'

export const metadata: Metadata = {
  title: 'Privacy Policy | Hidetaka.dev',
  description: 'Privacy Policy for Hidetaka.dev - Information about data collection and usage',
}

export default function PrivacyPolicyPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <Link
                  href="/"
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  Home
                </Link>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="ml-2 size-5 shrink-0 text-slate-300 dark:text-slate-600"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              </div>
            </li>
            <li>
              <div className="flex items-center text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  Privacy Policy
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Last updated: December 2, 2025
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              1. Introduction
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              This Privacy Policy describes how Hidetaka.dev ("we", "us", or "our") collects, uses,
              and shares information when you visit our website at{' '}
              <a
                href="https://hidetaka.dev"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                https://hidetaka.dev
              </a>{' '}
              (the "Site").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              2. Information We Collect
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We collect information about your visit to our Site through various third-party
              services:
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
              2.1 Google Analytics
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We use Google Analytics to understand how visitors use our Site. Google Analytics
              collects information such as:
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>Pages visited and time spent on each page</li>
              <li>Browser type and version</li>
              <li>Device type (desktop, mobile, tablet)</li>
              <li>Geographic location (country, city)</li>
              <li>Referring websites</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              For more information about how Google uses data, please visit{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Google's Privacy Policy
              </a>
              .
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
              2.2 Microsoft Clarity
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We use Microsoft Clarity to understand user behavior and improve user experience.
              Clarity collects:
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>User interactions (clicks, scrolls, mouse movements)</li>
              <li>Session recordings</li>
              <li>Heatmaps of user activity</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              For more information, please visit{' '}
              <a
                href="https://privacy.microsoft.com/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Microsoft's Privacy Statement
              </a>
              .
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
              2.3 Google AdSense
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We use Google AdSense to display advertisements on our Site. Google and its partners
              use cookies to serve ads based on your prior visits to our Site or other websites.
              Google's use of advertising cookies enables it and its partners to serve ads based on
              your visit to our Site and/or other sites on the Internet.
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              You may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Google Ads Settings
              </a>{' '}
              or{' '}
              <a
                href="http://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                www.aboutads.info
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              3. Cookies and Tracking Technologies
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to collect and track information
              about your browsing activities. Cookies are small text files that are stored on your
              device.
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              Types of cookies we use:
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how visitors interact with
                our Site
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Used to deliver relevant advertisements
              </li>
              <li>
                <strong>Functional Cookies:</strong> Enable certain functionality such as theme
                preferences
              </li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              You can control cookies through your browser settings. However, disabling cookies may
              affect the functionality of our Site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              4. How We Use Information
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>To analyze and improve our Site's content and user experience</li>
              <li>To understand visitor behavior and preferences</li>
              <li>To display relevant advertisements</li>
              <li>To maintain and improve the security of our Site</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              5. Third-Party Services
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              Our Site integrates with the following third-party services:
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>
                <strong>Google Analytics:</strong> Web analytics service
              </li>
              <li>
                <strong>Microsoft Clarity:</strong> User behavior analytics
              </li>
              <li>
                <strong>Google AdSense:</strong> Advertising service
              </li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              These third-party services have their own privacy policies. We encourage you to review
              them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              6. Data Security
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We implement reasonable security measures to protect the information collected through
              our Site. However, no method of transmission over the Internet or electronic storage
              is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              7. Children's Privacy
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              Our Site is not directed to children under the age of 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. The updated version will be
              indicated by an updated "Last updated" date at the top of this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              9. Contact Us
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>
                <strong>Twitter:</strong>{' '}
                <a
                  href="https://twitter.com/hidetaka_dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  @hidetaka_dev
                </a>
              </li>
              <li>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/hideokamoto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  @hideokamoto
                </a>
              </li>
            </ul>
          </section>
        </div>
      </article>
    </Container>
  )
}
