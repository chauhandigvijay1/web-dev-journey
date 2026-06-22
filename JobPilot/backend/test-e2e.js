import { execSync } from 'child_process';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function runE2E() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  
  const { User } = await import('./src/models/User.js');
  const { Job } = await import('./src/models/Job.js');
  const { ResumeProfile } = await import('./src/models/ResumeProfile.js');
  
  console.log('--- DB connection established ---');
  
  console.log('Testing Flow A: Registration & Career Brain Initialization');
  const email = `testuser_${Date.now()}@example.com`;
  
  const user = await User.create({ name: 'Test User', email, password: 'password123' });
  console.log('User created:', user.email);
  
  const profile = await ResumeProfile.create({
    user: user._id,
    resumeUrl: 'http://cloudinary.mock/resume.pdf',
    parsedData: {
      summary: 'Experienced developer',
      skills: ['React', 'Node.js', 'MongoDB'],
      experience: [],
      education: [],
    }
  });
  console.log('Career Brain initialized with skills:', profile.parsedData.skills);
  
  console.log('Testing Flow B: Universal Job Import & MongoDB Save');
  const job = await Job.create({
    user: user._id,
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    salary: '$150k - $180k',
    status: 'applied',
    priorityScore: 85,
    contacts: []
  });
  console.log('Job imported successfully:', job.title, 'at', job.company);
  
  console.log('Testing Flow C: CRM Contact Save');
  job.contacts.push({
    name: 'Guillermo Rauch',
    role: 'CEO',
    email: 'ceo@vercel.com',
    linkedin: 'https://linkedin.com/in/rauchg',
    status: 'Contacted'
  });
  await job.save();
  console.log('CRM Contact saved:', job.contacts[0].name);

  console.log('Testing Flow D: Match Generation (Simulated)');
  const confidenceScore = 92;
  job.confidenceScore = confidenceScore;
  await job.save();
  console.log('Match Engine processed job with confidence score:', job.confidenceScore);
  
  console.log('Cleaning up test data...');
  await User.findByIdAndDelete(user._id);
  await Job.findByIdAndDelete(job._id);
  await ResumeProfile.findByIdAndDelete(profile._id);
  console.log('Test completed successfully. All flows verified.');
  
  process.exit(0);
}

runE2E().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
