import type { LabPack } from '../types'

export const fromBlocksBrainTrainer: LabPack = {
  id: 'from-blocks-brain-trainer',
  name: 'From Blocks: Brain Trainer',
  description: 'You solved these with blocks. Now try them in JavaScript!',
  icon: '🧠',
  color: '#7C3AED',
  exercises: [
    {
      id: 'lab-fb-bt-1',
      title: 'Mood Check',
      description:
        'You already solved this with blocks — an Analyze Sentiment block on a positive phrase. Now do the same in JavaScript.\n\nWrite a simple sentiment scorer: split "I love this great day" into words, count positive words ("love", "great"), and print 1 if there are more positive than negative words.',
      difficulty: 'beginner',
      expectedOutput: ['1'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Score the sentiment of "I love this great day"\n// Positive words: love, great, good, happy, awesome\n// Print 1 if positive score > negative score\n',
      hints: [
        'Split the text into words: var words = "I love this great day".split(" ");',
        'Loop through words and count how many are in a positive word list.',
        'If positiveCount > negativeCount, print 1. Otherwise print -1. If equal, print 0.',
      ],
    },
    {
      id: 'lab-fb-bt-2',
      title: 'Bad Vibes',
      description:
        'You already solved this with blocks — Analyze Sentiment returning -1 for all-negative text. Now do the same in JavaScript.\n\nScore the sentiment of "terrible horrible awful day". All three scoreable words are negative — print -1.',
      difficulty: 'beginner',
      expectedOutput: ['-1'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Score the sentiment of "terrible horrible awful day"\n// Negative words: terrible, horrible, awful, bad, sad\n// Print -1 if negative score dominates\n',
      hints: [
        'Split the string into words with .split(" ").',
        'Count how many words appear in your negative word list.',
        'If negativeCount > positiveCount, console.log(-1).',
      ],
    },
    {
      id: 'lab-fb-bt-3',
      title: 'Train & Classify',
      description:
        'You already solved this with blocks — creating a classifier with labeled examples and running a prediction. Now do the same in JavaScript.\n\nBuild a simple keyword classifier: if the input text contains "bark" or "barks", classify it as "dog". If it contains "purr" or "purrs", classify as "cat". Classify "barks at strangers" and print the result.',
      difficulty: 'intermediate',
      expectedOutput: ['dog'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Classify "barks at strangers" as "dog" or "cat" based on keywords\n',
      hints: [
        'Use String.includes() to check for keywords: text.includes("bark")',
        'if (text.includes("bark") || text.includes("barks")) { console.log("dog"); }',
        'Add a similar branch for "purr" / "purrs" to classify as "cat".',
      ],
    },
    {
      id: 'lab-fb-bt-4',
      title: 'Predict the Future',
      description:
        'You already solved this with blocks — adding data points to a dataset and predicting with linear regression. Now do the same in JavaScript.\n\nYou have data points (1,10), (2,20), (3,30). The pattern is y = 10 * x. Predict the value at x=5 and print it.',
      difficulty: 'advanced',
      expectedOutput: ['50'],
      starterCode:
        '// You did this as a block challenge! Now write it in JavaScript.\n// Data: (1,10), (2,20), (3,30). Pattern is y = 10 * x.\n// Predict the value at x = 5\n',
      hints: [
        'The slope is consistent: each x-step increases y by 10.',
        'Simple linear prediction: var slope = 10; var prediction = slope * 5;',
        'console.log(prediction) should give 50.',
      ],
    },
  ],
}
