// ******************************************************************
// BEHAVIOR: Greet users when they join and also send a goodbye message when they leave

// whether this behavior is enabled or not
const Enabled = true;

// content to add to the beginning of welcome greetings
const WelcomeMessagePrefix = "<:Tab:1529717768663076894>";

// content to add to the beginning of goodbye greetings
const GoodbyeMessagePrefix = "<:RedTab:1529717797213573203>";

// channels to send the welcome greeting messages in
const WelcomeGreetingChannels = [
    "675758127085518873",
    "597173748847738983"
];

// channels to send the goodbye greeting messages in
const GoodbyeGreetingChannels = [
    "675758127085518873",
    "597173748847738983"
];

// greeting messages when users join
const WelcomeGreetings = [
    "Welcome, [@USER]!",
    "[@USER] just joined the server!",
    "Everyone welcome [@USER]!",
    "Glad to have you here, [@USER]!",
    "[@USER] entered the hyperPad community!",
    "A wild [@USER] appeared!",
    "[@USER] has spawned into the server!",
    "Say hello to [@USER]!",
    "[@USER] is ready to start creating!",
    "The community grows stronger—welcome, [@USER]!",
    "[@USER] joined the adventure!",
    "Welcome aboard, [@USER]! <:hyperPad:1207329938168872960>",
    "[@USER] unlocked the Community Server!",
    "Fresh creator detected: [@USER]!",
    "Give [@USER] a warm welcome!",
    "[@USER] is here to build something awesome!",
    "The lobby welcomes [@USER]!",
    "[@USER] connected successfully!",
    "A new game developer has entered: [@USER]!",
    "[@USER] joined! Time to make some games!",
    "Hope you enjoy your stay, [@USER]!",
    "[@USER] just dropped into the community!",
    "Welcome to hyperPad, [@USER]!",
    "[@USER] is ready to create, play, and share!",
    "The editor just got one user cooler. Welcome, [@USER]!",
    "New ideas incoming—welcome, [@USER]!",
    "[@USER] has joined. Let the creativity begin!",
    "It's dangerous to create alone. Welcome, [@USER]!",
    "Checkpoint reached: [@USER] joined the server!",
    "[@USER] pressed the Join button!",
    "Loading assets... Welcome, [@USER]!",
    "[@USER] has entered the sandbox!",
    "Another creator joins the workshop: [@USER]!",
    "The community says hi to [@USER]!",
    "Achievement unlocked: New Member ([@USER])!",
    "Welcome to the world of hyperPad, [@USER]!",
    "[@USER] just leveled up our community!",
    "Creativity +1 thanks to [@USER]!",
    "Let's build something amazing together, [@USER]!",
    "[@USER] is now part of the hyperPad family!"
]

// greeting messages when users leave
const GoodbyeGreetings = [
    "Goodbye, [@USER]!",
    "[@USER] has left the server.",
    "We'll miss you, [@USER]!",
    "[@USER] disconnected from the community.",
    "Farewell, [@USER]! Best of luck!",
    "[@USER] has left the hyperPad community.",
    "See you next time, [@USER]!",
    "[@USER] logged off.",
    "[@USER] left the workshop.",
    "The server says goodbye to [@USER].",
    "[@USER] has ventured elsewhere.",
    "A creator has departed: [@USER].",
    "[@USER] has exited the lobby.",
    "[@USER] packed up their project and left.",
    "Until next time, [@USER]!",
    "[@USER] has left the building.",
    "The community is a little quieter without [@USER].",
    "[@USER] has signed off.",
    "Another chapter ends. Farewell, [@USER]!",
    "[@USER] has gone AFK... permanently.",
    "The editor has closed for [@USER].",
    "[@USER] saved their work and exited.",
    "Mission complete. Goodbye, [@USER]!",
    "[@USER] left the sandbox.",
    "We'll keep creating until you return, [@USER]!",
    "[@USER] has left the game.",
    "Connection lost: [@USER].",
    "[@USER] disappeared into the void.",
    "The community waves goodbye to [@USER]!",
    "Hope to see you again soon, [@USER]!",
    "[@USER] hit the Leave button.",
    "One fewer creator online. Goodbye, [@USER]!",
    "[@USER] has checked out.",
    "The workshop door closes behind [@USER].",
    "[@USER] has logged out of the adventure.",
    "[@USER] has left the server.",
    "The server will be here if you return, [@USER].",
    "Farewell, and happy creating, [@USER]!",
    "[@USER] has left, but their ideas live on.",
    "See you around, [@USER]! 👋"
]

// ******************************************************************

import { DiscordInteractionRouter } from "../interaction_router.js";
import Discord from "discord.js";
const BEHAVIOR_NAME = "Greetings";

if (Enabled) {
    console.log("Running Behavior: " + BEHAVIOR_NAME);
    DiscordInteractionRouter.register_member_event(1, (member, type) => {
        if (type === Discord.Events.GuildMemberAdd) {
            let message = WelcomeGreetings[Math.floor(Math.random() * WelcomeGreetings.length)];
            const mention = "<@" + member.id + ">";
            message = message.replace("[@USER]", mention);
            message = WelcomeMessagePrefix + message;
            for (const channel_id of WelcomeGreetingChannels) {
                let channel = member.guild.channels.cache.find(channel => channel.id === channel_id);
                if (channel) {
                    channel.send(message);
                }
            }
        }
        if (type === Discord.Events.GuildMemberRemove) {
            let message = GoodbyeGreetings[Math.floor(Math.random() * GoodbyeGreetings.length)];
            const name = "**" + member.displayName + "**";
            message = message.replace("[@USER]", name);
            message = GoodbyeMessagePrefix + message;
            for (const channel_id of GoodbyeGreetingChannels) {
                let channel = member.guild.channels.cache.find(channel => channel.id === channel_id);
                if (channel) {
                    channel.send(message);
                }
            }
        }
    });
}