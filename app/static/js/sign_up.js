// back to previous page
function back() {
    history.back();
}

// move to other step
let currentStep = 1;

function showStep(step) {
    currentStep = step;
    document.querySelectorAll('.step').forEach(el =>
        el.classList.remove('active')
    );
    document.querySelectorAll('.step-indicator').forEach(el =>
        el.classList.remove('active')
    );
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`step-indicator${step}`).classList.add('active');
}

showStep(currentStep);

// comfirm email
document.getElementById('confirm-email').addEventListener('click', function(e) {
    e.preventDefault();

    const userEmail = document.getElementById('user-email').value;
    const emailResult = document.getElementById('email-result');
    
    // 이메일 형식 검증을 위한 정규표현식
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(userEmail)) {
        emailResult.textContent = '올바른 이메일 형식이 아닙니다';
        emailResult.style.color = 'red';
        return;
    }

    axios.post('/confirm_email', {
        userEmail: userEmail
    })
    .then(function(response) {
        if (response.data.available) {
            emailResult.textContent = "사용 가능한 이메일입니다.";
            emailResult.style.color = 'green';
        }
        else {
            emailResult.textContent = "이미 등록된 이메일입니다.";
            emailResult.style.color = 'red';
        }
    })
    .catch(function(error) {
        console.error('에러 발생: ', error);
    });

});

// confirm password
document.addEventListener('DOMContentLoaded', function() {
    const userPwd = document.querySelector('input[name="user-pwd"]');
    const userRepwd = document.querySelector('input[name="user-repwd"]');
    const pwdResult = document.getElementById('pwd-result');

    function checkPasswordMatch() {
        if (userRepwd.value === '') {
            pwdResult.textContent = '';
        }
        else if (userPwd.value === userRepwd.value) {
            pwdResult.textContent = "비밀번호가 일치합니다.";
            pwdResult.style.color = "green";
        }
        else {
            pwdResult.textContent = "비밀번호가 일치하지 않습니다.";
            pwdResult.style.color = "red";
        }
    }

    userPwd.addEventListener('input', checkPasswordMatch);
    userRepwd.addEventListener('input', checkPasswordMatch);
});

// confirm phone
document.addEventListener('DOMContentLoaded', function() {
    const phone = document.querySelector('input[name="user-phone"]');
    const phoneResult = document.getElementById('phone-result');

    function checkPhoneValidate() {
        const phoneRegex =  /^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/;

        if (phone.value === '') {
            phoneResult.textContent = '';
        }
        else if (!phoneRegex.test(phone.value)) {
            phoneResult.textContent = "휴대폰 번호를 다시 확인해주세요.";
            phoneResult.style.color = "red";

        }
        else {
            phoneResult.textContent = '사용 가능한 휴대폰 번호입니다.';
            phoneResult.style.color = "green";
        }
    }

    phone.addEventListener('input', checkPhoneValidate);
})

// check all required inputs
function validateAndShowstep(step) {
    const inputs = document.querySelectorAll('#step1 input[required]');
    let allFilled = true;

    inputs.forEach(input => {
        if (input.value.trim() === '') {
            allFilled = false;
        }
    });

    if (allFilled) {
        document.getElementById('warning-message').style.display = 'none';
        showStep(step);
    }
    else {
        document.getElementById('warning-message').style.display = 'block';
    }
}


// open image file select
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

//submit sign-up form
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        axios.post('/register', formData)
        .then(function(response) {
            document.querySelector('.form-container').style.display = 'none';
            document.querySelector('.welcome-message').style.display = 'block';
            document.getElementById('welcome-name').textContent = response.data.name;
        })
        .catch(function(error) {
            console.error('Error: ', error);
        });
    });
});

//go to login page
document.getElementById('goto-login').addEventListener('click', function() {
    window.location.href = '/sign_in';
});