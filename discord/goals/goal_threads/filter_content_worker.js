// the actual script responsible for handling filtering content
import { parentPort } from 'worker_threads';
import { SmartContains } from "../../smart_contains.js";
import { HomoglyphMapHelper } from "../../homoglyph_map.js";

let Filters = [];

function setup_filters(filters) {
    Filters = [];
    for (let filter of filters) {
        Filters.push(filter);
    }
}

function ingest_message(content, type, id) {
    // normalize the text for analysis
    let normalized_message = HomoglyphMapHelper.normalize_text(content);

    // go through all filters
    for (const filter_properties of Filters) {
        const filter_list = filter_properties.list;
        for (const blocked_word of filter_list) {

            // basic check for blocked words in the entire message
            let stripped_message = normalized_message.replace(/[^a-zA-Z0-9]/g, "");
            let stripped_blocked_word = blocked_word.replace(/[^a-zA-Z0-9]/g, "");
            if (stripped_message.length > 0 && stripped_blocked_word.length > 0) {
                if (stripped_message.startsWith(stripped_blocked_word)) {
                    parentPort.postMessage({
                        result: 'detected',
                        filter: filter_properties,
                        message_id: id,
                        type: type,
                        word: blocked_word
                    });
                    return;
                }
            }

            // advanced check for blocked words token-wise
            if (SmartContains.contains(normalized_message, blocked_word)) {
                parentPort.postMessage({
                    result: 'detected',
                    filter: filter_properties,
                    message_id: id,
                    type: type,
                    word: blocked_word
                });
                return;
            }
        }
    }
    parentPort.postMessage({ result: 'clear', type: type, message_id: id });
}

parentPort.on('message', (message) => {
    if (message.type === "setup_filters") {
        setup_filters(message.filters);
        return;
    }
    if (message.type === "ingest_message") {
        ingest_message(message.message.content, message.type, message.message.id);
        return;
    }
    if (message.type === "ingest_message_chain") {
        ingest_message(message.contents, message.type, message.message_id);
    }
});