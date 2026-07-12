/* ==========================================================================
   VIETNAM OCEAN EXPLORER — 5.JS
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
        displayImg.src = "https://realbiz.vn/wp-content/uploads/2023/06/ha-long-bay-vinh-ha-long-la-mot-trong-nhung-diem-du-lich-noi-tieng-va-dep-nhat-o-viet-nam-1116x628.jpg";
        displayImg.alt = "Cảnh Vịnh biển Việt Nam đẹp nguyên sơ";
    } else if (tabIndex === 2) {
        displayImg.src = "https://cdn.kienthuc.net.vn/images/c473d3e05eb071adc209eb4cffef733c0ccb6555cdf000978b67b9b599d820f103ab1665b9846072d837c9fd51db0f50ec1d4e20cc164148d84320a9dee60cc83119b57a68b5e7f6a8337811a23faf651b0e30dd3a547c44089846255e9915ebe9fe6949f7871b2c487486068b3d1ad3/su-that-bat-ngo-ve-ranh-dai-duong-sau-nhat-tren-trai-dat-Hinh-7.jpg";
        displayImg.alt = "Biển khơi đại dương sâu thẳm";
    } else if (tabIndex === 3) {
        displayImg.src = "https://tepbac.com/upload/images/2023/12/san-ho-1_1701662726.jpg";
        displayImg.alt = "Hệ sinh thái rạn san hô phong phú tại Việt Nam";
    }
}
