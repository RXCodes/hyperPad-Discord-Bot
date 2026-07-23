// ******************************************************************
// BEHAVIOR: Reply with "Pong!" with user says "ping"
// maybe even include some special messages so it doesn't get too repetitive
// used to check if the bot is alive

// whether this behavior is enabled or not
const Enabled = true;

// the maximum levenshtein distance to consider the message equivalent to "ping"
const MAX_LEVENSHTEIN_DISTANCE = 2;

// how many times to reply with pong before going to special messages
const PONG_RESPONSE_TIMES = 4;

// how many times to reply until going to emojis
const PONG_RESPONSE_EMOJI_TIMES = 12;

// how long it takes to return to normal state (in seconds)
const PONG_RETURN_NORMAL_TIME = 60 * 20;

// ******************************************************************

import { HomoglyphMapHelper } from "../homoglyph_map.js";
import { SmartContains } from "../smart_contains.js";
import { DiscordInteractionRouter } from "../interaction_router.js";
import levenshtein from 'fast-levenshtein';
import Discord from "discord.js";
const BEHAVIOR_NAME = "Ping";
const funny_messages = [
    "I'm alive.",
    "I'm here.",
    "Pong! Pong! Pong!",
    "Hey. I'm here.",
    "I'm still here.",
    "Hi.",
    "I'm not here.",
    "Pong?",
    "PONG!",
    "Pong! I'm here.",
    "PONG!",
    "Pong!",
    "I'm here!",
    "I'm still up!",
    "Still online.",
    "PONG! 🏓",
    "🏓",
    "🏓🏓🏓"
];

let pong_responses = 0;
function pong(message) {
    pong_responses += 1;
    if (!DiscordInteractionRouter.request_action_on_message(message)) {
        return;
    }
    if (pong_responses === PONG_RESPONSE_TIMES) {
        setTimeout(function() {
            pong_responses = 0;
        }, 1000 * PONG_RETURN_NORMAL_TIME);
    }
    if (pong_responses === PONG_RESPONSE_EMOJI_TIMES) {
        message.channel.send("Okay, this is getting old...");
        setTimeout(function() {
            message.channel.send("I'm just going to react with 🏓 from now on to let you know I'm still alive.");
        }, 1000 * 3.5);
        return;
    }
    if (pong_responses > PONG_RESPONSE_EMOJI_TIMES) {
        try {
            message.react("🏓");
        } catch(e) {}
        return;
    }
    if (pong_responses >= PONG_RESPONSE_TIMES) {
        let funny_message = funny_messages[Math.floor(Math.random() * funny_messages.length)];
        message.channel.send(funny_message);
        return;
    }
    message.channel.send("Pong!");
}

if (Enabled) {
    console.log("Running Behavior: " + BEHAVIOR_NAME);
    DiscordInteractionRouter.register_message_event(1, (message, type) => {
        if (type !== Discord.Events.MessageCreate) {
            return;
        }
        if (message.author.bot) {
            return;
        }
        if (message.content.length <= 3) {
            return;
        }
        let filtered_message = HomoglyphMapHelper.normalize_text(message.content);
        filtered_message = SmartContains.shorten_character_chains_for_text(filtered_message);
        if (filtered_message.includes("pong")) {
            return;
        }
        let distance = levenshtein.get(filtered_message, "ping");
        if (distance <= MAX_LEVENSHTEIN_DISTANCE) {
            pong(message);
        }
    });
}