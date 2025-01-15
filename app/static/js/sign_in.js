//submit login form
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        axios.post('/login', formData)
        .then(function(response) {
            if (response.data.flag) {
                Toastify({
                    text: response.data.message,
                    duration: 1000,
                    gravity: "top",
                    position: "top",
                    style: {
                        background: "black",
                    }
                }).showToast();
                
                setTimeout(() => {
                    window.location.href = '/main';
                }, 1000);
            }
            else {
                Toastify({
                    text: response.data.message,
                    duration: 2000,
                    gravity: "top",
                    position: "top",
                    style: {
                        background: "black",
                    }
                }).showToast();
            }
        })
        .catch(function(error) {
            console.error('Error', error)
        });
    });
});