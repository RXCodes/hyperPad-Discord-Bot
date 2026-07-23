// ******************************************************************
// GOAL: don't let user send toxic messages
// uses a lightweight language model to determine message toxicity

// whether this goal is enforced or not - set false to disable
const Enforced = true;

// the minimum toxicity scores needed to take an action (range: 0-1)
const ToxicityThresholds = {
    "severe_toxicity": 0.95,
    "threat": 0.925,
    "obscene": 0.95,
    "sexual_explicit": 0.95,
    "identity_attack": 0.925,
    "insult": 0.9,
    "toxicity": 0.89
};

// actions to take based on severity of the offense
// offenses: "severe_toxicity", "threat", "obscene", "sexual_explicit", "identity_attack", "insult", "toxicity"
const OffenseActions = {
    "severe_toxicity": {
        timeoutTime: 60 * 60 * 48,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] sent a message that was severely toxic. Discrimination and bullying will not be tolerated.",
        userReason: "You sent a message that was severely toxic. Please follow server rules and be nice to others.",
        color: Colors.warn
    },
    "threat": {
        timeoutTime: 0,
        logTitle: "🛑 Threat Removed",
        logDescription: "[@USER] sent a threat. Intention to harm or inflict damage to someone will not be tolerated.",
        userReason: "You sent a threat in the server.",
        kick: true,
        color: Colors.red
    },
    "obscene": {
        timeoutTime: 60 * 60 * 24,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] sent an obscene message.",
        userReason: "You sent a message that was obscene, violating server rules.",
        color: Colors.warn
    },
    "sexual_explicit": {
        timeoutTime: 60 * 60 * 24,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] sent a sexually explicit message.",
        userReason: "You sent a message that was sexually explicit, violating server rules.",
        color: Colors.warn
    },
    "identity_attack": {
        timeoutTime: 60 * 60 * 12,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] is potentially engaging in deceptive activities. Scams and identity attacks will not be tolerated.",
        userReason: "You are potentially engaging in deceptive activities, violating server rules.",
        color: Colors.warn
    },
    "insult": {
        timeoutTime: 60 * 60 * 12,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] sent an insulting message. Discrimination and bullying will not be tolerated.",
        userReason: "You sent an insulting message, violating server rules.",
        color: Colors.warn
    },
    "toxicity": {
        timeoutTime: 60 * 30,
        logTitle: "⚠️ User Timed Out",
        logDescription: "[@USER] sent a potentially toxic message. Please follow rules and be nice to others.",
        userReason: "You sent a toxic message, violating server rules.",
        color: Colors.warn
    }
};

// the action to take on a user that violates this goal
function take_action(member, channel, message, offense) {
    // delete the offending message
    message.delete();

    // get the offense action
    const offense_action = OffenseActions[offense];

    // time out member for specified amount of time
    if (offense_action.timeoutTime > 0) {
        member.timeout(1000 * offense_action.timeoutTime, offense_action.userReason);
    }

    // kick if specified
    if (offense_action.kick) {
        member.kick(offense_action.userReason);
    }

    // log this action
    let user_mention = "<@" + member.id + ">";
    let contents = "**Content:**\n```" + message.content + "```";
    let description = offense_action.logDescription;
    description = description.replace("[@USER]", user_mention);
    let log = Helper.create_log(offense_action.logTitle, description + "\n\n" + contents, offense_action.color, member);
    Helper.send_log(log, member.guild, channel);
}

// ******************************************************************

import { DiscordInteractionRouter } from "../interaction_router.js";
import { Colors, Helper } from "../helpers.js";
import { Worker } from "worker_threads";
const GOAL_NAME = "Reduce Toxicity";
const pending_messages = {};

// as users send messages, track them in client_message_mapping
if (Enforced) {
    console.log("Running Goal: " + GOAL_NAME);
    const worker = new Worker('./discord/goals/goal_threads/reduce_toxicity_worker.js', {});
    DiscordInteractionRouter.register_message_event(2, (message) => {
        if (message.author.bot) {
            return;
        }
        if (Helper.is_member_admin(message.member)) {
            return;
        }
        if (message.content.split(" ").length < 2) {
            return;
        }
        pending_messages[message.id] = message;
        worker.postMessage({
            thresholds: ToxicityThresholds,
            message
        });
    });

    worker.on("message", (message) => {
        // all labels from most offensive to least offensive
        const ranked_offensive_labels = [
            "severe_toxicity",
            "threat",
            "obscene",
            "sexual_explicit",
            "identity_attack",
            "insult",
            "toxicity"
        ];

        // get the discord message object
        const discord_message = pending_messages[message.message_id];
        delete pending_messages[message.message_id];

        // check for matches - take action based on highest offense
        for (const offensive_label of ranked_offensive_labels) {
            if (message.matches[offensive_label]) {
                if (DiscordInteractionRouter.request_action_on_message(message)) {
                    take_action(discord_message.member, discord_message.channel, discord_message, offensive_label);
                }
                return;
            }
        }
    });
}