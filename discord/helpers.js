// the text channel that logs will be sent to
import {Guild} from "discord.js";

const LOGGING_CHANNEL_ID = "1043327765518221332";

// if set to true, the log will also be sent to the channel it originated from
const SEND_LOG_TO_ORIGINATING_CHANNEL = true;

import {EmbedBuilder, PermissionsBitField} from "discord.js";
export const Helper = {
    delete_messages,
    is_member_admin,
    create_log,
    send_log
}

export const Colors = {
    green: 0x00bb78,
    warn: 0xcc9b47,
    red: 0xc74e4e
}

function delete_messages(messages) {
    for (const message of messages) {
        try {
            message.delete();
        } catch (error) {}
    }
}

function is_member_admin(member) {
    try {
        return member.permissions.has(PermissionsBitField.Flags.ADMINISTRATOR);
    } catch (error) {
        return false;
    }
}

function create_log(title, message, color, member) {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp()
        .setImage(member.avatarURL());
}

function send_log(embed, guild, originating_channel) {
    try {
        if (SEND_LOG_TO_ORIGINATING_CHANNEL) {
            originating_channel.send({ embeds: [embed] });
        }
        guild.channels.cache.get(LOGGING_CHANNEL_ID).send({ embeds: [embed] });
    } catch(error) {}
}