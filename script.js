    const sentiment = new Sentiment();

    async function checkVibe() {
      const subreddit = document.getElementById('subredditInput').value.trim();
      if (!subreddit) return;

      try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=50`);
        const data = await response.json();
        
        let pos = 0, neu = 0, neg = 0, totalScore = 0;
        let postsHTML = '';

        data.data.children.forEach(child => {
          const title = child.data.title;
          const result = sentiment.analyze(title);
          totalScore += result.score;

          let scoreClass = 'neu';
          if (result.score > 0) { pos++; scoreClass = 'pos'; }
          else if (result.score < 0) { neg++; scoreClass = 'neg'; }
          else { neu++; }

          postsHTML += `
            <div class="post">
              <a href="https://reddit.com${child.data.permalink}" target="_blank">${title}</a>
              <span class="score ${scoreClass}">${result.score > 0 ? '+' : ''}${result.score}</span>
            </div>
          `;
        });

        document.getElementById('totalScore').innerText = totalScore;
        document.getElementById('posCount').innerText = pos;
        document.getElementById('neuCount').innerText = neu;
        document.getElementById('negCount').innerText = neg;
        document.getElementById('postsList').innerHTML = postsHTML;
        document.getElementById('results').style.display = 'block';

      } catch (err) {
        alert('Failed to fetch data. Verify subreddit name.');
      }
    }
