// ******************************************************************
// GOAL: don't let user send similar long messages X times
// 3 long similar messages across 25 messages is considered as spam by default

// whether this goal is enforced or not - set false to disable
const Enforced = true;

// how many similar messages that can be sent before taking action
const ThresholdTimes = 3;

// the number of prior messages to keep track of
// note that the larger the lookup size, the more demanding this goal can be to achieve
const LookupSize = 25;

// the minimum length of a message until it is checked
// don't want to flag users for short replies like "okay" or "i guess so"
const MinMessageLength = 20;

// the maximum levenshtein distance to consider messages as similar
const ThresholdLevenshteinDistance = 10;

// the action to take on a user that violates this goal
function take_action(member, channel, message) {
    // delete the offending spam messages
    Helper.delete_messages(client_message_mapping[member.id]);
    client_message_mapping[member.id] = [];

    // time out member for 2 minutes
    member.kick("You sent too many repetitive messages.");

    // log this action
    let user_mention = "<@" + member.id + ">";
    let contents = "**Content:**\n```" + message.content + "```";
    let log = Helper.create_log("🛑 User Kicked", user_mention + " sent the same repetitive message multiple times.\n\n" + contents, Colors.red, member);
    Helper.send_log(log, member.guild, channel);
}

// ******************************************************************

import { Colors, Helper } from "../helpers.js";
import levenshtein from 'fast-levenshtein';
import { DiscordInteractionRouter } from "../interaction_router.js";
const client_message_mapping = {};
const GOAL_NAME = "Message Copypasta";
class ContentMarker {
    constructor(message) {
        this.message = message;
        this.similar_messages = [];
        this.messages_processed = 0;
    }

    is_similar_to_message(message) {
        let result = levenshtein.get(message.content, this.message.content);
        return result <= ThresholdLevenshteinDistance;
    }
}

// as users send messages, track them in client_message_mapping
if (Enforced) {
    console.log("Running Goal: " + GOAL_NAME);
    DiscordInteractionRouter.register_message_event(2, (message) => {
        if (message.author.bot) {
            return;
        }
        if (message.content.length < MinMessageLength) {
            return;
        }
        if (Helper.is_member_admin(message.member)) {
            return;
        }
        let user_markers = client_message_mapping[message.author.id] || [];
        let similar = false;
        for (const content_marker of user_markers) {
            // we need to check if the messages are very similar
            // group similar messages together and flag if a group gets too big
            if (content_marker.is_similar_to_message(message)) {
                similar = true;
                content_marker.similar_messages.push(message);
                if (content_marker.similar_messages.length >= ThresholdTimes) {
                    try {
                        if (DiscordInteractionRouter.request_action_on_message(message)) {
                            take_action(message.member, message.channel, message);
                        }
                    } catch (e) {}
                    break;
                }
            }
            content_marker.messages_processed++;
        }
        // if no similar messages were found, add a new entry
        if (!similar) {
            let content_marker = new ContentMarker(message);
            user_markers.push(content_marker);
        }
        user_markers = user_markers.filter(marker => marker.messages_processed < LookupSize);
        client_message_mapping[message.author.id] = user_markers;
    });
}