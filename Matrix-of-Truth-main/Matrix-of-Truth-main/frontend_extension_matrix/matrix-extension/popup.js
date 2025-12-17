// popup.js for Python extension

window.extensionConfig = { apiUrl: 'https://matrix-backend-221199009475.asia-south1.run.app' };

document.addEventListener('DOMContentLoaded', function () {
  const checkFactsBtn = document.getElementById('checkFactsBtn');
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');

  // Helper function to create collapsible sections
  function createCollapsibleSection(title, contentElement, isOpen = false) {
    const section = document.createElement('div');
    section.className = 'collapsible-section';

    const header = document.createElement('div');
    header.className = `collapsible-header ${isOpen ? 'active' : ''}`;
    header.innerHTML = `
      <span>${title}</span>
      <svg class="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    const content = document.createElement('div');
    content.className = `collapsible-content ${isOpen ? 'open' : ''}`;

    const inner = document.createElement('div');
    inner.className = 'collapsible-inner';
    inner.appendChild(contentElement);

    content.appendChild(inner);

    header.addEventListener('click', () => {
      const isClosed = !content.classList.contains('open');
      if (isClosed) {
        content.classList.add('open');
        header.classList.add('active');
      } else {
        content.classList.remove('open');
        header.classList.remove('active');
      }
    });

    section.appendChild(header);
    section.appendChild(content);

    return section;
  }

  checkFactsBtn.addEventListener('click', async () => {
    // Update status and clear previous results
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>Analyzing content...</span>
      </div>
      <div class="scan-progress"></div>
    `;
    resultsDiv.style.display = "none";
    resultsDiv.innerHTML = "";

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Extract page content
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // Get the page title
          const title = document.title;

          // Get the main content (prioritizing article content)
          let content = '';

          // Try to get content from article elements first
          const articleElements = document.querySelectorAll('article');
          if (articleElements.length > 0) {
            articleElements.forEach(el => {
              content += el.innerText + '\n\n';
            });
          } else {
            // If no article elements, try main
            const mainElement = document.querySelector('main');
            if (mainElement) {
              content = mainElement.innerText;
            } else {
              // Fall back to body content, but try to exclude navigation, footers, etc.
              const bodyContent = document.body.innerText;

              // Remove common navigation and unrelated elements
              const elementsToExclude = document.querySelectorAll('nav, header, footer, aside, .sidebar, .navigation, .menu, .comments');
              let cleanContent = bodyContent;

              elementsToExclude.forEach(el => {
                cleanContent = cleanContent.replace(el.innerText, '');
              });

              content = cleanContent;
            }
          }

          return content;
        }
      });

      const pageContent = result[0].result;

      if (!pageContent || pageContent.trim().length === 0) {
        throw new Error("Could not extract text content from this page.");
      }

      // Send data to Python backend
      const response = await fetch(`${window.extensionConfig.apiUrl}/get-fc-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: pageContent })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.content);
      }

      // Hide loading status
      statusDiv.style.display = 'none';
      resultsDiv.style.display = "block";

      const analysis = data.content;
      const detailedAnalysis = analysis.fact_check_result.detailed_analysis;
      const overall = detailedAnalysis.overall_analysis;
      const claims = detailedAnalysis.claim_analysis;
      const sources = detailedAnalysis.source_analysis;
      const sourceUrls = analysis.sources;

      // --- Overall Analysis Section ---
      const overallDiv = document.createElement('div');

      // Truth Score
      const scoreDiv = document.createElement('div');
      scoreDiv.className = 'truth-score';

      let scoreClass = 'low-score';
      if (overall.truth_score >= 0.75) scoreClass = 'high-score';
      else if (overall.truth_score >= 0.4) scoreClass = 'medium-score';

      scoreDiv.innerHTML = `
        <div class="score-value">${overall.truth_score}</div>
        <div class="score-bar">
          <div class="score-fill ${scoreClass}" style="width: ${overall.truth_score * 100}%"></div>
        </div>
      `;
      overallDiv.appendChild(scoreDiv);

      // Reliability
      const reliabilityP = document.createElement('p');
      reliabilityP.innerHTML = `<strong>Reliability:</strong> ${overall.reliability_assessment}`;
      reliabilityP.style.marginBottom = '10px';
      overallDiv.appendChild(reliabilityP);

      // Key Findings
      const findingsTitle = document.createElement('p');
      findingsTitle.innerHTML = `<strong>Key Findings:</strong>`;
      findingsTitle.style.marginBottom = '5px';
      overallDiv.appendChild(findingsTitle);

      const findingsList = document.createElement('ul');
      findingsList.className = 'findings-list';
      overall.key_findings.forEach(finding => {
        const li = document.createElement('li');
        li.textContent = finding;
        findingsList.appendChild(li);
      });
      overallDiv.appendChild(findingsList);

      resultsDiv.appendChild(createCollapsibleSection('Overall Analysis', overallDiv, true));

      // --- Source Analysis Section ---
      const sourcesDiv = document.createElement('div');

      if (sources && sources.length > 0) {
        const table = document.createElement('table');
        table.className = 'source-table';
        table.innerHTML = `
          <thead>
            <tr>
              <th>Source</th>
              <th>Credibility</th>
              <th>Transparency</th>
            </tr>
          </thead>
          <tbody>
            ${sources.map((source, index) => `
              <tr>
                <td>
                  <a href="${sourceUrls[index] || '#'}" target="_blank" class="source-link">${source.source}</a>
                </td>
                <td style="color: ${source.credibility_score > 0.7 ? 'var(--green-primary)' : source.credibility_score > 0.4 ? 'var(--amber-primary)' : 'var(--rose-primary)'}">
                  ${source.credibility_score.toFixed(2)}
                </td>
                <td>${source.transparency_score.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        `;
        sourcesDiv.appendChild(table);
      } else {
        sourcesDiv.textContent = "No specific sources analyzed.";
      }

      // Source URLs list
      if (sourceUrls && sourceUrls.length > 0) {
        const urlsTitle = document.createElement('h4');
        urlsTitle.textContent = "Source URLs";
        urlsTitle.style.marginTop = "15px";
        urlsTitle.style.marginBottom = "5px";
        urlsTitle.style.color = "var(--green-primary)";
        urlsTitle.style.fontSize = "14px";
        sourcesDiv.appendChild(urlsTitle);

        const urlList = document.createElement('ul');
        urlList.className = 'findings-list';
        sourceUrls.forEach(url => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${url}" target="_blank" class="source-link">${url}</a>`;
          urlList.appendChild(li);
        });
        sourcesDiv.appendChild(urlList);
      }

      resultsDiv.appendChild(createCollapsibleSection('Source Analysis', sourcesDiv));


      // --- Claim Analysis Section ---
      const claimsDiv = document.createElement('div');

      if (claims && claims.length > 0) {
        claims.forEach(claim => {
          const claimItem = document.createElement('div');
          claimItem.className = 'fact-item';

          let statusClass = 'neutral';
          if (claim.verification_status === 'Verified') statusClass = 'accurate';
          else if (claim.verification_status === 'Refuted') statusClass = 'inaccurate';
          else if (claim.verification_status === 'Partially Verified') statusClass = 'partially-accurate';

          claimItem.innerHTML = `
            <div class="fact-statement">${claim.claim}</div>
            <div class="${statusClass}" style="font-size: 13px; margin-bottom: 4px;">
              <strong>Status:</strong> ${claim.verification_status} (Confidence: ${claim.confidence_level})
            </div>
          `;
          claimsDiv.appendChild(claimItem);
        });
      } else {
        claimsDiv.textContent = "No specific claims analyzed.";
      }

      resultsDiv.appendChild(createCollapsibleSection('Claim Analysis', claimsDiv));

    } catch (error) {
      statusDiv.style.display = 'block';
      statusDiv.textContent = `Error: ${error.message}`;
      statusDiv.style.backgroundColor = "#ffebee";
      statusDiv.style.color = "#c62828";
    }
  });
});