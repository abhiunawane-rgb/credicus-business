import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/container";
import IconBadge from "@/components/ui/icon-badge";
import ContactForm from "@/components/website/contact-form";

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@credicus.com" },
  { icon: Phone, label: "Phone", value: "+91 90000 00000" },
  { icon: MapPin, label: "Location", value: "Pune, Maharashtra, India" },
  { icon: Clock, label: "Response time", value: "Within 24 hours" },
];

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <p className="ui-kicker">Contact</p>
              <h1 className="ui-page-title">Let&apos;s discuss your hiring goals.</h1>
              <p className="ui-page-subtitle">
                Share your requirements and our team will get back to you with a tailored recruitment
                plan.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {contactInfo.map((item) => (
                <div key={item.label} className="ui-card flex items-start gap-3 p-4">
                  <IconBadge icon={item.icon} variant="light" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-credicus-gray">{item.label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
