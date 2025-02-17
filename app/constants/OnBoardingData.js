export default OnBoardingData = [
    {
      id: 1,
      type: "static",
      title1: "Hi, Welcome to",
      title2: "Time Blocking App",
      description: "Focus on What Matters. Time Blocking Makes it Easy.",
      image: require("../../assets/images/6.png"),
    },
    {
      id: 2,
      type: "dynamic",
      question: "What is your primary usage goal?",
      options: [
        "3 hours",
        "2 hours",
        "1 hour",
        "I will set through settings",
      ],
    },
    {
      id: 3,
      type: "dynamic",
      question: "When should we remind you?",
      options: [
        "Remind me every 30mins",
        "Remind me every 20mins",
        "Remind me every 10mins",
        "Remind me every 5mins",
      ],
    },
    {
      id: 4,
      type: "dynamic",
      question: "How familiar are you with Time Blocking?",
      options: [
        "Very Familiar",
        "Familiar",
        "Not Familiar",
        "Know More",
      ],
    },
    {
      id: 5,
      type: "static",
      title1: "ALL SET!",
      description: "Your journey to a calmer, more productive you starts now.",
      image: require("../../assets/images/5.png"),
    },
  ];