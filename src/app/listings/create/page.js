import { redirect } from 'next/navigation'

/**
 * /listings/create → redirects to /dashboard
 * The property creation form lives inside the Dashboard page.
 * When a standalone "Create listing" page is built, replace this redirect.
 */
export default function CreateListingPage() {
  redirect('/dashboard')
}
