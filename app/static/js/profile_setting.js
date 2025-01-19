// click image and open file select
document.getElementById('profile-image').onclick = function() {
    document.getElementById('image-input').click();
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

// update user profile
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.profile-setting-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        axios.post('/update_profile', formData)
        .then(function(response) {
            Toastify({
                text: response.data.message,
                duration: 2000,
                gravity: "top",
                position: "center",
                style: {
                    background: "black",
                    color: "white",
                    borderRadius: "10px"
                }
            }).showToast();
        })
        .catch(function(error) {
            console.error('Error: ', error);
        });
    });
});