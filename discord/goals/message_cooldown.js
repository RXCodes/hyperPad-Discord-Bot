// ******************************************************************
// GOAL: don't let user send X messages over Y seconds
// 6 messages within 8 seconds is considered as spam by default

// whether this goal is enforced or not - set false to disable
const Enforced = true;

// how many messages that can be sent before taking action
const ThresholdTimes = 6;

// the timeframe that a group of messages is considered spam
const DecayTime = 8;

// the action to take on a user that violates this goal
function take_action(member, channel) {
    // delete the offending spam messages
    Helper.delete_messages(client_message_mapping[member.id]);
    client_message_mapping[member.id] = [];

    // time out member for 5 minutes
    member.timeout(1000 * 60 * 5, "You are sending too many messages too fast!")

    // log this action
    let user_mention = "<@" + member.id + ">";
    let log = Helper.create_log("⚠️ User Timed Out", user_mention + " sent too many messages too fast!", Colors.warn, member);
    Helper.send_log(log, member.guild, channel);
}

// ******************************************************************

import { DiscordClient } from "../../foundation/discord_bot.js";
import { Colors, Helper } from "../helpers.js";
import Discord from "discord.js";
const client_message_mapping = {};
const GOAL_NAME = "Message Cooldown";

// remove messages that are no longer within the decay time
function refresh_message_mapping() {
    for (const [key, value] of Object.entries(client_message_mapping)) {
        let timestamps = value;
        timestamps = timestamps.filter(message => Date.now() - message.createdTimestamp <= DecayTime * 1000);
        client_message_mapping[key] = timestamps;
    }
}

// as users send messages, track them in client_message_mapping
if (Enforced) {
    console.log("Running Goal: " + GOAL_NAME);
    DiscordClient.on(Discord.Events.MessageCreate, (message) => {
        if (Helper.is_member_admin(message.member)) {
            return;
        }
        let user_messages = client_message_mapping[message.author.id] || [];
        user_messages.push(message);
        client_message_mapping[message.author.id] = user_messages;
        refresh_message_mapping();
        if (client_message_mapping[message.author.id].length > ThresholdTimes) {
            take_action(message.member, message.channel);
        }
    });
}