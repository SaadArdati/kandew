import MarketingLayout from '../../components/MarketingLayout/MarketingLayout'
import PageMasthead from '../../components/MarketingLayout/PageMasthead'
import PageBody from '../../components/MarketingLayout/PageBody'

const SECTIONS = [
  {
    heading: 'Who built it',
    body: 'Kandew was built by four students at the Lebanese American University: Saad Ardati, Leen Nassar, Nour Mardini, and Lynn Hamieh. Saad set up the project, designed the MVVM architecture and repository pattern, and built the kanban home page and the tasks list view. Leen built the team creation and team management pages, including invite and kick flows. Nour built the task creation and task details dialogs, the account settings page, and designed the petal-based scoring system. Lynn built the login, register, forgot password, and profile setup pages. No one was paid in petals, which is fortunate.',
  },
  {
    heading: 'What it is',
    body: 'A Kanban board for small teams. Drag tasks between Backlog, In Progress, Review, and Done. Assign them to members, set priorities, add due dates, and watch the petal count decrease as the deadline approaches. Filter the board by assignee, priority, or a search term, and switch between teams from a sidebar. The app is built with React 19, React Router 7, Tailwind CSS 4, and Vite 7, and it supports both light and dark themes.',
  },
  {
    heading: 'What it is not',
    body: 'Kandew is not a real company or a product for sale.',
  },
]

export default function About() {
  return (
    <MarketingLayout>
      <PageMasthead
        eyebrow="About"
        title="A small Kanban,"
        accent="grown carefully."
        lead="Kandew is a student project out of the Lebanese American University. A Kanban board for small teams, built by four of us as an excuse to make something tidy and opinionated."
      />
      <PageBody>
        <div className="flex flex-col">
          {SECTIONS.map((item, i) => (
            <div
              key={item.heading}
              className={`py-5 ${i === 0 ? 'first:pt-0' : 'border-t border-outline/80'}`}
            >
              <h3 className="text-base font-semibold mb-2">{item.heading}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-on-surface-variant">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </PageBody>
    </MarketingLayout>
  )
}
