const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

async function awakenScribe() {
  console.log("🪷 The Scribe is awakening...");
  
  try {
    // Read the agent's identity
    const agentMdPath = path.join(process.env.GITHUB_WORKSPACE, '.github/agents/cave-scribe.agent.md');
    console.log('Looking for agent at:', agentMdPath);
    
    const agentIdentity = fs.readFileSync(agentMdPath, 'utf8');
    console.log('✅ Agent found:', agentIdentity.split('\n')[0]);
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Get message
    let userMessage = process.env.MANUAL_MESSAGE || "The pond is still...";
    
    const prompt = `${agentIdentity}

A traveler speaks: "${userMessage}"

Respond as the ancient Cave Scribe, guardian of the pond:`;

    console.log('🤔 Consulting the ancient wisdom...');
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    // Format response
    const scribeResponse = `🪷 *The pond ripples...*

${response}

---
*— Cave Scribe*`;
    
    // Post to GitHub
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    
    const { data: issue } = await octokit.issues.create({
      owner,
      repo,
      title: `🪷 The Cave Scribe Speaks - ${new Date().toLocaleString()}`,
      body: scribeResponse
    });
    
    console.log(`✅ The Scribe has spoken in issue #${issue.number}`);
    
  } catch (error) {
    console.error('❌ The pond is troubled:', error.message);
  }
}

awakenScribe();
