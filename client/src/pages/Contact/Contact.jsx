import { useState } from 'react'
import MarketingLayout from '../../components/MarketingLayout/MarketingLayout'
import PageMasthead from '../../components/MarketingLayout/PageMasthead'
import PageBody from '../../components/MarketingLayout/PageBody'

function validate({ name, email, message }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address.'
  if (message.trim().length < 10) errors.message = 'Tell us a little more. At least 10 characters.'
  return errors
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 600)
  }

  function reset() {
    setForm({ name: '', email: '', message: '' })
    setErrors({})
    setSent(false)
  }

  return (
    <MarketingLayout>
      <PageMasthead
        eyebrow="Contact"
        title="Say hello,"
        accent="softly."
        lead="Questions, bug reports, or kind notes, all welcome in the same inbox."
      />
      <PageBody>
        {sent ? (
          <div className="py-8">
            <h2 className="font-display text-3xl leading-tight text-on-surface">Sent.</h2>
            <p className="mt-3 text-on-surface-variant leading-relaxed">
              Thanks. A petal has been dispatched in your direction.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 text-sm font-semibold text-primary bg-transparent border-0 p-0 cursor-pointer hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm"
            >
              Send another →
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className={`flex flex-col gap-5 transition-opacity duration-200 ${
              submitting ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <Field
              id="contact-name"
              label="Name"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              autoComplete="name"
            />
            <Field
              id="contact-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              autoComplete="email"
            />
            <Field
              id="contact-message"
              label="Message"
              as="textarea"
              rows={5}
              value={form.message}
              onChange={update('message')}
              error={errors.message}
            />
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center text-base font-semibold text-white bg-primary px-8 py-3 rounded-xl transition-all duration-150 ease-out hover:opacity-92 hover:-translate-y-px active:opacity-85 active:translate-y-0 disabled:opacity-70 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 max-sm:w-full"
              >
                {submitting ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </PageBody>
    </MarketingLayout>
  )
}

function Field({
  id,
  label,
  error,
  as = 'input',
  type = 'text',
  rows,
  value,
  onChange,
  autoComplete,
}) {
  const errorId = `${id}-error`
  const commonClass = `w-full px-4 py-3 rounded-xl bg-surface-container border border-outline/80 text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
    error ? 'border-secondary' : ''
  }`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-on-surface">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={commonClass}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={commonClass}
        />
      )}
      {error && (
        <p id={errorId} className="text-sm text-secondary">
          {error}
        </p>
      )}
    </div>
  )
}
