import { Link } from '~/components/link';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';

export function VirtualCareAppointmentClient({ bookingsUrl }: { bookingsUrl: string | null }) {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 pb-10">
      <Link className="text-sm font-medium text-[#375a37] hover:underline" href="/account/virtual-care">
        ‹ Virtual care
      </Link>
      <OnboardingSectionHeader
        description="Pick a date and time on the booking page. You'll get a confirmation after you book."
        kicker="Appointments"
        titleAccent="appointment"
        titleBefore="Book an "
      />

      {bookingsUrl ? (
        <div className="space-y-3">
          <iframe
            className="h-[min(900px,80vh)] w-full rounded-2xl border border-[#e5dfd5] bg-white"
            src={bookingsUrl}
            title="Book an appointment"
          />
          <a
            className="inline-flex text-sm font-medium text-[#375a37] hover:underline"
            href={bookingsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open booking page
          </a>
        </div>
      ) : (
        <div className="rounded-xl border border-[#e5dfd5] bg-white px-4 py-3 text-sm text-[#2c2a26]">
          Booking is not configured yet.
        </div>
      )}
    </section>
  );
}
