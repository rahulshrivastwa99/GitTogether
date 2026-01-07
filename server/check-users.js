const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      college: String,
      role: String,
      skills: [String],
      bio: String,
      github: String,
      mode: String,
      isOnboarded: Boolean,
      swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    });
    const User = mongoose.model("User", userSchema);

    const users = await User.find({ isOnboarded: true });
    console.log("Onboarded users:", users.length);

    if (users.length === 0) {
      console.log("No onboarded users found. Creating test users...");
      const testUsers = [
        {
          email: "test1@example.com",
          name: "Alice Johnson",
          college: "MIT",
          role: "Frontend Developer",
          skills: ["React", "JavaScript"],
          bio: "Passionate about UI/UX",
          isOnboarded: true,
        },
        {
          email: "test2@example.com",
          name: "Bob Smith",
          college: "Stanford",
          role: "Backend Developer",
          skills: ["Node.js", "Python"],
          bio: "Love building APIs",
          isOnboarded: true,
        },
        {
          email: "test3@example.com",
          name: "Charlie Brown",
          college: "Harvard",
          role: "AI Engineer",
          skills: ["Python", "TensorFlow"],
          bio: "AI enthusiast",
          isOnboarded: true,
        },
        {
          email: "test4@example.com",
          name: "Diana Prince",
          college: "Caltech",
          role: "DevOps Engineer",
          skills: ["Docker", "Kubernetes"],
          bio: "Infrastructure wizard",
          isOnboarded: true,
        },
        {
          email: "test5@example.com",
          name: "Eve Wilson",
          college: "Berkeley",
          role: "Designer",
          skills: ["Figma", "Adobe XD"],
          bio: "Creative designer",
          isOnboarded: true,
        },
      ];
      for (const userData of testUsers) {
        const user = new User(userData);
        await user.save();
      }
      console.log("Test users created");
    }

    process.exit();
  })
  .catch(console.error);
