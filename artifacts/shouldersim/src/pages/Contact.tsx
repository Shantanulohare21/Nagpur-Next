import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle, ArrowRight, Building2, User, Globe, MessageSquare } from "lucide-react";

const roles = ["Surgeon", "Implant Manufacturer", "Researcher", "Hospital Admin", "Other"];
const countries = [
  "United States", "United Kingdom", "Germany", "France", "Netherlands",
  "Canada", "Australia", "Japan", "South Korea", "India", "Brazil", "Other",
];

type FormState = {
  name: string;
  role: string;
  organization: string;
  country: string;
  useCase: string;
};

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: "", role: "", organization: "", country: "", useCase: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.role) e.role = "Please select your role";
    if (!form.organization.trim()) e.organization = "Organization is required";
    if (!form.country) e.country = "Please select your country";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Contact</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Request a Demo</h1>
          <p className="text-[hsl(215,20%,60%)] text-lg max-w-xl">
            See ShoulderSim AI with your own cases. Our clinical team will walk you through a live simulation tailored to your workflow.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-[hsl(160,80%,50%,0.08)] border border-[hsl(160,80%,50%,0.3)] rounded-xl p-10 text-center" data-testid="contact-success">
                <CheckCircle className="w-14 h-14 text-[hsl(160,80%,50%)] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Demo Request Received</h2>
                <p className="text-[hsl(215,20%,60%)] mb-4">
                  Thank you, <span className="text-white font-semibold">{form.name}</span>. A member of our clinical team will reach out within one business day to schedule your personalized demo.
                </p>
                <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-4 text-sm text-left space-y-2 max-w-sm mx-auto mb-6">
                  <div className="flex justify-between">
                    <span className="text-[hsl(215,20%,45%)]">Name</span>
                    <span className="text-white">{form.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(215,20%,45%)]">Role</span>
                    <span className="text-white">{form.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(215,20%,45%)]">Organization</span>
                    <span className="text-white">{form.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(215,20%,45%)]">Country</span>
                    <span className="text-white">{form.country}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", role: "", organization: "", country: "", useCase: "" }); }}
                  className="text-sm text-[hsl(188,100%,45%)] hover:underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-white mb-1.5">
                      <User className="w-3.5 h-3.5 text-[hsl(188,100%,45%)]" />
                      Full Name <span className="text-[hsl(0,62%,50%)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Dr. Sarah Okonkwo"
                      className={`w-full bg-[hsl(222,47%,8%)] border rounded px-3 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,35%)] focus:outline-none focus:border-[hsl(188,100%,45%,0.6)] transition-colors ${errors.name ? "border-[hsl(0,62%,50%)]" : "border-[hsl(217,32%,20%)]"}`}
                      data-testid="input-name"
                    />
                    {errors.name && <p className="text-xs text-[hsl(0,62%,55%)] mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-white mb-1.5">
                      Role <span className="text-[hsl(0,62%,50%)]">*</span>
                    </label>
                    <select
                      value={form.role}
                      onChange={update("role")}
                      className={`w-full bg-[hsl(222,47%,8%)] border rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[hsl(188,100%,45%,0.6)] transition-colors ${errors.role ? "border-[hsl(0,62%,50%)]" : "border-[hsl(217,32%,20%)]"}`}
                      data-testid="select-role"
                    >
                      <option value="">Select your role...</option>
                      {roles.map((r) => <option key={r}>{r}</option>)}
                    </select>
                    {errors.role && <p className="text-xs text-[hsl(0,62%,55%)] mt-1">{errors.role}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-white mb-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[hsl(188,100%,45%)]" />
                      Organization <span className="text-[hsl(0,62%,50%)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={update("organization")}
                      placeholder="Mayo Clinic"
                      className={`w-full bg-[hsl(222,47%,8%)] border rounded px-3 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,35%)] focus:outline-none focus:border-[hsl(188,100%,45%,0.6)] transition-colors ${errors.organization ? "border-[hsl(0,62%,50%)]" : "border-[hsl(217,32%,20%)]"}`}
                      data-testid="input-organization"
                    />
                    {errors.organization && <p className="text-xs text-[hsl(0,62%,55%)] mt-1">{errors.organization}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-white mb-1.5">
                      <Globe className="w-3.5 h-3.5 text-[hsl(188,100%,45%)]" />
                      Country <span className="text-[hsl(0,62%,50%)]">*</span>
                    </label>
                    <select
                      value={form.country}
                      onChange={update("country")}
                      className={`w-full bg-[hsl(222,47%,8%)] border rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[hsl(188,100%,45%,0.6)] transition-colors ${errors.country ? "border-[hsl(0,62%,50%)]" : "border-[hsl(217,32%,20%)]"}`}
                      data-testid="select-country"
                    >
                      <option value="">Select your country...</option>
                      {countries.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    {errors.country && <p className="text-xs text-[hsl(0,62%,55%)] mt-1">{errors.country}</p>}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-white mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[hsl(188,100%,45%)]" />
                    Describe Your Use Case
                  </label>
                  <textarea
                    value={form.useCase}
                    onChange={update("useCase")}
                    rows={4}
                    placeholder="Tell us about your clinical or R&D workflow, volume of shoulder cases, and what you're hoping to achieve with ShoulderSim AI..."
                    className="w-full bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded px-3 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,35%)] focus:outline-none focus:border-[hsl(188,100%,45%,0.6)] transition-colors resize-none"
                    data-testid="textarea-use-case"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                  data-testid="button-submit-contact"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-[hsl(222,47%,6%)] border-t-transparent animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Demo <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-6">
              <h3 className="text-sm font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[hsl(188,100%,45%)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[hsl(215,20%,55%)] text-xs mb-0.5">Email</div>
                    <div className="text-white">contact@shouldersim.ai</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[hsl(188,100%,45%)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[hsl(215,20%,55%)] text-xs mb-0.5">Phone</div>
                    <div className="text-white">+1 (617) 482-9100</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[hsl(188,100%,45%)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[hsl(215,20%,55%)] text-xs mb-0.5">Office</div>
                    <div className="text-white">One Medical Center Drive<br />Boston, MA 02115</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-6">
              <h3 className="text-sm font-bold text-white mb-3">Response Time</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Demo requests", time: "Within 1 business day" },
                  { label: "Enterprise inquiries", time: "Same business day" },
                  { label: "Technical support", time: "2-4 hours (priority)" },
                  { label: "General inquiries", time: "1-2 business days" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[hsl(215,20%,55%)]">{row.label}</span>
                    <span className="text-[hsl(188,100%,45%)] text-xs font-semibold">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[hsl(188,100%,45%,0.06)] border border-[hsl(188,100%,45%,0.2)] rounded-lg p-5 text-sm text-[hsl(215,20%,60%)]">
              <div className="font-semibold text-white mb-1.5 text-xs uppercase tracking-widest">What to Expect</div>
              <ul className="space-y-1.5 text-xs">
                {["30-minute live platform walkthrough", "Simulation using an anonymized case similar to yours", "Integration and implementation Q&A", "Custom pricing proposal within 48 hours"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-[hsl(188,100%,45%)] shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
