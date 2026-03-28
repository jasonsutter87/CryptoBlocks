import type { ThemePack } from '../types'

export const aiAcademy: ThemePack = {
  id: 'ai-academy',
  name: 'AI Academy',
  description: 'Train classifiers, analyze sentiment, and find text similarity',
  icon: '🤖',
  color: '#0EA5E9',
  challenges: [
    {
      id: 'aa-1',
      title: 'Train a Classifier',
      description:
        'Create a classifier called "mood". Add the example "I love it" with label "positive" and "I hate it" with label "negative". Then classify "I enjoy this" and print the result.',
      difficulty: 'beginner',
      theme: 'ai-academy',
      expectedOutput: ['positive'],
      par: 6,
      hints: [
        'Use Create Classifier, then Add Example twice, then Classify.',
        'Create Classifier "mood" → Add Example "I love it" / "positive" → Add Example "I hate it" / "negative" → Print Classify "I enjoy this".',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'aa-2',
      title: 'Mood Detector',
      description:
        'Analyze the sentiment of "This is amazing!" and print the score.',
      difficulty: 'beginner',
      theme: 'ai-academy',
      expectedOutput: [],
      par: 3,
      hints: [
        'Use the Analyze Sentiment block from the AI category.',
        'Print Analyze Sentiment "This is amazing!"',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'aa-3',
      title: 'Spam Filter',
      description:
        'Create a classifier called "spam". Add "Buy now!" and "Free money" as "spam" examples. Add "Meeting at 3pm" and "Project update" as "ham" examples. Classify "Win a prize!" and print the result.',
      difficulty: 'intermediate',
      theme: 'ai-academy',
      expectedOutput: ['spam'],
      par: 8,
      hints: [
        'You need four Add Example calls before classifying.',
        'Create Classifier "spam" → 2 spam examples → 2 ham examples → Print Classify "Win a prize!".',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'aa-4',
      title: 'Text Twins',
      description:
        'Find the similarity between "The cat sat on the mat" and "A cat was sitting on a mat". Print the result.',
      difficulty: 'intermediate',
      theme: 'ai-academy',
      expectedOutput: [],
      par: 3,
      hints: [
        'Use the Find Similar block from the AI category with the two sentences.',
        'Print Find Similar "The cat sat on the mat" / "A cat was sitting on a mat".',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'aa-5',
      title: 'Sentiment Trio',
      description:
        'Analyze the sentiment of three phrases: "I love this!", "This is okay.", and "I hate bugs." Print each sentiment score on its own line.',
      difficulty: 'advanced',
      theme: 'ai-academy',
      expectedOutput: [],
      par: 6,
      hints: [
        'Call Analyze Sentiment three times and Print each result separately.',
        'Print Analyze Sentiment "I love this!" → Print Analyze Sentiment "This is okay." → Print Analyze Sentiment "I hate bugs."',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
    {
      id: 'aa-6',
      title: 'Smart Sorter',
      description:
        'Create a classifier "fruit-veggie". Train it with "apple" → "fruit", "carrot" → "veggie", "banana" → "fruit", "broccoli" → "veggie". Then classify "orange" and "spinach". Print both results.',
      difficulty: 'advanced',
      theme: 'ai-academy',
      expectedOutput: ['fruit', 'veggie'],
      par: 10,
      hints: [
        'You need four Add Example blocks before classifying twice.',
        'Create Classifier "fruit-veggie" → 4 training examples → Print Classify "orange" → Print Classify "spinach".',
      ],
      allowedCategories: ['Basics', 'AI', 'Text'],
    },
  ],
}
