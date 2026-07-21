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
        member.timeout(1000 * filter.timeoutTime, filter.userReason);
    }

    // log this action
    let user_mention = "<@" + member.id + ">";
    let contents = "**Content:**\n```" + message.content + "```";
    var description = filter.logDescription;
    description = description.replace("[@USER]", user_mention);
    let log = Helper.create_log(filter.logTitle, description + "\n\n" + contents, filter.color, member);
    Helper.send_log(log, member.guild, message.channel);
}

// ******************************************************************

import { DiscordClient } from "../../foundation/discord_bot.js";
import { Colors, Helper } from "../helpers.js";
import Discord from "discord.js";
import { Worker } from 'worker_threads';
const GOAL_NAME = "Filter Content";
var pending_messages = {};

// as users send messages, asynchronously process them to find any blocked words and phrases
if (Enforced) {
    console.log("Running Goal: " + GOAL_NAME);
    const worker = new Worker('./discord/goals/goal_threads/filter_content_worker.js', {});
    worker.postMessage({
        type: "setup_filters",
        filters: Filters
    });
    DiscordClient.on(Discord.Events.MessageCreate, (message) => {
        if (Helper.is_member_admin(message.member)) {
            return;
        }
        pending_messages[message.id] = message;
        worker.postMessage({
            type: "ingest_message",
            message
        });
    });

    worker.on("message", (message) => {
        if (message.result == "detected") {
            take_action(pending_messages[message.message.id], message.filter);
        }
        delete pending_messages[message.message.id];
    });
}