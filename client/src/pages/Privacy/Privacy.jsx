import MarketingLayout from '../../components/MarketingLayout/MarketingLayout'
import PageMasthead from '../../components/MarketingLayout/PageMasthead'
import PageBody from '../../components/MarketingLayout/PageBody'

export default function Privacy() {
  return (
    <MarketingLayout>
      <PageMasthead
        eyebrow="Privacy Policy"
        title="Your data,"
        accent="undisturbed."
        lead="The short version. One paragraph, because there isn't more to say."
      />
      <PageBody>
        <p className="text-[0.9375rem] leading-relaxed text-on-surface-variant">
          By accessing Kandew, you acknowledge that no information provided herein shall be sold,
          rented, leased, or otherwise conveyed to third parties, nor to second parties, nor, to
          the best of our ability, to ourselves after hours. Your tasks remain in the database in
          which they were written. Your petals remain on your account. In the unlikely event of
          data loss, we will issue a formal expression of regret, suitable for framing. These
          policies are effective immediately and retroactively, as well as prospectively, which is
          to say: always.
        </p>
      </PageBody>
    </MarketingLayout>
  )
}
