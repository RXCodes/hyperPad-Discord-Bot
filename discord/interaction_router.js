import { DiscordClient } from "../foundation/discord_bot.js";
import Discord from "discord.js";

const registered_message_events = [];
const registered_message_chain_events = [];
const registered_member_events = [];
let cached_messages = [];
let chains_updated = {};
const CHAIN_MESSAGE_EXPIRATION_TIME = 30;
const CHAIN_MESSAGE_UPDATE_DELAY = 5;

export const DiscordInteractionRouter = {
    register_message_event,
    register_message_chain_event,
    register_member_event,
    request_action_on_message,
    request_action_on_message_chain
}

// register a message event with priority - highest priority executes first
function register_message_event(priority, func) {
    registered_message_events.push({
        call: func,
        priority: priority
    });
    registered_message_events.sort(function(a, b) {
        return b.priority - a.priority;
    });
}

// register message chain events with priority - highest priority executes first
function register_message_chain_event(priority, func) {
    registered_message_chain_events.push({
        call: func,
        priority: priority
    });
    registered_message_chain_events.sort(function(a, b) {
        return b.priority - a.priority;
    });
}

// register a member event with priority - highest priority executes first
function register_member_event(priority, func) {
    registered_member_events.push({
        call: func,
        priority: priority
    });
    registered_member_events.sort(function(a, b) {
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

// ensure each message chain only has one action done on it
function request_action_on_message_chain(messages) {
    for (const message of messages) {
        if (actioned_messages[message.id]) {
            return false;
        }
        actioned_messages[message.id] = true;
        setTimeout(function () {
            delete actioned_messages[message.id];
        }, 1000 * 15);
    }
    return true;
}

// handle chain messages if any
function update_cached_messages() {
    cached_messages = cached_messages.filter(message => Date.now() - message.createdAt <= CHAIN_MESSAGE_EXPIRATION_TIME * 1000);
    cached_messages.sort(function(a, b) {
        return a.createdAt - b.createdAt;
    });
    const chain_messages = {};
    cached_messages.forEach(cached_message => {
        let chain_id = cached_message.author + "-" + cached_message.channel.id;
        let messages = chain_messages[chain_id] || [];
        messages.push(cached_message);
        chain_messages[chain_id] = messages;
    });
    for (const [chain_id, messages] of Object.entries(chain_messages)) {
        for (const event of registered_message_chain_events) {
            for (const message of messages) {
                if (actioned_messages[message.id]) {
                    break;
                }
            }
            if (chains_updated[chain_id]) {
                // send chain updates later
                setTimeout(function (){
                    event.call(messages, messages[0].member);
                }, CHAIN_MESSAGE_UPDATE_DELAY * 1000);
            }
        }
    }
    chains_updated = {};
}

// handle message create events
DiscordClient.on(Discord.Events.MessageCreate, (message) => {
    for (const event of registered_message_events) {
        if (actioned_messages[message.id]) {
            delete actioned_messages[message.id];
            break;
        }
        event.call(message, Discord.Events.MessageCreate);
    }
    if (!actioned_messages[message.id]) {
        if (message.deletable) {
            cached_messages.push(message);
            let chain_id = message.author + "-" + message.channel.id;
            chains_updated[chain_id] = true;
            update_cached_messages();
        }
    }
});

// treat edits as message create events in some goals
DiscordClient.on(Discord.Events.MessageUpdate, (message) => {
    for (const event of registered_message_events) {
        if (actioned_messages[message.id]) {
            delete actioned_messages[message.id];
            break;
        }
        event.call(message, Discord.Events.MessageUpdate);
        if (message.deletable) {
            update_cached_messages();
        }
    }
});

// track deletions to update chains
DiscordClient.on(Discord.Events.MessageDelete, (message) => {
    cached_messages = cached_messages.filter(_message => _message.id !== message.id);
    update_cached_messages();
});

// detect when users join the server
DiscordClient.on(Discord.Events.GuildMemberAdd, (member) => {
    registered_member_events.forEach((event) => {
        event.call(member, Discord.Events.GuildMemberAdd);
    });
});

// detect when users leave the server
DiscordClient.on(Discord.Events.GuildMemberRemove, (member) => {
    registered_member_events.forEach((event) => {
        event.call(member, Discord.Events.GuildMemberRemove);
    });
});