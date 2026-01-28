/*!
 * GitHub Code Snippets Loader
 * Loads and displays code snippets from GitHub repository
 */

(function() {
  'use strict';

  // Configuration
  const getConfig = () => ({
    username: document.getElementById('github-username')?.value || 'Briskwoods',
    repo: document.getElementById('github-repo')?.value || 'CodeSnippets',
    branch: document.getElementById('github-branch')?.value || 'main',
    folder: document.getElementById('snippets-folder')?.value || 'snippets'
  });

  let allSnippets = [];
  let currentCategory = 'all';

  // ==========================================
  // GITHUB API FUNCTIONS
  // ==========================================

  const fetchGitHubContents = async (path = '') => {
    const config = getConfig();
    const url = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${config.folder}${path ? '/' + path : ''}?ref=${config.branch}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  };

  const fetchFileContent = async (downloadUrl) => {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    return await response.text();
  };

  // ==========================================
  // SNIPPET PARSING
  // ==========================================

  const parseSnippetMetadata = (content, filename) => {
    const lines = content.split('\n');
    const metadata = {
      title: filename.replace(/\.(cs|js|py|java|cpp|c|ts|jsx|tsx)$/i, ''),
      description: '',
      category: 'utilities',
      categories: [], // Support multiple categories
      language: getLanguageFromExtension(filename),
      tags: []
    };

    // Parse metadata from comments at the top of the file
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      
      // Check for @title
      if (line.includes('@title:')) {
        metadata.title = line.split('@title:')[1].trim().replace(/[*\/]/g, '');
      }
      
      // Check for @description
      if (line.includes('@description:')) {
        metadata.description = line.split('@description:')[1].trim().replace(/[*\/]/g, '');
      }
      
      // Check for @category (can be comma-separated for multiple)
      if (line.includes('@category:')) {
        const categoryStr = line.split('@category:')[1].trim().toLowerCase().replace(/[*\/]/g, '');
        const cats = categoryStr.split(',').map(c => c.trim()).filter(c => c);
        
        if (cats.length > 0) {
          metadata.category = cats[0]; // Primary category
          metadata.categories = cats; // All categories
        }
      }
      
      // Check for @tags
      if (line.includes('@tags:')) {
        const tagsStr = line.split('@tags:')[1].trim().replace(/[*\/]/g, '');
        metadata.tags = tagsStr.split(',').map(t => t.trim());
      }
    }

    // If no description found in metadata, try to extract from summary comment
    if (!metadata.description) {
      const summaryMatch = content.match(/\/\/\/?\s*<summary>([\s\S]*?)<\/summary>/i) || 
                          content.match(/\/\*\*([\s\S]*?)\*\//);
      if (summaryMatch) {
        metadata.description = summaryMatch[1]
          .replace(/<\/?summary>/gi, '')
          .replace(/\/\/\/?\s*/g, '')
          .replace(/\*+\/?/g, '')
          .trim()
          .split('\n')[0]; // Take first line only
      }
    }

    return metadata;
  };

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'cs': 'csharp',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby'
    };
    return langMap[ext] || 'csharp';
  };

  // ==========================================
  // UI RENDERING
  // ==========================================

  const createSnippetCard = (snippet) => {
    const card = document.createElement('div');
    card.className = 'snippet-card';
    // Store all categories for filtering
    card.dataset.category = snippet.metadata.category;
    card.dataset.categories = snippet.metadata.categories.join(',');
    
    // Show all categories as badges
    const categoryBadges = snippet.metadata.categories.length > 0
      ? snippet.metadata.categories.map(cat => `<span class="snippet-category">${cat}</span>`).join(' ')
      : `<span class="snippet-category">${snippet.metadata.category}</span>`;
    
    card.innerHTML = `
      <div class="snippet-card-header">
        <h4 class="snippet-title">${escapeHtml(snippet.metadata.title)}</h4>
        <span class="snippet-language">${snippet.metadata.language}</span>
      </div>
      <p class="snippet-description">${escapeHtml(snippet.metadata.description || 'Click to view code')}</p>
      <div class="snippet-meta">
        <span><i class="fas fa-code"></i> ${snippet.lines} lines</span>
        ${snippet.metadata.tags.length > 0 ? `<span><i class="fas fa-tags"></i> ${snippet.metadata.tags.slice(0, 2).join(', ')}</span>` : ''}
      </div>
      <div class="snippet-categories">${categoryBadges}</div>
    `;
    
    card.addEventListener('click', () => openSnippetModal(snippet));
    
    return card;
  };

  const renderSnippets = (snippets = allSnippets) => {
    const container = document.getElementById('snippets-container');
    container.innerHTML = '';
    
    // Filter by category - now supports multiple categories
    const filtered = currentCategory === 'all' 
      ? snippets 
      : snippets.filter(s => {
          // Check if the snippet has multiple categories
          if (s.metadata.categories && s.metadata.categories.length > 0) {
            return s.metadata.categories.includes(currentCategory);
          }
          // Fallback to single category
          return s.metadata.category === currentCategory;
        });
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="code-error">
          <i class="fas fa-folder-open"></i>
          <p>No snippets found in this category.</p>
        </div>
      `;
      return;
    }
    
    filtered.forEach(snippet => {
      container.appendChild(createSnippetCard(snippet));
    });
  };

  // ==========================================
  // MODAL FUNCTIONS
  // ==========================================

  const openSnippetModal = (snippet) => {
    const modal = document.getElementById('snippet-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCode = document.getElementById('modal-code');
    const modalGithubLink = document.getElementById('modal-github-link');
    
    modalTitle.textContent = snippet.metadata.title;
    modalCode.textContent = snippet.content;
    modalCode.className = `language-${snippet.metadata.language}`;
    
    const config = getConfig();
    modalGithubLink.href = `https://github.com/${config.username}/${config.repo}/blob/${config.branch}/${config.folder}/${snippet.filename}`;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Re-highlight with Prism
    if (window.Prism) {
      Prism.highlightElement(modalCode);
    }
  };

  const closeSnippetModal = () => {
    const modal = document.getElementById('snippet-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  // ==========================================
  // CATEGORY FILTERING
  // ==========================================

  const initCategoryFilters = () => {
    const buttons = document.querySelectorAll('.category-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update current category and re-render
        currentCategory = btn.dataset.category;
        renderSnippets();
      });
    });
  };

  // ==========================================
  // LOADING SNIPPETS
  // ==========================================

  const loadSnippets = async () => {
    const loadingEl = document.getElementById('code-loading');
    const errorEl = document.getElementById('code-error');
    const containerEl = document.getElementById('snippets-container');
    
    try {
      loadingEl.style.display = 'flex';
      errorEl.style.display = 'none';
      containerEl.innerHTML = '';
      
      // Fetch repository contents
      const files = await fetchGitHubContents();
      
      // Filter code files
      const codeFiles = files.filter(file => 
        file.type === 'file' && 
        /\.(cs|js|py|java|cpp|c|ts|jsx|tsx)$/i.test(file.name)
      );
      
      if (codeFiles.length === 0) {
        throw new Error('No code files found in the repository');
      }
      
      // Fetch content for each file
      allSnippets = await Promise.all(
        codeFiles.map(async (file) => {
          try {
            const content = await fetchFileContent(file.download_url);
            const metadata = parseSnippetMetadata(content, file.name);
            
            return {
              filename: file.name,
              content: content,
              lines: content.split('\n').length,
              metadata: metadata,
              url: file.html_url
            };
          } catch (err) {
            console.error(`Failed to load ${file.name}:`, err);
            return null;
          }
        })
      );
      
      // Filter out failed loads
      allSnippets = allSnippets.filter(s => s !== null);
      
      // Sort by title
      allSnippets.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
      
      loadingEl.style.display = 'none';
      renderSnippets();
      
    } catch (error) {
      console.error('Error loading snippets:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      
      // Update error message based on error type
      if (error.message.includes('404')) {
        errorEl.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          <p>Repository not found.</p>
          <small>Make sure your GitHub repository "${getConfig().username}/${getConfig().repo}" exists and is public.</small>
        `;
      }
    }
  };

  // ==========================================
  // MODAL INTERACTIONS
  // ==========================================

  const initModalInteractions = () => {
    const modal = document.getElementById('snippet-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const copyBtn = document.getElementById('modal-copy-btn');
    
    // Close modal
    closeBtn.addEventListener('click', closeSnippetModal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeSnippetModal();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeSnippetModal();
      }
    });
    
    // Copy code
    copyBtn.addEventListener('click', async () => {
      const code = document.getElementById('modal-code').textContent;
      
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  };

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const init = () => {
    // Only initialize if we're on the code snippets section
    if (!document.getElementById('snippets-container')) {
      return;
    }
    
    initCategoryFilters();
    initModalInteractions();
    loadSnippets();
    
    console.log('📦 Code snippets loader initialized');
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
