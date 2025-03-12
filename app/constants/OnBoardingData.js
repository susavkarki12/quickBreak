const OnBoardingData = [
  {
    type: "static",
    title1: "Hi, Welcome to",
    title2: "Time Blocking App",
    description: "Focus on What Matters. Time \n Blocking Makes it Easy.",
    description1: "Swipe left to continue\n←",
    image: require("../../assets/images/oboardingFirst.webp"),
  },
  {
    id: 2,
    type: "dynamic",
    question: "What is your primary usage goal?",
    options: [
      "Reduce mobile usage.",
      "Be more productive.",
      "Option 3.",
      "Option 4.",
    ],
    description1: "Swipe left to continue\n←",
  },
  {
    id: 3,
    type: "dynamic",
    question: "What's Your Daily Usage Limit?",
    options: [
      "I'll limit to 30 minutes per day ",
      "I'll limit to 1 hour per day ",
      "I'll limit to 2 hours per day ",
      "I'll set through settings",
    ],
    description1: "Swipe left to continue\n←",
  },
  {
    id: 4, // This will be rendered later
    type: "static",
    title1: "ALL SET!",
    description: "Your journey to a calmer, more \n productive you starts now.",
    image: require("../../assets/images/onboardingLast.webp"),
  },
];

export default OnBoardingData