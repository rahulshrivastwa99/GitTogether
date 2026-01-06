// src/lib/ai-spark.ts

interface ProjectIdea {
  title: string;
  description: string;
  techStack: string[];
}

export const generateProjectIdeas = async (
  userStack: string[],
  matchStack: string[]
): Promise<ProjectIdea[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const combined = [...new Set([...userStack, ...matchStack])];
  const isAI = combined.some((t) =>
    ["Python", "TensorFlow", "PyTorch", "ML"].includes(t)
  );
  const isWeb3 = combined.some((t) =>
    ["Solidity", "Rust", "Web3.js"].includes(t)
  );
  const isMobile = combined.some((t) =>
    ["Flutter", "Swift", "React Native"].includes(t)
  );

  // Logic to return relevant ideas based on keywords
  if (isAI && isWeb3) {
    return [
      {
        title: "Decentralized Model Marketplace",
        description:
          "A platform where data scientists can sell AI models as NFTs, ensuring ownership and royalties.",
        techStack: ["Solidity", "Python", "React"],
      },
      {
        title: "Fraud Detection DAO",
        description:
          "A community-governed system that uses ML to detect fraudulent transactions on-chain.",
        techStack: ["TensorFlow", "Web3.js", "Node.js"],
      },
    ];
  }

  if (isAI) {
    return [
      {
        title: "Smart Accessibility Assistant",
        description:
          "An app that uses computer vision to describe surroundings for visually impaired users in real-time.",
        techStack: ["Python", "OpenCV", "React Native"],
      },
      {
        title: "Personalized Learning Coach",
        description:
          "An AI tutor that adapts curriculum based on student's weak areas using NLP.",
        techStack: ["OpenAI API", "React", "Python"],
      },
    ];
  }

  if (isMobile) {
    return [
      {
        title: "Eco-Tracker AR",
        description:
          "A mobile game that uses AR to gamify cleaning up local parks and beaches.",
        techStack: ["Flutter", "ARKit", "Firebase"],
      },
    ];
  }

  // Generic Full Stack Fallback
  return [
    {
      title: "Real-time Collab Board",
      description:
        "A whiteboard tool with video chat for remote teams, focusing on low latency.",
      techStack: ["React", "WebRTC", "Socket.io"],
    },
    {
      title: "Local Event Aggregator",
      description:
        "A platform connecting volunteers with local NGOs needing tech help.",
      techStack: ["Next.js", "PostgreSQL", "Tailwind"],
    },
  ];
};
