import { DiscordClient } from "../foundation/discord_bot.js";
import Discord from "discord.js";

const registered_message_create_events = [];

export const DiscordInteractionRouter = {
    register_message_event,
    request_action_on_message
}

// register a message event with priority - highest priority executes first
function register_message_event(priority, func) {
    registered_message_create_events.push({
        call: func,
        priority: priority
    });
    registered_message_create_events.sort(function(a, b) {
        return b.priority - a.priority;
    });
}

// ensure each message only has one action done on it
const actioned_messages = {};
function request_action_on_message(message) {
    if (actioned_messages[message.id]) {
        return false;
    }
    actioned_messages[message.id] = true;
    setTimeout(function () {
        delete actioned_messages[message.id];
    }, 1000 * 15);
    return true;
}

// handle message create events
DiscordClient.on(Discord.Events.MessageCreate, (message) => {
    for (const event of register_message_event) {
        if (actioned_messages[message.id]) {
            delete actioned_messages[message.id];
            break;
        }
        event.call(message, Discord.Events.MessageCreate);
    }
});

// treat edits as message create events
DiscordClient.on(Discord.Events.MessageUpdate, (message) => {
    for (const event of register_message_event) {
        if (actioned_messages[message.id]) {
            delete actioned_messages[message.id];
            break;
        }
        event.call(message, Discord.Events.MessageUpdate);
    }
});