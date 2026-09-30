import LegalPage, { Section, Field } from '../../features/legal/LegalPage';
import { LEGAL, REGULATOR } from '../../features/legal/legalConfig';
import styles from '../../features/legal/LegalPage.module.css';

// Privacy Policy / POPIA notice (Protection of Personal Information Act 4 of 2013).
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal information {LEGAL.appName} collects, why, who sees it,
        how long it is kept, and the rights you have over it under the Protection of Personal
        Information Act 4 of 2013 (POPIA).
      </p>

      <Section title="1. Who is responsible">
        <p>
          The responsible party is <Field value={LEGAL.responsibleParty} /> (<Field value={LEGAL.legalStatus} />),{' '}
          <Field value={LEGAL.address} />. Email: <Field value={LEGAL.email} />.
        </p>
        <p>
          Information Officer: <Field value={LEGAL.informationOfficer.name} />,{' '}
          <Field value={LEGAL.informationOfficer.email} />.
        </p>
      </Section>

      <Section title="2. What we collect">
        <ul>
          <li><strong>Account:</strong> your name, email address, and your password, which is stored only as a one-way hash and can never be read back.</li>
          <li><strong>Budget data you enter:</strong> income, pots, line items, savings and investment funds, amounts, dates, payment-method labels and notes.</li>
          <li><strong>Your consent:</strong> which version of our terms you accepted and when.</li>
          <li><strong>Technical data:</strong> your IP address and basic request details (time, page, browser type) in server logs, used for security and fixing faults.</li>
        </ul>
        <p>
          We do not collect your ID number, bank account or card numbers, location, contacts, or
          any special personal information (such as health, religion, race or criminal record).
          Please do not type card or account numbers into notes. Fingerprint or face unlock is done
          by your phone; we never receive or store your fingerprint or face.
        </p>
      </Section>

      <Section title="3. Why we use it">
        <ul>
          <li>To create your account and run the budgeting service you asked for (performing our agreement with you).</li>
          <li>To keep the service secure, prevent abuse and fix faults (our legitimate interests, and yours).</li>
          <li>To send password-reset and security emails.</li>
          <li>To keep a record of your consent and to meet legal obligations.</li>
        </ul>
        <p>
          We do not sell your information, use it for advertising or profiling, or make automated
          decisions about you. Projections and alerts in the app are simple calculations on the
          numbers you entered.
        </p>
      </Section>

      <Section title="4. Who we share it with">
        <p>
          We use service providers (&ldquo;operators&rdquo;) who process information on our behalf
          and may only use it to provide their service to us:
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Provider</th><th>What they do</th><th>Where</th></tr>
            </thead>
            <tbody>
              {LEGAL.operators.map((op) => (
                <tr key={op.name}>
                  <td><Field value={op.name} /></td>
                  <td>{op.does}</td>
                  <td><Field value={op.where} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          We may also disclose information if the law, a court or a regulator requires it, or to
          protect people&rsquo;s rights and safety.
        </p>
      </Section>

      <Section title="5. Storage outside South Africa">
        <p>
          Some providers above may store or process information outside South Africa. Where that
          happens we use providers that are bound by law, binding rules or agreements that give
          your information a level of protection substantially similar to POPIA. By accepting this
          policy you also consent to this transfer.
        </p>
      </Section>

      <Section title="6. How long we keep it">
        <ul>
          <li>Account and budget data: for as long as your account exists. When you delete your account it is removed from our live systems straight away, and from backups within <Field value={LEGAL.backupRetention} />.</li>
          <li>Server logs: up to <Field value={LEGAL.logRetention} />.</li>
          <li>Password-reset links: they expire after 30 minutes and are deleted once used.</li>
          <li>We may keep information longer only where the law requires it.</li>
        </ul>
      </Section>

      <Section title="7. How we protect it">
        <p>
          Data travels over encrypted connections (HTTPS). Passwords are hashed, sign-in uses
          short-lived tokens, login and reset attempts are rate-limited, and access to the
          database is restricted. You can also lock the app on your phone with a PIN or fingerprint
          (Settings). No system is perfectly secure. If there is a breach that affects your
          information we will notify you and the Information Regulator as POPIA requires.
        </p>
        <p>
          To let you work without signal, the app keeps a copy of your recent months and any
          spends you logged offline on your own device. Logging out removes them. Log out on a
          shared or borrowed device.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>You may at any time:</p>
        <ul>
          <li><strong>Access</strong> your information: Settings → Download my data.</li>
          <li><strong>Correct</strong> it: edit it in the app, or ask us.</li>
          <li><strong>Delete</strong> it: Settings → Delete my account.</li>
          <li><strong>Object to or restrict</strong> how we use it, or <strong>withdraw your consent</strong> (this does not affect what we did before you withdrew, and we may not be able to keep your account open).</li>
          <li><strong>Ask</strong> what we hold about you, and who has seen it.</li>
        </ul>
        <p>
          For anything the app cannot do for you, email our Information Officer at{' '}
          <Field value={LEGAL.informationOfficer.email} />. We aim to reply within 30 days.
        </p>
      </Section>

      <Section title="9. Complaints">
        <p>
          If you are unhappy with how we handled your information, please tell us first. You also
          have the right to complain to the Information Regulator:
        </p>
        <p>
          {REGULATOR.name}<br />
          {REGULATOR.address}<br />
          {REGULATOR.post}<br />
          Complaints: <a href={`mailto:${REGULATOR.complaintsEmail}`}>{REGULATOR.complaintsEmail}</a><br />
          Enquiries: <a href={`mailto:${REGULATOR.enquiriesEmail}`}>{REGULATOR.enquiriesEmail}</a><br />
          <a href={REGULATOR.website} target="_blank" rel="noopener noreferrer">inforegulator.org.za</a>
        </p>
      </Section>

      <Section title="10. Age">
        <p>
          {LEGAL.appName} is for people aged 18 and over. We do not knowingly collect information
          from children. If you believe a child has registered, tell us and we will delete the account.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p>
          If we change this policy in a way that matters, we will update the version above and ask
          you to accept it again before you continue using the app.
        </p>
      </Section>
    </LegalPage>
  );
}
