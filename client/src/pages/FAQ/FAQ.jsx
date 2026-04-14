import MarketingLayout from '../../components/MarketingLayout/MarketingLayout'
import PageMasthead from '../../components/MarketingLayout/PageMasthead'
import PageBody from '../../components/MarketingLayout/PageBody'

const FAQS = [
  {
    q: 'Is Kandew free?',
    a: "Yes. Kandew is a student project; there's nothing to pay for.",
  },
  {
    q: "What's a petal?",
    a: 'A small unit of completion. Tasks moving to "done" earn petals, which a team manager can optionally tie to a dollar value.',
  },
  {
    q: 'How big should my team be?',
    a: 'Two to about ten. Larger than that and the board starts to feel crowded.',
  },
  {
    q: 'Does Kandew work offline?',
    a: 'No. The board syncs through a server and needs a connection to stay in sync.',
  },
]

export default function FAQ() {
  return (
    <MarketingLayout>
      <PageMasthead
        eyebrow="Frequently Asked"
        title="Questions,"
        accent="answered."
        lead="Everything you might wonder about Kandew, the petal system, and the small teams it was built for."
      />
      <PageBody>
        <div className="flex flex-col">
          {FAQS.map((item, i) => (
            <div
              key={item.q}
              className={`py-5 ${i === 0 ? 'first:pt-0' : 'border-t border-outline/80'}`}
            >
              <h3 className="text-base font-semibold mb-1">{item.q}</h3>
              <p className="text-[0.9375rem] leading-normal text-on-surface-variant">{item.a}</p>
            </div>
          ))}
        </div>
      </PageBody>
    </MarketingLayout>
  )
}
