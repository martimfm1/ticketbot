import Link from "next/link";
import BackButton from "@/components/BackButton";

const faqs = [
  {
    question: "What is SILENTRA Ticket Bot?",
    answer:
      "SILENTRA Ticket Bot is a Discord ticket management bot designed to help communities organize and manage support requests through private ticket channels.",
  },
  {
    question: "Is SILENTRA Ticket Bot free?",
    answer:
      "Yes. SILENTRA Ticket Bot is available for free and can be added to your Discord server without a paid subscription.",
  },
  {
    question: "What do I need to use the bot?",
    answer:
      "You only need a Discord server where you have permission to manage the server and the required permissions to configure bots.",
  },
  {
    question: "How do I add SILENTRA to my server?",
    answer:
      "Use the official Discord OAuth2 invite link for your SILENTRA application. Authorize the requested permissions and select the server where you want to install the bot.",
  },
  {
    question: "How do I configure the bot?",
    answer:
      "After adding the bot, use the configuration command to configure the ticket category, staff role, transcript channel and server language.",
  },
  {
    question: "How does a user create a ticket?",
    answer:
      "Users interact with the ticket panel and select the option to open a ticket. SILENTRA then displays a modal where the user can enter the ticket subject.",
  },
  {
    question: "Are tickets private?",
    answer:
      "Yes. Ticket channels are created with Discord permission overwrites so that the ticket owner and configured staff role can access the channel.",
  },
  {
    question: "Who can access a ticket?",
    answer:
      "The ticket creator and the configured staff or administrator role can access the ticket. Other server members are denied access by default.",
  },
  {
    question: "Can staff close tickets?",
    answer:
      "Yes. Authorized staff members can use the ticket controls to close tickets and trigger the configured closing and transcript workflow.",
  },
  {
    question: "Are tickets stored in a database?",
    answer:
      "Yes. SILENTRA uses Supabase to store server configuration and ticket information such as the guild ID, ticket channel, user and ticket subject.",
  },
  {
    question: "What happens if the bot restarts?",
    answer:
      "Persistent Discord views are registered again when the bot starts, allowing ticket buttons and other persistent interactions to continue working after a restart.",
  },
  {
    question: "Does the bot need to stay online?",
    answer:
      "Yes. SILENTRA needs to be running in order to process Discord interactions and respond to users. The bot can be hosted on a VPS, server or another environment capable of running Python continuously.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "SILENTRA supports localized server messages through its translation system. English and Portuguese variants can be configured depending on the available translation files.",
  },
  {
    question: "Can I customize the ticket system?",
    answer:
      "Yes. The bot is designed with configurable server settings, allowing each server to define its own ticket category, staff role, transcript channel and language.",
  },
  {
    question: "What permissions does the bot need?",
    answer:
      "The bot requires permissions necessary to create and manage ticket channels, send messages, read message history, manage messages, embed content and handle attachments.",
  },
  {
    question: "Why can't users create tickets?",
    answer:
      "Check that the ticket category, staff role and transcript channel have been configured correctly. The bot validates these settings before creating a ticket.",
  },
  {
    question: "Why can't the bot create a ticket channel?",
    answer:
      "Make sure the bot has permission to view and manage channels and that its role is positioned correctly in the Discord server role hierarchy.",
  },
  {
    question: "Where can I report a bug?",
    answer:
      "Bugs and technical issues should be reported through the project's GitHub repository or the official SILENTRA support channels.",
  },
  {
    question: "Is SILENTRA open source?",
    answer:
      "Yes. The SILENTRA Ticket Bot source code is publicly available on GitHub, allowing developers to inspect, learn from and contribute to the project.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="fixed left-6 top-6 z-50">
          <BackButton />
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Frequently Asked Questions
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Answers to the most common questions about SILENTRA Ticket Bot,
            including installation, configuration, tickets and troubleshooting.
          </p>
        </header>

        <section className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-zinc-800 bg-zinc-950/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-medium text-zinc-100">
                <span>
                  <span className="mr-3 text-zinc-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {faq.question}
                </span>

                <span className="shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
                <p className="pl-9 text-sm leading-6 text-zinc-400">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </section>

        <section className="mt-12 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-base font-medium text-zinc-100">
            Still need help?
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            If your question is not answered here, check the Getting Started
            guide or the API Reference for more technical information.
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link
              href="/docs/getting-started"
              className="text-zinc-200 hover:underline"
            >
              Getting Started →
            </Link>

            <Link href="/docs/api" className="text-zinc-200 hover:underline">
              API Reference →
            </Link>

            <a
              href="https://github.com/martimfm1/silentra-ticket"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:underline"
            >
              GitHub →
            </a>
          </div>
        </section>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-500">
            Return to the{" "}
            <Link href="/docs" className="text-foreground hover:underline">
              documentation index
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
