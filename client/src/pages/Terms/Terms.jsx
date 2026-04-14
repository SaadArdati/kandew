import MarketingLayout from '../../components/MarketingLayout/MarketingLayout'
import PageMasthead from '../../components/MarketingLayout/PageMasthead'
import PageBody from '../../components/MarketingLayout/PageBody'

export default function Terms() {
  return (
    <MarketingLayout>
      <PageMasthead
        eyebrow="Terms of Service"
        title="The fine print,"
        accent="finer than expected."
        lead="Everything that is binding, condensed into a single paragraph."
      />
      <PageBody>
        <p className="text-[0.9375rem] leading-relaxed text-on-surface-variant">
          By using Kandew, you agree that petals are the superior unit of labor accounting and shall
          not be exchanged for legal tender outside the platform, outside the solar system, or after
          9 p.m. local time. You further agree not to hold Kandew, its operators, or its roses
          liable for moments of unwarranted productivity, minor euphoria upon task completion, or a
          gentle reorientation of personal priorities. Kandew reserves the right to amend these
          terms if the roses demand it, if a meeting runs long, or if a particularly compelling
          argument is made in the break room.
        </p>
      </PageBody>
    </MarketingLayout>
  )
}
