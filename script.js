import Sentiment from 'https://esm.sh/sentiment@5.0.2';

const sentiment = new Sentiment();

const checkBtn = document.getElementById('checkBtn');
checkBtn.addEventListener('click', checkVibe);

function fetchRedditJSONP(subreddit) {
  return new Promise((resolve, reject) => {
    const callbackName = 'redditCallback_' + Math.random().toString(36).substring(2, 15);

    // Define global callback function
    window[callbackName] = function (data) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    // Create script tag pointing to Reddit JSONP endpoint
    const script = document.createElement('script');
    script.src = `https://www.reddit.com/r/${subreddit}/hot.json?limit=50&jsonp=${callbackName}`;
    console.info(script.src);
    script.onerror = function () {
      delete window[callbackName];
      document.body.removeChild(script);
      const msg = 'Failed to load Reddit data';
      errorEl.innerText = msg;
      reject(new Error(msg));
    };

    document.body.appendChild(script);
  });
}
async function checkVibe() {
  const inputEl = document.getElementById('subredditInput');
  const errorEl = document.getElementById('errorText');
  const subreddit = inputEl.value.trim();
  errorEl.innerText = '';

  const subredditPattern = /^[a-zA-Z0-9_]{3,21}$/;
  if (!subredditPattern.test(subreddit)) {
    errorEl.innerText = 'Please enter a valid subreddit name (3-21 characters).';
    return;
  }

  try {
    checkBtn.setAttribute('disabled', true);
    const data = await fetchRedditJSONP(subreddit);
    console.info(data);

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
              <a href="https://reddit.com${child.data.permalink}" target="_blank" rel="noreferrer">${title}</a>
              <span class="${scoreClass}">${result.score > 0 ? '+' : ''}${result.score}</span>
            </div>
          `;
    });

    console.info(`pos = ${pos}, neu = ${neu}, neg = ${neg}, totalScore = ${totalScore}`);
    document.getElementById('totalScore').innerText = totalScore;
    document.getElementById('posCount').innerText = pos;
    document.getElementById('neuCount').innerText = neu;
    document.getElementById('negCount').innerText = neg;
    document.getElementById('postsList').innerHTML = postsHTML;
    document.getElementById('results').style.display = 'block';
    checkBtn.removeAttribute('disabled');
  } catch (err) {
    errorEl.innerText = 'Failed to fetch data. Ensure the subreddit exists.';
    console.error(err);
  }
}