document.addEventListener("DOMContentLoaded", () => {
  const todayDiv = document.getElementById("today-card");
  const archiveDiv = document.getElementById("archive-cards");

  // Helper: format date as YYYY-MM-DD
  function formatDate(d) {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const todayDate = formatDate(new Date());
  console.log("Today's date:", todayDate);

  fetch('daily-updates.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(updates => {
      // Sort updates by date descending
      updates.sort((a, b) => new Date(b.date) - new Date(a.date));

      updates.forEach(update => {
        console.log("Processing update:", update.date);

        // Create card container
        const card = document.createElement('div');
        card.className = 'daily-card step-content';

        // ===== QUOTES =====
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

        // ===== VIDEOS =====
        if (update.videos) {
          update.videos.forEach(v => {
            if (v.includes("instagram.com")) {
              // Instagram embed
              const blockquote = document.createElement("blockquote");
              blockquote.className = "instagram-media";
              blockquote.setAttribute("data-instgrm-version", "14");
              blockquote.style.width = "100%";

              const a = document.createElement("a");
              a.href = v;
              blockquote.appendChild(a);

              card.appendChild(blockquote);
            } else {
              // YouTube / other iframe videos
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

        // ===== IMAGES =====
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

        // ===== PLACE TODAY vs ARCHIVE =====
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

      // ===== LOAD INSTAGRAM SCRIPT =====
      if (updates.some(u => u.videos && u.videos.some(v => v.includes("instagram.com")))) {
        if (!window.instgrm) {
          const script = document.createElement('script');
          script.src = "https://www.instagram.com/embed.js";
          script.async = true;
          script.onload = () => window.instgrm.Embeds.process();
          document.body.appendChild(script);
        } else {
          window.instgrm.Embeds.process();
        }
      }
    })
    .catch(err => {
      console.error('Error loading daily updates:', err);
      if (todayDiv) todayDiv.textContent = "Failed to load updates.";
    });
});
