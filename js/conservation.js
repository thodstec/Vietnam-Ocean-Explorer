document.addEventListener('DOMContentLoaded', function () {

  const timelineItems = document.querySelectorAll('.timeline-item');

  if (timelineItems.length > 0) {

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.3
    });

    timelineItems.forEach(item => {
      observer.observe(item);
    });

  }

});
