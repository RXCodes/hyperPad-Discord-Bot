// ******************************************************************
// GOAL: don't let user say X where X is a blacklisted word/phrase
// block words and phrases that violate server rules

// whether this goal is enforced or not - set false to disable
const Enforced = true;

// list of things that should NEVER be said in ANY context
import { SevereFilterList } from "../filter_lists/Severe.js";

// list of things that makes a message look like a scam
import { PotentialScamsFilterList } from "../filter_lists/PotentialScams.js";

// list of all filters to use along with their settings
const Filters = [
    {
        name: "Severe Filter",
        list: SevereFilterList,
        timeoutTime: 60 * 30,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] sent a message that contained content that violated server rules.",
        userReason: "You sent a message that contained content that violated server rules.",
        color: Colors.warn
    },
    {
        name: "Scam Filter",
        list: PotentialScamsFilterList,
        timeoutTime: 60 * 10,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] sent a message that looks like a potential scam.",
        userReason: "You sent a message that looked deceptive. Scams are not tolerated.",
        color: Colors.warn
    }
];

// the action to take on a message that violates this goal
function take_action(message, filter) {
    // delete the offending message
    message.delete();

    // time out member for specified time by filter
    let member = message.member;
    if (filter.timeoutTime > 0) {
        Helper.timeout_member(member, filter.timeoutTime, filter.userReason);
    }

    // log this action
    let user_mention = "<@" + member.id + ">";
    let contents = "**Content:**\n```" + message.content + "```";
    let description = filter.logDescription;
    description = description.replace("[@USER]", user_mention);
    let log = Helper.create_log(filter.logTitle, description + "\n\n" + contents, filter.color, member);
    Helper.send_log(log, member.guild, message.channel);
}

// the action to take on a chain of messages that violates this goal
function take_action_on_chain(messages, message_contents, member, filter) {
    // delete the offending messages
    Helper.delete_messages(messages);

    // time out member for specified time by filter
    if (filter.timeoutTime > 0) {
        Helper.timeout_member(member, filter.timeoutTime, filter.userReason);
    }

    // log this action
    let user_mention = "<@" + member.id + ">";
    let contents = "**Content:**\n```" + message_contents + "```";
    let description = filter.logDescription;
    description = description.replace("[@USER]", user_mention);
    let log = Helper.create_log(filter.logTitle, description + "\n\n" + contents, filter.color, member);
    Helper.send_log(log, member.guild, messages[0].channel);
}

// ******************************************************************

import { DiscordInteractionRouter } from "../interaction_router.js";
import { Colors, Helper } from "../helpers.js";
import { Worker } from 'worker_threads';
import { v4 as uuid4 } from 'uuid';
const GOAL_NAME = "Filter Content";
const pending_messages = {};
const pending_message_chains = {};

// as users send messages, asynchronously process them to find any blocked words and phrases
if (Enforced) {
    console.log("Running Goal: " + GOAL_NAME);
    const worker = new Worker('./discord/goals/goal_threads/filter_content_worker.js', {});
    worker.postMessage({
        type: "setup_filters",
        filters: Filters
    });
    DiscordInteractionRouter.register_message_event(1, (message) => {
        if (message.author.bot) {
            return;
        }
        if (Helper.is_member_admin(message.member)) {
            return;
        }
        pending_messages[message.id] = message;
        worker.postMessage({
            type: "ingest_message",
            message
        });
    });

    DiscordInteractionRouter.register_message_chain_event(2, (messages, member) => {
        if (member.bot) {
            return;
        }
        if (Helper.is_member_admin(member)) {
            return;
        }
        let message_contents = [];
        for (const message of messages) {
            message_contents.push(message.content);
        }
        let full_message = message_contents.join("");
        let id = uuid4();
        pending_message_chains[id] = {
            messages, member, full_message
        };
        worker.postMessage({
            type: "ingest_message_chain",
            contents: full_message,
            message_id: id
        });
    });

    worker.on("message", (message) => {
        if (message.type === "ingest_message") {
            if (message.result === "detected") {
                console.log("Filter Detected Term: ", message.word);
                try {
                    let discord_message = pending_messages[message.message_id];
                    if (DiscordInteractionRouter.request_action_on_message(discord_message)) {
                        take_action(discord_message, message.filter);
                    }
                } catch (e) {}
            }
            delete pending_messages[message.message_id];
        }
        if (message.type === "ingest_message_chain") {
            if (message.result === "detected") {
                console.log("Filter Detected Term in Chain: ", message.word);
                try {
                    let chain_data = pending_message_chains[message.message_id];
                    if (DiscordInteractionRouter.request_action_on_message_chain(chain_data.messages)) {
                        take_action_on_chain(chain_data.messages, chain_data.full_message, chain_data.member, message.filter);
                    }
                } catch (e) {}
            }
            delete pending_message_chains[message.message_id];
        }
    });

}