/* ==========================================================================
   VIETNAM OCEAN EXPLORER — HOME.JS
   Xử lý logic tương tác đổi ảnh cho trang Tổng quan
   ========================================================================== */

function switchOceanTab(button, tabIndex) {
    // 1. Gỡ bỏ class active cũ trên các nút tab
    const tabs = document.querySelectorAll('.tab-trigger');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 2. Thêm class active cho nút vừa click
    button.classList.add('active');

    // 3. Lấy thẻ ảnh hiển thị
    const displayImg = document.getElementById('displayImg');
    if (!displayImg) return;
    
    // 4. Thay đổi tài nguyên ảnh dựa trên tab index được truyền vào từ HTML
    if (tabIndex === 1) {
        displayImg.src = "canh-vinh.jpg";
        displayImg.alt = "Cảnh Vịnh biển Việt Nam đẹp nguyên sơ";
    } else if (tabIndex === 2) {
        displayImg.src = "bien-khoi.jpg";
        displayImg.alt = "Biển khơi đại dương sâu thẳm";
    } else if (tabIndex === 3) {
        displayImg.src = "san-ho-1.jpg";
        displayImg.alt = "Hệ sinh thái rạn san hô phong phú tại Việt Nam";
    }
}
