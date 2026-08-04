"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is SILENTRA Ticket free to use?",
    answer:
      "Yes. SILENTRA Ticket is open source and free to self-host. A managed cloud version is available for teams who prefer not to operate their own infrastructure.",
  },
  {
    question: "How do I get started?",
    answer:
      "Click 'Add to Discord', authorize the bot on your server, then sign in to the dashboard with Discord OAuth. The entire setup takes under five minutes.",
  },
  {
    question: "Can I manage multiple Discord servers?",
    answer:
      "Yes. The dashboard supports multiple servers from a single account. Switch between them with the server selector in the sidebar.",
  },
  {
    question: "Is my server's data safe?",
    answer:
      "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We use Discord OAuth exclusively — no passwords stored. You can review the full security architecture in the open source repository.",
  },
  {
    question: "What happens to ticket transcripts?",
    answer:
      "Transcripts are stored automatically when a ticket is closed. You can search, export, or delete them at any time from the Transcripts section of the dashboard.",
  },
  {
    question: "Can I customise ticket categories and panels?",
    answer:
      "Yes. You can create unlimited ticket panels with custom categories, assign different staff roles per category, and configure auto-responses for each.",
  },
  {
    question: "Does it support multiple languages?",
    answer:
      "SILENTRA Ticket ships with multi-language support. You can configure the language for both the bot responses in Discord and the web dashboard independently per server.",
  },
  {
    question: "How do I contribute?",
    answer:
      "Fork the repository on GitHub, open a pull request, and describe your change. We review all contributions and merge improvements that align with the project goals.",
  },
];

export function FAQ() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight"
          >
            Common questions.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`${i}`}
                className="glass rounded-xl border border-white/08 px-5 data-[panel-open]:bg-white/05"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
