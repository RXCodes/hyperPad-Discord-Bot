// ******************************************************************
// GOAL: don't let user send their job applications/resume over chat
// searches for flags that are often in job postings and blocks them if too many flags are found

// whether this goal is enforced or not - set false to disable
const Enforced = true;

// minimum length that a message needs to be to even be considered as a resume
const MessageLengthThreshold = 250;

// how many flags are raised before taking action
const FlagThreshold = 6;

// flags in the message to look for
const Flags = [

    /// experience
    [
        "years of experience",
        "my expertise",
        "practical experience",
        "my background"
    ],

    /// common phrases
    [
        "professional summary",
        "career objective",
        "objective statement",
        "work experience",
        "professional experience",
        "employment history",
        "work history",
        "career history",
        "relevant experience",
        "key qualifications",
        "core competencies",
        "technical skills",
        "soft skills",
        "hard skills",
        "areas of expertise",
        "key achievements",
        "professional achievements",
        "career highlights",
        "selected accomplishments",
        "professional profile",
        "personal profile",
        "education",
        "academic background",
        "certifications",
        "professional certifications",
        "licenses and certifications",
        "projects",
        "relevant projects",
        "volunteer experience",
        "leadership experience",
        "professional development",
        "continuing education",
        "awards and honors",
        "honors and awards",
        "publications",
        "languages",
        "interests",
        "references available upon request",
        "available upon request",
        "authorized to work",
        "willing to relocate",
        "willing to travel",
        "eligible to work",
        "strong communication skills",
        "excellent communication skills",
        "team player",
        "self motivated",
        "self-starter",
        "detail oriented",
        "results driven",
        "goal oriented",
        "customer focused",
        "problem solving",
        "critical thinking",
        "time management",
        "project management",
        "cross functional",
        "fast paced environment",
        "highly organized",
        "proven track record",
        "exceeded expectations",
        "exceeded sales targets",
        "increased efficiency",
        "improved productivity",
        "reduced costs",
        "managed projects",
        "led cross functional teams",
        "collaborated with stakeholders",
        "developed solutions",
        "implemented processes",
        "streamlined operations",
        "trained new employees",
        "mentored team members",
        "performed quality assurance",
        "analyzed data",
        "conducted research",
        "prepared reports",
        "managed budgets",
        "coordinated activities",
        "provided customer support",
        "maintained compliance",
        "resolved customer issues",
        "built client relationships",
        "exceeded performance goals",
        "achieved business objectives",
        "delivered measurable results",
        "improved customer satisfaction",
        "supported daily operations",
        "created documentation",
        "managed inventory",
        "scheduled appointments",
        "maintained records",
        "processed transactions",
        "optimized workflows",
        "performed administrative duties",
        "excellent organizational skills",
        "effective communicator",
        "strong interpersonal skills",
        "works well under pressure",
        "ability to multitask",
        "adaptable and flexible",
        "proficient in microsoft office",
        "proficient in excel",
        "experience with sql",
        "experience with python",
        "experience with java",
        "experience with javascript",
        "experience with aws",
        "experience with git",
        "experience with agile",
        "experience with scrum"
    ],

    /// resume lingo
    [
        "achieved",
        "adaptable",
        "analysis",
        "analytical",
        "assisted",
        "attentive",
        "budget",
        "built",
        "business",
        "certification",
        "certified",
        "collaborated",
        "collaboration",
        "communication",
        "compliance",
        "conducted",
        "confidential",
        "coordinated",
        "created",
        "creative",
        "customer service",
        "dedicated",
        "delivered",
        "demonstrated",
        "designed",
        "detail-oriented",
        "developed",
        "driven",
        "efficient",
        "employment",
        "enhanced",
        "ensured",
        "established",
        "evaluated",
        "experience",
        "expertise",
        "facilitated",
        "goal-oriented",
        "handled",
        "implemented",
        "improved",
        "independent",
        "initiative",
        "innovative",
        "integrity",
        "interpersonal",
        "knowledge",
        "lead",
        "leader",
        "leadership",
        "managed",
        "management",
        "mentored",
        "metrics",
        "motivated",
        "multitasking",
        "negotiated",
        "objective",
        "operated",
        "organized",
        "performance",
        "planned",
        "portfolio",
        "problem solving",
        "process",
        "professional",
        "project",
        "promoted",
        "provided",
        "qualified",
        "quality",
        "reduced",
        "reliable",
        "research",
        "resolved",
        "responsible",
        "results",
        "sales",
        "scheduled",
        "skills",
        "software",
        "strategic",
        "strengths",
        "supervised",
        "supported",
        "team",
        "teamwork",
        "technical",
        "time management",
        "trained",
        "training",
        "troubleshooting",
        "volunteer",
        "work ethic",
        "workflow",
        "microsoft office",
        "excel",
        "word",
        "powerpoint",
        "outlook",
        "google workspace",
        "bachelor",
        "master",
        "associate",
        "degree",
        "gpa",
        "education",
        "references",
        "resume",
        "cover letter",
        "curriculum vitae",
        "cv",
        "employment history",
        "work history",
        "accomplishments",
        "responsibilities",
        "achievements",
        "availability",
        "salary expectations"
    ],

    /// contact methods
    [
        "email",
        "e-mail",
        "email address",
        "phone",
        "phone number",
        "mobile",
        "cell",
        "telephone",
        "contact",
        "contact information",
        "contact info",
        "address",
        "mailing address",
        "street address",
        "city",
        "state",
        "province",
        "zip",
        "zipcode",
        "postal code",
        "country",
        "linkedin",
        "linkedin.com/in",
        "github",
        "github.com",
        "portfolio",
        "portfolio website",
        "personal website",
        "website",
        "web site",
        "homepage",
        "online portfolio",
        "behance",
        "dribbble",
        "medium",
        "stackoverflow",
        "stack overflow",
        "gitlab",
        "bitbucket",
        "x.com",
        "twitter",
        "instagram",
        "facebook",
        "discord",
        "telegram",
        "signal",
        "skype",
        "whatsapp",
        "available upon request",
        "references available upon request",
        "preferred contact",
        "preferred method of contact",
        "reach me at",
        "contact me at",
        "you can reach me",
        "call me",
        "text me",
        "send me an email",
        "email me",
        "connect with me",
        "linkedin profile",
        "github profile",
        "portfolio link",
        "website:",
        "email:",
        "phone:",
        "mobile:",
        "address:",
        "linkedin:",
        "github:",
        "portfolio:",
        "@gmail.com",
        "@outlook.com",
        "@hotmail.com",
        "@yahoo.com",
        "@icloud.com",
        "@proton.me",
        "@protonmail.com",
        "@live.com",
        "@me.com"
    ]
];

// the action to take on a user that violates this goal
function take_action(member, channel, message) {
    // delete the offending spam message
    message.delete();

    // time out member for 10 minutes
    Helper.timeout_member(member,60 * 10, "This server is not taking any applicants at the moment, and this is not the place to send applications.");

    // log this action
    let user_mention = "<@" + member.id + ">";
    let contents = "**Resume:**\n```" + message.content + "```";
    let log = Helper.create_log("⛔️ Application Rejected", user_mention + " sent over their resume that nobody cares about.\n\n" + contents, Colors.red, member);
    Helper.send_log(log, member.guild, channel);
}

// ******************************************************************

import { DiscordInteractionRouter } from "../interaction_router.js";
import { Colors, Helper } from "../helpers.js";
import { HomoglyphMapHelper } from "../homoglyph_map.js";
const GOAL_NAME = "Reject Job Offers";

// as users send messages, track them in client_message_mapping
if (Enforced) {
    console.log("Running Goal: " + GOAL_NAME);
    DiscordInteractionRouter.register_message_event(1, (message) => {
        if (message.content.length < MessageLengthThreshold) {
            return;
        }
        if (message.author.bot) {
            return;
        }
        if (Helper.is_member_admin(message.member)) {
            return;
        }

        // normalize the text for analysis
        const normalized_message = HomoglyphMapHelper.normalize_text(message.content);

        // search for flags
        let flags_counted = 0;
        for (const flag_list of Flags) {
            for (const flag of flag_list) {
                let occurrences = normalized_message.split(flag).length - 1;
                flags_counted += occurrences;
            }
        }

        // take action if flags exceeds set threshold
        if (flags_counted >= FlagThreshold) {
            try {
                if (DiscordInteractionRouter.request_action_on_message(message)) {
                    take_action(message.member, message.channel, message);
                }
            } catch (e) {}
        }
    });
}