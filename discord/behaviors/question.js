// ******************************************************************
// BEHAVIOR: Question messages if they seem edgy

// whether this behavior is enabled or not
const Enabled = true;

// how long to wait before this behavior can be triggered again (in seconds)
const BEHAVIOR_COOLDOWN = 240;

// the minimum toxicity scores before questioning a message
const ToxicityThresholds = {
    "severe_toxicity": 0.6,
    "threat": 0.6,
    "obscene": 0.6,
    "sexual_explicit": 0.6,
    "identity_attack": 0.7,
    "insult": 0.7,
    "toxicity": 1.0
};

// questionable messages to send
const QuestionableMessages = [
    "🤨",
    "Uh..\nWhat?",
    "Um..\nWhat's happening?",
    "That's certainly something.",
    "You typed that on purpose?",
    "Cool...",
    "You good?",
    "That's...\nquestionable.",
    "Okay?",
    "I'm not touching that one.",
    "Well then.",
    "That's one way to say it.",
    "I have concerns.",
    "You almost had me there.",
    "📸",
    "I'm keeping my eye on you...",
    "I'm adding that to the list of things I wish I hadn't read.",
    "That's a take.",
    "We're just saying anything now, huh?",
    "The council will remember this.",
    "Not sure about that one, chief.",
    "That's a little suspicious.",
    "You typed that with confidence.",
    "The silence would have been free.",
    "The silence is loud. 🗣️",
    "That's going in the incident report.",
    "Noted...\nunfortunately.",
    "I can neither confirm nor endorse that.",
    "Respectfully... what?",
    "You woke up and chose chaos.",
    "😬",
    "I'm going to assume you're joking.",
    "That's between you and your search history.",
    "That raised my virtual eyebrow.",
    "This conversation just took a turn.",
    "I'm just a bot, but even I'm judging a little.",
    "I saw nothing. 👀",
    "So....\nUhh...\nWhat?"
]

// ******************************************************************

import { DiscordInteractionRouter } from "../interaction_router.js";
import { HomoglyphMapHelper } from "../homoglyph_map.js";
import Discord from "discord.js";
import { Worker } from "worker_threads";
const BEHAVIOR_NAME = "Question";
const pending_messages = {};
let on_cooldown = false;

function sendQuestionableMessage(channel) {
    if (on_cooldown) {
        return;
    }
    let message = QuestionableMessages[Math.floor(Math.random() * QuestionableMessages.length)];
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
        if (on_cooldown) {
            return;
        }
        let filtered_message = HomoglyphMapHelper.normalize_text(message.content);
        pending_messages[message.id] = message;
        reduce_toxicity_worker.postMessage({
            thresholds: ToxicityThresholds,
            type: "ingest_question_message",
            message_id: message.id,
            contents: filtered_message
        });
    });

    reduce_toxicity_worker.on("message", (message) => {
        // all labels from most offensive to least offensive
        const ranked_offensive_labels = [
            "severe_toxicity",
            "threat",
            "obscene",
            "sexual_explicit",
            "identity_attack",
            "insult"
        ];

        if (message.type === "ingest_question_message") {
            const discord_message = pending_messages[message.message_id];
            delete pending_messages[message.message_id];

            // check for matches - take action based on highest offense
            for (const offensive_label of ranked_offensive_labels) {
                if (message.matches[offensive_label]) {
                    sendQuestionableMessage(discord_message.channel);
                    return;
                }
            }
        }
    });
}