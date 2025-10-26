import { Octokit } from '@octokit/rest'

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function createRepository() {
  try {
    console.log('🚀 Creating GitHub repository...');
    
    const octokit = await getUncachableGitHubClient();
    
    // Create repository
    const response = await octokit.repos.createForAuthenticatedUser({
      name: 'NEWS',
      description: 'Multi-Site News Network Portal - 10 independent news channels with React + Vite + Express',
      private: false, // Public repository
      auto_init: false, // Don't initialize with README
    });
    
    console.log('✅ Repository created successfully!');
    console.log('📦 Repository URL:', response.data.html_url);
    console.log('🔗 Clone URL (HTTPS):', response.data.clone_url);
    console.log('🔗 Clone URL (SSH):', response.data.ssh_url);
    
    // Get authenticated user info
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('\n📝 Next steps to push your code:');
    console.log('   Run these commands in the Shell tab:\n');
    console.log('   git config user.name "' + user.name + '"');
    console.log('   git config user.email "' + user.email + '"');
    console.log('   git add .');
    console.log('   git commit -m "Initial commit: Multi-Site News Network Portal"');
    console.log('   git remote add origin ' + response.data.clone_url);
    console.log('   git branch -M main');
    console.log('   git push -u origin main');
    
    return response.data;
  } catch (error: any) {
    if (error.status === 422) {
      console.error('❌ Repository "NEWS" already exists on your GitHub account.');
      console.error('   Please delete it first or choose a different name.');
    } else {
      console.error('❌ Error creating repository:', error.message);
    }
    throw error;
  }
}

createRepository();
