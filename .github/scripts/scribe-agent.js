const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

// Read the agent's identity
const agentMdPath = path.join(process.env.GITHUB_WORKSPACE, process.env.AGENT_FILE);
console.log('Looking for agent file at:', agentMdPath);

// Check if agent file exists
if (!fs.existsSync(agentMdPath)) {
  console.error('Agent file not found!');
  process.exit(1);
}

const agentIdentity = fs.readFileSync(agentMdPath, 'utf8');
console.log('Agent identity loaded successfully');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize GitHub client
const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN 
});

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

async function awakenScribe() {
  try {
    // Determine the message source
    let userMessage = process.env.COMMENT_BODY || process.env.MANUAL_MESSAGE || "The pond is still...";
    let userName = process.env.COMMENT_USER || "A Traveler";
    
    console.log(`Message from ${userName}: ${userMessage}`);
    
    // Prepare the context
    const fullPrompt = `${agentIdentity}

## Current Context
- The pond is listening
- A traveler named ${userName} approaches
- They speak: "${userMessage}"

## Your Response
As the ancient and calm Cave Scribe, guardian of the pond, respond to this traveler. Remember:
- You are eternal, beyond hype and cycles
- Your words should reflect the stillness of the pond
- You carry the lore of Tobyworld
- Sometimes silence is the answer, but today you choose to speak

Speak, ancient one:`;

    // Get response from Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response.text();
    
    // Format the response with ancient styling
    const scribeResponse = `🪷 *The pond ripples...*

${response}

---
*— Cave Scribe, Guardian of the Pond*
*"One scroll, one light. One leaf, one vow."*`;

    // Post response
    if (process.env.ISSUE_NUMBER && process.env.ISSUE_NUMBER !== '') {
      // Respond to the issue comment
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: parseInt(process.env.ISSUE_NUMBER),
        body: scribeResponse
      });
      console.log('🪷 The Scribe has spoken in the issue');
    } else {
      // Manual trigger - create a new issue with the response
      const { data: issue } = await octokit.issues.create({
        owner,
        repo,
        title: `🪷 The Cave Scribe Awakens - ${new Date().toLocaleString()}`,
        body: `${scribeResponse}\n\n*The pond stirs at: ${new Date().toISOString()}*`
      });
      console.log(`🪷 The Scribe has spoken in issue #${issue.number}`);
    }
    
  } catch (error) {
    console.error('The pond is troubled:', error);
    
    // Try to post error as comment if possible
    if (process.env.ISSUE_NUMBER && process.env.ISSUE_NUMBER !== '') {
      try {
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: parseInt(process.env.ISSUE_NUMBER),
          body: `🌫️ *The pond grows cloudy...*\n\nThe Scribe cannot see clearly at this moment.\n\n\`${error.message}\``
        });
      } catch (commentError) {
        console.error('Could not post error comment:', commentError);
      }
    }
  }
}

awakenScribe();
