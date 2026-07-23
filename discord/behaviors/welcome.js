// ******************************************************************
// BEHAVIOR: Welcome a user when they say hello

// whether this behavior is enabled or not
const Enabled = true;

// the maximum levenshtein distance to consider the message equivalent to something else
const MAX_LEVENSHTEIN_DISTANCE = 2;

// the maximum length of a message that the bot should respond to
const MAX_MESSAGE_LENGTH = 200;

// how long to wait before this behavior can be triggered again (in seconds)
const BEHAVIOR_COOLDOWN = 120;

// prefixes that the bot should respond to
const DETECT_PREFIXES = [
    "hi",
    "hello",
    "hey",
    "heya",
    "hiya",
    "yo",
    "sup",
    "whats up",
    "howdy",
    "greetings",
    "ello",
    "hai",
    "hewwo",
    "henlo",
    "hiya",
    "oi",
    "ey",
    "ay",
    "yoo",
    "aloha",
    "salutations",
    "bonjour",
    "hola",
    "ciao",
    "wassup",
    "sup",
    "hi everyone",
    "hi all",
    "hey everyone",
    "hey all",
    "yo everyone",
];

// the minimum toxicity scores before questioning a message
const ToxicityThresholds = {
    "severe_toxicity": 0.6,
    "threat": 0.6,
    "obscene": 0.75,
    "sexual_explicit": 0.6,
    "identity_attack": 0.75,
    "insult": 0.6,
    "toxicity": 0.7
};

const HelloMessages = [
    "Hey there! 👋",
    "Hello!",
    "Hi! Welcome!",
    "Hey! It's nice seeing you.",
    "Hello, nice to see you!",
    "Hi there! 😊",
    "Howdy!",
    "Greetings!",
    "Hey!",
    "Hello!\nHope you're having a great day!",
    "Hi!\nGlad you're here!",
    "Hello!",
    "Hi!\nHope you're doing well!",
    "Hello there! 😄",
    "Heya!",
    "Yo! 👋",
    "Hiya!",
    "Hello, creator! 🎮",
    "Hello!",
    "Hi! Happy creating!",
    "Hello. Nice seeing you!",
    "Hey! Don't forget to check out the rules.",
    "Hi! Have fun!",
    "Hello! Enjoy your time here!",
    "Hey!\nNice to meet you!",
    "Hey!\nGreat to have you here.",
    "Hey there, friend!",
    "Hello! Make yourself at home.",
    "Hi! Always happy to see a new message.",
    "Hello! 👋 Hope you're doing well.",
    "Hey! Thanks for stopping by.",
    "Greetings, traveler!",
    "Ahoy! Welcome aboard!",
    "Hi! Have an awesome day!",
    "Hey! What's everyone up to?",
    "Hello! Let's make some games!",
    "Welcome back! 👋",
    "Hey! Hope you're having fun!",
    "Hi! 😄"
];

const QuestionableHelloMessages = [
    "Hey?",
    "That was... a hello, I think.",
    "Interesting way to say hi.",
    "Um...\nHello.",
    "Hey...",
    "Hello...?",
    "Hello?\nWhat's going on?",
    "Oh...\nHello...",
    "I'm choosing to believe that was intentional.",
    "That was certainly one of the greetings of all time.",
    "Your greeting has been...\n..acknowledged.",
    "Well, that's one way to say hello...",
    "Hey?\nWhat's happening?",
    "You type exactly how I expected you wouldn't.",
    "Blink twice if you need help.",
    "That hello came with extra seasoning.",
    "You've definitely greeted someone before...\n..probably.",
    "Well...\nHello?",
    "Greetings received.\nBarely.",
    "Hello?\nI guess?.",
    "The vibes are...\nunique.",
    "Okay...?",
    "Hello, diva.",
    "That's either a greeting or a sneeze.",
    "What?",
    "I've seen stranger.\nActually...\nMaybe not.",
    "Peak communication achieved."
];

// ******************************************************************

import { HomoglyphMapHelper } from "../homoglyph_map.js";
import { DiscordInteractionRouter } from "../interaction_router.js";
import { SmartContains } from "../smart_contains.js";
import levenshtein from 'fast-levenshtein';
import Discord from "discord.js";
import { Worker } from "worker_threads";
const BEHAVIOR_NAME = "Welcome";
const pending_messages = {};
let on_cooldown = false;

function sayHello(channel) {
    if (on_cooldown) {
        return;
    }
    let message = HelloMessages[Math.floor(Math.random() * HelloMessages.length)];
    let messages = message.split("\n");
    for (let i = 0; i < messages.length; i++) {
        let time = i * 2500;
        setTimeout(function () {
            channel.send(messages[i]);
        }, time);
    }
    on_cooldown = true;
    setTimeout(function () {
        on_cooldown = false;
    }, 1000 * BEHAVIOR_COOLDOWN);
}

function questionablySayHello(channel) {
    if (on_cooldown) {
        return;
    }
    let message = QuestionableHelloMessages[Math.floor(Math.random() * QuestionableHelloMessages.length)];
    let messages = message.split("\n");
    for (let i = 0; i < messages.length; i++) {
        let time = i * 3000;
        setTimeout(function () {
            channel.send(messages[i]);
        }, time);
    }
    on_cooldown = true;
    setTimeout(function () {
        on_cooldown = false;
    }, 1000 * BEHAVIOR_COOLDOWN);
}

if (Enabled) {
    console.log("Running Behavior: " + BEHAVIOR_NAME);
    const reduce_toxicity_worker = new Worker('./discord/workers/reduce_toxicity_worker.js', {});
    DiscordInteractionRouter.register_message_event(100, (message, type) => {
        if (type !== Discord.Events.MessageCreate) {
            return;
        }
        if (message.author.bot) {
            return;
        }
        if (message.content.length > MAX_MESSAGE_LENGTH) {
            return;
        }
        let filtered_message = HomoglyphMapHelper.normalize_text(message.content);
        filtered_message = filtered_message.replace(/(.)\1{2,}/g, "$1$1");

        let match_found = false;
        for (const prefix of DETECT_PREFIXES) {
            if (filtered_message[0] !== prefix[0]) {
                // if the first character doesn't match, then it's most likely not a hello message
                continue;
            }

            const prefix_tokens = prefix.split(" ");
            const source_tokens = filtered_message.split(" ");
            if (source_tokens.length < prefix_tokens.length) {
                // if the source is shorter than the prefix, then it will never match
                continue;
            }

            // compare each token
            let index = -1;
            let matches = true;
            for (const prefix_token of prefix_tokens) {
                index += 1;
                if (SmartContains.tokens_are_similar(prefix_token, source_tokens[index])) {
                    continue;
                }
                if (levenshtein.get(prefix_token, source_tokens[index]) <= MAX_LEVENSHTEIN_DISTANCE) {
                    continue;
                }
                matches = false;
            }
            if (!matches) {
                continue;
            }

            // in this case, a match was found
            match_found = true;
            break;
        }

        if (match_found) {
            // we need to check the message's toxicity before replying
            pending_messages[message.id] = message;
            reduce_toxicity_worker.postMessage({
                thresholds: ToxicityThresholds,
                type: "ingest_welcome_message",
                message_id: message.id,
                contents: message.content
            });
        }
    });

    reduce_toxicity_worker.on("message", (message) => {
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

        if (message.type === "ingest_welcome_message") {
            const discord_message = pending_messages[message.message_id];
            delete pending_messages[message.message_id];

            // check for matches - take action based on highest offense
            for (const offensive_label of ranked_offensive_labels) {
                if (message.matches[offensive_label]) {
                    questionablySayHello(discord_message.channel);
                    return;
                }
            }

            // at this point, we can say hello like normal
            sayHello(discord_message.channel);
        }
    });
}