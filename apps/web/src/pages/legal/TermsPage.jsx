import LegalPage, { Section, Field } from '../../features/legal/LegalPage';
import { LEGAL } from '../../features/legal/legalConfig';

// Terms of Use. Governed by South African law; written to sit alongside the
// Consumer Protection Act and ECTA (supplier details in section 1).
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        These terms are the agreement between you and the provider of {LEGAL.appName}. By creating
        an account or using the app you accept them, together with the Privacy Policy and Cookie
        Policy.
      </p>

      <Section title="1. Who we are">
        <p>
          Provider: <Field value={LEGAL.responsibleParty} /> (<Field value={LEGAL.legalStatus} />)<br />
          Address: <Field value={LEGAL.address} /><br />
          Email: <Field value={LEGAL.email} />
        </p>
      </Section>

      <Section title="2. The service">
        <p>
          {LEGAL.appName} is a budgeting tool. You record your income, pots, spending and savings
          funds, and the app adds them up, reminds you of bills and estimates how savings could
          grow. It does not connect to your bank, hold your money, or make payments. Everything in
          it is a record of what you typed in.
        </p>
      </Section>

      <Section title="3. Who may use it">
        <p>
          You must be 18 or older and able to enter into a binding agreement. Do not use the app
          for anyone else&rsquo;s information without their permission.
        </p>
      </Section>

      <Section title="4. Your account">
        <ul>
          <li>Give accurate details and keep your password secret. You are responsible for what happens on your account.</li>
          <li>Tell us straight away if you think someone else has got into it.</li>
          <li>The app lock (PIN or fingerprint) is an extra layer for your phone. It does not replace keeping your device secure.</li>
        </ul>
      </Section>

      <Section title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>break the law, or use the app to hide or move unlawful money;</li>
          <li>try to get into accounts, systems or data that are not yours, or test our security without our written permission;</li>
          <li>overload, scrape or interfere with the service, or introduce malicious code;</li>
          <li>copy, resell or reverse-engineer the app except where the law allows.</li>
        </ul>
      </Section>

      <Section title="6. Not financial advice">
        <p>
          The app gives calculations and estimates, including interest projections, goal progress
          and suggestions to move leftover money. They rely on the numbers and rates you enter and
          on assumptions that may not hold (for example a fixed rate, and contributions that
          continue). They are not financial, investment, tax or legal advice, and we are not your
          financial adviser. Check real balances with your bank or provider before you decide
          anything.
        </p>
      </Section>

      <Section title="7. Your information">
        <p>
          Your budget data belongs to you. You let us store and process it only to run the service
          for you, as described in the Privacy Policy. You can download it and delete it at any
          time in Settings. Please keep your own copy of anything important, for example by
          exporting a month.
        </p>
      </Section>

      <Section title="8. Availability and changes">
        <p>
          We work to keep the app available and accurate but cannot promise it will always be
          free of errors or interruptions. Features may change, and the app may be unavailable
          for maintenance or for reasons outside our control. Spends logged offline are saved on
          your device and sent when you are back online; check that they arrived.
        </p>
      </Section>

      <Section title="9. Cost">
        <p>{LEGAL.fees}</p>
      </Section>

      <Section title="10. Ownership">
        <p>
          The app, its design and its code belong to us or our licensors. You get a personal,
          non-transferable right to use it. You keep ownership of the data you enter.
        </p>
      </Section>

      <Section title="11. Ending the agreement">
        <p>
          You can stop at any time by deleting your account in Settings. We may suspend or close
          an account that breaks these terms or puts the service or other people at risk, and will
          tell you why where we reasonably can.
        </p>
      </Section>

      <Section title="12. Limits on our responsibility">
        <p>
          The app is provided &ldquo;as is&rdquo;. To the extent the law allows, we are not liable
          for loss that results from decisions you make using the app&rsquo;s figures, from
          mistakes in what you entered, from interruptions or data loss outside our reasonable
          control, or for indirect or consequential loss. Nothing in these terms limits any right
          you have under the Consumer Protection Act 68 of 2008 or any other law that cannot be
          limited or excluded, or our liability for gross negligence or intentional harm.
        </p>
      </Section>

      <Section title="13. Changes to these terms">
        <p>
          We may update these terms. When a change matters we will update the version date and
          ask you to accept the new terms before you continue. If you do not accept, you can
          delete your account.
        </p>
      </Section>

      <Section title="14. Law and disputes">
        <p>
          These terms are governed by the laws of the Republic of South Africa. Please contact us
          first so we can try to settle any disagreement. Failing that, it may be taken to{' '}
          <Field value={LEGAL.governingCourts} />. You keep any right to approach the National
          Consumer Commission, the Consumer Tribunal or a court.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Questions about these terms: <Field value={LEGAL.email} />.
        </p>
      </Section>
    </LegalPage>
  );
}
