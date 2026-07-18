/*====================================
    DỮ LIỆU ĐỊA ĐIỂM (HARD-CODE)
====================================*/

const placeDetails = [

    {
        title: "Vịnh Hạ Long",
        location: "Quảng Ninh",
        image: "images/halong.jpg",
        description: "Vịnh Hạ Long thuộc tỉnh Quảng Ninh và là một trong những danh lam thắng cảnh nổi tiếng nhất Việt Nam. Với hơn 1.600 đảo đá vôi lớn nhỏ cùng nhiều hang động kỳ vĩ như Hang Sửng Sốt và Động Thiên Cung, nơi đây tạo nên khung cảnh thiên nhiên độc đáo hiếm có. Năm 1994 và 2000, UNESCO đã công nhận Vịnh Hạ Long là Di sản Thiên nhiên Thế giới nhờ giá trị nổi bật về cảnh quan và địa chất. Du khách có thể tham quan bằng du thuyền, chèo kayak, khám phá làng chài, tắm biển và thưởng thức hải sản tươi sống. Đây cũng là khu vực có hệ sinh thái biển phong phú và nhiều loài sinh vật quý hiếm cần được bảo tồn.",
        wiki: "https://vi.wikipedia.org/wiki/V%E1%BB%8Bnh_H%E1%BA%A1_Long"
    },

    {
        title: "Phú Quốc",
        location: "Kiên Giang",
        image: "images/phuquoc.jpg",
        description: "Phú Quốc là hòn đảo lớn nhất Việt Nam, thuộc tỉnh Kiên Giang và được mệnh danh là 'Đảo Ngọc'. Nơi đây nổi tiếng với những bãi biển đẹp như Bãi Sao, Bãi Dài và Bãi Khem có làn nước trong xanh cùng bãi cát trắng mịn. Phú Quốc còn sở hữu Vườn Quốc gia với hệ sinh thái rừng và biển đa dạng, nhiều rạn san hô và thảm cỏ biển quý hiếm. Du khách có thể lặn ngắm san hô, tham quan quần đảo An Thới bằng cáp treo vượt biển, khám phá làng chài và thưởng thức hải sản tươi ngon. Đây là một trong những điểm nghỉ dưỡng và du lịch biển nổi tiếng nhất Việt Nam.",
        wiki: "https://vi.wikipedia.org/wiki/Ph%C3%BA_Qu%E1%BB%91c"
    },

    {
        title: "Nha Trang",
        location: "Khánh Hòa",
        image: "images/nhatrang.jpg",
        description: "Nha Trang là thành phố biển thuộc tỉnh Khánh Hòa và là một trong những trung tâm du lịch biển nổi tiếng của Việt Nam. Thành phố sở hữu vịnh Nha Trang với làn nước trong xanh, bãi cát trắng và khí hậu ôn hòa quanh năm. Nơi đây có nhiều hòn đảo như Hòn Mun, Hòn Tằm, Hòn Tre và Hòn Miễu với hệ sinh thái biển đa dạng, đặc biệt là các rạn san hô đầy màu sắc. Du khách có thể lặn biển, chèo kayak, nghỉ dưỡng hoặc tham quan Tháp Bà Ponagar, Chùa Long Sơn và Viện Hải dương học. Nha Trang luôn là điểm đến hấp dẫn đối với du khách trong và ngoài nước.",
        wiki: "https://vi.wikipedia.org/wiki/Nha_Trang"
    },

    {
        title: "Đảo Lý Sơn",
        location: "Quảng Ngãi",
        image: "images/lyson.jpg",
        description: "Đảo Lý Sơn thuộc tỉnh Quảng Ngãi, được hình thành từ hoạt động của núi lửa cách đây hàng triệu năm. Hòn đảo nổi bật với các vách đá nham thạch, Cổng Tò Vò, Hang Câu, Chùa Hang và đỉnh Thới Lới. Lý Sơn còn được biết đến là 'Vương quốc tỏi' nhờ những cánh đồng tỏi trải dài trên nền đất núi lửa màu mỡ. Du khách đến đây có thể tắm biển, lặn ngắm san hô, khám phá đảo Bé, tham quan các di tích lịch sử và tìm hiểu đời sống của ngư dân địa phương. Đây cũng là vùng đất gắn liền với lịch sử đội hùng binh Hoàng Sa và chủ quyền biển đảo Việt Nam.",
        wiki: "https://vi.wikipedia.org/wiki/L%C3%BD_S%C6%A1n"
    },

    {
        title: "Côn Đảo",
        location: "Bà Rịa - Vũng Tàu",
        image: "images/condao.jpg",
        description: "Côn Đảo là quần đảo thuộc tỉnh Bà Rịa - Vũng Tàu, nổi tiếng với vẻ đẹp hoang sơ, những bãi biển trong xanh và hệ sinh thái biển phong phú. Phần lớn diện tích thuộc Vườn Quốc gia Côn Đảo, nơi bảo tồn nhiều loài sinh vật quý hiếm như rùa biển, bò biển và các rạn san hô. Du khách có thể tham quan Bãi Đầm Trầu, Bãi Nhát, Hòn Bảy Cạnh, lặn biển ngắm san hô và trải nghiệm xem rùa biển đẻ trứng theo mùa. Ngoài giá trị thiên nhiên, Côn Đảo còn nổi tiếng với hệ thống nhà tù lịch sử và Nghĩa trang Hàng Dương, thu hút nhiều du khách đến tham quan và tìm hiểu lịch sử.",
        wiki: "https://vi.wikipedia.org/wiki/C%C3%B4n_%C4%90%E1%BA%A3o"
    },

    {
        title: "Cù Lao Chàm",
        location: "Quảng Nam",
        image: "images/culaocham.jpg",
        description: "Cù Lao Chàm là quần đảo gồm 8 hòn đảo thuộc thành phố Hội An, tỉnh Quảng Nam và được UNESCO công nhận là Khu dự trữ sinh quyển thế giới vào năm 2009. Nơi đây nổi bật với những bãi biển trong xanh, các rạn san hô đa dạng và hệ sinh thái biển được bảo tồn tốt. Du khách có thể lặn ngắm san hô, tham quan chùa Hải Tạng, giếng cổ Chăm, khám phá làng chài và thưởng thức nhiều món hải sản tươi ngon. Đây là điểm đến du lịch sinh thái biển nổi tiếng của miền Trung.",
        wiki: "https://vi.wikipedia.org/wiki/C%C3%B9_Lao_Ch%C3%A0m"
    }

];


/*====================================
    LẤY CÁC PHẦN TỬ
====================================*/

const modal = document.getElementById("detailModal");
const modalTitle = document.getElementById("modalTitle");
const modalLocation = document.getElementById("modalLocation");
const modalImage = document.getElementById("modalImage");
const modalDescription = document.getElementById("modalDescription");
const modalWiki = document.getElementById("modalWiki");


/*====================================
    HIỂN THỊ CHI TIẾT
====================================*/

function showDetail(index){

    const place = placeDetails[index];

    modalTitle.textContent = place.title;
    modalLocation.textContent = place.location;
    modalDescription.textContent = place.description;

    modalImage.src = place.image;
    modalImage.alt = place.title;

    modalWiki.href = place.wiki;

    document.body.style.overflow = "hidden"; // khóa cuộn

    modal.style.display = "flex";

}


/*====================================
    ĐÓNG MODAL
====================================*/

function closeModal(){

    modal.style.display = "none";
    document.body.style.overflow = "auto";

}


/*====================================
    CLICK RA NGOÀI ĐỂ ĐÓNG
====================================*/

window.onclick = function(event){

    if(event.target === modal){

        closeModal();

    }

};



/*====================================
    NHẤN ESC ĐỂ ĐÓNG
====================================*/

document.addEventListener("keydown", function(event){

    if(event.key === "Escape"){

        closeModal();

    }

});