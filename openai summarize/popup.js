async function getSelectedText() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'getSelectedText' }, (response) => {
          resolve(response.selectedText);
        });
      });
    });
  }
function showError(errorMessage) {
document.getElementById('summary').innerText = `Error: ${errorMessage}`;
  }
function setLoading(loading) {
    document.getElementById('loading').style.display = loading ? 'block' : 'none';
    document.getElementById('summarize').disabled = loading;
  }
  
  async function summarizeArticle(selectedText) {
  setLoading(true);
  // document.getElementById('summary').innerText = selectedText;

  const apiToken = document.getElementById('api-token').value;
  const model = document.getElementById('model-select').value;
  const prefix = document.getElementById('prefix').value;
  const maxTokens = parseInt(document.getElementById('max-tokens').value);
  
  if (!apiToken) {
    showError('Please enter your API token.');
    setLoading(false);
    return;
  }
    try {
    const response = await fetch(`https://api.openai.com/v1/engines/${model}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        prompt: `${prefix}. based on following text: ${selectedText}`,
        max_tokens: maxTokens,
        n: 1,
        stop: null,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });
    document.getElementById('summary').innerText = 'requested';
    const data = await response.json();

    if (!response.ok) {
        showError(`API error: ${data.error || data.message || JSON.stringify(data)|| 'Unknown error'}`);

    }
    showError(JSON.stringify(data))
    
    const summary = data.choices[0].text.trim();
    document.getElementById('summary').innerText = summary;
  
} catch (error) {
    // showError(`Error: ${error.message || 'Unknown error'}`);
  } finally {

    setLoading(false);
  }
  }
  
    document.getElementById('summarize').addEventListener('click', async () => {
    const selectedText = await getSelectedText();
    if (selectedText) {
      summarizeArticle(selectedText);
    } else {
      showError('No text selected. Please select text on the page to summarize.');
    }
  });
  
  function saveSettings() {
    const apiToken = document.getElementById('api-token').value;
    const model = document.getElementById('model-select').value;
    const prefix = document.getElementById('prefix').value;
    const maxTokens = document.getElementById('max-tokens').value;
  
    chrome.storage.sync.set({ apiToken, model, prefix, maxTokens }, () => {
      showError('Settings saved.');
    });
  }
  
  document.getElementById('api-token').addEventListener('change', saveSettings);
  document.getElementById('model-select').addEventListener('change', saveSettings);
  document.getElementById('prefix').addEventListener('change', saveSettings);
  document.getElementById('max-tokens').addEventListener('change', saveSettings);
  
  // Load API token when the popup is opened
  chrome.storage.sync.get(['apiToken', 'model', 'prefix', 'maxTokens'], (data) => {
    if (data.apiToken) {
      document.getElementById('api-token').value = data.apiToken;
    }
    if (data.model) {
      document.getElementById('model-select').value = data.model;
    }
    if (data.prefix) {
      document.getElementById('prefix').value = data.prefix;
    }
    if (data.maxTokens) {
      document.getElementById('max-tokens').value = data.maxTokens;
    }
  });

