// ******************************************************************
// the text channel that logs will be sent to
// you can set this to the channel id of your choice
const LOGGING_CHANNEL_ID = "1043327765518221332";

// if set to true, the log will also be sent to the channel it originated from
const SEND_LOG_TO_ORIGINATING_CHANNEL = true;

// ******************************************************************
import {EmbedBuilder, PermissionsBitField} from "discord.js";
export const Helper = {
    delete_messages,
    is_member_admin,
    timeout_member,
    kick_member,
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
            if (message.deletable) {
                message.delete();
            }
        } catch (error) {}
    }
}

function timeout_member(member, timeout, reason) {
    if (!process.env.TESTING) {
        try {
            // timeout is in milliseconds - multiply by 1000 to convert to seconds
            member.timeout(timeout * 1000, reason);
        } catch (error) {}
    }
}

function kick_member(member, reason) {
    if (!process.env.TESTING) {
        try {
            member.kick(reason);
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