document.addEventListener("DOMContentLoaded", () => {
  const todayDiv = document.getElementById("today-card");
  const archiveDiv = document.getElementById("archive-cards");

  function formatDate(d){
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    return `${year}-${month}-${day}`;
  }

  const todayDate = formatDate(new Date());

  fetch('daily-updates.json')
    .then(res => {
      if(!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(updates => {
      updates.sort((a,b) => new Date(b.date) - new Date(a.date));

      updates.forEach(update => {
        const card = document.createElement('div');
        card.className = 'daily-card step-content';

        // Add quotes
        if(update.quotes){
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
        }

        // Add videos
        if(update.videos){
          update.videos.forEach(v => {
            if(v.includes("instagram.com")){
              try {
                const blockquote = document.createElement("blockquote");
                blockquote.className = "instagram-media";
                blockquote.setAttribute("data-instgrm-version","14");
                blockquote.style.width = "100%";

                const a = document.createElement("a");
                a.href = v;
                blockquote.appendChild(a);

                card.appendChild(blockquote);

                if(window.instgrm) instgrm.Embeds.process();
              } catch(e){
                // fallback clickable button
                const btn = document.createElement("button");
                btn.textContent = "View Instagram Video";
                btn.onclick = () => window.open(v, "_blank");
                card.appendChild(btn);
              }
            } else if(v.includes("facebook.com") || v.includes("fb.watch")){
              try {
                const iframe = document.createElement("iframe");
                iframe.src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v)}&show_text=0&width=560`;
                iframe.width = "100%";
                iframe.height = "315";
                iframe.style.border = "none";
                iframe.allowFullscreen = true;
                card.appendChild(iframe);
              } catch(e){
                const btn = document.createElement("button");
                btn.textContent = "View Facebook Video";
                btn.onclick = () => window.open(v,"_blank");
                card.appendChild(btn);
              }
            } else if(v.includes("youtube.com") || v.includes("youtu.be")){
              const iframe = document.createElement("iframe");
              iframe.src = v.includes("youtu.be") ? v.replace("youtu.be/", "www.youtube.com/embed/") : v.replace("watch?v=", "embed/");
              iframe.width = "100%";
              iframe.height = "315";
              iframe.frameBorder = 0;
              iframe.allowFullscreen = true;
              card.appendChild(iframe);
            } else {
              // fallback: clickable link
              const btn = document.createElement("button");
              btn.textContent = "View Video";
              btn.onclick = () => window.open(v,"_blank");
              card.appendChild(btn);
            }
          });
        }

        // Add images
        if(update.images){
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
        if(update.date === todayDate){
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

          archiveCard.addEventListener('click', () => {
            archiveCard.classList.toggle('active');
          });

          archiveDiv.appendChild(archiveCard);
        }
      });
    })
    .catch(err => {
      console.error('Error loading daily updates:', err);
      if(todayDiv) todayDiv.textContent = "Failed to load updates.";
    });
});
