import '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';
import { parentPort } from 'worker_threads';
import { HomoglyphMapHelper } from "../../homoglyph_map.js";

parentPort.on('message', (message) => {
    // normalize the message before processing
    const normalized_message = HomoglyphMapHelper.normalize_text(message.contents);
    const prediction_matches = {};
    const threshold_dictionary = message.thresholds;

    // process the message through the model
    toxicity.load(0, []).then(model => {
        model.classify([normalized_message]).then(predictions => {
            predictions.forEach(prediction => {
                let probability = prediction.results[0].probabilities[1];
                let target_probability = threshold_dictionary[prediction.label];
                prediction_matches[prediction.label] = probability >= target_probability;
            });
            parentPort.postMessage({
                message_id: message.message_id,
                type: message.type,
                matches: prediction_matches
            })
        });
    });

});