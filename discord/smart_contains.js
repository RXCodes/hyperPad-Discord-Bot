// intelligently check if a text contains a subtext
import RiTa from 'rita';

export const SmartContains = {
    tokens_are_similar,
    contains
}

// determine if two words are similar
// source_token is treated as the word to search for
function tokens_are_similar(source_token, search_token) {
    // check if they're actually the same word
    if (source_token === search_token) {
        return true;
    }

    // shorten same character occurrences of 3 and longer
    search_token = search_token.replace(/(.)\1{2,}/g, "$1$1");

    // ignore large tokens - user is probably just spamming anyway
    if (search_token.length > 20) {
        return false;
    }

    // if the phones match, they're probably the same word
    let source_phones = RiTa.phones(source_token, { silent: true });
    let search_phones = RiTa.phones(search_token, { silent: true });
    if (search_phones.length < 3) {
        return false;
    }
    if (search_phones === source_phones || source_phones.length >= 10 && search_phones.startsWith(source_phones)) {
        // if the phones match, check letter sequences
        // these sequences don't contain two same characters in a row: boom --> bom
        const search_letter_sequence = search_token.replace(/(.)\1+/g, '$1');
        const source_letter_sequence = source_token.replace(/(.)\1+/g, '$1');
        return search_letter_sequence.startsWith(source_letter_sequence);
    }

    // look at the syllables - simplify them if possible
    let search_syllables = RiTa.syllables(search_token, { silent: true });
    let new_syllables = [];
    let split = search_syllables.split("/");
    for (const s of split) {
        if (s.includes("-")) {
            new_syllables.push(s);
        }
    }
    search_syllables = new_syllables.join("-");

    // reduce vowel extensions
    search_syllables = search_syllables.replace("iy-eh-r", "er");
    search_syllables = search_syllables.replace("uw-uw-", "uw-");
    search_syllables = search_syllables.replace("iy-n", "eh-n");
    if (search_syllables === source_phones) {
        // if the syllables match, check letter sequences
        // these sequences don't contain two same characters in a row: boom --> bom
        const search_letter_sequence = search_token.replace(/(.)\1+/g, '$1');
        const source_letter_sequence = source_token.replace(/(.)\1+/g, '$1');
        return search_letter_sequence.startsWith(source_letter_sequence);
    }
    return false;
}

// asynchronously determine if a text contains a subtext
// text should be normalized before being passed in
function contains(normalized_text, subtext) {
    // remove consecutive white spaces and substitute them with single space delimiters
    normalized_text = normalized_text.replace(/\s+/g, ' ');

    // split the text and subtext into tokens
    let tokens = normalized_text.split(' ');
    let source_tokens = subtext.trim().split(' ');

    // check if the tokens match
    for (let i = 0; i < tokens.length - (source_tokens.length - 1); i++) {
        let match_found = true;
        for (let j = 0; j < source_tokens.length; j++) {
            let target_token = tokens[i + j];
            if (!tokens_are_similar(source_tokens[j], target_token)) {
                match_found = false;
                break;
            }
        }
        if (match_found) {
            return true;
        }
    }
    return false;
}