let watchLaterList =
  JSON.parse(localStorage.getItem("watchLaterStorage")) || [];

document.addEventListener("DOMContentLoaded", function () {
  const btnWatchLaterList = document.querySelectorAll(".card__watch-later");

  // BƯỚC 1: Cập nhật trạng thái nút bấm khi tải lại trang
  function renderButtonStates() {
    btnWatchLaterList.forEach(function (button) {
      let cardId = button.getAttribute("data-id");

      if (watchLaterList.includes(cardId)) {
        button.classList.add("card__watch-later--active");
        button.textContent = "Đã lưu";
      } else {
        button.classList.remove("card__watch-later--active");
        button.textContent = "Xem sau";
      }
    });
  }

  // BƯỚC 2: Lắng nghe và xử lý sự kiện click trên từng nút
  btnWatchLaterList.forEach(function (button) {
    button.addEventListener("click", function () {
      let cardId = button.getAttribute("data-id");
      let viTri = watchLaterList.indexOf(cardId);

      // Thêm hoặc xóa ID khỏi mảng dựa trên trạng thái
      if (viTri === -1) {
        watchLaterList.push(cardId);
        button.classList.add("card__watch-later--active");
        button.textContent = "Đã lưu";
      } else {
        watchLaterList.splice(viTri, 1);
        button.classList.remove("card__watch-later--active");
        button.textContent = "Xem sau";
      }

      // BƯỚC 3: Đồng bộ dữ liệu mới nhất vào LocalStorage
      localStorage.setItem("watchLaterStorage", JSON.stringify(watchLaterList));
    });
  });

  renderButtonStates();
});
