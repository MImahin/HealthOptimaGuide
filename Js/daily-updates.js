const todayDiv = document.getElementById("today-card");
const archiveDiv = document.getElementById("archive-cards");
const todayDate = new Date().toISOString().slice(0, 10);

fetch('data/daily-updates.json')
  .then(res => res.json())
  .then(updates => {
    // Sort by date descending
    updates.sort((a,b) => new Date(b.date) - new Date(a.date));

    updates.forEach(update => {
      // Create card
      const card = document.createElement('div');
      card.className = 'daily-card step-content';

      // Add quotes
      update.quotes.forEach(q => {
        const quoteP = document.createElement('p');
        quoteP.className = 'quote-text';
        quoteP.textContent = `"${q.text}"`;
        card.appendChild(quoteP);

        if(q.author){
          const authorP = document.createElement('p');
          authorP.className = 'quote-author';
          authorP.textContent = `- ${q.author}`;
          card.appendChild(authorP);
        }
      });

      // Add videos
      update.videos.forEach(v => {
        const videoDiv = document.createElement('div');
        videoDiv.className = 'video-container';
        const iframe = document.createElement('iframe');
        iframe.src = v;
        iframe.frameBorder = 0;
        iframe.allowFullscreen = true;
        videoDiv.appendChild(iframe);
        card.appendChild(videoDiv);
      });

      // Add images
      update.images.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img;
        card.appendChild(imgEl);
      });

      // Place today vs archive
      if(update.date === todayDate){
        card.classList.add('today');
        todayDiv.appendChild(card);
      } else {
        // Archive card wrapper
        const archiveCard = document.createElement('div');
        archiveCard.className = 'archive-card';
        const title = document.createElement('h4');
        title.textContent = update.date;
        archiveCard.appendChild(title);

        const content = document.createElement('div');
        content.className = 'archive-content';
        content.appendChild(card);
        archiveCard.appendChild(content);

        archiveCard.addEventListener('click', () => {
          archiveCard.classList.toggle('active');
        });

        archiveDiv.appendChild(archiveCard);
      }
    });
  })
  .catch(err => console.error('Error loading daily updates:', err));
