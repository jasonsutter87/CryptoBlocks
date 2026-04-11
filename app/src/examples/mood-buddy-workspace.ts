/**
 * Mood Buddy — the AI kitchen sink example.
 *
 * Exercises every block in the AI category (classifier + sentiment +
 * similarity + Markov + regression + summary + speech I/O + microphone)
 * in a single cohesive script that:
 *
 *   1. Trains a mood classifier with four labelled examples.
 *   2. Starts the microphone and greets the user out loud.
 *   3. Listens for the user's answer.
 *   4. Analyzes sentiment, classifies, and measures similarity.
 *   5. Branches on the sentiment score with a matching spoken response.
 *   6. Feeds the answer into a Markov chain and speaks the remix.
 *   7. Logs the score as a regression data point and predicts the next.
 *   8. Prints the classifier summary and speaks goodbye.
 *
 * Doubles as a demo of how speech + sentiment compose cleanly without
 * any external APIs — pure browser.
 */

import {
  resetIds,
  block,
  blockWithStatements,
  textVal,
  numVal,
  chain,
  workspace,
} from './workspaces'

export function moodBuddyWorkspace(): Record<string, unknown> {
  resetIds()

  // ============================================================
  // PHASE 1 — Train a small mood classifier
  // ============================================================

  const createClassifier = block('cb_create_classifier', undefined, {
    name: textVal('mood'),
  }, 50, 50)

  const trainHappy = block('cb_add_example', undefined, {
    classifier: textVal('mood'),
    text: textVal('I had a great and wonderful day'),
    label: textVal('happy'),
  })

  const trainExcited = block('cb_add_example', undefined, {
    classifier: textVal('mood'),
    text: textVal('this is amazing and awesome fantastic'),
    label: textVal('excited'),
  })

  const trainSad = block('cb_add_example', undefined, {
    classifier: textVal('mood'),
    text: textVal('I am feeling sad and down today'),
    label: textVal('sad'),
  })

  const trainAngry = block('cb_add_example', undefined, {
    classifier: textVal('mood'),
    text: textVal('this is terrible awful and annoying'),
    label: textVal('angry'),
  })

  // ============================================================
  // PHASE 2 — Turn on the mic and greet the user
  // ============================================================

  const startMic = block('cb_ai_start_microphone', undefined, undefined)

  const greet = block('cb_ai_say_and_wait', undefined, {
    text: textVal('Hello! I am your mood buddy. How are you feeling today?'),
  })

  // ============================================================
  // PHASE 3 — Listen and store the answer
  // ============================================================

  const storeAnswer = block('cb_set_global', undefined, {
    name: textVal('answer'),
    value: block('cb_ai_listen', undefined, undefined),
  })

  const printAnswer = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('You said: '),
      second: block('cb_get_global', undefined, { name: textVal('answer') }),
    }),
  })

  // ============================================================
  // PHASE 4 — Analyze, classify, and measure similarity
  // ============================================================

  const storeScore = block('cb_set_global', undefined, {
    name: textVal('score'),
    value: block('cb_analyze_sentiment', undefined, {
      text: block('cb_get_global', undefined, { name: textVal('answer') }),
    }),
  })

  const printScore = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Sentiment score: '),
      second: block('cb_get_global', undefined, { name: textVal('score') }),
    }),
  })

  const storeLabel = block('cb_set_global', undefined, {
    name: textVal('label'),
    value: block('cb_classify', undefined, {
      classifier: textVal('mood'),
      text: block('cb_get_global', undefined, { name: textVal('answer') }),
    }),
  })

  const printLabel = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('My classifier thinks you feel: '),
      second: block('cb_get_global', undefined, { name: textVal('label') }),
    }),
  })

  const storeSimilarity = block('cb_set_global', undefined, {
    name: textVal('similarity'),
    value: block('cb_find_similar', undefined, {
      text_a: block('cb_get_global', undefined, { name: textVal('answer') }),
      text_b: textVal('I am having the best day of my life'),
    }),
  })

  const printSimilarity = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Similarity to best-day-ever: '),
      second: block('cb_get_global', undefined, { name: textVal('similarity') }),
    }),
  })

  // ============================================================
  // PHASE 5 — Branch on sentiment and respond out loud
  // ============================================================

  const happyCondition = block('cb_greater_than', undefined, {
    a: block('cb_get_global', undefined, { name: textVal('score') }),
    b: numVal(0),
  })

  const sayHappy = block('cb_ai_say_and_wait', undefined, {
    text: textVal('That sounds wonderful! Keep being awesome.'),
  })

  const printHappy = block('cb_print', undefined, {
    message: textVal('Positive vibes detected — keep going!'),
  })

  const saySad = block('cb_ai_say_and_wait', undefined, {
    text: textVal('I am sorry you feel that way. Sending good vibes.'),
  })

  const printSad = block('cb_print', undefined, {
    message: textVal('Tough moment — you got this.'),
  })

  const ifElse = blockWithStatements(
    'cb_if_else',
    undefined,
    { CONDITION: happyCondition },
    { DO: chain(sayHappy, printHappy), ELSE: chain(saySad, printSad) },
  )

  // ============================================================
  // PHASE 6 — Markov remix: train on the answer, generate, say it
  // ============================================================

  const trainGenerator = block('cb_train_text_generator', undefined, {
    name: textVal('remix'),
    text: block('cb_get_global', undefined, { name: textVal('answer') }),
  })

  const storeRemix = block('cb_set_global', undefined, {
    name: textVal('remix'),
    value: block('cb_generate_text', undefined, {
      name: textVal('remix'),
      length: numVal(8),
    }),
  })

  const printRemix = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Remix of your words: '),
      second: block('cb_get_global', undefined, { name: textVal('remix') }),
    }),
  })

  const sayRemix = block('cb_ai_say_and_wait', undefined, {
    text: block('cb_get_global', undefined, { name: textVal('remix') }),
  })

  // ============================================================
  // PHASE 7 — Track the sentiment score as a regression dataset
  // ============================================================

  const addFirstPoint = block('cb_add_data_point', undefined, {
    dataset: textVal('moodLog'),
    x: numVal(1),
    y: block('cb_get_global', undefined, { name: textVal('score') }),
  })

  // A second fake point so regression has something to interpolate — in a
  // real app you'd accumulate these over multiple sessions. For now, nudge
  // the trajectory slightly above whatever was captured this run.
  const addSecondPoint = block('cb_add_data_point', undefined, {
    dataset: textVal('moodLog'),
    x: numVal(2),
    y: block('cb_add', undefined, {
      a: block('cb_get_global', undefined, { name: textVal('score') }),
      b: numVal(0.1),
    }),
  })

  const storePrediction = block('cb_set_global', undefined, {
    name: textVal('next'),
    value: block('cb_predict_number', undefined, {
      dataset: textVal('moodLog'),
      x: numVal(3),
    }),
  })

  const printPrediction = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Predicted next mood: '),
      second: block('cb_get_global', undefined, { name: textVal('next') }),
    }),
  })

  // ============================================================
  // PHASE 8 — Mic volume demo + classifier summary + goodbye
  // ============================================================

  const sayMicPrompt = block('cb_ai_say_and_wait', undefined, {
    text: textVal('Make some noise so I can check the microphone.'),
  })

  const printMicVolume = block('cb_print', undefined, {
    message: block('cb_join_text', undefined, {
      first: textVal('Mic volume: '),
      second: block('cb_ai_microphone_volume', undefined, undefined),
    }),
  })

  // Repeat the volume readout three times so the number visibly changes.
  const repeatMic = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: numVal(3) },
    { DO: printMicVolume },
  )

  const printSummary = block('cb_print', undefined, {
    message: block('cb_ai_summary', undefined, {
      classifier: textVal('mood'),
    }),
  })

  // Deliberately call say (non-waiting) then stopSpeaking to showcase both.
  const sayInterrupted = block('cb_ai_say', undefined, {
    text: textVal('One more thing, I just wanted to say...'),
  })

  const stopSpeaking = block('cb_ai_stop_speaking', undefined, undefined)

  const sayGoodbye = block('cb_ai_say_and_wait', undefined, {
    text: textVal('Thanks for chatting with me. Goodbye!'),
  })

  const printDone = block('cb_print', undefined, {
    message: textVal('--- Mood Buddy session complete — 16/16 AI blocks touched ---'),
  })

  // ============================================================
  // Assemble everything into a single top-level chain
  // ============================================================

  return workspace(
    chain(
      createClassifier,
      trainHappy,
      trainExcited,
      trainSad,
      trainAngry,
      startMic,
      greet,
      storeAnswer,
      printAnswer,
      storeScore,
      printScore,
      storeLabel,
      printLabel,
      storeSimilarity,
      printSimilarity,
      ifElse,
      trainGenerator,
      storeRemix,
      printRemix,
      sayRemix,
      addFirstPoint,
      addSecondPoint,
      storePrediction,
      printPrediction,
      sayMicPrompt,
      repeatMic,
      printSummary,
      sayInterrupted,
      stopSpeaking,
      sayGoodbye,
      printDone,
    ),
  )
}
