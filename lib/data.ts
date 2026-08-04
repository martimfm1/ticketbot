export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Documentation", href: "#documentation" },
  { label: "GitHub", href: "#github" },
];

export const features = [
  {
    icon: "KeyRound",
    title: "Discord OAuth Login",
    description:
      "Secure authentication through Discord OAuth. Staff log in with their Discord account and get instant access to the dashboard.",
  },
  {
    icon: "LayoutDashboard",
    title: "Interactive Dashboard",
    description:
      "A modern web dashboard that replaces clunky Discord commands. Manage everything from one central hub.",
  },
  {
    icon: "Ticket",
    title: "Ticket Management",
    description:
      "Create, assign, prioritize, and resolve support tickets with a clean, organized interface built for speed.",
  },
  {
    icon: "FileText",
    title: "Transcripts",
    description:
      "Automatically generate and store full conversation transcripts. Search, export, and review past tickets anytime.",
  },
  {
    icon: "ShieldCheck",
    title: "Role Permissions",
    description:
      "Granular role-based access control. Define exactly who can view, manage, and resolve tickets across your team.",
  },
  {
    icon: "Languages",
    title: "Localization",
    description:
      "Full multi-language support. Serve your community in their preferred language with automatic detection.",
  },
  {
    icon: "BarChart3",
    title: "Analytics",
    description:
      "Track response times, ticket volume, and team performance with beautiful, real-time analytics charts.",
  },
  {
    icon: "Server",
    title: "Multi-Server Support",
    description:
      "Manage multiple Discord servers from a single dashboard. Switch between servers without losing context.",
  },
];

export const stats = [
  { label: "Open Tickets", value: "1,284", change: "+12%", trend: "up" },
  { label: "Avg Response", value: "2.4h", change: "-18%", trend: "down" },
  { label: "Resolved Today", value: "347", change: "+24%", trend: "up" },
  { label: "Satisfaction", value: "98.2%", change: "+2.1%", trend: "up" },
];

export const recentTickets = [
  {
    id: "#4821",
    subject: "Payment not reflecting in account",
    user: "alex_m",
    priority: "High",
    status: "Open",
    time: "2m ago",
  },
  {
    id: "#4820",
    subject: "Unable to join voice channel",
    user: "sarah_k",
    priority: "Medium",
    status: "In Progress",
    time: "14m ago",
  },
  {
    id: "#4819",
    subject: "Role permissions not updating",
    user: "mike_r",
    priority: "High",
    status: "Open",
    time: "31m ago",
  },
  {
    id: "#4818",
    subject: "Bot not responding to commands",
    user: "emma_l",
    priority: "Low",
    status: "Resolved",
    time: "1h ago",
  },
  {
    id: "#4817",
    subject: "Request for channel rename",
    user: "david_w",
    priority: "Low",
    status: "Resolved",
    time: "2h ago",
  },
];

export const activityData = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 58 },
  { day: "Thu", value: 78 },
  { day: "Fri", value: 92 },
  { day: "Sat", value: 67 },
  { day: "Sun", value: 54 },
];

export const recentActivity = [
  {
    user: "Jordan",
    action: "resolved ticket #4818",
    time: "1h ago",
    initials: "J",
  },
  {
    user: "Priya",
    action: "assigned ticket #4820 to team",
    time: "2h ago",
    initials: "P",
  },
  {
    user: "Marcus",
    action: "created panel 'Billing Support'",
    time: "3h ago",
    initials: "M",
  },
  {
    user: "Lena",
    action: "updated staff permissions",
    time: "5h ago",
    initials: "L",
  },
];

export const testimonials = [
  {
    quote:
      "SILENTRA transformed how we handle support. Our response times dropped by 60% in the first week.",
    author: "Daniel Reyes",
    role: "Community Manager, Nova Studios",
    initials: "DR",
  },
  {
    quote:
      "The dashboard is so clean our staff needed zero training. It just makes sense.",
    author: "Aiko Tanaka",
    role: "Head of Support, Pixel Forge",
    initials: "AT",
  },
  {
    quote:
      "We manage 12 Discord servers with SILENTRA. Having everything in one place is a game changer.",
    author: "Marcus Webb",
    role: "Operations Lead, Guild Network",
    initials: "MW",
  },
  {
    quote:
      "The analytics alone are worth it. We finally have real visibility into our support performance.",
    author: "Sofia Lindqvist",
    role: "Founder, Nordic Gaming",
    initials: "SL",
  },
  {
    quote:
      "Transcripts and role permissions work flawlessly. This is the tool we needed for years.",
    author: "Rahul Mehta",
    role: "Admin, Apex Community",
    initials: "RM",
  },
  {
    quote:
      "Open source, MIT licensed, and beautifully designed. SILENTRA is everything we wanted.",
    author: "Elena Costa",
    role: "Moderator, Unity Hub",
    initials: "EC",
  },
];

export const faqs = [
  {
    question: "How does SILENTRA Ticket work?",
    answer:
      "Invite the bot to your Discord server, connect it through our dashboard, and manage all your support tickets from a modern web interface. No more cluttered Discord commands.",
  },
  {
    question: "Do I need to pay to use SILENTRA Ticket?",
    answer:
      "SILENTRA Ticket is open source under the MIT license and free to use. You can self-host it or use our hosted version. Premium features may be available in the future.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All data is encrypted in transit and at rest. We use Discord OAuth for authentication and role-based permissions to ensure only authorized staff can access sensitive information.",
  },
  {
    question: "Can I manage multiple Discord servers?",
    answer:
      "Yes. SILENTRA Ticket supports multi-server management. Switch between servers from the dashboard without losing context or needing separate logins.",
  },
  {
    question: "Does it support multiple languages?",
    answer:
      "Yes, SILENTRA Ticket includes full localization support. The interface and ticket responses can be configured for multiple languages to serve your global community.",
  },
  {
    question: "Can I contribute to the project?",
    answer:
      "Absolutely. SILENTRA Ticket is community-driven and open to contributions. Visit our GitHub repository to submit pull requests, report issues, or suggest features.",
  },
];

export const sidebarItems = [
  { icon: "LayoutDashboard", label: "Overview", active: true },
  { icon: "Server", label: "Servers" },
  { icon: "PanelTop", label: "Ticket Panels" },
  { icon: "FolderTree", label: "Categories" },
  { icon: "Users", label: "Staff" },
  { icon: "FileText", label: "Transcripts" },
  { icon: "BarChart3", label: "Analytics" },
  { icon: "Settings", label: "Settings" },
];

export const servers = [
  { name: "Nova Studios", members: "24.5K", initials: "NS", active: true },
  { name: "Pixel Forge", members: "12.8K", initials: "PF", active: false },
  { name: "Apex Community", members: "8.2K", initials: "AC", active: false },
];
