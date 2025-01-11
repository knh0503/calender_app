// click image and open file select
document.getElementById('profile-image').onclick = function() {
    document.getElementById('image-input').click();  // 파일 선택 창을 프로그램matically 열기
};

// select image file and update image
document.getElementById('image-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-image').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

//click cancel button
document.getElementById('cancel-button').addEventListener('click', function(e) {
    history.back();
});
