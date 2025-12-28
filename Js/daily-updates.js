document.addEventListener("DOMContentLoaded", () => {
  const todayDiv = document.getElementById("today-card");
  const archiveDiv = document.getElementById("archive-cards");
  const todayDate = new Date().toISOString().slice(0, 10);

  fetch('daily-updates.json')
    .then(res => res.json())
    .then(updates => {
      // Sort updates by date descending
      updates.sort((a, b) => new Date(b.date) - new Date(a.date));

      updates.forEach(update => {
        // Create card container
        const card = document.createElement('div');
        card.className = 'daily-card step-content';

        // Add quotes
        if (update.quotes) {
          update.quotes.forEach(q => {
            const quoteP = document.createElement('p');
            quoteP.className = 'quote-text';
            quoteP.textContent = `"${q.text}"`;
            card.appendChild(quoteP);

            if (q.author) {
              const authorP = document.createElement('p');
              authorP.className = 'quote-author';
              authorP.textContent = `- ${q.author}`;
              card.appendChild(authorP);
            }
          });
        }

        // Add videos
        if (update.videos) {
          update.videos.forEach(v => {
            if (v.includes("instagram.com")) {
              const blockquote = document.createElement("blockquote");
              blockquote.className = "instagram-media";
              blockquote.setAttribute("data-instgrm-version", "14");
              blockquote.style.width = "100%";

              const a = document.createElement("a");
              a.href = v;
              blockquote.appendChild(a);

              card.appendChild(blockquote);

              // Render Instagram embed
              if (window.instgrm) window.instgrm.Embeds.process();
            } else {
              // YouTube / other videos
              const videoDiv = document.createElement('div');
              videoDiv.className = 'video-container';
              const iframe = document.createElement('iframe');
              iframe.src = v;
              iframe.frameBorder = 0;
              iframe.allowFullscreen = true;
              iframe.width = "100%";
              iframe.height = "315";
              videoDiv.appendChild(iframe);
              card.appendChild(videoDiv);
            }
          });
        }

        // Add images
        if (update.images) {
          update.images.forEach(img => {
            const imgEl = document.createElement('img');
            imgEl.src = img;
            imgEl.style.width = "100%";
            imgEl.style.marginTop = "10px";
            imgEl.style.borderRadius = "6px";
            card.appendChild(imgEl);
          });
        }

        // Place today vs archive
        if (update.date === todayDate) {
          card.classList.add('today');
          todayDiv.appendChild(card);
        } else {
          const archiveCard = document.createElement('div');
          archiveCard.className = 'archive-card';
          const title = document.createElement('h4');
          title.textContent = update.date;
          archiveCard.appendChild(title);

          const content = document.createElement('div');
          content.className = 'archive-content';
          content.appendChild(card);
          archiveCard.appendChild(content);

          // Toggle archive content visibility
          archiveCard.addEventListener('click', () => {
            archiveCard.classList.toggle('active');
          });

          archiveDiv.appendChild(archiveCard);
        }
      });
    })
    .catch(err => {
      console.error('Error loading daily updates:', err);
      const todayDiv = document.getElementById("today-card");
      if(todayDiv) todayDiv.textContent = "Failed to load updates.";
    });
});
