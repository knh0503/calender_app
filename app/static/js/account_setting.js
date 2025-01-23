// Toastify
function showToastify(message) {
    Toastify({
        text: message,
        duration: 2000,
        gravity: "top",
        position: "center",
        style: {
            background: "black",
            color: "white",
            borderRadius: "10px"
        }
    }).showToast();
}

// open password popoup
function openPopup(divID) {
    document.querySelector('.modal-overlay').style.display = "block";
    document.querySelector(divID).style.display = "block";
}

// close pop-up 
const closePopup = () => {
    document.querySelector('.modal-overlay').style.display = "none";
    const popupElements = document.querySelectorAll('.popup');
    popupElements.forEach(popup => {
        popup.style.display = "none";
    })
    const popupFormElements = document.querySelectorAll('.popup-form');
    popupFormElements.forEach(popupForm => {
        popupForm.reset();
    })
};

document.querySelectorAll('.close-popup').forEach(button => {
    button.addEventListener('click', closePopup);
})
document.querySelector('.modal-overlay').addEventListener('click', closePopup);

// update password
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        axios.post('/change_password', formData)
        .then(function(response) {
            showToastify(response.data.message);
            if (response.data.flag) {
                closePopup();
            }
        })
        .catch(function(error) {
            console.error('Error: ', error);
        });
    });
});

// update email
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#email-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        const userEmail = document.querySelector('#user-email').value;
    
        // 이메일 형식 검증을 위한 정규표현식
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
        if (!emailRegex.test(userEmail)) {
            showToastify("올바른 이메일 형식이 아닙니다.");
            return
        }
    
        axios.post('/change_email', formData)
        .then(function(response) {
            showToastify(response.data.message);
            if (response.data.available) {
                document.getElementById('email-result').textContent = response.data.email;
                closePopup();
            }
        })
        .catch(function(error) {
            console.error('에러 발생: ', error);
        });
    });
});

// update phone
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#phone-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
    
        const phoneRegex =  /^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/;
        const phoneNumber = document.querySelector('#user-phone').value;
        if (!phoneRegex.test(phoneNumber)) {
            showToastify("휴대폰 형식을 확인해주세요.");
            return
        }
    
        axios.post('/change_phone', formData)
        .then(function(response) {
            showToastify(response.data.message);
            if (response.data.available) {
                document.getElementById('phone-result').textContent = response.data.phone;
                closePopup();
            }
        })
        .catch(function(error) {
            console.error('에러 발생: ', error);
        });
    });
});