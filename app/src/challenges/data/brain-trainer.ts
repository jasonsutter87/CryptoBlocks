import type { ThemePack } from '../types'

export const brainTrainer: ThemePack = {
  id: 'brain-trainer',
  name: 'Brain Trainer',
  description: 'Teach AI to classify, predict, and generate text',
  icon: '🧠',
  color: '#7C3AED',
  challenges: [
    {
      id: 'bt-1',
      title: 'Mood Check',
      description:
        'Use Analyze Sentiment on the text "I love this great day" and print the score. Positive text should give a score of 1.',
      difficulty: 'beginner',
      theme: 'brain-trainer',
      expectedOutput: ['1'],
      par: 3,
      hints: [
        'Use the Analyze Sentiment block from the AI category.',
        'Put "I love this great day" into Analyze Sentiment, then Print the result.',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'bt-2',
      title: 'Bad Vibes',
      description:
        'Analyze the sentiment of "terrible horrible awful day" and print the score. All negative words should give -1.',
      difficulty: 'beginner',
      theme: 'brain-trainer',
      expectedOutput: ['-1'],
      par: 3,
      hints: [
        'Analyze Sentiment scores words as positive (+1) or negative (-1) and averages them.',
        'All 3 scoreable words are negative, so the average is -1.',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'bt-3',
      title: 'Text Twins',
      description:
        'Use Find Similar to compare "the cat sat" with "the cat sat". Identical texts should have similarity 1. Print the result.',
      difficulty: 'intermediate',
      theme: 'brain-trainer',
      expectedOutput: ['1'],
      par: 3,
      hints: [
        'Find Similar calculates cosine similarity between two texts.',
        'Identical texts always return 1.0 — just Print the result of Find Similar.',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'bt-4',
      title: 'Train & Classify',
      description:
        'Create a classifier called "animals". Add example "barks loudly" with label "dog". Add example "purrs softly" with label "cat". Classify "barks at strangers" and print the result.',
      difficulty: 'intermediate',
      theme: 'brain-trainer',
      expectedOutput: ['dog'],
      par: 7,
      hints: [
        'Create Classifier "animals", then Add Example twice with different labels.',
        '"barks at strangers" shares the word "barks" with the "dog" example, so it should classify as "dog".',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'bt-5',
      title: 'Predict the Future',
      description:
        'Add 3 data points to dataset "sales": (1, 10), (2, 20), (3, 30). This is a perfect line! Predict the value at x=5 and print it.',
      difficulty: 'advanced',
      theme: 'brain-trainer',
      expectedOutput: ['50'],
      par: 7,
      hints: [
        'Use Add Data Point three times for the "sales" dataset.',
        'The pattern is y = 10*x. Predict Number at x=5 should give 50.',
      ],
      allowedCategories: ['Basics', 'AI', 'Math'],
    },
  ],
}
