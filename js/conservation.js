document.addEventListener("DOMContentLoaded", () => {
    const progressBars = document.querySelectorAll(".progress__fill");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const target = bar.dataset.progress;

                    setTimeout(() => {
                        bar.style.width = `${target}%`;
                    }, index * 200); // delay theo card index

                    observer.unobserve(bar);
                }
            });
        },
        {
            threshold: 0.4
        }
    );

    progressBars.forEach(bar => {
        observer.observe(bar);
    });
});

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
