// ******************************************************************
// GOAL: don't let user send messages at over X wpm
// if user seems to be typing at super-human speed (or spamming messages),
// then we can take action for spamming (400wpm is used as threshold by default)

// whether this goal is enforced or not - set false to disable
const Enforced = true;

// the maximum theoretical typing speed to start taking action
const ThresholdWPM = 350;

// the time it takes until a flag expires (in seconds)
const ThresholdTimeRange = 15;

// how many flags needed within the specified time range before taking action
const ThresholdFlags = 2;

// the amount of time to start deleting messages when taking action (in seconds)
const ActionDeletionTime = 30;

// the action to take on a user that violates this goal
function take_action(member, channel) {
    // delete the offending spam messages
    Helper.delete_messages(client_last_messages[member.id]);
    client_last_messages[member.id] = [];

    // time out member for 5 minutes
    Helper.timeout_member(member, 60 * 5, "You are sending too much content very quickly!");

    // log this action
    let user_mention = "<@" + member.id + ">";
    let log = Helper.create_log("⚠️ User Timed Out", user_mention + " was spamming too much content very quickly.", Colors.warn, member);
    Helper.send_log(log, member.guild, channel);
}

// ******************************************************************

import { DiscordInteractionRouter } from "../interaction_router.js";
import { Colors, Helper } from "../helpers.js";
const client_last_messages = {};
const client_last_timestamp = {};
const client_flags_mapping = {};
const GOAL_NAME = "Typing Cooldown";

// remove messages that are no longer within the decay time
function refresh_message_mapping() {
    for (const [key, value] of Object.entries(client_flags_mapping)) {
        let timestamps = value;
        timestamps = timestamps.filter(time => Date.now() - time <= ThresholdTimeRange * 1000);
        client_flags_mapping[key] = timestamps;
    }
    for (const [key, value] of Object.entries(client_last_messages)) {
        let messages = value;
        messages = messages.filter(message => Date.now() - message.createdTimestamp <= ActionDeletionTime * 1000);
        client_last_messages[key] = messages;
    }
}

// as users send messages, track timestamps in client_last_timestamp
if (Enforced) {
    console.log("Running Goal: " + GOAL_NAME);
    DiscordInteractionRouter.register_message_event(5, (message) => {
        if (message.author.bot) {
            return;
        }
        if (Helper.is_member_admin(message.member)) {
            return;
        }
        let user_messages = client_last_messages[message.author.id] || [];
        user_messages.push(message);
        client_last_messages[message.author.id] = user_messages;
        refresh_message_mapping();

        // get last timestamp
        let last_timestamp = client_last_timestamp[message.author.id];

        // if no timestamp is recorded, get the join time
        if (!last_timestamp) {
            last_timestamp = message.member.joinedTimestamp / 1000;
        }

        // calculate words per minute - assuming average word is 5 characters
        let delta_seconds = (Date.now() / 1000) - last_timestamp;
        let characters_typed = message.content.length;
        let characters_per_second = characters_typed / delta_seconds;
        let words_per_second = characters_per_second / 5;
        let words_per_minute = words_per_second * 60;
        client_last_timestamp[message.author.id] = message.createdTimestamp / 1000;

        // flag if exceeding ThresholdWPM
        if (words_per_minute >= ThresholdWPM) {
            let client_flags = client_flags_mapping[message.author.id] || [];
            client_flags.push(Date.now());
            if (client_flags.length >= ThresholdFlags) {
                try {
                    if (DiscordInteractionRouter.request_action_on_message(message)) {
                        take_action(message.member, message.channel);
                    }
                } catch (e) {}
            }
            client_flags_mapping[message.author.id] = client_flags;
        }
    });
}