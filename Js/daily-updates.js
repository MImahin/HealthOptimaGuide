document.addEventListener("DOMContentLoaded", () => {
  const todayDiv = document.getElementById("today-card");
  const calendarDiv = document.getElementById("calendar");
  const cardDisplayDiv = document.getElementById("selected-card");

  function formatDate(d) {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  let updatesData = [];

  fetch('daily-updates.json')
    .then(res => {
      if(!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(updates => {
      updatesData = updates.sort((a,b) => new Date(b.date) - new Date(a.date));

      const todayDate = formatDate(new Date());
      const todayUpdate = updatesData.find(u => u.date === todayDate);
      if (todayUpdate) renderCard(todayUpdate, todayDiv);

      initCalendar(updatesData.map(u => u.date));
    })
    .catch(err => {
      console.error('Error loading daily updates:', err);
      todayDiv.textContent = "Failed to load updates.";
    });

  function initCalendar(datesWithCards) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Select a date";
    calendarDiv.appendChild(input);

    flatpickr(input, {
      inline: true,
      enable: datesWithCards,
      onChange: function(selectedDates) {
        if(selectedDates.length === 0) return;
        const selectedDate = formatDate(selectedDates[0]);
        const selectedUpdate = updatesData.find(u => u.date === selectedDate);
        cardDisplayDiv.innerHTML = "";
        if(selectedUpdate) {
          renderCard(selectedUpdate, cardDisplayDiv);
        } else {
          cardDisplayDiv.textContent = "No update for this date.";
        }
      },
      locale: { firstDayOfWeek: 1 },
      enableTime: false,
    });
  }

  function renderCard(update, container) {
    const card = document.createElement('div');
    card.className = 'daily-card step-content';

    // Quotes
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

    // Videos
    if(update.videos){
      update.videos.forEach(v => {
        if(v.includes("instagram.com")){
          const btn = document.createElement("button");
          btn.className = "video-button insta";
          btn.textContent = "View Instagram Video";
          btn.onclick = () => window.open(v, "_blank");
          card.appendChild(btn);
        } else if(v.includes("facebook.com") || v.includes("fb.watch")){
          const wrapper = document.createElement("div");
          wrapper.className = "video-container";
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v)}&show_text=0&width=560`;
          iframe.width = "100%";
          iframe.height = "315";
          iframe.style.border = "none";
          iframe.allowFullscreen = true;
          iframe.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
          wrapper.appendChild(iframe);
          card.appendChild(wrapper);
        } else if(v.includes("youtube.com") || v.includes("youtu.be")){
          const wrapper = document.createElement("div");
          wrapper.className = "video-container";
          const videoId = v.includes("youtu.be") ? v.split('/').pop() : new URL(v).searchParams.get('v');
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube.com/embed/${videoId}`;
          iframe.width = "100%";
          iframe.height = "315";
          iframe.frameBorder = 0;
          iframe.allowFullscreen = true;
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          wrapper.appendChild(iframe);
          card.appendChild(wrapper);
        } else {
          const btn = document.createElement("button");
          btn.className = "video-button";
          btn.textContent = "View Video";
          btn.onclick = () => window.open(v,"_blank");
          card.appendChild(btn);
        }
      });
    }

    // Images
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

    container.appendChild(card);
  }
});
