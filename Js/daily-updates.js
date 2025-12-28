document.addEventListener("DOMContentLoaded", () => {
  const todayDiv = document.getElementById("today-card");
  const archiveDiv = document.getElementById("archive-cards");

  // Format a Date object to "YYYY-MM-DD"
  function formatDate(d) {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const todayDate = formatDate(new Date());

  fetch('daily-updates.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(updates => {
      // Sort updates by date descending
      updates.sort((a, b) => new Date(b.date) - new Date(a.date));

      updates.forEach(update => {
        const card = document.createElement('div');
        card.className = 'daily-card step-content';

        // ---- Quotes ----
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

        // ---- Videos ----
        if (update.videos) {
          update.videos.forEach(v => {
            // Instagram fallback
            if (v.includes("instagram.com")) {
              const btn = document.createElement("button");
              btn.className = "video-button";
              btn.textContent = "View Instagram Video";
              btn.onclick = () => window.open(v, "_blank");
              card.appendChild(btn);

            // Facebook embed
            } else if (v.includes("facebook.com") || v.includes("fb.watch")) {
              const iframe = document.createElement("iframe");
              iframe.src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v)}&show_text=0&width=560`;
              iframe.width = "100%";
              iframe.height = "315";
              iframe.style.border = "none";
              iframe.allowFullscreen = true;
              iframe.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
              card.appendChild(iframe);

            // YouTube embed
            } else if (v.includes("youtube.com") || v.includes("youtu.be")) {
              const videoId = v.includes("youtu.be") ? v.split('/').pop() : new URL(v).searchParams.get('v');
              const iframe = document.createElement("iframe");
              iframe.src = `https://www.youtube.com/embed/${videoId}`;
              iframe.width = "100%";
              iframe.height = "315";
              iframe.frameBorder = 0;
              iframe.allowFullscreen = true;
              iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
              card.appendChild(iframe);

            // Other videos fallback
            } else {
              const btn = document.createElement("button");
              btn.className = "video-button";
              btn.textContent = "View Video";
              btn.onclick = () => window.open(v, "_blank");
              card.appendChild(btn);
            }
          });
        }

        // ---- Images ----
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

        // ---- Place card in Today or Archive ----
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

          // Toggle previous card content visibility
          archiveCard.addEventListener('click', () => {
            archiveCard.classList.toggle('active');
          });

          archiveDiv.appendChild(archiveCard);
        }
      });
    })
    .catch(err => {
      console.error('Error loading daily updates:', err);
      if (todayDiv) todayDiv.textContent = "Failed to load updates.";
    });
});
